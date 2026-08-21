'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/market', label: 'Buy & Sell' },
  { href: '/prices', label: 'Prices' },
  { href: '/progress', label: 'Progress' },
  { href: '/services', label: 'Services' },
  { href: '/charter', label: 'Charter Watch' },
  { href: '/statistics', label: 'Statistics' },
  { href: '/ask', label: 'Q&A' },
  { href: '/officials', label: 'Officials' },
];

const PANEL_ID = 'appnav-menu';

/**
 * The main menu. One row of links on a wide screen, a disclosure menu below
 * 900px — which is where a signed-in header runs out of room, since the name,
 * role badge, moderation link and sign-out take the space ten links need.
 *
 * Marks the section you are in; aria-current drives the styling.
 */
export default function NavLinks() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // The panel overlays the page it has just navigated to, so it closes itself.
  useEffect(() => setOpen(false), [pathname]);

  // Escape is the first thing a keyboard user reaches for.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="appnav-toggle"
        aria-expanded={open}
        aria-controls={PANEL_ID}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="appnav-burger" aria-hidden="true" />
        <span className="appnav-toggle-label">Menu</span>
      </button>

      <ul id={PANEL_ID} className={open ? 'appnav-links is-open' : 'appnav-links'}>
        {LINKS.map((l) => {
          const current = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href);
          return (
            <li key={l.href}>
              <a href={l.href} aria-current={current ? 'page' : undefined}>
                {l.label}
              </a>
            </li>
          );
        })}
      </ul>

      {/* The panel is opened by script, so without script it is simply always
          open rather than unreachable. The links are in the HTML either way. */}
      <noscript>
        <style>{
          '@media (max-width: 900px) {' +
          '.appnav-links { display: flex !important; position: static !important; ' +
          'box-shadow: none !important; padding-left: 0 !important; }' +
          '.appnav-toggle { display: none !important; }' +
          '.appnav-inner { flex-wrap: wrap !important; }' +
          '.appnav-inner > nav { order: 3 !important; flex-basis: 100% !important; }' +
          '}'
        }</style>
      </noscript>
    </>
  );
}
