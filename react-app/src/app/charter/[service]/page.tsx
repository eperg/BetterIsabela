import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getServices } from '@/lib/static-data';
import { serviceReportTallies, serviceReportNotes, listTowns } from '@/lib/queries';
import { since } from '@/components/app/ui';
import SignedIn from '@/components/app/SignedIn';
import ReportButton from '@/components/app/ReportButton';
import ServiceReportForm from '@/components/app/ServiceReportForm';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbSchema, governmentServiceSchema, absUrl } from '@/lib/schema';
import {
  parseCharterTime,
  parseCharterFee,
  medianWait,
  verdictFor,
  WAIT_BUCKETS,
  WAIT_VALUES,
  VERDICT_LABEL,
  type WaitValue,
} from '@/lib/charter';

// Cached, and revalidated when a report is filed against this service.
export const revalidate = 300;

/**
 * Empty, and load-bearing twice over.
 *
 * A dynamic segment with no generateStaticParams at all is served uncached in
 * Next 15 whatever `revalidate` says, so the function has to exist. Returning
 * the 52 service ids instead would prerender all of them, and doing that in
 * parallel against Supabase's pooler exhausts its 200-client limit and fails the
 * build — Next forks a worker per batch and each one opens its own pool. So each
 * page is rendered on first request and cached from then on, which also keeps
 * build minutes down.
 */
export function generateStaticParams(): { service: string }[] {
  return [];
}

async function load(id: string) {
  const { services } = await getServices();
  const service = services.find((s) => s.id === id);
  if (!service) return null;

  const [tallies, notes, towns] = await Promise.all([
    serviceReportTallies(),
    serviceReportNotes(id),
    listTowns(),
  ]);
  const tally = tallies.find((t) => t.serviceId === id);
  const charter = parseCharterTime(service.processingTime ?? 'Varies');
  const fee = parseCharterFee(service.fee ?? 'Varies');
  const median = tally ? (medianWait(tally.waits) as WaitValue | null) : null;

  return {
    service,
    towns,
    notes,
    charter,
    fee,
    median,
    waits: tally?.waits ?? {},
    total: tally?.total ?? 0,
    succeeded: tally?.succeeded ?? 0,
    medianPaid: tally?.medianPaidCentavos ?? null,
    verdict: verdictFor(charter, median),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string }>;
}): Promise<Metadata> {
  const { service: id } = await params;
  const data = await load(id);
  if (!data) return { title: 'Service not found' };

  const reported = data.median
    ? `Residents report ${WAIT_BUCKETS[data.median].label.toLowerCase()}.`
    : 'No resident reports yet.';
  return {
    title: `${data.service.title}: charter time against reality`,
    description:
      `The Isabela Citizen's Charter says ${data.service.title} takes ${data.charter.text} ` +
      `and costs ${data.fee.text}. ${reported}`,
    alternates: { canonical: `/charter/${id}` },
  };
}

const peso = (centavos: number) => `₱${(centavos / 100).toFixed(2).replace(/\.00$/, '')}`;

export default async function CharterServicePage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const { service: id } = await params;
  const data = await load(id);
  if (!data) notFound();
  const { service, charter, fee, median, waits, total, succeeded, medianPaid, verdict, notes, towns } =
    data;

  const busiest = Math.max(1, ...WAIT_VALUES.map((v) => waits[v] ?? 0));

  return (
    <main className="wrap wrap--narrow">
      <JsonLd
        data={[
          governmentServiceSchema({
            title: service.title,
            description: service.description,
            category: service.category,
            path: `/charter/${id}`,
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Charter watch', path: '/charter' },
            { name: service.title, path: `/charter/${id}` },
          ]),
        ]}
      />
      <p className="crumb"><a href="/charter">← Charter watch</a></p>
      <h1>{service.title}</h1>
      <p className="card-sub">{service.description}</p>
      {service.office && <p className="muted">{service.office}</p>}

      <section className="panel">
        <h2>Promised, and reported</h2>
        <dl className="charter-compare charter-compare--lg">
          <div>
            <dt>Charter processing time</dt>
            <dd>{charter.text}</dd>
          </div>
          <div>
            <dt>Residents report</dt>
            <dd>{median ? WAIT_BUCKETS[median].label : <span className="muted">no reports yet</span>}</dd>
          </div>
          <div>
            <dt>Charter fee</dt>
            <dd>{fee.text}</dd>
          </div>
          <div>
            <dt>Residents paid</dt>
            <dd>{medianPaid !== null ? peso(medianPaid) : <span className="muted">nobody said</span>}</dd>
          </div>
        </dl>
        <p className={`charter-verdict charter-verdict--${verdict}`}>{VERDICT_LABEL[verdict]}</p>
        {total > 0 && (
          <p className="footnote">
            From {total} {total === 1 ? 'report' : 'reports'}. {succeeded} of {total} walked away with
            what they came for. The figure shown is the middle report, not an average.
          </p>
        )}
      </section>

      {total > 0 && (
        <section className="panel">
          <h2>How long it took</h2>
          <ul className="waitchart">
            {WAIT_VALUES.filter((v) => (waits[v] ?? 0) > 0).map((v) => (
              <li key={v}>
                <span className="waitchart-l">{WAIT_BUCKETS[v].short}</span>
                <span className="waitchart-bar">
                  <span style={{ width: `${((waits[v] ?? 0) / busiest) * 100}%` }} />
                </span>
                <span className="waitchart-n">{waits[v]}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <h2 className="sectionhead">Report your own visit</h2>
      <SignedIn fallback={<p className="empty">Sign in to add what this took you.</p>}>
        <ServiceReportForm serviceId={service.id} towns={towns} />
      </SignedIn>

      {notes.length > 0 && (
        <>
          <h2 className="sectionhead">What people said</h2>
          <ul className="answerlist">
            {notes
              .filter((n) => n.note)
              .map((n) => (
                <li key={n.id} className="answer">
                  <div className="prose">
                    {(n.note ?? '').split('\n').map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                  <div className="card-meta">
                    <span className="chip">{WAIT_BUCKETS[n.waited as WaitValue].short}</span>
                    {n.paidCentavos !== null && <span className="chip">{peso(n.paidCentavos)}</span>}
                    <span className={`chip ${n.succeeded ? 'chip--ok' : ''}`}>
                      {n.succeeded ? 'completed' : 'not completed'}
                    </span>
                    {n.townName && <span>{n.townName}</span>}
                    <span className="muted">{n.authorName}, {since(n.createdAt)}</span>
                    <ReportButton targetType="service_report" targetId={n.id} />
                  </div>
                </li>
              ))}
          </ul>
        </>
      )}

      <p className="footnote">
        {service.detailSlug && (
          <>
            <a href={`/services/${service.detailSlug}`}>Full guide to {service.title}</a>
            {' · '}
          </>
        )}
        <a href={absUrl('/services')}>All provincial services</a>
      </p>
    </main>
  );
}
