// Validation for the public contact endpoint (POST /api/contact). Pure, so it
// is unit-tested (src/lib/__tests__/leadValidation.test.ts).

import { orgTypes } from "./content";
import { ATTRIBUTION_FIELDS, type LeadAttribution, type LeadSubmission } from "./db";

export const LIMITS = { name: 120, email: 200, phone: 40, message: 5000 } as const;

/** `field` names the input at fault (never its value), for the form_submit_error event. */
export type LeadCheck = { ok: true; lead: LeadSubmission } | { ok: false; error: string; field?: string } | { ok: "spam" };

/** Attribution caps: short strings only; anything else is dropped, never an error. */
const ATTR_MAX = 300;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const str = (v: unknown): string | null => (typeof v === "string" ? v.trim() : null);

/** Check a raw JSON body: strings only, length caps, a known organisation type, a real date. */
export function checkLead(body: unknown): LeadCheck {
  if (!body || typeof body !== "object" || Array.isArray(body)) return { ok: false, error: "Invalid request body." };
  const b = body as Record<string, unknown>;
  // Honeypot: a hidden field only bots fill in. Pretend success, store nothing.
  if (typeof b.website === "string" && b.website.trim() !== "") return { ok: "spam" };

  const name = str(b.name);
  const email = str(b.email);
  const organization_type = str(b.organization_type);
  const message = str(b.message);
  if (!name || !email || !organization_type || !message) {
    const missing = !name ? "name" : !email ? "email" : !organization_type ? "organization_type" : "message";
    return { ok: false, error: "Name, email, organisation type and message are required.", field: missing };
  }
  if (name.length > LIMITS.name || email.length > LIMITS.email || message.length > LIMITS.message) {
    const field = name.length > LIMITS.name ? "name" : email.length > LIMITS.email ? "email" : "message";
    return { ok: false, error: `Please keep the message under ${LIMITS.message.toLocaleString("en-IN")} characters.`, field };
  }
  if (!EMAIL.test(email)) return { ok: false, error: "Please provide a valid email address.", field: "email" };
  if (!orgTypes.includes(organization_type)) return { ok: false, error: "Please choose who you are reaching out as.", field: "organization_type" };

  let phone: string | undefined;
  if (b.phone !== undefined && b.phone !== null && b.phone !== "") {
    const p = str(b.phone);
    if (p === null || p.length > LIMITS.phone || !/^[+\d\s()-]*$/.test(p)) return { ok: false, error: "Please check the phone number.", field: "phone" };
    phone = p || undefined;
  }
  let event_date: string | undefined;
  if (b.event_date !== undefined && b.event_date !== null && b.event_date !== "") {
    const d = str(b.event_date);
    if (d === null || !DATE.test(d) || Number.isNaN(Date.parse(d))) return { ok: false, error: "Please check the event date.", field: "event_date" };
    event_date = d;
  }
  return { ok: true, lead: { name, email, phone, organization_type, event_date, message, attribution: checkAttribution(b.attribution) } };
}

/** Known keys, strings only, capped; anything malformed is silently dropped. */
export function checkAttribution(raw: unknown): LeadAttribution | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const r = raw as Record<string, unknown>;
  const out: LeadAttribution = {};
  for (const k of ATTRIBUTION_FIELDS) {
    const v = str(r[k]);
    if (v) out[k] = v.slice(0, ATTR_MAX);
  }
  return Object.keys(out).length ? out : undefined;
}

/**
 * A small per-IP limit: at most `max` submissions per `windowMs`. In memory,
 * so it is per server instance — a speed bump against a script hammering
 * the form, not a guarantee. (A shared limit needs a store, e.g. a Vercel
 * firewall rule.)
 */
export function makeRateLimiter(max = 5, windowMs = 10 * 60 * 1000) {
  const hits = new Map<string, number[]>();
  return (key: string, now = Date.now()): boolean => {
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= max) {
      hits.set(key, recent);
      return false;
    }
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 5000) hits.clear(); // never grow without bound
    return true;
  };
}
