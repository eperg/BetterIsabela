/**
 * Fixed-window rate limiting, in Postgres.
 *
 * Kept in the database rather than Redis so a limit check is transactional with
 * the write it guards: a burst of concurrent requests cannot slip past by
 * racing between "check" and "insert". A provincial civic site does not
 * generate the write volume that would justify another moving part.
 */
import 'server-only';
import { sql } from 'drizzle-orm';
import { db } from '@/db';

export interface Limit {
  /** Requests permitted per window. */
  max: number;
  /** Window length in seconds. */
  windowSeconds: number;
}

/** Deliberately tight on the abuse-prone surfaces. */
export const LIMITS = {
  post_job: { max: 5, windowSeconds: 86_400 },
  post_listing: { max: 10, windowSeconds: 86_400 },
  ask_question: { max: 10, windowSeconds: 86_400 },
  post_answer: { max: 30, windowSeconds: 86_400 },
  rate_official: { max: 20, windowSeconds: 86_400 },
  review_official: { max: 5, windowSeconds: 86_400 },
  report_content: { max: 20, windowSeconds: 86_400 },
} as const satisfies Record<string, Limit>;

export type LimitedAction = keyof typeof LIMITS;

/**
 * postgres-js resolves `execute` to an array; PGlite resolves it to `{ rows }`.
 * `db` is declared as the postgres-js flavour, so narrow through unknown.
 */
function asRows<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  return ((result as { rows?: T[] })?.rows ?? []) as T[];
}

export class RateLimited extends Error {
  constructor(
    readonly action: LimitedAction,
    readonly retryAfterSeconds: number
  ) {
    super(`Rate limit reached for ${action}`);
    this.name = 'RateLimited';
  }
}

/**
 * Records one use of `action` by `userId`, throwing RateLimited if the window
 * is already full. The upsert is atomic, so concurrent requests serialise on
 * the primary key rather than both reading a stale count.
 */
export async function consume(userId: number, action: LimitedAction): Promise<void> {
  const { max, windowSeconds } = LIMITS[action];

  const result = await db.execute<{ count: number }>(sql`
    INSERT INTO rate_limits (user_id, action, window_start, count)
    VALUES (
      ${userId},
      ${action},
      to_timestamp(floor(extract(epoch FROM now()) / ${windowSeconds}) * ${windowSeconds}),
      1
    )
    ON CONFLICT (user_id, action, window_start)
      DO UPDATE SET count = rate_limits.count + 1
    RETURNING count
  `);

  const rows = asRows<{ count: number }>(result);
  const count = Number(rows[0]?.count ?? 0);
  if (count > max) {
    const elapsed = Math.floor(Date.now() / 1000) % windowSeconds;
    throw new RateLimited(action, windowSeconds - elapsed);
  }
}

/** Deletes windows that can no longer be hit. Call from a cron route. */
export async function sweep(): Promise<number> {
  const result = await db.execute<{ id: number }>(sql`
    DELETE FROM rate_limits WHERE window_start < now() - interval '2 days' RETURNING user_id AS id
  `);
  return asRows<{ id: number }>(result).length;
}
