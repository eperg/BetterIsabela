/**
 * Email confirmation landing.
 *
 * The confirmation email links here rather than to `{{ .ConfirmationURL }}`,
 * which resolves to `https://<project-ref>.supabase.co/auth/v1/verify?…`. Two
 * reasons that matters: the citizen sees only betterisabela.org in the link
 * they are asked to trust, and Supabase's own verify endpoint finishes by
 * bouncing to the site root, which reads as "nothing happened".
 *
 * Here the token is redeemed server-side, the identity is linked to an app
 * user, an app session is minted, and the citizen lands on a page that tells
 * them what just happened.
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { linkAndSignIn } from '@/lib/auth-link';

export const dynamic = 'force-dynamic';

// Only the types this app actually sends. `email` is what the confirmation
// template emits; `signup` is accepted because Supabase uses it for the same
// event in some flows. Anything else is refused rather than passed through.
const ACCEPTED = new Set(['email', 'signup']);

function fail(request: NextRequest, reason: string) {
  const url = new URL('/auth/error', request.nextUrl.origin);
  url.searchParams.set('reason', reason);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get('token_hash');
  const type = request.nextUrl.searchParams.get('type') ?? 'email';

  if (!tokenHash) return fail(request, 'missing_token');
  if (!ACCEPTED.has(type)) return fail(request, 'bad_link');

  try {
    const supabase = await supabaseServer();
    const { data, error } = await supabase.auth.verifyOtp({
      type: type as 'email' | 'signup',
      token_hash: tokenHash,
    });

    // A used, expired or tampered token all land here. Do not distinguish
    // them for the visitor; the wording covers every case.
    if (error || !data.user) return fail(request, 'link_expired');

    const name =
      (data.user.user_metadata?.display_name as string | undefined) ??
      data.user.email?.split('@')[0] ??
      'Citizen';

    const linked = await linkAndSignIn(data.user.id, data.user.email ?? null, name);
    if (!linked.ok) return fail(request, 'suspended');

    return NextResponse.redirect(new URL('/welcome', request.nextUrl.origin));
  } catch (error) {
    console.error('email confirmation failed', error);
    return fail(request, 'unknown');
  }
}
