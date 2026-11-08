"use client";

import { useEffect, useImperativeHandle, useMemo, type Ref } from "react";
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

function makeMaterial(
  shared: SwarmUniforms,
  pixelRatio: number,
  opts: { lag: number; mirror: boolean; opacity: number; bloom: boolean; size: number }
) {
  const { lag, mirror, opacity, bloom, size } = opts;
  return new THREE.ShaderMaterial({
    uniforms: {
      ...shared,
      uLag: { value: lag },
      uMirror: { value: mirror ? 1 : 0 },
      uOpacity: { value: opacity },
      uSize: { value: bloom ? size : size * 1.5 },
      uPixelRatio: { value: pixelRatio },
      uMinPx: { value: bloom ? 3.2 : 3.6 },
      uMaxPx: { value: bloom ? 30 : 34 },
      // Bloom on: a hot HDR core that only drones can reach. Bloom off: a
      // brighter, wider halo stands in for the flare.
      uCore: { value: bloom ? 5.5 : 1.4 },
      uHalo: { value: bloom ? 0.45 : 0.6 },
      uHaloWidth: { value: bloom ? 5.5 : 3.0 },
    },
    vertexShader: droneVertexShader,
    fragmentShader: droneFragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

export default function DroneSwarm({ capacity, quality, reflection = false, size = 1.7, ref }: Props) {
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
      uArc: { value: 12 },
      uTime: { value: 0 },
      uHover: { value: 0.35 },
      uLit: { value: 1 },
      uDissolve: { value: 0 },
      uTwinkle: { value: 0.22 },
      uMotion: { value: 0 },
      uCentre: { value: new THREE.Vector3(0, 85, 0) },
      uWaterY: { value: 0 },
    };

    const pixelRatio = Math.min(typeof window === "undefined" ? 1 : window.devicePixelRatio || 1, quality.dpr);
    const bloom = quality.bloom;
    const passes: { material: THREE.ShaderMaterial; order: number; trail: boolean }[] = [];

    // Trails first, so the live drone draws on top of its own wake.
    for (let k = quality.trailSteps; k >= 1; k--) {
      passes.push({
        material: makeMaterial(uniforms, pixelRatio, {
          lag: 0.018 * k,
          mirror: false,
          opacity: 0.38 * (1 - k / (quality.trailSteps + 1)),
          bloom,
          size: size * 0.85,
        }),
        order: 1,
        trail: true,
      });
    }
    passes.push({
      material: makeMaterial(uniforms, pixelRatio, { lag: 0, mirror: false, opacity: 1, bloom, size }),
      order: 2,
      trail: false,
    });
    if (reflection && quality.reflection) {
      passes.push({
        material: makeMaterial(uniforms, pixelRatio, { lag: 0, mirror: true, opacity: 1, bloom, size: size * 1.2 }),
        order: 0,
        trail: false,
      });
    }
    return { geometry, uniforms, passes };
  }, [capacity, quality, reflection, size]);

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
