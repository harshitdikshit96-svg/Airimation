/**
 * Where each enquiry came from, stored with the lead in our own database (docs/analytics-
 * setup.md §4), so it survives ad blockers and declined consent. From the skill's
 * assets/attribution.js, trimmed to what Airimation stores (no ads → no click ids).
 *
 * captureAttribution() on every client-side page view; getAttribution() spread into the
 * /api/contact payload. Client-only; never throws.
 */
import { lastFormation } from "./analytics";

const KEY = "attr_v1";
const TTL_DAYS = 90;

type Touch = { utm_source: string; utm_medium: string; utm_campaign: string; landing_path: string; referrer: string; at: number };

function read(): Touch | null {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null") as Touch | null;
    return v && Date.now() - v.at < TTL_DAYS * 864e5 ? v : null;
  } catch {
    return null;
  }
}

/** First landing within 90 days; a later campaign visit (UTMs or an external referrer) replaces it. */
export function captureAttribution() {
  try {
    const url = new URL(window.location.href);
    const q = url.searchParams;
    let referrer = "";
    try {
      if (document.referrer && new URL(document.referrer).host !== url.host) referrer = document.referrer.slice(0, 300);
    } catch {
      /* ignore */
    }
    const utm = { utm_source: q.get("utm_source") || "", utm_medium: q.get("utm_medium") || "", utm_campaign: q.get("utm_campaign") || "" };
    const isNewTouch = Boolean(utm.utm_source || utm.utm_medium || utm.utm_campaign || referrer);
    if (read() && !isNewTouch) return;
    const touch: Touch = {
      utm_source: utm.utm_source.slice(0, 100),
      utm_medium: utm.utm_medium.slice(0, 100),
      utm_campaign: utm.utm_campaign.slice(0, 100),
      landing_path: url.pathname.slice(0, 200),
      referrer,
      at: Date.now(),
    };
    localStorage.setItem(KEY, JSON.stringify(touch));
  } catch {
    /* best-effort */
  }
}

/** GA client id from the _ga cookie ("GA1.1.123.456" → "123.456"), for joining a lead to GA4. */
export function gaClientId(): string {
  try {
    const m = document.cookie.match(/(?:^|; )_ga=([^;]*)/);
    const parts = m ? decodeURIComponent(m[1]).split(".") : [];
    return parts.length >= 4 ? `${parts[2]}.${parts[3]}` : "";
  } catch {
    return "";
  }
}

export function getAttribution() {
  const t = read();
  return {
    utm_source: t?.utm_source || undefined,
    utm_medium: t?.utm_medium || undefined,
    utm_campaign: t?.utm_campaign || undefined,
    landing_path: t?.landing_path || undefined,
    referrer: t?.referrer || undefined,
    ga_client_id: gaClientId() || undefined,
    source_formation: lastFormation() || undefined,
  };
}
