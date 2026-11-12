"use client";

import { useEffect, useImperativeHandle, useMemo, type Ref } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { droneFragmentShader, droneVertexShader } from "./shaders";
import type { QualityProfile } from "./quality";
import { seeded } from "./colors";

/**
 * Uniforms a driver (scroll timeline, show clock) writes every frame.
 * Writing `.value` is all it takes — every pass shares these objects.
 */
export type SwarmUniforms = {
  uProgress: { value: number };
  uStagger: { value: number };
  uArc: { value: number };
  uTime: { value: number };
  uHover: { value: number };
  uLit: { value: number };
  uDissolve: { value: number };
  uTwinkle: { value: number };
  /** 0..1: how fast the swarm is moving right now; scales the trails. */
  uMotion: { value: number };
  uCentre: { value: THREE.Vector3 };
  uWaterY: { value: number };
  /**
   * Colour fidelity, for a driver that needs each drone's own colour to
   * read (Design a Show). Defaults keep the original white-hot LED look:
   * uWhiten 0.55 (how far the core blends to white), uCoreGain 1, uHaloGain 1.
   */
  uWhiten: { value: number };
  uCoreGain: { value: number };
  uHaloGain: { value: number };
};

export type Transition = {
  from: Float32Array;
  to: Float32Array;
  colorFrom: Float32Array;
  colorTo: Float32Array;
  /** Per-drone start offsets, 0..1. Defaults to a stable random stagger. */
  delays?: Float32Array;
  count: number;
};

export type SwarmHandle = {
  uniforms: SwarmUniforms;
  setTransition(t: Transition): void;
  /**
   * Live pose for animated formations: write this frame's positions and
   * colours straight into the "to" buffers (hold uProgress at 1). Slot i
   * shows source point `order[i]` when an order is given. ~40 KB of upload
   * per frame at 1,600 drones — trivial next to the draw itself.
   */
  setPose(positions: Float32Array, colors: Float32Array, count: number, order?: Uint16Array): void;
};

type Props = {
  /** Buffer size. Allocated once; `count` in a transition draws a prefix. */
  capacity: number;
  quality: QualityProfile;
  /** Draw a mirrored copy about uWaterY (home page river). */
  reflection?: boolean;
  /** World size of a drone sprite, in metres at 300m. */
  size?: number;
  ref?: Ref<SwarmHandle>;
};

/**
 * The bloom-dependent look, as uniform values. Applied in place when the
 * runtime monitor turns bloom off, so that never compiles a new material.
 */
function applyLook(material: THREE.ShaderMaterial, bloom: boolean, size: number, pixelRatio: number) {
  const u = material.uniforms;
  u.uSize.value = bloom ? size : size * 1.5;
  u.uPixelRatio.value = pixelRatio;
  u.uMinPx.value = bloom ? 3.2 : 3.6;
  u.uMaxPx.value = bloom ? 30 : 34;
  // Bloom on: a hot HDR core that only drones can reach. Bloom off: a
  // brighter, wider halo stands in for the flare.
  u.uCore.value = bloom ? 5.5 : 1.4;
  u.uHalo.value = bloom ? 0.45 : 0.6;
  u.uHaloWidth.value = bloom ? 5.5 : 3.0;
}

function makeMaterial(shared: SwarmUniforms, opts: { lag: number; mirror: boolean; opacity: number }) {
  const { lag, mirror, opacity } = opts;
  return new THREE.ShaderMaterial({
    uniforms: {
      ...shared,
      uLag: { value: lag },
      uMirror: { value: mirror ? 1 : 0 },
      uOpacity: { value: opacity },
      uSize: { value: 1 },
      uPixelRatio: { value: 1 },
      uMinPx: { value: 3.2 },
      uMaxPx: { value: 30 },
      uCore: { value: 5.5 },
      uHalo: { value: 0.45 },
      uHaloWidth: { value: 5.5 },
    },
    vertexShader: droneVertexShader,
    fragmentShader: droneFragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

export default function DroneSwarm({ capacity, quality, reflection = false, size = 1.7, ref }: Props) {
  const { trailSteps, bloom } = quality;
  const mirrored = reflection && quality.reflection;
  const { geometry, uniforms, passes } = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const attr = (name: string, itemSize: number) => {
      const a = new THREE.BufferAttribute(new Float32Array(capacity * itemSize), itemSize);
      a.setUsage(THREE.DynamicDrawUsage);
      geometry.setAttribute(name, a);
      return a;
    };
    // `position` is required by three but unused by the shader.
    attr("position", 3);
    attr("aFrom", 3);
    attr("aTo", 3);
    attr("aColorFrom", 3);
    attr("aColorTo", 3);
    attr("aDelay", 1);
    const seed = new Float32Array(capacity);
    for (let i = 0; i < capacity; i++) seed[i] = seeded(i, 11);
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    geometry.setDrawRange(0, 0);

    const uniforms: SwarmUniforms = {
      uProgress: { value: 1 },
      uStagger: { value: 0.3 },
      uArc: { value: 6 },
      uTime: { value: 0 },
      uHover: { value: 0.25 },
      uLit: { value: 1 },
      uDissolve: { value: 0 },
      uTwinkle: { value: 0.05 },
      uMotion: { value: 0 },
      uCentre: { value: new THREE.Vector3(0, 85, 0) },
      uWaterY: { value: 0 },
      uWhiten: { value: 0.55 },
      uCoreGain: { value: 1 },
      uHaloGain: { value: 1 },
    };

    const passes: { material: THREE.ShaderMaterial; order: number; size: number }[] = [];

    // Trails first, so the live drone draws on top of its own wake.
    for (let k = trailSteps; k >= 1; k--) {
      passes.push({
        material: makeMaterial(uniforms, {
          lag: 0.018 * k,
          mirror: false,
          opacity: 0.38 * (1 - k / (trailSteps + 1)),
        }),
        order: 1,
        size: size * 0.85,
      });
    }
    passes.push({ material: makeMaterial(uniforms, { lag: 0, mirror: false, opacity: 1 }), order: 2, size });
    if (mirrored) {
      passes.push({ material: makeMaterial(uniforms, { lag: 0, mirror: true, opacity: 1 }), order: 0, size: size * 1.2 });
    }
    return { geometry, uniforms, passes };
    // Deliberately NOT keyed on the whole `quality` object: DPR and bloom
    // change at runtime and are applied as uniforms below.
  }, [capacity, trailSteps, mirrored, size]);

  const dpr = useThree((s) => s.viewport.dpr);
  useEffect(() => {
    for (const pass of passes) applyLook(pass.material, bloom, pass.size, dpr);
  }, [passes, bloom, dpr]);

  useImperativeHandle(
    ref,
    () => ({
      uniforms,
      setTransition({ from, to, colorFrom, colorTo, delays, count }) {
        const n = Math.min(count, capacity);
        const set = (name: string, src: Float32Array, itemSize: number) => {
          const a = geometry.getAttribute(name) as THREE.BufferAttribute;
          (a.array as Float32Array).set(src.subarray(0, n * itemSize));
          a.needsUpdate = true;
        };
        set("aFrom", from, 3);
        set("aTo", to, 3);
        set("aColorFrom", colorFrom, 3);
        set("aColorTo", colorTo, 3);
        const delay = geometry.getAttribute("aDelay") as THREE.BufferAttribute;
        const d = delay.array as Float32Array;
        for (let i = 0; i < n; i++) d[i] = delays ? delays[i] : seeded(i, 5);
        delay.needsUpdate = true;
        geometry.setDrawRange(0, n);
      },
      setPose(positions, colors, count, order) {
        const n = Math.min(count, capacity);
        const to = geometry.getAttribute("aTo") as THREE.BufferAttribute;
        const ct = geometry.getAttribute("aColorTo") as THREE.BufferAttribute;
        const tp = to.array as Float32Array;
        const tc = ct.array as Float32Array;
        if (order) {
          for (let i = 0; i < n; i++) {
            const j = order[i] * 3;
            tp[i * 3] = positions[j];
            tp[i * 3 + 1] = positions[j + 1];
            tp[i * 3 + 2] = positions[j + 2];
            tc[i * 3] = colors[j];
            tc[i * 3 + 1] = colors[j + 1];
            tc[i * 3 + 2] = colors[j + 2];
          }
        } else {
          tp.set(positions.subarray(0, n * 3));
          tc.set(colors.subarray(0, n * 3));
        }
        to.needsUpdate = true;
        ct.needsUpdate = true;
        geometry.setDrawRange(0, n);
      },
    }),
    [uniforms, geometry, capacity]
  );

  useEffect(
    () => () => {
      geometry.dispose();
      passes.forEach((p) => p.material.dispose());
    },
    [geometry, passes]
  );

  return (
    <>
      {passes.map((pass, i) => (
        <points
          key={i}
          geometry={geometry}
          material={pass.material}
          frustumCulled={false}
          renderOrder={10 + pass.order}
        />
      ))}
    </>
  );
}
