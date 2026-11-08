import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The shared-show OG image reads its fonts from disk at request time;
  // make sure they ship with that function.
  outputFileTracingIncludes: {
    "/design-your-show/s/**": ["./assets/fonts/**"],
  },
};

export default nextConfig;
