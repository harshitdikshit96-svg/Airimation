"use client";

// Internal visual harness for the show configurator.
//
// Purpose: catch geometry regressions by eye. Formation bugs are visual, so
// looking at every formation at every drone count is worth more than unit
// tests on coordinates. Not linked from anywhere; the /internal layout marks
// this subtree noindex.

import { useMemo, useState } from "react";
import ShowStage from "@/components/show/ShowStage";
import { generateShow } from "@/lib/show/generate";
import { getLibrary } from "@/lib/show/formations";
import { DRONE_COUNTS, type DroneCount } from "@/lib/show/types";
import { COUNT_NOTES } from "@/lib/show/constants";

export default function ShowLabPage() {
  const library = getLibrary();
  const [count, setCount] = useState<DroneCount>(100);
  const [sequence, setSequence] = useState<string[]>(["ring", "lotus", "spiral", "heart"]);
  const [playing, setPlaying] = useState(true);
  const [stage, setStage] = useState("—");
  const [text, setText] = useState("Aarav & Diya");

  const plan = useMemo(
    () => generateShow({ v: 1, d: count, s: sequence, t: text }),
    [count, sequence, text]
  );

  const toggle = (id: string) =>
    setSequence((current) =>
      current.includes(id)
        ? current.filter((x) => x !== id)
        : current.length < 6
          ? [...current, id]
          : current
    );

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-int-ink">Show Lab</h1>
      <p className="mt-1 text-sm text-int-ink/70">
        Internal harness. Every formation, every drone count — look for shapes that stop
        reading at 50 drones.
      </p>

      <div className="mt-6 overflow-hidden rounded-lg bg-black">
        <ShowStage
          plan={plan}
          playing={playing}
          onStageChange={setStage}
          className="block h-[520px] w-full"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-int-ink">
        <button
          onClick={() => setPlaying((p) => !p)}
          className="rounded bg-int-pink px-3 py-1.5 font-medium text-white"
        >
          {playing ? "Pause" : "Play"}
        </button>
        <span className="font-mono">{stage}</span>
        <span className="text-int-ink/60">{plan.droneCount} drones</span>
        <span className="text-int-ink/60">
          {(plan.totalDurationMs / 1000).toFixed(0)}s · {plan.stages.length} stages
        </span>
      </div>

      <section className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-int-ink/70">
          Drone count
        </h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {DRONE_COUNTS.map((c) => (
            <button
              key={c}
              onClick={() => setCount(c)}
              className={`rounded border px-3 py-2 text-left text-sm ${
                c === count ? "border-int-pink bg-int-pink/10" : "border-int-line"
              }`}
            >
              <span className="block font-semibold text-int-ink">{c} drones</span>
              <span className="block text-xs text-int-ink/60">{COUNT_NOTES[c]}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-int-ink/70">
          Formations ({sequence.length}/6)
        </h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {library.map((f) => (
            <button
              key={f.id}
              onClick={() => toggle(f.id)}
              className={`rounded border px-3 py-1.5 text-sm ${
                sequence.includes(f.id)
                  ? "border-int-pink bg-int-pink/10 text-int-ink"
                  : "border-int-line text-int-ink/70"
              }`}
            >
              {f.label}
              {f.minRecommended > count && (
                <span className="ml-1 text-xs text-int-pink">needs {f.minRecommended}+</span>
              )}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <label className="text-sm font-semibold uppercase tracking-wide text-int-ink/70">
          Text formation content
        </label>
        <input
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 16))}
          className="mt-2 block w-full max-w-sm rounded border border-int-line px-3 py-2 text-sm"
        />
      </section>
    </main>
  );
}
