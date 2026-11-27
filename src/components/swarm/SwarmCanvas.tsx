"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useThree, type CanvasProps } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { AgXToneMapping, NeutralToneMapping } from "three";
import Effects, { type ToneMap } from "./Effects";
import { detectTier, MAX_FPS, qualityOverride, mergeProfile, stepDown, type QualityProfile, type Tier } from "./quality";

/**
 * Drives a `frameloop="demand"` canvas at no more than `fps`. On a 60 Hz
 * screen that is every frame; on a 120 Hz ProMotion screen it halves the
 * GPU work, which on a laptop is the difference between smooth and hot.
 */
function FrameLimiter({ fps }: { fps: number }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    let raf = 0;
    let last = 0;
    // A little slack so a 60 Hz display, whose rAF ticks land at ~16.6ms
    // with jitter, never skips a frame.
    const interval = 1000 / fps - 2;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - last >= interval) {
        last = now;
        invalidate();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [fps, invalidate]);
  return null;
}

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
  /** Called once the canvas is live, with the content tier it chose (for analytics). */
  onReady?: (tier: Tier) => void;
  /** Fixed starting tier (the phone gate uses "low"); `?quality=` still wins. */
  tier?: Tier;
  /**
   * "agx" (default): filmic, the home look — bright colours roll off to
   * white. "neutral" (Khronos PBR Neutral): keeps each colour's hue and
   * saturation, for scenes where per-drone colour must read (Design a Show).
   */
  toneMapping?: ToneMap;
  /** Bloom strength multiplier (default 1, the home look). */
  bloom?: number;
};

/**
 * The shared WebGL host for the home story and the configurator.
 *
 * - Picks a quality tier once for the scene's CONTENT (drone count, stars,
 *   reflection) and never changes it; drei's PerformanceMonitor only steps
 *   the RENDER cost (DPR, then bloom) down if frames are slow, so a
 *   step-down never rebuilds buffers or recompiles the swarm mid-scroll.
 * - Caps the frame rate at MAX_FPS.
 * - Stops rendering when the canvas is off-screen or the tab is hidden.
 * - On context loss, hands control back to the parent's fallback rather
 *   than leaving a black rectangle.
 */
export default function SwarmCanvas({ children, className, camera, active = true, still = false, onFail, onReady, tier, toneMapping = "agx", bloom = 1 }: Props) {
  // Content tier: chosen once. Render tier: stepped down at runtime.
  const [contentTier] = useState<Tier>(() => (tier ? (qualityOverride() ?? tier) : detectTier()));
  const [renderTier, setRenderTier] = useState<Tier>(contentTier);
  const [visible, setVisible] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const wrapper = useRef<HTMLDivElement | null>(null);
  const quality = useMemo(() => mergeProfile(contentTier, renderTier), [contentTier, renderTier]);

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
  // "demand" + FrameLimiter instead of "always": same animation, capped rate.
  const frameloop = still ? "demand" : running ? "demand" : "never";

  return (
    <div ref={wrapper} className={className}>
      <Canvas
        frameloop={frameloop}
        dpr={[1, quality.dpr]}
        camera={camera}
        gl={{ antialias: false, alpha: false, stencil: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          // Only used when drawing straight to screen (no composer).
          gl.toneMapping = toneMapping === "neutral" ? NeutralToneMapping : AgXToneMapping;
          gl.setClearColor("#03040b", 1);
          gl.domElement.addEventListener("webglcontextlost", (event) => {
            event.preventDefault();
            onFail?.();
          });
          requestAnimationFrame(() => onReady?.(contentTier));
        }}
      >
        {!still && (
          <PerformanceMonitor
            // Sustained < ~40fps: drop a tier. Once at most twice, then stop
            // flip-flopping and live with it.
            bounds={() => [40, 120]}
            flipflops={2}
            onDecline={() => setRenderTier((t) => stepDown(t))}
          />
        )}
        {running && !still && <FrameLimiter fps={MAX_FPS} />}
        {children(quality)}
        <Effects quality={quality} toneMapping={toneMapping} bloom={bloom} />
      </Canvas>
    </div>
  );
}
