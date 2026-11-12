"use client";

/* eslint-disable react-hooks/immutability --
 * three.js objects and the per-frame show clock are mutable by design; they
 * are only mutated in effects and the render loop, never during render. */

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import SwarmCanvas from "@/components/swarm/SwarmCanvas";
import DroneSwarm, { type SwarmHandle } from "@/components/swarm/DroneSwarm";
import { Crowd, DuskFog, Ground, SkyDome, Stars } from "@/components/swarm/Environment";
import Skyline from "@/components/swarm/Skyline";
import { detectTier, type QualityProfile } from "@/components/swarm/quality";
import { assign } from "@/lib/show/assign";
import type { Vec3 } from "@/lib/show/types";
import { SHOW_ALT, culturalById, formationsFor, type AnimatedFormation } from "@/lib/cultural";
import { PALETTES, getPalette } from "@/lib/show/palettes";
import { fleetScale, PREVIEW_RATE, showAltitude, viewDistance, applyHues, morphSeconds, MORPH_MAX } from "./showcaseMath";

/**
 * Fleet sizes on offer, every device. Each shows only the formations that
 * actually read at that size (`minDrones`), at least four even at 100.
 */
const FLEETS = [100, 200, 500, 800, 1500, 2000];
/** Starting fleet: a showy one where the device can afford it. */
function defaultFleet(): number {
  const tier = detectTier();
  return tier === "high" ? 800 : 500;
}
const CAPACITY = 2000;

const STAGGER = 0.1;
const LOOPS_PER_FIGURE = 2;

type Rig = unknown;

function toVecs(a: Float32Array, n: number): Vec3[] {
  const out: Vec3[] = new Array(n);
  for (let i = 0; i < n; i++) out[i] = { x: a[i * 3], y: a[i * 3 + 1], z: a[i * 3 + 2] };
  return out;
}

/** Rigs are cached per (figure, count): building Shiva at 2,000 is ~300 ms. */
const rigCache = new Map<string, Rig>();
function rigFor(f: AnimatedFormation<Rig>, n: number): Rig {
  const key = `${f.id}:${n}`;
  let rig = rigCache.get(key);
  if (!rig) rigCache.set(key, (rig = f.build(n)));
  return rig;
}

function Scene({
  quality,
  id,
  count,
  playing,
  hues,
}: {
  quality: QualityProfile;
  id: string;
  count: number;
  playing: boolean;
  /** LED palette id; "auto" keeps each formation's own colours. */
  hues: string;
}) {
  const swarm = useRef<SwarmHandle | null>(null);
  const controls = useRef<OrbitControlsImpl | null>(null);
  const buffers = useMemo(
    () => ({
      pos: new Float32Array(CAPACITY * 3),
      col: new Float32Array(CAPACITY * 3),
      /** What is on screen now, in slot order (for the next morph's "from"). */
      shown: new Float32Array(CAPACITY * 3),
      shownCol: new Float32Array(CAPACITY * 3),
      ordered: new Float32Array(CAPACITY * 3),
      orderedCol: new Float32Array(CAPACITY * 3),
    }),
    []
  );
  const clock = useRef({ key: "", id: "", t: 0, morph: 0, morphTotal: 6, order: null as Uint16Array | null, idle: 0, dolly: true });

  useEffect(() => {
    const ctl = controls.current;
    if (!ctl) return;
    const wake = () => {
      clock.current.idle = 0;
      clock.current.dolly = false;
    };
    ctl.addEventListener("start", wake);
    return () => ctl.removeEventListener("start", wake);
  }, []);

  /** Pose the figure at show time t, scaled to the fleet, in the palette. */
  const poseInto = (f: AnimatedFormation<Rig>, rig: Rig, t: number) => {
    f.pose(rig, t, buffers.pos, buffers.col);
    const scale = fleetScale(count);
    const alt = showAltitude(count);
    for (let i = 0; i < count; i++) {
      buffers.pos[i * 3] *= scale;
      buffers.pos[i * 3 + 1] = alt + (buffers.pos[i * 3 + 1] - SHOW_ALT) * scale;
      buffers.pos[i * 3 + 2] *= scale;
    }
    applyHues(buffers.pos, buffers.col, count, getPalette(hues).colors);
  };

  useFrame((state, delta) => {
    const api = swarm.current;
    if (!api) return;
    const c = clock.current;
    const f = culturalById(id) as AnimatedFormation<Rig>;
    const key = `${f.id}:${count}`;
    const dt = Math.min(delta, 0.1);
    const u = api.uniforms;
    const ctl = controls.current;

    if (key !== c.key) {
      const rig = rigFor(f, count);
      if (c.id === f.id) {
        // Same figure, new fleet size: the fleet simply IS that size — the
        // figure is redrawn in place, mid-animation, with no fly-in.
        c.order = Uint16Array.from({ length: count }, (_, i) => i);
        c.morph = c.morphTotal;
        c.dolly = true;
      } else {
        // New figure: morph from what is on screen to its first pose, drones
        // matched to their nearest target so paths don't cross.
        poseInto(f, rig, 0);
        const first = c.key === "";
        const order = first
          ? Uint16Array.from({ length: count }, (_, i) => i)
          : assign(toVecs(buffers.shown, count), toVecs(buffers.pos, count));
        for (let i = 0; i < count; i++) {
          const j = order[i] * 3;
          buffers.ordered.set(buffers.pos.subarray(j, j + 3), i * 3);
          buffers.orderedCol.set(buffers.col.subarray(j, j + 3), i * 3);
        }
        // Only on first load do drones lift off from the ground.
        if (first) {
          for (let i = 0; i < count; i++) {
            buffers.shown[i * 3] = buffers.ordered[i * 3];
            buffers.shown[i * 3 + 1] = 0.4;
            buffers.shown[i * 3 + 2] = buffers.ordered[i * 3 + 2];
            buffers.shownCol.set(buffers.orderedCol.subarray(i * 3, i * 3 + 3), i * 3);
          }
        }
        api.setTransition({
          from: buffers.shown,
          to: buffers.ordered,
          colorFrom: buffers.shownCol,
          colorTo: buffers.orderedCol,
          count,
        });
        let far = 0;
        for (let i = 0; i < count; i++) {
          const dd = Math.hypot(
            buffers.ordered[i * 3] - buffers.shown[i * 3],
            buffers.ordered[i * 3 + 1] - buffers.shown[i * 3 + 1],
            buffers.ordered[i * 3 + 2] - buffers.shown[i * 3 + 2]
          );
          if (dd > far) far = dd;
        }
        c.morphTotal = morphSeconds(far, STAGGER);
        c.order = order;
        c.morph = 0;
        c.t = 0;
      }
      c.key = key;
      c.id = f.id;
    }

    if (c.morph < c.morphTotal) {
      c.morph += dt;
      u.uProgress.value = Math.min(1, c.morph / c.morphTotal);
      u.uStagger.value = STAGGER;
      u.uArc.value = 3;
    } else {
      // Live: pose the figure every frame. The clock runs at the preview
      // rate, slowed for bigger (scaled-up) figures so drone speeds match.
      if (playing) c.t = (c.t + (dt * PREVIEW_RATE) / fleetScale(count)) % f.loop;
      poseInto(f, rigFor(f, count), c.t);
      api.setPose(buffers.pos, buffers.col, count, c.order ?? undefined);
      u.uProgress.value = 1;
      u.uArc.value = 0;
      // Keep a copy of what is shown, slot order, for the next morph.
      const order = c.order!;
      for (let i = 0; i < count; i++) {
        const j = order[i] * 3;
        buffers.shown[i * 3] = buffers.pos[j];
        buffers.shown[i * 3 + 1] = buffers.pos[j + 1];
        buffers.shown[i * 3 + 2] = buffers.pos[j + 2];
        buffers.shownCol[i * 3] = buffers.col[j];
        buffers.shownCol[i * 3 + 1] = buffers.col[j + 1];
        buffers.shownCol[i * 3 + 2] = buffers.col[j + 2];
      }
    }
    u.uTime.value = state.clock.elapsedTime;
    u.uHover.value = 0.12;
    u.uTwinkle.value = 0.04;
    u.uLit.value = 1;
    u.uDissolve.value = 0;
    u.uMotion.value = 0;
    u.uCentre.value.set(0, showAltitude(count), 0);

    // A bigger fleet flies a bigger figure, higher up. After a fleet change
    // the camera eases back (or in) once to frame it, then lets go — it
    // never fights a visitor who is orbiting.
    if (ctl && c.dolly) {
      const goalY = showAltitude(count) + 4;
      const goalD = viewDistance(count);
      ctl.target.y += (goalY - ctl.target.y) * 0.06;
      const off = state.camera.position.clone().sub(ctl.target);
      const d = off.length();
      off.setLength(d + (goalD - d) * 0.06);
      state.camera.position.copy(ctl.target).add(off);
      ctl.update();
      if (Math.abs(goalD - d) < 0.5 && Math.abs(goalY - ctl.target.y) < 0.2) c.dolly = false;
    }

    // Full 360: the visitor can orbit all the way round. When nobody has
    // touched it for a few seconds it turns slowly on its own, and stops
    // the instant they do (OrbitControls "start" resets `idle`).
    c.idle += dt;
    if (ctl) ctl.autoRotate = c.idle > 5;
  });

  return (
    <>
      <SkyDome />
      <Stars count={quality.stars} />
      <DuskFog />
      <Ground />
      <Crowd count={260} />
      <Suspense fallback={null}>
        <Skyline part="ring" lightGain={1.4} />
      </Suspense>
      <DroneSwarm ref={swarm} capacity={CAPACITY} quality={quality} size={1.9} />
      <OrbitControls
        ref={controls}
        target={[0, showAltitude(count) + 4, 0]}
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        minDistance={70}
        maxDistance={440}
        autoRotateSpeed={0.35}
        // The eye is BELOW the figure (an audience looks up), so the polar
        // angle sits past 90 degrees; 104 keeps the camera above ground at
        // the furthest zoom.
        minPolarAngle={THREE.MathUtils.degToRad(68)}
        maxPolarAngle={THREE.MathUtils.degToRad(104)}
        makeDefault
      />
    </>
  );
}

export default function CulturalShowcase() {
  const [count, setCount] = useState(defaultFleet);
  const [id, setId] = useState("tiranga");
  const [hues, setHues] = useState("auto");
  const [auto, setAuto] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [failed, setFailed] = useState(false);
  const list = useMemo(() => formationsFor(count), [count]);
  // A formation that doesn't read at this fleet size falls back to the first that does.
  const current = list.find((f) => f.id === id) ?? list[0];

  // Auto-advance through the fleet's set until the visitor picks one.
  useEffect(() => {
    if (!auto) return;
    // The transition, then two loops at the preview rate (long ones capped).
    const ms = (MORPH_MAX + Math.min(Math.max((current.loop * LOOPS_PER_FIGURE) / PREVIEW_RATE, 12), 30)) * 1000;
    const timer = window.setTimeout(() => {
      const k = list.findIndex((f) => f.id === current.id);
      setId(list[(k + 1) % list.length].id);
    }, ms);
    return () => window.clearTimeout(timer);
  }, [auto, current, list]);

  if (failed) {
    return (
      <div className="flex h-[62vh] min-h-[380px] items-center justify-center rounded-xl border border-line bg-black p-6 text-center text-sm text-muted">
        This browser can&apos;t run the 3D preview. Ask us for a recording instead.
      </div>
    );
  }

  return (
    <div>
      <div className="relative h-[62vh] min-h-[400px] overflow-hidden rounded-xl border border-line bg-black">
        <SwarmCanvas
          className="absolute inset-0"
          camera={{ position: [0, 6, 230], fov: 48, near: 1, far: 6000 }}
          onFail={() => setFailed(true)}
        >
          {(quality) => <Scene quality={quality} id={current.id} count={count} playing={playing} hues={hues} />}
        </SwarmCanvas>

        <div className="pointer-events-none absolute left-4 top-4 pr-4 sm:left-6 sm:top-5">
          <p className="font-serif text-2xl text-ink sm:text-3xl">{current.label}</p>
          <p className="mt-1 max-w-[34ch] text-sm text-muted">{current.blurb}</p>
        </div>
        <p className="pointer-events-none absolute bottom-3 left-4 right-4 text-right font-mono text-[10px] uppercase tracking-[0.16em] text-dim">
          Concept render · {count.toLocaleString("en-IN")} drones · drag to orbit 360°
        </p>
      </div>
      {current.credit && (
        <p className="mt-2 text-[11px] leading-snug text-dim">Source: {current.credit}</p>
      )}

      <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Formation">
          {list.map((item) => (
            <button
              key={item.id}
              role="tab"
              aria-selected={item.id === current.id}
              onClick={() => {
                setId(item.id);
                setAuto(false);
              }}
              className={`min-h-11 rounded-full border px-4 font-mono text-xs uppercase tracking-[0.12em] transition-colors ${
                item.id === current.id ? "border-amber bg-amber/10 text-amber-soft" : "border-line-2 text-muted hover:text-ink"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <label htmlFor="fleet" className="font-mono text-[11px] uppercase tracking-[0.14em] text-dim">
            Fleet
          </label>
          <select
            id="fleet"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="min-h-11 rounded-full border border-line-2 bg-navy px-4 font-mono text-xs text-ink"
          >
            {FLEETS.map((n) => (
              <option key={n} value={n}>
                {n.toLocaleString("en-IN")} drones · {formationsFor(n).length} formations
              </option>
            ))}
          </select>
          <button
            onClick={() => setPlaying((p) => !p)}
            className="min-h-11 rounded-full border border-line-2 px-4 font-mono text-xs text-dim transition-colors hover:text-ink"
          >
            {playing ? "Pause" : "Play"}
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2" role="radiogroup" aria-label="LED hues">
        <span className="mr-1 font-mono text-[11px] uppercase tracking-[0.14em] text-dim">LED hues</span>
        {PALETTES.map((p) => {
          const selected = p.id === hues;
          const swatch = p.colors.length ? p.colors : ["#ffb347", "#ff2d55", "#3d6dff"];
          return (
            <button
              key={p.id}
              role="radio"
              aria-checked={selected}
              onClick={() => setHues(p.id)}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 font-mono text-xs transition-colors ${
                selected ? "border-amber bg-amber/10 text-amber-soft" : "border-line-2 text-muted hover:text-ink"
              }`}
            >
              <span className="flex" aria-hidden="true">
                {swatch.map((c, k) => (
                  <span key={c + k} className="-ml-1 h-3 w-3 rounded-full border border-black/40 first:ml-0" style={{ background: c }} />
                ))}
              </span>
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
