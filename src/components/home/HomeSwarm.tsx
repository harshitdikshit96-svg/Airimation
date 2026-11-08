"use client";

/* eslint-disable react-hooks/immutability --
 * three.js objects (materials, camera, scene) are mutable by design. They
 * are only mutated in effects and the render loop, never during render,
 * which is the standard react-three-fiber pattern. */

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import SwarmCanvas from "@/components/swarm/SwarmCanvas";
import DroneSwarm, { type SwarmHandle } from "@/components/swarm/DroneSwarm";
import { DuskFog, SkyDome, Stars } from "@/components/swarm/Environment";
import Skyline from "@/components/swarm/Skyline";
import Water from "@/components/swarm/Water";
import { cloud, fromText, grid, lotus, sheet } from "@/components/swarm/formations";
import { matchTargets, radialDelays } from "@/components/swarm/match";
import { solidColors, stageColors } from "@/components/swarm/colors";
import type { QualityProfile } from "@/components/swarm/quality";
import { whoosh } from "@/components/swarm/audio";

/**
 * Scroll-driven story state, written by GSAP ScrollTrigger (HomeStory.ts)
 * and read every frame here. A plain mutable object: nothing that changes
 * per frame goes through React.
 */
export type StoryState = {
  /** 0 ground, 1 risen sheet, 2 open-sky cloud, 3 lotus, 4 wordmark. */
  beat: number;
  /** 0..1: the lift-off light wave. */
  lit: number;
  /** 0..1: the swarm drifting apart after the wordmark. */
  dissolve: number;
};

export const PHASES = ["GROUND HOLD", "LIFT-OFF", "OPEN SKY", "LOTUS BLOOM", "BISCOPE"];

// The launch field is a sandbank across the river, the show above it, the
// ghat behind. Coordinates in metres; the audience stands at +z.
const SHOW_Z = 30;
const GHAT_Z = -70;
const RIVER_EDGE_Z = 120;
const CAMERA_POS = new THREE.Vector3(0, 12, 330);

/**
 * Where the camera looks at each beat: [x shift, look-at altitude].
 * On wide screens the swarm sits on the opposite side from the section's
 * copy (01 is left-aligned, 02 right-aligned), and the wordmark rises
 * high so the Biscope heading can scroll in beneath it. On portrait
 * screens it stays centred in the upper part of the frame.
 */
const FRAMING_WIDE: [number, number][] = [
  [0, 16],
  [-52, 60],
  [48, 66],
  [44, 66],
  [0, 50],
];
const FRAMING_TALL: [number, number][] = [
  [0, 18],
  [0, 46],
  [0, 50],
  [0, 50],
  [0, 46],
];

function framing(beat: number, wide: boolean): [number, number] {
  const table = wide ? FRAMING_WIDE : FRAMING_TALL;
  const k = Math.min(table.length - 2, Math.floor(beat));
  const t = THREE.MathUtils.smoothstep(beat - k, 0, 1);
  return [
    THREE.MathUtils.lerp(table[k][0], table[k + 1][0], t),
    THREE.MathUtils.lerp(table[k][1], table[k + 1][1], t),
  ];
}

type Beats = { positions: Float32Array[]; colors: Float32Array[]; delays: (Float32Array | undefined)[] };

function offsetZ(a: Float32Array, dz: number) {
  for (let i = 2; i < a.length; i += 3) a[i] += dz;
  return a;
}

function buildBeats(n: number, wordmark: Float32Array | null): Beats {
  const g = offsetZ(grid(n), SHOW_Z);
  const s = offsetZ(sheet(n), SHOW_Z); // same index order as the grid: no matching needed
  const c = matchTargets(s, offsetZ(cloud(n), SHOW_Z), n);
  const l = matchTargets(c, offsetZ(lotus(n), SHOW_Z), n);
  const w = wordmark ? matchTargets(l, offsetZ(wordmark, SHOW_Z), n) : l;

  const warmWhite = solidColors(n, [1, 0.9, 0.74]);
  const positions = [g, s, c, l, w];
  const colors = [
    stageColors("__ground", g, n),
    warmWhite,
    warmWhite,
    // Lotus colours key off distance from the flower's axis, so measure
    // them on the matched points moved back to the origin.
    stageColors("lotus", offsetZ(l.slice(), -SHOW_Z), n),
    // The flagship beat in Diwali gold. With a gentle vertical ramp
    // toward cream, so the letters have form rather than a flat fill.
    stageColors("text", w, n, "gold"),
  ];
  // Lift-off ripples out from the centre of the field; every later
  // transition uses the shader's stable random stagger.
  const delays = [radialDelays(g, n, 0, SHOW_Z), undefined, undefined, undefined];
  return { positions, colors, delays };
}

function Scene({
  quality,
  story,
  caption,
  reduced,
}: {
  quality: QualityProfile;
  story: StoryState;
  caption: React.RefObject<HTMLSpanElement | null>;
  reduced: boolean;
}) {
  const n = quality.homeDrones;
  const swarm = useRef<SwarmHandle | null>(null);
  const [wordmark, setWordmark] = useState<Float32Array | null>(null);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);

  // The wordmark is sampled from the site's own serif, which must be
  // loaded before the canvas can draw it.
  useEffect(() => {
    let cancelled = false;
    document.fonts
      .load(`600 220px "IBM Plex Serif"`)
      .catch(() => undefined)
      .then(() => {
        if (!cancelled) setWordmark(fromText("BISCOPE", n, { width: 190, bow: 12, letterSpacing: 10, seed: 7, altitude: 96 }));
      });
    return () => {
      cancelled = true;
    };
  }, [n]);

  const beats = useMemo(() => buildBeats(n, wordmark), [n, wordmark]);
  const current = useRef({ k: -1, beats: null as Beats | null, lastBeat: 0, motion: 0 });
  const target = useMemo(() => new THREE.Vector3(), []);

  // Frame the show for portrait screens: pull the lens wider.
  useEffect(() => {
    camera.fov = size.width / size.height < 0.8 ? 64 : 46;
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, size, invalidate]);

  // Reduced motion: one static, finished formation.
  useEffect(() => {
    if (reduced) invalidate();
  }, [reduced, beats, invalidate]);

  useFrame((state, delta) => {
    const api = swarm.current;
    if (!api) return;
    const u = api.uniforms;
    const beat = reduced ? 3 : Math.min(Math.max(story.beat, 0), 3.9999);
    const k = Math.floor(beat);
    const t = beat - k;
    const c = current.current;

    if (k !== c.k || c.beats !== beats) {
      api.setTransition({
        from: beats.positions[k],
        to: beats.positions[k + 1],
        colorFrom: beats.colors[k],
        colorTo: beats.colors[k + 1],
        delays: beats.delays[k],
        count: n,
      });
      if (c.k !== -1 && c.beats === beats) whoosh(k === 0 ? 0.6 : 1);
      c.k = k;
      c.beats = beats;
    }

    u.uProgress.value = reduced ? 1 : t;
    u.uTime.value = state.clock.elapsedTime;
    u.uLit.value = reduced ? 1 : story.lit;
    u.uDissolve.value = reduced ? 0 : story.dissolve;
    u.uStagger.value = k === 0 ? 0.55 : 0.32;
    u.uArc.value = k === 0 ? 0 : 14;
    u.uCentre.value.set(0, 85, SHOW_Z);
    // Trails follow how fast the story is actually moving.
    const speed = Math.abs(beat - c.lastBeat) / Math.max(delta, 1e-3);
    c.motion += (Math.min(1, speed * 1.8) - c.motion) * 0.12;
    c.lastBeat = beat;
    u.uMotion.value = c.motion;

    // Camera: tilt from the launch field up to the sky as the fleet rises,
    // with a slow drift so the frame is never perfectly still.
    const time = reduced ? 0 : state.clock.elapsedTime;
    const [shift, lookY] = framing(beat, size.width / size.height > 1.15);
    camera.position.set(
      CAMERA_POS.x + shift + Math.sin(time * 0.07) * 5,
      CAMERA_POS.y + Math.sin(time * 0.05) * 1.2,
      CAMERA_POS.z
    );
    target.set(shift, lookY, SHOW_Z);
    camera.lookAt(target);

    if (caption.current) {
      const phase = beat < 0.12 && story.lit < 0.15 ? 0 : Math.min(PHASES.length - 1, Math.round(beat + 0.25));
      const name = PHASES[phase];
      if (caption.current.textContent !== name) caption.current.textContent = name;
    }
  });

  return (
    <>
      <SkyDome />
      <Stars count={quality.stars} />
      <DuskFog density={0.0009} />
      {/* Sandbank / launch field: everything behind the river's edge. */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.1, RIVER_EDGE_Z - 1600]}>
        <planeGeometry args={[6000, 3200]} />
        <meshBasicMaterial color="#0a080e" />
      </mesh>
      <Water zFar={RIVER_EDGE_Z} />
      <Suspense fallback={null}>
        <Skyline part="ghat" position={[0, 0, GHAT_Z]} lightGain={2.6} />
        <Skyline part="ring" lightGain={1.3} />
      </Suspense>
      <DroneSwarm ref={swarm} capacity={n} quality={quality} reflection size={2.3} />
    </>
  );
}

export default function HomeSwarm({
  story,
  caption,
  active,
  reduced,
  onReady,
  onFail,
}: {
  story: StoryState;
  caption: React.RefObject<HTMLSpanElement | null>;
  active: boolean;
  reduced: boolean;
  onReady: () => void;
  onFail: () => void;
}) {
  return (
    <SwarmCanvas
      className="h-full w-full"
      camera={{ position: CAMERA_POS.toArray(), fov: 46, near: 1, far: 6000 }}
      active={active}
      still={reduced}
      onReady={onReady}
      onFail={onFail}
    >
      {(quality) => <Scene quality={quality} story={story} caption={caption} reduced={reduced} />}
    </SwarmCanvas>
  );
}
