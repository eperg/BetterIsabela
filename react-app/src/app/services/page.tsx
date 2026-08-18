import { Suspense } from 'react';
import { getServices } from '@/lib/static-data';
import { PageHeader, Empty } from '@/components/app/ui';
import ListFilter from '@/components/app/ListFilter';
import JsonLd from '@/components/seo/JsonLd';
import { collectionPageSchema } from '@/lib/schema';

export const metadata = {
  title: 'Provincial services',
  description:
    'Every service offered by the Province of Isabela — requirements, fees, processing time and the office that handles it.',
  alternates: { canonical: '/services' },
};

// Curated reference data, so this is prerendered outright. Search and category
// are applied in the browser, which also makes them instant.
export const revalidate = 3600;

export default async function ServicesPage() {
  const { services, total, withDetail, categories } = await getServices();

  return (
    <main className="wrap">
      {services.length > 0 && (
        <JsonLd
          data={collectionPageSchema({
            name: 'Provincial services (Province of Isabela)',
            description:
              `Every service offered by the Province of Isabela: requirements, fees, processing ` +
              `time and the office that handles it. ${withDetail} of ${total} have a full ` +
              `step-by-step guide.`,
            path: '/services',
            items: services
              .filter((s) => s.detailSlug)
              .map((s) => ({ name: s.title, path: `/services/${s.detailSlug}` })),
          })}
        />
      )}
      <PageHeader
        title="Provincial services"
        lead={`${total} services offered across the Province of Isabela — what each one costs, how long it takes, and which office handles it. ${withDetail} have a full step-by-step guide.`}
      />

      <Suspense fallback={null}>
        <ListFilter
          targetId="servicelist"
          search={{ key: 'q', label: 'Search', placeholder: 'e.g. birth certificate, business permit' }}
          facets={[
            {
              key: 'category',
              label: 'Category',
              all: 'All categories',
              options: categories.map((c) => ({
                value: c.id,
                label: `${c.name} (${c.count})`,
              })),
            },
          ]}
          rows={services.map((s) => ({
            category: s.categoryId,
            search: searchText(s),
          }))}
          countNoun="services"
          emptyMessage="Nothing matches that search. Try a broader term."
        />
      </Suspense>

      {services.length === 0 ? (
        <Empty>No services are listed yet.</Empty>
      ) : (
        <ul className="cardlist cardlist--grid" id="servicelist">
          {services.map((s) => (
            <li key={s.id} className="card" data-category={s.categoryId} data-search={searchText(s)}>
              <div className="card-main">
                <h2 className="card-title">
                  {s.detailSlug ? <a href={`/services/${s.detailSlug}`}>{s.title}</a> : s.title}
                </h2>
                <p className="card-desc">{s.description}</p>
                <dl className="svc-facts">
                  {s.fee && (
                    <div>
                      <dt>Fee</dt>
                      <dd>{s.fee}</dd>
                    </div>
                  )}
                  {s.processingTime && (
                    <div>
                      <dt>Processing</dt>
                      <dd>{s.processingTime}</dd>
                    </div>
                  )}
                </dl>
              </div>
              <div className="card-actions">
                <span className="chip">{s.category}</span>
                {s.office && <span className="muted svc-office">{s.office}</span>}
                {s.detailSlug && (
                  <a className="card-guide" href={`/services/${s.detailSlug}`}>
                    Full guide →
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

/**
 * Everything a reader might type, flattened and normalised the same way the
 * search box normalises the query, so a CSS substring match behaves like a
 * search rather than a coincidence.
 */
function searchText(s: {
  title: string;
  description: string;
  office?: string;
  keywords?: string[];
}): string {
  return [s.title, s.description, s.office ?? '', ...(s.keywords ?? [])]
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
