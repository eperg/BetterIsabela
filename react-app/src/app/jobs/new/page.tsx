import { listTowns } from '@/lib/queries';
import { getCurrentUser } from '@/lib/session';
import { postJob } from '@/lib/actions';
import ActionForm from '@/components/app/ActionForm';
import { PageHeader, TownSelect } from '@/components/app/ui';

// Reads the signed-in user, so it must render per request.
export const dynamic = 'force-dynamic';

// Sign-in gated and per-user, so there is nothing stable for a crawler to index.
// robots.txt already disallows the path; this keeps the page out of the index even
// if it is reached by a link a crawler already knows about.
export const metadata = {
  title: 'Post a job',
  description:
    'Advertise a vacancy on the Isabela community job board. Free, and the post expires automatically after 60 days.',
  robots: { index: false, follow: true },
};


export default async function NewJob() {
  const [towns, user] = await Promise.all([listTowns(), getCurrentUser()]);

  if (!user) {
    return (
      <main className="wrap">
        <PageHeader title="Post a job" />
        <p className="empty">Sign in to post a job. Use the sign-in control at the top right.</p>
      </main>
    );
  }

  return (
    <main className="wrap wrap--narrow">
      <PageHeader title="Post a job" lead="Free. Expires automatically after 60 days." />
      <ActionForm action={postJob} submitLabel="Post job" successMessage="Posted. It is live on the job board." className="stack">
        <label>Job title<input name="title" required maxLength={160} /></label>
        <label>Employer<input name="employer" required maxLength={160} /></label>
        <label>Town<TownSelect towns={towns} /></label>
        <label>
          Type
          <select name="type" required defaultValue="full_time">
            <option value="full_time">Full time</option>
            <option value="part_time">Part time</option>
            <option value="contract">Contract</option>
            <option value="seasonal">Seasonal</option>
            <option value="internship">Internship</option>
            <option value="volunteer">Volunteer</option>
          </select>
        </label>
        <div className="row">
          <label>Salary from (₱/month)<input name="salaryMin" inputMode="decimal" placeholder="optional" /></label>
          <label>to<input name="salaryMax" inputMode="decimal" placeholder="optional" /></label>
        </div>
        <label>Description<textarea name="description" required rows={7} maxLength={5000} /></label>
        <div className="row">
          <label>Contact name<input name="contactName" maxLength={160} /></label>
          <label>Phone<input name="contactPhone" maxLength={32} /></label>
        </div>
        <label>Email<input name="contactEmail" type="email" maxLength={320} /></label>
      </ActionForm>
    </main>
  );
}
