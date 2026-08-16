/**
 * Supabase Auth — email registration and sign-in. Server-only.
 *
 * Supabase is used for identity only, never for data: everything the app stores
 * goes through Drizzle against our own schema, where the constraints live. That
 * keeps one place responsible for correctness and lets Supabase Auth sit
 * alongside eGov SSO as a second provider rather than a second source of truth.
 *
 * Supabase's own session cookies are not the app session. After Supabase
 * verifies a credential we mint our own session row, so a moderator's ban takes
 * effect immediately — which a Supabase JWT could not guarantee.
 */
import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function isEmailAuthConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY)
  );
}

export async function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      'Supabase Auth is not configured. Set NEXT_PUBLIC_SUPABASE_URL and ' +
        'NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  const jar = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (list) => {
        // Called from a Server Component render in some flows, where cookies
        // are read-only. The auth routes below always run where writes are
        // allowed, so a failure here is safe to ignore.
        try {
          list.forEach(({ name, value, options }) => jar.set(name, value, options));
        } catch {
          /* read-only context */
        }
      },
    },
  });
}
