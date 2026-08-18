import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getQuestion } from '@/lib/queries';
import { postAnswer } from '@/lib/actions';
import ActionForm from '@/components/app/ActionForm';
import { since } from '@/components/app/ui';
import ReportButton from '@/components/app/ReportButton';
import SignedIn from '@/components/app/SignedIn';
import JsonLd from '@/components/seo/JsonLd';
import { qaPageSchema, breadcrumbSchema, summarise } from '@/lib/schema';

// The question and its answers read the same to everyone; only the answer form
// depends on who is asking, and that resolves client-side. So this is cached.
export const revalidate = 300;

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
  const row = await getQuestion(Number(id));
  if (!row) return { title: 'Question not found' };
  const { question, answers } = row;
  const answered = answers.length
    ? `${answers.length} ${answers.length === 1 ? 'answer' : 'answers'} from the community.`
    : 'Be the first to answer.';
  return {
    title: question.title,
    description: summarise(`${question.body} ${answered}`, 200),
    alternates: { canonical: `/ask/${id}` },
  };
}

export default async function QuestionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await getQuestion(Number(id));
  if (!row) notFound();
  const { question, askerName, answers } = row;

  return (
    <main className="wrap wrap--narrow">
      <JsonLd
        data={[
          qaPageSchema({
            title: question.title,
            body: question.body,
            askerName,
            createdAt: question.createdAt,
            answers: answers.map((a) => ({
              body: a.body,
              authorName: a.authorName,
              isAccepted: a.isAccepted,
              createdAt: a.createdAt,
            })),
            path: `/ask/${question.id}`,
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Ask & answer', path: '/ask' },
            { name: question.title, path: `/ask/${question.id}` },
          ]),
        ]}
      />
      <p className="crumb"><a href="/ask">← Ask &amp; answer</a></p>
      <h1>{question.title}</h1>
      <div className="card-meta">
        <span className="chip">{question.category}</span>
        <span className="muted">asked by {askerName}, {since(question.createdAt)}</span>
        <ReportButton targetType="question" targetId={question.id} />
      </div>
      <div className="prose">{question.body.split('\n').map((p, i) => <p key={i}>{p}</p>)}</div>

      <h2 className="sectionhead">
        {answers.length} {answers.length === 1 ? 'answer' : 'answers'}
      </h2>
      {answers.length === 0 ? (
        <p className="empty">No answers yet.</p>
      ) : (
        <ul className="answerlist">
          {answers.map((a) => (
            <li key={a.id} className={`answer${a.isAccepted ? ' is-accepted' : ''}`}>
              <div className="prose">{a.body.split('\n').map((p, i) => <p key={i}>{p}</p>)}</div>
              <div className="card-meta">
                <span>{a.authorName}</span>
                {a.isOfficial && <span className="chip chip--ok">LGU</span>}
                {a.isAccepted && <span className="chip chip--ok">accepted</span>}
                <span className="muted">{since(a.createdAt)}</span>
                <ReportButton targetType="answer" targetId={a.id} />
              </div>
            </li>
          ))}
        </ul>
      )}

      <SignedIn fallback={<p className="empty">Sign in to answer.</p>}>
        <>
          <h2 className="sectionhead">Your answer</h2>
          <ActionForm action={postAnswer} submitLabel="Post answer" successMessage="Answer posted." className="stack">
            <input type="hidden" name="questionId" value={question.id} />
            <textarea name="body" required rows={6} maxLength={5000} aria-label="Your answer" />
          </ActionForm>
        </>
      </SignedIn>
    </main>
  );
}
