/**
 * Town progress tracker — DPWH contracts for Isabela, from DBM's Project DIME.
 *
 *   npm run sync:projects            apply
 *   npm run sync:projects -- --dry   report what would change, write nothing
 *   npm run sync:projects -- --limit 50
 *
 * Why DIME and not DPWH directly: DPWH's own project pages are an iframe shell
 * and apps.dpwh.gov.ph/infra_projects is a 404. DIME re-publishes the same
 * contracts through a REST API that needs no key, and it is the only source
 * found that carries cost, contractor, dates and a municipality together.
 *
 * Two things about DIME are not discoverable from its own documentation, and
 * both cost an afternoon to find:
 *
 *   1. /uacs/locations/provinces omits Isabela entirely — Region II returns only
 *      Batanes, Cagayan, Nueva Vizcaya and Quirino. The province filter works
 *      anyway with the real UACS code, 0203100000.
 *   2. /uacs/locations/cities-municipalities returns Isabela's towns with
 *      truncated codes ("3101", provinceCode "31") and omits Ilagan and Delfin
 *      Albano. Those codes match nothing. The 10-digit UACS codes below do, and
 *      all 37 towns answer to them — so the map is written out here rather than
 *      read from an endpoint that would silently drop the capital.
 *
 * Nothing is estimated. Where DIME does not state a figure the column stays
 * null: budget utilisation is never populated upstream, so percent complete is
 * only ever set to 100 for a contract DIME itself reports as Completed.
 */
import postgres from 'postgres';

const API = 'https://www.dime.gov.ph/api/v1';
const PROVINCE = '0203100000';
const SOURCE_NAME = 'DBM Project DIME';
const PAGE_SIZE = 100; // 250 is rejected with a 400
const PAUSE_MS = 600; // this is somebody else's government API, and it rate-limits

const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const LIMIT = (() => {
  const i = args.indexOf('--limit');
  return i === -1 ? null : Number(args[i + 1]);
})();

/** UACS city/municipality code -> our town slug. All 37 LGUs, in code order. */
const TOWN_BY_CODE = {
  '0203101000': 'alicia',
  '0203102000': 'angadanan',
  '0203103000': 'aurora',
  '0203104000': 'benito-soliven',
  '0203105000': 'burgos',
  '0203106000': 'cabagan',
  '0203107000': 'cabatuan',
  '0203108000': 'cauayan-city',
  '0203109000': 'cordon',
  '0203110000': 'dinapigue',
  '0203111000': 'divilacan',
  '0203112000': 'echague',
  '0203113000': 'gamu',
  '0203114000': 'ilagan-city',
  '0203115000': 'jones',
  '0203116000': 'luna',
  '0203117000': 'maconacon',
  // DIME still carries this one under its former name, Magsaysay.
  '0203118000': 'delfin-albano',
  '0203119000': 'mallig',
  '0203120000': 'naguilian',
  '0203121000': 'palanan',
  '0203122000': 'quezon',
  '0203123000': 'quirino',
  '0203124000': 'ramon',
  // The slug is misspelled in the towns table; the town is Reina Mercedes.
  '0203125000': 'reina-mercedez',
  '0203126000': 'roxas',
  '0203127000': 'san-agustin',
  '0203128000': 'san-guillermo',
  '0203129000': 'san-isidro',
  '0203130000': 'san-manuel',
  '0203131000': 'san-mariano',
  '0203132000': 'san-mateo',
  '0203133000': 'san-pablo',
  '0203134000': 'santa-maria',
  '0203135000': 'santiago-city',
  '0203136000': 'santo-tomas',
  '0203137000': 'tumauini',
};

/** DIME's contract status -> our enum. Anything unlisted is skipped, not guessed. */
const STATUS_BY_DIME = {
  Ongoing: 'ongoing',
  Completed: 'completed',
  Terminated: 'cancelled',
  Suspended: 'suspended',
};

/**
 * Category, in order of specificity — a flood-control contract that protects a
 * public building says both "FLOOD" and "BUILDING", and it is a flood-control
 * project. Derived here rather than published by DIME, which is why the contract
 * name it was derived from is kept verbatim in the description.
 */
const CATEGORIES = [
  [/FLOOD|DRAINAGE|REVETMENT|DIKE|SEA WALL|RIVER CONTROL/, 'Flood control'],
  [/BRIDGE/, 'Bridges'],
  [/SLOPE PROTECTION|LANDSLIDE/, 'Slope protection'],
  [/WATER SUPPLY|WATER SYSTEM/, 'Water supply'],
  [/SCHOOL|CLASSROOM/, 'Education'],
  [/HOSPITAL|HEALTH/, 'Health'],
  [/EVACUATION/, 'Evacuation centres'],
  [/ROAD|BY-PASS|DIVERSION|PAVEMENT|ASSET PRESERVATION/, 'Roads'],
  [/BUILDING|MULTI-PURPOSE/, 'Public buildings'],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * One GET, with backoff. DIME rate-limits a full province pull, so a 429 is an
 * expected part of the run rather than a failure: wait for as long as it asks
 * for, or exponentially, and carry on. Giving up early would leave the tracker
 * holding a partial province and no way to tell.
 */
async function fetchJson(path, attempt = 1) {
  const MAX_ATTEMPTS = 6;
  try {
    const res = await fetch(API + path, {
      headers: { 'user-agent': 'betterisabela.org project sync', accept: 'application/json' },
    });
    if (res.status === 429 || res.status >= 500) {
      const asked = Number(res.headers.get('retry-after'));
      const wait = Number.isFinite(asked) && asked > 0 ? asked * 1000 : 2000 * 2 ** (attempt - 1);
      if (attempt >= MAX_ATTEMPTS) throw new Error(`HTTP ${res.status} after ${attempt} attempts`);
      process.stdout.write(`\r  ${res.status} — waiting ${Math.round(wait / 1000)}s          `);
      await sleep(wait);
      return fetchJson(path, attempt + 1);
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    if (attempt >= MAX_ATTEMPTS || /HTTP 4[0-46-9]/.test(err.message)) {
      throw new Error(`${path}: ${err.message}`);
    }
    await sleep(2000 * attempt);
    return fetchJson(path, attempt + 1);
  }
}

/** Every page of one cards query, flattened. */
async function fetchAllCards(query) {
  const out = [];
  for (let page = 1; ; page += 1) {
    const d = await fetchJson(`/projects/cards?${query}&perPage=${PAGE_SIZE}&page=${page}`);
    out.push(...d.data);
    if (out.length >= d.pagination.total || d.data.length === 0) return out;
    await sleep(PAUSE_MS);
  }
}

/**
 * Which towns each contract touches. A province-wide query returns the contract
 * but not its municipality, so the towns come from filtering by each town in
 * turn: DIME answers that filter from its own location records, and a road that
 * crosses three municipalities is returned by all three.
 */
async function fetchTownsByProject() {
  const towns = new Map();
  for (const [code, slug] of Object.entries(TOWN_BY_CODE)) {
    const rows = await fetchAllCards(`cityCode=${code}`);
    for (const r of rows) {
      if (!towns.has(r.projectCode)) towns.set(r.projectCode, new Set());
      towns.get(r.projectCode).add(slug);
    }
    process.stdout.write(`\r  locating: ${slug.padEnd(16)} ${rows.length} contracts   `);
    await sleep(PAUSE_MS);
  }
  process.stdout.write('\r' + ' '.repeat(60) + '\r');
  return towns;
}

const matchCategory = (text) => {
  const t = (text ?? '').toUpperCase();
  for (const [re, name] of CATEGORIES) if (re.test(t)) return name;
  return null;
};

/**
 * The project's own name decides the category, and only then the contract name.
 * DPWH programme titles say "access roads and/or bridges" whatever the works
 * are, so reading them first files every barangay road under Bridges.
 */
const categoryOf = (projectName, contractName) =>
  matchCategory(projectName) ?? matchCategory(contractName) ?? 'Infrastructure';

/**
 * The DPWH programme a contract sits under, which is what pays for it. Matched
 * in the source's own phrasing rather than relabelled, so the funding line can
 * be checked against the contract it came from. Splitting on the first dash
 * instead would yield "Organizational Outcome 1", which funds nothing.
 */
const PROGRAMMES = [
  [/SUSTAINABLE INFRASTRUCTURE PROJECTS ALLEVIATING GAPS/, 'DPWH Sustainable Infrastructure Projects Alleviating Gaps (SIPAG)'],
  [/BASIC INFRASTRUCTURE PROGRAM/, 'DPWH Basic Infrastructure Program (BIP)'],
  [/CONVERGENCE AND SPECIAL SUPPORT PROGRAM|\bCSSP\b/, 'DPWH Convergence and Special Support Program (CSSP)'],
  [/FLOOD MANAGEMENT\s+PROGRAM/, 'DPWH Flood Management Program'],
  [/TOURISM ROAD INFRASTRUCTURE PROGRAM/, 'DPWH Tourism Road Infrastructure Program'],
  // Both of these appear with and without the trailing "Program".
  [/ASSET PRESERVATION/, 'DPWH Asset Preservation Program'],
  [/NETWORK DEVELOPMENT/, 'DPWH Network Development Program'],
  [/SPECIAL ROAD FUND/, 'DPWH Special Road Fund'],
  [/BRIDGE PROGRAM/, 'DPWH Bridge Program'],
  [/RAINWATER COLLECT(?:OR|ION)/, 'DPWH rainwater collection programme'],
];

const programmeOf = (contractName) => {
  const t = (contractName ?? '').toUpperCase();
  for (const [re, label] of PROGRAMMES) if (re.test(t)) return label;
  return null;
};

const clean = (s) => (typeof s === 'string' ? s.replace(/\s+/g, ' ').trim() || null : null);

/** Words that stay lowercase inside a title, unless they open it. */
const MINOR = new Set([
  'a', 'an', 'and', 'as', 'at', 'by', 'for', 'from', 'in', 'of', 'on', 'or',
  'the', 'to', 'with',
]);

/** Acronyms DPWH writes in caps, which must survive being re-cased. */
const ACRONYMS = new Set([
  'DPWH', 'SIPAG', 'BIP', 'CSSP', 'RWCS', 'LGU', 'NIA', 'DEO', 'MRT', 'PS',
  'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
]);

/**
 * DPWH publishes contract names in block capitals, which is unreadable at
 * paragraph length and makes every card shout. This re-cases the same words —
 * nothing is added, removed or reordered — and leaves anything with a digit in
 * it alone, because station markers like K0378+803 mean something exactly as
 * written.
 */
function readable(text) {
  if (!text) return null;
  const letters = text.replace(/[^A-Za-z]/g, '');
  const shouting = letters.length > 8 && letters === letters.toUpperCase();
  const body = text
    // The outcome statement is departmental boilerplate repeated on thousands of
    // contracts; the programme and the works are what a reader is here for.
    .replace(/^\s*(?:ORGANIZATIONAL OUTCOME|OO)\s*\d*\s*:?\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!shouting) return body || null;

  const cased = body
    .split(' ')
    .map((word, i) => {
      if (/\d/.test(word)) return word;
      const bare = word.replace(/[^A-Za-z]/g, '');
      if (ACRONYMS.has(bare)) return word;
      const lower = word.toLowerCase();
      if (i > 0 && MINOR.has(bare.toLowerCase()) && bare === word.replace(/[^A-Za-z]/g, '')) {
        return lower;
      }
      // Slash-joined words are cased part by part, so "REHABILITATION/
      // RECONSTRUCTION" keeps both capitals while "AND/OR" and "ROAD/S" do not
      // gain any.
      return lower
        .split('/')
        .map((part) =>
          part.length < 2 || MINOR.has(part.replace(/[^a-z]/g, ''))
            ? part
            : part.charAt(0).toUpperCase() + part.slice(1)
        )
        .join('/');
    })
    .join(' ');
  return cased.charAt(0).toUpperCase() + cased.slice(1);
}
const day = (iso) => (iso ? iso.slice(0, 10) : null);

/** One DIME card plus its towns -> one row for the projects table, or null. */
function toRow(card, townSet) {
  // Every Isabela contract carries exactly one sub-project, and it is the only
  // place the real status, contractor and dates appear: the parent row reports
  // "Not Yet Started" for all 2,289 of them.
  const sub = (card.subProjects ?? [])[0];
  const status = STATUS_BY_DIME[sub?.status ?? card.status];
  if (!status) return null;

  const towns = [...(townSet ?? [])].sort();
  const contract = clean(sub?.projectName);
  const office = clean(sub?.uacsOperatingUnitName);
  const cost = Number(card.cost);

  const notes = [];
  const works = readable(contract);
  if (works) notes.push(works.replace(/\.?$/, '.'));
  if (office) notes.push(`Implemented by the ${office}.`);
  if (towns.length > 1) notes.push(`Crosses ${towns.length} municipalities of Isabela.`);

  return {
    sourceRef: `dime:${card.projectCode}`,
    // A road crossing three municipalities belongs to none of them on its own,
    // so it is recorded province-wide rather than attributed to one arbitrarily.
    townSlug: towns.length === 1 ? towns[0] : null,
    title: clean(card.projectName) ?? `DPWH contract ${card.projectCode}`,
    description: notes.join(' ') || null,
    category: categoryOf(card.projectName, contract),
    status,
    percentComplete: status === 'completed' ? 100 : null,
    costCentavos: Number.isFinite(cost) && cost > 0 ? Math.round(cost * 100) : null,
    fundingSource: programmeOf(contract),
    contractor: clean(sub?.contractorName),
    startedOn: day(sub?.actualDateStarted ?? sub?.dateStarted ?? card.dateStarted),
    targetOn: day(sub?.contractCompletionDate ?? card.contractCompletionDate),
    completedOn: day(sub?.actualContractCompletionDate),
    sourceUrl: `https://www.dime.gov.ph/project/${card.id}`,
  };
}

// ---------------------------------------------------------------------------

const total = (await fetchJson(`/projects/cards?provinceCode=${PROVINCE}&perPage=1&page=1`))
  .pagination.total;
console.log(`Project DIME reports ${total} contracts for Isabela.\n`);

const cards = await fetchAllCards(`provinceCode=${PROVINCE}`);
console.log(`  fetched ${cards.length} contracts`);
const townsByProject = await fetchTownsByProject();
console.log(`  located ${townsByProject.size} of them in at least one town\n`);

const rows = [];
const skipped = new Map();
for (const card of cards) {
  const row = toRow(card, townsByProject.get(card.projectCode));
  if (row) rows.push(row);
  else {
    const s = (card.subProjects ?? [])[0]?.status ?? card.status ?? 'no status';
    skipped.set(s, (skipped.get(s) ?? 0) + 1);
  }
}
const batch = LIMIT ? rows.slice(0, LIMIT) : rows;

const byStatus = {};
const byCategory = {};
let placed = 0;
let funded = 0;
for (const r of batch) {
  byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
  byCategory[r.category] = (byCategory[r.category] ?? 0) + 1;
  if (r.townSlug) placed += 1;
  if (r.fundingSource) funded += 1;
}
console.log(`${batch.length} rows ready — ${placed} attributed to one town, ${batch.length - placed} province-wide`);
console.log('  status:  ', Object.entries(byStatus).map(([k, v]) => `${v} ${k}`).join(', '));
console.log('  category:', Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${v} ${k}`).join(', '));
console.log(`  funding programme named for ${funded} of ${batch.length}`);
if (skipped.size) {
  console.log('  skipped: ', [...skipped].map(([k, v]) => `${v} × "${k}"`).join(', '), '— no status this schema can state');
}

if (DRY) {
  console.log('\n--dry: nothing written. Sample row:');
  console.log(batch[0]);
  process.exit(0);
}

const url = process.env.DATABASE_URL ?? 'postgres://postgres@127.0.0.1:5432/postgres';
const sql = postgres(url, { max: 1 });

const known = new Set(
  (await sql`SELECT slug FROM towns`).map((t) => t.slug)
);
const unknown = [...new Set(batch.map((r) => r.townSlug).filter((s) => s && !known.has(s)))];
if (unknown.length) {
  console.error(`\nAborting: town slugs not in the towns table — ${unknown.join(', ')}`);
  await sql.end();
  process.exit(1);
}

/**
 * Written in batches rather than a statement per contract. Two thousand
 * round-trips to a hosted database is eight minutes of waiting; the same rows in
 * chunks is seconds, which is the difference between a script somebody runs and
 * one they schedule.
 */
const COLUMNS = [
  'town_slug', 'title', 'description', 'category', 'status', 'percent_complete',
  'cost_centavos', 'funding_source', 'contractor', 'started_on', 'target_on',
  'completed_on', 'source_name', 'source_url', 'source_ref', 'verified_on', 'updated_at',
];
const BATCH = 200;
const now = new Date();

const record = (r) => ({
  town_slug: r.townSlug,
  title: r.title,
  description: r.description,
  category: r.category,
  status: r.status,
  percent_complete: r.percentComplete,
  cost_centavos: r.costCentavos,
  funding_source: r.fundingSource,
  contractor: r.contractor,
  started_on: r.startedOn,
  target_on: r.targetOn,
  completed_on: r.completedOn,
  source_name: SOURCE_NAME,
  source_url: r.sourceUrl,
  source_ref: r.sourceRef,
  verified_on: now,
  updated_at: now,
});

let inserted = 0;
let updated = 0;
for (let i = 0; i < batch.length; i += BATCH) {
  const chunk = batch.slice(i, i + BATCH).map(record);
  const written = await sql`
    INSERT INTO projects ${sql(chunk, ...COLUMNS)}
    ON CONFLICT (source_ref) DO UPDATE SET
      town_slug = EXCLUDED.town_slug, title = EXCLUDED.title,
      description = EXCLUDED.description, category = EXCLUDED.category,
      status = EXCLUDED.status, percent_complete = EXCLUDED.percent_complete,
      cost_centavos = EXCLUDED.cost_centavos, funding_source = EXCLUDED.funding_source,
      contractor = EXCLUDED.contractor, started_on = EXCLUDED.started_on,
      target_on = EXCLUDED.target_on, completed_on = EXCLUDED.completed_on,
      source_url = EXCLUDED.source_url, verified_on = EXCLUDED.verified_on,
      updated_at = EXCLUDED.updated_at
    RETURNING (xmax = 0) AS is_insert`;
  for (const row of written) row.is_insert ? (inserted += 1) : (updated += 1);
  process.stdout.write(`\r  written ${Math.min(i + BATCH, batch.length)}/${batch.length}   `);
}
process.stdout.write('\r' + ' '.repeat(40) + '\r');

const tally = await sql`SELECT status, count(*)::int AS n FROM projects GROUP BY status ORDER BY n DESC`;
const [{ n: unsourced }] = await sql`SELECT count(*)::int AS n FROM projects WHERE source_url IS NULL`;
const [{ n: townless }] = await sql`SELECT count(*)::int AS n FROM projects WHERE town_slug IS NULL`;
const [{ n: townsHit }] = await sql`SELECT count(DISTINCT town_slug)::int AS n FROM projects WHERE town_slug IS NOT NULL`;

console.log(`\n${inserted} inserted, ${updated} updated.`);
for (const t of tally) console.log(`  ${t.n} ${t.status}`);
console.log(`  ${townsHit} of 37 towns have at least one project`);
console.log(`  ${townless} recorded province-wide`);
console.log(unsourced === 0 ? '  every project cites a source' : `  WARNING: ${unsourced} without a source`);
await sql.end();
