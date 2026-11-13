// Formations from real 3D models — museum scans and openly licensed
// models, drones on the surface. Each JSON is produced by
// scripts/scan-to-formation.mjs from a GLB in the workspace Scans/ folder
// (sources and licences: Airimation/Scans/SOURCES.md).
//
// Licences allowed: CC0 / public domain, CC BY 4.0 (credited on /credits),
// or "Airimation" — symbols we model ourselves in Blender
// (scripts/blender/make-symbols.py). Never NC, ND or SA.
//
// Also downloaded but not shown: Nataraja c.1100 (near-duplicate of the
// Minneapolis bronze) and Uma-Maheshvara (a flat stone stele — its carving
// is lost in points of light).

import type { AnimatedFormation } from "../kit";
import { scanFormation, type ScanSource } from "../scan";
import { SCAN_SOURCES } from "./manifest";
import { BRONZE } from "./paints";
const cmaNataraja = SCAN_SOURCES["cma-nataraja"];
const miaNataraja = SCAN_SOURCES["mia-nataraja"];
const somaskanda = SCAN_SOURCES["somaskanda"];
const ganesha = SCAN_SOURCES["ganesha"];
const damru = SCAN_SOURCES["damru"];
const dhanushBaan = SCAN_SOURCES["dhanush-baan"];
const dragon = SCAN_SOURCES["dragon"];
const diya = SCAN_SOURCES["diya"];
const dil = SCAN_SOURCES["dil"];
const shankh = SCAN_SOURCES["shankh"];
const trishul = SCAN_SOURCES["trishul"];
const kalash = SCAN_SOURCES["kalash"];
const kamal = SCAN_SOURCES["kamal"];
const om = SCAN_SOURCES["om"];
const nandi = SCAN_SOURCES["nandi"];
const ramMandir = SCAN_SOURCES["ram-mandir"];
const tajMahal = SCAN_SOURCES["taj-mahal"];
const vishnuGaruda = SCAN_SOURCES["vishnu-garuda"];

const f = (src: ScanSource) => src;
// Older files carry no credit field of their own.
const withCredit = (src: ScanSource, label: string, credit: string): ScanSource => ({ ...src, label, credit });

/** Small objects first (they read at 100 drones), sculptures after. */
export const SCANS: AnimatedFormation<unknown>[] = [
  scanFormation(f(diya), {
    paint: { ramp: ["#a8380a", "#ff7a2a", "#ffc890"] },
    blurb: "A clay diya, its flame flickering.",
    colors: ["#ff6a1f", "#ffc890"],
    effect: "flame",
    flameAt: "left-rim",
    minDrones: 100,
  }),
  scanFormation(f(dil), {
    paint: { ramp: ["#b0001e", "#ff1744", "#ff5a7a", "#ffc0d0"], floor: 0.55 },
    blurb: "A heart, from a scanned heart-shaped box — beating in light.",
    theme: "objects",
    colors: ["#ff1744", "#ff9db0"],
    effect: "beat",
    minDrones: 100,
  }),
  scanFormation(f(damru), {
    paint: { mode: "texture" },
    blurb: "Shiva's damru, turning — its two heads flash as it plays.",
    colors: ["#ffa94d", "#fff0d0"],
    effect: "strike",
    minDrones: 100,
  }),
  scanFormation(f(dhanushBaan), {
    paint: { ramp: ["#ff8a12", "#ffb02e", "#ffd36a"], floor: 0.6 },
    blurb: "The bow is drawn and the arrow loosed — it flies off and returns, dark, to the string.",
    colors: ["#ffb02e", "#ffd36a"],
    motion: "still",
    effect: "arrow",
    minDrones: 100,
  }),
  scanFormation(f(shankh), {
    // Warm ivory (peach, not white) body, coral-pink opening, an amber line
    // along the spire's spiral.
    paint: { palette: ["#ffcf94", "#ff7a6a", "#e8901a"] },
    blurb: "The shankh, spire up — the conch sounded at the start of every puja. Modelled by Airimation.",
    colors: ["#ffcf94", "#ffb070"],
    minDrones: 500,
  }),
  scanFormation(f(trishul), {
    // Steel as blue light (not white): a deep-blue shaft, a bright sky-blue
    // head, the damru gold and its red cord.
    paint: { regions: [{ hex: "#3f74ff", level: 0.85 }, { hex: "#6fb4ff", y: [0.7, 1] }, { hex: "#ffb02e", y: [0.56, 0.7], r: [0, 0.5] }, { hex: "#ff3a2a", y: [0.5, 0.56], r: [0, 0.4] }] },
    blurb: "Shiva's trident, a damru tied below its head.",
    colors: ["#3f74ff", "#8fc8ff"],
    minDrones: 100,
  }),
  scanFormation(f(kalash), {
    paint: { regions: [{ hex: "#ff8a2a" }, { hex: "#ffd27a", y: [0.38, 0.46] }, { hex: "#2fd060", y: [0.52, 0.78] }, { hex: "#c8783a", y: [0.7, 1], r: [0, 0.4] }, { hex: "#ff3a1a", y: [0.18, 0.3], r: [0.8, 1] }] },
    blurb: "The kalash: a full pot, mango leaves and a coconut — a blessing to begin.",
    colors: ["#ffb02e", "#fff0c8"],
    minDrones: 100,
  }),
  scanFormation(f(om), {
    paint: { ramp: ["#ff6a12", "#ff9933", "#ffc46a"], regions: [{ hex: "#ffe7a0", y: [0.84, 1] }] },
    blurb: "Om, turning slowly to face every seat.",
    colors: ["#ff9933", "#fff0d0"],
    minDrones: 200,
  }),
  scanFormation(f(kamal), {
    paint: { ramp: ["#c0205e", "#ff6fa8", "#ffe0ec"], regions: [{ hex: "#2fbf6a", level: 0.7, y: [0, 0.12] }, { hex: "#ffd84a", r: [0, 0.16], y: [0.3, 1] }] },
    blurb: "A lotus in bloom, its petals opening to the sky.",
    colors: ["#ff6fa8", "#ffe0ec"],
    minDrones: 200,
  }),
  scanFormation(f(tajMahal), {
    // Marble at dusk as rose-gold light, not white: rose body, warmer
    // plinth, gold minarets and finial.
    paint: { regions: [{ hex: "#ffa98a" }, { hex: "#ff8f6a", y: [0, 0.42], r: [0, 0.8] }, { hex: "#ffc46a", r: [0.82, 1] }, { hex: "#ffd24a", y: [0.93, 1] }] },
    blurb: "The Taj Mahal — dome, four minarets — for a wedding night.",
    theme: "landmarks",
    colors: ["#ffa98a", "#ffd27a"],
    minDrones: 200,
  }),
  scanFormation(f(ramMandir), {
    paint: {
      ramp: ["#ff7a6a", "#ffa898", "#ffd8cc"],
      regions: [{ hex: "#d06a5a", level: 0.8, y: [0, 0.07] }, { hex: "#ffd27a", y: [0.9, 1] }],
    },
    blurb: "Ayodhya's Ram Mandir in the Nagara style: five mandapas rising to the shikhara over the sanctum. Modelled by Airimation.",
    theme: "landmarks",
    colors: ["#ffa898", "#fff0ea"],
    minDrones: 800,
  }),
  scanFormation(f(nandi), {
    paint: { ramp: ["#3a2412", "#a8682a", "#ffc070", "#fff2dc"] },
    blurb: "Nandi, Shiva's bull, from a Chola-period sculpture.",
    colors: ["#ffcf7a", "#fff3d6"],
    minDrones: 500,
  }),
  scanFormation(f(ganesha), {
    paint: { ramp: ["#5a2205", "#e8600f", "#ffa030", "#ffe0a0"] },
    blurb: "Ganesha, from a thousand-year-old stone sculpture, scanned in the round.",
    colors: ["#ff8a3d", "#ffe2a8"],
    minDrones: 500,
  }),
  scanFormation(f(dragon), {
    paint: { ramp: ["#063a20", "#1fae6a", "#7fffc0", "#fff3b0"] },
    blurb: "A winged dragon, from a scanned statuette.",
    colors: ["#2fe6a0", "#fff0b0"],
    minDrones: 500,
  }),
  scanFormation(f(vishnuGaruda), {
    paint: { ramp: BRONZE },
    blurb: "Vishnu riding Garuda, a 12th-century bronze, wings spread.",
    colors: ["#5aa8ff", "#fff0b0"],
    minDrones: 800,
  }),
  scanFormation(withCredit(cmaNataraja, "Nataraja", "Nataraja, Shiva as the Lord of Dance, 1930.331 — Cleveland Museum of Art, CC0"), {
    paint: { ramp: BRONZE },
    blurb: "Shiva as Lord of the Dance, in his ring of fire — a real 3D sculpture, scanned.",
    colors: ["#ffab4f", "#fff3d6"],
    effect: "fireRing",
    minDrones: 800,
  }),
  scanFormation(withCredit(miaNataraja, "Dancing Shiva", "Shiva Nataraja, Lord of the Dance — Minneapolis Institute of Art, CC0"), {
    paint: { ramp: BRONZE },
    blurb: "Shiva mid-dance, a bronze scanned in the round.",
    colors: ["#ffc246", "#fff3d6"],
    minDrones: 800,
  }),
  scanFormation(withCredit(somaskanda, "Somaskanda", "Somaskanda, 14th or 15th C CE — Minneapolis Institute of Art, CC0"), {
    paint: { ramp: BRONZE },
    blurb: "Shiva, Uma and the child Skanda — a family in bronze.",
    colors: ["#ffab4f", "#fff3d6"],
    minDrones: 1500,
  }),
] as AnimatedFormation<unknown>[];
