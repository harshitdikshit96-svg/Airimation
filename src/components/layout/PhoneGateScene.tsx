"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import type { StoryState } from "@/components/home/HomeSwarm";
import { hasWebGL, prefersReducedMotion } from "@/components/swarm/quality";
import { onEngageOrIdle } from "@/components/swarm/defer";
import { isPhone, PHONE_QUERY } from "@/lib/phone";
import { gateBeat } from "./phoneGateStory";

// The home page's scene, at the low tier. Only requested on a phone, after
// the page has loaded and gone idle — a desktop never downloads it.
const HomeSwarm = dynamic(() => import("@/components/home/HomeSwarm"), { ssr: false });

function subscribePhone(cb: () => void) {
  const mq = window.matchMedia(PHONE_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const noopSubscribe = () => () => {};

/**
 * The phone gate's background. First paint is the home poster (a CSS
 * background in globals.css, so only phones fetch it); then the live swarm
 * fades in and plays the home story on a slow loop. The poster stays on
 * reduced motion, without WebGL, or if the GPU context is lost.
 */
export default function PhoneGateScene() {
  // Lit from the start: the poster shows the field already lit.
  const [story] = useState<StoryState>(() => ({ beat: 0, lit: 1, dissolve: 0 }));
  const caption = useRef<HTMLSpanElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const phone = useSyncExternalStore(subscribePhone, isPhone, () => false);
  const capable = useSyncExternalStore(noopSubscribe, () => hasWebGL() && !prefersReducedMotion(), () => false);

  useEffect(() => {
    if (!phone || !capable) return;
    return onEngageOrIdle(() => setMounted(true), 0);
  }, [phone, capable]);

  // Drive the story from the clock once the first frame is up. Paused
  // whenever the gate is hidden (wider screen); rAF itself sleeps in a
  // background tab.
  useEffect(() => {
    if (!ready || !phone) return;
    let raf = 0;
    let start = 0;
    let elapsed = 0;
    const tick = (now: number) => {
      if (!start) start = now - elapsed * 1000;
      elapsed = (now - start) / 1000;
      story.beat = gateBeat(elapsed);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ready, phone, story]);

  const live = mounted && !failed;

  return (
    <div aria-hidden="true" className="phone-gate-poster pointer-events-none absolute inset-0">
      {live && (
        <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}>
          <HomeSwarm
            story={story}
            caption={caption}
            active
            reduced={false}
            tier="low"
            onReady={() => setReady(true)}
            onFail={() => setFailed(true)}
          />
        </div>
      )}
    </div>
  );
}
