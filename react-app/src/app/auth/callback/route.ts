/**
 * eGov SSO callback.
 *
 * The eGov PH app sends the citizen here with an `exchange_code`. We swap it
 * for an access token, read the profile, upsert the citizen, and start a
 * session. The partner secret never leaves this process.
 */
import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { exchangeCodeForToken, fetchProfile, EgovError } from '@/lib/egov';
import { createSession } from '@/lib/session';
import { db } from '@/db';
import { users } from '@/db/schema';

export const dynamic = 'force-dynamic';

function fail(request: NextRequest, reason: string) {
  const url = new URL('/auth/error', request.nextUrl.origin);
  url.searchParams.set('reason', reason);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const exchangeCode =
    request.nextUrl.searchParams.get('exchange_code') ??
    request.nextUrl.searchParams.get('code');

  if (!exchangeCode) return fail(request, 'missing_code');

  try {
    const { accessToken } = await exchangeCodeForToken(exchangeCode);
    const profile = await fetchProfile(accessToken);

    // Upsert on the eGov subject — the only stable join key.
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.authProvider, 'egov'), eq(users.authSubject, profile.subject)))
      .limit(1);

    let userId: number;
    if (existing[0]) {
      userId = existing[0].id;
      await db
        .update(users)
        .set({
          email: profile.email,
          displayName: profile.displayName,
          lastSeenAt: new Date(),
        })
        .where(eq(users.id, userId));
    } else {
      const inserted = await db
        .insert(users)
        .values({
          authProvider: 'egov',
          authSubject: profile.subject,
          email: profile.email,
          displayName: profile.displayName,
          lastSeenAt: new Date(),
        })
        .returning({ id: users.id });
      userId = inserted[0].id;
    }

    await createSession(userId, request.headers.get('user-agent') ?? undefined);
    return NextResponse.redirect(new URL('/', request.nextUrl.origin));
  } catch (error) {
    // Log the class of failure, never the payload — it carries credentials.
    if (error instanceof EgovError) {
      console.error(`SSO callback failed: ${error.message} (status ${error.status ?? 'n/a'})`);
      return fail(request, error.status === 401 ? 'rejected' : 'upstream');
    }
    console.error('SSO callback failed', error);
    return fail(request, 'unknown');
  }
}
