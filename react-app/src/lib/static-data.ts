/**
 * Reference datasets curated on the static site and mirrored into this app's
 * public/data directory. Read on the server, cached per process.
 *
 * Several of these are deliberately empty: the rebrand audit cleared any record
 * that could not be traced to a named source. Callers must handle that rather
 * than assume content, which is why every accessor reports a status.
 */
import 'server-only';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import serviceDetailData from '@/data/service-details.json';

const cache = new Map<string, unknown>();

async function load<T>(name: string): Promise<T | null> {
  if (cache.has(name)) return cache.get(name) as T;
  try {
    const raw = await readFile(join(process.cwd(), 'public', 'data', `${name}.json`), 'utf8');
    const parsed = JSON.parse(raw) as T;
    cache.set(name, parsed);
    return parsed;
  } catch {
    return null;
  }
}

export interface Demographics {
  province: string;
  region: string;
  population: { total: number; year: number; source: string };
  land_area_km2: number;
  city_count: number;
  municipality_count: number;
  barangay_count: number;
  income_class: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  category: string;
  categoryId: string;
  description: string;
  office?: string;
  fee?: string;
  processingTime?: string;
  keywords?: string[];
  url?: string;
}

export const getDemographics = () => load<Demographics>('demographics');

/** The old site's `url` field, resolved to an in-app detail slug if there is one. */
function detailSlugFor(service: ServiceItem): string | undefined {
  const match = /service-details\/([a-z0-9-]+)\.html/.exec(service.url ?? '');
  const slug = match?.[1];
  return slug && serviceDetailSlugs.has(slug) ? slug : undefined;
}

export async function getServices() {
  const data = await load<{ services: ServiceItem[] }>('services');
  const services = (data?.services ?? []).map((s) => ({ ...s, detailSlug: detailSlugFor(s) }));

  // Grouped by categoryId, not the display name: the name is filtered through
  // the URL and several contain "&" and "," which do not survive a redirect
  // intact. The id is already a slug.
  const byCategory = new Map<string, { id: string; name: string; count: number }>();
  for (const s of services) {
    const entry = byCategory.get(s.categoryId) ?? { id: s.categoryId, name: s.category, count: 0 };
    entry.count += 1;
    byCategory.set(s.categoryId, entry);
  }
  return {
    services,
    total: services.length,
    withDetail: services.filter((s) => s.detailSlug).length,
    categories: [...byCategory.values()].sort((a, b) => b.count - a.count),
  };
}

// ---------------------------------------------------------------------------
// Service detail pages
// ---------------------------------------------------------------------------

/**
 * Migrated from the 22 legacy service-details/*.html pages by
 * scripts/migration/extract-service-details.cjs. Structured rather than raw
 * HTML, so the app renders it in its own design and nothing unescaped crosses
 * the boundary. Re-run the script if those source pages change.
 */
export type ServiceBlock =
  | { type: 'stats'; items: { label: string; value: string; note?: string }[] }
  | { type: 'checklist'; title?: string; items: string[] }
  | { type: 'table'; caption?: string; head: string[]; rows: string[][] }
  | {
      type: 'cards';
      items: {
        step?: string;
        title?: string;
        body?: string[];
        bullets?: string[];
        meta?: string[];
      }[];
    }
  | { type: 'contact'; items: { label: string; value: string }[] }
  | { type: 'subheading'; text: string }
  | { type: 'prose'; title?: string; text: string[] }
  | { type: 'tablabels'; labels: string[] }
  | { type: 'group'; blocks: ServiceBlock[] };

export interface ServiceDetail {
  slug: string;
  title: string;
  category?: string;
  description?: string;
  stats: { label: string; value: string; note?: string }[];
  sections: { heading?: string; lead?: string; blocks: ServiceBlock[] }[];
  contact: { phones?: string[]; emails?: string[] };
  /** Retired slugs that now redirect here — see the MERGE note in the extractor. */
  aliases?: string[];
}

const serviceDetails = serviceDetailData as ServiceDetail[];
const serviceDetailSlugs = new Set(serviceDetails.map((d) => d.slug));

export const listServiceDetails = () => serviceDetails;
export const getServiceDetail = (slug: string) =>
  serviceDetails.find((d) => d.slug === slug) ?? null;

/** The canonical slug an alias points at, or null if it is not an alias. */
export const canonicalServiceSlug = (slug: string) =>
  serviceDetails.find((d) => d.aliases?.includes(slug))?.slug ?? null;

/** Every routable slug: canonical pages plus the aliases that redirect to them. */
export const serviceDetailRoutes = () =>
  serviceDetails.flatMap((d) => [d.slug, ...(d.aliases ?? [])]);

/** Both feeds were cleared during the rebrand audit; status says so explicitly. */
export async function getLegislative() {
  const [ord, res] = await Promise.all([
    load<{ ordinances: unknown[]; _status?: string; _source?: string }>('ordinances'),
    load<{ resolutions: unknown[]; _status?: string; _source?: string }>('resolutions'),
  ]);
  return {
    ordinances: ord?.ordinances?.length ?? 0,
    resolutions: res?.resolutions?.length ?? 0,
    pending: ord?._status === 'migration_pending' || res?._status === 'migration_pending',
    source: ord?._source ?? 'https://provinceofisabela.gov.ph/ordinanceresolution/',
  };
}

export async function getTransparency() {
  const data = await load<{ fiscal_years: unknown[]; _status?: string }>('fiscal_transparency');
  return {
    years: data?.fiscal_years?.length ?? 0,
    pending: (data?.fiscal_years?.length ?? 0) === 0,
    status: data?._status ?? 'unknown',
  };
}

export interface CmciIndicator {
  name: string;
  values: (number | null)[];
}
export interface CmciPillar {
  id: string;
  name: string;
  indicators: CmciIndicator[];
}

/**
 * DTI's Cities and Municipalities Competitiveness Index, 2016-2024.
 *
 * The published indicator scores are NOT normalised to 0-1 — they run past 3 in
 * this dataset — so nothing here may present them on a 0-1 scale. Bars are drawn
 * relative to the highest pillar score in the same year, and `scaleMax` is
 * exposed so the caller can say so rather than implying an absolute maximum.
 * A missing year is null, never zero.
 */
export async function getCompetitiveIndex() {
  const data = await load<{
    title: string;
    source: string;
    years: number[];
    pillars: CmciPillar[];
    keyIndicators?: CmciIndicator[];
  }>('competitive-index');
  if (!data) return null;

  /** Mean of a pillar's indicators for a given year, ignoring gaps. */
  const pillarScore = (pillar: CmciPillar, yearIndex: number) => {
    const values = pillar.indicators
      .map((i) => i.values[yearIndex])
      .filter((v): v is number => typeof v === 'number');
    if (!values.length) return null;
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  const lastIndex = data.years.length - 1;
  const pillarScores = data.pillars.map((pillar) => ({
    id: pillar.id,
    name: pillar.name,
    series: data.years.map((_, i) => pillarScore(pillar, i)),
    latest: pillarScore(pillar, lastIndex),
  }));

  const latestValues = pillarScores
    .map((p) => p.latest)
    .filter((v): v is number => typeof v === 'number');

  return {
    title: data.title,
    source: data.source,
    years: data.years,
    pillars: data.pillars,
    keyIndicators: data.keyIndicators ?? [],
    latestYear: data.years[lastIndex],
    pillarScores,
    /** Highest pillar score this year — the reference the bars are drawn against. */
    scaleMax: latestValues.length ? Math.max(...latestValues) : 1,
  };
}

export interface TownRow {
  slug: string;
  name: string;
  lguType: string | null;
  incomeClass: string | null;
  barangays: number | null;
  population: number | null;
  households: number | null;
  landAreaHectares: number | null;
  censusYear: number | null;
  market: string | null;
  url: string;
}

export async function getTownTable() {
  const data = await load<{ towns: TownRow[]; _generated?: string; _source?: string }>('towns');
  return {
    towns: data?.towns ?? [],
    source: data?._source ?? 'https://provinceofisabela.gov.ph/citiesmunicipalities/',
  };
}

// ---------------------------------------------------------------------------
// Contacts and news
// ---------------------------------------------------------------------------

export interface ContactEntry {
  id: string;
  name: string;
  landline?: string;
  tel?: string;
  display?: string;
  icon?: string;
  emergency?: string;
  emergencyDisplay?: string;
}

/**
 * The canonical, source-backed provincial directory. Every entry came from the
 * official directory or emergency-hotlines page and carries a verification date.
 */
export async function getContacts() {
  const data = await load<{
    emergency: ContactEntry[];
    offices: ContactEntry[];
    hospitals: ContactEntry[];
    _source: string;
    _hotline_source: string;
    _verified: string;
  }>('contacts');
  return {
    emergency: data?.emergency ?? [],
    offices: data?.offices ?? [],
    hospitals: data?.hospitals ?? [],
    source: data?._source ?? 'https://provinceofisabela.gov.ph/directory/',
    hotlineSource: data?._hotline_source ?? 'https://provinceofisabela.gov.ph/emergency-hotlines/',
    verified: data?._verified ?? null,
  };
}

export interface NewsItem {
  id?: string;
  title: string;
  summary?: string;
  date?: string;
  category?: string;
  badge?: string;
  url?: string;
  link?: string;
  source?: string;
}

export async function getNews() {
  const data = await load<{ news: NewsItem[]; _source?: string }>('news');
  const items = [...(data?.news ?? [])].sort((a, b) =>
    String(b.date ?? '').localeCompare(String(a.date ?? ''))
  );
  return { items, source: data?._source ?? null };
}
