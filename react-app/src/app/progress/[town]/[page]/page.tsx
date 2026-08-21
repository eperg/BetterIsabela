import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTown, projectTownTotals } from '@/lib/queries';
import TownProgress, { PER_PAGE } from '@/components/app/TownProgress';

export const revalidate = 900;

/**
 * Pages two and up. Page one lives at /progress/[town], so it is deliberately
 * absent here: two routes serving the same contracts would compete for it.
 */
export async function generateStaticParams() {
  const totals = await projectTownTotals();
  return totals.flatMap((t) => {
    if (!t.townSlug) return [];
    const pages = Math.ceil(Number(t.total) / PER_PAGE);
    return Array.from({ length: Math.max(0, pages - 1) }, (_, i) => ({
      town: t.townSlug as string,
      page: String(i + 2),
    }));
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ town: string; page: string }>;
}): Promise<Metadata> {
  const { town: slug, page } = await params;
  const town = await getTown(slug);
  if (!town) return { title: 'Town not found' };
  return {
    title: `Public projects in ${town.name}, page ${page}`,
    description: `Public works contracts recorded for ${town.name}, Isabela. Page ${page}.`,
    alternates: { canonical: `/progress/${slug}/${page}` },
  };
}

export default async function TownProgressPagedPage({
  params,
}: {
  params: Promise<{ town: string; page: string }>;
}) {
  const { town, page } = await params;
  const n = Number(page);
  // A page number that is not a plain integer above one is not a page.
  if (!Number.isInteger(n) || n < 2) notFound();
  return <TownProgress slug={town} page={n} />;
}
