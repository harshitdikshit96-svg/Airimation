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

export const metadata: Metadata = {
  title: "Airmation | Biscope Drone-Swarm Light Shows — New Delhi",
  description:
    "Airmation designs and performs synchronised LED drone-swarm light shows for government celebrations, festivals, weddings and corporate events across North India. Biscope is our flagship experience.",
  keywords: [
    "drone show India",
    "drone light show New Delhi",
    "Biscope",
    "Airmation",
    "drone swarm Uttar Pradesh",
    "wedding drone show",
    "government drone show",
  ],
  metadataBase: new URL("https://airmation.in"),
  openGraph: {
    title: "Airmation | Biscope Drone-Swarm Light Shows",
    description:
      "Synchronised LED drone-swarm light shows for government, festival, wedding and corporate events. Based in New Delhi, serving Uttar Pradesh's festival and civic calendar.",
    siteName: "Airmation",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-navy text-ink ambient-field">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
