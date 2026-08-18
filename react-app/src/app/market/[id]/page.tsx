import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getListing } from '@/lib/queries';
import { getCurrentUser } from '@/lib/session';
import { markListingSold } from '@/lib/actions';
import ActionForm from '@/components/app/ActionForm';
import { peso, since } from '@/components/app/ui';
import ReportButton from '@/components/app/ReportButton';
import JsonLd from '@/components/seo/JsonLd';
import { productSchema, breadcrumbSchema, summarise } from '@/lib/schema';

// Reads the signed-in user, so it must render per request.
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const row = await getListing(Number(id));
  if (!row) return { title: 'Listing not found' };
  const { listing, townName } = row;
  const price = listing.priceCentavos != null ? peso(listing.priceCentavos) : 'Open to offers';
  return {
    title: `${listing.title} — ${price}`,
    description: summarise(
      `${listing.title} for sale in ${townName}, Isabela. ${price}. ${listing.description}`,
      200
    ),
    alternates: { canonical: `/market/${id}` },
  };
}

export default async function ListingDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row, user] = await Promise.all([getListing(Number(id)), getCurrentUser()]);
  if (!row) notFound();
  const { listing, townName, sellerName } = row;
  const isMine = user?.id === listing.postedBy;

  return (
    <main className="wrap wrap--narrow">
      <JsonLd
        data={[
          productSchema({
            title: listing.title,
            description: listing.description,
            category: listing.category,
            priceCentavos: listing.priceCentavos,
            condition: listing.condition,
            townName,
            path: `/market/${listing.id}`,
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Buy & sell', path: '/market' },
            { name: listing.title, path: `/market/${listing.id}` },
          ]),
        ]}
      />
      <p className="crumb"><a href="/market">← Buy &amp; sell</a></p>
      <h1>{listing.title}</h1>
      <p className="card-price card-price--lg">
        {listing.priceCentavos != null ? peso(listing.priceCentavos) : 'Open to offers'}
      </p>
      <p className="card-meta">
        <span className="chip">{listing.category}</span>
        {listing.condition && <span className="chip">{listing.condition.replace('_', ' ')}</span>}
        <span>{townName}</span>
        <span className="muted">listed {since(listing.createdAt)}</span>
      </p>
      <div className="prose">{listing.description.split('\n').map((p, i) => <p key={i}>{p}</p>)}</div>

      <section className="panel">
        <h2>Seller</h2>
        <p>{sellerName}</p>
        {listing.contactPhone && <p><a href={`tel:${listing.contactPhone}`}>{listing.contactPhone}</a></p>}
      </section>

      {isMine && !listing.soldAt && (
        <ActionForm action={markListingSold} submitLabel="Mark as sold" successMessage="Marked sold.">
          <input type="hidden" name="id" value={listing.id} />
        </ActionForm>
      )}

      <div className="footnote">
        Meet in a public place and inspect goods before paying. BetterIsabela is not a party to any sale.
        {' '}<ReportButton targetType="listing" targetId={listing.id} />
      </div>
    </main>
  );
}
