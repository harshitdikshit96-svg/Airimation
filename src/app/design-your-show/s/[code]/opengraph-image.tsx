import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { decodeRecipe, defaultRecipe } from "@/lib/show/recipe";
import { generateShow } from "@/lib/show/generate";
import { describeRecipe } from "@/lib/show/summary";
import { stageColors } from "@/components/swarm/colors";

// The link preview for a shared show (WhatsApp, iMessage, Slack, X).
// It draws the visitor's actual formations as dot thumbnails, computed
// from the same deterministic generators the 3D preview uses, plus the
// fleet size. Text formations need a browser canvas to sample, so they
// appear as the words themselves.

export const alt = "A drone light show designed with Airimation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const THUMB = 176;
const MAX_DOTS = 170;

function toSrgb(c: number) {
  return Math.round(255 * Math.min(1, Math.pow(Math.max(c, 0), 1 / 2.2)));
}

type Dot = { x: number; y: number; color: string };

/**
 * Seen from slightly above the audience's eye line: a straight front view
 * would flatten level formations (a ring, a wave) into a line.
 */
const lift = (targets: Float32Array, i: number) => targets[i * 3 + 1] - targets[i * 3 + 2] * 0.45;

function thumbnailDots(targets: Float32Array, colors: Float32Array, n: number): Dot[] {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < n; i++) {
    const x = targets[i * 3], y = lift(targets, i);
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  const span = Math.max(maxX - minX, maxY - minY, 1);
  const pad = 14;
  const scale = (THUMB - pad * 2) / span;
  const offX = (THUMB - (maxX - minX) * scale) / 2;
  const offY = (THUMB - (maxY - minY) * scale) / 2;
  const step = Math.max(1, Math.ceil(n / MAX_DOTS));
  const dots: Dot[] = [];
  for (let i = 0; i < n; i += step) {
    dots.push({
      x: offX + (targets[i * 3] - minX) * scale,
      // Screen y grows downward; altitude grows up.
      y: offY + (maxY - lift(targets, i)) * scale,
      color: `rgb(${toSrgb(colors[i * 3])},${toSrgb(colors[i * 3 + 1])},${toSrgb(colors[i * 3 + 2])})`,
    });
  }
  return dots;
}

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const recipe = decodeRecipe(code) ?? defaultRecipe();
  const summary = describeRecipe(recipe);
  const plan = generateShow(recipe);

  const [serif, mono] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/ibm-plex-serif-latin-400-normal.woff")),
    readFile(join(process.cwd(), "assets/fonts/ibm-plex-mono-latin-400-normal.woff")),
  ]);

  const tiles = recipe.s.map((id, k) => {
    const stage = plan.stages.find((s) => s.id === id);
    if (!stage) return { key: `${id}-${k}`, label: summary.formations[k], dots: null };
    const colors = stageColors(id, stage.targets, plan.droneCount, recipe.p);
    return { key: `${id}-${k}`, label: summary.formations[k], dots: thumbnailDots(stage.targets, colors, plan.droneCount) };
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "54px 60px",
          background: "linear-gradient(180deg, #04050c 0%, #0d0d24 38%, #241a3c 72%, #4c2944 100%)",
          color: "#f2f2f0",
          fontFamily: "Plex Serif",
        }}
      >
        <div style={{ display: "flex", fontFamily: "Plex Mono", fontSize: 20, letterSpacing: 4, color: "#f0c878" }}>
          AIRIMATION · DESIGN YOUR SHOW
        </div>
        <div style={{ display: "flex", fontSize: 66, marginTop: 18, lineHeight: 1.05 }}>
          {`A ${summary.droneCount}-drone show`}
        </div>
        <div style={{ display: "flex", fontFamily: "Plex Mono", fontSize: 22, color: "#a8a8a5", marginTop: 14 }}>
          {`${summary.formations.length} formations · ${summary.palette}`}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 40 }}>
          {tiles.slice(0, 5).map((tile, i) => (
            <div key={tile.key} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {i > 0 && <div style={{ display: "flex", color: "#6a6a70", fontSize: 26 }}>→</div>}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    display: "flex",
                    position: "relative",
                    width: THUMB,
                    height: THUMB,
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(3,4,11,0.55)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {tile.dots
                    ? tile.dots.map((d, j) => (
                        <div
                          key={j}
                          style={{
                            position: "absolute",
                            left: d.x - 2,
                            top: d.y - 2,
                            width: 4,
                            height: 4,
                            borderRadius: 4,
                            background: d.color,
                            boxShadow: `0 0 6px ${d.color}`,
                          }}
                        />
                      ))
                    : (
                        <div style={{ display: "flex", fontSize: 30, color: "#ffd27a", textAlign: "center", padding: 10 }}>
                          {tile.label}
                        </div>
                      )}
                </div>
                <div
                  style={{
                    display: "flex",
                    fontFamily: "Plex Mono",
                    fontSize: 15,
                    color: "#a8a8a5",
                    marginTop: 10,
                    maxWidth: THUMB,
                  }}
                >
                  {tile.label.length > 18 ? `${tile.label.slice(0, 17)}…` : tile.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "auto",
            fontFamily: "Plex Mono",
            fontSize: 17,
            color: "#949491",
          }}
        >
          Concept preview, not a flight plan · airimation.in
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Plex Serif", data: serif, weight: 400, style: "normal" },
        { name: "Plex Mono", data: mono, weight: 400, style: "normal" },
      ],
    }
  );
}
