/**
 * Page links for a list split across routes. Page one is the bare base path, so
 * /progress/jones and /progress/jones/1 do not both exist as separate pages
 * competing for the same content.
 *
 * Plain links, prerendered with the page: no JavaScript, and every page of a
 * town's projects has its own address to share.
 */
export default function Pager({
  base,
  page,
  pages,
  label,
}: {
  base: string;
  page: number;
  pages: number;
  label: string;
}) {
  if (pages < 2) return null;

  const href = (n: number) => (n === 1 ? base : `${base}/${n}`);
  // Around the current page, plus the two ends, so a long list of towns does not
  // turn into a long list of numbers.
  const shown = [...new Set([1, page - 1, page, page + 1, pages])]
    .filter((n) => n >= 1 && n <= pages)
    .sort((a, b) => a - b);

  return (
    <nav className="pager" aria-label={label}>
      {page > 1 ? (
        <a className="pager-step" href={href(page - 1)} rel="prev">
          <span aria-hidden="true">←</span> Previous
        </a>
      ) : (
        <span className="pager-step is-off">
          <span aria-hidden="true">←</span> Previous
        </span>
      )}

      <ol className="pager-list">
        {shown.map((n, i) => (
          <li key={n}>
            {i > 0 && shown[i - 1] !== n - 1 && <span className="pager-gap">…</span>}
            {n === page ? (
              <span className="pager-n is-here" aria-current="page">
                {n}
              </span>
            ) : (
              <a className="pager-n" href={href(n)}>
                {n}
              </a>
            )}
          </li>
        ))}
      </ol>

      {page < pages ? (
        <a className="pager-step" href={href(page + 1)} rel="next">
          Next <span aria-hidden="true">→</span>
        </a>
      ) : (
        <span className="pager-step is-off">
          Next <span aria-hidden="true">→</span>
        </span>
      )}
    </nav>
  );
}
