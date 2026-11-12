import { Mail } from "lucide-react";
import { contactInfo } from "@/lib/content";
import PhoneGateScene from "./PhoneGateScene";

/**
 * What a phone (< 768 px wide) sees instead of the site: the home page's
 * dusk scene and a short note to open the site on a bigger screen.
 *
 * Pure CSS switch (globals.css, `.phone-gate` / `.site-shell`): the header,
 * pages and footer stay in the server HTML on every device — so search
 * engines' mobile-first indexing still reads the full site — and are only
 * hidden on phones. On tablets and up this layer is `display: none`, and
 * its poster (a CSS background behind the same media query) and live scene
 * never load there.
 */
export default function PhoneGate() {
  return (
    <section aria-labelledby="phone-gate-title" className="phone-gate">
      <PhoneGateScene />
      {/* Keeps the white copy readable over the brightest part of the
          scene. A plain gradient: no backdrop-filter over a live canvas. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-[#03040b] via-[#03040b]/80 to-transparent"
      />
      <span className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] font-mono text-[10px] uppercase tracking-[0.16em] text-dim">
        Concept render
      </span>

      <div className="relative mt-auto w-full max-w-md px-6 pb-[max(2.25rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element -- static SVG; lazy so desktops, where this layer is hidden, never fetch it */}
          <img
            src="/brand/airimation-mark-white.svg"
            alt=""
            width={26}
            height={30}
            loading="lazy"
            className="h-[30px] w-auto"
          />
          <span className="font-serif text-lg font-semibold tracking-tight text-ink">Airimation</span>
        </div>

        <h2 id="phone-gate-title" className="mt-6 font-serif text-[1.65rem] font-semibold leading-tight text-ink">
          Airimation is best seen on a bigger screen.
        </h2>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">
          Open <span className="text-ink">airimation.in</span> on a laptop or tablet to design your show in 3D.
        </p>

        <a
          href={`mailto:${contactInfo.email}`}
          className="mt-6 inline-flex min-h-11 items-center gap-2.5 rounded-full border border-amber/60 px-5 text-sm font-medium text-amber-soft transition-colors hover:border-amber hover:text-ink"
        >
          <Mail size={16} className="shrink-0" aria-hidden="true" />
          {contactInfo.email}
        </a>
      </div>
    </section>
  );
}
