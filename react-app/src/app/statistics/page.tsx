import { getDemographics, getCompetitiveIndex, getTownTable } from '@/lib/static-data';
import { PageHeader, Empty } from '@/components/app/ui';

export const revalidate = 3600;


export const metadata = {
  title: 'Provincial statistics',
  description:
    'Population, land area, administrative units and competitiveness scores for the Province of Isabela, with every figure sourced.',
};

const nf = (n: number) => n.toLocaleString('en-PH');

/**
 * A pillar score, drawn relative to the highest pillar this year. CMCI scores
 * are not bounded at 1, so an absolute scale would be wrong and would overflow.
 */
function ScoreBar({ label, value, max }: { label: string; value: number | null; max: number }) {
  const pct = value == null || max <= 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="scorerow">
      <span className="scorerow-label">{label}</span>
      <div
        className="scorebar"
        role="img"
        aria-label={
          value == null
            ? `${label}: no data`
            : `${label}: ${value.toFixed(3)}, highest pillar this year is ${max.toFixed(3)}`
        }
      >
        <div className="scorebar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="scorerow-value">{value == null ? '—' : value.toFixed(3)}</span>
    </div>
  );
}

export default async function StatisticsPage() {
  const [demo, cmci, { towns, source }] = await Promise.all([
    getDemographics(),
    getCompetitiveIndex(),
    getTownTable(),
  ]);

  const ranked = [...towns]
    .filter((t) => t.population != null)
    .sort((a, b) => (b.population ?? 0) - (a.population ?? 0));

  return (
    <main className="wrap">
      <PageHeader
        title="Provincial statistics"
        lead="Population, land, administrative units and competitiveness — every figure traced to a named source."
      />

      {demo ? (
        <ul className="statstrip statstrip--lg">
          <li>
            <span className="statstrip-n">{nf(demo.population.total)}</span>
            <span className="statstrip-l">Population</span>
            <span className="statstrip-s">{demo.population.source}</span>
          </li>
          <li>
            <span className="statstrip-n">{demo.city_count + demo.municipality_count}</span>
            <span className="statstrip-l">Cities &amp; municipalities</span>
            <span className="statstrip-s">
              {demo.city_count} cities · {demo.municipality_count} municipalities
            </span>
          </li>
          <li>
            <span className="statstrip-n">{nf(demo.barangay_count)}</span>
            <span className="statstrip-l">Barangays</span>
          </li>
          <li>
            <span className="statstrip-n">{nf(Math.round(demo.land_area_km2))}</span>
            <span className="statstrip-l">km² land area</span>
            <span className="statstrip-s">2nd largest province</span>
          </li>
          <li>
            <span className="statstrip-n">{demo.income_class}</span>
            <span className="statstrip-l">Income class</span>
          </li>
        </ul>
      ) : (
        <Empty>Demographic figures are unavailable.</Empty>
      )}

      {cmci && (
        <>
          <h2 className="sectionhead">Competitiveness, {cmci.latestYear}</h2>
          <p className="muted">
            {cmci.source}. Each pillar is the mean of its indicators. These scores are not
            normalised to a fixed maximum, so bars are drawn relative to the highest-scoring
            pillar this year ({cmci.scaleMax.toFixed(2)}) rather than to an absolute ceiling.
          </p>
          <div className="panel">
            {cmci.pillarScores.map((p) => (
              <ScoreBar key={p.id} label={p.name} value={p.latest} max={cmci.scaleMax} />
            ))}
          </div>

          {cmci.keyIndicators.length > 0 && (
            <>
              <h2 className="sectionhead">Key indicators</h2>
              <div className="price-table-wrap">
                <table className="price-table">
                  <caption>
                    CMCI indicator scores · {cmci.years[0]}&ndash;{cmci.latestYear}
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Indicator</th>
                      {cmci.years.map((y) => (
                        <th key={y} scope="col">
                          {y}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cmci.keyIndicators.map((ind) => (
                      <tr key={ind.name}>
                        <th scope="row">{ind.name}</th>
                        {ind.values.map((v, i) => (
                          <td key={i} className="price-num">
                            {v == null ? '—' : v.toFixed(2)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      <h2 className="sectionhead">Cities and municipalities</h2>
      <p className="muted">
        {ranked.length} local government units, by population. CY2020 census as published by the
        province.
      </p>
      <div className="price-table-wrap">
        <table className="price-table">
          <thead>
            <tr>
              <th scope="col">Town</th>
              <th scope="col">Type</th>
              <th scope="col">Population</th>
              <th scope="col">Barangays</th>
              <th scope="col">Land area</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((t) => (
              <tr key={t.slug}>
                <th scope="row">
                  <a href={t.url} target="_blank" rel="noopener noreferrer">
                    {t.name}
                  </a>
                  {t.market && <small>market prices monitored</small>}
                </th>
                <td>{t.lguType ?? '—'}</td>
                <td className="price-num">{t.population ? nf(t.population) : '—'}</td>
                <td className="price-num">{t.barangays ?? '—'}</td>
                <td className="price-num">
                  {t.landAreaHectares ? `${nf(Math.round(t.landAreaHectares))} ha` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="footnote">
        Sources:{' '}
        <a href="https://psa.gov.ph/" target="_blank" rel="noopener noreferrer">
          Philippine Statistics Authority
        </a>{' '}
        ·{' '}
        <a href="https://cmci.dti.gov.ph/" target="_blank" rel="noopener noreferrer">
          DTI Cities and Municipalities Competitiveness Index
        </a>{' '}
        ·{' '}
        <a href={source} target="_blank" rel="noopener noreferrer">
          Province of Isabela directory
        </a>
        <p>
          Figures are published only once traced to a source. Anything absent is still being
          curated rather than estimated.
        </p>
      </div>
    </main>
  );
}
