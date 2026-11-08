"use client";

/* eslint-disable react-hooks/immutability --
 * three.js objects (materials, camera, scene) are mutable by design. They
 * are only mutated in effects and the render loop, never during render,
 * which is the standard react-three-fiber pattern. */

import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// The night around the swarm: a dusk sky, stars, fog, a ground plane and,
// in the configurator, a crowd for scale. The skyline lives in Skyline.tsx.
//
// The sky is the single biggest lever on "does this look expensive". Pure
// black reads as a void; a dusk gradient that lifts from deep indigo
// overhead to a warm rose-amber glow at the horizon (the light of a city
// under a festival night) reads as a place. It is dithered, because an
// 8-bit gradient across a whole screen bands visibly, and banding is the
// fastest way to make a render look cheap.

export const DUSK = {
  zenith: "#03040b",
  upper: "#0b0c22",
  mid: "#221839",
  horizon: "#4c2944",
  glow: "#8a4630",
  fog: "#1d1528",
};

export function SkyDome({ radius = 2600 }: { radius?: number }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          uZenith: { value: new THREE.Color(DUSK.zenith) },
          uUpper: { value: new THREE.Color(DUSK.upper) },
          uMid: { value: new THREE.Color(DUSK.mid) },
          uHorizon: { value: new THREE.Color(DUSK.horizon) },
          uGlow: { value: new THREE.Color(DUSK.glow) },
          uGround: { value: new THREE.Color("#050408") },
        },
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uZenith, uUpper, uMid, uHorizon, uGlow, uGround;
          varying vec3 vDir;

          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
          }

          void main() {
            float a = vDir.y;
            float up = clamp(a, 0.0, 1.0);
            vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.16, up));
            col = mix(col, uUpper, smoothstep(0.12, 0.42, up));
            col = mix(col, uZenith, smoothstep(0.38, 0.95, up));
            // City glow hugging the horizon, strongest in front of the
            // audience (-z) where the skyline sits.
            float glow = exp(-up * 26.0) * (0.55 + 0.45 * smoothstep(0.2, -0.9, vDir.z));
            col += uGlow * glow * 0.55;
            // Below the horizon: fall to near-black ground haze.
            col = mix(col, uGround, smoothstep(0.0, -0.08, a));
            gl_FragColor = vec4(col, 1.0);
            #include <colorspace_fragment>
            // Dither after encoding, +-0.5 of an 8-bit step: kills banding.
            gl_FragColor.rgb += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
          }
        `,
      }),
    []
  );
  useEffect(() => () => material.dispose(), [material]);

  return (
    <mesh material={material} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[radius, 48, 32]} />
    </mesh>
  );
}

export function Stars({ count, radius = 2400 }: { count: number; radius?: number }) {
  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    let s = 7919;
    const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < count; i++) {
      // Uniform over the upper hemisphere, nothing within ~4 degrees of the
      // horizon, where atmosphere and city glow would swallow them.
      const y = 0.07 + rand() * 0.93;
      const theta = rand() * Math.PI * 2;
      const r = Math.sqrt(1 - y * y);
      positions.set([Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius], i * 3);
      seeds[i] = rand();
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 } },
      vertexShader: /* glsl */ `
        attribute float aSeed;
        uniform float uTime;
        uniform float uPixelRatio;
        varying float vBright;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          float alt = normalize(position).y;
          // Most stars faint, a few bright: a power curve, like a real sky.
          float mag = pow(aSeed, 6.0);
          float tw = 0.75 + 0.25 * sin(uTime * (0.8 + aSeed * 2.5) + aSeed * 90.0);
          vBright = (0.18 + 0.9 * mag) * tw * smoothstep(0.05, 0.3, alt);
          gl_PointSize = (1.1 + mag * 2.2) * uPixelRatio;
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vBright;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = exp(-dot(c, c) * 14.0);
          gl_FragColor = vec4(vec3(0.82, 0.86, 1.0) * d * vBright, 1.0);
          #include <colorspace_fragment>
        }
      `,
    });
    return { geometry, material };
  }, [count, radius]);

  const dpr = useThree((s) => s.viewport.dpr);
  useEffect(() => {
    material.uniforms.uPixelRatio.value = dpr;
  }, [dpr, material]);
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material]
  );
  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return <points geometry={geometry} material={material} frustumCulled={false} renderOrder={-9} />;
}

/** Scene fog, so the skyline layers recede into the horizon colour. */
export function DuskFog({ density = 0.00105 }: { density?: number }) {
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    scene.fog = new THREE.FogExp2(DUSK.fog, density);
    return () => {
      scene.fog = null;
    };
  }, [scene, density]);
  return null;
}

/** Dark ground that dissolves into the fog at distance — no visible edge. */
export function Ground({ radius = 2200 }: { radius?: number }) {
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={-0.1} renderOrder={-8}>
      <circleGeometry args={[radius, 96]} />
      <meshBasicMaterial color="#07060b" />
    </mesh>
  );
}

/**
 * The crowd: ~420 figures of human height around the launch area. In the
 * configurator this is the scale reference that makes 100 drones and 300
 * drones read as different sizes, so it stays in even on the low tier.
 */
export function Crowd({ count = 420, inner = 38, outer = 145 }: { count?: number; inner?: number; outer?: number }) {
  const geometry = useMemo(() => {
    const positions: number[] = [];
    let s = 77712;
    const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const quad = (cx: number, cz: number, hw: number, h: number) => {
      positions.push(cx - hw, 0, cz, cx + hw, 0, cz, cx + hw, h, cz, cx - hw, 0, cz, cx + hw, h, cz, cx - hw, h, cz);
      positions.push(cx, 0, cz - hw, cx, 0, cz + hw, cx, h, cz + hw, cx, 0, cz - hw, cx, h, cz + hw, cx, h, cz - hw);
    };
    for (let i = 0; i < count; i++) {
      const angle = rand() * Math.PI * 2;
      const radius = inner + Math.pow(rand(), 0.7) * (outer - inner);
      quad(Math.cos(angle) * radius, Math.sin(angle) * radius, 0.3, 1.72 * (0.86 + rand() * 0.28));
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, [count, inner, outer]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial color="#020203" side={THREE.DoubleSide} />
    </mesh>
  );
}
