/**
 * One delegated listener that turns markup into the basic events (gtm-ga4-analytics skill),
 * so server components need no tracking code. initAutoTrack() once per page load.
 *
 *   cta_click      any element with data-track="cta" (+ data-cta="name", optional data-placement)
 *   contact_click  every mailto: / tel: / WhatsApp link — method + placement, never the address
 *   form_start     first focus inside a <form>, once per form per page (passive)
 *
 * Opt out with data-notrack on an element or ancestor. Other outbound links are left to GA4
 * Enhanced Measurement. form_submit_error and generate_lead come from ContactForm itself.
 */
import { track } from "./analytics";

const CONTACT: [RegExp, string][] = [
  [/^tel:/i, "phone"],
  [/^mailto:/i, "email"],
  [/^whatsapp:|^https?:\/\/(wa\.me|(api|web)\.whatsapp\.com)\b/i, "whatsapp"],
];
const PLACEMENT_SEL = "[data-placement],header,nav,footer,aside,dialog,[role=dialog],section[id]";

const slug = (s: string | null | undefined) =>
  String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 40);

function placementOf(el: Element): string {
  const p = el.closest<HTMLElement>(PLACEMENT_SEL);
  if (!p) return "body";
  if (p.dataset.placement) return p.dataset.placement;
  const tag = p.tagName.toLowerCase();
  if (tag === "aside") return "sidebar";
  if (tag === "dialog" || p.getAttribute("role") === "dialog") return "modal";
  if (tag === "section") return slug(p.id) || "body";
  return tag;
}

/** Path only for internal links; never the query string (it can carry tokens or emails). */
function linkUrl(a: HTMLAnchorElement | null): string | undefined {
  if (!a) return undefined;
  try {
    const u = new URL(a.href, location.href);
    return u.origin === location.origin ? u.pathname : u.origin + u.pathname;
  } catch {
    return undefined;
  }
}

const lastSeen = new Map<string, number>();
const throttled = (key: string) => {
  const now = Date.now();
  if (now - (lastSeen.get(key) || 0) < 1000) return true;
  lastSeen.set(key, now);
  return false;
};

function onClick(e: MouseEvent) {
  const t = e.target;
  if (!(t instanceof Element) || t.closest("[data-notrack]")) return;
  const a = t.closest<HTMLAnchorElement>("a[href]");

  const cta = t.closest<HTMLElement>("[data-track='cta']");
  if (cta) {
    const name = cta.dataset.cta || slug(cta.getAttribute("aria-label") || cta.textContent) || "cta";
    if (throttled(`cta|${name}`)) return;
    const link = cta.closest<HTMLAnchorElement>("a[href]") || cta.querySelector<HTMLAnchorElement>("a[href]");
    track("cta_click", { cta_name: name, placement: placementOf(cta), link_url: linkUrl(link) });
    return;
  }

  if (!a) return;
  const href = a.getAttribute("href") || "";
  for (const [re, method] of CONTACT) {
    if (re.test(href)) {
      track("contact_click", { method, placement: placementOf(a) }, { exit: true });
      return;
    }
  }
}

function formIdOf(f: HTMLFormElement): string {
  return slug(f.dataset.form || f.id || f.getAttribute("name")) || `form_${[...document.forms].indexOf(f) + 1}`;
}

const started = new WeakSet<HTMLFormElement>();
function onFocusIn(e: FocusEvent) {
  const f = e.target instanceof Element ? e.target.closest("form") : null;
  if (!f || f.closest("[data-notrack]") || started.has(f)) return;
  started.add(f);
  track("form_start", { form_id: formIdOf(f) }, { load: false });
}

export function initAutoTrack() {
  const w = window as Window & { __autoTrack?: boolean };
  if (typeof window === "undefined" || w.__autoTrack) return;
  w.__autoTrack = true;
  document.addEventListener("click", onClick, { passive: true });
  document.addEventListener("focusin", onFocusIn, { passive: true });
}
