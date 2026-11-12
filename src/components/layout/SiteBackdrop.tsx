"use client";

import { usePathname } from "next/navigation";

/**
 * The steady backdrop of every page except home: the same dusk sky over the
 * river and skyline that the home page settles on below its story (where
 * the team section sits), darkened the same way so copy stays legible.
 *
 * A still image (rendered from the live scene by scripts/render-poster.mjs),
 * not WebGL: it costs one ~60 KB JPEG and no main-thread time. Home paints
 * its own live scene; /internal keeps its light theme.
 */
export default function SiteBackdrop() {
  const path = usePathname() ?? "/";
  if (path === "/" || path.startsWith("/internal")) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 bg-[#03040b]">
      <picture>
        <source media="(max-aspect-ratio: 4/5)" srcSet="/posters/backdrop-portrait.jpg" />
        <img
          src="/posters/backdrop.jpg"
          alt=""
          fetchPriority="low"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </picture>
      {/* Lighter than before (was 80% + a 70% side gradient): the sky and
          skyline now show through. The side gradient sits behind the text
          column, so white copy keeps its contrast. */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#03040b]/60 via-[#03040b]/25 to-transparent" />
      <div className="absolute inset-0 bg-[#03040b]/55" />
    </div>
  );
}
