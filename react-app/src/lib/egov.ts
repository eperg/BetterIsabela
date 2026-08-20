/**
 * eGov PH platform client — server-side only.
 *
 * Every credential here is a server secret. The SSO flow exchanges
 * `partner_secret` for an access token; putting any of this in browser code
 * would publish the province's partner credentials to every visitor. Nothing in
 * this module may be imported from a Client Component.
 *
 * The flow is identity-provider-initiated. There is no authorise URL on our
 * side and no `state` parameter to round-trip:
 *
 *   1. The citizen authenticates in the eGov PH app, which redirects to a base
 *      URL we register with eGov, with `?exchange_code=` appended.
 *   2. We POST that code plus our partner credentials to /api/token and receive
 *      a one-time access token.
 *   3. We POST to /api/partner/sso_authentication with that token as a bearer
 *      and no body, and get the citizen's profile.
 *
 * Verified against the live gateway on 20 Aug 2026:
 *
 *   - EGOV_OAUTH_BASE is the gateway base URL printed on the portal's API
 *     credential page (https://platforms-api.e.gov.ph/egov-sso), not the bare
 *     oauth.e.gov.ph host the docs imply.
 *   - EGOV_PARTNER_CODE is the opaque hex id from that same page, not the
 *     readable partner name shown elsewhere in the portal.
 *   - `scope` is validated against a fixed list and is case-sensitive:
 *     SSO_AUTHENTICATION.
 *   - /api/token checks `exchange_code` BEFORE the credentials, so a 422
 *     "Invalid exchange_code" proves nothing about the secret. Codes are
 *     single-use and expire in seconds — scripts/egov-sso-smoke.mjs exists so a
 *     fresh one can be tested in a single command.
 *
 * The response parsers below stay defensive: they accept the documented field
 * names and the common aliases, so an upstream rename cannot lock citizens out.
 */
import 'server-only';
import { z } from 'zod';

const OAUTH_BASE = process.env.EGOV_OAUTH_BASE ?? 'https://oauth.e.gov.ph';
const TIMEOUT_MS = Number(process.env.EGOV_TIMEOUT_MS ?? 15_000);

export class EgovError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly detail?: unknown
  ) {
    super(message);
    this.name = 'EgovError';
  }
}

/** Reads a required secret at call time so a missing var fails loudly, not silently. */
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new EgovError(
      `${name} is not configured. Copy .env.example to .env and fill it in — ` +
        'these values must never be committed.'
    );
  }
  return value;
}

/**
 * POSTs to eGov. `body` is optional: sso_authentication authenticates with the
 * bearer token alone and rejects a JSON body, so callers omit it there.
 */
async function post(path: string, body?: Record<string, unknown>, bearer?: string) {
  const response = await fetch(`${OAUTH_BASE}${path}`, {
    method: 'POST',
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      Accept: 'application/json',
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: 'no-store',
  });

  const text = await response.text();
  let parsed: unknown;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    throw new EgovError(`eGov returned non-JSON from ${path}`, response.status, text.slice(0, 300));
  }

  if (!response.ok) {
    const message =
      (parsed as { message?: string } | null)?.message ?? `eGov ${path} failed`;
    // Never let a credential reach a log line or an error page.
    throw new EgovError(message, response.status, parsed);
  }
  return parsed;
}

// ---------------------------------------------------------------------------
// Token exchange
// ---------------------------------------------------------------------------

/** Documented shape plus the aliases the portal's examples use. */
const tokenResponse = z
  .object({
    access_token: z.string().optional(),
    token: z.string().optional(),
    data: z.object({ access_token: z.string().optional() }).partial().optional(),
    expires_in: z.number().optional(),
  })
  .passthrough();

export interface EgovToken {
  accessToken: string;
  expiresInSeconds: number | null;
}

/**
 * Exchanges the one-time code from the eGov app for an access token.
 * @param exchangeCode the `exchange_code` handed to our callback
 */
export async function exchangeCodeForToken(exchangeCode: string): Promise<EgovToken> {
  const parsed = tokenResponse.parse(
    await post('/api/token', {
      partner_code: required('EGOV_PARTNER_CODE'),
      partner_secret: required('EGOV_PARTNER_SECRET'),
      scope: required('EGOV_SSO_SCOPE'),
      exchange_code: exchangeCode,
    })
  );

  const accessToken = parsed.access_token ?? parsed.token ?? parsed.data?.access_token;
  if (!accessToken) {
    throw new EgovError('eGov token response contained no access token', 200, {
      keys: Object.keys(parsed),
    });
  }
  return { accessToken, expiresInSeconds: parsed.expires_in ?? null };
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

/**
 * The citizen profile. Only the subject is depended upon — the catalog returns
 * it as `uniqid`, and it is the stable join key to our users table. Everything else is treated as optional presentation data
 * so a change in the upstream payload cannot lock people out.
 */
const profileResponse = z
  .object({
    uniqid: z.string().optional(),
    sub: z.string().optional(),
    id: z.union([z.string(), z.number()]).optional(),
    uuid: z.string().optional(),
    email: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    name: z.string().optional(),
    full_name: z.string().optional(),
    data: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

/**
 * Deliberately narrow. The upstream payload also carries the citizen's
 * signature as an inline base64 image, their PhilID PCN, passport number, face
 * photo URL, birth date and mobile. None of that is needed to sign someone in,
 * and holding it on a returned object is one stray log line away from writing a
 * national ID into our server logs — so it is dropped here rather than passed on.
 */
export interface EgovProfile {
  /** Stable subject identifier (`data.uniqid`). Never display this. */
  subject: string;
  email: string | null;
  displayName: string;
}

export async function fetchProfile(accessToken: string): Promise<EgovProfile> {
  const body = await post('/api/partner/sso_authentication', undefined, accessToken);

  const parsed = profileResponse.parse(body);
  const inner = (parsed.data ?? {}) as Record<string, unknown>;
  const pick = (key: string) =>
    (parsed as Record<string, unknown>)[key] ?? inner[key];

  const subject = String(pick('uniqid') ?? pick('sub') ?? pick('uuid') ?? pick('id') ?? '');
  if (!subject) {
    throw new EgovError('eGov profile contained no subject identifier', 200, {
      keys: Object.keys(parsed),
    });
  }

  const first = pick('first_name');
  const last = pick('last_name');
  const displayName =
    (pick('full_name') as string) ||
    (pick('name') as string) ||
    [first, last].filter(Boolean).join(' ').trim() ||
    'eGov user';

  return {
    subject,
    email: (pick('email') as string) ?? null,
    displayName,
  };
}

/** True when the SSO flow is fully configured; drives the login button's state. */
export function isSsoConfigured(): boolean {
  return Boolean(
    process.env.EGOV_PARTNER_CODE && process.env.EGOV_PARTNER_SECRET && process.env.EGOV_SSO_SCOPE
  );
}
