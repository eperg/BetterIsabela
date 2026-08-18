import { listQuestions, listTowns } from '@/lib/queries';
import { PageHeader, Empty, since } from '@/components/app/ui';
import JsonLd from '@/components/seo/JsonLd';
import { collectionPageSchema } from '@/lib/schema';

export const metadata = {
  title: 'Ask & answer',
  description:
    'Community questions and answers about living in Isabela — government services, documents, ' +
    'schools, transport and more. Ask a question or help answer your neighbours’.',
  alternates: { canonical: '/ask' },
};

export const revalidate = 300;


export default async function AskPage({
  searchParams,
}: {
  searchParams: Promise<{ town?: string }>;
}) {
  const { town } = await searchParams;
  const [items, towns] = await Promise.all([listQuestions({ townSlug: town }), listTowns()]);
  // Filtered views are not the canonical page, so they do not advertise a list.
  const unfiltered = !town;

  return (
    <main className="wrap">
      {unfiltered && (
        <JsonLd
          data={collectionPageSchema({
            name: 'Ask & answer (Province of Isabela)',
            description:
              'Questions from residents of Isabela about government services, requirements and ' +
              'processes, answered by neighbours and by LGU staff.',
            path: '/ask',
            items: items.map((q) => ({ name: q.title, path: `/ask/${q.id}` })),
          })}
        />
      )}
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
