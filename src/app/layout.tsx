import type { Metadata, Viewport } from "next";
// Weights the CSS uses (font-light 300 for the serif headlines, 400-600).
// The browser downloads only the weights a page actually renders.
import "@fontsource/ibm-plex-sans/300.css";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
// Headings, numbers and the drones' wordmark use Clash Display (globals.css @font-face).
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import "./globals.css";
import Header from "@/components/layout/Header";
import AnalyticsInit from "@/components/analytics/AnalyticsInit";
import ConsentBanner from "@/components/analytics/ConsentBanner";
import { gtmBootstrap } from "@/lib/gtmBootstrap";
import { CONSENT_DEFAULTS } from "@/lib/consent";
import Footer from "@/components/layout/Footer";
import SiteBackdrop from "@/components/layout/SiteBackdrop";
import { organizationJsonLd, websiteJsonLd } from "@/lib/jsonld";

/**
 * GTM + GA4 (docs/analytics-setup.md). Production deployments only, so previews and local
 * builds never report into the live property; ANALYTICS_FORCE_GTM=1 lets a local production
 * build load it for testing (check-datalayer). The GA4 measurement ID lives in GTM, not here.
 */
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "";
const GTM_ON =
  /^GTM-[A-Z0-9]+$/.test(GTM_ID) &&
  (process.env.VERCEL_ENV === "production" || process.env.ANALYTICS_FORCE_GTM === "1");

export const metadata: Metadata = {
  title: {
    default: "Airimation | Drone-Swarm Light Shows — Noida, Delhi NCR",
    // Pages give their own short title; this adds the brand.
    template: "%s | Airimation",
  },
  description:
    "Airimation designs, builds and flies synchronised LED drone-swarm light shows for civic celebrations, festivals, weddings and corporate events across North India.",
  metadataBase: new URL("https://airimation.in"),
  openGraph: {
    title: "Airimation | Drone-Swarm Light Shows",
    description:
      "Synchronised LED drone-swarm light shows for civic, festival, wedding and corporate events. Based in Noida, serving Uttar Pradesh and Delhi NCR.",
    siteName: "Airimation",
    locale: "en_IN",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#060607",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      {GTM_ON && (
        <head>
          {/* Consent defaults must run before GTM (consent.ts); then the lazy loader. Plain inline
              scripts, not next/script: GTM must stay off the hydration path (gtmBootstrap.ts). */}
          <script id="consent-defaults" dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULTS }} />
          <script id="gtm-bootstrap" dangerouslySetInnerHTML={{ __html: gtmBootstrap(GTM_ID) }} />
        </head>
      )}
      <body className="min-h-full flex flex-col bg-navy text-ink ambient-field">
        {GTM_ON && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        )}
        {/* Headings are above the fold on every page: fetch the display font with the HTML. */}
        <link rel="preload" href="/fonts/ClashDisplay-Variable.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <div className="site-shell">
          <SiteBackdrop />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <AnalyticsInit />
        <ConsentBanner />
      </body>
    </html>
  );
}
