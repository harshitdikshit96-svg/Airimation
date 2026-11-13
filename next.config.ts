import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The show page was /biscope until the show-brand name was dropped.
  async redirects() {
    return [
      { source: "/biscope", destination: "/shows", permanent: true },
      // The 3D showcase moved onto Design a Show (Nov 2026).
      { source: "/gallery", destination: "/design-your-show", permanent: true },
    ];
  },
  // Unhashed public assets (posters, the skyline model, the logo) change
  // only when re-rendered: let browsers and the CDN reuse them for a day and
  // serve a stale copy for a week while revalidating, instead of
  // revalidating on every visit (the default). Hashed /_next/static files
  // are already immutable.
  async headers() {
    const cache = [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }];
    return [
      { source: "/posters/:path*", headers: cache },
      { source: "/models/:path*", headers: cache },
      { source: "/brand/:path*", headers: cache },
      { source: "/team/:path*", headers: cache },
    ];
  },
  // The shared-show OG image reads its fonts from disk at request time;
  // make sure they ship with that function.
  outputFileTracingIncludes: {
    "/design-your-show/s/**": ["./assets/fonts/**"],
  },
};

export default nextConfig;
