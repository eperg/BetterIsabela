import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { isSsoConfigured } from '@/lib/egov';
import { isEmailAuthConfigured } from '@/lib/supabase';

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
  // The header cannot work this out for itself — it runs in the browser, and
  // the answer depends on server-only config. Mirrors the same guard the
  // dev-login route enforces, so the widget is never offered when it would 404.
  const devLogin =
    process.env.NODE_ENV !== 'production' && !isSsoConfigured() && !isEmailAuthConfigured();
  return NextResponse.json(
    { user, devLogin },
    {
      headers: {
        // Personalised: cache in the browser only, never on a shared edge.
        'Cache-Control': 'private, no-store',
      },
    }
  );
}
