import { getNews } from '@/lib/static-data';
import { PageHeader, Empty } from '@/components/app/ui';

export const revalidate = 3600;

export const metadata = { title: 'News & advisories' };

function when(date?: string) {
  if (!date) return '';
  const d = new Date(date);
  return Number.isNaN(d.getTime())
    ? date
    : d.toLocaleDateString('en-PH', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function NewsPage() {
  const { items } = await getNews();

  return (
    <main className="wrap">
      <PageHeader
        title="News &amp; advisories"
        lead="Announcements affecting provincial services, deadlines and public advisories."
      />

      {items.length === 0 ? (
        <Empty>No announcements at the moment.</Empty>
      ) : (
        <ul className="cardlist">
          {items.map((n, i) => (
            <li key={n.id ?? i} className="card">
              <div className="card-main">
                <h2 className="card-title">
                  {n.url ? (
                    <a href={n.url} target="_blank" rel="noopener noreferrer">
                      {n.title}
                    </a>
                  ) : (
                    n.title
                  )}
                </h2>
                <p className="card-meta">
                  {n.category && <span className="chip">{n.category}</span>}
                  {n.date && <span className="muted">{when(n.date)}</span>}
                </p>
                {n.summary && <p className="card-desc">{n.summary}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="footnote">
        For provincial government announcements, see the{' '}
        <a href="https://provinceofisabela.gov.ph/category/news/" target="_blank" rel="noopener noreferrer">
          official news feed
        </a>
        .
      </div>
    </main>
  );
}
