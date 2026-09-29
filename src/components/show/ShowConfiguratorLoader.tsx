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
  loading: () => (
    <div className="mt-10 flex h-[62vh] min-h-[420px] items-center justify-center rounded-xl border border-line bg-black">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-dim">
        Preparing the sky…
      </p>
    </div>
  ),
});

export default function ShowConfiguratorLoader() {
  return <ShowConfigurator />;
}
