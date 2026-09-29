// The horizon silhouette.
//
// This exists for ONE reason: scale. Against a pure black sky a swarm has no
// reference — 50 drones and 200 drones look nearly identical, because the
// viewer can orbit closer or further and nothing anchors the size. Since the
// entire purpose of this tool is to help someone judge how many drones they
// need, an empty background would defeat it.
//
// So: a treeline of known height and a crowd of human-scale figures. It is a
// measuring stick dressed as scenery, and it must stay dark enough never to
// compete with the swarm.

import * as THREE from "three";

const TREELINE_RADIUS = 250;
const TREE_MIN_HEIGHT = 11;
const TREE_MAX_HEIGHT = 28;
const TREELINE_SEGMENTS = 220;

const PERSON_HEIGHT = 1.7;
const PERSON_WIDTH = 0.55;
const CROWD_COUNT = 260;
const CROWD_INNER = 70;
const CROWD_OUTER = 160;

function rand(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/**
 * A closed band of silhouette around the show, so it reads correctly from
 * any orbit angle rather than only head-on. Height varies with angle to
 * suggest trees and low buildings.
 */
function buildTreeline(): THREE.Mesh {
  const positions: number[] = [];
  const random = rand(20260929);

  const heightAt = (i: number) => {
    const a = (i / TREELINE_SEGMENTS) * Math.PI * 2;
    const base =
      0.5 +
      0.28 * Math.sin(a * 3.1) +
      0.18 * Math.sin(a * 7.3 + 1.2) +
      0.12 * Math.sin(a * 13.7 + 0.4);
    const jitter = random() * 0.22 - 0.11;
    return TREE_MIN_HEIGHT + (TREE_MAX_HEIGHT - TREE_MIN_HEIGHT) * Math.max(0, Math.min(1, base + jitter));
  };

  const heights: number[] = [];
  for (let i = 0; i <= TREELINE_SEGMENTS; i++) heights.push(heightAt(i));
  heights[TREELINE_SEGMENTS] = heights[0]; // close the loop seamlessly

  for (let i = 0; i < TREELINE_SEGMENTS; i++) {
    const a0 = (i / TREELINE_SEGMENTS) * Math.PI * 2;
    const a1 = ((i + 1) / TREELINE_SEGMENTS) * Math.PI * 2;
    const x0 = Math.cos(a0) * TREELINE_RADIUS;
    const z0 = Math.sin(a0) * TREELINE_RADIUS;
    const x1 = Math.cos(a1) * TREELINE_RADIUS;
    const z1 = Math.sin(a1) * TREELINE_RADIUS;
    const h0 = heights[i];
    const h1 = heights[i + 1];

    positions.push(x0, 0, z0, x1, 0, z1, x1, h1, z1);
    positions.push(x0, 0, z0, x1, h1, z1, x0, h0, z0);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const material = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.DoubleSide,
    depthWrite: true,
  });
  return new THREE.Mesh(geometry, material);
}

/**
 * A scattered crowd of human-height figures. At 1.7m each they are the
 * finest scale reference in the scene — the thing that makes a 90-metre-wide
 * formation legible as ninety metres wide.
 */
function buildCrowd(): THREE.Mesh {
  const positions: number[] = [];
  const random = rand(77712);

  for (let i = 0; i < CROWD_COUNT; i++) {
    const angle = random() * Math.PI * 2;
    const radius = CROWD_INNER + random() * (CROWD_OUTER - CROWD_INNER);
    const cx = Math.cos(angle) * radius;
    const cz = Math.sin(angle) * radius;
    const h = PERSON_HEIGHT * (0.85 + random() * 0.3);
    const w = PERSON_WIDTH;

    // Cross-billboard: two perpendicular quads, so a figure reads as a
    // silhouette from any orbit angle without per-frame billboarding.
    positions.push(cx - w / 2, 0, cz, cx + w / 2, 0, cz, cx + w / 2, h, cz);
    positions.push(cx - w / 2, 0, cz, cx + w / 2, h, cz, cx - w / 2, h, cz);
    positions.push(cx, 0, cz - w / 2, cx, 0, cz + w / 2, cx, h, cz + w / 2);
    positions.push(cx, 0, cz - w / 2, cx, h, cz + w / 2, cx, h, cz - w / 2);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const material = new THREE.MeshBasicMaterial({
    color: 0x020305,
    side: THREE.DoubleSide,
  });
  return new THREE.Mesh(geometry, material);
}

function buildGround(): THREE.Mesh {
  const geometry = new THREE.CircleGeometry(TREELINE_RADIUS, 64);
  geometry.rotateX(-Math.PI / 2);
  const material = new THREE.MeshBasicMaterial({ color: 0x030407 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = -0.1;
  return mesh;
}


/**
 * A very dark sky gradient.
 *
 * WHY THIS IS NOT PURE BLACK: a silhouette needs something to be a
 * silhouette *against*. With a black sky and a black treeline, the scale
 * reference is invisible — which is exactly what the first render showed.
 * Real night skies are not pure black near the horizon either; ground light
 * lifts them slightly. So the dome stays black overhead and lifts to a very
 * dark blue-grey at the horizon, which is both truthful and makes the
 * treeline and crowd readable.
 */
function buildSky(): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(900, 32, 16);
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      uHorizon: { value: new THREE.Color(0x1d2433) },
      uZenith: { value: new THREE.Color(0x000000) },
    },
    vertexShader: /* glsl */ `
      varying float vAltitude;
      void main() {
        vAltitude = normalize(position).y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uHorizon;
      uniform vec3 uZenith;
      varying float vAltitude;
      void main() {
        // Concentrate the lift in the lowest part of the sky.
        float t = clamp(vAltitude, 0.0, 1.0);
        float mixAmount = pow(1.0 - t, 2.6);
        gl_FragColor = vec4(mix(uZenith, uHorizon, mixAmount), 1.0);
      }
    `,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.renderOrder = -1;
  return mesh;
}

export function buildHorizon(): THREE.Group {
  const group = new THREE.Group();
  group.add(buildSky());
  group.add(buildGround());
  group.add(buildTreeline());
  group.add(buildCrowd());
  return group;
}

export const HORIZON_REFERENCE = {
  personHeightM: PERSON_HEIGHT,
  treeHeightRangeM: [TREE_MIN_HEIGHT, TREE_MAX_HEIGHT] as const,
};
