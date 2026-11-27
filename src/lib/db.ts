import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

/**
 * Returns a tagged-template SQL client for Neon, or null if DATABASE_URL
 * isn't configured yet. Keeping this nullable means local development and
 * builds work before a Neon project is wired in.
 */
export function getSql() {
  if (!databaseUrl) {
    return null;
  }
  return neon(databaseUrl);
}

export type LeadSubmission = {
  name: string;
  email: string;
  phone?: string;
  organization_type: string;
  event_date?: string;
  message: string;
  /** Where the enquiry came from (src/lib/attribution.ts). All optional; never shown to the visitor. */
  attribution?: LeadAttribution;
};

export const ATTRIBUTION_FIELDS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "landing_path",
  "referrer",
  "ga_client_id",
  "source_formation",
] as const;
export type LeadAttribution = Partial<Record<(typeof ATTRIBUTION_FIELDS)[number], string>>;
