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
import { scanFormation, type ScanFile } from "../scan";
import { BRONZE } from "./paints";
import cmaNataraja from "./cma-nataraja.json";
import miaNataraja from "./mia-nataraja.json";
import somaskanda from "./somaskanda.json";
import ganesha from "./ganesha.json";
import damru from "./damru.json";
import dhanushBaan from "./dhanush-baan.json";
import dragon from "./dragon.json";
import diya from "./diya.json";
import dil from "./dil.json";
import shankh from "./shankh.json";
import trishul from "./trishul.json";
import kalash from "./kalash.json";
import kamal from "./kamal.json";
import om from "./om.json";
import nandi from "./nandi.json";
import ram from "./ram.json";
import ramMandir from "./ram-mandir.json";
import tajMahal from "./taj-mahal.json";
import hanuman from "./hanuman.json";
import vishnuGaruda from "./vishnu-garuda.json";

const f = (json: unknown) => json as ScanFile;
// Older files carry no credit field of their own.
const withCredit = (json: unknown, label: string, credit: string) => ({ ...(json as ScanFile), label, credit });

/** Small objects first (they read at 100 drones), sculptures after. */
export const SCANS: AnimatedFormation<unknown>[] = [
  scanFormation(f(diya), {
    paint: { ramp: ["#a8380a", "#ff7a2a", "#ffc890"] },
    blurb: "A clay diya, its flame flickering.",
    colors: ["#ff6a1f", "#ffc890"],
    effect: "flame",
    flameAt: "top",
    minDrones: 100,
  }),
  scanFormation(f(dil), {
    paint: { ramp: ["#b0001e", "#ff1744", "#ff5a7a", "#ffc0d0"], floor: 0.55 },
    blurb: "A heart, from a scanned heart-shaped box — beating in light.",
    theme: "objects",
    colors: ["#ff1744", "#ff9db0"],
    motion: "sway",
    sway: 30,
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
    paint: { ramp: ["#ff9a1f", "#ffc246", "#ffe9b0", "#ffffff"], floor: 0.6 },
    blurb: "The bow is drawn and the arrow loosed — it flies off and returns, dark, to the string.",
    colors: ["#ffc246", "#fff3d6"],
    motion: "still",
    effect: "arrow",
    minDrones: 100,
  }),
  scanFormation(f(shankh), {
    paint: { ramp: ["#ffb89a", "#ffe6d6", "#fffaf4"], regions: [{ hex: "#ff9a7a", level: 0.8, r: [0, 0.35], z: [0.5, 1] }] },
    blurb: "The conch, sounded at the start of every puja.",
    colors: ["#fff1dc", "#ffffff"],
    minDrones: 100,
  }),
  scanFormation(f(trishul), {
    paint: { regions: [{ hex: "#9fb6d0", level: 0.85 }, { hex: "#e8f4ff", y: [0.7, 1] }, { hex: "#ffb02e", y: [0.56, 0.7], r: [0, 0.5] }, { hex: "#ff3a2a", y: [0.5, 0.56], r: [0, 0.4] }] },
    blurb: "Shiva's trident, a damru tied below its head.",
    colors: ["#9fd8ff", "#ffffff"],
    motion: "sway",
    sway: 30,
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
    motion: "sway",
    sway: 32,
    minDrones: 200,
  }),
  scanFormation(f(kamal), {
    paint: { ramp: ["#c0205e", "#ff6fa8", "#ffe0ec"], regions: [{ hex: "#2fbf6a", level: 0.7, y: [0, 0.12] }, { hex: "#ffd84a", r: [0, 0.16], y: [0.3, 1] }] },
    blurb: "A lotus in bloom, its petals opening to the sky.",
    colors: ["#ff6fa8", "#ffe0ec"],
    motion: "sway",
    sway: 30,
    minDrones: 200,
  }),
  scanFormation(f(tajMahal), {
    paint: { regions: [{ hex: "#f2f0ff" }, { hex: "#fff3e4", y: [0, 0.42], r: [0, 0.8] }, { hex: "#dfe8ff", r: [0.82, 1] }, { hex: "#ffd27a", y: [0.93, 1] }] },
    blurb: "The Taj Mahal — dome, four minarets — for a wedding night.",
    theme: "landmarks",
    colors: ["#f4f1ff", "#ffffff"],
    minDrones: 200,
  }),
  scanFormation(f(ram), {
    paint: {
      regions: [
        { hex: "#3d7bff" },
        { hex: "#ffd400", y: [0.08, 0.5], x: [0.25, 0.7] },
        { hex: "#ff7a1a", y: [0.5, 0.66], x: [0.3, 0.66], z: [0.55, 1] },
        { hex: "#ffc246", y: [0.86, 1] },
        { hex: "#ffc246", x: [0.72, 1] },
        { hex: "#fff0c0", x: [0, 0.3], y: [0, 0.55] },
      ],
    },
    blurb: "Lord Ram, the Kodanda bow in his left hand and an arrow in his right. Modelled by Airimation.",
    colors: ["#3d7bff", "#e0ecff"],
    motion: "sway",
    sway: 30,
    minDrones: 500,
  }),
  scanFormation(f(ramMandir), {
    paint: {
      ramp: ["#ff7a6a", "#ffa898", "#ffd8cc"],
      regions: [{ hex: "#d06a5a", level: 0.8, y: [0, 0.07] }, { hex: "#ffd27a", y: [0.9, 1] }],
    },
    blurb: "Ayodhya's Ram Mandir in the Nagara style: five mandapas rising to the shikhara over the sanctum. Modelled by Airimation.",
    theme: "landmarks",
    colors: ["#ffa898", "#fff0ea"],
    motion: "sway",
    sway: 25,
    minDrones: 800,
  }),
  scanFormation(f(nandi), {
    paint: { ramp: ["#3a2412", "#a8682a", "#ffc070", "#fff2dc"] },
    blurb: "Nandi, Shiva's bull, from a Chola-period sculpture.",
    colors: ["#ffcf7a", "#fff3d6"],
    minDrones: 500,
  }),
  scanFormation(f(hanuman), {
    paint: { regions: [{ hex: "#ff6a1a" }, { hex: "#ffc246", y: [0.86, 1] }, { hex: "#ffd27a", y: [0.6, 0.66] }, { hex: "#c03a0a", level: 0.8, y: [0, 0.07] }] },
    blurb: "Hanuman, hands joined before Ram, from a scanned sculpture.",
    colors: ["#ff7a2a", "#ffe0b0"],
    minDrones: 500,
  }),
  scanFormation(f(ganesha), {
    paint: { ramp: ["#4a1205", "#d0400f", "#ff8a2a", "#ffd890"], floor: 0.4 },
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
