/**
 * Walks the eGov PH SSO chain against a live exchange code, printing the exact
 * status and body of each hop.
 *
 *   node scripts/egov-sso-smoke.mjs <exchange_code> [--partner CODE]
 *
 * Exchange codes are single-use and expire within seconds, so this exists to be
 * one paste away from a fresh code — the browser round trip through /auth/callback
 * is too slow to diagnose with, and it hides the upstream body behind a redirect.
 *
 * Reads credentials from react-app/.env. It prints upstream response bodies in
 * full because that is the whole point, but never echoes the partner secret.
 *
 * Error semantics, established by probing the live endpoint:
 *   422 Invalid exchange_code  the code is dead, expired, or belongs to another
 *                              partner. Checked BEFORE credentials, so this says
 *                              nothing about whether the secret is right.
 *   403 forbidden              the partner code is not permitted on this gateway
 *                              at all; the exchange code was never examined.
 *   200                        code accepted and credentials cleared.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TIMEOUT_MS = 15_000;

/** Minimal .env reader — the app relies on Next's loader, scripts cannot. */
function readEnv() {
  const raw = readFileSync(join(ROOT, '.env'), 'utf8');
  const out = {};
  for (const line of raw.split('\n')) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
    if (!match) continue;
    out[match[1]] = match[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

const env = readEnv();
const args = process.argv.slice(2);
const exchangeCode = args.find((a) => !a.startsWith('-'));
const partnerFlag = args.includes('--partner') ? args[args.indexOf('--partner') + 1] : null;

if (!exchangeCode) {
  console.error('usage: node scripts/egov-sso-smoke.mjs <exchange_code> [--partner CODE]');
  process.exit(2);
}

const base = env.EGOV_OAUTH_BASE ?? 'https://oauth.e.gov.ph';
const secret = env.EGOV_PARTNER_SECRET;
const scope = env.EGOV_SSO_SCOPE || 'SSO_AUTHENTICATION';
if (!secret) {
  console.error('EGOV_PARTNER_SECRET is not set in react-app/.env');
  process.exit(2);
}

const partnerCode = partnerFlag ?? env.EGOV_PARTNER_CODE;
if (!partnerCode) {
  console.error('EGOV_PARTNER_CODE is not set in react-app/.env');
  process.exit(2);
}

async function call(path, { body, bearer } = {}) {
  const started = Date.now();
  const response = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      Accept: 'application/json',
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* left null — the raw text is printed below */
  }
  console.log(`  POST ${path} → ${response.status} (${Date.now() - started}ms)`);
  console.log(`  ${json ? JSON.stringify(json) : text.slice(0, 400) || '<empty>'}`);
  return { status: response.status, json };
}

console.log(`base   ${base}`);
console.log(`scope  ${scope}`);
console.log(`code   ${exchangeCode}\n`);

console.log(`partner_code=${partnerCode}`);
const { status, json } = await call('/api/token', {
  body: {
    partner_code: partnerCode,
    partner_secret: secret,
    scope,
    exchange_code: exchangeCode,
  },
});
if (status === 403) console.log('  → partner code is not permitted here; the code was never examined.');
if (status === 422) console.log('  → code dead, expired, or minted for another partner. Secret unproven.');

const token = json?.access_token ?? json?.token ?? json?.data?.access_token ?? null;
if (!token) {
  console.log('\nNo access token. Stopping before the profile call.');
  process.exit(1);
}
console.log(`  → access token received (${token.length} chars). Partner, secret and scope all valid.`);

console.log('\nprofile (bearer only, no body)');
const profile = await call('/api/partner/sso_authentication', { bearer: token });
if (profile.json) {
  const flat = { ...profile.json, ...(profile.json.data ?? {}) };
  const subject = flat.uniqid ?? flat.sub ?? flat.uuid ?? flat.id;
  console.log(`\n  subject field → ${subject ? JSON.stringify(subject) : 'NONE FOUND'}`);
  console.log(`  keys → ${Object.keys(flat).join(', ')}`);
}
