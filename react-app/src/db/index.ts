/**
 * Database handle. Server-only.
 *
 * One driver everywhere: postgres-js over the wire protocol. Locally that is a
 * PGlite socket server (`npm run db:serve`), in production a real Postgres.
 * Same driver, same SQL, so local behaviour is a rehearsal rather than an
 * approximation.
 *
 * The client is created on first query, not on import. Next collects page data
 * at build time by importing the module graph — if connecting happened at
 * import, every build would need a reachable database and a missing
 * DATABASE_URL would fail the build rather than the request that needs it.
 */
import 'server-only';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

type Db = ReturnType<typeof drizzle<typeof schema>>;

declare global {
  // eslint-disable-next-line no-var
  var __betterIsabelaDb: Db | undefined;
}

function build(): Db {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. For local development run `npm run db:serve` and use\n' +
        '  DATABASE_URL=postgres://postgres@127.0.0.1:5432/postgres'
    );
  }

  const max = Number(process.env.DATABASE_POOL_MAX ?? 5);

  // Named prepared statements are cached per connection, so PgBouncer in
  // transaction mode (Supabase's pooled endpoint) needs them OFF. Configurable
  // rather than hard-coded so a direct connection can still use them.
  //
  // Note this flag has less reach than it appears: Drizzle issues queries via
  // postgres-js `unsafe()`, which uses the unnamed statement either way. That
  // is fine against real Postgres — one statement slot per connection — but the
  // local PGlite socket server multiplexes every connection onto a single
  // backend, so concurrent queries clobber each other's unnamed statement and
  // fail with 08P01. It shows up under a parallel prerender; see
  // scripts/build-verify.mjs.
  const prepare = process.env.DATABASE_PREPARE !== 'false';

  return drizzle(postgres(url, { max, idle_timeout: 20, connect_timeout: 10, prepare }), {
    schema,
  });
}

function client(): Db {
  if (!globalThis.__betterIsabelaDb) {
    const instance = build();
    // Reuse across hot reloads so a file save does not leak connections into a
    // serverless Postgres plan.
    if (process.env.NODE_ENV !== 'production') globalThis.__betterIsabelaDb = instance;
    else return instance;
  }
  return globalThis.__betterIsabelaDb!;
}

/**
 * Proxy so `db.select(...)` connects on the first call. Importing this module
 * touches nothing.
 */
export const db: Db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    return Reflect.get(client() as object, prop, receiver);
  },
  has: (_t, prop) => prop in (client() as object),
});

export { schema };
