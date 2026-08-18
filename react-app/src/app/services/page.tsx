import { getServices } from '@/lib/static-data';
import { PageHeader, Empty } from '@/components/app/ui';
import JsonLd from '@/components/seo/JsonLd';
import { collectionPageSchema } from '@/lib/schema';

export const revalidate = 3600;


export const metadata = {
  title: 'Provincial services',
  description:
    'Every service offered by the Province of Isabela — requirements, fees, processing time and the office that handles it.',
  alternates: { canonical: '/services' },
};

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;
  const { services, total, withDetail, categories } = await getServices();

  const needle = (q ?? '').trim().toLowerCase();
  const shown = services.filter((s) => {
    if (category && s.categoryId !== category) return false;
    if (!needle) return true;
    return (
      s.title.toLowerCase().includes(needle) ||
      s.description.toLowerCase().includes(needle) ||
      (s.office ?? '').toLowerCase().includes(needle) ||
      (s.keywords ?? []).some((k) => k.toLowerCase().includes(needle))
    );
  });

  // Filtered and searched views are not the canonical page, so they do not
  // advertise a list. Only services with a detail page have a URL to list.
  const unfiltered = !category && !needle;

  return (
    <main className="wrap">
      {unfiltered && services.length > 0 && (
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

      <form className="filterbar" method="get">
        <label>
          Search
          <input
            type="search"
            name="q"
            defaultValue={q ?? ''}
            placeholder="e.g. birth certificate, business permit"
          />
        </label>
        <label>
          Category
          <select name="category" defaultValue={category ?? ''}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.count})
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn btn--sm">
          Filter
        </button>
        {(category || q) && (
          <a className="btn btn--sm" href="/services">
            Clear
          </a>
        )}
      </form>

      <p className="resultcount">
        {shown.length === total
          ? `${total} services`
          : `${shown.length} of ${total} services`}
      </p>

      {shown.length === 0 ? (
        <Empty>Nothing matches that search. Try a broader term.</Empty>
      ) : (
        <ul className="cardlist cardlist--grid">
          {shown.map((s) => (
            <li key={s.id} className="card">
              <div className="card-main">
                <h2 className="card-title">
                  {s.detailSlug ? (
                    <a href={`/services/${s.detailSlug}`}>{s.title}</a>
                  ) : (
                    s.title
                  )}
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

      <div className="footnote">
        Service details are migrated from the provincial Citizen&rsquo;s Charter. Fees and
        processing times change — confirm with the handling office before travelling.
        <p>
          <a
            href="https://provinceofisabela.gov.ph/transparency/citizens-charter/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Official Citizen&rsquo;s Charter
          </a>
        </p>
      </div>
    </main>
  );
}
