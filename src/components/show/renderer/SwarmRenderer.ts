// The three.js renderer for the show configurator.
//
// A plain class, not a React component. Positions change 60 times a second;
// routing that through React reconciliation would be the single worst
// decision available. ShowStage.tsx owns an instance via a ref and forwards
// prop changes as method calls.
//
// Raw three.js rather than react-three-fiber: the scene is two Points
// objects, a horizon group and a camera. R3F's declarative composition
// solves a problem this scene does not have, and the rest of this codebase
// already animates imperatively with requestAnimationFrame.

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { ShowPlan } from "@/lib/show/types";
import { CAMERA, TIMING } from "@/lib/show/constants";
import { buildHorizon } from "./horizon";
import { patternFor, type ColorPattern } from "@/components/swarm/patterns";
import { pointFragmentShader, pointVertexShader } from "./shaders";

/**
 * Buffers are allocated once at the maximum supported count and drawn with
 * setDrawRange. Changing drone count mid-playback then costs nothing —
 * no reallocation, no GC pause — which is what makes the comparison feature
 * feel instant. That comparison is the product's core value, so it gets the
 * allocation strategy built around it.
 */
const MAX_DRONES = 500;

export type RendererCallbacks = {
  onStageChange?: (label: string, index: number) => void;
  onProgress?: (fraction: number) => void;
};

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export class SwarmRenderer {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;

  private positions = new Float32Array(MAX_DRONES * 3);
  private colors = new Float32Array(MAX_DRONES * 3);
  /** Stable per-drone random value, used by colour patterns. */
  private noise = new Float32Array(MAX_DRONES);
  /** Vertical extent of the current stage, for height-based colour ramps. */
  private stageMinY = 0;
  private stageSpanY = 1;
  private colorPattern: ColorPattern = patternFor("__ground");
  private geometry: THREE.BufferGeometry;
  private halo: THREE.Points;
  private core: THREE.Points;
  /** Per-drone transition delay as a fraction of the stagger window. */
  private stagger = new Float32Array(MAX_DRONES);

  private plan: ShowPlan | null = null;
  private droneCount = 0;
  private timeMs = 0;
  private playing = false;
  private lastFrame = 0;
  private frameHandle = 0;
  private lastStageIndex = -1;
  private disposed = false;

  constructor(
    private canvas: HTMLCanvasElement,
    private callbacks: RendererCallbacks = {}
  ) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false, // multisampling off — additive points do not need it
      alpha: false,
      powerPreference: "high-performance",
    });
    // Capping at 2 is the cheapest single mobile win available; beyond that
    // almost nobody can see the difference and fill rate collapses.
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(0x000000, 1);

    this.scene = new THREE.Scene();
    // No scene fog. The horizon elements are the scale reference and must
    // stay crisp at 200m+; fog was quietly dissolving exactly the thing they
    // exist to provide. Depth cueing comes from point-size attenuation.
    this.scene.fog = null;

    // Far plane must clear the sky dome (radius 2400) and the ground disc,
    // or the dome gets clipped and the hole reads as a black rounded
    // rectangle hanging over the scene.
    this.camera = new THREE.PerspectiveCamera(CAMERA.fov, 1, 1, 6000);
    this.camera.position.set(0, CAMERA.eyeHeight, CAMERA.distance);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.target.set(0, CAMERA.targetAltitude, 0);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.enablePan = false;
    this.controls.minDistance = CAMERA.minDistance;
    this.controls.maxDistance = CAMERA.maxDistance;
    this.controls.minPolarAngle = THREE.MathUtils.degToRad(CAMERA.minPolarAngleDeg);
    // maxPolarAngle is recomputed every frame — see clampOrbit().
    this.controls.update();

    this.scene.add(buildHorizon());

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute("aColor", new THREE.BufferAttribute(this.colors, 3));
    this.geometry.setDrawRange(0, 0);

    this.halo = new THREE.Points(this.geometry, this.makeMaterial(26, 0.34, 1.0, 2, 26));
    this.core = new THREE.Points(this.geometry, this.makeMaterial(9, 0.95, 0.0, 1.1, 5));
    this.scene.add(this.halo);
    this.scene.add(this.core);

    // Deterministic per-drone stagger, so the swarm flows into formation
    // instead of snapping as one rigid block.
    for (let i = 0; i < MAX_DRONES; i++) {
      this.stagger[i] = ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1;
      this.noise[i] = ((Math.sin(i * 78.233 + 4.1) * 24634.6345) % 1 + 1) % 1;
      // Start white so the very first frame is never black.
      this.colors[i * 3] = 1;
      this.colors[i * 3 + 1] = 1;
      this.colors[i * 3 + 2] = 1;
    }

    this.resize();
    this.loop = this.loop.bind(this);
    this.frameHandle = requestAnimationFrame(this.loop);
  }

  /**
   * Keep the camera above ground by adjusting the POLAR LIMIT, not by moving
   * the camera afterwards.
   *
   * The previous version clamped `camera.position.y` after
   * `controls.update()`, which fought OrbitControls' own state: the controls
   * kept trying to go lower, the clamp kept pushing back, and the orbit
   * felt locked and sticky near the bottom of its range. Expressing the
   * constraint as a limit the controls themselves respect removes the
   * conflict — and because the limit depends on how far out you are zoomed,
   * it has to be recomputed rather than fixed at one angle.
   *
   *   camera.y = targetY + radius * cos(polar)
   *   so the lowest legal polar is acos((minEye - targetY) / radius)
   */
  private clampOrbit() {
    const radius = this.camera.position.distanceTo(this.controls.target);
    const ratio = (CAMERA.minEyeHeight - this.controls.target.y) / Math.max(radius, 1);
    this.controls.maxPolarAngle = Math.acos(THREE.MathUtils.clamp(ratio, -1, 1));
  }

  /** color white; softness 1 = wide halo, 0 = hard core. */
  private makeMaterial(
    size: number,
    opacity: number,
    softness: number,
    minPixels: number,
    maxPixels: number
  ): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      uniforms: {
        uSize: { value: size },
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
        uMinPixels: { value: minPixels },
        uMaxPixels: { value: maxPixels },
        uOpacity: { value: opacity },
        uSoftness: { value: softness },
      },
      vertexShader: pointVertexShader,
      fragmentShader: pointFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }

  setPlan(plan: ShowPlan) {
    this.plan = plan;
    this.droneCount = Math.min(plan.droneCount, MAX_DRONES);
    this.geometry.setDrawRange(0, this.droneCount);
    this.lastStageIndex = -1;
    if (this.timeMs > plan.totalDurationMs) this.timeMs = 0;
  }

  play() {
    this.playing = true;
    this.lastFrame = performance.now();
  }

  pause() {
    this.playing = false;
  }

  isPlaying() {
    return this.playing;
  }

  seek(ms: number) {
    if (!this.plan) return;
    this.timeMs = Math.max(0, Math.min(ms, this.plan.totalDurationMs));
  }

  /** Jump to the moment a given stage is fully assembled. */
  seekToStage(index: number) {
    if (!this.plan) return;
    const stage = this.plan.stages[index];
    if (!stage) return;
    this.timeMs = stage.startMs + stage.assembleMs;
  }

  resize() {
    const width = this.canvas.clientWidth || 1;
    const height = this.canvas.clientHeight || 1;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frameHandle);
    this.controls.dispose();
    this.geometry.dispose();
    (this.halo.material as THREE.Material).dispose();
    (this.core.material as THREE.Material).dispose();
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        (obj.material as THREE.Material).dispose();
      }
    });
    this.renderer.dispose();
  }

  private loop(now: number) {
    if (this.disposed) return;
    this.frameHandle = requestAnimationFrame(this.loop);

    if (this.playing && this.plan) {
      const delta = Math.min(now - this.lastFrame, 100); // clamp tab-switch jumps
      this.timeMs = (this.timeMs + delta) % this.plan.totalDurationMs;
    }
    this.lastFrame = now;

    this.updatePositions();
    this.clampOrbit();
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Compute every drone's position for the current instant, directly from
   * the two bracketing formations. No precomputed trajectory table exists
   * at any point — this is the "generate, don't store" decision in practice.
   */
  private updatePositions() {
    const plan = this.plan;
    if (!plan || plan.stages.length === 0) return;

    let index = 0;
    for (let i = 0; i < plan.stages.length; i++) {
      if (this.timeMs >= plan.stages[i].startMs) index = i;
      else break;
    }

    const stage = plan.stages[index];
    const previous = plan.stages[index - 1] ?? stage;
    const elapsed = this.timeMs - stage.startMs;
    const assembling = stage.assembleMs > 0 && elapsed < stage.assembleMs;

    if (index !== this.lastStageIndex) {
      this.lastStageIndex = index;
      this.colorPattern = patternFor(stage.id);
      // Vertical extent of this formation, so height-based colour ramps
      // (petal tip vs. base, flame vs. bowl) land in the right places
      // regardless of how tall the formation happens to be.
      let min = Infinity;
      let max = -Infinity;
      for (let i = 1; i < this.droneCount * 3; i += 3) {
        const y = stage.targets[i];
        if (y < min) min = y;
        if (y > max) max = y;
      }
      this.stageMinY = min;
      this.stageSpanY = Math.max(max - min, 1);
      this.callbacks.onStageChange?.(stage.label, index);
    }
    this.callbacks.onProgress?.(this.timeMs / plan.totalDurationMs);

    const n = this.droneCount;

    if (!assembling) {
      this.positions.set(stage.targets.subarray(0, n * 3));
      (this.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      this.updateColors();
      return;
    }

    const staggerWindow = stage.assembleMs * TIMING.staggerFraction;
    const travelWindow = stage.assembleMs - staggerWindow;

    for (let i = 0; i < n; i++) {
      const delay = this.stagger[i] * staggerWindow;
      const raw = (elapsed - delay) / travelWindow;
      const p = easeInOutCubic(Math.max(0, Math.min(1, raw)));

      const o = i * 3;
      const fromX = previous.targets[o];
      const fromY = previous.targets[o + 1];
      const fromZ = previous.targets[o + 2];
      const toX = stage.targets[o];
      const toY = stage.targets[o + 1];
      const toZ = stage.targets[o + 2];

      this.positions[o] = fromX + (toX - fromX) * p;
      // Arc the path upward mid-flight: fewer apparent collisions, and it
      // matches how a real swarm moves between formations.
      this.positions[o + 1] =
        fromY + (toY - fromY) * p + Math.sin(p * Math.PI) * TIMING.arcHeight;
      this.positions[o + 2] = fromZ + (toZ - fromZ) * p;
    }

    (this.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    this.updateColors();
  }

  /**
   * Recompute LED colour for every drone. Runs each frame so patterns can
   * animate — sweeps, flicker, a slow hue drift. At 200 drones this is 200
   * cheap function calls, which is nothing next to the render itself.
   */
  private updateColors() {
    const n = this.droneCount;
    const seconds = this.timeMs / 1000;

    for (let i = 0; i < n; i++) {
      const o = i * 3;
      const x = this.positions[o];
      const y = this.positions[o + 1];
      const z = this.positions[o + 2];
      const [r, g, b] = this.colorPattern({
        i,
        n,
        x,
        y,
        z,
        t: seconds,
        r: this.noise[i],
        h: Math.max(0, Math.min(1, (y - this.stageMinY) / this.stageSpanY)),
      });
      this.colors[o] = r;
      this.colors[o + 1] = g;
      this.colors[o + 2] = b;
    }

    (this.geometry.attributes.aColor as THREE.BufferAttribute).needsUpdate = true;
  }
}
