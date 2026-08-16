/**
 * Session handling. Server-only.
 *
 * Sessions are rows, not JWTs. A moderator banning an account must revoke it
 * immediately, and a stateless token cannot be withdrawn before it expires.
 * The cookie carries a random opaque id and nothing else.
 */
import 'server-only';
import { cookies } from 'next/headers';
import { randomBytes } from 'node:crypto';
import { eq, and, gt } from 'drizzle-orm';
import { db } from '@/db';
import { sessions, users } from '@/db/schema';

const COOKIE = 'bi_session';
const TTL_DAYS = 30;

export interface CurrentUser {
  id: number;
  displayName: string;
  email: string | null;
  role: 'citizen' | 'moderator' | 'admin';
  townSlug: string | null;
  verified: boolean;
}

export async function createSession(userId: number, userAgent?: string): Promise<void> {
  const id = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + TTL_DAYS * 86_400_000);

  await db.insert(sessions).values({ id, userId, expiresAt, userAgent: userAgent ?? null });

  (await cookies()).set(COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

/** Resolves the signed-in citizen, or null. Banned accounts resolve to null. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const id = (await cookies()).get(COOKIE)?.value;
  if (!id) return null;

  const rows = await db
    .select({
      id: users.id,
      displayName: users.displayName,
      email: users.email,
      role: users.role,
      townSlug: users.townSlug,
      verifiedAt: users.verifiedAt,
      bannedAt: users.bannedAt,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.id, id), gt(sessions.expiresAt, new Date())))
    .limit(1);

  const row = rows[0];
  if (!row || row.bannedAt) return null;

  return {
    id: row.id,
    displayName: row.displayName,
    email: row.email,
    role: row.role,
    townSlug: row.townSlug,
    verified: row.verifiedAt !== null,
  };
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const id = jar.get(COOKIE)?.value;
  if (id) await db.delete(sessions).where(eq(sessions.id, id));
  jar.delete(COOKIE);
}

/** Throws unless a citizen is signed in. Use at the top of every write path. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error('UNAUTHENTICATED');
  return user;
}

export async function requireModerator(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== 'moderator' && user.role !== 'admin') throw new Error('FORBIDDEN');
  return user;
}
