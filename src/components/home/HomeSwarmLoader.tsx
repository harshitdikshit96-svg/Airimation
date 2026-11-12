"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import type { StoryState } from "./HomeSwarm";
import { hasWebGL } from "@/components/swarm/quality";
import { onEngageOrIdle } from "@/components/swarm/defer";
import SoundToggle from "@/components/swarm/SoundToggle";

// three, R3F, postprocessing and GSAP all live behind this import. It is
// requested as soon as the page has loaded and the main thread is idle —
// never during load, so it doesn't compete with the hero — and the live
// scene runs from then on. Scrolling only drives the drones' story.
const HomeSwarm = dynamic(() => import("./HomeSwarm"), { ssr: false });

export const HOME_POSTER = "/posters/home.jpg";
const HOME_POSTER_PORTRAIT = "/posters/home-portrait.jpg";

const noopSubscribe = () => () => {};

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const readReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * `?swarmBeat=2.5` freezes the story at that beat (0 ground ... 4 wordmark)
 * instead of following the scroll. For tuning formations and for
 * scripts/render-poster.mjs.
 */
function pinnedBeat(): number | null {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get("swarmBeat");
  const value = raw === null ? NaN : Number(raw);
  return Number.isFinite(value) ? Math.min(Math.max(value, 0), 3.9999) : null;
}

/**
 * `?swarmDissolve=1` (with a pinned beat) renders the sky with the fleet
 * gone — the backdrop the rest of the site uses (scripts/render-poster.mjs).
 */
function pinnedDissolve(): number {
  const raw = new URLSearchParams(window.location.search).get("swarmDissolve");
  const value = raw === null ? 0 : Number(raw);
  return Number.isFinite(value) ? Math.min(Math.max(value, 0), 1) : 0;
}

/**
 * Fixed full-viewport backdrop for the home page's scroll story.
 *
 * Paints a pre-rendered poster frame immediately (server HTML), then swaps
 * in the live WebGL swarm once it has rendered its first frame. If WebGL is
 * missing or the context is lost, the poster simply stays — the page and
 * all its copy work the same either way.
 */
export default function HomeSwarmLoader() {
  // A stable mutable object (not a ref, so it can be handed to children
  // during render); GSAP writes it, the render loop reads it.
  const [story] = useState<StoryState>(() => {
    const pinned = pinnedBeat();
    return pinned === null ? { beat: 0, lit: 0, dissolve: 0 } : { beat: pinned, lit: 1, dissolve: pinnedDissolve() };
  });
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(true);
  const caption = useRef<HTMLSpanElement | null>(null);
  const scrim = useRef<HTMLDivElement | null>(null);

  const reduced = useSyncExternalStore(subscribeReducedMotion, readReducedMotion, () => false);
  const webgl = useSyncExternalStore(noopSubscribe, hasWebGL, () => true);

  useEffect(() => {
    if (!webgl) return;
    // Start right after load (at the first idle moment), not on the first
    // scroll: waiting left a still poster on screen that "came alive" with a
    // shimmer when the visitor scrolled.
    return onEngageOrIdle(() => setMounted(true), 0);
  }, [webgl]);

  // Scroll wiring loads with the scene, never on reduced motion.
  useEffect(() => {
    if (!mounted || reduced || pinnedBeat() !== null) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    import("./homeStory").then(({ setupStory }) => {
      if (!cancelled) cleanup = setupStory(story, scrim.current, setActive);
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [mounted, reduced, story]);

  const live = mounted && !failed;

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 bg-[#03040b]">
        {/* Pre-rendered by scripts/render-poster.mjs from the live scene. */}
        <picture>
          <source media="(max-aspect-ratio: 4/5)" srcSet={HOME_POSTER_PORTRAIT} />
          <img
            src={HOME_POSTER}
            alt=""
            fetchPriority="low"
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              live && ready ? "opacity-0" : "opacity-100"
            }`}
          />
        </picture>
        {live && (
          <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}>
            <HomeSwarm
              story={story}
              caption={caption}
              active={active}
              reduced={reduced}
              onReady={() => setReady(true)}
              onFail={() => setFailed(true)}
            />
          </div>
        )}
        {/* Keeps the left-aligned copy legible over the brightest sky. */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#03040b]/70 via-[#03040b]/25 to-transparent" />
        {/* Darkens the frozen sky behind the long sections below the story. */}
        <div ref={scrim} className="absolute inset-0 bg-[#03040b]/80 opacity-0" />
      </div>

      <div className="pointer-events-none fixed bottom-7 right-6 z-[2] flex flex-col items-end gap-1.5 sm:right-8">
        {live && ready && !reduced && <SoundToggle className="mb-2" />}
        <div className="flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/70" />
          <span ref={caption} className="font-mono text-xs tracking-[0.18em] text-dim">
            {reduced ? "LOTUS BLOOM" : "GROUND HOLD"}
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-dim/80">Concept render</span>
      </div>
    </>
  );
}
