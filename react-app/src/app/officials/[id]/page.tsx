import { notFound } from 'next/navigation';
import { getOfficial } from '@/lib/queries';
import { getCurrentUser } from '@/lib/session';
import { reviewOfficial } from '@/lib/actions';
import ActionForm from '@/components/app/ActionForm';
import RateWidget from '@/components/app/RateWidget';
import ReportButton from '@/components/app/ReportButton';
import { Stars, since } from '@/components/app/ui';

// Reads the signed-in user, so it must render per request.
export const dynamic = 'force-dynamic';


export default async function OfficialDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const row = await getOfficial(Number(id), user?.id);
  if (!row) notFound();
  const { official, townName, reviews, myRating } = row;

  return (
    <main className="wrap wrap--narrow">
      <p className="crumb"><a href="/officials">← Public officials</a></p>
      <h1>{official.name}</h1>
      <p className="card-sub">
        {official.position}
        {townName ? ` · ${townName}` : ' · Province of Isabela'}
      </p>
      {official.office && <p className="muted">{official.office}</p>}

      <section className="panel">
        <Stars sum={official.ratingSum} count={official.ratingCount} />
        <RateWidget officialId={official.id} mine={myRating} signedIn={Boolean(user)} />
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

      {user ? (
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
      ) : (
        <p className="empty">Sign in to rate or review.</p>
      )}

      {official.sourceUrl && (
        <p className="footnote">
          Office details from{' '}
          <a href={official.sourceUrl} target="_blank" rel="noopener noreferrer">the official directory</a>.
        </p>
      )}
    </main>
  );
}
