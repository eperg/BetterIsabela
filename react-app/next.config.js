const path = require('path');

/**
 * The old site had one index page per service category (services/business.html).
 * The app filters instead, so each becomes /services?category=<name>. Built from
 * services.json so the two cannot drift apart.
 */
function legacyCategoryRedirects() {
  const { services } = require('./public/data/services.json');
  const byPage = new Map();
  for (const service of services) {
    const page = /^([a-z-]+)\.html$/.exec(service.url ?? '')?.[1];
    if (page && !byPage.has(page)) byPage.set(page, service.categoryId);
  }
  // Redirects are evaluated before routing, so an extensionless redirect would
  // shadow a real page of the same name — /services/health is a curated page in
  // the app as well as a legacy category index. Those keep only the .html form.
  const realRoutes = new Set([
    'health',
    ...require('./src/data/service-details.json').flatMap((d) => [d.slug, ...(d.aliases ?? [])]),
  ]);

  return [...byPage.entries()].flatMap(([page, categoryId]) => {
    const destination = `/services?category=${categoryId}`;
    const rules = [{ source: `/services/${page}.html`, destination, permanent: true }];
    if (!realRoutes.has(page)) {
      rules.push({ source: `/services/${page}`, destination, permanent: true });
    }
    return rules;
  });
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server app, not a static export. The participation features (SSO, job board,
  // buy & sell, Q&A, officials ratings) need API routes and a database, and the
  // eGov partner_secret can only ever be exchanged server-side. Deploys to
  // Vercel; the legacy static site continues to serve from cPanel.
  trailingSlash: false,
  skipTrailingSlashRedirect: true,

  // Pin the workspace root to this app. The repo has two lockfiles
  // (root legacy site + this react-app), and Next 15 otherwise warns
  // about ambiguous root inference.
  outputFileTracingRoot: path.join(__dirname),

  // Clean URLs configuration
  // Next.js automatically handles clean URLs without .html extensions

  // Listing photos are user-uploaded and arrive at unpredictable sizes, so let
  // the platform resize them rather than shipping originals to a rural phone.
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**.public.blob.vercel-storage.com' }],
  },

  // Disable x-powered-by header for security
  poweredByHeader: false,

  // Strict mode for better development experience
  reactStrictMode: true,

  // Compression
  compress: true,

  // The static site's URLs are indexed and linked from elsewhere, so they are
  // redirected rather than left to 404. Detail pages map slug-for-slug; the old
  // per-category index pages become a filtered view of /services. Retired
  // duplicate slugs are handled inside the [slug] route, which redirects them
  // on to the page they were merged into.
  async redirects() {
    return [
      { source: '/service-details/:slug.html', destination: '/services/:slug', permanent: true },
      { source: '/service-details/:slug', destination: '/services/:slug', permanent: true },
      { source: '/service-details', destination: '/services', permanent: true },
      { source: '/services/index.html', destination: '/services', permanent: true },
      ...legacyCategoryRedirects(),
    ];
  },

  // Environment variables
  env: {
    SITE_URL: process.env.SITE_URL || 'https://www.betterisabela.org',
  },
};

module.exports = nextConfig;
