import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createShipment, getShipmentsForCustomer } from '@/lib/services/shipments';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const shipments = await getShipmentsForCustomer(session.user.id);
    return NextResponse.json(shipments);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const shipment = await createShipment(session.user.id, body);
    return NextResponse.json(shipment);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}
