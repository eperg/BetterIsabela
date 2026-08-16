/**
 * Applies every migration to an in-memory Postgres (PGlite) and exercises the
 * constraints. Proves the schema is valid Postgres and that the integrity rules
 * actually reject bad data — without needing a database server.
 *
 *   node scripts/verify-schema.mjs
 */
import { PGlite } from '@electric-sql/pglite';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(import.meta.dirname, '..', 'drizzle');
const db = new PGlite();

let applied = 0;
for (const file of readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()) {
  const sql = readFileSync(join(dir, file), 'utf8');
  // drizzle-kit separates statements with this marker; plain files run whole.
  const statements = sql.includes('--> statement-breakpoint')
    ? sql.split('--> statement-breakpoint')
    : [sql];
  for (const statement of statements) {
    if (statement.trim()) await db.exec(statement);
  }
  applied += 1;
  console.log(`applied ${file}`);
}

const tables = await db.query(
  `SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`
);
console.log(`\n${applied} migration(s), ${tables.rows.length} tables:`);
console.log('  ' + tables.rows.map((r) => r.tablename).join(', '));

const checks = await db.query(
  `SELECT conname FROM pg_constraint WHERE contype='c' AND connamespace='public'::regnamespace ORDER BY conname`
);
console.log(`\n${checks.rows.length} CHECK constraint(s) installed.`);

// --- exercise the rules -----------------------------------------------------
let pass = 0;
let fail = 0;

async function rejects(label, fn) {
  try {
    await fn();
    console.log(`  FAIL  ${label} — was accepted but should have been rejected`);
    fail += 1;
  } catch {
    console.log(`  ok    ${label}`);
    pass += 1;
  }
}
async function accepts(label, fn) {
  try {
    await fn();
    console.log(`  ok    ${label}`);
    pass += 1;
  } catch (error) {
    console.log(`  FAIL  ${label} — ${error.message}`);
    fail += 1;
  }
}

console.log('\nConstraint behaviour:');

await db.exec(`INSERT INTO towns (slug, name) VALUES ('ilagan-city','Ilagan City')`);
await db.exec(
  `INSERT INTO users (auth_provider, auth_subject, display_name, town_slug)
   VALUES ('egov','sub-1','Juan','ilagan-city')`
);
await db.exec(
  `INSERT INTO officials (town_slug, name, position) VALUES ('ilagan-city','A Mayor','Mayor')`
);

await accepts('a valid rating is accepted', () =>
  db.exec(`INSERT INTO official_ratings (official_id, user_id, score) VALUES (1,1,4)`)
);
await rejects('one rating per user per official', () =>
  db.exec(`INSERT INTO official_ratings (official_id, user_id, score) VALUES (1,1,5)`)
);
await rejects('score above 5', () =>
  db.exec(`INSERT INTO official_ratings (official_id, user_id, score) VALUES (1,999,6)`)
);
await rejects('blank review body', () =>
  db.exec(`INSERT INTO official_reviews (official_id, user_id, body) VALUES (1,1,'   ')`)
);
await accepts('a real review is accepted', () =>
  db.exec(`INSERT INTO official_reviews (official_id, user_id, body) VALUES (1,1,'Responsive office.')`)
);
await rejects('second review by the same user', () =>
  db.exec(`INSERT INTO official_reviews (official_id, user_id, body) VALUES (1,1,'Again.')`)
);
await rejects('inverted salary range', () =>
  db.exec(
    `INSERT INTO jobs (town_slug,title,employer,description,type,salary_min_centavos,salary_max_centavos)
     VALUES ('ilagan-city','T','E','D','full_time',5000000,1000000)`
  )
);
await rejects('listing with neither price nor negotiable', () =>
  db.exec(
    `INSERT INTO listings (town_slug,category,title,description,posted_by)
     VALUES ('ilagan-city','tools','T','D',1)`
  )
);
await accepts('negotiable listing without a price', () =>
  db.exec(
    `INSERT INTO listings (town_slug,category,title,description,posted_by,negotiable)
     VALUES ('ilagan-city','tools','T','D',1,true)`
  )
);
await rejects('project progress over 100%', () =>
  db.exec(
    `INSERT INTO projects (title,category,status,percent_complete,source_name)
     VALUES ('P','road','ongoing',140,'DPWH')`
  )
);
await rejects('resolved report with no resolver', () =>
  db.exec(
    `INSERT INTO reports (target_type,target_id,reason,reported_by,status)
     VALUES ('official_review',1,'defamation',1,'upheld')`
  )
);
await accepts('open report', () =>
  db.exec(
    `INSERT INTO reports (target_type,target_id,reason,reported_by)
     VALUES ('official_review',1,'defamation',1)`
  )
);
await rejects('duplicate open report from the same user', () =>
  db.exec(
    `INSERT INTO reports (target_type,target_id,reason,reported_by)
     VALUES ('official_review',1,'spam',1)`
  )
);
await rejects('rating aggregate that cannot be real', () =>
  db.exec(`UPDATE officials SET rating_count = 1, rating_sum = 99 WHERE id = 1`)
);

await accepts('the same subject from a different provider is a different person', () =>
  db.exec(
    `INSERT INTO users (auth_provider, auth_subject, display_name)
     VALUES ('supabase','sub-1','Juan via email')`
  )
);
await rejects('the same subject from the same provider is refused', () =>
  db.exec(
    `INSERT INTO users (auth_provider, auth_subject, display_name)
     VALUES ('supabase','sub-1','Duplicate')`
  )
);
await rejects('an unknown auth provider', () =>
  db.exec(
    `INSERT INTO users (auth_provider, auth_subject, display_name)
     VALUES ('facebook','x','Nope')`
  )
);

console.log(`\n${pass} passed, ${fail} failed`);
await db.close();
process.exit(fail ? 1 : 0);
