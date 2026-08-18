import type { MetadataRoute } from 'next';
import { listServiceDetails, getServices } from '@/lib/static-data';

/**
 * Generated rather than hand-maintained, so a new service detail page cannot be
 * added without appearing here. Only canonical URLs are listed — alias slugs
 * redirect, and listing a redirect wastes crawl budget.
 *
 * User-generated detail pages (a specific job, listing or question) are left
 * out deliberately: they are short-lived and render per request.
 */
const BASE = (process.env.SITE_URL ?? 'https://www.betterisabela.org').replace(/\/$/, '');

type Entry = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
};

const PAGES: Entry[] = [
  { path: '/', changeFrequency: 'daily', priority: 1 },
  { path: '/jobs', changeFrequency: 'daily', priority: 0.9 },
  { path: '/market', changeFrequency: 'daily', priority: 0.9 },
  { path: '/ask', changeFrequency: 'daily', priority: 0.9 },
  { path: '/prices', changeFrequency: 'daily', priority: 0.9 },
  { path: '/services', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/charter', changeFrequency: 'daily', priority: 0.9 },
  { path: '/officials', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/progress', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/news', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/government', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/statistics', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/transparency', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/legislative', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/faq', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/sitemap', changeFrequency: 'monthly', priority: 0.3 },
  { path: '/accessibility', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  // One charter page per service, which is where the long-tail question
  // ("how long does a business permit take in Isabela") actually gets answered.
  const { services } = await getServices();

  return [
    ...PAGES.map((p) => ({
      url: `${BASE}${p.path}`,
      lastModified,
      changeFrequency: p.changeFrequency,
      priority: p.priority,
    })),
    {
      url: `${BASE}/services/health`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    ...services.map((s) => ({
      url: `${BASE}/charter/${s.id}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    ...listServiceDetails().map((d) => ({
      url: `${BASE}/services/${d.slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
