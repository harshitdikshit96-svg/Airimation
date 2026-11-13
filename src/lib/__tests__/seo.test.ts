import { describe, expect, test } from "vitest";
import { pageMeta, PUBLIC_ROUTES } from "../seo";
import sitemap from "../../app/sitemap";

describe("SEO", () => {
  test("pageMeta: own title, canonical, Open Graph with the share image", () => {
    const m = pageMeta({ title: "Team", description: "d", path: "/team" });
    expect(m.title).toBe("Team");
    expect(m.alternates?.canonical).toBe("/team");
    const og = m.openGraph as { title: string; images: { url: string }[] };
    expect(og.title).toBe("Team | Airimation");
    expect(og.images[0].url).toBe("/opengraph-image.jpg");
  });
  test("sitemap lists every public page and nothing internal", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls.length).toBe(PUBLIC_ROUTES.length);
    for (const u of urls) expect(u).not.toMatch(/internal|credits|classic|\/s\//);
  });
});
