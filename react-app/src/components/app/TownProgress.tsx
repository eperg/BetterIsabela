import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getTown, listProjects, projectSummary } from '@/lib/queries';
import { PageHeader, Empty, peso } from '@/components/app/ui';
import ListFilter from '@/components/app/ListFilter';
import ProjectCard, { PROJECT_STATUS_LABEL } from '@/components/app/ProjectCard';
import Pager from '@/components/app/Pager';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbSchema } from '@/lib/schema';

/** Contracts per page. Enough to scan, few enough to load on a phone. */
export const PER_PAGE = 24;

const nf = (n: number) => n.toLocaleString('en-PH');

/**
 * One town's projects, one page at a time. Shared by /progress/[town] and
 * /progress/[town]/[page] so page one is not a second copy of this markup.
 *
 * The status and category controls filter what this page holds, not the whole
 * town, which is what the count line says.
 */
export default async function TownProgress({ slug, page }: { slug: string; page: number }) {
  const town = await getTown(slug);
  if (!town) notFound();

  const tally = await projectSummary(slug);
  const total = tally.reduce((a, t) => a + Number(t.n), 0);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  if (page > pages) notFound();

  const items = await listProjects({
    townSlug: slug,
    limit: PER_PAGE,
    offset: (page - 1) * PER_PAGE,
  });

  const counted = Object.fromEntries(tally.map((t) => [t.status, Number(t.n)]));
  const value = items.reduce((a, p) => a + Number(p.costCentavos ?? 0), 0);
  const categories = [...new Set(items.map((p) => p.category))].sort();
  const base = `/progress/${slug}`;
  const first = (page - 1) * PER_PAGE + 1;

  return (
    <main className="wrap">
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Town progress', path: '/progress' },
          { name: town.name, path: base },
        ])}
      />
      <PageHeader
        title={`Public projects in ${town.name}`}
        lead={`Public works contracts recorded for ${town.name}. Every figure comes from the record named on the card.`}
      />
      <p className="pagehead-lead">
        <a href="/progress">Back to all towns</a>
      </p>

      {total === 0 ? (
        <Empty>
          No projects recorded for {town.name} yet. Nothing is published here without a named
          source and a verification date.
        </Empty>
      ) : (
        <>
          <ul className="statstrip">
            <li>
              <span className="statstrip-n">{nf(total)}</span>
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
              <span className="statstrip-n">{peso(value, { compact: true })}</span>
              <span className="statstrip-l">Value on this page</span>
            </li>
          </ul>

          <Suspense fallback={null}>
            <ListFilter
              targetId="projectlist"
              facets={[
                {
                  key: 'status',
                  label: 'Status',
                  all: 'Any status',
                  options: Object.entries(PROJECT_STATUS_LABEL)
                    .filter(([value]) => counted[value])
                    .map(([value, label]) => ({ value, label })),
                },
                {
                  key: 'category',
                  label: 'Kind of work',
                  all: 'All kinds',
                  options: categories.map((c) => ({ value: c, label: c })),
                },
              ]}
              rows={items.map((p) => ({ status: p.status, category: p.category }))}
              emptyMessage="Nothing on this page matches that filter. Try another page, or clear it."
            />
          </Suspense>

          <p className="resultcount">
            Showing {nf(first)} to {nf(first + items.length - 1)} of {nf(total)} contracts
            {pages > 1 && <> (page {page} of {pages})</>}
          </p>

          <ul className="cardlist cardlist--grid" id="projectlist">
            {items.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </ul>

          <Pager base={base} page={page} pages={pages} label={`${town.name} projects, page list`} />
        </>
      )}
    </main>
  );
}
