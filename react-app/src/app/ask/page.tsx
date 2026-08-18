import { Suspense } from 'react';
import { listQuestions, listTowns } from '@/lib/queries';
import { PageHeader, Empty, since } from '@/components/app/ui';
import ListFilter from '@/components/app/ListFilter';
import JsonLd from '@/components/seo/JsonLd';
import { collectionPageSchema } from '@/lib/schema';

export const metadata = {
  title: 'Ask & answer',
  description:
    'Community questions and answers about living in Isabela — government services, documents, ' +
    'schools, transport and more. Ask a question or help answer your neighbours’.',
  alternates: { canonical: '/ask' },
};

// Prerendered and revalidated; the town filter is applied in the browser.
export const revalidate = 300;

export default async function AskPage() {
  const [items, towns] = await Promise.all([listQuestions(), listTowns()]);

  return (
    <main className="wrap">
      {items.length > 0 && (
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

      <Suspense fallback={null}>
        <ListFilter
          targetId="askboard"
          facets={[
            {
              key: 'town',
              label: 'Town',
              all: 'All of Isabela',
              options: towns.map((t) => ({ value: t.slug, label: t.name })),
            },
          ]}
          rows={items.map((q) => ({ town: q.townSlug ?? '' }))}
          emptyMessage="No questions from that town yet. Ask the first one."
        />
      </Suspense>

      {items.length === 0 ? (
        <Empty>No questions yet. Ask the first one.</Empty>
      ) : (
        <ul className="cardlist cardlist--grid" id="askboard">
          {items.map((q) => (
            <li key={q.id} className="card" data-town={q.townSlug ?? ''}>
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
