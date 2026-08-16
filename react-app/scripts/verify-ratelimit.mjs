/** Exercises the rate-limit upsert against real Postgres semantics (PGlite). */
import { PGlite } from '@electric-sql/pglite';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const db = new PGlite();
const dir = join(import.meta.dirname, '..', 'drizzle');
for (const f of readdirSync(dir).filter((x) => x.endsWith('.sql')).sort()) {
  const sql = readFileSync(join(dir, f), 'utf8');
  for (const s of sql.includes('--> statement-breakpoint') ? sql.split('--> statement-breakpoint') : [sql]) {
    if (s.trim()) await db.exec(s);
  }
}
await db.exec(`INSERT INTO towns (slug,name) VALUES ('x','X')`);
await db.exec(`INSERT INTO users (auth_provider,auth_subject,display_name) VALUES ('egov','s','U')`);

const WINDOW = 86400, MAX = 5;
async function consume() {
  const r = await db.query(
    `INSERT INTO rate_limits (user_id, action, window_start, count)
     VALUES (1,'review_official',
       to_timestamp(floor(extract(epoch FROM now()) / $1) * $1), 1)
     ON CONFLICT (user_id, action, window_start)
       DO UPDATE SET count = rate_limits.count + 1
     RETURNING count`, [WINDOW]);
  return Number(r.rows[0].count);
}
const counts = [];
for (let i = 0; i < 7; i += 1) counts.push(await consume());
console.log('sequential counts:', counts.join(', '));
const allowed = counts.filter((c) => c <= MAX).length;
console.log(`allowed ${allowed}/7 with max ${MAX} — ${allowed === MAX ? 'ok' : 'FAIL'}`);

// concurrent burst must not overshoot
await db.exec(`DELETE FROM rate_limits`);
const burst = await Promise.all(Array.from({ length: 10 }, consume));
const maxSeen = Math.max(...burst);
const unique = new Set(burst).size;
console.log(`concurrent burst counts: ${burst.sort((a,b)=>a-b).join(', ')}`);
console.log(`distinct counts ${unique}/10, max ${maxSeen} — ${unique === 10 && maxSeen === 10 ? 'ok (no lost updates)' : 'FAIL'}`);
await db.close();
process.exit(allowed === MAX && unique === 10 ? 0 : 1);
