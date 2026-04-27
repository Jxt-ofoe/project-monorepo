import { db } from '../db/client';
import { drivers, users, vehicles, Driver } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { haversineDistance } from './shipments';

export async function getAllDrivers() {
  return db
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
}

export async function getDriverByUserId(userId: string) {
  const result = await db.select().from(drivers).where(eq(drivers.userId, userId)).limit(1);
  return result[0];
}

export async function updateDriverLocation(driverId: string, lat: number, lng: number, bearing: number = 0) {
  return db.update(drivers).set({
    currentLat: lat,
    currentLng: lng,
    currentBearing: bearing,
    lastLocationUpdate: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }).where(eq(drivers.id, driverId)).returning();
}

export async function findNearestAvailableDriver(lat: number, lng: number): Promise<Driver | null> {
  const availableDrivers = await db.select().from(drivers).where(eq(drivers.status, 'available'));
  if (availableDrivers.length === 0) return null;

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
