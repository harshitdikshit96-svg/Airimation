// "Save a clip" on Design a Show (docs/seo/PLAN.md, P5): records a few
// seconds of the live sky, centre-cropped and watermarked, as a video the
// visitor can post to Reels or WhatsApp Status. Everything happens in the
// browser; nothing is uploaded.
//
// HOW: after R3F renders each frame (a global after-effect, same task as
// the render, so the WebGL drawing buffer is still intact without
// `preserveDrawingBuffer`), the frame is copied into a 2D canvas with the
// watermark on top; that canvas's captureStream() feeds a MediaRecorder.
// MP4 (H.264) where the browser can record it (Safari, Chrome 126+),
// otherwise WebM.

import { addAfterEffect } from "@react-three/fiber";

const MIME_PREFERENCE = [
  "video/mp4;codecs=avc1.42E01E",
  "video/mp4",
  "video/webm;codecs=vp9",
  "video/webm;codecs=vp8",
  "video/webm",
];

export function clipMime(): string | null {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") return null;
  if (typeof HTMLCanvasElement.prototype.captureStream !== "function") return null;
  return MIME_PREFERENCE.find((m) => MediaRecorder.isTypeSupported(m)) ?? null;
}

/**
 * Crop box for a source of `w` × `h`: centred, its aspect clamped between
 * 4:5 (portrait phones) and 16:9 (the wide desktop sky), output at most
 * 1280 px on the long side, even dimensions (H.264 needs them).
 */
export function clipFrame(w: number, h: number) {
  const aspect = Math.min(16 / 9, Math.max(4 / 5, w / h));
  let cw = w;
  let ch = h;
  if (w / h > aspect) cw = Math.round(h * aspect);
  else ch = Math.round(w / aspect);
  const k = Math.min(1, 1280 / Math.max(cw, ch));
  const even = (v: number) => Math.max(2, Math.round(v / 2) * 2);
  return { sx: Math.round((w - cw) / 2), sy: Math.round((h - ch) / 2), sw: cw, sh: ch, width: even(cw * k), height: even(ch * k) };
}

export type Clip = { blob: Blob; ext: "mp4" | "webm" };

export async function recordClip(
  source: HTMLCanvasElement,
  { seconds, title, caption, onProgress }: { seconds: number; title: string; caption: string; onProgress?: (left: number) => void }
): Promise<Clip> {
  const mime = clipMime();
  if (!mime) throw new Error("This browser can't record video.");
  const box = clipFrame(source.width, source.height);
  const out = document.createElement("canvas");
  out.width = box.width;
  out.height = box.height;
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("No 2D canvas.");

  const pad = Math.round(out.height * 0.04);
  const big = Math.max(14, Math.round(out.height * 0.045));
  const small = Math.max(11, Math.round(out.height * 0.026));
  const shade = ctx.createLinearGradient(0, out.height * 0.7, 0, out.height);
  shade.addColorStop(0, "rgba(3,4,11,0)");
  shade.addColorStop(1, "rgba(3,4,11,0.75)");

  const draw = () => {
    ctx.drawImage(source, box.sx, box.sy, box.sw, box.sh, 0, 0, out.width, out.height);
    ctx.fillStyle = shade;
    ctx.fillRect(0, out.height * 0.7, out.width, out.height * 0.3);
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#f2f2f0";
    ctx.font = `400 ${big}px "IBM Plex Serif", Georgia, serif`;
    ctx.fillText(title, pad, out.height - pad - small * 1.6);
    ctx.fillStyle = "#c9c9c4";
    ctx.font = `400 ${small}px "IBM Plex Mono", ui-monospace, monospace`;
    ctx.fillText(caption, pad, out.height - pad);
    ctx.textAlign = "right";
    ctx.fillStyle = "#f0c878";
    ctx.fillText("airimation.in", out.width - pad, out.height - pad);
    ctx.textAlign = "left";
  };

  draw();
  const unsubscribe = addAfterEffect(draw);
  const stream = out.captureStream(30);
  const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6_000_000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size) chunks.push(e.data);
  };
  const stopped = new Promise<void>((resolve) => (recorder.onstop = () => resolve()));
  recorder.start(250);
  try {
    for (let left = seconds; left > 0; left--) {
      onProgress?.(left);
      await new Promise((r) => setTimeout(r, 1000));
    }
  } finally {
    if (recorder.state !== "inactive") recorder.stop();
    await stopped;
    unsubscribe();
    stream.getTracks().forEach((t) => t.stop());
  }
  const type = mime.split(";")[0];
  return { blob: new Blob(chunks, { type }), ext: type === "video/mp4" ? "mp4" : "webm" };
}
