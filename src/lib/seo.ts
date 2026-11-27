import type { Metadata } from "next";

export const SITE_URL = "https://airimation.in";

/** The public, indexable pages (sitemap.ts). */
export const PUBLIC_ROUTES = ["/", "/shows", "/design-your-show", "/about", "/vision", "/team", "/contact"] as const;

/**
 * Per-page metadata: the page's own title (the root layout adds
 * " | Airimation"), its canonical URL, and Open Graph tags that name THIS
 * page — without openGraph here, every page's link preview would carry the
 * home page's title. A page's own openGraph REPLACES the inherited one, so
 * the share image (src/app/opengraph-image.jpg) is named here too.
 */
const SHARE_IMAGE = {
  url: "/opengraph-image.jpg",
  width: 1200,
  height: 630,
  alt: "Concept render: the Taj Mahal drawn in rose-gold drone lights above a city skyline at dusk",
};

export function pageMeta({
  title,
  description,
  path,
  image,
}: {
  title: string;
  description: string;
  path: string;
  /** A page's own share image (formation pages); default: the site's. */
  image?: { url: string; alt: string };
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | Airimation`,
      description,
      url: path,
      siteName: "Airimation",
      locale: "en_IN",
      type: "website",
      images: [image ? { ...SHARE_IMAGE, ...image } : SHARE_IMAGE],
    },
    twitter: { card: "summary_large_image", title: `${title} | Airimation`, description },
  };
}
