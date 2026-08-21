import AuthBar from './AuthBar';
import NavLinks from './NavLinks';
import { isSsoConfigured } from '@/lib/egov';
import { isEmailAuthConfigured } from '@/lib/supabase';

/**
 * Whether the local sign-in shortcut should be offered. This is deployment
 * configuration, not per-request state, so it is resolved here during render
 * rather than asked for over the network: the header cannot work it out for
 * itself, and /api/me is skipped entirely for anonymous readers.
 */
function devLoginAvailable(): boolean {
  return (
    process.env.NODE_ENV !== 'production' && !isSsoConfigured() && !isEmailAuthConfigured()
  );
}

export default function Nav() {
  return (
    <header className="appnav">
      <div className="appnav-inner">
        <a href="/" className="appnav-brand">
          {/* The link is already named by the wordmark beside it, so the seal is
              alt="" rather than announcing the province twice. */}
          <img
            className="appnav-seal"
            src="/assets/images/logo/isabela-seal.png"
            width={38}
            height={38}
            alt=""
          />
          Better<strong>Isabela</strong>
        </a>
        <nav aria-label="Main">
          <NavLinks />
        </nav>
        <AuthBar devLogin={devLoginAvailable()} />
      </div>
    </header>
  );
}
