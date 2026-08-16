/**
 * Where a section actually lives.
 *
 * The participation features are served by this app; the reference pages
 * (statistics, service catalogue, legislative, transparency, and the legal
 * pages) are still served by the static cPanel site. Linking to them relatively
 * from here produces a 404, so they resolve against the static origin until
 * they migrate.
 */
export const STATIC_SITE =
  process.env.NEXT_PUBLIC_STATIC_SITE_URL ??
  (process.env.NODE_ENV === 'production' ? 'https://betterisabela.org' : 'http://localhost:8000');

export const staticPath = (path: string) => `${STATIC_SITE}${path}`;

/** Sections that still live on the static site. */
export const LEGACY = {
  statistics: staticPath('/statistics/'),
  services: staticPath('/services/'),
  legislative: staticPath('/legislative/'),
  transparency: staticPath('/budget/'),
  sitemap: staticPath('/sitemap/'),
  contact: staticPath('/contact/'),
} as const;
