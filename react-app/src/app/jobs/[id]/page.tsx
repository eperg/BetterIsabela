import { notFound } from 'next/navigation';
import { getJob } from '@/lib/queries';
import { salaryRange, since } from '@/components/app/ui';
import ReportButton from '@/components/app/ReportButton';

// Reads the signed-in user, so it must render per request.
export const dynamic = 'force-dynamic';


export default async function JobDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await getJob(Number(id));
  if (!row) notFound();
  const { job, townName } = row;

  return (
    <main className="wrap wrap--narrow">
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
