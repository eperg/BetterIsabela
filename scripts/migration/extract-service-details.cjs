/**
 * One-off migration: service-details/*.html -> structured JSON.
 *
 * The 22 legacy detail pages were hand-written over time, so their markup
 * varies (section classes are prefixed per page: bc-section, mto-section,
 * process-section, ...). What is consistent is the *shape* of the content:
 * a page header, a row of quick stats, then sections made of checklists,
 * tables, card grids and prose.
 *
 * So this extracts meaning rather than markup. The React app renders the
 * result with its own design system — nothing from the old stylesheets, and
 * no raw HTML crosses over, which also removes the injection surface that
 * dangerouslySetInnerHTML would have introduced.
 *
 * Usage: node scripts/migration/extract-service-details.cjs
 * Output: react-app/src/data/service-details.json
 */
const fs = require('node:fs');
const path = require('node:path');
const { parse } = require('node-html-parser');

const SRC = path.join(__dirname, '../../service-details');
const OUT = path.join(__dirname, '../../react-app/src/data/service-details.json');

const clean = (s) =>
  (s ?? '')
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Bootstrap icon <i> elements carry no text but do leave stray whitespace. */
function textOf(node) {
  if (!node) return '';
  const copy = parse(node.outerHTML);
  copy.querySelectorAll('i, svg, script, style').forEach((n) => n.remove());
  return clean(copy.text);
}

const isEl = (n) => n && n.nodeType === 1;
const cls = (n) => (isEl(n) ? (n.getAttribute('class') ?? '') : '');
const hasClass = (n, name) => new RegExp(`(^|\\s)${name}(\\s|$)`).test(cls(n));
const tag = (n) => (isEl(n) ? n.tagName.toLowerCase() : '');

// ---------------------------------------------------------------------------
// Block extraction
// ---------------------------------------------------------------------------

function listItems(ul) {
  return ul
    .querySelectorAll(':scope > li')
    .map((li) => textOf(li))
    .filter(Boolean);
}

function tableBlock(table) {
  const caption = textOf(table.querySelector('caption'));
  const headRow = table.querySelector('thead tr') ?? table.querySelector('tr');
  const head = headRow ? headRow.querySelectorAll('th, td').map((c) => textOf(c)) : [];
  const bodyRows = (
    table.querySelector('tbody')
      ? table.querySelectorAll('tbody tr')
      : table.querySelectorAll('tr').slice(1)
  )
    .map((tr) => tr.querySelectorAll('td, th').map((c) => textOf(c)))
    .filter((r) => r.some(Boolean));
  if (!bodyRows.length) return null;
  return { type: 'table', caption: caption || undefined, head, rows: bodyRows };
}

/**
 * Is this element a card rather than a layout wrapper? Cards are named for what
 * they are (process-card, staff-card, service-card, faq-item, sidebar-card) and
 * never contain a section header of their own.
 */
function isCardLike(node) {
  if (/-(card|item|step|tag)\b/.test(cls(node))) {
    return !node.querySelector('.section-header, .section-header-card');
  }
  return false;
}

/** A card grid: staff-grid, service-grid, process-grid, faq lists, etc. */
function cardsBlock(grid) {
  const items = grid.childNodes.filter(isEl).map((card) => {
    const heading = card.querySelector('h3, h4, h5, .step-num, .step-badge');
    const step = textOf(card.querySelector('.step-num, .step-badge'));
    const title = textOf(card.querySelector('h3, h4, h5')) || (step ? '' : textOf(heading));
    const meta = card
      .querySelectorAll('.service-meta, .personnel-tag, .time-tag, .card-meta, .badge')
      .map((m) => textOf(m))
      .filter(Boolean);
    const bodyParts = card
      .querySelectorAll('p')
      .map((p) => textOf(p))
      .filter(Boolean);
    const bullets = card.querySelectorAll('ul').flatMap((ul) => listItems(ul));
    if (!title && !bodyParts.length && !bullets.length) return null;
    return {
      step: step || undefined,
      title: title || undefined,
      body: bodyParts.length ? bodyParts : undefined,
      bullets: bullets.length ? bullets : undefined,
      meta: meta.length ? [...new Set(meta)] : undefined,
    };
  });
  const kept = items.filter(Boolean);
  return kept.length ? { type: 'cards', items: kept } : null;
}

/**
 * Walk an element and turn its children into normalised blocks.
 *
 * `usedHeader` is the element the caller already consumed as the section
 * heading. Some pages nest a second .section-header further down the column
 * ("Frequently Asked Questions"); those become subheadings rather than being
 * dropped on the floor.
 */
function blocksFrom(container, usedHeader) {
  const blocks = [];

  const push = (b) => {
    if (b) blocks.push(b);
  };

  const visit = (node) => {
    if (!isEl(node)) return;
    const t = tag(node);
    if (t === 'script' || t === 'style') return;

    if (
      hasClass(node, 'section-header') ||
      hasClass(node, 'process-header') ||
      hasClass(node, 'section-header-card')
    ) {
      if (node === usedHeader) return;
      const text = textOf(node.querySelector('h2, h3, h4'));
      return push(text ? { type: 'subheading', text } : null);
    }

    // In-page jump navigation is a artefact of the old single-page layout.
    if (t === 'nav' || /\bnav\b/.test(cls(node))) return;

    // Stat rows. The card class differs per page (stat-card, quick-stat-card,
    // service-info-box) but the h4/p pairing inside is constant.
    if (hasClass(node, 'quick-stats') || hasClass(node, 'service-detail-header')) {
      const items = node
        .querySelectorAll('.stat-card, .quick-stat-card, .service-info-box')
        .map((c) => ({
          label: textOf(c.querySelector('h4, h5, .stat-label')),
          value: textOf(c.querySelector('p, .stat-value')),
          note: textOf(c.querySelector('small')) || undefined,
        }))
        .filter((s) => s.label || s.value);
      return push(items.length ? { type: 'stats', items } : null);
    }

    // Contact sidebar: label/value pairs.
    if (hasClass(node, 'contact-sidebar')) {
      const items = node
        .querySelectorAll('.contact-item')
        .map((c) => ({
          label: textOf(c.querySelector('strong')),
          value: textOf(c.querySelector('span, a, p')),
        }))
        .filter((c) => c.label && c.value);
      return push(items.length ? { type: 'contact', items } : null);
    }

    // Sub-headings inside a long section become their own labelled block.
    if (/^h[3-5]$/.test(t)) {
      const text = textOf(node);
      return push(text ? { type: 'subheading', text } : null);
    }

    if (t === 'table') return push(tableBlock(node));

    if (hasClass(node, 'table-responsive')) {
      return node.querySelectorAll('table').forEach((tb) => push(tableBlock(tb)));
    }

    // A titled box wrapping a list — the most common requirements pattern.
    if (hasClass(node, 'info-box') || hasClass(node, 'req-box')) {
      const title = textOf(node.querySelector('h3, h4, h5'));
      const items = node.querySelectorAll('ul, ol').flatMap((ul) => listItems(ul));
      const prose = node
        .querySelectorAll(':scope > p')
        .map((p) => textOf(p))
        .filter(Boolean);
      if (items.length) return push({ type: 'checklist', title: title || undefined, items });
      if (prose.length) return push({ type: 'prose', title: title || undefined, text: prose });
      return;
    }

    if (t === 'ul' || t === 'ol') {
      const items = listItems(node);
      return push(items.length ? { type: 'checklist', items } : null);
    }

    if (t === 'p') {
      const text = textOf(node);
      return push(text ? { type: 'prose', text: [text] } : null);
    }

    // Tabbed content: each panel becomes its own labelled group.
    if (hasClass(node, 'process-tabs')) {
      const labels = node.querySelectorAll('button, a').map((b) => textOf(b));
      return push(labels.length ? { type: 'tablabels', labels } : null);
    }
    if (hasClass(node, 'process-content') || hasClass(node, 'tab-content')) {
      const inner = blocksFrom(node, usedHeader);
      return push(inner.length ? { type: 'group', blocks: inner } : null);
    }

    // FAQ entries carry the question and answer in sibling divs.
    if (hasClass(node, 'faq-item')) {
      const q = textOf(node.querySelector('.faq-question'));
      const a = textOf(node.querySelector('.faq-answer'));
      return push(
        q || a ? { type: 'cards', kind: 'faq', items: [{ title: q, body: a ? [a] : undefined }] } : null
      );
    }

    // A grid of cards — but only when the children really are cards. Several
    // pages use grid classes (info-grid, mswdo-layout) for page *layout*, with
    // whole sections inside; treating those as cards flattened two requirement
    // boxes and a section header into one meaningless blob.
    const kids = node.childNodes.filter(isEl);
    if (kids.length > 1 && kids.every(isCardLike)) {
      const cards = cardsBlock(node);
      if (cards) return push({ ...cards, kind: cls(kids[0]).trim().split(/\s+/)[0] });
    }

    // Otherwise descend.
    node.childNodes.forEach(visit);
  };

  container.childNodes.forEach(visit);
  return coalesce(blocks);
}

/**
 * Adjacent card blocks of the same kind read better as one list — FAQ entries
 * are emitted one per element. Only the same kind, though: the two-column
 * layouts put a sidebar right after the FAQs, and merging those would file
 * "Office Information" under "Frequently Asked Questions".
 */
function coalesce(blocks) {
  const out = [];
  for (const b of blocks) {
    const prev = out[out.length - 1];
    if (b.type === 'cards' && prev?.type === 'cards' && prev.kind === b.kind) {
      prev.items.push(...b.items);
    } else {
      out.push(b);
    }
  }
  // `kind` is a grouping hint for this script, not something the app renders.
  return out.map(({ kind, ...rest }) => rest);
}

// ---------------------------------------------------------------------------
// Page extraction
// ---------------------------------------------------------------------------

const PHONE = /(?:\(?0?\d{2,4}\)?[\s-]?)?\d{3}[\s-]?\d{4}|09\d{9}/g;

function extract(file) {
  const slug = path.basename(file, '.html');
  const root = parse(fs.readFileSync(path.join(SRC, file), 'utf8'));
  const main = root.querySelector('main') ?? root;

  const title = textOf(main.querySelector('.page-header h1')) || slug;
  const category = textOf(main.querySelector('.page-header-badge'));
  const description = textOf(main.querySelector('.page-header-desc'));

  const sections = [];
  let stats = [];

  // Section units. Four of the pages wrap everything in two <section> elements
  // and do the real division with .service-section, so expand those rather than
  // emitting one section with fifty blocks.
  const units = [];
  for (const section of main.querySelectorAll('section')) {
    if (hasClass(section, 'page-header')) continue;
    const inner = section.querySelectorAll('.service-section');
    if (inner.length > 1) {
      const before = section.querySelector('.quick-stats');
      if (before) units.push(before);
      units.push(...inner);
      const sidebar = section.querySelector('.contact-sidebar');
      if (sidebar) units.push(sidebar);
    } else {
      units.push(section);
    }
  }

  for (const section of units) {
    const container = section.querySelector('.container') ?? section;

    const heading = textOf(
      container.querySelector('.section-header h2, .process-header h2, .section-header-card h2, h2')
    );
    const headerEl = container.querySelector(
      '.section-header, .process-header, .section-header-card'
    );
    const lead = headerEl ? textOf(headerEl.querySelector('p')) : '';

    const blocks = blocksFrom(container, headerEl);

    // The quick-stats row is page-level, not a section of its own.
    const statBlock = blocks.find((b) => b.type === 'stats');
    if (statBlock && !stats.length) {
      stats = statBlock.items;
    }
    const rest = blocks.filter((b) => b !== statBlock);
    if (!rest.length) continue;

    sections.push({
      heading: heading || undefined,
      lead: lead && lead !== heading ? lead : undefined,
      blocks: rest,
    });
  }

  // Contact details, pulled from anywhere on the page.
  const bodyText = textOf(main);
  const phones = [...new Set((bodyText.match(PHONE) ?? []).map(clean))].filter(
    (p) => p.replace(/\D/g, '').length >= 7
  );
  const emails = [
    ...new Set(
      main
        .querySelectorAll('a[href^="mailto:"]')
        .map((a) => a.getAttribute('href').replace('mailto:', '').trim())
    ),
  ];

  return {
    slug,
    title,
    category: category || undefined,
    description: description || undefined,
    stats,
    sections,
    contact: {
      phones: phones.length ? phones : undefined,
      emails: emails.length ? emails : undefined,
    },
  };
}

/**
 * Three offices were documented across two pages each, and neither half is a
 * subset of the other: one lists the services, the other lists the personnel.
 * Splitting them serves nobody, so they are merged into a single page and the
 * retired slug is kept as an alias so existing links still resolve.
 *
 * Canonical slug is the one services.json already points at.
 */
const MERGE = {
  'civil-registrar': 'provincial-civil-registrar',
  'general-services': 'provincial-general-services',
  'pswdo-services': 'pswdo',
};

function merge(pages) {
  const bySlug = new Map(pages.map((p) => [p.slug, p]));
  const dropped = new Set();

  for (const [canonical, secondary] of Object.entries(MERGE)) {
    const a = bySlug.get(canonical);
    const b = bySlug.get(secondary);
    if (!a || !b) continue;

    const seen = new Set(a.sections.map((s) => (s.heading ?? '').toLowerCase()));
    for (const section of b.sections) {
      const key = (section.heading ?? '').toLowerCase();
      // Headingless sections are usually a trailing notes/office card; keeping
      // both would duplicate them, so only merge titled ones that are new.
      if (!key || seen.has(key)) continue;
      a.sections.push(section);
      seen.add(key);
    }
    if (!a.stats.length) a.stats = b.stats;
    a.contact = {
      phones: [...new Set([...(a.contact.phones ?? []), ...(b.contact.phones ?? [])])],
      emails: [...new Set([...(a.contact.emails ?? []), ...(b.contact.emails ?? [])])],
    };
    if (!a.contact.phones.length) delete a.contact.phones;
    if (!a.contact.emails.length) delete a.contact.emails;
    a.aliases = [secondary];
    dropped.add(secondary);
    console.log(`merged ${secondary} -> ${canonical}`);
  }

  return pages.filter((p) => !dropped.has(p.slug));
}

const files = fs.readdirSync(SRC).filter((f) => f.endsWith('.html')).sort();
const pages = merge(files.map(extract));

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(pages, null, 2) + '\n');

for (const p of pages) {
  const blocks = p.sections.reduce((n, s) => n + s.blocks.length, 0);
  console.log(
    `${p.slug.padEnd(32)} ${String(p.stats.length).padStart(2)} stats  ` +
      `${String(p.sections.length).padStart(2)} sections  ${String(blocks).padStart(3)} blocks` +
      (p.sections.length ? '' : '   <-- EMPTY')
  );
}
console.log(`\n${pages.length} pages -> ${path.relative(process.cwd(), OUT)}`);
