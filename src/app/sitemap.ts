import type { MetadataRoute } from "next";
import { PUBLIC_ROUTES, SITE_URL } from "@/lib/seo";

/** The public pages, for search engines. Noindex pages (/credits, /internal, the archived designer, share links) are left out. */
export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : path === "/design-your-show" || path === "/shows" ? 0.8 : 0.6,
  }));
}
