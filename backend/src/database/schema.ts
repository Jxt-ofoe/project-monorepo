import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ─── Enums (Simulated in SQLite via text + validation) ─────────────────────────
export type UserRole = 'admin' | 'dispatcher' | 'driver' | 'customer';
export type DriverStatus = 'available' | 'busy' | 'off';
export type VehicleType = 'bike' | 'car' | 'van' | 'truck';
export type ShipmentStatus = 'created' | 'assigned' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type Priority = 'standard' | 'express' | 'same_day';
export type PackageType = 'parcel' | 'document' | 'fragile' | 'perishable' | 'electronics';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'void';
export type PaymentStatus = 'pending' | 'success' | 'failed';

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('customer'), // admin, dispatcher, driver, customer
  fullName: text('full_name').notNull(),
  phone: text('phone'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ─── Vehicles ─────────────────────────────────────────────────────────────────
export const vehicles = sqliteTable('vehicles', {
  id: text('id').primaryKey(),
  plateNumber: text('plate_number').notNull().unique(),
  type: text('type').notNull(), // bike, car, van, truck
  capacityKg: real('capacity_kg').notNull(),
  make: text('make'),
  model: text('model'),
  year: integer('year'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ─── Drivers ──────────────────────────────────────────────────────────────────
export const drivers = sqliteTable('drivers', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  vehicleId: text('vehicle_id').references(() => vehicles.id),
  licenseNumber: text('license_number').notNull().unique(),
  status: text('status').notNull().default('off'), // available, busy, off
  
  // Real-time tracking
  currentLat: real('current_lat'),
  currentLng: real('current_lng'),
  currentBearing: real('current_bearing').default(0),
  lastLocationUpdate: text('last_location_update'),
  
  rating: real('rating').default(5.0),
  totalDeliveries: integer('total_deliveries').default(0),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ─── Routes ───────────────────────────────────────────────────────────────────
export const routes = sqliteTable('routes', {
  id: text('id').primaryKey(),
  driverId: text('driver_id').notNull().references(() => drivers.id),
  optimizedOrder: text('optimized_order'), // JSON array of shipment IDs
  totalDistanceKm: real('total_distance_km').default(0),
  totalTimeMin: real('total_time_min').default(0),
  status: text('status').notNull().default('planned'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ─── Shipments ────────────────────────────────────────────────────────────────
export const shipments = sqliteTable('shipments', {
  id: text('id').primaryKey(),
  trackingNumber: text('tracking_number').notNull().unique(),
  customerId: text('customer_id').notNull().references(() => users.id),
  assignedDriverId: text('assigned_driver_id').references(() => drivers.id),
  
  status: text('status').notNull().default('created'),
  
  // Sender Details
  senderName: text('sender_name').notNull(),
  senderPhone: text('sender_phone').notNull(),
  senderAddress: text('sender_address').notNull(),
  pickupLat: real('pickup_lat').notNull(),
  pickupLng: real('pickup_lng').notNull(),
  
  // Receiver Details
  receiverName: text('receiver_name').notNull(),
  receiverPhone: text('receiver_phone').notNull(),
  receiverAddress: text('receiver_address').notNull(),
  deliveryLat: real('delivery_lat').notNull(),
  deliveryLng: real('delivery_lng').notNull(),
  
  // Package Info
  packageType: text('package_type').notNull().default('parcel'),
  weightKg: real('weight_kg').notNull(),
  dimensionsL: real('dimensions_l'),
  dimensionsW: real('dimensions_w'),
  dimensionsH: real('dimensions_h'),
  description: text('description'),
  specialInstructions: text('special_instructions'),
  
  // Pricing & Billing
  quotedPrice: real('quoted_price'),
  finalPrice: real('final_price'),
  zone: text('zone'),

  // Timing
  estimatedDeliveryTime: text('estimated_delivery_time'),
  actualDeliveryTime: text('actual_delivery_time'),
  scheduledPickupTime: text('scheduled_pickup_time'),

  // Proof of Delivery
  podPhotoUrl: text('pod_photo_url'),
  podSignatureUrl: text('pod_signature_url'),

  // Priority
  priority: text('priority').notNull().default('standard'),

  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ─── Shipment Status Logs ─────────────────────────────────────────────────────
export const shipmentStatusLogs = sqliteTable('shipment_status_logs', {
  id: text('id').primaryKey(),
  shipmentId: text('shipment_id').notNull().references(() => shipments.id),
  status: text('status').notNull(),
  lat: real('lat'),
  lng: real('lng'),
  note: text('note'),
  updatedBy: text('updated_by').references(() => users.id),
  timestamp: text('timestamp').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ─── Service Rates ────────────────────────────────────────────────────────────
export const serviceRates = sqliteTable('service_rates', {
  id: text('id').primaryKey(),
  weightFrom: real('weight_from').notNull(),
  weightTo: real('weight_to').notNull(),
  zone: text('zone').notNull(),
  pricePerKg: real('price_per_kg').notNull(),
  pricePerKm: real('price_per_km').notNull(),
  baseFee: real('base_fee').notNull(),
  priority: text('priority').notNull().default('standard'),
  createdBy: text('created_by').references(() => users.id),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ─── Invoices ─────────────────────────────────────────────────────────────────
export const invoices = sqliteTable('invoices', {
  id: text('id').primaryKey(),
  invoiceNumber: text('invoice_number').notNull().unique(),
  customerId: text('customer_id').notNull().references(() => users.id),
  shipmentId: text('shipment_id').references(() => shipments.id),
  periodStart: text('period_start'),
  periodEnd: text('period_end'),
  subtotal: real('subtotal').notNull().default(0),
  tax: real('tax').notNull().default(0),
  totalAmount: real('total_amount').notNull().default(0),
  status: text('status').notNull().default('draft'),
  dueDate: text('due_date'),
  paystackReference: text('paystack_reference'),
  paidAt: text('paid_at'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ─── Payments ─────────────────────────────────────────────────────────────────
export const payments = sqliteTable('payments', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id').notNull().references(() => invoices.id),
  amount: real('amount').notNull(),
  paymentMethod: text('payment_method').notNull(), // card, mobile_money, bank_transfer
  mobileMoneyProvider: text('mobile_money_provider'), // mtn, vodafone, airteltigo
  paystackReference: text('paystack_reference').unique(),
  paystackTransactionId: text('paystack_transaction_id'),
  status: text('status').notNull().default('pending'),
  paidAt: text('paid_at'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ─── Chatbot Logs ─────────────────────────────────────────────────────────────
export const chatbotLogs = sqliteTable('chatbot_logs', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull(),
  role: text('role').notNull(), // 'user' or 'assistant'
  message: text('message').notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ─── Type Exports ──────────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Vehicle = typeof vehicles.$inferSelect;
export type Shipment = typeof shipments.$inferSelect;
export type Driver = typeof drivers.$inferSelect;
export type ServiceRate = typeof serviceRates.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type Payment = typeof payments.$inferSelect;
