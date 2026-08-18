'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export interface Me {
  id: number;
  displayName: string;
  role: 'citizen' | 'moderator' | 'admin';
  verified: boolean;
}

export interface MeResponse {
  user: Me | null;
}

const ANONYMOUS: MeResponse = { user: null };

/**
 * One shared answer to "who is reading this page".
 *
 * Cached at module scope so the header and any per-user affordance on the page
 * cost one request between them rather than one each. The cache is keyed on the
 * `bi_signedin` cookie — a readable, secretless companion to the httpOnly
 * session cookie — so that signing in or out invalidates it.
 *
 * That key is load-bearing, not an optimisation. Signing in with email runs a
 * server action that redirects, which is a client-side navigation: the layout,
 * and therefore this module, is never re-evaluated. Without keying on something
 * that changes, a reader who has just signed in keeps being told they are signed
 * out until they hard-reload. The cookie is never trusted for anything beyond
 * this: the server resolves the real session on every request.
 */
let cache: { key: string; promise: Promise<MeResponse> } | null = null;

function sessionKey(): string {
  return document.cookie.split('; ').some((c) => c.startsWith('bi_signedin=')) ? '1' : '0';
}

function load(): Promise<MeResponse> {
  const key = sessionKey();
  if (cache && cache.key === key) return cache.promise;
  const promise = fetch('/api/me', { cache: 'no-store' })
    .then((r) => (r.ok ? (r.json() as Promise<MeResponse>) : ANONYMOUS))
    .catch(() => ANONYMOUS);
  cache = { key, promise };
  return promise;
}

/**
 * `undefined` while the answer is unknown, so callers can hold space rather than
 * flashing a signed-out state at someone who is signed in.
 */
export function useMe(): { me: Me | null | undefined } {
  const [state, setState] = useState<MeResponse | undefined>(undefined);
  // Re-checked on navigation: the layout does not remount, so a mount-only
  // effect would never notice that the reader signed in two pages ago.
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    load().then((d) => {
      if (!cancelled) setState(d);
    });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return { me: state === undefined ? undefined : state.user };
}
