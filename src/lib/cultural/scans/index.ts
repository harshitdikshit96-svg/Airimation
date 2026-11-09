// Formations from CC0 museum scans — true 3D sculptures, drones on the
// surface. Each JSON is produced by scripts/scan-to-formation.mjs from a
// GLB (sources and licences: Airimation/Scans/SOURCES.md and below).
// Only CC0 / public-domain sources belong here.
//
// Also downloaded but not shown: Nataraja c.1100 (near-duplicate of the
// Minneapolis bronze) and Uma-Maheshvara (a flat stone stele — its carving
// is lost in points of light).

import type { AnimatedFormation } from "../kit";
import { scanFormation, type ScanFile } from "../scan";
import cmaNataraja from "./cma-nataraja.json";
import miaNataraja from "./mia-nataraja.json";
import somaskanda from "./somaskanda.json";

const f = (json: unknown, label: string, credit: string) => ({ ...(json as ScanFile), label, credit });

export const SCANS: AnimatedFormation<unknown>[] = [
  scanFormation(f(cmaNataraja, "Nataraja", "Nataraja, Shiva as the Lord of Dance, 1930.331 — Cleveland Museum of Art, CC0"), {
    blurb: "Shiva as Lord of the Dance, in his ring of fire — a real 3D sculpture, scanned.",
    fireRing: true,
    palette: "bronze",
    minDrones: 800,
  }),
  scanFormation(f(miaNataraja, "Dancing Shiva", "Shiva Nataraja, Lord of the Dance — Minneapolis Institute of Art, CC0"), {
    blurb: "Shiva mid-dance, a bronze scanned in the round.",
    fireRing: false,
    palette: "gold",
    minDrones: 800,
  }),
  scanFormation(f(somaskanda, "Somaskanda", "Somaskanda, 14th or 15th C CE — Minneapolis Institute of Art, CC0"), {
    blurb: "Shiva, Uma and the child Skanda — a family in bronze.",
    palette: "bronze",
    minDrones: 1500,
  }),
] as AnimatedFormation<unknown>[];
