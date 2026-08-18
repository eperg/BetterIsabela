import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';

/**
 * The signed-in citizen, or null.
 *
 * Exists so the rest of the site does not have to. Reading cookies inside the
 * layout opted every page — including pure prose like /terms — into per-request
 * rendering. Isolating it here lets the page shells be prerendered and served
 * from the CDN, with this one small call carrying the personalised part.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json(
    { user },
    {
      headers: {
        // Personalised: cache in the browser only, never on a shared edge.
        'Cache-Control': 'private, no-store',
      },
    }
  );
}
