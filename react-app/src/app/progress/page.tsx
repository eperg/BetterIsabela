import { Suspense } from 'react';
import { listProjects, listTowns } from '@/lib/queries';
import { PageHeader, Empty, peso } from '@/components/app/ui';
import ListFilter from '@/components/app/ListFilter';
import JsonLd from '@/components/seo/JsonLd';
import { datasetSchema } from '@/lib/schema';

export const metadata = {
  title: 'Town progress & projects',
  description:
    'Track public projects across the towns of Isabela — status, percent complete, cost, and ' +
    'funding source — so residents can see what is being built and how far along it is.',
  alternates: { canonical: '/progress' },
};

// Prerendered and revalidated; the town filter is applied in the browser, and
// the status tally is recounted there from the same rows.
export const revalidate = 900;

const STATUS_LABEL: Record<string, string> = {
  proposed: 'Proposed', funded: 'Funded', ongoing: 'Ongoing',
  suspended: 'Suspended', completed: 'Completed', cancelled: 'Cancelled',
};

export default async function ProgressPage() {
  const [items, towns] = await Promise.all([listProjects(), listTowns()]);

  return (
    <main className="wrap">
      <JsonLd
        data={datasetSchema({
          name: 'Public project tracker (Province of Isabela)',
          description:
            'Public infrastructure and development projects across the towns of Isabela, with ' +
            'status, percent complete, cost and funding source.',
          path: '/progress',
          keywords: ['public projects', 'infrastructure', 'Isabela', 'local government', 'budget'],
        })}
      />
      <PageHeader
        title="Town progress tracker"
        lead="Public projects across Isabela — what is funded, what is running, what is finished."
      />

      <Suspense fallback={null}>
        <ListFilter
          targetId="projectlist"
          facets={[
            {
              key: 'town',
              label: 'Town',
              all: 'All of Isabela',
              options: towns.map((t) => ({ value: t.slug, label: t.name })),
            },
          ]}
          rows={items.map((p) => ({ town: p.townSlug ?? '', status: p.status }))}
          emptyMessage="No projects recorded for that town yet."
          summary={{ key: 'status', labels: STATUS_LABEL }}
        />
      </Suspense>

      {items.length === 0 ? (
        <Empty>
          No projects recorded yet. The DPWH dataset was cleared during the rebrand audit because
          its records were located in Solano, Nueva Vizcaya. Nothing is republished here without a
          named source and a verification date.
        </Empty>
      ) : (
        <ul className="cardlist cardlist--grid" id="projectlist">
          {items.map((p) => (
            <li key={p.id} className="card" data-town={p.townSlug ?? ''}>
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
