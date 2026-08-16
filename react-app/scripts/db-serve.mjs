/**
 * Serves the local PGlite database over a real Postgres wire protocol socket.
 *
 * Next.js dev runs route handlers across more than one process, and PGlite locks
 * its data directory to a single owner — so embedding it directly deadlocks the
 * second process to open it. Running it as a socket server gives one owner and
 * many clients, exactly like a real Postgres, and lets the app use the same
 * postgres-js driver locally as in production.
 *
 *   npm run db:serve      then    DATABASE_URL=postgres://localhost:5432/postgres
 */
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = process.env.PGLITE_DIR ?? join(root, '.pglite');
const port = Number(process.env.PGLITE_PORT ?? 5432);

const db = await PGlite.create({ dataDir });
// Default is a single connection, which starves the app the moment a second
// client (a migration, a psql session) shows up. PGlite still executes queries
// one at a time; this only lets more clients queue.
const server = new PGLiteSocketServer({
  db,
  port,
  host: '127.0.0.1',
  maxConnections: Number(process.env.PGLITE_MAX_CONNECTIONS ?? 10),
});
await server.start();
console.log(`PGlite listening on 127.0.0.1:${port}  (data: ${dataDir})`);
console.log('Set DATABASE_URL=postgres://postgres@127.0.0.1:5432/postgres');

const stop = async () => {
  await server.stop();
  await db.close();
  process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
