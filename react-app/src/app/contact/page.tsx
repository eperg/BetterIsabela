import { getContacts } from '@/lib/static-data';
import { PageHeader } from '@/components/app/ui';

export const revalidate = 3600;

export const metadata = {
  title: 'Contact',
  description:
    'Emergency hotlines, provincial office numbers and district hospitals for the Province of Isabela.',
};

function tel(value?: string) {
  return value ? value.replace(/\D/g, '') : '';
}

function ContactList({
  title,
  lead,
  entries,
  tone,
}: {
  title: string;
  lead?: string;
  entries: { id: string; name: string; landline?: string; tel?: string; display?: string; emergency?: string; emergencyDisplay?: string }[];
  tone?: 'urgent';
}) {
  if (!entries.length) return null;
  return (
    <section>
      <h2 className="sectionhead">{title}</h2>
      {lead && <p className="muted">{lead}</p>}
      <ul className={`cardlist cardlist--grid${tone === 'urgent' ? ' cardlist--urgent' : ''}`}>
        {entries.map((e) => {
          const mobile = e.tel ?? e.emergency;
          const mobileLabel = e.display ?? e.emergencyDisplay;
          return (
            <li key={e.id} className="card">
              <div className="card-main">
                <h3 className="card-title">{e.name}</h3>
                <ul className="plainlist">
                  {e.landline && (
                    <li>
                      <a href={`tel:${tel(e.landline)}`}>{e.landline}</a>{' '}
                      <span className="muted">landline</span>
                    </li>
                  )}
                  {mobile && (
                    <li>
                      <a href={`tel:${mobile}`}>{mobileLabel ?? mobile}</a>{' '}
                      <span className="muted">mobile</span>
                    </li>
                  )}
                </ul>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default async function ContactPage() {
  const { emergency, offices, hospitals, source, hotlineSource, verified } = await getContacts();

  return (
    <main className="wrap">
      <PageHeader
        title="Contact"
        lead="Emergency numbers, provincial offices and district hospitals. Every number below is taken from an official directory."
      />

      <ContactList
        title="Emergency"
        lead="Province-wide hotlines. For a life-threatening emergency, call the nearest number first."
        entries={emergency}
        tone="urgent"
      />

      <ContactList
        title="Provincial offices"
        lead={`${offices.length} offices at the Provincial Capitol, Alibagu, City of Ilagan.`}
        entries={offices}
      />

      <ContactList
        title="Hospitals"
        lead="Provincial and district hospitals. Emergency room numbers where published."
        entries={hospitals}
      />

      <div className="footnote">
        Sources:{' '}
        <a href={source} target="_blank" rel="noopener noreferrer">
          Province of Isabela directory
        </a>{' '}
        ·{' '}
        <a href={hotlineSource} target="_blank" rel="noopener noreferrer">
          emergency hotlines
        </a>
        {verified && <> · verified {verified}</>}
        <p>
          Found a number that no longer works?{' '}
          <a href="mailto:volunteer@betterisabela.org">Tell us</a> and it will be checked against
          the official directory.
        </p>
      </div>
    </main>
  );
}
