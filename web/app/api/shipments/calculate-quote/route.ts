import { NextResponse } from 'next/server';
import { calculateQuote } from '@/lib/services/shipments';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const quote = await calculateQuote(body);
    return NextResponse.json(quote);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}
