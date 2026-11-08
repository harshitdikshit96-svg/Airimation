"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas, type CanvasProps } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { AgXToneMapping } from "three";
import Effects from "./Effects";
import { detectTier, PROFILES, stepDown, type QualityProfile, type Tier } from "./quality";

type Props = {
  /** The scene, given the active quality profile. */
  children: (quality: QualityProfile) => ReactNode;
  className?: string;
  camera?: CanvasProps["camera"];
  /** False stops the render loop entirely (e.g. home story finished). */
  active?: boolean;
  /** Render once, then only when invalidated (reduced motion). */
  still?: boolean;
  /** Called when WebGL dies (context lost); the parent shows its fallback. */
  onFail?: () => void;
  /** Called after the first frame, so a poster can fade out. */
  onReady?: () => void;
};

/**
 * The shared WebGL host for the home story and the configurator.
 *
 * - Picks a quality tier, then lets drei's PerformanceMonitor step it down
 *   if the device can't hold its frame rate.
 * - Stops rendering when the canvas is off-screen or the tab is hidden.
 * - On context loss, hands control back to the parent's fallback rather
 *   than leaving a black rectangle.
 */
export default function SwarmCanvas({ children, className, camera, active = true, still = false, onFail, onReady }: Props) {
  const [tier, setTier] = useState<Tier>(detectTier);
  const [visible, setVisible] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const wrapper = useRef<HTMLDivElement | null>(null);
  const quality = PROFILES[tier];

  useEffect(() => {
    const el = wrapper.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "64px" });
    io.observe(el);
    const onVis = () => setPageVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const running = active && visible && pageVisible;
  const frameloop = still ? "demand" : running ? "always" : "never";

  return (
    <div ref={wrapper} className={className}>
      <Canvas
        frameloop={frameloop}
        dpr={[1, quality.dpr]}
        camera={camera}
        gl={{ antialias: false, alpha: false, stencil: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          // Only used when drawing straight to screen (no composer).
          gl.toneMapping = AgXToneMapping;
          gl.setClearColor("#03040b", 1);
          gl.domElement.addEventListener("webglcontextlost", (event) => {
            event.preventDefault();
            onFail?.();
          });
          requestAnimationFrame(() => onReady?.());
        }}
      >
        {!still && (
          <PerformanceMonitor
            // Sustained < ~40fps: drop a tier. Once at most twice, then stop
            // flip-flopping and live with it.
            bounds={() => [40, 120]}
            flipflops={2}
            onDecline={() => setTier((t) => stepDown(t))}
          />
        )}
        {children(quality)}
        <Effects quality={quality} />
      </Canvas>
    </div>
  );
}
