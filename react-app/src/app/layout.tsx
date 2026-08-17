import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import HotlineBar from '@/components/layout/HotlineBar';
import Nav from '@/components/app/Nav';
import InfoBar from '@/components/layout/InfoBar';
import Footer from '@/components/layout/Footer';
import PWAManager from '@/components/PWAManager';
import { LanguageProvider } from '@/contexts/LanguageContext';

export const viewport: Viewport = {
  themeColor: '#0032a0',
};

/**
 * The canonical host, which is the one the site actually serves on: the apex
 * 308-redirects to www. Everything that emits an absolute URL — canonical tags,
 * Open Graph, sitemap, robots — is derived from this so they cannot disagree.
 */
const SITE = (process.env.SITE_URL ?? 'https://www.betterisabela.org').replace(/\/$/, '');

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  // Resolved per route against metadataBase, so every page declares itself
  // canonical on one host instead of leaving apex and www to compete.
  alternates: { canonical: './' },
  title: { default: 'BetterIsabela.org | Official Portal', template: '%s | BetterIsabela.org' },
  description: 'BetterIsabela.org - Your digital gateway to PLGU Isabela services.',
  keywords: ['BetterIsabela', 'Isabela', 'PLGU Isabela', 'provincial services'],
  authors: [{ name: 'Eper Gaboni' }],
  openGraph: {
    type: 'website',
    locale: 'en_PH',
    url: SITE,
    siteName: 'BetterIsabela.org',
    title: 'BetterIsabela.org | Official Portal',
    description: 'Empowering the people of Isabela with transparent access to services.',
    images: [
      {
        url: '/assets/images/banners/opengraph.png',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: { card: 'summary_large_image' },
  icons: { icon: '/assets/images/logo/favicon.svg', apple: '/assets/images/logo/favicon.svg' },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BetterIsabela',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css"
        />
        <link rel="stylesheet" href="/assets/css/style.css" />
        <link rel="stylesheet" href="/assets/css/responsive.css" />
        <link rel="stylesheet" href="/assets/css/accessibility.css" />
        <link rel="stylesheet" href="/assets/css/footer.css" />
        <link rel="stylesheet" href="/assets/css/app.css" />
      </head>
      <body>
        <LanguageProvider>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <HotlineBar />
          <Nav />
          <InfoBar />
          <div id="main-content">{children}</div>
          <Footer />
          <PWAManager />
        </LanguageProvider>
        {/* An .mjs bundle must load as a module; as a classic script it throws
            "Cannot use import statement outside a module" and aborts hydration. */}
        <Script
          src="https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs"
          type="module"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
