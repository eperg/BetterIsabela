'use client';

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

/** Marks the section you are in — aria-current drives the styling. */
export default function NavLinks() {
  const pathname = usePathname();

  return (
    <ul className="appnav-links">
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
  );
}
