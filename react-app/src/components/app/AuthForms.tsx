'use client';

import { useActionState, useState } from 'react';
import { registerWithEmail, signInWithEmail, type AuthResult } from '@/lib/auth-actions';

function Message({ state }: { state: AuthResult | null }) {
  if (!state) return null;
  if (!state.ok) {
    return (
      <p className="formmsg formmsg--error" role="alert">
        {state.error}
      </p>
    );
  }
  return state.message ? (
    <p className="formmsg formmsg--ok" role="status">
      {state.message}
    </p>
  ) : null;
}

export default function AuthForms() {
  const [mode, setMode] = useState<'signin' | 'register'>('signin');

  const [signInState, signInAction, signingIn] = useActionState<AuthResult | null, FormData>(
    async (_p, form) => signInWithEmail(form),
    null
  );
  const [registerState, registerAction, registering] = useActionState<AuthResult | null, FormData>(
    async (_p, form) => registerWithEmail(form),
    null
  );

  return (
    <div className="authcard">
      <div className="authtabs" role="tablist" aria-label="Sign in or register">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'signin'}
          className={mode === 'signin' ? 'is-active' : ''}
          onClick={() => setMode('signin')}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'register'}
          className={mode === 'register' ? 'is-active' : ''}
          onClick={() => setMode('register')}
        >
          Create an account
        </button>
      </div>

      {mode === 'signin' ? (
        <form action={signInAction} className="stack">
          <label>
            Email
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Password
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
          <Message state={signInState} />
          <button type="submit" className="btn btn--primary" disabled={signingIn}>
            {signingIn ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      ) : (
        <form action={registerAction} className="stack">
          <label>
            Name shown on your posts
            <input name="displayName" required minLength={2} maxLength={80} autoComplete="name" />
          </label>
          <label>
            Email
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
            <span className="fieldnote">At least 8 characters.</span>
          </label>
          <Message state={registerState} />
          <button type="submit" className="btn btn--primary" disabled={registering}>
            {registering ? 'Creating…' : 'Create account'}
          </button>
        </form>
      )}
    </div>
  );
}
