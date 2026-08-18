'use client';

import { useEffect, useState } from 'react';

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
 * One shared answer to "who is reading this page", for the whole page load.
 *
 * Cached at module scope on purpose: the header and any per-user affordance on
 * the page all want the same answer, and without this each would cost its own
 * request. Cleared by the auth flows through `forgetMe` so signing in or out
 * does not leave a stale identity behind.
 */
let pending: Promise<MeResponse> | null = null;

/** True when a session flag cookie is present. Not proof of anything. */
function looksSignedIn(): boolean {
  return document.cookie.split('; ').some((c) => c.startsWith('bi_signedin='));
}

function load(): Promise<MeResponse> {
  if (pending) return pending;
  // No flag cookie means nobody is signed in, so the request is skipped
  // outright. This is what keeps an anonymous visit, and every crawler hit,
  // from costing a function invocation.
  if (!looksSignedIn()) {
    pending = Promise.resolve(ANONYMOUS);
    return pending;
  }
  pending = fetch('/api/me', { cache: 'no-store' })
    .then((r) => (r.ok ? (r.json() as Promise<MeResponse>) : ANONYMOUS))
    .catch(() => ANONYMOUS);
  return pending;
}

export function forgetMe(): void {
  pending = null;
}

/**
 * `undefined` while the answer is unknown, so callers can hold space rather
 * than flashing a signed-out state at someone who is signed in.
 */
export function useMe(): { me: Me | null | undefined } {
  const [state, setState] = useState<MeResponse | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    load().then((d) => {
      if (!cancelled) setState(d);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { me: state === undefined ? undefined : state.user };
}
