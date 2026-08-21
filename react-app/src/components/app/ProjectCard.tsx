import { peso } from './ui';

export const PROJECT_STATUS_LABEL: Record<string, string> = {
  proposed: 'Proposed',
  funded: 'Funded',
  ongoing: 'Ongoing',
  suspended: 'Suspended',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export type ProjectRow = {
  id: number;
  title: string;
  description: string | null;
  category: string;
  status: string;
  percentComplete: number | null;
  costCentavos: number | null;
  townSlug: string | null;
  sourceName: string;
  sourceUrl: string | null;
  targetOn: Date | null;
};

/**
 * One project. Shared by the province view and the town pages so a contract
 * looks and reads the same wherever it is listed.
 */
export default function ProjectCard({ project: p }: { project: ProjectRow }) {
  return (
    <li className="card" data-town={p.townSlug ?? ''} data-status={p.status} data-category={p.category}>
      <div className="card-main">
        <h3 className="card-title">{p.title}</h3>
        <p className="card-meta">
          <span className={`chip chip--${p.status}`}>{PROJECT_STATUS_LABEL[p.status] ?? p.status}</span>
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
          Source:{' '}
          {p.sourceUrl ? (
            <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer">
              {p.sourceName}
            </a>
          ) : (
            p.sourceName
          )}
        </p>
      </div>
    </li>
  );
}
