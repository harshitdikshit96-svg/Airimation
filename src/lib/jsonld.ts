import { company, contactInfo, site } from "./content";

// Organization structured data — declares the registered legal entity
// (`legalName`) distinctly from the public-facing brand (`name`), the way
// search engines expect when the two differ. Statutory detail — legal
// name, CIN, GSTIN, Udyam, DPIIT — lives on `company` in content.ts; the
// one public email on `contactInfo`.
export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
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
