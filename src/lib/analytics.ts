// Vercel Web Analytics without the npm package (docs/seo/PLAN.md, P8): the
// root layout loads Vercel's first-party script (/_vercel/insights/script.js,
// served by Vercel once Web Analytics is enabled for the project; a 404
// elsewhere, harmlessly). Cookieless — no consent banner.
//
// The @vercel/analytics package would do the same, but npm can't resolve its
// optional SvelteKit peer next to vitest's vite (ERESOLVE), and forcing it
// risks `npm ci` on Vercel.

type Va = ((event: "event", props: { name: string; data?: Record<string, string | number> }) => void) & { q?: unknown[] };

/**
 * A custom event (shares, clips). Recorded only on plans with custom events;
 * queued until the script loads; a no-op on the server.
 */
export function track(name: string, data?: Record<string, string | number>) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { va?: Va; vaq?: unknown[] };
  if (!w.va) {
    w.va = ((...args: unknown[]) => {
      (w.vaq = w.vaq ?? []).push(args);
    }) as Va;
  }
  w.va("event", { name, data });
}

/** Inline stub so events before the script loads are queued (same as the package's). */
export const ANALYTICS_STUB = "window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};";
