'use client';

import { useActionState, useEffect, useState } from 'react';
import { rateOfficial } from '@/lib/actions';
import type { ActionResult } from '@/lib/actions';
import { useMe } from '@/hooks/useMe';

/**
 * One-click 1-5 rating. The unique key on (official, user) makes re-clicking an
 * update.
 *
 * Both the reader's identity and their existing score are fetched here rather
 * than rendered into the page, so the official's page stays cacheable. Neither
 * request happens for an anonymous reader.
 */
export default function RateWidget({ officialId }: { officialId: number }) {
  const { me } = useMe();
  const [mine, setMine] = useState<number | null>(null);
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    async (_prev, form) => rateOfficial(form),
    null
  );

  useEffect(() => {
    if (!me) return;
    let cancelled = false;
    fetch(`/api/officials/${officialId}/rating`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { score: null }))
      .then((d) => {
        if (!cancelled) setMine(d.score ?? null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [me, officialId]);

  if (me === undefined) return null;
  if (!me) {
    return <p className="rate-signin">Sign in to rate this official.</p>;
  }

  return (
    <form action={formAction} className="rate">
      <input type="hidden" name="officialId" value={officialId} />
      <span className="rate-label">{mine ? 'Your rating' : 'Rate this official'}</span>
      <span className="rate-buttons">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="submit"
            name="score"
            value={n}
            disabled={pending}
            className={`rate-star${mine && n <= mine ? ' is-on' : ''}`}
            aria-label={`${n} out of 5`}
          >
            ★
          </button>
        ))}
      </span>
      {state && !state.ok && <span className="formmsg formmsg--error">{state.error}</span>}
      {state?.ok && <span className="formmsg formmsg--ok">Saved.</span>}
    </form>
  );
}
