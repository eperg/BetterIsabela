import type { MetadataRoute } from 'next';

const BASE = (process.env.SITE_URL ?? 'https://www.betterisabela.org').replace(/\/$/, '');

/**
 * Nothing personal or transactional is crawlable: the sign-in flow, the
 * moderation queue, the posting forms and the API. Everything else is public
 * information about a public institution and should be indexable.
 */
const PRIVATE = ['/api/', '/auth/', '/moderation', '/signin', '/jobs/new', '/market/new', '/ask/new'];

/**
 * AI crawlers are named explicitly and allowed the same surface as a search
 * crawler. This is deliberate: the point of a civic portal is that a resident
 * asking an assistant "how do I renew my business permit in Isabela" gets the
 * province's own answer, sourced and attributed, rather than a guess. Naming
 * them also means the decision is on the record instead of being an accident of
 * the wildcard rule.
 */
const AI_AGENTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'Meta-ExternalAgent',
  'DuckAssistBot',
  'Amazonbot',
  'CCBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE },
      { userAgent: AI_AGENTS, allow: '/', disallow: PRIVATE },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
