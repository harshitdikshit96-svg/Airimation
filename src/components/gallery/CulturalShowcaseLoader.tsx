"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { onLoadedAndNear } from "@/components/swarm/defer";

function Placeholder() {
  return (
    <div className="flex h-[62vh] min-h-[400px] items-center justify-center rounded-xl border border-line bg-black">
      <p className="rounded bg-black/50 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-dim">
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
