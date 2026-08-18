'use client';

import { useUrlFilters } from '@/hooks/useUrlFilters';

export interface Facet {
  /** URL parameter name, and the data-* attribute the list items carry. */
  key: string;
  label: string;
  /** Label for the "no filter" option. */
  all: string;
  options: { value: string; label: string }[];
}

/**
 * Filter controls for a list the server has already rendered.
 *
 * The list stays a server component: this only emits a <style> rule that hides
 * the items which do not match, so no row is serialised twice and no card
 * markup is shipped as JavaScript. Items opt in by carrying `id={targetId}` on
 * the list and `data-<key>` on each item.
 *
 * `rows` carries only the facet values, one short string per item, which is what
 * lets this component say "nothing matches" without knowing how a card looks.
 */
export default function ListFilter({
  targetId,
  facets,
  rows,
  emptyMessage,
  summary,
  search,
  countNoun,
}: {
  targetId: string;
  facets: Facet[];
  rows: Record<string, string>[];
  emptyMessage: string;
  /**
   * Optional tally of the matching rows, grouped by one of their keys. It lives
   * here rather than in its own component so the rows are still sent once.
   * Order follows the labels object, not whatever the data happens to yield.
   */
  summary?: { key: string; labels: Record<string, string> };
  /**
   * Free-text search over a `data-search` attribute each item carries,
   * lowercased. CSS does the hiding through its substring attribute selector,
   * so the text never has to be matched twice in two places.
   */
  search?: { key: string; label: string; placeholder?: string };
  /**
   * Renders "12 of 52 services" above the list. A noun, not a formatter: a
   * function prop cannot cross the server/client boundary.
   */
  countNoun?: string;
}) {
  const { get, set, setMany } = useUrlFilters();

  // A value from the URL is untrusted and ends up inside a CSS attribute
  // selector, so only values we ourselves offered are ever honoured.
  const active = facets
    .map((f) => {
      const raw = get(f.key);
      const known = f.options.some((o) => o.value === raw);
      return known && !/["\\<>{}\n]/.test(raw) ? { key: f.key, value: raw } : null;
    })
    .filter((v): v is { key: string; value: string } => v !== null);

  // The query also ends up in a CSS selector, so it is reduced to characters
  // that cannot terminate a string or a rule. Anything else is simply dropped
  // rather than rejected, which is what a reader expects from a search box.
  const query = search ? get(search.key).toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').trim() : '';
  const terms = query ? query.split(/\s+/).slice(0, 6) : [];

  const matches = rows.filter(
    (r) =>
      active.every((a) => r[a.key] === a.value) &&
      terms.every((t) => (r.search ?? '').includes(t))
  );
  const isEmpty = matches.length === 0;

  const hide = active
    .map((a) => `#${targetId} > *:not([data-${a.key}="${a.value}"])`)
    .concat(terms.map((t) => `#${targetId} > *:not([data-search*="${t}"])`))
    .concat(isEmpty ? [`#${targetId}`] : [])
    .join(',');

  const tally = summary
    ? Object.entries(summary.labels)
        .map(([value, label]) => ({
          label,
          n: matches.filter((r) => r[summary.key] === value).length,
        }))
        .filter((t) => t.n > 0)
    : [];

  return (
    <>
      {hide && <style>{`${hide}{display:none}`}</style>}
      <div className="filterbar">
        {search && (
          <label>
            {search.label}
            <input
              type="search"
              value={get(search.key)}
              placeholder={search.placeholder}
              onChange={(e) => set(search.key, e.target.value)}
            />
          </label>
        )}
        {facets.map((f) => (
          <label key={f.key}>
            {f.label}
            <select value={get(f.key)} onChange={(e) => set(f.key, e.target.value)}>
              <option value="">{f.all}</option>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
        ))}
        {(active.length > 0 || query) && (
          <button
            type="button"
            className="btn btn--sm"
            onClick={() =>
              setMany({
                ...Object.fromEntries(facets.map((f) => [f.key, ''])),
                ...(search ? { [search.key]: '' } : {}),
              })
            }
          >
            Clear
          </button>
        )}
      </div>
      {countNoun && (
        <p className="resultcount">
          {matches.length === rows.length
            ? `${rows.length} ${countNoun}`
            : `${matches.length} of ${rows.length} ${countNoun}`}
        </p>
      )}
      {tally.length > 0 && (
        <ul className="statstrip">
          {tally.map((t) => (
            <li key={t.label}>
              <span className="statstrip-n">{t.n}</span>
              <span className="statstrip-l">{t.label}</span>
            </li>
          ))}
        </ul>
      )}
      {isEmpty && (active.length > 0 || query) && <p className="empty">{emptyMessage}</p>}
    </>
  );
}
