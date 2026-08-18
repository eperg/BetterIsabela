import { Suspense } from 'react';
import { getServices } from '@/lib/static-data';
import { serviceReportTallies } from '@/lib/queries';
import { PageHeader } from '@/components/app/ui';
import ListFilter from '@/components/app/ListFilter';
import JsonLd from '@/components/seo/JsonLd';
import { datasetSchema, breadcrumbSchema } from '@/lib/schema';
import {
  parseCharterTime,
  parseCharterFee,
  medianWait,
  verdictFor,
  WAIT_BUCKETS,
  VERDICT_LABEL,
  type WaitValue,
} from '@/lib/charter';

export const metadata = {
  title: 'Charter watch',
  description:
    'What provincial services in Isabela actually take, against what the Citizen’s Charter ' +
    'promises. Waiting times and fees reported by the residents who queued.',
  alternates: { canonical: '/charter' },
};

// Cached: the comparison is the same for everyone, and reports revalidate it.
export const revalidate = 300;

const peso = (centavos: number) => `₱${(centavos / 100).toFixed(2).replace(/\.00$/, '')}`;

export default async function CharterPage() {
  const [{ services }, tallies] = await Promise.all([getServices(), serviceReportTallies()]);
  const byId = new Map(tallies.map((t) => [t.serviceId, t]));

  const rows = services.map((s) => {
    const charter = parseCharterTime(s.processingTime ?? 'Varies');
    const fee = parseCharterFee(s.fee ?? 'Varies');
    const tally = byId.get(s.id);
    const median = tally ? (medianWait(tally.waits) as WaitValue | null) : null;
    return {
      service: s,
      charter,
      fee,
      median,
      reports: tally?.total ?? 0,
      succeeded: tally?.succeeded ?? 0,
      medianPaid: tally?.medianPaidCentavos ?? null,
      verdict: verdictFor(charter, median),
    };
  });

  const measured = rows.filter((r) => r.reports > 0);
  const slower = measured.filter((r) => r.verdict === 'over').length;

  return (
    <main className="wrap">
      <JsonLd
        data={[
          datasetSchema({
            name: 'Charter watch: promised against actual service times (Province of Isabela)',
            description:
              'For each service in the Isabela Citizen’s Charter, the processing time and fee it ' +
              'promises alongside the waiting time and fee reported by residents who used it.',
            path: '/charter',
            keywords: ['citizens charter', 'processing time', 'government service', 'Isabela', 'ARTA'],
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Charter watch', path: '/charter' },
          ]),
        ]}
      />
      <PageHeader
        title="Charter watch"
        lead={
          `The Citizen's Charter says how long each service should take and what it should cost. ` +
          `This is what residents report it actually took. ` +
          (measured.length
            ? `${measured.length} of ${services.length} services have reports so far; ${slower} are running slower than promised.`
            : `No reports yet. Add yours and the comparison starts.`)
        }
      />

      <Suspense fallback={null}>
        <ListFilter
          targetId="charterlist"
          search={{ key: 'q', label: 'Search', placeholder: 'e.g. birth certificate' }}
          facets={[
            {
              key: 'verdict',
              label: 'Showing',
              all: 'Every service',
              options: [
                { value: 'over', label: 'Slower than promised' },
                { value: 'within', label: 'Matches the charter' },
                { value: 'unresolved', label: 'Often not completed' },
                { value: 'no_promise', label: 'No time promised' },
                { value: 'no_reports', label: 'No reports yet' },
              ],
            },
          ]}
          rows={rows.map((r) => ({
            verdict: r.verdict,
            search: `${r.service.title} ${r.service.category}`.toLowerCase().replace(/[^a-z0-9 ]+/g, ' '),
          }))}
          countNoun="services"
          emptyMessage="No services match that."
        />
      </Suspense>

      <ul className="cardlist charterlist" id="charterlist">
        {rows.map((r) => (
          <li
            key={r.service.id}
            className="card"
            data-verdict={r.verdict}
            data-search={`${r.service.title} ${r.service.category}`.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ')}
          >
            <div className="card-main">
              <h2 className="card-title">
                <a href={`/charter/${r.service.id}`}>{r.service.title}</a>
              </h2>
              <p className="card-meta">
                <span className={`chip chip--verdict-${r.verdict}`}>{VERDICT_LABEL[r.verdict]}</span>
                <span className="chip">{r.service.category}</span>
              </p>
              <dl className="charter-compare">
                <div>
                  <dt>Charter says</dt>
                  <dd>{r.charter.text}</dd>
                </div>
                <div>
                  <dt>Residents report</dt>
                  <dd>
                    {r.median ? WAIT_BUCKETS[r.median].label : <span className="muted">nothing yet</span>}
                  </dd>
                </div>
                <div>
                  <dt>Fee on paper</dt>
                  <dd>{r.fee.text}</dd>
                </div>
                <div>
                  <dt>Fee reported</dt>
                  <dd>
                    {r.medianPaid !== null ? peso(r.medianPaid) : <span className="muted">nothing yet</span>}
                  </dd>
                </div>
              </dl>
              {r.reports > 0 && (
                <p className="footnote">
                  {r.reports} {r.reports === 1 ? 'report' : 'reports'} · {r.succeeded} of {r.reports} got
                  what they came for
                </p>
              )}
            </div>
            <div className="card-actions">
              <a className="btn btn--sm" href={`/charter/${r.service.id}`}>
                {r.reports > 0 ? 'Details and reports' : 'Be the first to report'}
              </a>
            </div>
          </li>
        ))}
      </ul>

      <p className="footnote">
        Reports are written by residents about their own visit, published as submitted, and are not
        verified by the province. They describe experiences, not official statistics.
      </p>
    </main>
  );
}
