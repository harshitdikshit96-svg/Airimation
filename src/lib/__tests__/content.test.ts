import { describe, expect, test } from "vitest";
import { advisors, designTeaser, designYourShow, directors, team, teamConfig, visibleAdvisors } from "../content";
import { CULTURAL } from "../cultural";

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
