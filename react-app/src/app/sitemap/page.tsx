import { PageHeader } from '@/components/app/ui';

// Prose only — fully prerendered, no revalidation needed.
export const revalidate = false;

export const metadata = { title: 'Sitemap' };

const SECTIONS: { title: string; links: [string, string, string?][] }[] = [
  {
    title: 'Participate',
    links: [
      ['/jobs', 'Job board', 'Work available across the province'],
      ['/market', 'Buy & sell', 'Goods, tools, livestock and produce'],
      ['/ask', 'Ask & answer', 'Questions about services and processes'],
      ['/officials', 'Public officials', 'Rate and review the people in office'],
    ],
  },
  {
    title: 'Information',
    links: [
      ['/prices', 'Palay & corn prices', 'Farmgate and market prices'],
      ['/progress', 'Town progress', 'Public projects and their status'],
      ['/services', 'Provincial services', 'Fees, requirements and offices'],
      ['/statistics', 'Statistics', 'Population, land and competitiveness'],
      ['/news', 'News & advisories'],
    ],
  },
  {
    title: 'Government',
    links: [
      ['/government', 'Provincial government', 'Officials and departments'],
      ['/legislative', 'Ordinances & resolutions'],
      ['/transparency', 'Transparency', 'Budget and disclosures'],
      ['/contact', 'Contact', 'Hotlines, offices and hospitals'],
    ],
  },
  {
    title: 'About this site',
    links: [
      ['/terms', 'Terms of Use'],
      ['/privacy', 'Privacy Policy'],
      ['/accessibility', 'Accessibility'],
      ['/faq', 'Frequently asked questions'],
    ],
  },
];

export default function SitemapPage() {
  return (
    <main className="wrap">
      <PageHeader title="Sitemap" lead="Everything on BetterIsabela.org, in one place." />
      <div className="hgrid">
        {SECTIONS.map((s) => (
          <section className="hpanel" key={s.title}>
            <div className="hpanel-head">
              <h2>{s.title}</h2>
            </div>
            <ul className="hlist">
              {s.links.map(([href, label, note]) => (
                <li key={href}>
                  <a href={href}>{label}</a>
                  {note && <span className="hlist-meta">{note}</span>}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
