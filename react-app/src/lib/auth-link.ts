/**
 * Links a confirmed Supabase identity to an app user. Server-only.
 *
 * This lives outside `auth-actions.ts` on purpose. That file is `'use server'`,
 * where every export becomes a server action callable from the browser with
 * arbitrary arguments — and an exported `linkAndSignIn(subject, …)` would let
 * anyone mint a session for any account. Here it is an ordinary module function
 * that only server code can reach.
 */
import 'server-only';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';
import { createSession } from '@/lib/session';

export type LinkResult = { ok: true } | { ok: false; error: string };

export async function linkAndSignIn(
  subject: string,
  email: string | null,
  name: string
): Promise<LinkResult> {
  const existing = await db
    .select({ id: users.id, bannedAt: users.bannedAt })
    .from(users)
    .where(and(eq(users.authProvider, 'supabase'), eq(users.authSubject, subject)))
    .limit(1);

  if (existing[0]?.bannedAt) return { ok: false, error: 'This account has been suspended.' };

  let userId: number;
  if (existing[0]) {
    userId = existing[0].id;
    await db.update(users).set({ email, lastSeenAt: new Date() }).where(eq(users.id, userId));
  } else {
    const [row] = await db
      .insert(users)
      .values({
        authProvider: 'supabase',
        authSubject: subject,
        email,
        displayName: name,
        lastSeenAt: new Date(),
      })
      .returning({ id: users.id });
    userId = row.id;
  }

  await createSession(userId);
  return { ok: true };
}
