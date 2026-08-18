import { Suspense } from 'react';
import { listOfficials, listTowns } from '@/lib/queries';
import { PageHeader, Empty, Stars } from '@/components/app/ui';
import ListFilter from '@/components/app/ListFilter';
import JsonLd from '@/components/seo/JsonLd';
import { collectionPageSchema } from '@/lib/schema';

export const metadata = {
  title: 'Public officials',
  description:
    'Directory of public officials serving the Province of Isabela and its towns — positions, ' +
    'offices, and resident ratings and reviews. Find and rate the officials who serve your town.',
  alternates: { canonical: '/officials' },
};

// Prerendered and revalidated; the scope filter is applied in the browser.
export const revalidate = 900;

/** Provincial officials have no town, so they get their own facet value. */
const PROVINCIAL = 'provincial';

export default async function OfficialsPage() {
  const [people, towns] = await Promise.all([listOfficials(), listTowns()]);

  return (
    <main className="wrap">
      {people.length > 0 && (
        <JsonLd
          data={collectionPageSchema({
            name: 'Public officials (Province of Isabela)',
            description:
              'Directory of the public officials serving the Province of Isabela and its towns, ' +
              'with position, office and resident ratings.',
            path: '/officials',
            items: people.map((o) => ({
              name: `${o.name}, ${o.position}`,
              path: `/officials/${o.id}`,
            })),
          })}
        />
      )}
      <PageHeader
        title="Public officials"
        lead="Rate and review the officials serving your town. One rating per person, per official."
      />

      <Suspense fallback={null}>
        <ListFilter
          targetId="officialslist"
          facets={[
            {
              key: 'town',
              label: 'Scope',
              all: 'Everyone',
              options: [
                { value: PROVINCIAL, label: 'Provincial officials' },
                ...towns.map((t) => ({ value: t.slug, label: t.name })),
              ],
            },
          ]}
          rows={people.map((o) => ({ town: o.townSlug ?? PROVINCIAL }))}
          emptyMessage="No officials listed for that scope."
        />
      </Suspense>

      {people.length === 0 ? (
        <Empty>No officials listed yet.</Empty>
      ) : (
        <ul className="cardlist cardlist--grid" id="officialslist">
          {people.map((o) => (
            <li key={o.id} className="card" data-town={o.townSlug ?? PROVINCIAL}>
              <div className="card-main">
                <h2 className="card-title">
                  <a href={`/officials/${o.id}`}>{o.name}</a>
                </h2>
                <p className="card-sub">
                  {o.position}
                  {o.townName ? ` · ${o.townName}` : ' · Province of Isabela'}
                </p>
                <p className="card-meta">
                  <Stars sum={o.ratingSum} count={o.ratingCount} />
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="footnote">
        Ratings and reviews are the opinions of the citizens who wrote them, published as submitted.
        Report anything defamatory or untrue and a moderator will review it.
      </p>
    </main>
  );
}
