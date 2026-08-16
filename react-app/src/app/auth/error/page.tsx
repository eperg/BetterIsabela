const REASONS: Record<string, string> = {
  missing_code: 'The sign-in link did not include an authorisation code.',
  rejected: 'eGov did not accept the sign-in. Please try again.',
  upstream: 'eGov is not responding right now. Please try again shortly.',
  unknown: 'Something went wrong while signing you in.',
};

export default async function AuthError({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  return (
    <main className="container" style={{ padding: '64px 0', maxWidth: '48rem' }}>
      <h1>Sign-in failed</h1>
      <p>{REASONS[reason ?? 'unknown'] ?? REASONS.unknown}</p>
      <p>
        <a href="/">Return to the homepage</a>
      </p>
    </main>
  );
}
