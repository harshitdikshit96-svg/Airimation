"use client";

/* eslint-disable react-hooks/immutability --
 * three.js objects (materials, camera, scene) are mutable by design. They
 * are only mutated in effects and the render loop, never during render,
 * which is the standard react-three-fiber pattern. */

import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DUSK } from "./Environment";

/**
 * A dark river. It reflects the sky gradient by view angle (Fresnel), with
 * slow ripples breaking up the reflection. It writes no depth, so the
 * swarm's mirrored pass, drawn after it, shows through: that is the actual
 * reflection of the drones.
 */
export default function Water({
  zNear = 2000,
  zFar = 120,
  width = 6000,
}: {
  zNear?: number;
  zFar?: number;
  width?: number;
}) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uDeep: { value: new THREE.Color("#020309") },
          uHorizon: { value: new THREE.Color(DUSK.horizon) },
          uGlow: { value: new THREE.Color(DUSK.glow) },
          uMid: { value: new THREE.Color(DUSK.mid) },
        },
        vertexShader: /* glsl */ `
          varying vec3 vWorld;
          void main() {
            vec4 w = modelMatrix * vec4(position, 1.0);
            vWorld = w.xyz;
            gl_Position = projectionMatrix * viewMatrix * w;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          uniform vec3 uDeep, uHorizon, uGlow, uMid;
          varying vec3 vWorld;

          float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
          float noise(vec2 p) {
            vec2 i = floor(p), f = fract(p);
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
          }

          void main() {
            vec3 view = normalize(vWorld - cameraPosition);
            // Ripple normal from two drifting noise octaves, stretched along x
            // (wind across the river).
            vec2 q = vWorld.xz * vec2(0.035, 0.11);
            float n1 = noise(q + vec2(uTime * 0.05, uTime * 0.11));
            float n2 = noise(q * 2.7 - vec2(uTime * 0.08, uTime * 0.04));
            vec3 normal = normalize(vec3((n1 - 0.5) * 0.08, 1.0, (n2 - 0.5) * 0.16));
            vec3 refl = reflect(view, normal);

            float fresnel = 0.03 + 0.97 * pow(1.0 - max(dot(-view, normal), 0.0), 5.0);
            float up = clamp(refl.y, 0.0, 1.0);
            vec3 sky = mix(uHorizon, uMid, smoothstep(0.0, 0.2, up)) + uGlow * exp(-up * 26.0) * 0.5;
            vec3 col = mix(uDeep, sky, fresnel * 0.5);
            gl_FragColor = vec4(col, 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
        `,
        fog: false,
      }),
    []
  );
  useEffect(() => () => material.dispose(), [material]);
  useFrame((s) => {
    material.uniforms.uTime.value = s.clock.elapsedTime;
  });

  const depth = zNear - zFar;
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, zFar + depth / 2]} material={material} renderOrder={-7}>
      <planeGeometry args={[width, depth]} />
    </mesh>
  );
}
