'use server';

/**
 * Registration and sign-in with Supabase Auth.
 *
 * Both paths end the same way: Supabase confirms the credential, we upsert the
 * person into our own users table under the `supabase` provider, and mint an
 * app session. Nothing downstream knows or cares which provider was used.
 */
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { linkAndSignIn } from '@/lib/auth-link';
import { supabaseServer } from '@/lib/supabase';

export type AuthResult = { ok: true; message?: string } | { ok: false; error: string };

const credentials = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: z.string().min(8, 'Use at least 8 characters.').max(200),
});

export async function registerWithEmail(form: FormData): Promise<AuthResult> {
  const parsed = credentials.safeParse({
    email: form.get('email'),
    password: form.get('password'),
  });
  if (!parsed.success) {
    return { ok: false, error: z.flattenError(parsed.error).fieldErrors.email?.[0]
      ?? z.flattenError(parsed.error).fieldErrors.password?.[0]
      ?? 'Check your details.' };
  }
  const displayName = String(form.get('displayName') ?? '').trim();
  if (displayName.length < 2) return { ok: false, error: 'Enter the name you want shown.' };

  try {
    const supabase = await supabaseServer();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: { data: { display_name: displayName } },
    });

    if (error) return { ok: false, error: error.message };

    // With email confirmation on, there is no session until the link is
    // clicked. That link goes to /auth/confirm, which signs them in — so do
    // not tell them to come back and sign in afterwards.
    if (!data.session || !data.user) {
      return {
        ok: true,
        message: `Almost done. We have sent a confirmation link to ${parsed.data.email} — open it and you will be signed in.`,
      };
    }
    const linked = await linkAndSignIn(data.user.id, data.user.email ?? null, displayName);
    if (!linked.ok) return linked;
  } catch (error) {
    console.error('registration failed', error);
    return { ok: false, error: 'Registration is unavailable right now.' };
  }
  redirect('/');
}

export async function signInWithEmail(form: FormData): Promise<AuthResult> {
  const parsed = credentials.safeParse({
    email: form.get('email'),
    password: form.get('password'),
  });
  if (!parsed.success) return { ok: false, error: 'Enter your email and password.' };

  try {
    const supabase = await supabaseServer();
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error || !data.user) {
      // Never distinguish "no such account" from "wrong password".
      return { ok: false, error: 'Those details did not match an account.' };
    }
    const name =
      (data.user.user_metadata?.display_name as string | undefined) ??
      data.user.email?.split('@')[0] ??
      'Citizen';
    const linked = await linkAndSignIn(data.user.id, data.user.email ?? null, name);
    if (!linked.ok) return linked;
  } catch (error) {
    console.error('sign-in failed', error);
    return { ok: false, error: 'Sign-in is unavailable right now.' };
  }
  redirect('/');
}
