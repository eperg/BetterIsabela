import type { MetadataRoute } from 'next';

const BASE = (process.env.SITE_URL ?? 'https://www.betterisabela.org').replace(/\/$/, '');

/**
 * Crawlers are kept out of anything personal or transactional: the sign-in
 * flow, the moderation queue, and the API. Everything else is public
 * information and should be indexable.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/auth/', '/moderation', '/signin', '/jobs/new', '/market/new', '/ask/new'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
