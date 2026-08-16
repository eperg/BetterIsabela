import type { Block } from '@/lib/legal-content';

/**
 * Renders migrated prose blocks, grouping consecutive list items back into a
 * single <ul> so the markup is semantic rather than a flat run of <li>.
 */
export default function Prose({ blocks }: { blocks: Block[] }) {
  const out: React.ReactNode[] = [];
  let list: string[] = [];

  const flush = (key: number) => {
    if (!list.length) return;
    out.push(
      <ul className="prose-list" key={`ul-${key}`}>
        {list.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    );
    list = [];
  };

  blocks.forEach(([tag, text], i) => {
    if (tag === 'li') {
      list.push(text);
      return;
    }
    flush(i);
    if (tag === 'h2') out.push(<h2 className="sectionhead" key={i}>{text}</h2>);
    else if (tag === 'h3') out.push(<h3 key={i}>{text}</h3>);
    else if (tag === 'h4') out.push(<h4 key={i}>{text}</h4>);
    else out.push(<p key={i}>{text}</p>);
  });
  flush(blocks.length);

  return <div className="prose prose--doc">{out}</div>;
}
