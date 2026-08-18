import { redirect } from 'next/navigation';
import { openReports } from '@/lib/queries';
import { getCurrentUser } from '@/lib/session';
import { moderateTakedown } from '@/lib/actions';
import ActionForm from '@/components/app/ActionForm';
import { PageHeader, Empty, since } from '@/components/app/ui';

// Reads the signed-in user, so it must render per request.
export const dynamic = 'force-dynamic';

// Sign-in gated and per-user, so there is nothing stable for a crawler to index.
// robots.txt already disallows the path; this keeps the page out of the index even
// if it is reached by a link a crawler already knows about.
export const metadata = {
  title: 'Moderation queue',
  description:
    'Internal moderation queue for reported community content.',
  robots: { index: false, follow: true },
};


const TARGET_HREF: Record<string, (id: number) => string> = {
  job: (id) => `/jobs/${id}`,
  listing: (id) => `/market/${id}`,
  question: (id) => `/ask/${id}`,
  answer: () => '/ask',
  official_review: () => '/officials',
  service_report: () => '/charter',
};

export default async function Moderation() {
  const user = await getCurrentUser();
  if (!user) redirect('/');
  if (user.role !== 'moderator' && user.role !== 'admin') {
    return (
      <main className="wrap">
        <PageHeader title="Moderation" />
        <p className="empty">Moderators only.</p>
      </main>
    );
  }

  const queue = await openReports();

  return (
    <main className="wrap">
      <PageHeader
        title="Moderation queue"
        lead="Reported content, newest first. Upholding a report removes the content and records a snapshot of it."
      />

      {queue.length === 0 ? (
        <Empty>Nothing reported. The queue is clear.</Empty>
      ) : (
        <ul className="cardlist">
          {queue.map((r) => (
            <li key={r.id} className="card">
              <div className="card-main">
                <h2 className="card-title">
                  {r.targetType.replace('_', ' ')} #{r.targetId}
                </h2>
                <p className="card-meta">
                  <span className="chip chip--warn">{r.reason.replace('_', ' ')}</span>
                  <span className="muted">reported by {r.reporterName}, {since(r.createdAt)}</span>
                  {TARGET_HREF[r.targetType] && (
                    <a href={TARGET_HREF[r.targetType](r.targetId)} target="_blank" rel="noopener noreferrer">
                      view content
                    </a>
                  )}
                </p>
                {r.details && <p className="prose">{r.details}</p>}

                <div className="modactions">
                  <ActionForm action={moderateTakedown} submitLabel="Uphold — remove" successMessage="Removed.">
                    <input type="hidden" name="reportId" value={r.id} />
                    <input type="hidden" name="decision" value="uphold" />
                    <input name="note" placeholder="Reason (recorded in the audit log)" maxLength={500} />
                  </ActionForm>
                  <ActionForm action={moderateTakedown} submitLabel="Dismiss" successMessage="Dismissed.">
                    <input type="hidden" name="reportId" value={r.id} />
                    <input type="hidden" name="decision" value="dismiss" />
                  </ActionForm>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
