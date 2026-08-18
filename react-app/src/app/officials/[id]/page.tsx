import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getOfficial } from '@/lib/queries';
import { reviewOfficial } from '@/lib/actions';
import ActionForm from '@/components/app/ActionForm';
import RateWidget from '@/components/app/RateWidget';
import ReportButton from '@/components/app/ReportButton';
import SignedIn from '@/components/app/SignedIn';
import JsonLd from '@/components/seo/JsonLd';
import { personSchema, breadcrumbSchema } from '@/lib/schema';
import { Stars, since } from '@/components/app/ui';

// The page itself is the same for every reader. The two per-user affordances,
// the rating widget and the review form, resolve who is reading client-side, so
// this can be cached instead of rendered per request.
export const revalidate = 900;

/**
 * Empty on purpose, and load-bearing.
 *
 * A dynamic segment with no generateStaticParams at all is served uncached in
 * Next 15, whatever `revalidate` says: verified by watching the response go from
 * `Cache-Control: private, no-store` to `s-maxage`/`x-nextjs-cache: HIT` the
 * moment this function exists. Returning nothing means no page is built ahead of
 * time; each is rendered on first request and cached from then on, which is the
 * right trade for rows that appear and expire constantly.
 */
export function generateStaticParams(): { id: string }[] {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const row = await getOfficial(Number(id));
  if (!row) return { title: 'Official not found' };
  const { official, townName } = row;
  const where = townName ?? 'Province of Isabela';
  const rated =
    official.ratingCount > 0
      ? ` Rated ${(official.ratingSum / official.ratingCount).toFixed(1)}/5 by ${official.ratingCount} ${official.ratingCount === 1 ? 'resident' : 'residents'}.`
      : '';
  return {
    title: `${official.name} — ${official.position}`,
    description: `${official.name}, ${official.position}${official.office ? `, ${official.office}` : ''}, ${where}.${rated} Read reviews and rate this public official on BetterIsabela.`,
    alternates: { canonical: `/officials/${id}` },
  };
}

export default async function OfficialDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await getOfficial(Number(id));
  if (!row) notFound();
  const { official, townName, reviews } = row;

  return (
    <main className="wrap wrap--narrow">
      <JsonLd
        data={[
          personSchema({
            name: official.name,
            position: official.position,
            office: official.office,
            townName,
            photoUrl: official.photoUrl,
            ratingCount: official.ratingCount,
            ratingSum: official.ratingSum,
            path: `/officials/${official.id}`,
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Public officials', path: '/officials' },
            { name: official.name, path: `/officials/${official.id}` },
          ]),
        ]}
      />
      <p className="crumb"><a href="/officials">← Public officials</a></p>
      <h1>{official.name}</h1>
      <p className="card-sub">
        {official.position}
        {townName ? ` · ${townName}` : ' · Province of Isabela'}
      </p>
      {official.office && <p className="muted">{official.office}</p>}

      <section className="panel">
        <Stars sum={official.ratingSum} count={official.ratingCount} />
        <RateWidget officialId={official.id} />
      </section>

      <h2 className="sectionhead">
        {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
      </h2>
      {reviews.length === 0 ? (
        <p className="empty">No reviews yet.</p>
      ) : (
        <ul className="answerlist">
          {reviews.map((r) => (
            <li key={r.id} className="answer">
              <div className="prose">{r.body.split('\n').map((p, i) => <p key={i}>{p}</p>)}</div>
              <div className="card-meta">
                <span>{r.authorName}</span>
                <span className="muted">{since(r.createdAt)}</span>
                <ReportButton targetType="official_review" targetId={r.id} />
              </div>
            </li>
          ))}
        </ul>
      )}

      <SignedIn fallback={<p className="empty">Sign in to write a review.</p>}>
        <>
          <h2 className="sectionhead">Write a review</h2>
          <p className="muted">
            Write about this official&rsquo;s conduct in office. Reviews are published immediately and
            can be taken down if reported and upheld. You are responsible for what you write.
          </p>
          <ActionForm action={reviewOfficial} submitLabel="Publish review" successMessage="Published." className="stack">
            <input type="hidden" name="officialId" value={official.id} />
            <textarea name="body" required rows={5} minLength={10} maxLength={2000} aria-label="Your review" />
          </ActionForm>
        </>
      </SignedIn>

      {official.sourceUrl && (
        <p className="footnote">
          Office details from{' '}
          <a href={official.sourceUrl} target="_blank" rel="noopener noreferrer">the official directory</a>.
        </p>
      )}
    </main>
  );
}
