import { describe, expect, test } from "vitest";
import { pageMeta, PUBLIC_ROUTES } from "../seo";
import sitemap from "../../app/sitemap";
import { CULTURAL } from "../cultural";

describe("SEO", () => {
  test("pageMeta: own title, canonical, Open Graph with the share image", () => {
    const m = pageMeta({ title: "Team", description: "d", path: "/team" });
    expect(m.title).toBe("Team");
    expect(m.alternates?.canonical).toBe("/team");
    const og = m.openGraph as { title: string; images: { url: string }[] };
    expect(og.title).toBe("Team | Airimation");
    expect(og.images[0].url).toBe("/opengraph-image.jpg");
  });
  test("pageMeta: a page's own share image replaces the site's", () => {
    const m = pageMeta({ title: "T", description: "d", path: "/x", image: { url: "/renders/og/diya.jpg", alt: "a" } });
    const og = m.openGraph as { images: { url: string; width: number; alt: string }[] };
    expect(og.images[0]).toMatchObject({ url: "/renders/og/diya.jpg", width: 1200, alt: "a" });
  });
  test("sitemap lists every public page, one page per formation, and nothing internal", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls.length).toBe(PUBLIC_ROUTES.length + CULTURAL.length);
    for (const f of CULTURAL) expect(urls).toContain(`https://airimation.in/design-your-show/${f.id}`);
    expect(new Set(urls).size).toBe(urls.length);
    for (const u of urls) expect(u).not.toMatch(/internal|credits|\/classic(\/|$)|\/s\//);
  });
});
