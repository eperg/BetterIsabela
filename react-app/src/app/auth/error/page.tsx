/**
 * Shared failure page for both sign-in paths: the eGov SSO callback and the
 * email confirmation link. The reason decides the heading as well as the text,
 * because "Sign-in failed" is the wrong thing to say to someone who clicked a
 * confirmation link that had already been used.
 */
type Failure = { title: string; message: string; cta: { href: string; label: string } };

const SIGN_IN = { href: '/signin', label: 'Back to sign in' };

const REASONS: Record<string, Failure> = {
  // eGov SSO callback
  missing_code: {
    title: 'Sign-in failed',
    message: 'The sign-in link did not include an authorisation code.',
    cta: SIGN_IN,
  },
  rejected: {
    title: 'Sign-in failed',
    message: 'eGov did not accept the sign-in. Please try again.',
    cta: SIGN_IN,
  },
  upstream: {
    title: 'Sign-in failed',
    message: 'eGov is not responding right now. Please try again shortly.',
    cta: SIGN_IN,
  },

  // Email confirmation
  missing_token: {
    title: 'That link is incomplete',
    message:
      'The confirmation link was missing part of its address, which usually means an email app broke it across two lines. Copy the whole link from the email and paste it into your browser.',
    cta: SIGN_IN,
  },
  bad_link: {
    title: 'That link is not valid',
    message: 'This confirmation link is not one we recognise. Request a new one by registering again.',
    cta: SIGN_IN,
  },
  link_expired: {
    title: 'That link has expired',
    message:
      'Confirmation links work once and last an hour. Register again with the same email address and we will send a fresh one.',
    cta: SIGN_IN,
  },
  suspended: {
    title: 'This account is suspended',
    message:
      'Your email address was confirmed, but the account has been suspended by a moderator. Contact us if you think that is a mistake.',
    cta: { href: '/contact', label: 'Contact us' },
  },

  unknown: {
    title: 'Something went wrong',
    message: 'Something went wrong while signing you in. Please try again.',
    cta: SIGN_IN,
  },
};

export const metadata = { title: 'Sign-in problem', robots: { index: false, follow: false } };

export default async function AuthError({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const failure = REASONS[reason ?? 'unknown'] ?? REASONS.unknown;

  return (
    <main className="wrap wrap--narrow">
      <h1>{failure.title}</h1>
      <p className="pagehead-lead">{failure.message}</p>
      <p style={{ marginTop: 22, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <a className="btn btn--primary" href={failure.cta.href}>
          {failure.cta.label}
        </a>
        <a className="btn" href="/">
          Homepage
        </a>
      </p>
    </main>
  );
}
