"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import type { ShowPlan } from "@/lib/show/types";
import { SwarmRenderer } from "./renderer/SwarmRenderer";

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

/**
 * Probe for WebGL via useSyncExternalStore.
 *
 * Not a lazy useState initialiser: that returns false on the server (no
 * document) and true in the browser, so the prerendered fallback markup
 * never matches the client's <canvas> and React throws a hydration error.
 * useSyncExternalStore renders the server snapshot during hydration, then
 * re-renders with the real value if it differs — no mismatch. It also
 * avoids useEffect + setState, which this project's eslint config forbids
 * (react-hooks `set-state-in-effect`).
 *
 * The probe result is cached: getSnapshot runs on every render and must
 * return a stable value without creating a new canvas each time.
 */
let webglSupport: boolean | null = null;

function detectWebGL(): boolean {
  if (webglSupport !== null) return webglSupport;
  try {
    const probe = document.createElement("canvas");
    webglSupport = Boolean(probe.getContext("webgl2") || probe.getContext("webgl"));
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

const subscribeNoop = () => () => {};
// Assume support on the server; nearly every visitor has WebGL, so the
// prerendered <canvas> is right for them and only the rare fallback swaps.
const serverSnapshot = () => true;

/**
 * React wrapper around SwarmRenderer.
 *
 * The renderer owns per-frame state (time, positions, camera); React owns
 * only what a human changes. Nothing that updates at 60fps enters React
 * state.
 */
export default function ShowStage({
  plan,
  playing,
  className,
  onStageChange,
  seekRequest,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<SwarmRenderer | null>(null);
  const stageCallbackRef = useRef(onStageChange);
  const supported = useSyncExternalStore(subscribeNoop, detectWebGL, serverSnapshot);

  // Keep the latest callback reachable from the renderer without tearing
  // down and rebuilding the WebGL context every time the parent re-renders.
  useEffect(() => {
    stageCallbackRef.current = onStageChange;
  }, [onStageChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !supported) return;

    let renderer: SwarmRenderer;
    try {
      renderer = new SwarmRenderer(canvas, {
        onStageChange: (label) => stageCallbackRef.current?.(label),
      });
    } catch (error) {
      console.error("[show] renderer failed to start:", error);
      return;
    }
    rendererRef.current = renderer;

    const observer = new ResizeObserver(() => renderer.resize());
    observer.observe(canvas);

    return () => {
      observer.disconnect();
      renderer.dispose();
      rendererRef.current = null;
    };
  }, [supported]);

  useEffect(() => {
    if (plan) rendererRef.current?.setPlan(plan);
  }, [plan]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    if (playing) renderer.play();
    else renderer.pause();
  }, [playing]);

  useEffect(() => {
    if (!seekRequest) return;
    rendererRef.current?.seekToStage(seekRequest.index);
  }, [seekRequest]);

  if (!supported) {
    return (
      <div className={className}>
        <p className="p-6 text-sm">
          This browser can&apos;t run the 3D preview. Everything else on the page still
          works, and we can send you a recording instead.
        </p>
      </div>
    );
  }

  return <canvas ref={canvasRef} className={className} />;
}
