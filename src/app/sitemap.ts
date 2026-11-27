import type { MetadataRoute } from "next";
import { PUBLIC_ROUTES, SITE_URL } from "@/lib/seo";
import { allFormationFacts, formationPath } from "@/lib/cultural/facts";

/**
 * The public pages, for search engines, then one page per Design a Show
 * formation (docs/seo/PLAN.md). Noindex pages (/credits, /internal, the
 * archived designer, share links) are left out.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const core: MetadataRoute.Sitemap = PUBLIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : path === "/design-your-show" || path === "/shows" ? 0.8 : 0.6,
  }));
  const formations: MetadataRoute.Sitemap = allFormationFacts().map((f) => ({
    url: `${SITE_URL}${formationPath(f.id)}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));
  return [...core, ...formations];
}
