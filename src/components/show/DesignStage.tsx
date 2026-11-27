"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import CulturalShowcaseLoader from "@/components/gallery/CulturalShowcaseLoader";
import type { FormationFacts } from "@/lib/cultural/facts";

/**
 * The live sky plus the heading under it (docs/seo/PLAN.md §2). The
 * heading is the hub's (`hub`, server-rendered) until a formation is
 * picked, then that formation's copy — on a formation page it starts as
 * the page's own, so its server HTML carries the formation's H1 and text.
 * A pick changes the address bar (CulturalShowcase) and this copy and the
 * tab title, never the page: the sky keeps running.
 */
export default function DesignStage({
  initial,
  facts,
  hub,
}: {
  /** The formation page's figure; undefined on the hub. */
  initial?: string;
  /** Every formation's page facts (small records, no model data). */
  facts: FormationFacts[];
  hub: ReactNode;
}) {
  const [picked, setPicked] = useState<string | null>(initial ?? null);
  const current = picked ? facts.find((f) => f.id === picked) : undefined;

  useEffect(() => {
    if (picked === (initial ?? null)) return;
    document.title = current ? `${current.heading} — see it in 3D | Airimation` : "Design Your Show | Airimation";
  }, [picked, initial, current]);

  return (
    <>
      <CulturalShowcaseLoader initialFormation={initial} onPicked={setPicked} />
      <div className="mx-auto max-w-[1100px] px-6">{current ? <FormationDetails f={current} /> : hub}</div>
    </>
  );
}

function FormationDetails({ f }: { f: FormationFacts }) {
  return (
    // Not <Reveal>: its opacity fade delays LCP until JS runs.
    <div className="hero-enter mt-16 border-t border-line pt-12" data-formation-details={f.id}>
      <p className="mb-5 font-mono text-xs tracking-[0.2em] text-dim">DESIGN A SHOW · {f.themeLabel.toUpperCase()}</p>
      <div className="grid gap-10 md:grid-cols-[1fr_340px]">
        <div>
          <h1 className="mb-6 font-serif text-[clamp(32px,4.4vw,56px)] font-light leading-[1.1] text-ink">{f.heading}</h1>
          <p className="max-w-[62ch] text-base font-light leading-relaxed text-muted">{f.about}</p>
          <dl className="mt-8 grid max-w-[62ch] gap-x-8 gap-y-4 text-sm sm:grid-cols-[max-content_1fr]">
            <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-dim">Fewest drones</dt>
            <dd className="font-light text-ink">{f.minDrones.toLocaleString("en-IN")} — a bigger fleet flies a bigger, finer figure</dd>
            <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-dim">Suits</dt>
            <dd className="font-light text-ink">{f.occasions.join(" · ")}</dd>
            <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-dim">Made from</dt>
            <dd className="font-light text-muted">
              A real 3D model —{" "}
              <Link href="/credits" className="underline underline-offset-4 hover:text-ink">
                model credits
              </Link>
            </dd>
          </dl>
        </div>
        <figure>
          <Image
            src={`/renders/f/${f.id}.webp`}
            alt={`Concept render: ${f.label} drawn in 5,000 drones over a dusk skyline`}
            width={800}
            height={617}
            sizes="(min-width: 768px) 340px, 100vw"
            className="h-auto w-full rounded-lg border border-line"
          />
          <figcaption className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-dim">
            Concept render · 5,000 drones · simulated, not footage
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
