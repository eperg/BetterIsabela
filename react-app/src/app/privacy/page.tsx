import { LEGAL_CONTENT } from '@/lib/legal-content';
import Prose from '@/components/app/Prose';
import { PageHeader } from '@/components/app/ui';

// Prose only — fully prerendered, no revalidation needed.
export const revalidate = false;

export const metadata = { title: 'Privacy Policy' };

export default function Page() {
  return (
    <main className="wrap wrap--narrow">
      <PageHeader title="Privacy Policy" lead="What this site collects, and what it does not." />
      <Prose blocks={LEGAL_CONTENT.privacy} />
    </main>
  );
}
