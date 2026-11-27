"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initAutoTrack } from "@/lib/autotrack";
import { captureAttribution } from "@/lib/attribution";
import { track } from "@/lib/analytics";

/** Half of page loads report Core Web Vitals; one load's LCP/INP/CLS stay together. */
const VITALS_SAMPLE = 0.5;

/**
 * Mounted once in the root layout; renders nothing, so the layout stays a server component.
 * Starts the delegated click/form listener, records where the visit came from (for the lead),
 * and reports real-visitor Web Vitals (passive: never forces GTM to load).
 */
export default function AnalyticsInit() {
  const pathname = usePathname();

  useEffect(() => {
    initAutoTrack();
    if (Math.random() > VITALS_SAMPLE) return;
    let cancelled = false;
    import("web-vitals")
      .then(({ onLCP, onINP, onCLS }) => {
        if (cancelled) return;
        const send = (m: { name: string; value: number; rating: string }) =>
          track(
            "web_vitals",
            { metric_name: m.name, metric_value: Math.round(m.name === "CLS" ? m.value * 1000 : m.value), metric_rating: m.rating },
            { load: false },
          );
        onLCP(send);
        onINP(send);
        onCLS(send);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    captureAttribution();
  }, [pathname]);

  return null;
}
