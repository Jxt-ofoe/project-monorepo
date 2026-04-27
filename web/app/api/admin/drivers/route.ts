import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getAllDrivers } from '@/lib/services/drivers';

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== 'admin' && session?.user?.role !== 'dispatcher') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const drivers = await getAllDrivers();
    return NextResponse.json(drivers);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
