import { db } from '../db/client';
import { shipments, drivers, invoices } from '../db/schema';
import { eq, gte, lte, and } from 'drizzle-orm';

export async function getAdminAnalytics() {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const todayStart = `${today}T00:00:00.000Z`;
  const todayEnd = `${today}T23:59:59.999Z`;

  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayShipments = await db
    .select()
    .from(shipments)
    .where(and(gte(shipments.createdAt, todayStart), lte(shipments.createdAt, todayEnd)));

  const allShipments = await db.select().from(shipments);
  const allDrivers = await db.select().from(drivers);
  const activeDrivers = allDrivers.filter((d) => d.status !== 'off');

  const paidInvoices = await db.select().from(invoices).where(eq(invoices.status, 'paid'));
  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  const todayPaid = paidInvoices.filter((inv) => inv.paidAt && inv.paidAt >= todayStart && inv.paidAt <= todayEnd);
  const todayRevenue = todayPaid.reduce((sum, inv) => sum + inv.totalAmount, 0);

  const delivered = allShipments.filter((s) => s.status === 'delivered');
  const onTime = delivered.filter((s) => s.actualDeliveryTime && s.estimatedDeliveryTime && s.actualDeliveryTime <= s.estimatedDeliveryTime);
  const onTimeRate = delivered.length > 0 ? Math.round((onTime.length / delivered.length) * 100) : 100;

  const statusBreakdown = {
    created: allShipments.filter((s) => s.status === 'created').length,
    assigned: allShipments.filter((s) => s.status === 'assigned').length,
    picked_up: allShipments.filter((s) => s.status === 'picked_up').length,
    in_transit: allShipments.filter((s) => s.status === 'in_transit').length,
    out_for_delivery: allShipments.filter((s) => s.status === 'out_for_delivery').length,
    delivered: allShipments.filter((s) => s.status === 'delivered').length,
    cancelled: allShipments.filter((s) => s.status === 'cancelled').length,
  };

  const last7Days: { date: string; revenue: number; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = getLocalDateString(d);
    const dayShipments = allShipments.filter((s) => s.createdAt && s.createdAt.slice(0, 10) === dateStr);
    const dayRevenue = paidInvoices.filter((inv) => inv.paidAt && inv.paidAt.slice(0, 10) === dateStr).reduce((sum, inv) => sum + inv.totalAmount, 0);
    last7Days.push({ date: dateStr, revenue: dayRevenue, count: dayShipments.length });
  }

  return {
    overview: {
      todayShipments: todayShipments.length,
      activeDrivers: activeDrivers.length,
      totalDrivers: allDrivers.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      todayRevenue: Math.round(todayRevenue * 100) / 100,
      onTimeRate,
      totalShipments: allShipments.length,
      totalDelivered: delivered.length,
    },
    statusBreakdown,
    revenueChart: last7Days,
  };
}
