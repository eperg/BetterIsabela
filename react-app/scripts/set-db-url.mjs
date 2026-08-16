/**
 * Takes a raw Supabase database password, builds a correct connection string,
 * verifies it, then sets it in Vercel production and redeploys.
 *
 *   node scripts/set-db-url.mjs 'your-raw-password'
 *
 * The password is percent-encoded for you — the usual reason a Supabase URL
 * fails is an unencoded @ / ? or # in the generated password, which silently
 * turns the rest of the string into a hostname.
 *
 * Nothing is printed except the outcome. The password never reaches argv of a
 * child process: the URL is handed to Vercel over stdin.
 */
import postgres from 'postgres';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF ?? 'kxxgnvginrephhlgebac';
const HOST = process.env.SUPABASE_POOLER_HOST ?? 'aws-0-ap-southeast-1.pooler.supabase.com';
const PORT = process.env.SUPABASE_POOLER_PORT ?? '6543';

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/set-db-url.mjs 'your-database-password'");
  process.exit(1);
}

const url =
  `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(password)}` +
  `@${HOST}:${PORT}/postgres`;

console.log(`Connecting to ${HOST}:${PORT} as postgres.${PROJECT_REF} …`);

const sql = postgres(url, { max: 1, connect_timeout: 12, prepare: false });
try {
  const [row] = await sql`select (select count(*)::int from towns) towns,
                                 (select count(*)::int from officials) officials`;
  console.log(`✓ Connected — ${row.towns} towns, ${row.officials} officials.`);
} catch (error) {
  console.error(`✗ ${error.code ?? ''} ${error.message}`);
  if (error.code === '28P01') {
    console.error('  That password was not accepted. Reset it in the Supabase dashboard:');
    console.error(`  https://supabase.com/dashboard/project/${PROJECT_REF}/settings/database`);
  }
  await sql.end({ timeout: 3 }).catch(() => {});
  process.exit(1);
}
await sql.end({ timeout: 3 }).catch(() => {});

console.log('Setting DATABASE_URL in Vercel production …');
await run('vercel', ['env', 'rm', 'DATABASE_URL', 'production', '--yes']).catch(() => {});
await new Promise((resolve, reject) => {
  const child = execFile('vercel', ['env', 'add', 'DATABASE_URL', 'production'], (err) =>
    err ? reject(err) : resolve()
  );
  child.stdin.end(url);
});
console.log('✓ DATABASE_URL set.');

console.log('Redeploying …');
const { stdout } = await run('vercel', ['deploy', '--prod', '--yes']);
const deployed = stdout.match(/https:\/\/[a-z0-9-]+\.vercel\.app/)?.[0];
console.log(`✓ Deployed${deployed ? ` — ${deployed}` : ''}`);
console.log('\nCheck https://betterisabela.org');
