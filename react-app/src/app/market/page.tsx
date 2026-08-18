import { listListings, listTowns, listingCategories } from '@/lib/queries';
import { PageHeader, Empty, peso, since } from '@/components/app/ui';
import ReportButton from '@/components/app/ReportButton';
import JsonLd from '@/components/seo/JsonLd';
import { collectionPageSchema } from '@/lib/schema';

export const metadata = {
  title: 'Buy & sell',
  description:
    'Local buy & sell marketplace for Isabela — furniture, electronics, vehicles, farm goods and ' +
    'more, listed by residents across the province’s towns.',
  alternates: { canonical: '/market' },
};

export const revalidate = 300;


export default async function MarketPage({
  searchParams,
}: {
  searchParams: Promise<{ town?: string; category?: string }>;
}) {
  const { town, category } = await searchParams;
  const [items, towns, cats] = await Promise.all([
    listListings({ townSlug: town, category }),
    listTowns(),
    listingCategories(),
  ]);
  // Filtered views are not the canonical page, so they do not advertise a list.
  const unfiltered = !town && !category;

  return (
    <main className="wrap">
      {unfiltered && (
        <JsonLd
          data={collectionPageSchema({
            name: 'Buy & sell (Province of Isabela)',
            description:
              'Items for sale across the Province of Isabela: produce, livestock, tools, ' +
              'vehicles, electronics and household goods listed by residents.',
            path: '/market',
            items: items.map((l) => ({ name: l.title, path: `/market/${l.id}` })),
          })}
        />
      )}
      <PageHeader
        title="Buy &amp; sell"
        lead="Goods, tools, livestock and produce, offered by people across Isabela."
        action={<a className="btn btn--primary" href="/market/new">Post a listing</a>}
      />

      <form className="filterbar" method="get">
        <label>
          Town
          <select name="town" defaultValue={town ?? ''}>
            <option value="">Anywhere</option>
            {towns.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
          </select>
        </label>
        <label>
          Category
          <select name="category" defaultValue={category ?? ''}>
            <option value="">All</option>
            {cats.map((c) => <option key={c.category} value={c.category}>{c.category} ({c.n})</option>)}
          </select>
        </label>
        <button type="submit" className="btn btn--sm">Filter</button>
      </form>

      {items.length === 0 ? (
        <Empty>Nothing listed here yet.</Empty>
      ) : (
        <ul className="cardlist cardlist--grid">
          {items.map((l) => (
            <li key={l.id} className="card">
              <div className="card-main">
                <h2 className="card-title">{l.title}</h2>
                <p className="card-price">
                  {l.priceCentavos != null ? peso(l.priceCentavos) : 'Open to offers'}
                  {l.negotiable && l.priceCentavos != null && <span className="muted"> · negotiable</span>}
                </p>
                <p className="card-meta">
                  <span className="chip">{l.category}</span>
                  <span>{l.townName}</span>
                  <span className="muted">{since(l.createdAt)}</span>
                </p>
              </div>
              <div className="card-actions">
                <a className="btn btn--sm" href={`/market/${l.id}`}>View</a>
                <ReportButton targetType="listing" targetId={l.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
