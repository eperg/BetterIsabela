import { Suspense } from 'react';
import { listJobs, listTowns } from '@/lib/queries';
import { PageHeader, Empty, salaryRange, since } from '@/components/app/ui';
import ReportButton from '@/components/app/ReportButton';
import ListFilter from '@/components/app/ListFilter';
import JsonLd from '@/components/seo/JsonLd';
import { collectionPageSchema } from '@/lib/schema';

export const metadata = {
  title: 'Job board',
  description:
    'Local jobs and hiring across the Province of Isabela — roles, employers, salary ranges and ' +
    'how to apply, posted by employers and the community.',
  alternates: { canonical: '/jobs' },
};

// Prerendered and revalidated rather than rendered per request: the board is the
// same for every reader, and the town filter is applied in the browser from the
// URL. A crawler walking the board no longer costs a query per hit.
export const revalidate = 300;

const TYPE_LABEL: Record<string, string> = {
  full_time: 'Full time', part_time: 'Part time', contract: 'Contract',
  seasonal: 'Seasonal', internship: 'Internship', volunteer: 'Volunteer',
};

export default async function JobsPage() {
  const [jobs, towns] = await Promise.all([listJobs(), listTowns()]);

  return (
    <main className="wrap">
      {jobs.length > 0 && (
        <JsonLd
          data={collectionPageSchema({
            name: 'Job board (Province of Isabela)',
            description:
              'Current job vacancies across the Province of Isabela, with employer, town, ' +
              'salary range and how to apply.',
            path: '/jobs',
            items: jobs.map((j) => ({
              name: `${j.title} at ${j.employer}`,
              path: `/jobs/${j.id}`,
            })),
          })}
        />
      )}
      <PageHeader
        title="Job board"
        lead="Work available across Isabela. Posted by employers and neighbours."
        action={<a className="btn btn--primary" href="/jobs/new">Post a job</a>}
      />

      {/* useSearchParams needs a boundary for the prerender to resolve. */}
      <Suspense fallback={null}>
        <ListFilter
          targetId="jobboard"
          facets={[
            {
              key: 'town',
              label: 'Town',
              all: 'Anywhere in Isabela',
              options: towns.map((t) => ({ value: t.slug, label: t.name })),
            },
          ]}
          rows={jobs.map((j) => ({ town: j.townSlug }))}
          emptyMessage="No jobs posted for that town yet. Be the first."
        />
      </Suspense>

      {jobs.length === 0 ? (
        <Empty>No jobs posted yet. Be the first.</Empty>
      ) : (
        <ul className="cardlist cardlist--grid" id="jobboard">
          {jobs.map((j) => (
            <li key={j.id} className="card" data-town={j.townSlug}>
              <div className="card-main">
                <h2 className="card-title">{j.title}</h2>
                <p className="card-sub">{j.employer} · {j.townName}</p>
                <p className="card-meta">
                  <span className="chip">{TYPE_LABEL[j.type] ?? j.type}</span>
                  <span>{salaryRange(j.salaryMinCentavos, j.salaryMaxCentavos)}</span>
                  <span className="muted">{since(j.createdAt)}</span>
                </p>
              </div>
              <div className="card-actions">
                <a className="btn btn--sm" href={`/jobs/${j.id}`}>Details</a>
                <ReportButton targetType="job" targetId={j.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
