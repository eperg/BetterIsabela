'use client';

import { useEffect, useState } from 'react';
import ActionForm from '@/components/app/ActionForm';
import { reportServiceExperience } from '@/lib/actions';
import { WAIT_VALUES, WAIT_BUCKETS } from '@/lib/charter';

interface Mine {
  waited: string;
  paidCentavos: number | null;
  succeeded: boolean;
  townSlug: string | null;
  note: string | null;
}

/**
 * One person's account of one visit.
 *
 * Deliberately four short questions and an optional note: this is filled in by
 * somebody who has just spent a morning at the Capitol, often on a phone. The
 * waiting time is a choice rather than a number because nobody remembers that a
 * queue took 47 minutes, and a free-text minute count would give the median a
 * precision it has not earned.
 *
 * An existing report is loaded and pre-filled so a second submission reads as a
 * correction, which is what the unique key on (service, person) enforces anyway.
 */
export default function ServiceReportForm({
  serviceId,
  towns,
}: {
  serviceId: string;
  towns: { slug: string; name: string }[];
}) {
  const [mine, setMine] = useState<Mine | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/services/${serviceId}/report`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { report: null }))
      .then((d) => {
        if (!cancelled) setMine(d.report ?? null);
      })
      .catch(() => {
        if (!cancelled) setMine(null);
      });
    return () => {
      cancelled = true;
    };
  }, [serviceId]);

  if (mine === undefined) return null;

  return (
    <ActionForm
      action={reportServiceExperience}
      submitLabel={mine ? 'Update my report' : 'Add my report'}
      successMessage={mine ? 'Report updated.' : 'Thank you. Your report is counted.'}
      className="stack"
    >
      <input type="hidden" name="serviceId" value={serviceId} />

      <label>
        How long did it take, start to finish?
        <select name="waited" required defaultValue={mine?.waited ?? ''}>
          <option value="" disabled>
            Choose one…
          </option>
          {WAIT_VALUES.map((v) => (
            <option key={v} value={v}>
              {WAIT_BUCKETS[v].label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Did you get what you came for?
        <select name="succeeded" defaultValue={mine ? (mine.succeeded ? 'yes' : 'no') : 'yes'}>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </label>

      <label>
        What did you pay, in pesos? <span className="muted">Leave blank to skip.</span>
        <input
          type="number"
          name="paidPesos"
          min={0}
          max={100000}
          step="0.01"
          inputMode="decimal"
          defaultValue={mine?.paidCentavos != null ? (mine.paidCentavos / 100).toString() : ''}
          placeholder="e.g. 150"
        />
      </label>

      <label>
        Which town did you transact in?
        <select name="townSlug" defaultValue={mine?.townSlug ?? ''}>
          <option value="">Prefer not to say</option>
          {towns.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Anything else worth knowing? <span className="muted">Optional, and published.</span>
        <textarea
          name="note"
          rows={4}
          maxLength={2000}
          defaultValue={mine?.note ?? ''}
          placeholder="What slowed it down, what to bring, which window to go to."
        />
      </label>
    </ActionForm>
  );
}
