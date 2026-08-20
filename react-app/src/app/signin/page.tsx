import { redirect } from 'next/navigation';
import AuthForms from '@/components/app/AuthForms';
import { PageHeader, Empty } from '@/components/app/ui';
import { getCurrentUser } from '@/lib/session';
import { isEmailAuthConfigured } from '@/lib/supabase';

// Reads the signed-in user, so it must render per request.
export const dynamic = 'force-dynamic';

export const metadata = { title: 'Sign in' };

export default async function SignInPage() {
  const user = await getCurrentUser();
  if (user) redirect('/');

  const email = isEmailAuthConfigured();

  return (
    <main className="wrap wrap--narrow">
      <PageHeader
        title="Sign in"
        lead="An account lets you post jobs and listings, ask and answer questions, and rate the officials serving your town."
      />

      {/*
        eGov SSO is deliberately not mentioned here yet. The flow is
        identity-provider-initiated, so nothing on this page can start it: eGov
        appends an exchange_code to a base URL we register with them, and that
        registration is still outstanding. Announcing the route before it works
        would send citizens looking for a door that is not open. /auth/callback
        stays live and configured, so restoring this is a matter of putting the
        paragraph back once eGov confirms the callback URL.
      */}
      {email ? (
        <AuthForms />
      ) : (
        <Empty>
          Registration is not configured on this deployment. Set
          NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable it.
        </Empty>
      )}

      <div className="footnote">
        By creating an account you agree to the <a href="/terms">Terms of Use</a>. What we store and
        why is set out in the <a href="/privacy">Privacy Policy</a>. Posts and reviews are published
        under the name you choose above.
      </div>
    </main>
  );
}
