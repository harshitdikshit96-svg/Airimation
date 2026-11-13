import type { Metadata, Viewport } from "next";
// Weights the CSS uses (font-light 300 for the serif headlines, 400-600).
// The browser downloads only the weights a page actually renders.
import "@fontsource/ibm-plex-sans/300.css";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-serif/300.css";
import "@fontsource/ibm-plex-serif/400.css";
import "@fontsource/ibm-plex-serif/500.css";
import "@fontsource/ibm-plex-serif/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SiteBackdrop from "@/components/layout/SiteBackdrop";
import { organizationJsonLd } from "@/lib/jsonld";
import PhoneGate from "@/components/layout/PhoneGate";

export const metadata: Metadata = {
  title: {
    default: "Airimation | Drone-Swarm Light Shows — Noida, Delhi NCR",
    // Pages give their own short title; this adds the brand.
    template: "%s | Airimation",
  },
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
      <body className="min-h-full flex flex-col bg-navy text-ink ambient-field">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {/* The site itself. On phones (< 768 px) globals.css hides it — it
            stays in the HTML for search engines — and shows the PhoneGate. */}
        <div className="site-shell">
          <SiteBackdrop />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <PhoneGate />
      </body>
    </html>
  );
}
