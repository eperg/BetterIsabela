/**
 * Production build check, run against a real Postgres.
 *
 * `next build` prerenders the ISR pages, which means it queries the database
 * from several worker processes at once. The local PGlite socket server cannot
 * serve that: Drizzle issues every query through postgres-js `unsafe()`, which
 * uses the *unnamed* prepared statement, and PGlite multiplexes all client
 * connections onto one backend — so concurrent queries overwrite each other's
 * statement and fail with 08P01. A real Postgres keeps one statement slot per
 * connection and is unaffected.
 *
 * So the build is verified against SUPABASE_DB_URL, which is also what Vercel
 * builds against. Prerendering only reads.
 *
 * Usage: npm run build:verify
 */
import { spawnSync } from 'node:child_process';

const url = process.env.SUPABASE_DB_URL?.trim() || process.env.BUILD_DATABASE_URL?.trim();
if (!url) {
  console.error(
    'build:verify needs a real Postgres.\n' +
      'Set SUPABASE_DB_URL (or BUILD_DATABASE_URL) in react-app/.env.\n' +
      'The local PGlite socket cannot serve a parallel prerender — see the note in this file.'
  );
  process.exit(1);
}

const result = spawnSync('npx', ['next', 'build', '--no-lint'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    DATABASE_URL: url,
    // Supabase's pooled endpoint is PgBouncer in transaction mode.
    DATABASE_PREPARE: 'false',
    // Keep the build off the .next directory a running `next dev` is using.
    NEXT_DIST_DIR: process.env.NEXT_DIST_DIR ?? '.next-build',
  },
});

process.exit(result.status ?? 1);
