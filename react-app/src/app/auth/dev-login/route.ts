/**
 * Development sign-in stub.
 *
 * Stands in for eGov SSO while EGOV_SSO_SCOPE is unknown, so the participation
 * features can be exercised end-to-end. It creates exactly the same session row
 * the real callback does, which is the point: when the real scope arrives,
 * nothing downstream changes.
 *
 * Refuses to run in production, and refuses to run once SSO is configured.
 */
import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';
import { createSession } from '@/lib/session';
import { isSsoConfigured } from '@/lib/egov';
import { isEmailAuthConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Never in production, and never once a real provider is available.
  if (process.env.NODE_ENV === 'production' || isSsoConfigured() || isEmailAuthConfigured()) {
    return NextResponse.json({ error: 'not_available' }, { status: 404 });
  }

  const form = await request.formData();
  const handle = String(form.get('handle') ?? 'juan').toLowerCase().replace(/[^a-z0-9-]/g, '');
  const role = String(form.get('role') ?? 'citizen');
  const validRole = role === 'moderator' || role === 'admin' ? role : 'citizen';

  const sub = handle;
  const existing = await db.select({ id: users.id }).from(users).where(and(eq(users.authProvider, 'dev'), eq(users.authSubject, sub)))
    .limit(1);

  let userId: number;
  if (existing[0]) {
    userId = existing[0].id;
    await db.update(users).set({ role: validRole, lastSeenAt: new Date() }).where(eq(users.id, userId));
  } else {
    const [row] = await db
      .insert(users)
      .values({
        authProvider: 'dev',
        authSubject: sub,
        displayName: handle.charAt(0).toUpperCase() + handle.slice(1),
        email: `${handle}@example.test`,
        role: validRole,
        // Dev users are treated as identity-verified so the verified-only
        // paths are reachable without eVerify.
        verifiedAt: new Date(),
        lastSeenAt: new Date(),
      })
      .returning({ id: users.id });
    userId = row.id;
  }

  await createSession(userId, request.headers.get('user-agent') ?? undefined);
  const back = String(form.get('next') ?? '/');
  return NextResponse.redirect(new URL(back, request.nextUrl.origin), { status: 303 });
}
