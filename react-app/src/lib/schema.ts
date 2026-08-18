/**
 * schema.org structured-data builders.
 *
 * These power classic SEO rich results AND answer/generative-engine
 * optimisation (AEO/GEO): Google's AI Overviews, Bing, and LLM answer engines
 * lean on JSON-LD to extract facts they can quote with attribution. Every
 * builder returns a plain object rendered through <JsonLd>; keep them pure and
 * free of markup so they can be unit-tested and reused server-side.
 *
 * All URLs are absolute and derived from one canonical host so structured data
 * never disagrees with the canonical tag or the sitemap.
 */

const SITE = (process.env.SITE_URL ?? 'https://www.betterisabela.org').replace(/\/$/, '');

/** Absolute URL for a site-relative path. */
export const absUrl = (path: string): string =>
  path.startsWith('http') ? path : `${SITE}${path.startsWith('/') ? path : `/${path}`}`;

/** Trim to a clean, single-line summary for description fields. */
export function summarise(text: string, max = 200): string {
  const oneLine = text.replace(/\s+/g, ' ').trim();
  if (oneLine.length <= max) return oneLine;
  return `${oneLine.slice(0, max - 1).trimEnd()}…`;
}

const peso = (centavos: number): string => (centavos / 100).toFixed(2);

const ORG_ID = `${SITE}/#organization`;
const WEBSITE_ID = `${SITE}/#website`;

/**
 * The province as a GovernmentOrganization. Referenced by @id from every other
 * node (publisher, worksFor, provider) so the graph resolves to one entity.
 */
export function organizationSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'GovernmentOrganization',
    '@id': ORG_ID,
    name: 'Provincial Government of Isabela',
    alternateName: 'BetterIsabela.org',
    url: SITE,
    logo: {
      '@type': 'ImageObject',
      url: absUrl('/assets/images/logo/favicon.svg'),
    },
    image: absUrl('/assets/images/banners/opengraph.png'),
    description:
      'Official civic portal for the Province of Isabela, Philippines: government services, ' +
      'public officials, the Citizen’s Charter, local jobs, market listings, and price monitoring.',
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Province of Isabela',
      containedInPlace: { '@type': 'Country', name: 'Philippines' },
    },
    address: {
      '@type': 'PostalAddress',
      addressRegion: 'Isabela',
      addressCountry: 'PH',
    },
  };
}

/** The site itself, tied to the publishing organisation. */
export function websiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE,
    name: 'BetterIsabela.org',
    inLanguage: 'en-PH',
    publisher: { '@id': ORG_ID },
  };
}

export interface Crumb {
  name: string;
  path: string;
}

/** Ordered trail from the site root to the current page. */
export function breadcrumbSchema(crumbs: Crumb[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absUrl(c.path),
    })),
  };
}

// ---------------------------------------------------------------------------
// Entity builders — each takes already-fetched data, no DB access here.
// ---------------------------------------------------------------------------

export interface PersonInput {
  name: string;
  position: string;
  office?: string | null;
  townName?: string | null;
  photoUrl?: string | null;
  ratingCount: number;
  ratingSum: number;
  path: string;
}

export function personSchema(o: PersonInput): Record<string, unknown> {
  const node: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: o.name,
    jobTitle: o.position,
    url: absUrl(o.path),
    worksFor: { '@id': ORG_ID },
    memberOf: { '@id': ORG_ID },
    ...(o.office ? { affiliation: o.office } : {}),
    ...(o.townName ? { workLocation: { '@type': 'Place', name: o.townName } } : {}),
    ...(o.photoUrl ? { image: absUrl(o.photoUrl) } : {}),
  };
  if (o.ratingCount > 0) {
    node.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: (o.ratingSum / o.ratingCount).toFixed(1),
      reviewCount: o.ratingCount,
      bestRating: 5,
      worstRating: 1,
    };
  }
  return node;
}

export interface JobInput {
  title: string;
  employer: string;
  description: string;
  salaryMinCentavos?: number | null;
  salaryMaxCentavos?: number | null;
  townName?: string | null;
  createdAt: Date;
  path: string;
}

export function jobPostingSchema(j: JobInput): Record<string, unknown> {
  const node: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: j.title,
    description: summarise(j.description, 500),
    datePosted: j.createdAt.toISOString(),
    hiringOrganization: {
      '@type': 'Organization',
      name: j.employer,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        ...(j.townName ? { addressLocality: j.townName } : {}),
        addressRegion: 'Isabela',
        addressCountry: 'PH',
      },
    },
    url: absUrl(j.path),
    directApply: false,
  };
  const min = j.salaryMinCentavos ?? undefined;
  const max = j.salaryMaxCentavos ?? undefined;
  if (min || max) {
    node.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: 'PHP',
      value: {
        '@type': 'QuantitativeValue',
        ...(min ? { minValue: Number(peso(min)) } : {}),
        ...(max ? { maxValue: Number(peso(max)) } : {}),
        unitText: 'MONTH',
      },
    };
  }
  return node;
}

export interface ListingInput {
  title: string;
  description: string;
  category?: string | null;
  priceCentavos?: number | null;
  condition?: string | null;
  townName?: string | null;
  path: string;
}

/** Maps free-text condition to a schema.org OfferItemCondition, when recognisable. */
function offerCondition(condition?: string | null): string | undefined {
  switch ((condition ?? '').toLowerCase()) {
    case 'new':
      return 'https://schema.org/NewCondition';
    case 'used':
    case 'second-hand':
    case 'secondhand':
      return 'https://schema.org/UsedCondition';
    case 'refurbished':
      return 'https://schema.org/RefurbishedCondition';
    default:
      return undefined;
  }
}

export function productSchema(l: ListingInput): Record<string, unknown> {
  const cond = offerCondition(l.condition);
  const offer: Record<string, unknown> = {
    '@type': 'Offer',
    priceCurrency: 'PHP',
    availability: 'https://schema.org/InStock',
    ...(l.priceCentavos != null ? { price: peso(l.priceCentavos) } : {}),
    ...(cond ? { itemCondition: cond } : {}),
    ...(l.townName
      ? { areaServed: { '@type': 'Place', name: `${l.townName}, Isabela` } }
      : {}),
  };
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: l.title,
    description: summarise(l.description, 400),
    url: absUrl(l.path),
    ...(l.category ? { category: l.category } : {}),
    ...(cond ? { itemCondition: cond } : {}),
    offers: offer,
  };
}

export interface QaAnswer {
  body: string;
  authorName: string;
  isAccepted: boolean;
  createdAt: Date;
}

export interface QuestionInput {
  title: string;
  body: string;
  askerName: string;
  createdAt: Date;
  answers: QaAnswer[];
  path: string;
}

export function qaPageSchema(q: QuestionInput): Record<string, unknown> {
  const accepted = q.answers.filter((a) => a.isAccepted);
  const suggested = q.answers.filter((a) => !a.isAccepted);
  const toAnswer = (a: QaAnswer) => ({
    '@type': 'Answer',
    text: summarise(a.body, 1200),
    dateCreated: a.createdAt.toISOString(),
    author: { '@type': 'Person', name: a.authorName },
    url: absUrl(q.path),
  });

  const mainEntity: Record<string, unknown> = {
    '@type': 'Question',
    name: q.title,
    text: summarise(q.body, 1000),
    dateCreated: q.createdAt.toISOString(),
    author: { '@type': 'Person', name: q.askerName },
    answerCount: q.answers.length,
    url: absUrl(q.path),
  };
  if (accepted.length) mainEntity.acceptedAnswer = accepted.map(toAnswer);
  if (suggested.length) mainEntity.suggestedAnswer = suggested.map(toAnswer);

  return {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity,
  };
}

export interface ServiceInput {
  title: string;
  description?: string;
  category?: string;
  phones?: string[];
  emails?: string[];
  path: string;
}

export function governmentServiceSchema(s: ServiceInput): Record<string, unknown> {
  const contactPoint =
    s.phones?.length || s.emails?.length
      ? {
          '@type': 'ContactPoint',
          contactType: 'Public service',
          ...(s.phones?.length ? { telephone: s.phones[0] } : {}),
          ...(s.emails?.length ? { email: s.emails[0] } : {}),
        }
      : undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'GovernmentService',
    name: s.title,
    ...(s.description ? { description: summarise(s.description, 300) } : {}),
    ...(s.category ? { serviceType: s.category } : {}),
    url: absUrl(s.path),
    provider: { '@id': ORG_ID },
    areaServed: { '@type': 'AdministrativeArea', name: 'Province of Isabela' },
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: absUrl(s.path),
    },
    ...(contactPoint ? { contactPoint } : {}),
    audience: { '@type': 'Audience', audienceType: 'Residents of Isabela' },
  };
}

/**
 * FAQPage. The single highest-value node for answer engines on this site: it
 * hands them a question and a self-contained answer, which is exactly the unit
 * they quote. Answers must be plain text, so callers flatten prose first.
 */
export function faqPageSchema(
  qas: { question: string; answer: string }[],
  path: string
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    url: absUrl(path),
    inLanguage: 'en-PH',
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORG_ID },
    mainEntity: qas.map((qa) => ({
      '@type': 'Question',
      name: qa.question,
      acceptedAnswer: { '@type': 'Answer', text: qa.answer },
    })),
  };
}

export interface CollectionInput {
  name: string;
  description: string;
  path: string;
  items: { name: string; path: string }[];
}

/**
 * An index page as a CollectionPage wrapping an ItemList. Without this an
 * answer engine sees a set of unrelated detail pages; with it, it can name the
 * collection ("jobs in Isabela") and follow the list. Positions are 1-based and
 * reflect the order actually rendered.
 */
export function collectionPageSchema(c: CollectionInput): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: c.name,
    description: summarise(c.description, 300),
    url: absUrl(c.path),
    inLanguage: 'en-PH',
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORG_ID },
    about: { '@id': ORG_ID },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: c.items.length,
      itemListOrder: 'https://schema.org/ItemListOrderDescending',
      itemListElement: c.items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        url: absUrl(item.path),
      })),
    },
  };
}

/**
 * A dataset-style page with no per-item detail URLs (price monitoring, project
 * tracking). Modelled as a Dataset so engines treat the figures as data with a
 * publisher and a coverage area rather than as loose page text.
 */
export function datasetSchema(d: {
  name: string;
  description: string;
  path: string;
  keywords?: string[];
  /** Upstream statistical authority, when the figures are not ours. */
  sourceName?: string;
  sourceUrl?: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: d.name,
    description: summarise(d.description, 300),
    url: absUrl(d.path),
    inLanguage: 'en-PH',
    isAccessibleForFree: true,
    // Attribution matters here: republishing a national statistics agency's
    // figures does not make the province their creator.
    creator: d.sourceName
      ? { '@type': 'Organization', name: d.sourceName, ...(d.sourceUrl ? { url: d.sourceUrl } : {}) }
      : { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    spatialCoverage: { '@type': 'AdministrativeArea', name: 'Province of Isabela' },
    ...(d.keywords?.length ? { keywords: d.keywords } : {}),
  };
}
