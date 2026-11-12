import type { Metadata } from "next";
import { CULTURAL } from "@/lib/cultural";

export const metadata: Metadata = {
  title: "3D Model Credits | Airimation",
  description: "Sources and licences of the 3D models behind the formations on Design a Show.",
  robots: { index: false },
};

/**
 * Attribution for the 3D models the Design a Show formations are made from.
 * CC BY 4.0 requires crediting the creator; CC0 museum scans are credited
 * as a courtesy. Read straight from each formation's `credit`, so a new
 * model shows up here automatically.
 */
export default function CreditsPage() {
  const credited = CULTURAL.filter((f) => f.credit);
  return (
    <section className="border-b border-line-2 px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-[1052px]">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-dim">Credits</p>
        <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">3D model credits</h1>
        <p className="mt-6 max-w-2xl text-muted">
          The formations on Design a Show are built from real 3D models — museum scans released to the public
          domain, models shared under Creative Commons Attribution, and symbols we modelled ourselves. Our
          thanks to the museums and makers.
        </p>
        <ul className="mt-10 divide-y divide-line-2 border-y border-line-2">
          {credited.map((f) => (
            <li key={f.id} className="grid gap-1 py-4 sm:grid-cols-[180px_1fr] sm:gap-6">
              <span className="font-serif text-lg text-ink">{f.label}</span>
              <span className="text-sm text-muted">{f.credit}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-2xl text-xs text-dim">
          Licences: CC0 1.0 (public domain) and CC BY 4.0 (creativecommons.org/licenses/by/4.0). Models were
          resampled into drone positions; the Dhanush-baan arrow was repositioned onto the string, and only the
          building and minarets of the Taj Mahal model are used.
        </p>
      </div>
    </section>
  );
}
