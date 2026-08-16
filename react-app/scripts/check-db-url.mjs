/**
 * Tests a Postgres connection string without printing it.
 *
 *   node scripts/check-db-url.mjs 'postgresql://...'
 *   DATABASE_URL='postgresql://...' node scripts/check-db-url.mjs
 *
 * Reports what is wrong in plain terms — wrong password, unencoded characters,
 * unreachable host — and never echoes the credential.
 */
import postgres from 'postgres';

const raw = process.argv[2] ?? process.env.DATABASE_URL;
if (!raw) {
  console.error('Pass the connection string as an argument or set DATABASE_URL.');
  process.exit(1);
}

let url;
try {
  url = new URL(raw);
} catch {
  console.error('That is not a valid URL. It must start with postgresql://');
  process.exit(1);
}

const password = decodeURIComponent(url.password ?? '');
const needsEncoding = [...'@:/?#[]!$&\'()*+,;='].filter((c) => password.includes(c));

console.log(`host     ${url.hostname}:${url.port || 5432}`);
console.log(`user     ${decodeURIComponent(url.username)}`);
console.log(`database ${url.pathname.slice(1)}`);
console.log(`password ${password.length} characters`);
if (needsEncoding.length) {
  console.log(
    `\n⚠  The password contains ${needsEncoding.map((c) => `"${c}"`).join(' ')} — these must be\n` +
      '   percent-encoded inside a connection URL, or everything after them is\n' +
      '   parsed as part of the host. Encode with:\n' +
      "     node -e \"console.log(encodeURIComponent('YOUR_PASSWORD'))\""
  );
}

const sql = postgres(raw, { max: 1, connect_timeout: 10, prepare: false });
try {
  const [row] = await sql`select current_database() db, (select count(*)::int from towns) towns`;
  console.log(`\n✓ Connected. database="${row.db}", towns=${row.towns}`);
  if (row.towns === 0) console.log('  (schema is present but unseeded)');
} catch (error) {
  const code = error.code ?? '';
  const hints = {
    '28P01': 'Wrong password — or unencoded special characters (see above).',
    XX000: 'Host does not know this tenant. Check the project ref in the username.',
    ENOTFOUND: 'Hostname does not resolve.',
    ECONNREFUSED: 'Nothing is listening on that port.',
    '42P01': 'Connected, but the schema is missing. Run the migrations.',
  };
  console.error(`\n✗ ${code} ${error.message}`);
  if (hints[code]) console.error(`  ${hints[code]}`);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 3 }).catch(() => {});
}
