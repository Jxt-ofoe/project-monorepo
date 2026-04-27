import { createDrizzleClient } from './client';
import { users, vehicles, drivers, shipments, shipmentStatusLogs, serviceRates, invoices } from './schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

dotenv.config();

async function seed() {
  const db = createDrizzleClient();
  console.log('🌱 Starting Turso database seeding...');

  const salt = await bcrypt.genSalt(10);

  const demoUsers = [
    { email: 'admin@smartlogix.com', password: 'admin123', role: 'admin', fullName: 'System Administrator' },
    { email: 'dispatcher@smartlogix.com', password: 'dispatcher123', role: 'dispatcher', fullName: 'Accra HQ Dispatcher' },
    { email: 'customer1@demo.com', password: 'customer123', role: 'customer', fullName: 'Ama Owusu' },
    { email: 'driver1@smartlogix.com', password: 'driver123', role: 'driver', fullName: 'Kwame Mensah' },
  ];

  for (const u of demoUsers) {
    const passwordHash = await bcrypt.hash(u.password, salt);
    const existing = await db.select().from(users).where(eq(users.email, u.email));
    
    if (existing.length > 0) {
      await db.update(users).set({ passwordHash, fullName: u.fullName, updatedAt: new Date().toISOString() }).where(eq(users.email, u.email));
    } else {
      await db.insert(users).values({ id: uuidv4(), email: u.email, passwordHash, role: u.role as any, fullName: u.fullName });
    }
  }

  // ─── Vehicles ──────────────────────────────────────────────────────────────
  const vehicle1Id = uuidv4();
  await db.insert(vehicles).values([
    { id: vehicle1Id, plateNumber: 'GW-1000-24', type: 'van', capacityKg: 1000, make: 'Toyota', model: 'Hiace', year: 2022 },
  ]).onConflictDoNothing();

  // ─── Drivers ───────────────────────────────────────────────────────────────
  const d1 = await db.select().from(users).where(eq(users.email, 'driver1@smartlogix.com'));
  if (d1[0]) {
    await db.insert(drivers).values({
      id: uuidv4(),
      userId: d1[0].id,
      vehicleId: vehicle1Id,
      licenseNumber: 'DL-ACC-9999',
      currentLat: 5.6037,
      currentLng: -0.1870,
      status: 'available',
    }).onConflictDoNothing();
  }

  // ─── Service Rates ──────────────────────────────────────────────────────
  await db.insert(serviceRates).values([
    { id: uuidv4(), weightFrom: 0, weightTo: 1, zone: 'local', pricePerKg: 5.0, pricePerKm: 2.0, baseFee: 10.0, priority: 'standard' },
  ]).onConflictDoNothing();

  console.log('✅ Seeding complete!');
  process.exit(0);
}

seed().catch((e) => {
  console.error('❌ Seeding failed:', e);
  process.exit(1);
});
