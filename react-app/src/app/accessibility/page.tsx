import { LEGAL_CONTENT } from '@/lib/legal-content';
import Prose from '@/components/app/Prose';
import { PageHeader } from '@/components/app/ui';

// Prose only — fully prerendered, no revalidation needed.
export const revalidate = false;

export const metadata = { title: 'Accessibility' };

export default function Page() {
  return (
    <main className="wrap wrap--narrow">
      <PageHeader title="Accessibility" lead="How this site is built to be usable by everyone." />
      <Prose blocks={LEGAL_CONTENT.accessibility} />
    </main>
  );
}
