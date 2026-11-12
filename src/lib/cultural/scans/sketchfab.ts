// Formations from models found on Sketchfab (CC0 and CC BY 4.0),
// downloaded 12 Nov 2026 and converted with scripts/scan-to-formation.mjs
// (sources: Airimation/Scans/SOURCES.md; credits on /credits).
//
// Every figure holds still, facing the audience; the visitor orbits the
// camera to see it in the round.

import type { AnimatedFormation } from "../kit";
import { scanFormation, type ScanSource } from "../scan";
import { SCAN_SOURCES } from "./manifest";
import { BRONZE } from "./paints";
const charminar = SCAN_SOURCES["charminar"];
const indiaGate = SCAN_SOURCES["india-gate"];
const qutubMinar = SCAN_SOURCES["qutub-minar"];
const sikhara = SCAN_SOURCES["sikhara"];
const ganeshaStanding = SCAN_SOURCES["ganesha-standing"];
const sitar = SCAN_SOURCES["sitar"];
const violin = SCAN_SOURCES["violin"];
const rose = SCAN_SOURCES["rose"];
const eiffelTower = SCAN_SOURCES["eiffel-tower"];
const burjKhalifa = SCAN_SOURCES["burj-khalifa"];
const statueOfLiberty = SCAN_SOURCES["statue-of-liberty"];
const bigBen = SCAN_SOURCES["big-ben"];
const tiger = SCAN_SOURCES["tiger"];
const elephant = SCAN_SOURCES["elephant"];
const lion = SCAN_SOURCES["lion"];
const horse = SCAN_SOURCES["horse"];
const eagle = SCAN_SOURCES["eagle"];
const owl = SCAN_SOURCES["owl"];
const butterfly = SCAN_SOURCES["butterfly"];
const dolphin = SCAN_SOURCES["dolphin"];
const whale = SCAN_SOURCES["whale"];
const koi = SCAN_SOURCES["koi"];
const classicCar = SCAN_SOURCES["classic-car"];
const autoRickshaw = SCAN_SOURCES["auto-rickshaw"];
const bicycle = SCAN_SOURCES["bicycle"];
const biplane = SCAN_SOURCES["biplane"];
const spaceShuttle = SCAN_SOURCES["space-shuttle"];
const hotAirBalloon = SCAN_SOURCES["hot-air-balloon"];

const f = (src: ScanSource) => src;

export const SKETCHFAB: AnimatedFormation<unknown>[] = [
  scanFormation(f(charminar), {
    paint: { ramp: ["#ff9a40", "#ffc070", "#ffe2b8"], regions: [{ hex: "#ffb04a", y: [0.86, 1] }, { hex: "#fff0d0", level: 1.2, y: [0.56, 0.6] }] },
    blurb: "Hyderabad's Charminar — four minarets around the arch.",
    colors: ["#fff1dc", "#ffffff"],
    theme: "landmarks",
    minDrones: 500,
  }),
  scanFormation(f(indiaGate), {
    paint: { palette: ["#ffb860", "#ff6a3a", "#ff9a6a", "#ff5030", "#ff3020"], regions: [{ hex: "#ff7a4a", level: 0.85, y: [0, 0.07] }, { hex: "#fff0d0", y: [0.9, 1] }] },
    blurb: "India Gate, New Delhi.",
    colors: ["#ff9933", "#fff0d0"],
    theme: "landmarks",
    minDrones: 200,
  }),
  scanFormation(f(qutubMinar), {
    paint: { ramp: ["#c8381a", "#ff6a3d"], regions: [{ hex: "#fff3e6", y: [0.72, 0.97] }, { hex: "#ffd27a", y: [0.97, 1] }, { hex: "#ffd0a0", level: 1.2, y: [0.33, 0.36] }, { hex: "#ffd0a0", level: 1.2, y: [0.56, 0.59] }] },
    blurb: "Qutub Minar, its five storeys rising.",
    colors: ["#ffb27a", "#fff0d0"],
    theme: "landmarks",
    minDrones: 100,
  }),
  scanFormation(f(sikhara), {
    paint: { ramp: ["#4a1e08", "#c0602a", "#ffb070", "#fff0d6"] },
    blurb: "A temple tower (shikhara), from a museum model.",
    colors: ["#ffcf7a", "#fff3d6"],
    theme: "culture",
    minDrones: 200,
  }),
  scanFormation(f(ganeshaStanding), {
    paint: { ramp: BRONZE },
    blurb: "Ganesha standing, a bronze scanned in the round.",
    colors: ["#ffab4f", "#fff3d6"],
    theme: "culture",
    minDrones: 500,
  }),
  scanFormation(f(sitar), {
    paint: { palette: ["#ff8a3a", "#fff0c8", "#ffb070", "#ffd090", "#a04020"] },
    blurb: "The sitar.",
    colors: ["#ffc246", "#fff3d6"],
    theme: "objects",
    minDrones: 200,
  }),
  scanFormation(f(violin), {
    paint: { ramp: ["#5a1a00", "#d0601a", "#ffa040", "#ffe0b0"] },
    blurb: "A violin and its bow.",
    colors: ["#ff9a4a", "#fff0d0"],
    theme: "objects",
    minDrones: 200,
  }),
  scanFormation(f(rose), {
    paint: { palette: ["#3fae30", "#ff1a2a", "#2a8a20", "#ff4a5a", "#7acc50"] },
    blurb: "A single red rose.",
    colors: ["#ff2d55", "#ffd1dc"],
    theme: "objects",
    minDrones: 200,
  }),
  scanFormation(f(eiffelTower), {
    paint: { ramp: ["#ff9a2e", "#ffd27a", "#fff4d6"], regions: [{ hex: "#ffffff", level: 1.4, y: [0.97, 1] }] },
    blurb: "The Eiffel Tower.",
    colors: ["#ffcf7a", "#fff3d6"],
    theme: "landmarks",
    minDrones: 200,
  }),
  scanFormation(f(burjKhalifa), {
    paint: { ramp: ["#2a5a9a", "#8fc8ff", "#e8f6ff", "#ffffff"] },
    blurb: "Burj Khalifa, the tallest tower in the world.",
    colors: ["#9fd8ff", "#ffffff"],
    theme: "landmarks",
    minDrones: 100,
  }),
  scanFormation(f(statueOfLiberty), {
    paint: { palette: ["#5fe0b0", "#7ff0c8", "#3fc898", "#ffcf3a", "#2a9a78"], regions: [{ hex: "#ffb02e", level: 1.4, y: [0.95, 1] }] },
    blurb: "The Statue of Liberty.",
    colors: ["#5fe0b0", "#e8fff4"],
    theme: "landmarks",
    minDrones: 500,
  }),
  scanFormation(f(bigBen), {
    paint: { ramp: ["#7a4a10", "#e0942e", "#ffcc70", "#fff0d0"], regions: [{ hex: "#fff6d0", level: 1.3, y: [0.66, 0.74], z: [0.75, 1] }] },
    blurb: "Big Ben's clock tower.",
    colors: ["#ffd27a", "#fff3d6"],
    theme: "landmarks",
    minDrones: 100,
  }),
  scanFormation(f(tiger), {
    paint: { ramp: ["#2a0e00", "#ff7a00", "#ffaa30", "#fff0d0"], floor: 0.4 },
    blurb: "A tiger on the prowl.",
    colors: ["#ff8a1f", "#fff0d0"],
    theme: "animals",
    minDrones: 200,
  }),
  scanFormation(f(elephant), {
    paint: { ramp: ["#202538", "#6a7498", "#c0c8ec", "#ffffff"] },
    blurb: "An elephant, trunk raised.",
    colors: ["#c9d6ff", "#ffffff"],
    theme: "animals",
    minDrones: 200,
  }),
  scanFormation(f(lion), {
    paint: { ramp: ["#3a1e05", "#b8701a", "#ffc246", "#fff3d6"], floor: 0.4 },
    blurb: "A seated lion, from a sculpture.",
    colors: ["#ffc246", "#fff3d6"],
    theme: "animals",
    minDrones: 500,
  }),
  scanFormation(f(horse), {
    paint: { ramp: ["#3a1404", "#a0400f", "#e08040", "#ffd0a0"] },
    blurb: "A horse at full gallop.",
    colors: ["#ffb066", "#fff0d0"],
    theme: "animals",
    minDrones: 200,
  }),
  scanFormation(f(eagle), {
    paint: { ramp: ["#2a1004", "#9a4a12", "#e8a040", "#fff0c8"] },
    blurb: "A golden eagle, from a museum specimen.",
    colors: ["#ffcf7a", "#fff3d6"],
    theme: "animals",
    minDrones: 500,
  }),
  scanFormation(f(owl), {
    paint: { ramp: ["#5a3a1a", "#c88a40", "#f0d0a0", "#ffffff"] },
    blurb: "A barn owl on its branch.",
    colors: ["#e8d9c0", "#ffffff"],
    theme: "animals",
    minDrones: 500,
  }),
  scanFormation(f(butterfly), {
    paint: { mode: "texture" },
    blurb: "A butterfly, wings open.",
    colors: ["#ff9a1f", "#fff0c0"],
    theme: "animals",
    minDrones: 100,
  }),
  scanFormation(f(dolphin), {
    paint: { ramp: ["#1a3a6a", "#4a7ab8", "#bcdcff", "#ffffff"] },
    blurb: "A dolphin mid-leap.",
    colors: ["#5aa8ff", "#e0f0ff"],
    theme: "animals",
    minDrones: 200,
  }),
  scanFormation(f(whale), {
    paint: { mode: "texture" },
    blurb: "A blue whale.",
    colors: ["#3d8bff", "#d8ecff"],
    theme: "animals",
    minDrones: 200,
  }),
  scanFormation(f(koi), {
    paint: { palette: ["#2a1a1c", "#fff0f0", "#c8a8b0", "#ffffff", "#ff4a1a"] },
    blurb: "A koi, fins trailing.",
    colors: ["#ff6a2a", "#ffe8d0"],
    theme: "animals",
    minDrones: 200,
  }),
  scanFormation(f(classicCar), {
    paint: { palette: ["#fff4e0", "#3a4258", "#9aa0b0", "#ffffff", "#ff2010"] },
    blurb: "A classic car — for the wedding drive-away.",
    colors: ["#ffd27a", "#ffffff"],
    theme: "travel",
    minDrones: 200,
  }),
  scanFormation(f(autoRickshaw), {
    paint: { palette: ["#3a3a44", "#a06a30", "#ffb030", "#25d060", "#ffd400"] },
    blurb: "The auto-rickshaw.",
    colors: ["#ffd400", "#ffffff"],
    theme: "travel",
    minDrones: 200,
  }),
  scanFormation(f(bicycle), {
    paint: { mode: "texture" },
    blurb: "A bicycle with a basket.",
    colors: ["#9fd8ff", "#ffffff"],
    theme: "travel",
    minDrones: 200,
  }),
  scanFormation(f(biplane), {
    paint: { ramp: ["#c8a860", "#ffe8b0"] },
    blurb: "A First World War biplane, from a museum scan.",
    colors: ["#ffcf7a", "#fff3d6"],
    theme: "travel",
    minDrones: 200,
  }),
  scanFormation(f(spaceShuttle), {
    paint: { mode: "texture" },
    blurb: "The Space Shuttle Discovery, from the Smithsonian scan.",
    colors: ["#e8f0ff", "#ffffff"],
    theme: "travel",
    minDrones: 200,
  }),
  scanFormation(f(hotAirBalloon), {
    paint: { mode: "texture" },
    blurb: "A hot-air balloon.",
    colors: ["#ff6fa8", "#ffe0ec"],
    theme: "travel",
    minDrones: 100,
  }),
] as AnimatedFormation<unknown>[];
