/**
 * eGov PH platform client — server-side only.
 *
 * Every credential here is a server secret. The SSO flow exchanges
 * `partner_secret` for an access token; putting any of this in browser code
 * would publish the province's partner credentials to every visitor. Nothing in
 * this module may be imported from a Client Component.
 *
 * Flow (per the eGov developer portal):
 *
 *   1. The citizen authenticates in the eGov PH app, which hands our callback an
 *      `exchange_code`.
 *   2. We POST that code plus our partner credentials to /api/token and receive
 *      a one-time access token.
 *   3. We call /api/partner/sso_authentication with the token to get the
 *      citizen's profile.
 *
 * The exact `scope` value and the response shapes are documented behind the
 * partner login at platforms.e.gov.ph/dashboard/api-catalogs/egov-sso. Probing
 * the live endpoint confirms it validates `scope` against a fixed list and
 * rejects everything not on it, so EGOV_SSO_SCOPE is configuration rather than a
 * constant — set it from the catalog page and the flow completes without a code
 * change. The response parsers below are defensive for the same reason: they
 * accept the documented field names and the common aliases.
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

async function post(path: string, body: Record<string, unknown>, bearer?: string) {
  const response = await fetch(`${OAUTH_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
    body: JSON.stringify(body),
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
 * The citizen profile. Only `sub` is depended upon — it is the stable join key
 * to our users table. Everything else is treated as optional presentation data
 * so a change in the upstream payload cannot lock people out.
 */
const profileResponse = z
  .object({
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

export interface EgovProfile {
  /** Stable subject identifier. Never display this. */
  subject: string;
  email: string | null;
  displayName: string;
  raw: unknown;
}

export async function fetchProfile(accessToken: string): Promise<EgovProfile> {
  const body = await post('/api/partner/sso_authentication', {
    partner_code: required('EGOV_PARTNER_CODE'),
    access_token: accessToken,
  }, accessToken);

  const parsed = profileResponse.parse(body);
  const inner = (parsed.data ?? {}) as Record<string, unknown>;
  const pick = (key: string) =>
    (parsed as Record<string, unknown>)[key] ?? inner[key];

  const subject = String(pick('sub') ?? pick('uuid') ?? pick('id') ?? '');
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
    raw: body,
  };
}

/** True when the SSO flow is fully configured; drives the login button's state. */
export function isSsoConfigured(): boolean {
  return Boolean(
    process.env.EGOV_PARTNER_CODE && process.env.EGOV_PARTNER_SECRET && process.env.EGOV_SSO_SCOPE
  );
}
