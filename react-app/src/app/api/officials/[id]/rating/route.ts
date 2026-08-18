import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { getMyOfficialRating } from '@/lib/queries';

/**
 * The reader's own score for one official, or null.
 *
 * Split out of the page so the page itself can be prerendered. Only the rating
 * widget calls it, and only once it knows somebody is signed in, so an anonymous
 * visit costs nothing.
 */
export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ score: null }, { headers: { 'Cache-Control': 'private, no-store' } });

  const { id } = await params;
  const officialId = Number(id);
  if (!Number.isInteger(officialId)) return NextResponse.json({ score: null }, { status: 400 });

  const score = await getMyOfficialRating(officialId, user.id);
  return NextResponse.json({ score }, { headers: { 'Cache-Control': 'private, no-store' } });
}
