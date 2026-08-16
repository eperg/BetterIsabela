import { listQuestions, listTowns } from '@/lib/queries';
import { PageHeader, Empty, since } from '@/components/app/ui';

export const revalidate = 300;


export default async function AskPage({
  searchParams,
}: {
  searchParams: Promise<{ town?: string }>;
}) {
  const { town } = await searchParams;
  const [items, towns] = await Promise.all([listQuestions({ townSlug: town }), listTowns()]);

  return (
    <main className="wrap">
      <PageHeader
        title="Ask &amp; answer"
        lead="Questions about government services, requirements and processes — answered by neighbours and by LGU staff."
        action={<a className="btn btn--primary" href="/ask/new">Ask a question</a>}
      />

      <form className="filterbar" method="get">
        <label>
          Town
          <select name="town" defaultValue={town ?? ''}>
            <option value="">All of Isabela</option>
            {towns.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
          </select>
        </label>
        <button type="submit" className="btn btn--sm">Filter</button>
      </form>

      {items.length === 0 ? (
        <Empty>No questions yet. Ask the first one.</Empty>
      ) : (
        <ul className="cardlist cardlist--grid">
          {items.map((q) => (
            <li key={q.id} className="card">
              <div className="card-main">
                <h2 className="card-title">
                  <a href={`/ask/${q.id}`}>{q.title}</a>
                </h2>
                <p className="card-meta">
                  <span className="chip">{q.category}</span>
                  <span>{q.answerCount} {q.answerCount === 1 ? 'answer' : 'answers'}</span>
                  {q.resolvedAt && <span className="chip chip--ok">resolved</span>}
                  <span className="muted">asked by {q.askerName}, {since(q.createdAt)}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
