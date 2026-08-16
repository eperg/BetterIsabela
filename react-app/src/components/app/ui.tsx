import type { ReactNode } from 'react';

/** Money in centavos. `compact` abbreviates at thousand/million/billion scale. */
export function peso(centavos: number | null | undefined, opts: { compact?: boolean } = {}) {
  if (centavos == null) return null;
  const value = centavos / 100;

  if (opts.compact) {
    const trim = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
    if (value >= 1_000_000_000) return `₱${trim(value / 1_000_000_000)}B`;
    if (value >= 1_000_000) return `₱${trim(value / 1_000_000)}M`;
    if (value >= 1_000) return `₱${trim(value / 1_000)}k`;
  }
  return `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function salaryRange(min: number | null, max: number | null) {
  if (min == null && max == null) return 'Salary not stated';
  if (min != null && max != null) return `${peso(min)} – ${peso(max)}`;
  return peso(min ?? max) ?? 'Salary not stated';
}

export function since(date: Date | string) {
  const then = new Date(date).getTime();
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days < 1) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? 'a month ago' : `${months} months ago`;
}

export function Stars({ sum, count }: { sum: number; count: number }) {
  if (!count) return <span className="stars stars--none">no ratings yet</span>;
  const avg = sum / count;
  return (
    <span className="stars" title={`${avg.toFixed(2)} from ${count} rating${count === 1 ? '' : 's'}`}>
      <span className="stars-value">{avg.toFixed(1)}</span>
      <span className="stars-glyphs" aria-hidden="true">
        {'★★★★★'.slice(0, Math.round(avg))}
        <span className="stars-empty">{'★★★★★'.slice(Math.round(avg))}</span>
      </span>
      <span className="stars-count">({count})</span>
    </span>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="empty">{children}</p>;
}

export function PageHeader({
  title,
  lead,
  action,
}: {
  title: string;
  lead?: string;
  action?: ReactNode;
}) {
  return (
    <div className="pagehead">
      <div>
        <h1>{title}</h1>
        {lead && <p className="pagehead-lead">{lead}</p>}
      </div>
      {action}
    </div>
  );
}

export function TownSelect({ name = 'townSlug', towns, allowAll = false, required = true }: {
  name?: string;
  towns: { slug: string; name: string }[];
  allowAll?: boolean;
  required?: boolean;
}) {
  return (
    <select name={name} required={required} defaultValue="">
      <option value="" disabled={!allowAll}>
        {allowAll ? 'Province-wide' : 'Choose a town…'}
      </option>
      {towns.map((t) => (
        <option key={t.slug} value={t.slug}>
          {t.name}
        </option>
      ))}
    </select>
  );
}
