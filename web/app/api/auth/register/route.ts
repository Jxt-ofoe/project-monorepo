import { NextResponse } from 'next/server';
import { registerUser } from '@/lib/services/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = await registerUser(body);
    return NextResponse.json({ user });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}
