'use client';

import { useActionState } from 'react';
import { rateOfficial } from '@/lib/actions';
import type { ActionResult } from '@/lib/actions';

/** One-click 1-5 rating. The unique key on (official, user) makes re-clicking an update. */
export default function RateWidget({
  officialId,
  mine,
  signedIn,
}: {
  officialId: number;
  mine: number | null;
  signedIn: boolean;
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    async (_prev, form) => rateOfficial(form),
    null
  );

  if (!signedIn) {
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
