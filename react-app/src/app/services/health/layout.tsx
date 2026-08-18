import type { Metadata } from 'next';

/**
 * The page itself is a client component (it reads the language context), so it
 * cannot export metadata. The segment layout carries it instead.
 */
export const metadata: Metadata = {
  title: 'Health services',
  description:
    'Health services in the Province of Isabela: provincial and district hospitals, rural health ' +
    'units, PhilHealth assistance, medical missions and how to access care in your town.',
  alternates: { canonical: '/services/health' },
};

export default function HealthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
