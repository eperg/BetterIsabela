import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PageHeader, Empty } from '@/components/app/ui';

export const revalidate = 1800;


interface Point { period: string; price: number }
interface Series { commodity: string; label: string; points: Point[]; latest: Point | null }
interface MarketPrice { market: string; price: number }
interface Item { commodity: string; specification: string; markets: MarketPrice[] }
interface Category { category: string; label: string; items: Item[] }
interface Prices {
  _generated?: string;
  farmgate?: { series: Series[]; _sourceName?: string; _source?: string };
  retail?: { categories: Category[]; _asOf?: string; _sourceName?: string; _source?: string };
  spread?: { farmgatePalay: number; retailRiceAverage: number; spread: number; farmgatePeriod: string };
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
function periodLabel(p?: string) {
  if (!p) return '';
  const [y, m] = p.split('-');
  return `${MONTHS[Number(m) - 1] ?? m} ${y}`;
}
const php = (n: number, dp = 2) => `₱${n.toFixed(dp)}`;

/** Written by scripts/sync-prices.js; served from this app's own public dir. */
async function load(): Promise<Prices | null> {
  try {
    return JSON.parse(await readFile(join(process.cwd(), 'public', 'data', 'prices.json'), 'utf8'));
  } catch {
    return null;
  }
}

export default async function PricesPage() {
  const data = await load();

  if (!data?.farmgate) {
    return (
      <main className="wrap">
        <PageHeader title="Palay &amp; corn prices" />
        <Empty>Prices are not available yet. Run <code>npm run sync:prices</code> in the repo root.</Empty>
      </main>
    );
  }

  const spread = data.spread;

  return (
    <main className="wrap">
      <PageHeader
        title="Palay &amp; corn prices"
        lead="What farmers are paid, and what the markets charge. Know the number before you agree to it."
      />

      {spread && (
        <div className="home-price-grid" style={{ marginBottom: 26 }}>
          <div className="home-price-tile">
            <span className="home-price-label">Farmer is paid for palay</span>
            <span className="home-price-value">{php(spread.farmgatePalay)}<small>/kg</small></span>
            <span className="home-price-note">{periodLabel(spread.farmgatePeriod)}</span>
          </div>
          <div className="home-price-tile">
            <span className="home-price-label">Market charges for rice</span>
            <span className="home-price-value">{php(spread.retailRiceAverage)}<small>/kg</small></span>
            <span className="home-price-note">Regular milled, average of Isabela markets</span>
          </div>
          <div className="home-price-tile home-price-tile--market">
            <span className="home-price-label">Difference</span>
            <span className="home-price-value">{php(spread.spread)}<small>/kg</small></span>
            <span className="home-price-note">
              Palay and milled rice are different goods — an indication, not a margin.
            </span>
          </div>
        </div>
      )}

      <h2 className="sectionhead">Farmgate — what the farmer is paid</h2>
      <ul className="cardlist cardlist--grid">
        {data.farmgate.series.map((s) => {
          const recent = s.points.slice(-24).map((p) => p.price);
          const low = Math.min(...recent);
          const high = Math.max(...recent);
          return (
            <li key={s.commodity} className="card">
              <div className="card-main">
                <h3 className="card-title">{s.label}</h3>
                <p className="card-price card-price--lg">
                  {s.latest ? php(s.latest.price) : '—'}<span className="muted" style={{ fontSize: '.5em' }}>/kg</span>
                </p>
                <p className="card-meta">
                  <span>{periodLabel(s.latest?.period)}</span>
                  <span className="muted">
                    {s.points.length} months · low {php(low)} · high {php(high)}
                  </span>
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <h2 className="sectionhead">Market — what the public markets charge</h2>
      {data.retail?._asOf && <p className="muted">Prices as of <strong>{data.retail._asOf}</strong></p>}
      {(data.retail?.categories ?? []).filter((c) => c.items.length).map((cat) => {
        const markets = [...new Set(cat.items.flatMap((i) => i.markets.map((m) => m.market)))];
        return (
          <div key={cat.category} className="price-table-wrap" style={{ marginBottom: 20 }}>
            <table className="price-table">
              <caption>{cat.label}</caption>
              <thead>
                <tr>
                  <th scope="col">Commodity</th>
                  {markets.map((m) => (
                    <th key={m} scope="col">{m.replace(/\s*PUBLIC MARKET$/i, '')}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cat.items.map((item) => {
                  const prices = item.markets.map((m) => m.price);
                  const min = Math.min(...prices);
                  const max = Math.max(...prices);
                  const comparable = prices.length > 1 && min !== max;
                  return (
                    <tr key={item.commodity}>
                      <th scope="row">
                        {item.commodity}
                        {item.specification && <small>{item.specification}</small>}
                      </th>
                      {markets.map((name) => {
                        const hit = item.markets.find((m) => m.market === name);
                        if (!hit) return <td key={name} className="price-na">—</td>;
                        const cls = !comparable ? '' : hit.price === min ? ' price-low' : hit.price === max ? ' price-high' : '';
                        return <td key={name} className={`price-num${cls}`}>₱{hit.price.toFixed(0)}</td>;
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}

      <div className="footnote">
        Sources:{' '}
        <a href={data.farmgate._source} target="_blank" rel="noopener noreferrer">{data.farmgate._sourceName}</a>
        {data.retail && <> · <a href={data.retail._source} target="_blank" rel="noopener noreferrer">{data.retail._sourceName}</a></>}
        {data._generated && <> · rebuilt {new Date(data._generated).toLocaleString('en-PH')}</>}
        <p>
          Republished from official sources without alteration. A reference, not an offer — always
          confirm with the buyer or market before deciding.
        </p>
      </div>
    </main>
  );
}
