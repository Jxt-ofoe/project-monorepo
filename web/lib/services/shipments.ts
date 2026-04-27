import { db } from '../db/client';
import { shipments, shipmentStatusLogs, invoices, serviceRates, Shipment } from '../db/schema';
import { eq, desc, and, lte, gte } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

/** Haversine distance helper */
export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
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

function inferZone(distanceKm: number): string {
  if (distanceKm <= 20) return 'local';
  if (distanceKm <= 100) return 'regional';
  return 'national';
}

export async function calculateQuote(dto: {
  weightKg: number;
  pickupLat: number;
  pickupLng: number;
  deliveryLat: number;
  deliveryLng: number;
  priority?: string;
  zone?: string;
}) {
  const distanceKm = haversineDistance(dto.pickupLat, dto.pickupLng, dto.deliveryLat, dto.deliveryLng);
  const zone = dto.zone ?? inferZone(distanceKm);
  const priority = dto.priority ?? 'standard';

  const matchingRates = await db
    .select()
    .from(serviceRates)
    .where(
      and(
        lte(serviceRates.weightFrom, dto.weightKg),
        gte(serviceRates.weightTo, dto.weightKg),
        eq(serviceRates.zone, zone),
        eq(serviceRates.priority, priority)
      )
    )
    .limit(1);

  let rate = matchingRates[0];
  if (!rate) {
    const fallback = await db.select().from(serviceRates).where(eq(serviceRates.zone, zone)).limit(1);
    rate = fallback[0];
  }

  const baseFee = rate?.baseFee ?? 15;
  const pricePerKg = rate?.pricePerKg ?? 2.5;
  const pricePerKm = rate?.pricePerKm ?? 1.2;

  const weightCharge = dto.weightKg * pricePerKg;
  const distanceCharge = distanceKm * pricePerKm;
  const multiplier = priority === 'same_day' ? 2.0 : priority === 'express' ? 1.5 : 1.0;
  
  const subtotal = (baseFee + weightCharge + distanceCharge) * multiplier;
  const tax = subtotal * 0.15;
  const total = subtotal + tax;

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
    estimatedDays: priority === 'same_day' ? 0 : priority === 'express' ? 1 : distanceKm < 50 ? 1 : 2,
  };
}

export async function createShipment(customerId: string, dto: any) {
  const quote = await calculateQuote(dto);
  const shipmentId = uuidv4();
  const trackingNumber = `SLX-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + quote.estimatedDays);

  const result = await db.insert(shipments).values({
    id: shipmentId,
    trackingNumber,
    customerId,
    senderName: dto.senderName,
    senderPhone: dto.senderPhone,
    senderAddress: dto.senderAddress,
    pickupLat: dto.pickupLat,
    pickupLng: dto.pickupLng,
    receiverName: dto.receiverName,
    receiverPhone: dto.receiverPhone,
    receiverAddress: dto.receiverAddress,
    deliveryLat: dto.deliveryLat,
    deliveryLng: dto.deliveryLng,
    packageType: dto.packageType || 'parcel',
    weightKg: dto.weightKg,
    quotedPrice: quote.total,
    zone: quote.zone,
    estimatedDeliveryTime: estimatedDate.toISOString(),
    scheduledPickupTime: dto.scheduledPickupTime || null,
    priority: dto.priority || 'standard',
  }).returning();

  await db.insert(shipmentStatusLogs).values({
    id: uuidv4(),
    shipmentId,
    status: 'created',
    lat: dto.pickupLat,
    lng: dto.pickupLng,
    note: 'Shipment created successfully',
    updatedBy: customerId,
  });

  await db.insert(invoices).values({
    id: uuidv4(),
    invoiceNumber: `INV-${Math.floor(Math.random() * 90000) + 10000}`,
    customerId,
    shipmentId,
    subtotal: quote.subtotal,
    tax: quote.tax,
    totalAmount: quote.total,
    status: 'draft',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
  });

  return result[0];
}

export async function getShipmentsForCustomer(customerId: string) {
  return db.select().from(shipments).where(eq(shipments.customerId, customerId)).orderBy(desc(shipments.createdAt));
}

export async function findById(id: string) {
  const result = await db.select().from(shipments).where(eq(shipments.id, id)).limit(1);
  if (!result[0]) throw new Error(`Shipment ${id} not found`);
  return result[0];
}

export async function updateStatus(shipmentId: string, status: string, lat?: number, lng?: number, note?: string, updatedBy?: string) {
  const result = await db.update(shipments).set({
    status,
    updatedAt: new Date().toISOString(),
    actualDeliveryTime: status === 'delivered' ? new Date().toISOString() : undefined,
  }).where(eq(shipments.id, shipmentId)).returning();

  await db.insert(shipmentStatusLogs).values({
    id: uuidv4(),
    shipmentId,
    status,
    lat: lat || null,
    lng: lng || null,
    note: note || null,
    updatedBy: updatedBy || null,
  });

  return result[0];
}

import { notifyUser, notifyDriver, notifyAdmins, broadcast } from './notifications';
import { findNearestAvailableDriver } from './drivers';

export async function assignDriver(shipmentId: string, driverId?: string) {
  const shipment = await findById(shipmentId);
  let finalDriverId = driverId;

  if (!finalDriverId) {
    const nearest = await findNearestAvailableDriver(shipment.pickupLat, shipment.pickupLng);
    if (!nearest) throw new Error('No available drivers found');
    finalDriverId = nearest.id;
  }

  const result = await db.update(shipments).set({
    assignedDriverId: finalDriverId,
    status: 'assigned',
    updatedAt: new Date().toISOString(),
  }).where(eq(shipments.id, shipmentId)).returning();

  await db.insert(shipmentStatusLogs).values({
    id: uuidv4(),
    shipmentId,
    status: 'assigned',
    note: `Driver assigned (ID: ${finalDriverId})`,
  });

  notifyDriver(finalDriverId, 'job_assigned', result[0]);
  notifyUser(shipment.customerId, 'shipment_status_updated', result[0]);
  notifyAdmins('shipment_assigned', result[0]);

  return result[0];
}

export async function cancelShipment(shipmentId: string, customerId: string) {
  const shipment = await findById(shipmentId);
  if (shipment.customerId !== customerId) {
    throw new Error('You can only cancel your own shipments');
  }
  if (['delivered', 'cancelled'].includes(shipment.status)) {
    throw new Error('Cannot cancel a delivered or already cancelled shipment');
  }
  return updateStatus(shipmentId, 'cancelled', undefined, undefined, 'Cancelled by customer', customerId);
}

export async function getCustomerDashboard(customerId: string) {
  const all = await db.select().from(shipments).where(eq(shipments.customerId, customerId));

  const total = all.length;
  const delivered = all.filter((s) => s.status === 'delivered').length;
  const inTransit = all.filter((s) => ['assigned', 'picked_up', 'in_transit', 'out_for_delivery'].includes(s.status)).length;
  const cancelled = all.filter((s) => s.status === 'cancelled').length;
  const totalSpend = all.filter((s) => s.status === 'delivered').reduce((acc, s) => acc + (s.finalPrice ?? s.quotedPrice ?? 0), 0);

  return { total, delivered, inTransit, cancelled, totalSpend, recent: all.slice(0, 5) };
}

export async function getShipmentByTracking(trackingNumber: string) {
  const result = await db.select().from(shipments).where(eq(shipments.trackingNumber, trackingNumber)).limit(1);
  if (!result[0]) return null;
  
  const logs = await db.select().from(shipmentStatusLogs).where(eq(shipmentStatusLogs.shipmentId, result[0].id)).orderBy(desc(shipmentStatusLogs.timestamp));
  return { ...result[0], statusLogs: logs };
}
