import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { getMyServiceReport } from '@/lib/queries';

/**
 * The reader's existing report for one service, so the form opens as a
 * correction rather than a blank. Split out of the page for the same reason as
 * the rating endpoint: it keeps the page itself cacheable, and an anonymous
 * reader never calls it.
 */
export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ service: string }> }
) {
  const user = await getCurrentUser();
  const empty = NextResponse.json({ report: null }, { headers: { 'Cache-Control': 'private, no-store' } });
  if (!user) return empty;

  const { service } = await params;
  const report = await getMyServiceReport(service, user.id);
  return NextResponse.json({ report }, { headers: { 'Cache-Control': 'private, no-store' } });
}
