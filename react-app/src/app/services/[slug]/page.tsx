import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import {
  canonicalServiceSlug,
  getServiceDetail,
  getServices,
  serviceDetailRoutes,
} from '@/lib/static-data';
import ServiceBlocks from '@/components/app/ServiceBlocks';
import JsonLd from '@/components/seo/JsonLd';
import { governmentServiceSchema, breadcrumbSchema } from '@/lib/schema';

// Curated reference content — it only changes when the data file is regenerated
// and redeployed, so there is nothing to revalidate against.
export const revalidate = false;
export const dynamicParams = false;

export function generateStaticParams() {
  return serviceDetailRoutes().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const detail = getServiceDetail(canonicalServiceSlug(slug) ?? slug);
  if (!detail) return { title: 'Service not found' };
  return {
    title: detail.title,
    description: detail.description,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const alias = canonicalServiceSlug(slug);
  if (alias) redirect(`/services/${alias}`);

  const detail = getServiceDetail(slug);
  if (!detail) notFound();

  const { services } = await getServices();
  const listed = services.find((s) => s.detailSlug === slug);
  const related = services
    .filter((s) => s.detailSlug && s.detailSlug !== slug && s.category === listed?.category)
    .slice(0, 4);

  return (
    <main className="wrap">
      <JsonLd
        data={[
          governmentServiceSchema({
            title: detail.title,
            description: detail.description,
            category: detail.category,
            phones: detail.contact.phones,
            emails: detail.contact.emails,
            path: `/services/${detail.slug}`,
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Services', path: '/services' },
            { name: detail.title, path: `/services/${detail.slug}` },
          ]),
        ]}
      />
      <p className="crumb">
        <a href="/services">← All services</a>
      </p>

      <header className="pagehead">
        {detail.category && <span className="chip">{detail.category}</span>}
        <h1>{detail.title}</h1>
        {detail.description && <p className="pagehead-lead">{detail.description}</p>}
      </header>

      {detail.stats.length > 0 && (
        <ul className="statstrip statstrip--lg">
          {detail.stats.map((s, i) => (
            <li key={i}>
              <span className="statstrip-l">{s.label}</span>
              <span className="statstrip-n">{s.value}</span>
              {s.note && <span className="statstrip-s">{s.note}</span>}
            </li>
          ))}
        </ul>
      )}

      {detail.sections.map((section, i) => (
        <section key={i} className="dsection">
          {section.heading && <h2 className="sectionhead">{section.heading}</h2>}
          {section.lead && <p className="muted dsection-lead">{section.lead}</p>}
          <ServiceBlocks blocks={section.blocks} />
        </section>
      ))}

      {(detail.contact.phones?.length || detail.contact.emails?.length) && (
        <section className="dsection">
          <h2 className="sectionhead">Contact</h2>
          <dl className="dcontact">
            {detail.contact.phones?.length ? (
              <div>
                <dt>Phone</dt>
                <dd>
                  {detail.contact.phones.map((p, i) => (
                    <span key={i} className="dcontact-item">
                      <a href={`tel:${p.replace(/[^\d+]/g, '')}`}>{p}</a>
                    </span>
                  ))}
                </dd>
              </div>
            ) : null}
            {detail.contact.emails?.length ? (
              <div>
                <dt>Email</dt>
                <dd>
                  {detail.contact.emails.map((e, i) => (
                    <span key={i} className="dcontact-item">
                      <a href={`mailto:${e}`}>{e}</a>
                    </span>
                  ))}
                </dd>
              </div>
            ) : null}
          </dl>
        </section>
      )}

      {related.length > 0 && (
        <section className="dsection">
          <h2 className="sectionhead">Related services</h2>
          <ul className="plainlist">
            {related.map((s) => (
              <li key={s.id}>
                <a href={`/services/${s.detailSlug}`}>{s.title}</a>
                <span className="muted"> — {s.description}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="footnote">
        Migrated from the provincial Citizen&rsquo;s Charter. Fees and processing times change —
        confirm with the handling office before travelling.
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
