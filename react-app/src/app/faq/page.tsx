import { FAQ_CATEGORIES, FAQ_LEAD, faqEntries, answerText, asBlocks } from '@/lib/faq-content';
import Prose from '@/components/app/Prose';
import { PageHeader } from '@/components/app/ui';
import JsonLd from '@/components/seo/JsonLd';
import { faqPageSchema, breadcrumbSchema } from '@/lib/schema';

// Static content — fully prerendered, no revalidation needed.
export const revalidate = false;

export const metadata = {
  title: 'Frequently asked questions',
  description:
    'Answers to common questions about Isabela provincial services: Capitol office hours, birth ' +
    'certificates, business permits, real property tax, Senior Citizen IDs and more.',
  alternates: { canonical: '/faq' },
};

export default function Page() {
  return (
    <main className="wrap wrap--narrow">
      <JsonLd
        data={[
          faqPageSchema(
            faqEntries().map((e) => ({ question: e.question, answer: answerText(e.answer) })),
            '/faq'
          ),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Frequently asked questions', path: '/faq' },
          ]),
        ]}
      />
      <PageHeader title="Frequently asked questions" lead={FAQ_LEAD} />

      <div className="faq-container">
        {FAQ_CATEGORIES.map((category) => (
          <section className="faq-category" key={category.name} aria-labelledby={slug(category.name)}>
            <div className="faq-category-header">
              <i className={`bi ${category.icon}`} aria-hidden="true"></i>
              <h2 id={slug(category.name)}>{category.name}</h2>
            </div>
            <div className="faq-list">
              {category.entries.map((entry) => (
                // <details> rather than JS: the answer is in the DOM whether or
                // not it is expanded, so crawlers and answer engines read it.
                <details className="faq-accordion" key={entry.question}>
                  <summary>{entry.question}</summary>
                  <div className="faq-answer">
                    <Prose blocks={asBlocks(entry.answer)} />
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

/** Stable id for the aria-labelledby link between section and heading. */
const slug = (name: string) =>
  `faq-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
