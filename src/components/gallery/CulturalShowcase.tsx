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
import { CULTURAL, SHOW_ALT, type AnimatedFormation } from "@/lib/cultural";

/** Fleet sizes on offer. The top one depends on the device. */
function fleetOptions(): number[] {
  const tier = detectTier();
  return tier === "high" ? [300, 800, 1600] : tier === "mid" ? [300, 600, 1000] : [250, 500];
}
const CAPACITY = 1600;
const MORPH = 3.2; // seconds between figures
const LOOPS_PER_FIGURE = 2;

type Rig = unknown;

function toVecs(a: Float32Array, n: number): Vec3[] {
  const out: Vec3[] = new Array(n);
  for (let i = 0; i < n; i++) out[i] = { x: a[i * 3], y: a[i * 3 + 1], z: a[i * 3 + 2] };
  return out;
}

/** Rigs are cached per (figure, count): building Shiva at 1,600 is ~250 ms. */
const rigCache = new Map<string, Rig>();
function rigFor(f: AnimatedFormation<Rig>, n: number): Rig {
  const key = `${f.id}:${n}`;
  let rig = rigCache.get(key);
  if (!rig) rigCache.set(key, (rig = f.build(n)));
  return rig;
}

function Scene({
  quality,
  index,
  count,
  playing,
}: {
  quality: QualityProfile;
  index: number;
  count: number;
  playing: boolean;
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
  const clock = useRef({ key: "", t: 0, morph: 0, order: null as Uint16Array | null, idle: 0 });

  useEffect(() => {
    const ctl = controls.current;
    if (!ctl) return;
    const wake = () => (clock.current.idle = 0);
    ctl.addEventListener("start", wake);
    return () => ctl.removeEventListener("start", wake);
  }, []);

  useFrame((state, delta) => {
    const api = swarm.current;
    if (!api) return;
    const c = clock.current;
    const f = CULTURAL[index] as AnimatedFormation<Rig>;
    const key = `${f.id}:${count}`;
    const dt = Math.min(delta, 0.1);
    const u = api.uniforms;

    if (key !== c.key) {
      // New figure or fleet size: morph from what is on screen to its first
      // pose, with drones matched to their nearest target so paths don't
      // cross (same assignment as the configurator).
      const rig = rigFor(f, count);
      f.pose(rig, 0, buffers.pos, buffers.col);
      const first = c.key === "";
      const order = first
        ? Uint16Array.from({ length: count }, (_, i) => i)
        : assign(toVecs(buffers.shown, count), toVecs(buffers.pos, count));
      for (let i = 0; i < count; i++) {
        const j = order[i] * 3;
        buffers.ordered.set(buffers.pos.subarray(j, j + 3), i * 3);
        buffers.orderedCol.set(buffers.col.subarray(j, j + 3), i * 3);
      }
      if (first) {
        // First figure: rise from a launch grid below it.
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
      c.key = key;
      c.order = order;
      c.morph = 0;
      c.t = 0;
    }

    if (c.morph < MORPH) {
      c.morph += dt;
      u.uProgress.value = Math.min(1, c.morph / MORPH);
      u.uStagger.value = 0.3;
      u.uArc.value = 6;
    } else {
      // Live: pose the figure every frame.
      if (playing) c.t = (c.t + dt) % f.loop;
      const rig = rigFor(f, count);
      f.pose(rig, c.t, buffers.pos, buffers.col);
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
    u.uCentre.value.set(0, SHOW_ALT, 0);

    // A slow drift round the figure while nobody is steering, so the 3D
    // ones (damru, dragon) show their depth.
    c.idle += dt;
    const ctl = controls.current;
    if (ctl && c.idle > 4) {
      const target = Math.sin(state.clock.elapsedTime * 0.11) * 0.42;
      const now = ctl.getAzimuthalAngle();
      ctl.setAzimuthalAngle(now + (target - now) * 0.01);
    }
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
        target={[0, SHOW_ALT + 4, 0]}
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        minDistance={120}
        maxDistance={260}
        minAzimuthAngle={-1.1}
        maxAzimuthAngle={1.1}
        // The eye is BELOW the figure (an audience looks up), so the polar
        // angle sits past 90 degrees; 108 keeps the camera above ground at
        // the furthest zoom.
        minPolarAngle={THREE.MathUtils.degToRad(68)}
        maxPolarAngle={THREE.MathUtils.degToRad(108)}
        makeDefault
      />
    </>
  );
}

export default function CulturalShowcase() {
  const [options] = useState(fleetOptions);
  const [count, setCount] = useState(() => options[options.length - 1]);
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [failed, setFailed] = useState(false);
  const f = CULTURAL[index];

  // Auto-advance through the set until the visitor picks one.
  useEffect(() => {
    if (!auto) return;
    const ms = (MORPH + Math.max(f.loop * LOOPS_PER_FIGURE, 10)) * 1000;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % CULTURAL.length), ms);
    return () => window.clearTimeout(id);
  }, [auto, index, f.loop]);

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
          {(quality) => <Scene quality={quality} index={index} count={count} playing={playing} />}
        </SwarmCanvas>

        <div className="pointer-events-none absolute left-4 top-4 sm:left-6 sm:top-5">
          <p className="font-serif text-2xl text-ink sm:text-3xl">{f.label}</p>
          <p className="mt-1 max-w-[34ch] text-sm text-muted">{f.blurb}</p>
        </div>
        <p className="pointer-events-none absolute bottom-3 right-4 font-mono text-[10px] uppercase tracking-[0.16em] text-dim">
          Concept render · {count.toLocaleString("en-IN")} drones · drag to look around
        </p>
        {count < f.minDrones && (
          <p className="pointer-events-none absolute bottom-3 left-4 max-w-[46ch] font-mono text-[10px] uppercase tracking-[0.12em] text-amber-soft">
            Needs ~{f.minDrones}+ drones to hold its detail
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Formation">
          {CULTURAL.map((item, i) => (
            <button
              key={item.id}
              role="tab"
              aria-selected={i === index}
              onClick={() => {
                setIndex(i);
                setAuto(false);
              }}
              className={`min-h-11 rounded-full border px-4 font-mono text-xs uppercase tracking-[0.12em] transition-colors ${
                i === index ? "border-amber bg-amber/10 text-amber-soft" : "border-line-2 text-muted hover:text-ink"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 font-mono text-[11px] uppercase tracking-[0.14em] text-dim">Fleet</span>
          {options.map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              aria-pressed={n === count}
              className={`min-h-11 rounded-full border px-3.5 font-mono text-xs transition-colors ${
                n === count ? "border-ink/60 text-ink" : "border-line-2 text-dim hover:text-ink"
              }`}
            >
              {n.toLocaleString("en-IN")}
            </button>
          ))}
          <button
            onClick={() => setPlaying((p) => !p)}
            className="ml-1 min-h-11 rounded-full border border-line-2 px-3.5 font-mono text-xs text-dim transition-colors hover:text-ink"
          >
            {playing ? "Pause" : "Play"}
          </button>
        </div>
      </div>
    </div>
  );
}
