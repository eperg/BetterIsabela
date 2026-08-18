import { listTowns } from '@/lib/queries';
import { getCurrentUser } from '@/lib/session';
import { askQuestion } from '@/lib/actions';
import ActionForm from '@/components/app/ActionForm';
import { PageHeader, TownSelect } from '@/components/app/ui';

// Reads the signed-in user, so it must render per request.
export const dynamic = 'force-dynamic';

// Sign-in gated and per-user, so there is nothing stable for a crawler to index.
// robots.txt already disallows the path; this keeps the page out of the index even
// if it is reached by a link a crawler already knows about.
export const metadata = {
  title: 'Ask a question',
  description:
    'Post a question about services, documents or day-to-day life in Isabela and get answers from residents and offices.',
  robots: { index: false, follow: true },
};


const CATEGORIES = [
  'Certificates & records', 'Business permits', 'Taxes & payments', 'Health',
  'Education & scholarships', 'Social welfare', 'Agriculture', 'Infrastructure',
  'Public safety', 'Something else',
];

export default async function NewQuestion() {
  const [towns, user] = await Promise.all([listTowns(), getCurrentUser()]);

  if (!user) {
    return (
      <main className="wrap">
        <PageHeader title="Ask a question" />
        <p className="empty">Sign in to ask. Use the sign-in control at the top right.</p>
      </main>
    );
  }

  return (
    <main className="wrap wrap--narrow">
      <PageHeader
        title="Ask a question"
        lead="Ask about a service or process. This is not a complaints channel — for a complaint, contact the office directly."
      />
      <ActionForm action={askQuestion} submitLabel="Post question" successMessage="Posted. Watch for answers." className="stack">
        <label>Question<input name="title" required maxLength={200} placeholder="e.g. What do I need for a barangay clearance?" /></label>
        <label>
          Category
          <select name="category" required defaultValue="">
            <option value="" disabled>Choose…</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label>Town (optional)<TownSelect towns={towns} allowAll required={false} /></label>
        <label>Details<textarea name="body" required rows={7} maxLength={5000} /></label>
      </ActionForm>
    </main>
  );
}
