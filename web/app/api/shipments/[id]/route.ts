import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { findById, updateStatus } from '@/lib/services/shipments';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const shipment = await findById(params.id);
    return NextResponse.json(shipment);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 404 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const shipment = await updateStatus(
      params.id, 
      body.status, 
      body.lat, 
      body.lng, 
      body.note, 
      session.user.id
    );
    return NextResponse.json(shipment);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}
