import { redirect } from 'next/navigation';
import AuthForms from '@/components/app/AuthForms';
import { PageHeader, Empty } from '@/components/app/ui';
import { getCurrentUser } from '@/lib/session';
import { isEmailAuthConfigured } from '@/lib/supabase';
import { isSsoConfigured } from '@/lib/egov';

// Reads the signed-in user, so it must render per request.
export const dynamic = 'force-dynamic';

export const metadata = { title: 'Sign in' };

export default async function SignInPage() {
  const user = await getCurrentUser();
  if (user) redirect('/');

  const email = isEmailAuthConfigured();
  const sso = isSsoConfigured();

  return (
    <main className="wrap wrap--narrow">
      <PageHeader
        title="Sign in"
        lead="An account lets you post jobs and listings, ask and answer questions, and rate the officials serving your town."
      />

      {/*
        eGov SSO is identity-provider-initiated: there is no URL we can send a
        citizen to. eGov hands our /auth/callback an exchange_code after they
        sign in inside the eGov PH app, so the only honest thing to show here is
        where to start. A button would 404.
      */}
      {sso && (
        <p className="footnote" style={{ marginBottom: 18 }}>
          Signed up through <strong>eGov PH</strong>? Open BetterIsabela from the
          eGov PH app and you will arrive here already signed in. There is no
          eGov button on this page — the sign-in starts on their side.
        </p>
      )}

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
