import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { advisors, designTeaser, designYourShow, directors, team, teamConfig, visibleAdvisors } from "../content";
import { CULTURAL } from "../cultural";
import { PALETTES } from "../show/palettes";
import * as content from "../content";
import { contactInfo } from "../content";
import { organizationJsonLd } from "../jsonld";

// Content rules from DECISIONS.md. Retired words are checked by
// `npm run lint` (scripts/check-brand-spelling.mjs).

describe("team", () => {
  test("directors are Harshit and Madhuri", () => {
    expect(directors.map((d) => d.name)).toEqual(["Harshit Dixit", "Madhuri Mishra"]);
    for (const d of directors) expect(d.role).toMatch(/Director/);
  });

  test("only non-hidden advisors are shown, and only when advisors are on", () => {
    const expected = teamConfig.showAdvisors ? advisors.filter((a) => !a.hidden) : [];
    expect(visibleAdvisors).toEqual(expected);
    for (const a of visibleAdvisors) expect(a.role).toMatch(/^Advisor/);
  });

  test("removed members appear nowhere", () => {
    const names = [...advisors, ...directors].map((p) => p.name).join(" ");
    for (const gone of ["Sandeep", "Anshuman", "Adarsh"]) expect(names).not.toContain(gone);
  });

  test("every shown member has a real photo path", () => {
    for (const m of team) expect(m.photo, m.name).toMatch(/^\/team\/[a-z-]+\.(jpg|png)$/);
  });
});

describe("Design a Show copy", () => {
  const copy = JSON.stringify([designYourShow, designTeaser]);

  test("never names a formation the library no longer has", () => {
    for (const gone of ["Mahadev", "Om at"]) expect(copy).not.toContain(gone);
  });

  test("the home page's stills are real formations, flyable at their fleet, with a render on disk", () => {
    const { fleet, items } = designTeaser.gallery;
    for (const item of items) {
      const f = CULTURAL.find((x) => x.id === item.id);
      expect(f, item.id).toBeTruthy();
      expect(f!.label).toBe(item.label);
      expect(f!.minDrones).toBeLessThanOrEqual(fleet);
      expect(existsSync(join(process.cwd(), "public/renders", `${item.id}-${item.hues}.webp`)), item.id).toBe(true);
      expect(item.alt.length).toBeGreaterThan(20);
      expect(PALETTES.some((p) => p.id === item.hues), `${item.id} theme`).toBe(true);
    }
  });

  test("names only formations that exist", () => {
    const labels = CULTURAL.map((f) => f.label);
    for (const named of ["Ganesha", "Nataraja", "Tiranga"]) {
      if (copy.includes(named)) expect(labels).toContain(named);
    }
  });

  test("is honest that the preview is a simulation, sped up", () => {
    expect(copy).toMatch(/simulation/i);
    expect(copy).toMatch(/faster|sped up/i);
    expect(copy).not.toMatch(/at the speed real drones move/i);
  });
});

describe("public email addresses", () => {
  const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g;
  const found = (value: unknown) => new Set(JSON.stringify(value).match(EMAIL) ?? []);

  test("is hello@airimation.in", () => {
    expect(contactInfo.email).toBe("hello@airimation.in");
  });

  test("content.ts publishes hello@ and the team's own @airimation.in addresses only", () => {
    const team = [...directors, ...advisors].map((m) => m.email).filter(Boolean);
    expect(team.sort()).toEqual(["gaurav@airimation.in", "harshit@airimation.in", "madhuri@airimation.in"]);
    expect([...found(content)].sort()).toEqual(["hello@airimation.in", ...team].sort());
  });

  test("the JSON-LD publishes the same address and no other", () => {
    expect(organizationJsonLd.email).toBe(contactInfo.email);
    expect([...found(organizationJsonLd)]).toEqual(["hello@airimation.in"]);
  });
});
