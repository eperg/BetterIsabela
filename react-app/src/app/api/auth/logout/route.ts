import { NextRequest, NextResponse } from 'next/server';
import { destroySession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  await destroySession();
  return NextResponse.redirect(new URL('/', request.nextUrl.origin), { status: 303 });
}
