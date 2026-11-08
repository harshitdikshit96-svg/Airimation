"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { onLoadedAndNear } from "@/components/swarm/defer";

/**
 * Same footprint as the live stage (no layout shift), showing a frame
 * pre-rendered from it by scripts/render-poster.mjs.
 *
 * A real <img> with high fetch priority, not a CSS background: this is
 * usually the page's Largest Contentful Paint, and a background image is
 * only discovered after layout (measured: ~1s of LCP load delay).
 */
function StagePlaceholder() {
  return (
    <div className="relative mt-10 flex h-[58vh] min-h-[380px] items-center justify-center overflow-hidden rounded-xl border border-line bg-black sm:h-[62vh] sm:min-h-[420px]">
      {/* eslint-disable-next-line @next/next/no-img-element -- 25 KB pre-optimised poster; next/image would add a round trip through the optimiser */}
      <img
        src="/posters/show.jpg"
        alt=""
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <p className="relative rounded bg-black/50 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-dim">
        Preparing the sky…
      </p>
    </div>
  );
}

/**
 * Client-side boundary for the 3D configurator.
 *
 * `next/dynamic` with `ssr: false` is only permitted inside a Client
 * Component in the App Router, so this wrapper holds that call. It keeps
 * three/R3F out of the shared bundle, and requests the chunk only after the
 * page has loaded and the stage is near the viewport, so it never competes
 * with the page's own first paint.
 */
const ShowConfigurator = dynamic(() => import("./ShowConfigurator"), {
  ssr: false,
  loading: StagePlaceholder,
});

export default function ShowConfiguratorLoader({ initialCode }: { initialCode?: string }) {
  const anchor = useRef<HTMLDivElement | null>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    if (!anchor.current) return;
    return onLoadedAndNear(anchor.current, () => setStart(true));
  }, []);

  if (start) return <ShowConfigurator initialCode={initialCode} />;
  return (
    <div ref={anchor}>
      <StagePlaceholder />
    </div>
  );
}
