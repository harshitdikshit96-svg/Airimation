"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { inConsentRegion, saveChoice, storedChoice } from "@/lib/consent";

export const OPEN_CONSENT = "airimation:cookie-settings";
const noopSubscribe = () => () => {};

/**
 * Cookie choice for visitors in the EEA / UK / Switzerland (docs/analytics-setup.md), and for
 * anyone who opens "Cookie settings" in the footer. Accept or Reject only — analytics is the
 * only cookie use; there are no ads. The choice is restored before GTM loads (consent.ts).
 */
export default function ConsentBanner() {
  // Shown by itself only in the consent region with no stored choice; the server renders nothing.
  const auto = useSyncExternalStore(noopSubscribe, () => !storedChoice() && inConsentRegion(), () => false);
  const [manual, setManual] = useState<boolean | null>(null);

  useEffect(() => {
    const show = () => setManual(true);
    window.addEventListener(OPEN_CONSENT, show);
    return () => window.removeEventListener(OPEN_CONSENT, show);
  }, []);

  if (!(manual ?? auto)) return null;
  const choose = (c: "granted" | "denied") => {
    saveChoice(c);
    setManual(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie choice"
      data-notrack
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-[560px] rounded-2xl border border-line-2 bg-navy/95 p-5 shadow-2xl backdrop-blur sm:inset-x-6"
    >
      <p className="text-sm leading-relaxed text-muted">
        We use cookies to understand how the site is used — which pages and formations people look at. No ads, no
        selling of data. <Link href="/privacy" className="text-ink underline underline-offset-4">Privacy policy</Link>
      </p>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => choose("granted")}
          className="min-h-11 rounded-full bg-amber px-5 text-sm font-medium text-navy transition-colors hover:bg-amber-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => choose("denied")}
          className="min-h-11 rounded-full border border-line-2 px-5 text-sm text-ink transition-colors hover:border-amber focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
        >
          Reject
        </button>
      </div>
    </div>
  );
}

/** Footer link that reopens the banner for anyone. */
export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT))}>
      Cookie settings
    </button>
  );
}
