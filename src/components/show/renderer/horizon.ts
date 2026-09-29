// The horizon: ground, treeline and crowd.
//
// This exists for ONE reason — SCALE. Against an empty sky a swarm has no
// reference: 50 drones and 200 drones look identical, because the viewer can
// orbit closer or further and nothing anchors the size. Since the whole
// purpose of this tool is helping someone judge how many drones they need,
// an empty background would defeat it.
//
// So everything here is a measuring stick dressed as scenery: trees of known
// height, people of known height, and a ground plane that recedes. It has to
// be visible enough to read at a glance and restrained enough never to
// compete with the swarm.
//
// A first version was almost invisible — near-black shapes against a
// near-black sky. The fix is not brighter silhouettes (real ones ARE black)
// but a LIT BACKGROUND for them to sit against: a sky that lifts toward the
// horizon and a ground that catches that light. That is also how a real
// night field looks.

import * as THREE from "three";

const GROUND_RADIUS = 1600;

// The treeline must sit OUTSIDE the camera's furthest orbit (CAMERA.maxDistance,
// currently 380m). An earlier ring at 195–255m put the default camera position
// literally inside the trees, and a canopy a few metres from the lens filled
// half the frame with a black polygon.
const TREE_RING_INNER = 440;
const TREE_RING_OUTER = 560;
const TREE_COUNT = 260;
const TREE_MIN_HEIGHT = 14;
const TREE_MAX_HEIGHT = 34;

const PERSON_HEIGHT = 1.72;
const CROWD_COUNT = 420;
const CROWD_INNER = 38;
const CROWD_OUTER = 145;

function rand(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** Two perpendicular quads, so a flat silhouette reads from any orbit angle. */
function pushCross(
  out: number[],
  cx: number,
  cz: number,
  halfWidth: number,
  bottom: number,
  top: number
) {
  out.push(cx - halfWidth, bottom, cz, cx + halfWidth, bottom, cz, cx + halfWidth, top, cz);
  out.push(cx - halfWidth, bottom, cz, cx + halfWidth, top, cz, cx - halfWidth, top, cz);
  out.push(cx, bottom, cz - halfWidth, cx, bottom, cz + halfWidth, cx, top, cz + halfWidth);
  out.push(cx, bottom, cz - halfWidth, cx, top, cz + halfWidth, cx, top, cz - halfWidth);
}

/**
 * A treeline of individual trees — trunk plus a rounded canopy.
 *
 * Deliberately not a smooth noise ridge: a ridge reads as distant hills of
 * unknown size, where a tree is something everyone can size instinctively.
 * That instinct is the entire point.
 */
function buildTrees(): THREE.Mesh {
  const positions: number[] = [];
  const random = rand(90210);

  for (let i = 0; i < TREE_COUNT; i++) {
    const angle = (i / TREE_COUNT) * Math.PI * 2 + (random() - 0.5) * 0.06;
    const radius = TREE_RING_INNER + random() * (TREE_RING_OUTER - TREE_RING_INNER);
    const cx = Math.cos(angle) * radius;
    const cz = Math.sin(angle) * radius;

    const height = TREE_MIN_HEIGHT + random() * (TREE_MAX_HEIGHT - TREE_MIN_HEIGHT);
    const canopyRadius = height * (0.3 + random() * 0.14);
    const trunkHeight = height * (0.3 + random() * 0.12);

    // Trunk.
    pushCross(positions, cx, cz, height * 0.035, 0, trunkHeight + canopyRadius * 0.4);

    // Canopy, as a pair of crossed polygons approximating a rounded mass.
    const segments = 9;
    const canopyCentre = trunkHeight + canopyRadius;
    for (let s = 0; s < segments; s++) {
      const a0 = (s / segments) * Math.PI * 2;
      const a1 = ((s + 1) / segments) * Math.PI * 2;
      const squash = 1.12;
      const x0 = Math.cos(a0) * canopyRadius;
      const y0 = Math.sin(a0) * canopyRadius * squash;
      const x1 = Math.cos(a1) * canopyRadius;
      const y1 = Math.sin(a1) * canopyRadius * squash;

      positions.push(cx, canopyCentre, cz, cx + x0, canopyCentre + y0, cz, cx + x1, canopyCentre + y1, cz);
      positions.push(cx, canopyCentre, cz, cx, canopyCentre + y0, cz + x0, cx, canopyCentre + y1, cz + x1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide, fog: false })
  );
}

/**
 * The crowd. At 1.72m each these are the finest scale reference in the
 * scene — what makes a 90-metre formation legible as ninety metres.
 */
function buildCrowd(): THREE.Mesh {
  const positions: number[] = [];
  const random = rand(77712);

  for (let i = 0; i < CROWD_COUNT; i++) {
    const angle = random() * Math.PI * 2;
    // Bias toward the near side, where an audience would actually stand.
    const spread = Math.pow(random(), 0.7);
    const radius = CROWD_INNER + spread * (CROWD_OUTER - CROWD_INNER);
    const cx = Math.cos(angle) * radius;
    const cz = Math.sin(angle) * radius;
    const height = PERSON_HEIGHT * (0.86 + random() * 0.28);
    pushCross(positions, cx, cz, 0.3, 0, height);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide, fog: false })
  );
}

/**
 * Ground that brightens with distance, as a real field does under a lifted
 * night sky. Without this the silhouettes standing on it have nothing to be
 * silhouettes against.
 */
function buildGround(): THREE.Mesh {
  const geometry = new THREE.CircleGeometry(GROUND_RADIUS, 128);
  geometry.rotateX(-Math.PI / 2);

  const material = new THREE.ShaderMaterial({
    fog: false,
    uniforms: {
      uNear: { value: new THREE.Color(0x0b111c) },
      uFar: { value: new THREE.Color(0x222d45) },
      uRadius: { value: GROUND_RADIUS },
    },
    vertexShader: /* glsl */ `
      varying float vDistance;
      void main() {
        vDistance = length(position.xz);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uNear;
      uniform vec3 uFar;
      uniform float uRadius;
      varying float vDistance;
      void main() {
        // Most of the lift happens close in, where the crowd stands.
        float t = pow(clamp(vDistance / (uRadius * 0.25), 0.0, 1.0), 0.6);
        gl_FragColor = vec4(mix(uNear, uFar, t), 1.0);
      }
    `,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = -0.15;
  return mesh;
}

/**
 * The sky.
 *
 * Black overhead, lifting to a dark blue-grey at the horizon. Real night
 * skies are lifted this way by ground light, and it is what makes every
 * silhouette below it readable.
 */
function buildSky(): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(2400, 48, 40);
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      uHorizon: { value: new THREE.Color(0x2b3550) },
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
        // Above the horizon: black overhead lifting to blue-grey at the rim.
        float above = clamp(vAltitude, 0.0, 1.0);
        vec3 sky = mix(uZenith, uHorizon, pow(1.0 - above, 2.0));

        // BELOW the horizon the dome must go dark. The ground plane cannot
        // cover every sight line at every orbit distance, and leaving this
        // at full horizon brightness produced a glowing band beyond the
        // ground's edge that read as a wall of light.
        float below = clamp(-vAltitude * 14.0, 0.0, 1.0);
        gl_FragColor = vec4(mix(sky, uZenith, below), 1.0);
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
  group.add(buildTrees());
  group.add(buildCrowd());
  return group;
}

export const HORIZON_REFERENCE = {
  personHeightM: PERSON_HEIGHT,
  treeHeightRangeM: [TREE_MIN_HEIGHT, TREE_MAX_HEIGHT] as const,
};
