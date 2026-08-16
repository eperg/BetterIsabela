import AuthBar from './AuthBar';
import NavLinks from './NavLinks';

export default function Nav() {
  return (
    <header className="appnav">
      <div className="appnav-inner">
        <a href="/" className="appnav-brand">
          Better<strong>Isabela</strong>
        </a>
        <nav aria-label="Main">
          <NavLinks />
        </nav>
        <AuthBar />
      </div>
    </header>
  );
}
