import type { ServiceBlock } from '@/lib/static-data';

/**
 * Renders the structured content migrated from the legacy service-details
 * pages. Everything arrives as data, never as HTML, so there is no
 * dangerouslySetInnerHTML anywhere in this path.
 */
export default function ServiceBlocks({ blocks }: { blocks: ServiceBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </>
  );
}

function Block({ block }: { block: ServiceBlock }) {
  switch (block.type) {
    case 'stats':
      return (
        <ul className="statstrip">
          {block.items.map((s, i) => (
            <li key={i}>
              <span className="statstrip-l">{s.label}</span>
              <span className="statstrip-n">{s.value}</span>
              {s.note && <span className="statstrip-s">{s.note}</span>}
            </li>
          ))}
        </ul>
      );

    case 'subheading':
      return <h3 className="dsub">{block.text}</h3>;

    case 'prose':
      return (
        <div className="prose">
          {block.title && <h4 className="dsub">{block.title}</h4>}
          {block.text.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      );

    case 'checklist':
      return (
        <div className="dbox">
          {block.title && <h4 className="dbox-title">{block.title}</h4>}
          <ul className="dchecks">
            {block.items.map((it, i) => (
              <li key={i}>{it}</li>
            ))}
          </ul>
        </div>
      );

    case 'table':
      return (
        <figure className="dtable-wrap">
          {block.caption && <figcaption className="dtable-cap">{block.caption}</figcaption>}
          <div className="dtable-scroll">
            <table className="dtable">
              {block.head.length > 0 && (
                <thead>
                  <tr>
                    {block.head.map((h, i) => (
                      <th key={i} scope="col">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {block.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </figure>
      );

    case 'cards':
      return (
        <ul className="dcards">
          {block.items.map((c, i) => (
            <li key={i} className="dcard">
              {c.step && <span className="dcard-step">{c.step}</span>}
              <div className="dcard-body">
                {c.title && <h4 className="dcard-title">{c.title}</h4>}
                {c.body?.map((p, j) => (
                  <p key={j} className="dcard-text">
                    {p}
                  </p>
                ))}
                {c.bullets && (
                  <ul className="dchecks">
                    {c.bullets.map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                )}
                {c.meta && (
                  <p className="dcard-meta">
                    {c.meta.map((m, j) => (
                      <span key={j} className="chip">
                        {m}
                      </span>
                    ))}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      );

    case 'contact':
      return (
        <dl className="dcontact">
          {block.items.map((c, i) => (
            <div key={i}>
              <dt>{c.label}</dt>
              <dd>{c.value}</dd>
            </div>
          ))}
        </dl>
      );

    case 'tablabels':
      return (
        <p className="dcard-meta">
          {block.labels.map((l, i) => (
            <span key={i} className="chip">
              {l}
            </span>
          ))}
        </p>
      );

    case 'group':
      return (
        <div className="dgroup">
          <ServiceBlocks blocks={block.blocks} />
        </div>
      );

    default:
      return null;
  }
}
