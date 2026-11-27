"use client";

import { useEffect } from "react";

/**
 * Visiting /internal (the team academy) marks this browser as internal for a year, so the
 * team's own visits to the public site can be filtered out of GA4 (traffic_type=internal,
 * read by GTM's Event Settings; GA4 → Data filters → Internal traffic).
 */
export default function InternalTrafficMark() {
  useEffect(() => {
    try {
      document.cookie = "traffic_type=internal; max-age=31536000; path=/; SameSite=Lax";
    } catch {
      /* best-effort */
    }
  }, []);
  return null;
}
