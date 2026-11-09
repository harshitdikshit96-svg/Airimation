"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { disposeAudio, isMuted, setMuted, subscribeAudio } from "./audio";

/** Mute toggle. Sound is off until the visitor turns it on. */
export default function SoundToggle({ className = "" }: { className?: string }) {
  const muted = useSyncExternalStore(subscribeAudio, isMuted, () => true);
  useEffect(() => () => disposeAudio(), []);

  return (
    <button
      type="button"
      onClick={() => setMuted(!muted)}
      aria-pressed={!muted}
      aria-label={muted ? "Turn show sound on" : "Turn show sound off"}
      className={`pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-line-2 bg-black/60 text-muted transition hover:text-ink ${className}`}
    >
      {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
    </button>
  );
}
