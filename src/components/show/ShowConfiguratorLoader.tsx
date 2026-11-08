"use client";

import dynamic from "next/dynamic";

/**
 * Client-side boundary for the 3D configurator.
 *
 * `next/dynamic` with `ssr: false` is only permitted inside a Client
 * Component in the App Router, so this thin wrapper exists purely to hold
 * that call. It keeps `three` out of the shared bundle — the rest of the
 * site never downloads it — and WebGL cannot server-render in any case.
 */
const ShowConfigurator = dynamic(() => import("./ShowConfigurator"), {
  ssr: false,
  // Same footprint as the live stage (no layout shift), showing a frame
  // pre-rendered from it by scripts/render-poster.mjs.
  loading: () => (
    <div
      className="relative mt-10 flex h-[58vh] min-h-[380px] items-center justify-center overflow-hidden rounded-xl border border-line bg-black bg-cover bg-center sm:h-[62vh] sm:min-h-[420px]"
      style={{ backgroundImage: "url(/posters/show.jpg)" }}
    >
      <p className="rounded bg-black/50 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-dim">
        Preparing the sky…
      </p>
    </div>
  ),
});

export default function ShowConfiguratorLoader({ initialCode }: { initialCode?: string }) {
  return <ShowConfigurator initialCode={initialCode} />;
}
