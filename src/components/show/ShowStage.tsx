"use client";

import { Suspense, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import type { ShowPlan } from "@/lib/show/types";
import { CAMERA, SHOW_CENTRE_ALTITUDE, TIMING } from "@/lib/show/constants";
import SwarmCanvas from "@/components/swarm/SwarmCanvas";
import DroneSwarm, { type SwarmHandle } from "@/components/swarm/DroneSwarm";
import { Crowd, DuskFog, Ground, SkyDome, Stars } from "@/components/swarm/Environment";
import Skyline from "@/components/swarm/Skyline";
import { stageColors } from "@/components/swarm/colors";
import { radialDelays } from "@/components/swarm/match";
import { hasWebGL } from "@/components/swarm/quality";
import { whoosh } from "@/components/swarm/audio";

/** Largest fleet the configurator offers; buffers are sized once to this. */
const CAPACITY = 300;

type Props = {
  plan: ShowPlan | null;
  playing: boolean;
  className?: string;
  onStageChange?: (label: string) => void;
  /**
   * Ask the renderer to jump to a formation. `nonce` exists so that asking
   * for the SAME stage twice still fires — a bare index would be an
   * unchanged prop the effect ignores.
   */
  seekRequest?: { index: number; nonce: number } | null;
};

const noopSubscribe = () => () => {};

function ShowScene({
  plan,
  playing,
  onStageChange,
  seekRequest,
  quality,
}: Omit<Props, "className"> & { quality: Parameters<typeof DroneSwarm>[0]["quality"] }) {
  const swarm = useRef<SwarmHandle | null>(null);
  const controls = useRef<OrbitControlsImpl | null>(null);
  const clock = useRef({ timeMs: 0, stageIndex: -1, plan: null as ShowPlan | null, motion: 0 });
  const stageCallback = useRef(onStageChange);
  useEffect(() => {
    stageCallback.current = onStageChange;
  }, [onStageChange]);

  // Per-stage colours, computed once per plan (and palette).
  const colors = useMemo(() => {
    if (!plan) return [];
    return plan.stages.map((s) => stageColors(s.id, s.targets, plan.droneCount, plan.recipe.p));
  }, [plan]);

  // Lift-off ripples out from the middle of the launch grid.
  const liftDelays = useMemo(
    () => (plan ? radialDelays(plan.stages[0].targets, plan.droneCount) : undefined),
    [plan]
  );

  useEffect(() => {
    if (!seekRequest || !plan) return;
    const stage = plan.stages[seekRequest.index];
    if (stage) clock.current.timeMs = stage.startMs + stage.assembleMs;
  }, [seekRequest, plan]);

  useFrame((state, delta) => {
    const api = swarm.current;
    const c = clock.current;
    if (!api || !plan || plan.stages.length === 0) return;

    if (c.plan !== plan) {
      // New plan (fleet size, palette, formations): keep the playhead.
      c.plan = plan;
      c.stageIndex = -1;
      if (c.timeMs > plan.totalDurationMs) c.timeMs = 0;
    }
    if (playing) c.timeMs = (c.timeMs + Math.min(delta * 1000, 100)) % plan.totalDurationMs;

    let index = 0;
    for (let i = 0; i < plan.stages.length; i++) {
      if (c.timeMs >= plan.stages[i].startMs) index = i;
      else break;
    }
    const stage = plan.stages[index];
    const previous = plan.stages[index - 1] ?? stage;

    if (index !== c.stageIndex) {
      api.setTransition({
        from: previous.targets,
        to: stage.targets,
        colorFrom: colors[index - 1] ?? colors[index],
        colorTo: colors[index],
        delays: index === 1 ? liftDelays : undefined,
        count: plan.droneCount,
      });
      if (c.stageIndex !== -1 && stage.assembleMs > 0) whoosh();
      c.stageIndex = index;
      stageCallback.current?.(stage.label);
    }

    const elapsed = c.timeMs - stage.startMs;
    const assembling = stage.assembleMs > 0 && elapsed < stage.assembleMs;
    const u = api.uniforms;
    u.uProgress.value = assembling ? elapsed / stage.assembleMs : 1;
    u.uStagger.value = index === 1 ? 0.45 : TIMING.staggerFraction * 2;
    u.uArc.value = index === 1 ? 0 : TIMING.arcHeight;
    u.uTime.value = state.clock.elapsedTime;
    u.uLit.value = 1;
    u.uDissolve.value = 0;
    c.motion += ((assembling ? 1 : 0) - c.motion) * 0.08;
    u.uMotion.value = c.motion;
    u.uCentre.value.set(0, SHOW_CENTRE_ALTITUDE, 0);

    // Keep the eye above ground by limiting the orbit's polar angle (a
    // limit OrbitControls respects), rather than fighting it by moving
    // the camera after the fact. Depends on zoom, so recomputed per frame.
    const ctl = controls.current;
    if (ctl) {
      const radius = ctl.object.position.distanceTo(ctl.target);
      const ratio = (CAMERA.minEyeHeight - ctl.target.y) / Math.max(radius, 1);
      ctl.maxPolarAngle = Math.acos(THREE.MathUtils.clamp(ratio, -1, 1));
    }
  });

  return (
    <>
      <SkyDome />
      <Stars count={quality.stars} />
      <DuskFog />
      <Ground />
      <Crowd />
      <Suspense fallback={null}>
        <Skyline part="ring" lightGain={1.6} />
      </Suspense>
      <DroneSwarm ref={swarm} capacity={CAPACITY} quality={quality} size={2.1} />
      <OrbitControls
        ref={controls}
        target={[0, CAMERA.targetAltitude, 0]}
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        minDistance={CAMERA.minDistance}
        maxDistance={CAMERA.maxDistance}
        minPolarAngle={THREE.MathUtils.degToRad(CAMERA.minPolarAngleDeg)}
        makeDefault
      />
    </>
  );
}

/**
 * The configurator's 3D stage: the shared swarm module driven by a show
 * plan's clock instead of by scroll. Same props as before the R3F port,
 * so ShowConfigurator and the internal show-lab didn't change.
 */
export default function ShowStage({ className, ...props }: Props) {
  const supported = useSyncExternalStore(noopSubscribe, hasWebGL, () => true);
  const [failed, setFailed] = useState(false);

  if (!supported || failed) {
    return (
      <div className={className}>
        <p className="p-6 text-sm">
          This browser can&apos;t run the 3D preview. Everything else on the page still
          works, and we can send you a recording instead.
        </p>
      </div>
    );
  }

  return (
    <SwarmCanvas
      className={className}
      camera={{ position: [0, CAMERA.eyeHeight, CAMERA.distance], fov: CAMERA.fov, near: 1, far: 6000 }}
      onFail={() => setFailed(true)}
    >
      {(quality) => <ShowScene {...props} quality={quality} />}
    </SwarmCanvas>
  );
}
