import { homepageSnippets, SNIPPET_LIMIT } from '@/lib/queries';
import {
  getDemographics,
  getServices,
  getLegislative,
  getTransparency,
} from '@/lib/static-data';
import { Stars, peso, salaryRange, since } from '@/components/app/ui';

export const revalidate = 300;


/** Section wrapper: heading, count, and a link through to the full feature. */
function Panel({
  title,
  href,
  linkLabel,
  count,
  children,
}: {
  title: string;
  href: string;
  linkLabel: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section className="hpanel">
      <div className="hpanel-head">
        <h2>
          {title}
          {count != null && count > 0 && <span className="hpanel-count">{count}</span>}
        </h2>
        <a href={href} className="hpanel-more">
          {linkLabel} <span aria-hidden="true">→</span>
        </a>
      </div>
      {children}
    </section>
  );
}

function Nothing({ children }: { children: React.ReactNode }) {
  return <p className="hpanel-empty">{children}</p>;
}

const nf = (n: number) => n.toLocaleString('en-PH');

export default async function Home() {
  const [s, demo, services, legislative, transparency] = await Promise.all([
    homepageSnippets(),
    getDemographics(),
    getServices(),
    getLegislative(),
    getTransparency(),
  ]);

  return (
    <main className="wrap">
      <section className="hhero">
        <h1>
          Isabela, <span>in the open</span>
        </h1>
        <p>
          Prices, work, goods, public projects and the people in office — for the
          province that grows the country&rsquo;s rice and corn.
        </p>
        <div className="hhero-actions">
          <a className="btn btn--primary" href="/prices">Today&rsquo;s prices</a>
          <a className="btn" href="/jobs">Find work</a>
          <a className="btn" href="/ask">Ask a question</a>
        </div>
      </section>

      <div className="hgrid">
        <Panel title="Jobs" href="/jobs" linkLabel="All jobs" count={Number(s.counts.jobs)}>
          {s.jobs.length === 0 ? (
            <Nothing>No jobs posted yet.</Nothing>
          ) : (
            <ul className="hlist">
              {s.jobs.map((j) => (
                <li key={j.id}>
                  <a href={`/jobs/${j.id}`}>{j.title}</a>
                  <span className="hlist-meta">
                    {j.employer} · {j.townName} · {salaryRange(j.salaryMinCentavos, j.salaryMaxCentavos)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Buy &amp; sell" href="/market" linkLabel="All listings" count={Number(s.counts.listings)}>
          {s.listings.length === 0 ? (
            <Nothing>Nothing listed yet.</Nothing>
          ) : (
            <ul className="hlist">
              {s.listings.map((l) => (
                <li key={l.id}>
                  <a href={`/market/${l.id}`}>{l.title}</a>
                  <span className="hlist-meta">
                    {l.priceCentavos != null ? peso(l.priceCentavos) : 'Open to offers'} · {l.townName}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Ask &amp; answer" href="/ask" linkLabel="All questions" count={Number(s.counts.questions)}>
          {s.questions.length === 0 ? (
            <Nothing>No questions yet.</Nothing>
          ) : (
            <ul className="hlist">
              {s.questions.map((q) => (
                <li key={q.id}>
                  <a href={`/ask/${q.id}`}>{q.title}</a>
                  <span className="hlist-meta">
                    {q.answerCount} {q.answerCount === 1 ? 'answer' : 'answers'} · {since(q.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Town progress" href="/progress" linkLabel="All projects" count={Number(s.counts.projects)}>
          {s.projects.length === 0 ? (
            <Nothing>
              No projects recorded yet — nothing is published without a named source.
            </Nothing>
          ) : (
            <ul className="hlist">
              {s.projects.map((p) => (
                <li key={p.id}>
                  <a href="/progress">{p.title}</a>
                  <span className="hlist-meta">
                    {p.status}
                    {p.percentComplete != null && ` · ${p.percentComplete}%`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Officials" href="/officials" linkLabel="All officials" count={Number(s.counts.officials)}>
          {s.officials.length === 0 ? (
            <Nothing>No officials have been rated yet.</Nothing>
          ) : (
            <ul className="hlist">
              {s.officials.map((o) => (
                <li key={o.id}>
                  <a href={`/officials/${o.id}`}>{o.name}</a>
                  <span className="hlist-meta">
                    {o.position}
                    {o.townName ? ` · ${o.townName}` : ''}{' '}
                    <Stars sum={o.ratingSum} count={o.ratingCount} />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Palay &amp; corn prices" href="/prices" linkLabel="Price Watch">
          <p className="hpanel-lead">
            Farmgate and market prices for palay and corn, from PSA and the DA, updated twice daily.
          </p>
          <a className="btn btn--primary btn--sm" href="/prices">Open Price Watch</a>
        </Panel>

        <Panel title="Statistics" href="/statistics" linkLabel="All statistics">
          {demo ? (
            <ul className="hlist hlist--facts">
              <li><span>Population</span><strong>{nf(demo.population.total)}</strong>
                <span className="hlist-meta">{demo.population.source}</span></li>
              <li><span>Cities &amp; municipalities</span>
                <strong>{demo.city_count + demo.municipality_count}</strong>
                <span className="hlist-meta">{demo.city_count} cities · {demo.municipality_count} municipalities</span></li>
              <li><span>Barangays</span><strong>{nf(demo.barangay_count)}</strong>
                <span className="hlist-meta">
                  {nf(Math.round(demo.land_area_km2))} km² · income class {demo.income_class}
                </span></li>
            </ul>
          ) : (
            <Nothing>Statistics are unavailable.</Nothing>
          )}
        </Panel>

        <Panel title="Services" href="/services" linkLabel="All services" count={services.total}>
          {services.categories.length === 0 ? (
            <Nothing>No services catalogued yet.</Nothing>
          ) : (
            <ul className="hlist">
              {services.categories.slice(0, SNIPPET_LIMIT).map((c) => (
                <li key={c.id}>
                  <a href={`/services?category=${c.id}`}>{c.name}</a>
                  <span className="hlist-meta">{c.count} {c.count === 1 ? 'service' : 'services'}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Legislative" href="/legislative" linkLabel="Ordinances &amp; resolutions">
          {legislative.pending ? (
            <Nothing>
              Ordinances and resolutions are being curated from the Sangguniang Panlalawigan
              archive. The Solano-era records were removed rather than relabelled.
            </Nothing>
          ) : (
            <ul className="hlist">
              <li><span>Ordinances</span><strong>{nf(legislative.ordinances)}</strong></li>
              <li><span>Resolutions</span><strong>{nf(legislative.resolutions)}</strong></li>
            </ul>
          )}
          <a className="btn btn--primary btn--sm" href={legislative.source} target="_blank" rel="noopener noreferrer">
            Official archive
          </a>
        </Panel>

        <Panel title="Transparency" href="/transparency" linkLabel="Budget &amp; spending">
          {transparency.pending ? (
            <Nothing>
              No fiscal year has been published yet. Budget figures go up only with a named source
              and a verification date.
            </Nothing>
          ) : (
            <p className="hpanel-lead">{transparency.years} fiscal year(s) published.</p>
          )}
          <a
            className="btn btn--primary btn--sm"
            href="https://provinceofisabela.gov.ph/transparency-seal/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Provincial transparency seal
          </a>
        </Panel>
      </div>
    </main>
  );
}
