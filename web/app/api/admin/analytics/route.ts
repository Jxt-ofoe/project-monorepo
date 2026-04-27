import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getAdminAnalytics } from '@/lib/services/analytics';

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== 'admin' && session?.user?.role !== 'dispatcher') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const analytics = await getAdminAnalytics();
    return NextResponse.json(analytics);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
