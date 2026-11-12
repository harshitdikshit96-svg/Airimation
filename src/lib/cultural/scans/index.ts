// Formations from real 3D models — museum scans and openly licensed
// models, drones on the surface. Each JSON is produced by
// scripts/scan-to-formation.mjs from a GLB in the workspace Scans/ folder
// (sources and licences: Airimation/Scans/SOURCES.md).
//
// Licences allowed: CC0 / public domain, or CC BY 4.0 with the credit shown
// on the page (each formation's `credit`). Never NC, ND or SA.
//
// Also downloaded but not shown: Nataraja c.1100 (near-duplicate of the
// Minneapolis bronze) and Uma-Maheshvara (a flat stone stele — its carving
// is lost in points of light).

import type { AnimatedFormation } from "../kit";
import { scanFormation, type ScanFile } from "../scan";
import cmaNataraja from "./cma-nataraja.json";
import miaNataraja from "./mia-nataraja.json";
import somaskanda from "./somaskanda.json";
import ganesha from "./ganesha.json";
import damru from "./damru.json";
import dhanushBaan from "./dhanush-baan.json";
import dragon from "./dragon.json";
import diya from "./diya.json";
import dil from "./dil.json";

const f = (json: unknown) => json as ScanFile;
// Older files carry no credit field of their own.
const withCredit = (json: unknown, label: string, credit: string) => ({ ...(json as ScanFile), label, credit });

/** Small objects first (they read at 100 drones), sculptures after. */
export const SCANS: AnimatedFormation<unknown>[] = [
  scanFormation(f(diya), {
    blurb: "A terracotta oil lamp, scanned — lit at its spout.",
    colors: ["#ff6a1f", "#ffc890"],
    motion: "sway",
    sway: 24,
    effect: "flame",
    minDrones: 100,
  }),
  scanFormation(f(dil), {
    blurb: "A heart, from a scanned heart-shaped box — beating in light.",
    colors: ["#ff1744", "#ff9db0"],
    motion: "sway",
    sway: 30,
    effect: "beat",
    minDrones: 100,
  }),
  scanFormation(f(damru), {
    blurb: "Shiva's damru, turning — its two heads flash as it plays.",
    colors: ["#ffa94d", "#fff0d0"],
    effect: "strike",
    minDrones: 100,
  }),
  scanFormation(f(dhanushBaan), {
    blurb: "The bow is drawn and the arrow loosed — it flies off and returns, dark, to the string.",
    colors: ["#ffc246", "#fff3d6"],
    motion: "still",
    effect: "arrow",
    minDrones: 100,
  }),
  scanFormation(f(ganesha), {
    blurb: "Ganesha, from a thousand-year-old stone sculpture, scanned in the round.",
    colors: ["#ff8a3d", "#ffe2a8"],
    minDrones: 500,
  }),
  scanFormation(f(dragon), {
    blurb: "A winged dragon, from a scanned statuette.",
    colors: ["#2fe6a0", "#fff0b0"],
    minDrones: 500,
  }),
  scanFormation(withCredit(cmaNataraja, "Nataraja", "Nataraja, Shiva as the Lord of Dance, 1930.331 — Cleveland Museum of Art, CC0"), {
    blurb: "Shiva as Lord of the Dance, in his ring of fire — a real 3D sculpture, scanned.",
    colors: ["#ffab4f", "#fff3d6"],
    effect: "fireRing",
    minDrones: 800,
  }),
  scanFormation(withCredit(miaNataraja, "Dancing Shiva", "Shiva Nataraja, Lord of the Dance — Minneapolis Institute of Art, CC0"), {
    blurb: "Shiva mid-dance, a bronze scanned in the round.",
    colors: ["#ffc246", "#fff3d6"],
    minDrones: 800,
  }),
  scanFormation(withCredit(somaskanda, "Somaskanda", "Somaskanda, 14th or 15th C CE — Minneapolis Institute of Art, CC0"), {
    blurb: "Shiva, Uma and the child Skanda — a family in bronze.",
    colors: ["#ffab4f", "#fff3d6"],
    minDrones: 1500,
  }),
] as AnimatedFormation<unknown>[];
