/**
 * Applies migrations and seeds reference data, against whichever driver
 * DATABASE_URL selects (PGlite by default, real Postgres when a URL is set).
 *
 *   node scripts/db.mjs migrate
 *   node scripts/db.mjs seed
 *   node scripts/db.mjs reset     # drop everything, migrate, seed
 */
import { readFileSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const repoRoot = join(root, '..');
const command = process.argv[2] ?? 'migrate';
const url = process.env.DATABASE_URL?.trim();
const usePglite = !url || url === 'pglite';
const dataDir = process.env.PGLITE_DIR ?? join(root, '.pglite');

async function connect() {
  if (usePglite) {
    const { PGlite } = await import('@electric-sql/pglite');
    const pg = new PGlite(dataDir);
    return {
      kind: 'pglite',
      exec: (sql) => pg.exec(sql),
      query: (sql, params = []) => pg.query(sql, params).then((r) => r.rows),
      end: () => pg.close(),
    };
  }
  const { default: postgres } = await import('postgres');
  const sql = postgres(url, { max: 1 });
  return {
    kind: 'postgres',
    exec: (text) => sql.unsafe(text),
    query: (text, params = []) => sql.unsafe(text, params),
    end: () => sql.end(),
  };
}

async function migrate(db) {
  const dir = join(root, 'drizzle');
  const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  await db.exec(`CREATE TABLE IF NOT EXISTS _migrations (
    name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`);
  const done = new Set((await db.query(`SELECT name FROM _migrations`)).map((r) => r.name));

  let applied = 0;
  for (const file of files) {
    if (done.has(file)) continue;
    const sql = readFileSync(join(dir, file), 'utf8');
    const parts = sql.includes('--> statement-breakpoint')
      ? sql.split('--> statement-breakpoint')
      : [sql];
    for (const part of parts) if (part.trim()) await db.exec(part);
    await db.query(`INSERT INTO _migrations (name) VALUES ($1)`, [file]);
    console.log(`  applied ${file}`);
    applied += 1;
  }
  console.log(applied ? `${applied} migration(s) applied.` : 'Already up to date.');
}

function readJson(p) {
  return JSON.parse(readFileSync(p, 'utf8'));
}

async function seed(db) {
  // --- towns: the 37 LGUs from the official provincial directory -------------
  const towns = readJson(join(repoRoot, 'data', 'towns.json')).towns;
  for (const t of towns) {
    await db.query(
      `INSERT INTO towns (slug,name,lgu_type,income_class,barangays,population,households,
         land_area_hectares,census_year,market_name,official_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (slug) DO UPDATE SET
         name=EXCLUDED.name, lgu_type=EXCLUDED.lgu_type, income_class=EXCLUDED.income_class,
         barangays=EXCLUDED.barangays, population=EXCLUDED.population,
         households=EXCLUDED.households, land_area_hectares=EXCLUDED.land_area_hectares,
         census_year=EXCLUDED.census_year, market_name=EXCLUDED.market_name,
         official_url=EXCLUDED.official_url, updated_at=now()`,
      [t.slug, t.name, t.lguType, t.incomeClass, t.barangays, t.population, t.households,
       t.landAreaHectares ? Math.round(t.landAreaHectares) : null, t.censusYear, t.market, t.url]
    );
  }
  console.log(`  towns: ${towns.length}`);

  // --- officials: mayors and vice mayors, from the same directory ------------
  let officials = 0;
  for (const t of towns) {
    for (const [name, position] of [[t.mayor, 'Mayor'], [t.viceMayor, 'Vice Mayor']]) {
      if (!name) continue;
      const existing = await db.query(
        `SELECT id FROM officials WHERE town_slug=$1 AND position=$2 LIMIT 1`, [t.slug, position]);
      if (existing.length) continue;
      await db.query(
        `INSERT INTO officials (town_slug,name,position,office,source_url)
         VALUES ($1,$2,$3,$4,$5)`,
        [t.slug, name, position, `Office of the ${position}, ${t.name}`, t.url]
      );
      officials += 1;
    }
  }

  // provincial-level officials: governor, vice governor, Sangguniang Panlalawigan
  const provPath = join(repoRoot, 'data', 'officials.json');
  if (existsSync(provPath)) {
    const raw = readJson(provPath);
    const list = [
      raw.governor,
      raw.vice_governor,
      ...(raw.board_members ?? []),
      ...(raw.officials ?? []),
    ].filter(Boolean);
    for (const o of list) {
      const name = (o.name ?? o.fullName ?? '').replace(/^Hon\.\s*/i, '');
      const position = o.position ?? o.title ?? o.role;
      if (!name || !position) continue;
      const existing = await db.query(
        `SELECT id FROM officials WHERE town_slug IS NULL AND name=$1 AND position=$2 LIMIT 1`,
        [name, position]);
      if (existing.length) continue;
      await db.query(
        `INSERT INTO officials (town_slug,name,position,office,source_url)
         VALUES (NULL,$1,$2,$3,$4)`,
        [name, position, o.office ?? o.district ?? 'Provincial Government of Isabela',
         raw._source ?? 'https://provinceofisabela.gov.ph/directory/']
      );
      officials += 1;
    }
  }
  console.log(`  officials: ${officials} inserted`);

  // --- projects: seeded empty on purpose -------------------------------------
  // data/dpwh-projects.json was cleared during the rebrand audit because its
  // records were Solano-located. Nothing goes in here without a named source.
  const dpwh = readJson(join(repoRoot, 'data', 'dpwh-projects.json'));
  console.log(`  projects: ${dpwh.projects.length} (source is migration_pending)`);
}

const db = await connect();
console.log(`[${db.kind}] ${command}`);

if (command === 'reset') {
  if (usePglite && existsSync(dataDir)) {
    await db.end();
    rmSync(dataDir, { recursive: true, force: true });
    console.log('  dropped .pglite');
    const fresh = await connect();
    await migrate(fresh);
    await seed(fresh);
    await fresh.end();
    process.exit(0);
  }
  await db.exec(`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`);
  console.log('  dropped public schema');
  await migrate(db);
  await seed(db);
} else if (command === 'migrate') {
  await migrate(db);
} else if (command === 'seed') {
  await seed(db);
} else {
  console.error(`unknown command: ${command}`);
  process.exitCode = 1;
}
await db.end();
