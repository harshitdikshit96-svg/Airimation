import type { Metadata } from "next";
import "@fontsource/ibm-plex-sans/300.css";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-sans/700.css";
import "@fontsource/ibm-plex-serif/400.css";
import "@fontsource/ibm-plex-serif/500.css";
import "@fontsource/ibm-plex-serif/600.css";
import "@fontsource/ibm-plex-serif/700.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SiteBackdrop from "@/components/layout/SiteBackdrop";
import { company, site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Airimation | Drone-Swarm Light Shows — Noida, Delhi NCR",
  description:
    "Airimation designs, builds and flies synchronised LED drone-swarm light shows for civic celebrations, festivals, weddings and corporate events across North India.",
  keywords: [
    "drone show India",
    "drone light show Noida",
    "drone light show Delhi NCR",
    "Airimation",
    "drone swarm Uttar Pradesh",
    "wedding drone show",
    "festival drone show",
  ],
  metadataBase: new URL("https://airimation.in"),
  openGraph: {
    title: "Airimation | Drone-Swarm Light Shows",
    description:
      "Synchronised LED drone-swarm light shows for civic, festival, wedding and corporate events. Based in Noida, serving Uttar Pradesh and Delhi NCR.",
    siteName: "Airimation",
    locale: "en_IN",
    type: "website",
  },
};

// Organization structured data — declares the registered legal entity
// (`legalName`) distinctly from the public-facing brand (`name`), the way
// search engines expect when the two differ. Statutory detail — legal
// name, CIN, GSTIN, Udyam, DPIIT — lives on `company` in content.ts.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  legalName: company.legalName,
  url: "https://airimation.in",
  logo: "https://airimation.in/brand/airimation-logo-512.png",
  email: company.email,
  foundingDate: "2026-08-22",
  areaServed: "IN",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Greater Noida",
    addressRegion: "Uttar Pradesh",
    addressCountry: "IN",
  },
  // Statutory identifiers are deliberately NOT published here while the
  // site masks them (content.ts > revealRegistrationNumbers).
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-navy text-ink ambient-field">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <SiteBackdrop />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
