import { listTowns } from '@/lib/queries';
import { getCurrentUser } from '@/lib/session';
import { postListing } from '@/lib/actions';
import ActionForm from '@/components/app/ActionForm';
import { PageHeader, TownSelect } from '@/components/app/ui';

// Reads the signed-in user, so it must render per request.
export const dynamic = 'force-dynamic';

// Sign-in gated and per-user, so there is nothing stable for a crawler to index.
// robots.txt already disallows the path; this keeps the page out of the index even
// if it is reached by a link a crawler already knows about.
export const metadata = {
  title: 'Post a listing',
  description:
    'List an item for sale to buyers across the Province of Isabela.',
  robots: { index: false, follow: true },
};


const CATEGORIES = [
  'Farm produce', 'Livestock', 'Farm tools & equipment', 'Vehicles', 'Electronics',
  'Furniture', 'Home & garden', 'Clothing', 'Services', 'Other',
];

export default async function NewListing() {
  const [towns, user] = await Promise.all([listTowns(), getCurrentUser()]);

  if (!user) {
    return (
      <main className="wrap">
        <PageHeader title="Post a listing" />
        <p className="empty">Sign in to post. Use the sign-in control at the top right.</p>
      </main>
    );
  }

  return (
    <main className="wrap wrap--narrow">
      <PageHeader title="Post a listing" lead="Free to list. Mark it sold when it goes." />
      <ActionForm action={postListing} submitLabel="Post listing" successMessage="Listed. It is live on Buy & Sell." className="stack">
        <label>What are you selling?<input name="title" required maxLength={160} /></label>
        <label>
          Category
          <select name="category" required defaultValue="">
            <option value="" disabled>Choose…</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label>Town<TownSelect towns={towns} /></label>
        <div className="row">
          <label>Price (₱)<input name="price" inputMode="decimal" placeholder="leave blank if open to offers" /></label>
          <label className="check"><input type="checkbox" name="negotiable" /> Open to offers</label>
        </div>
        <label>
          Condition
          <select name="condition" defaultValue="">
            <option value="">Not stated</option>
            <option value="new">New</option>
            <option value="like_new">Like new</option>
            <option value="used">Used</option>
            <option value="for_parts">For parts</option>
          </select>
        </label>
        <label>Description<textarea name="description" required rows={6} maxLength={5000} /></label>
        <label>Contact phone<input name="contactPhone" maxLength={32} /></label>
      </ActionForm>
    </main>
  );
}
