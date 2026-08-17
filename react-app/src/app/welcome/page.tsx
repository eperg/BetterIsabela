/**
 * Where a citizen lands after confirming their email address.
 *
 * /auth/confirm signs them in before redirecting here, so the common case is a
 * signed-in visitor seeing this once. It stays reachable when signed out —
 * people bookmark things and forward links — and simply points to sign-in then.
 */
import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/session';

// Reads the session cookie, so it cannot be prerendered.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Welcome',
  robots: { index: false, follow: false },
};

const NEXT_STEPS = [
  {
    href: '/ask',
    title: 'Ask a question',
    body: 'Where to get a document, what a fee should cost, who to call. Neighbours and officials answer.',
  },
  {
    href: '/jobs/new',
    title: 'Post a job',
    body: 'Hiring in your town? Put it in front of people looking locally, free.',
  },
  {
    href: '/market/new',
    title: 'List something for sale',
    body: 'Sell to the province rather than to a group chat.',
  },
  {
    href: '/officials',
    title: 'Rate your officials',
    body: 'Say how the people serving your town are actually doing. Ratings are public.',
  },
];

export default async function WelcomePage() {
  const user = await getCurrentUser();
  const firstName = user?.displayName.trim().split(/\s+/)[0];

  return (
    <main className="wrap wrap--narrow">
      <div className="welcome">
        <p className="welcome-badge">
          <span className="welcome-tick" aria-hidden="true">
            ✓
          </span>
          Email confirmed
        </p>

        <h1 className="welcome-title">
          {firstName ? `Welcome, ${firstName}.` : 'Welcome to Better Isabela.'}
        </h1>

        {user ? (
          <>
            <p className="welcome-lead">
              Your account is ready and you are signed in — nothing else to do. Better Isabela
              belongs to the people who use it, so the more you put in, the more useful it is for
              the person in your town who looks next.
            </p>
            {user.email && (
              <p className="welcome-account">
                Signed in as <strong>{user.email}</strong>
              </p>
            )}
          </>
        ) : (
          <p className="welcome-lead">
            Your email address is confirmed. Sign in and your account is ready to use.
          </p>
        )}

        <div className="welcome-actions">
          {user ? (
            <>
              <a className="btn btn--primary" href="/">
                Go to the homepage
              </a>
              <a className="btn" href="/services">
                Browse government services
              </a>
            </>
          ) : (
            <a className="btn btn--primary" href="/signin">
              Sign in
            </a>
          )}
        </div>
      </div>

      <h2 className="welcome-heading">A good place to start</h2>
      <ul className="welcome-steps">
        {NEXT_STEPS.map((step) => (
          <li key={step.href}>
            <a href={step.href}>
              <span className="welcome-step-title">{step.title}</span>
              <span className="welcome-step-body">{step.body}</span>
            </a>
          </li>
        ))}
      </ul>

      <p className="footnote">
        Posts and ratings are published under the name on your account. What we store and why is set
        out in the <a href="/privacy">Privacy Policy</a>, and the <a href="/terms">Terms of Use</a>{' '}
        cover what belongs here.
      </p>
    </main>
  );
}
