"use client";


// Internal benchmark: Points (the shipped renderer) vs InstancedMesh
// spheres, same drone count, same positions. Not linked anywhere; the
// /internal layout is noindex.
//
//   /internal/swarm-bench?mode=points&n=20000
//   /internal/swarm-bench?mode=instanced&n=20000
//
// Frame cost is the wall time between consecutive frames. On a fast GPU
// that just reads the display's refresh cap, so the meaningful run is
// under a software GPU (scripts: launch Chrome with --use-angle=swiftshader),
// which stands in for a budget phone. The result is written to #result.

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import DroneSwarm, { type SwarmHandle } from "@/components/swarm/DroneSwarm";
import { PROFILES } from "@/components/swarm/quality";
import { cloud } from "@/components/swarm/formations";
import { solidColors } from "@/components/swarm/colors";

function params() {
  if (typeof window === "undefined") return { mode: "points", n: 5000 };
  const q = new URLSearchParams(window.location.search);
  return { mode: q.get("mode") === "instanced" ? "instanced" : "points", n: Number(q.get("n") ?? 5000) };
}

function Probe({ n, label }: { n: number; label: string }) {
  const samples = useRef<number[]>([]);
  const last = useRef(0);
  useFrame(() => {
    const now = performance.now();
    const dt = last.current ? now - last.current : 0;
    last.current = now;
    const s = samples.current;
    if (dt && s.length < 140) s.push(dt);
    if (s.length === 140) {
      const sorted = s.slice(20).sort((a, b) => a - b); // drop warm-up
      const median = sorted[Math.floor(sorted.length / 2)];
      const p95 = sorted[Math.floor(sorted.length * 0.95)];
      const el = document.getElementById("result");
      if (el) el.textContent = `${label} n=${n} median=${median.toFixed(2)}ms p95=${p95.toFixed(2)}ms`;
      s.push(-1);
    }
  });
  return null;
}

function PointsSwarm({ n }: { n: number }) {
  const ref = useRef<SwarmHandle | null>(null);
  const pos = useMemo(() => cloud(n, 160, 80, 60), [n]);
  const col = useMemo(() => solidColors(n, [1, 0.85, 0.6]), [n]);
  useEffect(() => {
    ref.current?.setTransition({ from: pos, to: pos, colorFrom: col, colorTo: col, count: n });
  }, [pos, col, n]);
  return <DroneSwarm ref={ref} capacity={n} quality={{ ...PROFILES.high, trailSteps: 0 }} />;
}

function InstancedSwarm({ n }: { n: number }) {
  const mesh = useRef<THREE.InstancedMesh | null>(null);
  const pos = useMemo(() => cloud(n, 160, 80, 60), [n]);
  useEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const mat = new THREE.Matrix4();
    for (let i = 0; i < n; i++) {
      mat.makeTranslation(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
      m.setMatrixAt(i, mat);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [n, pos]);
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, n]} frustumCulled={false}>
      <icosahedronGeometry args={[0.6, 1]} />
      <meshBasicMaterial color={new THREE.Color(4, 3.2, 2.2)} />
    </instancedMesh>
  );
}

export default function SwarmBench() {
  const { mode, n } = params();
  return (
    <main className="p-6">
      <p id="result" className="font-mono text-sm">measuring…</p>
      <div className="mt-4 h-[70vh] w-full">
        <Canvas dpr={1} camera={{ position: [0, 60, 260], fov: 50, near: 1, far: 4000 }} frameloop="always">
          <Probe n={n} label={mode} />
          {mode === "points" ? <PointsSwarm n={n} /> : <InstancedSwarm n={n} />}
        </Canvas>
      </div>
    </main>
  );
}
