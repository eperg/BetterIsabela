import { listProjects, projectSummary, listTowns } from '@/lib/queries';
import { PageHeader, Empty, peso } from '@/components/app/ui';

export const revalidate = 900;


const STATUS_LABEL: Record<string, string> = {
  proposed: 'Proposed', funded: 'Funded', ongoing: 'Ongoing',
  suspended: 'Suspended', completed: 'Completed', cancelled: 'Cancelled',
};

export default async function ProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ town?: string }>;
}) {
  const { town } = await searchParams;
  const [items, summary, towns] = await Promise.all([
    listProjects({ townSlug: town }),
    projectSummary(town),
    listTowns(),
  ]);

  return (
    <main className="wrap">
      <PageHeader
        title="Town progress tracker"
        lead="Public projects across Isabela — what is funded, what is running, what is finished."
      />

      <form className="filterbar" method="get">
        <label>
          Town
          <select name="town" defaultValue={town ?? ''}>
            <option value="">All of Isabela</option>
            {towns.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
          </select>
        </label>
        <button type="submit" className="btn btn--sm">Filter</button>
      </form>

      {summary.length > 0 && (
        <ul className="statstrip">
          {summary.map((s) => (
            <li key={s.status}>
              <span className="statstrip-n">{s.n}</span>
              <span className="statstrip-l">{STATUS_LABEL[s.status] ?? s.status}</span>
            </li>
          ))}
        </ul>
      )}

      {items.length === 0 ? (
        <Empty>
          No projects recorded yet. The DPWH dataset was cleared during the rebrand audit because
          its records were located in Solano, Nueva Vizcaya. Nothing is republished here without a
          named source and a verification date.
        </Empty>
      ) : (
        <ul className="cardlist cardlist--grid">
          {items.map((p) => (
            <li key={p.id} className="card">
              <div className="card-main">
                <h2 className="card-title">{p.title}</h2>
                <p className="card-meta">
                  <span className={`chip chip--${p.status}`}>{STATUS_LABEL[p.status] ?? p.status}</span>
                  <span className="chip">{p.category}</span>
                  {p.costCentavos != null && <span>{peso(p.costCentavos, { compact: true })}</span>}
                </p>
                {p.description && <p className="card-desc">{p.description}</p>}
                {p.percentComplete != null && (
                  <div
                    className="progress"
                    role="progressbar"
                    aria-valuenow={p.percentComplete}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div className="progress-bar" style={{ width: `${p.percentComplete}%` }} />
                    <span className="progress-label">{p.percentComplete}%</span>
                  </div>
                )}
                <p className="footnote">
                  Source: {p.sourceUrl
                    ? <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer">{p.sourceName}</a>
                    : p.sourceName}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
