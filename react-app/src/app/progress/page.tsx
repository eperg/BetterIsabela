import {
  listTowns,
  projectSummary,
  projectTownTotals,
  projectsProvinceWide,
} from '@/lib/queries';
import { PageHeader, Empty, peso } from '@/components/app/ui';
import ProjectCard, { PROJECT_STATUS_LABEL } from '@/components/app/ProjectCard';
import JsonLd from '@/components/seo/JsonLd';
import { datasetSchema } from '@/lib/schema';

export const metadata = {
  title: 'Town progress & projects',
  description:
    'Every public works contract recorded for Isabela: status, cost, contractor and funding ' +
    'programme, broken down by town, from the Department of Budget and Management’s Project DIME.',
  alternates: { canonical: '/progress' },
};

export const revalidate = 900;

const nf = (n: number) => n.toLocaleString('en-PH');

export default async function ProgressPage() {
  const [towns, tally, perTown, provinceWide] = await Promise.all([
    listTowns(),
    projectSummary(),
    projectTownTotals(),
    projectsProvinceWide(),
  ]);

  const byTown = new Map(perTown.map((r) => [r.townSlug, r]));
  const totals = perTown.reduce(
    (a, r) => ({
      projects: a.projects + Number(r.total),
      cost: a.cost + Number(r.costCentavos ?? 0),
    }),
    { projects: 0, cost: 0 }
  );
  const counted = Object.fromEntries(tally.map((t) => [t.status, Number(t.n)]));

  if (totals.projects === 0) {
    return (
      <main className="wrap">
        <PageHeader title="Town progress tracker" lead="Public projects across Isabela." />
        <Empty>
          No projects recorded yet. Nothing is published here without a named source and a
          verification date.
        </Empty>
      </main>
    );
  }

  return (
    <main className="wrap">
      <JsonLd
        data={datasetSchema({
          name: 'Public project tracker (Province of Isabela)',
          description:
            'Public infrastructure contracts across the towns of Isabela, with status, cost, ' +
            'contractor and funding programme.',
          path: '/progress',
          keywords: ['public projects', 'infrastructure', 'Isabela', 'local government', 'budget'],
        })}
      />
      <PageHeader
        title="Town progress tracker"
        lead="Every public works contract recorded for the province: what is running, what is finished, and what it cost. Pick a town to see its own projects."
      />

      <ul className="statstrip statstrip--lg">
        <li>
          <span className="statstrip-n">{nf(totals.projects)}</span>
          <span className="statstrip-l">Contracts</span>
        </li>
        <li>
          <span className="statstrip-n">{nf(counted.ongoing ?? 0)}</span>
          <span className="statstrip-l">Ongoing</span>
        </li>
        <li>
          <span className="statstrip-n">{nf(counted.completed ?? 0)}</span>
          <span className="statstrip-l">Completed</span>
        </li>
        <li>
          <span className="statstrip-n">{peso(totals.cost, { compact: true })}</span>
          <span className="statstrip-l">Contract value</span>
        </li>
      </ul>

      {/* A list of thousands of contracts is not a page anybody can read, so the
          province view is the breakdown and each town holds its own projects. */}
      <div className="dtable-wrap">
        <div className="dtable-scroll">
          <table className="dtable">
            <caption className="dtable-cap">
              Contracts by town. Figures cover every project recorded, whatever its status.
            </caption>
            <thead>
              <tr>
                <th scope="col">Town</th>
                <th scope="col">Contracts</th>
                <th scope="col">Ongoing</th>
                <th scope="col">Completed</th>
                <th scope="col">Contract value</th>
              </tr>
            </thead>
            <tbody>
              {towns.map((t) => {
                const row = byTown.get(t.slug);
                const n = Number(row?.total ?? 0);
                return (
                  <tr key={t.slug}>
                    <th scope="row">
                      {n > 0 ? <a href={`/progress/${t.slug}`}>{t.name}</a> : t.name}
                    </th>
                    <td>{nf(n)}</td>
                    <td>{nf(Number(row?.ongoing ?? 0))}</td>
                    <td>{nf(Number(row?.completed ?? 0))}</td>
                    <td>{row?.costCentavos ? peso(Number(row.costCentavos), { compact: true }) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {provinceWide.length > 0 && (
        <>
          <h2>Province-wide</h2>
          <p className="pagehead-lead">
            Contracts that cross more than one municipality, so belong to no single town. The
            largest {provinceWide.length} by contract value.
          </p>
          <ul className="cardlist cardlist--grid" id="projectlist">
            {provinceWide.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </ul>
        </>
      )}

      <p className="footnote">
        Status labels follow the source: {Object.values(PROJECT_STATUS_LABEL).join(', ')}. Percent
        complete is only shown where the implementing agency publishes one.
      </p>
    </main>
  );
}
