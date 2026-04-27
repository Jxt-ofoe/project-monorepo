import {
  Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { DATABASE_TOKEN } from '../database/database.module';
import { DrizzleDB } from '../database/client';
import {
  shipments, shipmentStatusLogs, drivers, users, invoices,
  Shipment,
} from '../database/schema';
import { CreateShipmentDto, UpdateShipmentStatusDto, AssignDriverDto } from './dto/shipments.dto';
import { eq, desc, and, like, gte, lte } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRatesService } from '../service-rates/service-rates.service';
import { DriversService } from '../drivers/drivers.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ShipmentsService {
  constructor(
    @Inject(DATABASE_TOKEN) private db: DrizzleDB,
    private serviceRatesService: ServiceRatesService,
    private driversService: DriversService,
    private notificationsService: NotificationsService,
  ) {}

  /** Generate tracking number: SLX-YYYYMMDD-XXXX */
  private generateTrackingNumber(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `SLX-${date}-${random}`;
  }

  /** Generate invoice number */
  private generateInvoiceNumber(): string {
    const seq = Math.floor(Math.random() * 90000) + 10000;
    return `INV-${seq}`;
  }

  // ── CRUD ────────────────────────────────────────────────────────────────────

  async create(dto: CreateShipmentDto, customerId: string): Promise<Shipment> {
    // Calculate price
    const quote = await this.serviceRatesService.calculateQuote({
      weightKg: dto.weightKg,
      pickupLat: dto.pickupLat,
      pickupLng: dto.pickupLng,
      deliveryLat: dto.deliveryLat,
      deliveryLng: dto.deliveryLng,
      priority: dto.priority as any,
    });

    const shipmentId = uuidv4();
    const trackingNumber = this.generateTrackingNumber();

    // Estimate delivery time
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + quote.estimatedDays);

    const result = await this.db.insert(shipments).values({
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
      packageType: (dto.packageType as any) ?? 'parcel',
      weightKg: dto.weightKg,
      dimensionsL: dto.dimensionsL ?? null,
      dimensionsW: dto.dimensionsW ?? null,
      dimensionsH: dto.dimensionsH ?? null,
      description: dto.description ?? null,
      specialInstructions: dto.specialInstructions ?? null,
      priority: (dto.priority as any) ?? 'standard',
      quotedPrice: quote.total,
      zone: quote.zone,
      estimatedDeliveryTime: estimatedDate.toISOString(),
      scheduledPickupTime: dto.scheduledPickupTime ?? null,
    }).returning();

    const shipment = result[0];

    // Log initial status
    await this.db.insert(shipmentStatusLogs).values({
      id: uuidv4(),
      shipmentId,
      status: 'created',
      lat: dto.pickupLat,
      lng: dto.pickupLng,
      note: 'Shipment created successfully',
      updatedBy: customerId,
    });

    // Create draft invoice
    await this.db.insert(invoices).values({
      id: uuidv4(),
      invoiceNumber: this.generateInvoiceNumber(),
      customerId,
      shipmentId,
      subtotal: quote.subtotal,
      tax: quote.tax,
      totalAmount: quote.total,
      status: 'draft',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    });

    return shipment;
  }

  async calculateQuote(dto: any) {
    return this.serviceRatesService.calculateQuote({
      weightKg: dto.weightKg,
      pickupLat: dto.pickupLat,
      pickupLng: dto.pickupLng,
      deliveryLat: dto.deliveryLat,
      deliveryLng: dto.deliveryLng,
      priority: dto.priority ?? 'standard',
    });
  }

  async findById(id: string): Promise<Shipment> {
    const result = await this.db.select().from(shipments).where(eq(shipments.id, id)).limit(1);
    if (!result[0]) throw new NotFoundException(`Shipment ${id} not found`);
    return result[0];
  }

  async findByTracking(trackingNumber: string) {
    const result = await this.db
      .select()
      .from(shipments)
      .where(eq(shipments.trackingNumber, trackingNumber))
      .limit(1);
    if (!result[0]) throw new NotFoundException(`Shipment ${trackingNumber} not found`);

    // Also fetch status logs
    const logs = await this.db
      .select()
      .from(shipmentStatusLogs)
      .where(eq(shipmentStatusLogs.shipmentId, result[0].id))
      .orderBy(desc(shipmentStatusLogs.timestamp));

    return { ...result[0], statusLogs: logs };
  }

  async findAllForCustomer(customerId: string, filters: any) {
    const conditions: any[] = [eq(shipments.customerId, customerId)];
    if (filters.status) conditions.push(eq(shipments.status, filters.status));

    return this.db
      .select()
      .from(shipments)
      .where(and(...conditions))
      .orderBy(desc(shipments.createdAt));
  }

  async findAllForDispatcher(filters: any) {
    const conditions: any[] = [];
    if (filters.status) conditions.push(eq(shipments.status, filters.status));
    if (filters.priority) conditions.push(eq(shipments.priority, filters.priority));

    const query = this.db
      .select()
      .from(shipments)
      .orderBy(desc(shipments.createdAt));

    return conditions.length ? query.where(and(...conditions)) : query;
  }

  async findForDriver(driverId: string) {
    const today = new Date().toISOString().slice(0, 10);
    return this.db
      .select()
      .from(shipments)
      .where(
        and(
          eq(shipments.assignedDriverId, driverId),
        ),
      )
      .orderBy(desc(shipments.createdAt));
  }

  // ── Status Management ───────────────────────────────────────────────────────

  async updateStatus(
    shipmentId: string,
    dto: UpdateShipmentStatusDto,
    updatedById: string,
  ): Promise<Shipment> {
    const shipment = await this.findById(shipmentId);

    const updates: any = {
      status: dto.status,
      updatedAt: new Date().toISOString(),
    };

    if (dto.status === 'delivered') {
      updates.actualDeliveryTime = new Date().toISOString();
    }

    const result = await this.db
      .update(shipments)
      .set(updates)
      .where(eq(shipments.id, shipmentId))
      .returning();

    // Log the status change with location
    await this.db.insert(shipmentStatusLogs).values({
      id: uuidv4(),
      shipmentId,
      status: dto.status,
      lat: dto.lat ?? null,
      lng: dto.lng ?? null,
      note: dto.note ?? null,
      updatedBy: updatedById,
    });

    // Mark invoice paid on delivery
    if (dto.status === 'delivered') {
      await this.db
        .update(invoices)
        .set({ status: 'paid', paidAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
        .where(eq(invoices.shipmentId, shipmentId));
    }

    // Emit real-time updates
    this.notificationsService.broadcast('shipment_status_updated', result[0]);
    this.notificationsService.notifyUser(shipment.customerId, 'shipment_status_updated', result[0]);
    if (shipment.assignedDriverId) {
      this.notificationsService.notifyDriver(shipment.assignedDriverId, 'shipment_status_updated', result[0]);
    }

    return result[0];
  }

  async cancelShipment(shipmentId: string, customerId: string): Promise<Shipment> {
    const shipment = await this.findById(shipmentId);
    if (shipment.customerId !== customerId) {
      throw new ForbiddenException('You can only cancel your own shipments');
    }
    if (['delivered', 'cancelled'].includes(shipment.status)) {
      throw new BadRequestException('Cannot cancel a delivered or already cancelled shipment');
    }
    return this.updateStatus(shipmentId, { status: 'cancelled' }, customerId);
  }

  // ── Driver Assignment ───────────────────────────────────────────────────────

  async assignDriver(shipmentId: string, dto: AssignDriverDto): Promise<Shipment> {
    const shipment = await this.findById(shipmentId);

    let driverId = dto.driverId;

    // Auto-select nearest available driver if not specified
    if (!driverId) {
      const nearest = await this.driversService.findNearestAvailable(
        shipment.pickupLat,
        shipment.pickupLng,
      );
      if (!nearest) throw new BadRequestException('No available drivers found');
      driverId = nearest.id;
    }

    // Mark driver as busy (driverId is guaranteed to be a string here)
    await this.driversService.update(driverId as string, { status: 'busy' });

    const result = await this.db
      .update(shipments)
      .set({
        assignedDriverId: driverId,
        status: 'assigned',
        updatedAt: new Date().toISOString(),
      })
      .where(eq(shipments.id, shipmentId))
      .returning();

    await this.db.insert(shipmentStatusLogs).values({
      id: uuidv4(),
      shipmentId,
      status: 'assigned',
      note: `Driver assigned (ID: ${driverId})`,
    });

    // Emit real-time updates to driver and admins
    this.notificationsService.notifyDriver(driverId as string, 'job_assigned', result[0]);
    this.notificationsService.notifyAdmins('shipment_assigned', result[0]);
    this.notificationsService.notifyUser(shipment.customerId, 'shipment_status_updated', result[0]);

    return result[0];
  }

  // ── POD Upload ──────────────────────────────────────────────────────────────

  async savePod(
    shipmentId: string,
    podPhotoUrl: string | null,
    podSignatureUrl: string | null,
  ): Promise<Shipment> {
    const result = await this.db
      .update(shipments)
      .set({
        podPhotoUrl,
        podSignatureUrl,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(shipments.id, shipmentId))
      .returning();
    return result[0];
  }

  // ── Customer Dashboard Summary ──────────────────────────────────────────────

  async getCustomerDashboard(customerId: string) {
    const all = await this.db
      .select()
      .from(shipments)
      .where(eq(shipments.customerId, customerId));

    const total = all.length;
    const delivered = all.filter((s: Shipment) => s.status === 'delivered').length;
    const inTransit = all.filter((s: Shipment) =>
      ['assigned', 'picked_up', 'in_transit', 'out_for_delivery'].includes(s.status),
    ).length;
    const cancelled = all.filter((s: Shipment) => s.status === 'cancelled').length;
    const totalSpend = all
      .filter((s: Shipment) => s.status === 'delivered')
      .reduce((acc: number, s: Shipment) => acc + (s.finalPrice ?? s.quotedPrice ?? 0), 0);

    const recent = all.slice(0, 5);

    return { total, delivered, inTransit, cancelled, totalSpend, recent };
  }
}
