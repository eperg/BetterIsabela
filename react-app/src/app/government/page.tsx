import { getContacts } from '@/lib/static-data';
import { listOfficials } from '@/lib/queries';
import { PageHeader, Stars } from '@/components/app/ui';

export const revalidate = 900;

export const metadata = { title: 'Government' };

export default async function GovernmentPage() {
  const [{ offices, source }, provincial] = await Promise.all([
    getContacts(),
    listOfficials({ townSlug: null, limit: 20 }),
  ]);

  const leadership = provincial.filter((o) => /governor/i.test(o.position));
  const board = provincial.filter((o) => /board member/i.test(o.position));

  return (
    <main className="wrap">
      <PageHeader
        title="Provincial government"
        lead="Who holds office, which department does what, and how to reach them."
      />

      <h2 className="sectionhead">Leadership</h2>
      <ul className="cardlist cardlist--grid">
        {leadership.map((o) => (
          <li key={o.id} className="card">
            <div className="card-main">
              <h3 className="card-title">
                <a href={`/officials/${o.id}`}>{o.name}</a>
              </h3>
              <p className="card-sub">{o.position}</p>
              <p className="card-meta">
                <Stars sum={o.ratingSum} count={o.ratingCount} />
              </p>
            </div>
          </li>
        ))}
      </ul>

      <h2 className="sectionhead">Sangguniang Panlalawigan</h2>
      <p className="muted">{board.length} board members across six districts.</p>
      <ul className="cardlist cardlist--grid">
        {board.map((o) => (
          <li key={o.id} className="card">
            <div className="card-main">
              <h3 className="card-title">
                <a href={`/officials/${o.id}`}>{o.name}</a>
              </h3>
              <p className="card-sub">{o.position}</p>
            </div>
          </li>
        ))}
      </ul>

      <h2 className="sectionhead">Departments</h2>
      <p className="muted">
        {offices.length} provincial offices. Full numbers on the{' '}
        <a href="/contact">contact page</a>.
      </p>
      <ul className="cardlist cardlist--grid">
        {offices.map((o) => (
          <li key={o.id} className="card">
            <div className="card-main">
              <h3 className="card-title">{o.name}</h3>
              <p className="card-meta">
                {o.landline && (
                  <a href={`tel:${o.landline.replace(/\D/g, '')}`}>{o.landline}</a>
                )}
                {o.tel && <a href={`tel:${o.tel}`}>{o.display ?? o.tel}</a>}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="footnote">
        Source:{' '}
        <a href={source} target="_blank" rel="noopener noreferrer">
          Province of Isabela directory
        </a>
      </div>
    </main>
  );
}
