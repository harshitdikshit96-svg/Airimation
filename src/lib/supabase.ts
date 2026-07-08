import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Server-side Supabase client, used only inside API routes.
 * Returns null if env vars are not configured yet, so local development
 * and builds work before a Supabase project is wired in.
 */
export function getSupabaseServerClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

export type LeadSubmission = {
  name: string;
  email: string;
  phone?: string;
  organization_type: string;
  event_date?: string;
  message: string;
};
