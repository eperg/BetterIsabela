import { getServices, listServiceDetails } from '@/lib/static-data';
import { faqEntries } from '@/lib/faq-content';

/**
 * /llms.txt — a curated map of the site for language models, in the format
 * proposed at llmstxt.org.
 *
 * The point is not to duplicate the site: it is to give an assistant a short,
 * authoritative index it can read in one request, so an answer about Isabela
 * cites the province's own page instead of guessing. It is generated from the
 * same data the pages render, so it cannot drift from them.
 */
export const dynamic = 'force-static';
export const revalidate = 3600;

const BASE = (process.env.SITE_URL ?? 'https://www.betterisabela.org').replace(/\/$/, '');

const link = (name: string, path: string, note: string) => `- [${name}](${BASE}${path}): ${note}`;

const SECTIONS: { heading: string; links: string[] }[] = [
  {
    heading: 'Start here',
    links: [
      link('Provincial services', '/services', 'Every service the province offers, with requirements, fees, processing time and the responsible office'),
      link('Frequently asked questions', '/faq', 'Direct answers on office hours, certificates, business permits, real property tax and senior citizen benefits'),
      link('Charter watch', '/charter', "What each service actually takes and costs, reported by residents, against what the Citizen's Charter promises"),
      link('Government directory', '/government', 'Provincial offices, department heads and how to reach them'),
      link('Contact', '/contact', 'Capitol address, hotlines and office contact details'),
    ],
  },
  {
    heading: 'Live community data',
    links: [
      link('Job board', '/jobs', 'Current vacancies across Isabela, posted by employers and residents'),
      link('Buy & sell', '/market', 'Items for sale by residents: produce, livestock, tools, vehicles, household goods'),
      link('Ask & answer', '/ask', 'Resident questions about provincial services, answered by neighbours and LGU staff'),
      link('Public officials', '/officials', 'Directory of officials serving the province and its towns, with resident ratings'),
    ],
  },
  {
    heading: 'Open data',
    links: [
      link('Palay & corn prices', '/prices', 'Farmgate prices paid to farmers and retail market prices for rice and basic goods'),
      link('Town progress tracker', '/progress', 'Public projects by town: status, percent complete, cost and funding source'),
      link('Statistics', '/statistics', 'Population, economy and competitiveness figures for the province'),
      link('Transparency', '/transparency', 'Budget, procurement and fiscal transparency disclosures'),
      link('Legislative', '/legislative', 'Provincial ordinances and resolutions'),
    ],
  },
  {
    heading: 'About this site',
    links: [
      link('News', '/news', 'Provincial announcements and updates'),
      link('Accessibility', '/accessibility', 'Accessibility commitments and how to report a barrier'),
      link('Privacy', '/privacy', 'How resident data submitted to this site is handled'),
      link('Terms', '/terms', 'Terms of use for the community sections'),
      link('Sitemap', '/sitemap', 'Full page index'),
    ],
  },
];

export async function GET() {
  const { total, withDetail } = await getServices();
  const details = listServiceDetails();

  const body = [
    '# BetterIsabela.org',
    '',
    '> Civic portal for the Province of Isabela, Philippines. Government services and the ' +
      "Citizen's Charter, a directory of public officials residents can rate, market price " +
      'monitoring, a public project tracker, and community job, marketplace and Q&A boards. ' +
      `Covers ${total} provincial services, ${withDetail} of them with a full step-by-step guide.`,
    '',
    'Content is published by and about the Provincial Government of Isabela. Community sections ' +
      '(jobs, buy & sell, questions, official ratings) are written by residents and are opinions ' +
      'of their authors, not statements of the province. Prices and statistics are republished ' +
      'from the named statistical source on each page, not produced by the province.',
    '',
    ...SECTIONS.flatMap((s) => [`## ${s.heading}`, '', ...s.links, '']),
    '## Service guides',
    '',
    ...details.map((d) =>
      link(d.title, `/services/${d.slug}`, d.description?.replace(/\s+/g, ' ').trim() || d.category || 'Step-by-step guide')
    ),
    '',
    '## Common questions answered on this site',
    '',
    ...faqEntries().map((e) => `- ${e.question} (answered at ${BASE}/faq)`),
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
