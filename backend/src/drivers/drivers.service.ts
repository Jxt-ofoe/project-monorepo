import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DATABASE_TOKEN } from '../database/database.module';
import { DrizzleDB } from '../database/client';
import { drivers, users, vehicles, Driver } from '../database/schema';
import { CreateDriverDto, UpdateDriverDto, UpdateDriverLocationDto } from './dto/drivers.dto';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

/** Haversine formula to calculate distance in km between two lat/lng points */
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

@Injectable()
export class DriversService {
  constructor(@Inject(DATABASE_TOKEN) private db: DrizzleDB) {}

  /** Find all drivers with their user and vehicle details */
  async findAll() {
    const rows = await this.db
      .select({
        driver: drivers,
        user: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
          phone: users.phone,
        },
        vehicle: vehicles,
      })
      .from(drivers)
      .leftJoin(users, eq(drivers.userId, users.id))
      .leftJoin(vehicles, eq(drivers.vehicleId, vehicles.id));
    return rows;
  }

  async findOne(id: string) {
    const rows = await this.db
      .select({
        driver: drivers,
        user: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
          phone: users.phone,
        },
        vehicle: vehicles,
      })
      .from(drivers)
      .leftJoin(users, eq(drivers.userId, users.id))
      .leftJoin(vehicles, eq(drivers.vehicleId, vehicles.id))
      .where(eq(drivers.id, id))
      .limit(1);

    if (!rows[0]) throw new NotFoundException(`Driver ${id} not found`);
    return rows[0];
  }

  async findByUserId(userId: string) {
    const result = await this.db
      .select()
      .from(drivers)
      .where(eq(drivers.userId, userId))
      .limit(1);
    return result[0];
  }

  async create(dto: CreateDriverDto): Promise<Driver> {
    const result = await this.db.insert(drivers).values({
      id: uuidv4(),
      userId: dto.userId,
      licenseNumber: dto.licenseNumber,
      vehicleId: dto.vehicleId || null,
      currentLat: dto.currentLat || null,
      currentLng: dto.currentLng || null,
      updatedAt: new Date().toISOString(),
    }).returning();
    return result[0];
  }

  async update(id: string, dto: UpdateDriverDto): Promise<Driver> {
    await this.findOne(id);
    const result = await this.db.update(drivers).set({
      ...dto,
      updatedAt: new Date().toISOString(),
    }).where(eq(drivers.id, id)).returning();
    return result[0];
  }

  /** Update a driver's GPS location — called by Socket.io gateway every 10s */
  async updateLocation(driverId: string, dto: UpdateDriverLocationDto): Promise<Driver> {
    const result = await this.db.update(drivers).set({
      currentLat: dto.lat,
      currentLng: dto.lng,
      currentBearing: dto.bearing ?? 0,
      lastLocationUpdate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).where(eq(drivers.id, driverId)).returning();

    if (!result[0]) throw new NotFoundException(`Driver ${driverId} not found`);
    return result[0];
  }

  /**
   * Find the nearest available driver to a given lat/lng.
   * Reverted to manual Haversine calculation for Turso/SQLite compatibility.
   */
  async findNearestAvailable(lat: number, lng: number): Promise<Driver | null> {
    // 1. Get all available drivers
    const availableDrivers = await this.db
      .select()
      .from(drivers)
      .where(eq(drivers.status, 'available'));

    if (availableDrivers.length === 0) return null;

    // 2. Calculate distance for each and find the minimum
    let nearestDriver = null;
    let minDistance = Infinity;

    for (const driver of availableDrivers) {
      if (driver.currentLat !== null && driver.currentLng !== null) {
        const dist = haversineDistance(lat, lng, driver.currentLat, driver.currentLng);
        if (dist < minDistance) {
          minDistance = dist;
          nearestDriver = driver;
        }
      }
    }

    return nearestDriver;
  }

  /** Get real-time location of all active/available drivers for fleet map */
  async getFleetLocations() {
    return this.db
      .select({
        id: drivers.id,
        userId: drivers.userId,
        status: drivers.status,
        currentLat: drivers.currentLat,
        currentLng: drivers.currentLng,
        currentBearing: drivers.currentBearing,
        lastLocationUpdate: drivers.lastLocationUpdate,
        fullName: users.fullName,
        phone: users.phone,
        vehicleId: drivers.vehicleId,
      })
      .from(drivers)
      .leftJoin(users, eq(drivers.userId, users.id));
  }
}
