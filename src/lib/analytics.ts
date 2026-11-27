/**
 * The ONLY module that touches window.dataLayer (docs/analytics-setup.md).
 *
 * Code pushes plain `{event, ...params}` objects; Custom Event triggers + GA4 Event tags in
 * Google Tag Manager forward them to GA4, so new tags and params need no deploy. Built from the
 * gtm-ga4-analytics skill's wrapper:
 *  - SSR-safe and never throws: tracking (ad blockers, blocked storage) must never break the
 *    action it's attached to.
 *  - The push waits for the next paint, so the browser paints the response to a tap before
 *    GTM's listeners run (INP). Clicks that leave the page push synchronously ({exit: true}).
 *  - Asks the lazy GTM bootstrap (gtmBootstrap.ts) to load via window.__loadGtm, except for
 *    passive events ({load: false}: views, vitals, 404), which wait in dataLayer.
 *  - Adds page_type to every event and drops anything that looks like personal data.
 *
 * Conversions: generate_lead fires ONLY after /api/contact confirms (ContactForm). A click is
 * never a conversion — see the skill's "29 fake conversions" lesson.
 */

type Params = Record<string, string | number | boolean | undefined | null>;
type Opts = { exit?: boolean; load?: boolean };

declare global {
  interface Window {
    dataLayer?: unknown[];
    __loadGtm?: () => void;
    __analyticsInit?: boolean;
    google_tag_manager?: unknown;
  }
}

/** First match wins. Values are the `page_type` dimension (docs/analytics-setup.md §4). */
const PAGE_TYPES: [RegExp, string][] = [
  [/^\/$/, "home"],
  [/^\/design-your-show\/?$/, "design_hub"],
  [/^\/design-your-show\/(classic|s)(\/|$)/, "design_classic"],
  [/^\/design-your-show\/[^/]+/, "formation"],
  [/^\/shows/, "shows"],
  [/^\/about/, "about"],
  [/^\/vision/, "vision"],
  [/^\/team/, "team"],
  [/^\/contact/, "contact"],
  [/^\/credits/, "credits"],
  [/^\/privacy/, "privacy"],
];

const PII_KEYS = new Set(["email", "phone", "mobile", "tel", "name", "full_name", "message", "address", "organization"]);
const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/;

export function pageType(path: string): string {
  for (const [re, type] of PAGE_TYPES) if (re.test(path)) return type;
  return "other";
}

/** Drops empty values and anything personal; GA4 truncates values at 100 chars anyway. */
export function cleanParams(params: Params = {}): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    if (PII_KEYS.has(k.toLowerCase())) continue;
    if (typeof v === "string" && EMAIL_RE.test(v)) continue;
    out[k] = typeof v === "string" ? v.slice(0, 100) : v;
  }
  return out;
}

function rawPush(obj: Record<string, unknown>, load = true) {
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(obj);
    if (load && typeof window.__loadGtm === "function") window.__loadGtm();
  } catch {
    /* best-effort */
  }
}

/**
 * Run `fn` after the next paint without ever losing it: rAF pauses in hidden pages (a mailto:
 * tap, a new tab), so race it against a short timeout and flush when the page is hidden.
 */
const inflight = new Set<() => void>();
let hooked = false;
function afterPaint(fn: () => void) {
  if (!hooked) {
    hooked = true;
    const flush = () => [...inflight].forEach((f) => f());
    document.addEventListener("visibilitychange", () => document.visibilityState === "hidden" && flush());
    window.addEventListener("pagehide", flush);
  }
  let done = false;
  const once = () => {
    if (done) return;
    done = true;
    clearTimeout(t);
    inflight.delete(once);
    fn();
  };
  inflight.add(once);
  const t = setTimeout(once, 120);
  requestAnimationFrame(() => setTimeout(once, 0));
}

/** Track any event. `exit` for clicks that leave the page; `load: false` for passive events. */
export function track(event: string, params: Params = {}, opts: Opts = {}) {
  if (typeof window === "undefined") return;
  const run = () => {
    try {
      rawPush({ event, page_type: pageType(window.location.pathname), ...cleanParams(params) }, opts.load !== false);
    } catch {
      /* best-effort */
    }
  };
  if (opts.exit) run();
  else afterPaint(run);
}

// ---------- Basic events ----------

/** Main call-to-action clicks come from markup (data-track="cta", autotrack.ts). */
export const trackCta = (ctaName: string, placement: string, linkUrl?: string) =>
  track("cta_click", { cta_name: ctaName, placement, link_url: linkUrl });

export const trackPageNotFound = () => track("page_not_found", {}, { load: false });

/** From error boundaries. The message only, never a stack or a URL with a query string. */
export function trackException(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  track("exception", { description: msg.replace(/https?:\/\/\S+/g, "[url]").slice(0, 100), fatal: false }, { load: false });
}

// ---------- The conversion ----------

const LEAD_TYPES: [RegExp, string][] = [
  [/civic|district/i, "civic"],
  [/temple|festival/i, "temple_festival"],
  [/wedding|venue/i, "wedding"],
  [/corporate|agency/i, "corporate"],
  [/investor|partner/i, "investor_partner"],
];

/** "Temple Trust / Festival Committee" → "temple_festival" (an enum, never free text). */
export function leadType(orgType: string | null | undefined): string {
  for (const [re, t] of LEAD_TYPES) if (orgType && re.test(orgType)) return t;
  return "other";
}

/** How far ahead the event is: a bucket, not the date. */
export function leadTime(eventDate: string | null | undefined, now = new Date()): string {
  if (!eventDate) return "not_given";
  const d = new Date(eventDate);
  if (Number.isNaN(d.getTime())) return "not_given";
  const months = (d.getTime() - now.getTime()) / (30.44 * 864e5);
  if (months < 1) return "under_1_month";
  if (months < 3) return "1_3_months";
  if (months < 6) return "3_6_months";
  return "6_months_plus";
}

/** THE key event. Call only after /api/contact returned 2xx. */
export const trackGenerateLead = (orgType: string, eventDate?: string) =>
  track("generate_lead", { lead_type: leadType(orgType), lead_time: leadTime(eventDate), source_formation: lastFormation() || "none" });

/** Field NAME only, never its value. */
export const trackFormError = (formId: string, errorType: "validation" | "server" | "network", errorField?: string) =>
  track("form_submit_error", { form_id: formId, error_type: errorType, error_field: errorField });

// ---------- Design a Show ----------

const LAST_FORMATION = "last_formation";
/** The last formation viewed this session: sent with the lead (GA4 and the leads table). */
export function lastFormation(): string {
  try {
    return sessionStorage.getItem(LAST_FORMATION) || "";
  } catch {
    return "";
  }
}

export type PickMethod = "link" | "chip" | "tour" | "theme_filter";

export function trackFormationView(p: { id: string; theme: string; fleet: number; hues: string; pick: PickMethod }) {
  try {
    sessionStorage.setItem(LAST_FORMATION, p.id);
  } catch {
    /* best-effort */
  }
  track(
    "formation_view",
    { formation_id: p.id, formation_theme: p.theme, fleet_size: String(p.fleet), led_theme: p.hues, pick_method: p.pick },
    { load: p.pick !== "link" && p.pick !== "tour" },
  );
}

export const trackShowCustomise = (control: "theme_filter" | "fleet" | "led_theme" | "view_all" | "pause" | "play", option: string, formationId: string) =>
  track("show_customise", { control, option, formation_id: formationId });

const scenesSeen = new Set<string>();
/** Once per page view per scene + result/action. */
export function trackScene3d(scene: "home" | "design", p: { result?: "live" | "poster_fallback" | "failed"; quality_tier?: string; action?: "orbit" | "zoom" }) {
  const key = `${location.pathname}|${scene}|${p.result ?? ""}|${p.action ?? ""}`;
  if (scenesSeen.has(key)) return;
  scenesSeen.add(key);
  track("scene_3d", { scene, ...p }, { load: Boolean(p.action) });
}

const beatsSeen = new Set<string>();
export function trackHomeStory(beat: number) {
  const key = `${location.pathname}|${beat}`;
  if (beatsSeen.has(key)) return;
  beatsSeen.add(key);
  track("home_story_progress", { beat });
}

export const trackSelectFormationStill = (id: string) => track("select_content", { content_type: "formation_still", item_id: id });

export const trackShare = (method: "copy" | "native" | "whatsapp", formationId: string) =>
  track("share", { method, content_type: "formation", item_id: formationId }, { exit: method === "whatsapp" });

export const trackClip = (action: "record" | "download" | "share", formationId: string, fleet: number) =>
  track("clip_record", { action, formation_id: formationId, fleet_size: String(fleet) });
