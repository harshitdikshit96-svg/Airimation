import { describe, expect, test } from "vitest";
import { checkLead, LIMITS, makeRateLimiter } from "../leadValidation";
import { orgTypes } from "../content";

const good = { name: "Asha", email: "asha@example.com", organization_type: orgTypes[0], message: "A Diwali show" };

describe("contact form validation", () => {
  test("a good lead passes, trimmed", () => {
    const r = checkLead({ ...good, name: "  Asha ", phone: "+91 98100 00000", event_date: "2026-11-20" });
    expect(r.ok).toBe(true);
    if (r.ok === true) expect(r.lead.name).toBe("Asha");
  });
  test("missing, non-string and over-long fields are refused", () => {
    expect(checkLead({ ...good, message: "" }).ok).toBe(false);
    expect(checkLead({ ...good, name: { a: 1 } }).ok).toBe(false);
    expect(checkLead({ ...good, message: "x".repeat(LIMITS.message + 1) }).ok).toBe(false);
    expect(checkLead([good]).ok).toBe(false);
    expect(checkLead(null).ok).toBe(false);
  });
  test("bad email, unknown organisation type, bad date or phone are refused", () => {
    expect(checkLead({ ...good, email: "nope" }).ok).toBe(false);
    expect(checkLead({ ...good, organization_type: "Hacker" }).ok).toBe(false);
    expect(checkLead({ ...good, event_date: "tomorrow" }).ok).toBe(false);
    expect(checkLead({ ...good, phone: "<script>" }).ok).toBe(false);
  });
  test("the honeypot marks a bot as spam", () => {
    expect(checkLead({ ...good, website: "http://spam" }).ok).toBe("spam");
  });
  test("rate limit: 5 per window per IP, then refused, then allowed again", () => {
    const allow = makeRateLimiter(5, 1000);
    for (let i = 0; i < 5; i++) expect(allow("1.2.3.4", i)).toBe(true);
    expect(allow("1.2.3.4", 10)).toBe(false);
    expect(allow("5.6.7.8", 10)).toBe(true);
    expect(allow("1.2.3.4", 2000)).toBe(true);
  });
});
