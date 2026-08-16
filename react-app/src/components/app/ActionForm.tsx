'use client';

import { useActionState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { ActionResult } from '@/lib/actions';

/**
 * Wraps a server action so the citizen sees the outcome of their submission
 * rather than a blank reload, and keeps the pending state so a double-click
 * cannot create duplicate rows.
 *
 * It also restores what they typed when the submission is rejected. React 19
 * resets an uncontrolled form once its action resolves, which on a validation
 * error would silently discard a long description and every select — the worst
 * possible moment to lose someone's work. So the submitted entries are captured
 * on the way in and written back on the way out, unless the write succeeded.
 */
export default function ActionForm({
  action,
  submitLabel,
  successMessage,
  children,
  className,
}: {
  action: (form: FormData) => Promise<ActionResult>;
  submitLabel: string;
  successMessage?: string;
  children: ReactNode;
  className?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const lastSubmission = useRef<[string, string][]>([]);

  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    async (_prev, form) => {
      lastSubmission.current = [...form.entries()].filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string'
      );
      return action(form);
    },
    null
  );

  useEffect(() => {
    if (!state || state.ok) return;
    const form = formRef.current;
    if (!form) return;

    for (const [name, value] of lastSubmission.current) {
      const field = form.elements.namedItem(name);
      if (!field) continue;
      if (field instanceof HTMLInputElement) {
        if (field.type === 'checkbox') field.checked = value === 'on';
        else field.value = value;
      } else if (field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) {
        field.value = value;
      }
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className={className}>
      {children}

      {state && !state.ok && (
        <p className="formmsg formmsg--error" role="alert">
          {state.error}
          {state.fieldErrors && (
            <span className="formmsg-fields">
              {Object.entries(state.fieldErrors).map(([field, errors]) => (
                <span key={field}>
                  {field}: {errors.join(', ')}
                </span>
              ))}
            </span>
          )}
        </p>
      )}
      {state?.ok && successMessage && (
        <p className="formmsg formmsg--ok" role="status">
          {successMessage}
        </p>
      )}

      <button type="submit" className="btn btn--primary" disabled={pending}>
        {pending ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
