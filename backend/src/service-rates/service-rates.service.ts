import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DATABASE_TOKEN } from '../database/database.module';
import { DrizzleDB } from '../database/client';
import { serviceRates, ServiceRate } from '../database/schema';
import { CreateServiceRateDto, QuoteDto } from './dto/service-rates.dto';
import { eq, and, lte, gte } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
/** Haversine formula to calculate distance in km between two lat/lng points */
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface QuoteResult {
  distanceKm: number;
  weightKg: number;
  baseFee: number;
  weightCharge: number;
  distanceCharge: number;
  subtotal: number;
  tax: number;
  total: number;
  priority: string;
  zone: string;
  estimatedDays: number;
}

@Injectable()
export class ServiceRatesService {
  constructor(@Inject(DATABASE_TOKEN) private db: DrizzleDB) {}

  async findAll(): Promise<ServiceRate[]> {
    return this.db.select().from(serviceRates);
  }

  async findOne(id: string): Promise<ServiceRate> {
    const result = await this.db.select().from(serviceRates).where(eq(serviceRates.id, id)).limit(1);
    if (!result[0]) throw new NotFoundException(`Rate ${id} not found`);
    return result[0];
  }

  async create(dto: CreateServiceRateDto, adminId: string): Promise<ServiceRate> {
    const result = await this.db.insert(serviceRates).values({
      id: uuidv4(),
      weightFrom: dto.weightFrom,
      weightTo: dto.weightTo,
      zone: dto.zone,
      pricePerKg: dto.pricePerKg,
      pricePerKm: dto.pricePerKm,
      baseFee: dto.baseFee,
      priority: dto.priority ?? 'standard',
      createdBy: adminId,
    }).returning();
    return result[0];
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.db.delete(serviceRates).where(eq(serviceRates.id, id));
  }

  /**
   * Calculate a shipment quote based on weight, distance, zone and priority.
   * Ghana VAT is 15%.
   */
  async calculateQuote(dto: QuoteDto): Promise<QuoteResult> {
    const distanceKm = haversineDistance(
      dto.pickupLat, dto.pickupLng,
      dto.deliveryLat, dto.deliveryLng,
    );

    const zone = dto.zone ?? this.inferZone(distanceKm);
    const priority = dto.priority ?? 'standard';

    // Find a matching rate for this weight/zone/priority
    const matchingRates = await this.db
      .select()
      .from(serviceRates)
      .where(
        and(
          lte(serviceRates.weightFrom, dto.weightKg),
          gte(serviceRates.weightTo, dto.weightKg),
          eq(serviceRates.zone, zone),
          eq(serviceRates.priority, priority),
        ),
      )
      .limit(1);

    // Fall back to any rate in zone if no exact weight match
    let rate = matchingRates[0];
    if (!rate) {
      const fallback = await this.db
        .select()
        .from(serviceRates)
        .where(and(eq(serviceRates.zone, zone)))
        .limit(1);
      rate = fallback[0];
    }

    // Default rates (GHS) if nothing configured yet
    const baseFee = rate?.baseFee ?? 15;
    const pricePerKg = rate?.pricePerKg ?? 2.5;
    const pricePerKm = rate?.pricePerKm ?? 1.2;

    const weightCharge = dto.weightKg * pricePerKg;
    const distanceCharge = distanceKm * pricePerKm;

    // Priority multipliers
    const multiplier = priority === 'same_day' ? 2.0 : priority === 'express' ? 1.5 : 1.0;
    const subtotal = (baseFee + weightCharge + distanceCharge) * multiplier;
    const tax = subtotal * 0.15; // Ghana VAT 15%
    const total = subtotal + tax;

    const estimatedDays =
      priority === 'same_day' ? 0 : priority === 'express' ? 1 : distanceKm < 50 ? 1 : 2;

    return {
      distanceKm: Math.round(distanceKm * 10) / 10,
      weightKg: dto.weightKg,
      baseFee,
      weightCharge: Math.round(weightCharge * 100) / 100,
      distanceCharge: Math.round(distanceCharge * 100) / 100,
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
      priority,
      zone,
      estimatedDays,
    };
  }

  /** Infer zone from distance (Ghana-centric thresholds) */
  private inferZone(distanceKm: number): string {
    if (distanceKm <= 20) return 'local';
    if (distanceKm <= 100) return 'regional';
    return 'national';
  }
}
