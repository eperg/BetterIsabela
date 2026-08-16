import { LEGAL_CONTENT } from '@/lib/legal-content';
import Prose from '@/components/app/Prose';
import { PageHeader } from '@/components/app/ui';

// Prose only — fully prerendered, no revalidation needed.
export const revalidate = false;

export const metadata = { title: 'Terms of Use' };

export default function Page() {
  return (
    <main className="wrap wrap--narrow">
      <PageHeader title="Terms of Use" lead="Guidelines for using BetterIsabela.org." />
      <Prose blocks={LEGAL_CONTENT.terms} />
    </main>
  );
}
