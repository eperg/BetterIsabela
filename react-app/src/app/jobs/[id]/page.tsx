import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getJob } from '@/lib/queries';
import { salaryRange, since } from '@/components/app/ui';
import ReportButton from '@/components/app/ReportButton';
import JsonLd from '@/components/seo/JsonLd';
import { jobPostingSchema, breadcrumbSchema, summarise } from '@/lib/schema';

// Nothing on this page depends on who is reading it: the only interactive
// element, ReportButton, is a client component that authenticates itself. So it
// is cached and revalidated rather than rendered per request, which keeps a
// crawler hitting every job from costing a function invocation each time.
export const revalidate = 300;

/**
 * Empty on purpose, and load-bearing.
 *
 * A dynamic segment with no generateStaticParams at all is served uncached in
 * Next 15, whatever `revalidate` says: verified by watching the response go from
 * `Cache-Control: private, no-store` to `s-maxage`/`x-nextjs-cache: HIT` the
 * moment this function exists. Returning nothing means no page is built ahead of
 * time; each is rendered on first request and cached from then on, which is the
 * right trade for rows that appear and expire constantly.
 */
export function generateStaticParams(): { id: string }[] {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const row = await getJob(Number(id));
  if (!row) return { title: 'Job not found' };
  const { job, townName } = row;
  return {
    title: `${job.title} at ${job.employer}`,
    description: summarise(
      `${job.title} — ${job.employer}, ${townName}, Isabela. ${job.description}`,
      200
    ),
    alternates: { canonical: `/jobs/${id}` },
  };
}

export default async function JobDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await getJob(Number(id));
  if (!row) notFound();
  const { job, townName } = row;

  return (
    <main className="wrap wrap--narrow">
      <JsonLd
        data={[
          jobPostingSchema({
            title: job.title,
            employer: job.employer,
            description: job.description,
            type: job.type,
            salaryMinCentavos: job.salaryMinCentavos,
            salaryMaxCentavos: job.salaryMaxCentavos,
            townName,
            createdAt: job.createdAt,
            expiresAt: job.expiresAt,
            path: `/jobs/${job.id}`,
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Job board', path: '/jobs' },
            { name: job.title, path: `/jobs/${job.id}` },
          ]),
        ]}
      />
      <p className="crumb"><a href="/jobs">← Job board</a></p>
      <h1>{job.title}</h1>
      <p className="card-sub">{job.employer} · {townName}</p>
      <p className="card-meta">
        <span>{salaryRange(job.salaryMinCentavos, job.salaryMaxCentavos)}</span>
        <span className="muted">posted {since(job.createdAt)}</span>
      </p>
      <div className="prose">{job.description.split('\n').map((p, i) => <p key={i}>{p}</p>)}</div>

      <section className="panel">
        <h2>How to apply</h2>
        <ul className="plainlist">
          {job.contactName && <li>{job.contactName}</li>}
          {job.contactPhone && <li><a href={`tel:${job.contactPhone}`}>{job.contactPhone}</a></li>}
          {job.contactEmail && <li><a href={`mailto:${job.contactEmail}`}>{job.contactEmail}</a></li>}
          {!job.contactName && !job.contactPhone && !job.contactEmail && (
            <li className="muted">No contact details were given.</li>
          )}
        </ul>
      </section>

      <div className="footnote">
        BetterIsabela does not verify employers. Never pay a fee to apply for a job.
        {' '}<ReportButton targetType="job" targetId={job.id} />
      </div>
    </main>
  );
}
