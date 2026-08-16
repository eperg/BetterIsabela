import { LEGAL_CONTENT } from '@/lib/legal-content';
import Prose from '@/components/app/Prose';
import { PageHeader } from '@/components/app/ui';

// Prose only — fully prerendered, no revalidation needed.
export const revalidate = false;

export const metadata = { title: 'Frequently asked questions' };

export default function Page() {
  return (
    <main className="wrap wrap--narrow">
      <PageHeader title="Frequently asked questions" lead="Common questions about services and this site." />
      <Prose blocks={LEGAL_CONTENT.faq} />
    </main>
  );
}
