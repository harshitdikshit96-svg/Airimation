import { describe, expect, test } from "vitest";
import { cleanParams, leadTime, leadType, pageType } from "../analytics";
import { gtmBootstrap } from "../gtmBootstrap";
import { CONSENT_DEFAULTS, CONSENT_REGIONS, inConsentRegion } from "../consent";
import { checkAttribution, checkLead } from "../leadValidation";
import { orgTypes } from "../content";
import plan from "../../../docs/analytics-plan.json";

// GTM + GA4 rules (docs/analytics-setup.md). The conversion itself (generate_lead only after
// /api/contact succeeds) is checked in the browser by scripts/e2e.mjs.

describe("analytics wrapper", () => {
  test("page_type covers every public route", () => {
    expect(pageType("/")).toBe("home");
    expect(pageType("/design-your-show")).toBe("design_hub");
    expect(pageType("/design-your-show/ganesha")).toBe("formation");
    expect(pageType("/design-your-show/classic")).toBe("design_classic");
    for (const p of ["/shows", "/about", "/vision", "/team", "/contact", "/credits", "/privacy"]) expect(pageType(p)).toBe(p.slice(1));
    expect(pageType("/nope")).toBe("other");
  });

  test("no personal data survives: PII keys and anything that looks like an email are dropped", () => {
    const out = cleanParams({ email: "a@b.co", name: "Asha", phone: "98", message: "hi", note: "x@y.in", lead_type: "civic", n: 0 });
    expect(out).toEqual({ lead_type: "civic", n: 0 });
    expect(String(cleanParams({ x: "y".repeat(300) }).x)).toHaveLength(100);
  });

  test("every organisation type maps to a lead_type enum; only 'Other' is other", () => {
    const types = orgTypes.map(leadType);
    expect(new Set(types).size).toBe(orgTypes.length);
    expect(types.filter((t) => t === "other")).toHaveLength(1);
    for (const t of types) expect(t).toMatch(/^[a-z_]+$/);
  });

  test("lead_time is a bucket, never the date", () => {
    const now = new Date("2026-11-27T00:00:00Z");
    expect(leadTime(undefined, now)).toBe("not_given");
    expect(leadTime("not a date", now)).toBe("not_given");
    expect(leadTime("2026-12-10", now)).toBe("under_1_month");
    expect(leadTime("2027-01-20", now)).toBe("1_3_months");
    expect(leadTime("2027-04-01", now)).toBe("3_6_months");
    expect(leadTime("2027-11-01", now)).toBe("6_months_plus");
  });
});

describe("GTM loader and consent", () => {
  test("bootstrap: valid id only, never on /internal or /api, consent before gtm.js", () => {
    expect(() => gtmBootstrap("G-123")).toThrow();
    const js = gtmBootstrap("GTM-ABC123");
    expect(js).toContain("gtm.js?id=GTM-ABC123");
    const exclude = new RegExp(JSON.parse(js.match(/new RegExp\(("[^"]+")\)/)![1]));
    expect(exclude.test("/internal/quiz")).toBe(true);
    expect(exclude.test("/api/contact")).toBe(true);
    expect(exclude.test("/design-your-show")).toBe(false);
    expect(js).toMatch(/head\.concat\(\[\{'gtm\.start'/); // consent commands stay first
  });

  test("Consent Mode v2: both defaults set all four parameters; Europe denied; ads denied everywhere", () => {
    const defaults = CONSENT_DEFAULTS.match(/gtag\('consent','default',\{[^}]+\}/g) ?? [];
    expect(defaults).toHaveLength(2);
    for (const d of defaults) for (const k of ["analytics_storage", "ad_storage", "ad_user_data", "ad_personalization"]) expect(d).toContain(k);
    expect(defaults[0]).toContain("analytics_storage:'denied'");
    expect(defaults[1]).toContain("analytics_storage:'granted'");
    for (const d of defaults) expect(d).toContain("ad_storage:'denied'");
    for (const c of ["DE", "FR", "GB", "CH", "NO", "IS"]) expect(CONSENT_REGIONS).toContain(c);
    expect(CONSENT_REGIONS).not.toContain("IN");
  });

  test("the banner shows for European time zones only", () => {
    expect(inConsentRegion("Europe/Berlin")).toBe(true);
    expect(inConsentRegion("Europe/London")).toBe(true);
    expect(inConsentRegion("Atlantic/Canary")).toBe(true);
    expect(inConsentRegion("Asia/Kolkata")).toBe(false);
    expect(inConsentRegion("Asia/Dubai")).toBe(false);
    expect(inConsentRegion("America/New_York")).toBe(false);
  });
});

describe("lead attribution and form errors", () => {
  const good = { name: "Asha", email: "asha@example.com", organization_type: orgTypes[0], message: "A Diwali show" };

  test("known attribution keys pass, capped; junk is dropped, never an error", () => {
    const a = checkAttribution({ utm_source: "instagram", referrer: "x".repeat(500), evil: "1", ga_client_id: 5 });
    expect(a).toEqual({ utm_source: "instagram", referrer: "x".repeat(300) });
    expect(checkAttribution("nope")).toBeUndefined();
    const r = checkLead({ ...good, attribution: { source_formation: "ganesha" } });
    expect(r.ok === true && r.lead.attribution).toEqual({ source_formation: "ganesha" });
    expect(checkLead({ ...good, attribution: [1, 2] }).ok).toBe(true);
  });

  test("errors name the field, never echo its value", () => {
    const r = checkLead({ ...good, email: "nope" });
    expect(r.ok === false && r.field).toBe("email");
    const d = checkLead({ ...good, event_date: "tomorrow" });
    expect(d.ok === false && d.field).toBe("event_date");
  });
});

describe("measurement plan", () => {
  test("the only key event is generate_lead; every extra says why", () => {
    expect(plan.events.filter((e) => "keyEvent" in e && e.keyEvent).map((e) => e.name)).toEqual(["generate_lead"]);
    for (const e of plan.events) if ("tier" in e && e.tier === "extra") expect("why" in e && e.why).toBeTruthy();
  });
});
