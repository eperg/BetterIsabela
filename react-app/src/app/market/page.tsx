import { Suspense } from 'react';
import { listListings, listTowns, listingCategories } from '@/lib/queries';
import { PageHeader, Empty, peso, since } from '@/components/app/ui';
import ReportButton from '@/components/app/ReportButton';
import ListFilter from '@/components/app/ListFilter';
import JsonLd from '@/components/seo/JsonLd';
import { collectionPageSchema } from '@/lib/schema';

export const metadata = {
  title: 'Buy & sell',
  description:
    'Local buy & sell marketplace for Isabela — furniture, electronics, vehicles, farm goods and ' +
    'more, listed by residents across the province’s towns.',
  alternates: { canonical: '/market' },
};

// Prerendered and revalidated; town and category are applied in the browser.
export const revalidate = 300;

export default async function MarketPage() {
  const [items, towns, cats] = await Promise.all([
    listListings(),
    listTowns(),
    listingCategories(),
  ]);

  return (
    <main className="wrap">
      {items.length > 0 && (
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

      <Suspense fallback={null}>
        <ListFilter
          targetId="marketboard"
          facets={[
            {
              key: 'town',
              label: 'Town',
              all: 'Anywhere',
              options: towns.map((t) => ({ value: t.slug, label: t.name })),
            },
            {
              key: 'category',
              label: 'Category',
              all: 'All',
              options: cats.map((c) => ({
                value: c.category,
                label: `${c.category} (${c.n})`,
              })),
            },
          ]}
          rows={items.map((l) => ({ town: l.townSlug, category: l.category }))}
          emptyMessage="Nothing listed for that filter yet."
        />
      </Suspense>

      {items.length === 0 ? (
        <Empty>Nothing listed here yet.</Empty>
      ) : (
        <ul className="cardlist cardlist--grid" id="marketboard">
          {items.map((l) => (
            <li key={l.id} className="card" data-town={l.townSlug} data-category={l.category}>
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
