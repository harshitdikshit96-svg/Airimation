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
};
