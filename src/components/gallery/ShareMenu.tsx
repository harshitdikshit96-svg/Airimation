"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Download, Link2, MessageCircle, Share2, Video } from "lucide-react";
import { clipMime, recordClip, type Clip } from "./recordClip";
import { trackClip, trackShare } from "@/lib/analytics";

/**
 * Share on Design a Show (docs/seo/PLAN.md, P3 + P5): the link to what is on
 * screen — /design-your-show/<formation>?fleet=<n>&hues=<theme> — by the
 * phone's share sheet, WhatsApp or a copied link, and a 10-second clip of
 * the live sky to save or share. Every message says "concept".
 */
const CLIP_SECONDS = 10;

const ITEM =
  "flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left font-mono text-xs text-muted transition-colors hover:bg-white/5 hover:text-ink focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-amber disabled:pointer-events-none disabled:opacity-40";

export default function ShareMenu({
  id,
  label,
  count,
  hues,
  canvas,
}: {
  id: string;
  label: string;
  count: number;
  hues: string;
  /** The live sky's WebGL canvas, for the clip. */
  canvas: () => HTMLCanvasElement | null;
}) {
  const [open, setOpen] = useState(false);
  // The copied link and the clip belong to one show (formation, fleet,
  // hues); change any of them and they no longer apply.
  const key = `${id}:${count}:${hues}`;
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copied = copiedKey === key;
  const [recording, setRecording] = useState<number | null>(null);
  const [saved, setSaved] = useState<{ key: string; url: string; file: File } | null>(null);
  const clip = saved?.key === key ? saved : null;
  const [error, setError] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const [canRecord] = useState(() => clipMime() !== null);
  const [canShareSheet] = useState(() => typeof navigator !== "undefined" && typeof navigator.share === "function");

  const drones = count.toLocaleString("en-IN");
  const url = () => `${window.location.origin}/design-your-show/${id}?fleet=${count}&hues=${hues}`;
  const text = `${label} in ${drones} drones: a concept drone light show I put together on Airimation's Design a Show.`;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url());
      setCopiedKey(key);
      trackShare("copy", id);
    } catch {
      window.prompt("Copy this link:", url());
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title: `${label} — Airimation Design a Show`, text, url: url() });
      trackShare("native", id);
    } catch {
      /* dismissed */
    }
  };

  const record = async () => {
    const source = canvas();
    if (!source) return;
    setError(null);
    setRecording(CLIP_SECONDS);
    try {
      const result: Clip = await recordClip(source, {
        seconds: CLIP_SECONDS,
        title: label,
        caption: `Concept render · ${drones} drones`,
        onProgress: setRecording,
      });
      const file = new File([result.blob], `airimation-${id}-${count}.${result.ext}`, { type: result.blob.type });
      setSaved((old) => {
        if (old) URL.revokeObjectURL(old.url);
        return { key, url: URL.createObjectURL(file), file };
      });
      trackClip("record", id, count);
    } catch (err) {
      setError((err as Error).message || "Recording failed.");
    } finally {
      setRecording(null);
    }
  };

  const shareClip = async () => {
    if (!clip) return;
    try {
      await navigator.share({ files: [clip.file], title: label, text: `${text} ${url()}` });
      trackClip("share", id, count);
    } catch {
      /* dismissed or unsupported */
    }
  };
  const canShareClip = clip !== null && typeof navigator.canShare === "function" && navigator.canShare({ files: [clip.file] });

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line-2 px-5 font-mono text-xs text-muted transition-colors hover:border-amber hover:text-amber-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
      >
        <Share2 size={14} aria-hidden="true" />
        {recording !== null ? `Recording ${recording}s` : "Share"}
      </button>
      {open && (
        <div
          role="group"
          aria-label="Share this show"
          data-share-menu=""
          className="absolute bottom-full right-0 z-20 mb-2 w-[260px] rounded-xl border border-line-2 bg-navy/95 p-2 shadow-2xl"
        >
          {canShareSheet && (
            <button type="button" className={ITEM} onClick={nativeShare}>
              <Share2 size={14} aria-hidden="true" /> Share…
            </button>
          )}
          <a
            className={ITEM}
            href={`https://wa.me/?text=${encodeURIComponent(`${text} ${typeof window === "undefined" ? "" : url()}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackShare("whatsapp", id)}
          >
            <MessageCircle size={14} aria-hidden="true" /> WhatsApp
          </a>
          <button type="button" className={ITEM} onClick={copy}>
            {copied ? <Check size={14} aria-hidden="true" /> : <Link2 size={14} aria-hidden="true" />}
            {copied ? "Link copied" : "Copy link"}
          </button>
          {canRecord && (
            <div className="mt-1 border-t border-line pt-1">
              {!clip ? (
                <button type="button" className={ITEM} onClick={record} disabled={recording !== null}>
                  <Video size={14} aria-hidden="true" />
                  {recording !== null ? `Recording… ${recording}s` : `Save a ${CLIP_SECONDS}-second clip`}
                </button>
              ) : (
                <>
                  <a className={ITEM} href={clip.url} download={clip.file.name} onClick={() => trackClip("download", id, count)}>
                    <Download size={14} aria-hidden="true" /> Download clip
                  </a>
                  {canShareClip && (
                    <button type="button" className={ITEM} onClick={shareClip}>
                      <Share2 size={14} aria-hidden="true" /> Share clip
                    </button>
                  )}
                </>
              )}
              {error && <p className="px-3 py-1 text-[11px] text-dim">{error}</p>}
            </div>
          )}
          <p className="px-3 pb-1 pt-2 text-[11px] leading-snug text-dim">Concept render, simulated — not show footage.</p>
        </div>
      )}
    </div>
  );
}
