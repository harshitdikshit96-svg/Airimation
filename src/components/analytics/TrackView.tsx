"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/** Fires one passive event on mount; drop into server pages (e.g. not-found) to keep them server components. */
export default function TrackView({ event, params }: { event: string; params?: Record<string, string> }) {
  const key = JSON.stringify(params ?? {});
  useEffect(() => {
    track(event, params, { load: false });
    // re-fire only when the viewed thing changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, key]);
  return null;
}
