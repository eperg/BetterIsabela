'use client';

import { useEffect, useState } from 'react';

interface Me {
  id: number;
  displayName: string;
  role: 'citizen' | 'moderator' | 'admin';
  verified: boolean;
}

/**
 * Sign-in state, fetched after render.
 *
 * Deliberately a Client Component: as a Server Component it read cookies, which
 * forced every page in the app to render per-request. The trade is a brief
 * placeholder on first paint, in exchange for the entire site being cacheable.
 */
export default function AuthBar() {
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [devLogin, setDevLogin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/me', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => {
        if (cancelled) return;
        setMe(d.user ?? null);
        setDevLogin(Boolean(d.devLogin));
      })
      .catch(() => {
        if (!cancelled) setMe(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Reserve the space so the header does not jump when the answer arrives.
  if (me === undefined) return <div className="authbar authbar--loading" aria-hidden="true" />;

  if (!me) {
    return (
      <div className="authbar">
        {devLogin && (
          <form className="devlogin" action="/auth/dev-login" method="post">
            <input name="handle" placeholder="handle" aria-label="Dev sign-in handle" defaultValue="juan" />
            <select name="role" aria-label="Dev sign-in role">
              <option value="citizen">citizen</option>
              <option value="moderator">moderator</option>
              <option value="admin">admin</option>
            </select>
            <button type="submit" className="btn btn--sm">
              Dev sign in
            </button>
          </form>
        )}
        <a className="btn btn--primary btn--sm" href="/signin">
          Sign in
        </a>
      </div>
    );
  }

  return (
    <div className="authbar">
      <span className="authbar-who">
        {me.displayName}
        {me.verified && (
          <span className="badge badge--ok" title="Identity verified">
            verified
          </span>
        )}
        {me.role !== 'citizen' && <span className="badge">{me.role}</span>}
      </span>
      {(me.role === 'moderator' || me.role === 'admin') && (
        <a href="/moderation" className="authbar-link">
          Moderation
        </a>
      )}
      <form action="/api/auth/logout" method="post">
        <button type="submit" className="authbar-link authbar-link--button">
          Sign out
        </button>
      </form>
    </div>
  );
}
