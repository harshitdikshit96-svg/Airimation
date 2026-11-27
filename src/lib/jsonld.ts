import { company, contactInfo, site } from "./content";

// Organization structured data — declares the registered legal entity
// (`legalName`) distinctly from the public-facing brand (`name`), the way
// search engines expect when the two differ. Statutory detail — legal
// name, CIN, GSTIN, Udyam, DPIIT — lives on `company` in content.ts; the
// one public email on `contactInfo`.
export const ORGANIZATION_ID = "https://airimation.in/#organization";

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ORGANIZATION_ID,
  name: site.name,
  legalName: company.legalName,
  url: "https://airimation.in",
  logo: "https://airimation.in/brand/airimation-logo-512.png",
  email: contactInfo.email,
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

// The site itself, published by the organisation (root layout).
export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://airimation.in/#website",
  name: site.name,
  url: "https://airimation.in",
  inLanguage: "en-IN",
  publisher: { "@id": ORGANIZATION_ID },
};

// What we offer (/shows). No price, no reviews, no claim of shows flown:
// the company is pre-first-show (DECISIONS.md).
export const showServiceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://airimation.in/shows#service",
  serviceType: "Drone light show",
  name: "Drone light shows",
  description:
    "Synchronised LED drone-swarm light shows, end to end: concept and 3D formation design, safety validation in simulation, DGCA and local permissions, and live execution.",
  provider: { "@id": ORGANIZATION_ID },
  areaServed: [
    { "@type": "State", name: "Uttar Pradesh" },
    { "@type": "Place", name: "Delhi NCR" },
  ],
  audience: [
    { "@type": "Audience", audienceType: "Civic and public celebrations" },
    { "@type": "Audience", audienceType: "Temple-town and festival organisers" },
    { "@type": "Audience", audienceType: "Weddings" },
    { "@type": "Audience", audienceType: "Corporate events and brand launches" },
  ],
  url: "https://airimation.in/shows",
};
