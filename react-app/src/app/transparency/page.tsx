import { getTransparency } from '@/lib/static-data';
import { PageHeader, Empty } from '@/components/app/ui';

export const revalidate = 3600;

export const metadata = { title: 'Transparency' };

const SEAL = 'https://provinceofisabela.gov.ph/transparency-seal/';

const LINKS = [
  ['Transparency seal', SEAL, 'Budget, procurement and annual reports required by law.'],
  ['Full Disclosure Policy', 'https://provinceofisabela.gov.ph/transparency-seal/', 'Quarterly financial disclosures.'],
  ['Freedom of Information', 'https://www.foi.gov.ph/', 'Request records the province has not published.'],
  ['Bureau of Local Government Finance', 'https://blgf.gov.ph/', 'Provincial income and expenditure statements.'],
  ['Open Data Philippines', 'https://data.gov.ph', 'National datasets covering Isabela.'],
] as const;

export default async function TransparencyPage() {
  const { years, pending, status } = await getTransparency();

  return (
    <main className="wrap">
      <PageHeader
        title="Transparency"
        lead="Where the province's money comes from and where it goes."
      />

      {pending ? (
        <Empty>
          No fiscal year has been published here yet. The budget dataset is still in draft, and a
          figure only goes up with a named source and a verification date — the same rule applied
          to every other number on this site. Until then, the official disclosures below are the
          authoritative record.
        </Empty>
      ) : (
        <p>{years} fiscal year(s) published. Status: {status}.</p>
      )}

      <h2 className="sectionhead">Official disclosures</h2>
      <ul className="cardlist cardlist--grid">
        {LINKS.map(([name, href, note]) => (
          <li key={name} className="card">
            <div className="card-main">
              <h3 className="card-title">
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {name}
                </a>
              </h3>
              <p className="card-desc">{note}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="footnote">
        Infrastructure projects with published costs appear on the{' '}
        <a href="/progress">town progress tracker</a>.
      </div>
    </main>
  );
}
