import { getLegislative } from '@/lib/static-data';
import { PageHeader, Empty } from '@/components/app/ui';

export const revalidate = 3600;

export const metadata = { title: 'Legislative' };

export default async function LegislativePage() {
  const { ordinances, resolutions, pending, source } = await getLegislative();

  return (
    <main className="wrap">
      <PageHeader
        title="Ordinances &amp; resolutions"
        lead="Measures passed by the Sangguniang Panlalawigan ng Isabela."
      />

      {pending ? (
        <>
          <Empty>
            No records are published here yet. The legislative feed carried Solano-era ordinances
            after the rebrand; rather than relabel records that belonged to another local
            government, they were removed. Isabela measures go up only once each has been checked
            against the official archive.
          </Empty>
          <p style={{ marginTop: 18 }}>
            <a className="btn btn--primary" href={source} target="_blank" rel="noopener noreferrer">
              Search the official archive
            </a>
          </p>
        </>
      ) : (
        <ul className="statstrip">
          <li>
            <span className="statstrip-n">{ordinances}</span>
            <span className="statstrip-l">Ordinances</span>
          </li>
          <li>
            <span className="statstrip-n">{resolutions}</span>
            <span className="statstrip-l">Resolutions</span>
          </li>
        </ul>
      )}

      <section>
        <h2 className="sectionhead">What the difference is</h2>
        <div className="panel">
          <p>
            An <strong>ordinance</strong> is a local law. It applies to everyone in the province,
            carries penalties, and stays in force until amended or repealed.
          </p>
          <p style={{ marginBottom: 0 }}>
            A <strong>resolution</strong> expresses the position or intent of the Sanggunian on a
            matter — endorsing a project, accepting a donation, declaring a policy. It does not
            create an obligation on the public.
          </p>
        </div>
      </section>

      <div className="footnote">
        Source:{' '}
        <a href={source} target="_blank" rel="noopener noreferrer">
          Province of Isabela — ordinance and resolution archive
        </a>
      </div>
    </main>
  );
}
