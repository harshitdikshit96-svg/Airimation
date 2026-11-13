"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { onLoadedAndNear } from "@/components/swarm/defer";

function Placeholder() {
  return (
    <div className="relative flex h-[calc(100svh-64px)] min-h-[480px] items-center justify-center overflow-hidden bg-black">
      {/* The same dusk sky as a still, so the first screen isn't a black box. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative still, sized by CSS */}
      <img src="/posters/backdrop.jpg" alt="" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      <p className="relative rounded bg-black/50 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-dim">
        Preparing the sky…
      </p>
    </div>
  );
}

// three/R3F stay out of the gallery's own bundle; the chunk is requested
// only after load, once the showcase is near the viewport.
const CulturalShowcase = dynamic(() => import("./CulturalShowcase"), { ssr: false, loading: Placeholder });

export default function CulturalShowcaseLoader() {
  const anchor = useRef<HTMLDivElement | null>(null);
  const [start, setStart] = useState(false);
  useEffect(() => {
    if (!anchor.current) return;
    return onLoadedAndNear(anchor.current, () => setStart(true));
  }, []);
  if (start) return <CulturalShowcase />;
  return (
    <div ref={anchor}>
      <Placeholder />
    </div>
  );
}
