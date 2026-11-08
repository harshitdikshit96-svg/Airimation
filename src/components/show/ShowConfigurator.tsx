"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronDown, ChevronUp, Copy, Move3d, Pause, Play, Plus, Sparkles, X } from "lucide-react";
import ShowStage from "./ShowStage";
import SoundToggle from "@/components/swarm/SoundToggle";
import { generateShow } from "@/lib/show/generate";
import { getLibrary } from "@/lib/show/formations";
import { decodeRecipe, defaultRecipe, encodeRecipe } from "@/lib/show/recipe";
import { COUNT_NOTES, MAX_SEQUENCE, MAX_TEXT_LENGTH, MIN_SEQUENCE } from "@/lib/show/constants";
import { DRONE_COUNTS, type DroneCount, type Recipe } from "@/lib/show/types";
import { PALETTES } from "@/lib/show/palettes";
import { sharePath } from "@/lib/show/summary";

const TEXT_FORMATION = "text";
const HINT_SEEN_KEY = "airimation-show-hint-seen";

/**
 * Has this visitor already discovered that the scene is interactive?
 *
 * Read once during render via a lazy initialiser — not useEffect + setState,
 * which this project's lint config rejects.
 */
function hintAlreadySeen(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(HINT_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * The show to open with: a shared link's code (from the /s/[code] route),
 * else a legacy `?s=` query, else the default. Read once via a lazy
 * initialiser — not useEffect + setState, which this repo's lint forbids.
 */
function initialRecipe(code?: string): Recipe {
  if (code) return decodeRecipe(code) ?? defaultRecipe();
  if (typeof window === "undefined") return defaultRecipe();
  const shared = new URLSearchParams(window.location.search).get("s");
  return decodeRecipe(shared) ?? defaultRecipe();
}

export default function ShowConfigurator({ initialCode }: { initialCode?: string }) {
  const library = getLibrary();
  const [draft, setDraft] = useState<Recipe>(() => initialRecipe(initialCode));
  const [rendered, setRendered] = useState<Recipe>(() => initialRecipe(initialCode));
  const [playing, setPlaying] = useState(true);
  const [stage, setStage] = useState("Ground hold");
  const [copied, setCopied] = useState(false);
  const [seekRequest, setSeekRequest] = useState<{ index: number; nonce: number } | null>(null);
  const [hintSeen, setHintSeen] = useState(hintAlreadySeen);

  const plan = useMemo(() => generateShow(rendered), [rendered]);
  const dirty = encodeRecipe(draft) !== encodeRecipe(rendered);

  const labelFor = (id: string) => library.find((f) => f.id === id)?.label ?? id;
  const available = library.filter((f) => !draft.s.includes(f.id));

  const addFormation = (id: string) =>
    setDraft((c) => (c.s.length >= MAX_SEQUENCE ? c : { ...c, s: [...c.s, id] }));

  const removeFormation = (index: number) =>
    setDraft((c) =>
      c.s.length <= MIN_SEQUENCE ? c : { ...c, s: c.s.filter((_, i) => i !== index) }
    );

  /** Move a formation up or down the running order. */
  const move = (index: number, delta: number) =>
    setDraft((c) => {
      const next = [...c.s];
      const target = index + delta;
      if (target < 0 || target >= next.length) return c;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...c, s: next };
    });

  /**
   * Typing a name pulls the text formation into the show automatically.
   * Previously the input only appeared once you had already found and
   * selected "Your Name" in the library — which nobody did, so the single
   * most persuasive formation was effectively hidden.
   */
  const setName = (value: string) =>
    setDraft((c) => {
      const t = value.slice(0, MAX_TEXT_LENGTH);
      const hasText = c.s.includes(TEXT_FORMATION);
      if (t.trim() && !hasText && c.s.length < MAX_SEQUENCE) {
        return { ...c, t, s: [...c.s, TEXT_FORMATION] };
      }
      return { ...c, t };
    });

  /**
   * Jump straight to a formation in the rendered show. The stage list is
   * ground + formations + landing, and a formation that produced no points
   * (an empty name, say) is skipped during generation — so the index is
   * looked up by id rather than assumed to be position + 1.
   */
  const jumpTo = (formationId: string) => {
    const index = plan.stages.findIndex((s) => s.id === formationId);
    if (index < 0) return;
    // A monotonic counter rather than Date.now(): the React Compiler lint
    // rejects impure calls here, and a counter is what the nonce actually
    // needs to be — it only has to differ from the previous value.
    setSeekRequest((prev) => ({ index, nonce: (prev?.nonce ?? 0) + 1 }));
    setPlaying(false);
  };

  const setCount = (count: DroneCount) => {
    setDraft((c) => ({ ...c, d: count }));
    setRendered((c) => ({ ...c, d: count }));
  };

  /** Palettes apply instantly, like fleet size: comparing is the point. */
  const setPalette = (id: string) => {
    const apply = (c: Recipe): Recipe => {
      const next = { ...c };
      if (id === "auto") delete next.p;
      else next.p = id;
      return next;
    };
    setDraft(apply);
    setRendered(apply);
  };

  const encodedShow = encodeRecipe(rendered);

  /**
   * Nothing about a canvas says "you can move this". The overlay below is
   * the only thing telling a first-time visitor the show is theirs to walk
   * around, so it stays until they actually do it — then never returns.
   */
  const dismissHint = () => {
    if (hintSeen) return;
    setHintSeen(true);
    try {
      window.localStorage.setItem(HINT_SEEN_KEY, "1");
    } catch {
      // Blocked storage — the hint simply shows again next visit.
    }
  };

  const share = async () => {
    const path = sharePath(encodedShow);
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      window.history.replaceState(null, "", path);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt("Copy this link:", url);
    }
  };

  return (
    <div className="mt-10">
      <div
        className="relative overflow-hidden rounded-xl border border-line bg-black"
        onPointerDown={dismissHint}
        onWheel={dismissHint}
        onTouchStart={dismissHint}
      >
        <ShowStage
          plan={plan}
          playing={playing}
          onStageChange={setStage}
          seekRequest={seekRequest}
          className="block h-[58vh] min-h-[380px] w-full sm:h-[62vh] sm:min-h-[420px]"
        />

        <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-1">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-amber-soft">
            {stage}
          </span>
          <span className="font-mono text-xs text-muted">{draft.d} drones</span>
        </div>

        <div className="absolute right-4 top-4 flex items-center gap-2">
          <span className="pointer-events-none rounded bg-black/50 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-dim">
            Simulation · concept render
          </span>
          <SoundToggle />
        </div>

        {/* First-visit interaction hint, centred over the sky. */}
        {!hintSeen && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="show-hint flex flex-col items-center gap-3 rounded-xl border border-line-2 bg-black/70 px-7 py-5 backdrop-blur-sm">
              <Move3d size={26} className="text-amber" />
              <p className="text-sm text-ink">This sky is yours to explore</p>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                Drag to orbit · Scroll to zoom
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-dim sm:hidden">
                Swipe and pinch on mobile
              </p>
            </div>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 bg-gradient-to-t from-black/85 to-transparent px-4 pb-4 pt-10 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? "Pause" : "Play"}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line-2 text-ink transition hover:border-amber"
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <Link
              href={`/contact?show=${encodedShow}`}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-amber px-4 text-sm font-medium text-navy transition hover:opacity-90"
            >
              Request a quote for this show
              <ArrowRight size={14} />
            </Link>
            <span className="hidden items-center gap-1.5 text-xs text-muted lg:inline-flex">
              <Move3d size={13} />
              Drag to orbit · scroll to zoom
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="shrink-0 text-xs text-muted">Compare fleet size</span>
            {DRONE_COUNTS.map((count) => (
              <button
                key={count}
                onClick={() => setCount(count)}
                title={COUNT_NOTES[count]}
                className={`min-h-10 min-w-11 rounded px-3 font-mono text-sm transition ${
                  count === draft.d
                    ? "bg-amber text-navy"
                    : "border border-line-2 text-muted hover:text-ink"
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs text-dim">
        {COUNT_NOTES[draft.d]}. Switch between fleet sizes above and watch the same
        formation fill in — that difference is what you are really choosing between.
      </p>

      <div className="mt-6">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">LED palette</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {PALETTES.map((palette) => {
            const selected = (rendered.p ?? "auto") === palette.id;
            return (
              <button
                key={palette.id}
                onClick={() => setPalette(palette.id)}
                aria-pressed={selected}
                className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm transition ${
                  selected ? "border-amber text-ink" : "border-line-2 text-muted hover:text-ink"
                }`}
              >
                <span className="flex -space-x-1" aria-hidden="true">
                  {(palette.colors.length ? palette.colors : ["#ffb347", "#ff8fb8", "#5cc6d3"]).map((c) => (
                    <span key={c} className="h-3 w-3 rounded-full ring-1 ring-black" style={{ background: c }} />
                  ))}
                </span>
                {palette.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_260px]">
        <div>
          {/* Name first: it is the most persuasive thing on the page. */}
          <label className="block">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
              Write a name in the sky
            </span>
            <input
              value={draft.t ?? ""}
              onChange={(e) => setName(e.target.value)}
              placeholder="Aarav & Diya"
              maxLength={MAX_TEXT_LENGTH}
              className="mt-2 block w-full max-w-sm rounded border border-line-2 bg-panel px-3 py-2 text-ink placeholder:text-dim focus:border-amber focus:outline-none"
            />
            <span className="mt-1.5 block text-xs text-dim">
              A name, initials or a date — up to {MAX_TEXT_LENGTH} characters. It is
              added to the show automatically.
            </span>
          </label>

          {/* Running order — the actual sequence, reorderable. */}
          <h2 className="mt-9 font-mono text-xs uppercase tracking-[0.2em] text-muted">
            Running order ({draft.s.length} of {MAX_SEQUENCE})
          </h2>
          <ol className="mt-3 flex flex-col gap-2">
            {draft.s.map((id, index) => {
              const thin = (library.find((f) => f.id === id)?.minRecommended ?? 0) > draft.d;
              return (
                <li
                  key={`${id}-${index}`}
                  className="flex items-center gap-2 rounded border border-line-2 bg-panel/50 px-3 py-2"
                >
                  <span className="w-6 font-mono text-xs text-dim">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <button
                    onClick={() => jumpTo(id)}
                    className="flex min-h-9 flex-1 items-center text-left text-sm text-ink transition hover:text-amber-soft"
                    title="Jump to this formation"
                  >
                    {labelFor(id)}
                    {thin && (
                      <span className="ml-2 font-mono text-[10px] text-amber-soft">
                        better at {library.find((f) => f.id === id)?.minRecommended}+
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label="Move earlier"
                    className="inline-flex h-9 w-9 items-center justify-center text-dim transition enabled:hover:text-ink disabled:opacity-30"
                  >
                    <ChevronUp size={15} />
                  </button>
                  <button
                    onClick={() => move(index, 1)}
                    disabled={index === draft.s.length - 1}
                    aria-label="Move later"
                    className="inline-flex h-9 w-9 items-center justify-center text-dim transition enabled:hover:text-ink disabled:opacity-30"
                  >
                    <ChevronDown size={15} />
                  </button>
                  <button
                    onClick={() => removeFormation(index)}
                    disabled={draft.s.length <= MIN_SEQUENCE}
                    aria-label="Remove"
                    className="inline-flex h-9 w-9 items-center justify-center text-dim transition enabled:hover:text-ink disabled:opacity-30"
                  >
                    <X size={15} />
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="mt-2 text-xs text-dim">
            Click a formation to jump straight to it. Reorder with the arrows.
          </p>

          {available.length > 0 && draft.s.length < MAX_SEQUENCE && (
            <>
              <h2 className="mt-8 font-mono text-xs uppercase tracking-[0.2em] text-muted">
                Add a formation
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {available.map((formation) => (
                  <button
                    key={formation.id}
                    onClick={() => addFormation(formation.id)}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line-2 px-4 text-sm text-muted transition hover:border-line hover:text-ink"
                  >
                    <Plus size={13} />
                    {formation.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              setRendered(draft);
              setPlaying(true);
            }}
            disabled={!dirty}
            className={`flex items-center justify-center gap-2 rounded px-5 py-3 font-medium transition ${
              dirty
                ? "bg-amber text-navy hover:opacity-90"
                : "cursor-default border border-line-2 text-dim"
            }`}
          >
            <Sparkles size={16} />
            {dirty ? "Render show" : "Show is current"}
          </button>

          <button
            onClick={share}
            className="flex items-center justify-center gap-2 rounded border border-line-2 px-5 py-3 text-sm text-muted transition hover:border-line hover:text-ink"
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? "Link copied" : "Copy share link"}
          </button>

          <p className="text-xs leading-relaxed text-dim">
            This is a simulation to help you picture a show — not a flight plan. The
            real choreography is designed and safety-validated after booking.
          </p>
        </div>
      </div>
    </div>
  );
}
