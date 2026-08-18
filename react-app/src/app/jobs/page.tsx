import { listJobs, listTowns } from '@/lib/queries';
import { PageHeader, Empty, salaryRange, since } from '@/components/app/ui';
import ReportButton from '@/components/app/ReportButton';
import JsonLd from '@/components/seo/JsonLd';
import { collectionPageSchema } from '@/lib/schema';

export const metadata = {
  title: 'Job board',
  description:
    'Local jobs and hiring across the Province of Isabela — roles, employers, salary ranges and ' +
    'how to apply, posted by employers and the community.',
  alternates: { canonical: '/jobs' },
};

export const revalidate = 300;


const TYPE_LABEL: Record<string, string> = {
  full_time: 'Full time', part_time: 'Part time', contract: 'Contract',
  seasonal: 'Seasonal', internship: 'Internship', volunteer: 'Volunteer',
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ town?: string }>;
}) {
  const { town } = await searchParams;
  const [jobs, towns] = await Promise.all([listJobs({ townSlug: town }), listTowns()]);
  // Filtered views are not the canonical page, so they do not advertise a list.
  const unfiltered = !town;

  return (
    <main className="wrap">
      {unfiltered && (
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

      <form className="filterbar" method="get">
        <label>
          Town
          <select name="town" defaultValue={town ?? ''}>
            <option value="">Anywhere in Isabela</option>
            {towns.map((t) => (
              <option key={t.slug} value={t.slug}>{t.name}</option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn btn--sm">Filter</button>
      </form>

      {jobs.length === 0 ? (
        <Empty>No jobs posted{town ? ' for that town' : ''} yet. Be the first.</Empty>
      ) : (
        <ul className="cardlist cardlist--grid">
          {jobs.map((j) => (
            <li key={j.id} className="card">
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
