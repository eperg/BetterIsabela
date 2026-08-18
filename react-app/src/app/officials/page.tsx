import { listOfficials, listTowns } from '@/lib/queries';
import { PageHeader, Empty, Stars } from '@/components/app/ui';
import JsonLd from '@/components/seo/JsonLd';
import { collectionPageSchema } from '@/lib/schema';

export const metadata = {
  title: 'Public officials',
  description:
    'Directory of public officials serving the Province of Isabela and its towns — positions, ' +
    'offices, and resident ratings and reviews. Find and rate the officials who serve your town.',
  alternates: { canonical: '/officials' },
};

export const revalidate = 900;


export default async function OfficialsPage({
  searchParams,
}: {
  searchParams: Promise<{ town?: string }>;
}) {
  const { town } = await searchParams;
  const scope = town === 'provincial' ? null : town;
  const [people, towns] = await Promise.all([
    listOfficials({ townSlug: scope }),
    listTowns(),
  ]);
  // Filtered views are not the canonical page, so they do not advertise a list,
  // and an empty board has no list worth advertising.
  const unfiltered = !town;

  return (
    <main className="wrap">
      {unfiltered && people.length > 0 && (
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

      <form className="filterbar" method="get">
        <label>
          Scope
          <select name="town" defaultValue={town ?? ''}>
            <option value="">Everyone</option>
            <option value="provincial">Provincial officials</option>
            {towns.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
          </select>
        </label>
        <button type="submit" className="btn btn--sm">Filter</button>
      </form>

      {people.length === 0 ? (
        <Empty>No officials listed for that scope.</Empty>
      ) : (
        <ul className="cardlist cardlist--grid">
          {people.map((o) => (
            <li key={o.id} className="card">
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
