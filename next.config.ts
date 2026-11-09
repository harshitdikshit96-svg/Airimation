import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The show page was /biscope until the show-brand name was dropped.
  async redirects() {
    return [{ source: "/biscope", destination: "/shows", permanent: true }];
  },
  // The shared-show OG image reads its fonts from disk at request time;
  // make sure they ship with that function.
  outputFileTracingIncludes: {
    "/design-your-show/s/**": ["./assets/fonts/**"],
  },
};

export default nextConfig;
