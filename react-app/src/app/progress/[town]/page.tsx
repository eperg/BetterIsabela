import type { Metadata } from 'next';
import { getTown, listTowns } from '@/lib/queries';
import TownProgress from '@/components/app/TownProgress';

export const revalidate = 900;

/**
 * One page per town. The province holds thousands of contracts, far more than
 * one page can carry, and the filters here run in the browser over what the
 * server already rendered, so the split has to happen in the route.
 */
export async function generateStaticParams() {
  const towns = await listTowns();
  return towns.map((t) => ({ town: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ town: string }>;
}): Promise<Metadata> {
  const { town: slug } = await params;
  const town = await getTown(slug);
  if (!town) return { title: 'Town not found' };
  return {
    title: `Public projects in ${town.name}`,
    description:
      `Public works contracts recorded for ${town.name}, Isabela: status, cost, contractor and ` +
      'funding programme, each traceable to the record it came from.',
    alternates: { canonical: `/progress/${slug}` },
  };
}

export default async function TownProgressPage({
  params,
}: {
  params: Promise<{ town: string }>;
}) {
  const { town } = await params;
  return <TownProgress slug={town} page={1} />;
}
