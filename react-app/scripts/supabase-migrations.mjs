/**
 * Mirrors drizzle/*.sql into supabase/migrations/ so the Supabase CLI can apply
 * them to the hosted database.
 *
 * Why a mirror rather than a second set of migrations: the app's own runner
 * (scripts/db.mjs) applies drizzle/*.sql to local PGlite, and the hosted database
 * needs the same statements applied by an owner, which only the CLI can do. One
 * authored copy, two transports. Nothing here is hand-edited: if a file drifts
 * from its drizzle original, this rewrites it.
 *
 * Versions are derived from the drizzle prefix rather than the clock, so the
 * ordering the app uses is the ordering the CLI uses, and re-running this is a
 * no-op instead of a new migration.
 *
 *   node scripts/supabase-migrations.mjs          # write the mirror
 *   node scripts/supabase-migrations.mjs --list   # show version -> file
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const from = join(root, 'drizzle');
const to = join(root, 'supabase', 'migrations');

/** 0003_service_reports.sql -> 20260101000003_service_reports */
function versionFor(file) {
  const [, seq, name] = /^(\d{4})_(.+)\.sql$/.exec(file) ?? [];
  if (!seq) return null;
  // A fixed base date plus the sequence number: stable, ordered, and obviously
  // synthetic so nobody mistakes it for the date the migration was written.
  return { version: `2026010100${seq}`, name, target: `2026010100${seq}_${name}.sql` };
}

const files = readdirSync(from).filter((f) => f.endsWith('.sql')).sort();
const mapped = files.map((f) => ({ file: f, ...versionFor(f) })).filter((m) => m.version);

if (process.argv.includes('--list')) {
  for (const m of mapped) console.log(`${m.version}  ${m.file}`);
  process.exit(0);
}

if (!existsSync(to)) mkdirSync(to, { recursive: true });
let written = 0;
for (const m of mapped) {
  const body = readFileSync(join(from, m.file), 'utf8');
  const path = join(to, m.target);
  const header =
    `-- Mirrored from drizzle/${m.file} by scripts/supabase-migrations.mjs.\n` +
    `-- Edit the drizzle original, never this copy.\n\n`;
  const next = header + body;
  if (existsSync(path) && readFileSync(path, 'utf8') === next) continue;
  writeFileSync(path, next);
  console.log(`  wrote ${m.target}`);
  written += 1;
}
console.log(written ? `${written} file(s) written.` : 'Mirror already current.');
