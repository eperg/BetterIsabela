'use client';

import { useActionState, useState } from 'react';
import { reportContent } from '@/lib/actions';
import type { ActionResult } from '@/lib/actions';

const REASONS = [
  ['defamation', 'Defamatory or untrue about a person'],
  ['harassment', 'Harassment or abuse'],
  ['false_information', 'False information'],
  ['personal_data', 'Exposes someone’s personal details'],
  ['spam', 'Spam or scam'],
  ['illegal', 'Illegal content'],
  ['other', 'Something else'],
] as const;

/**
 * The counterweight to post-moderation: published content is only safe if
 * reporting it is one click away from wherever it appears.
 */
export default function ReportButton({
  targetType,
  targetId,
}: {
  targetType: string;
  targetId: number;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    async (_prev, form) => reportContent(form),
    null
  );

  if (state?.ok) return <span className="reported">Reported — thank you.</span>;

  if (!open) {
    return (
      <button type="button" className="linkish" onClick={() => setOpen(true)}>
        Report
      </button>
    );
  }

  return (
    <form action={formAction} className="reportform">
      <input type="hidden" name="targetType" value={targetType} />
      <input type="hidden" name="targetId" value={targetId} />
      <label>
        Reason
        <select name="reason" required defaultValue="">
          <option value="" disabled>
            Choose…
          </option>
          {REASONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <input name="details" placeholder="Anything else? (optional)" maxLength={500} />
      <button type="submit" className="btn btn--sm" disabled={pending}>
        {pending ? 'Sending…' : 'Send report'}
      </button>
      <button type="button" className="linkish" onClick={() => setOpen(false)}>
        Cancel
      </button>
      {state && !state.ok && <span className="formmsg formmsg--error">{state.error}</span>}
    </form>
  );
}
