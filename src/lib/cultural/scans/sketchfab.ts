// Formations from models found on Sketchfab (CC0 and CC BY 4.0),
// downloaded 12 Nov 2026 and converted with scripts/scan-to-formation.mjs
// (sources: Airimation/Scans/SOURCES.md; credits on /credits).
//
// Long, side-on subjects (animals, vehicles, instruments) sway so they
// never turn edge-on to the audience; towers, statues and birds turn.

import type { AnimatedFormation } from "../kit";
import { scanFormation, type ScanFile } from "../scan";
import { BRONZE } from "./paints";
import charminar from "./charminar.json";
import indiaGate from "./india-gate.json";
import qutubMinar from "./qutub-minar.json";
import sikhara from "./sikhara.json";
import ganeshaStanding from "./ganesha-standing.json";
import sitar from "./sitar.json";
import violin from "./violin.json";
import rose from "./rose.json";
import eiffelTower from "./eiffel-tower.json";
import burjKhalifa from "./burj-khalifa.json";
import statueOfLiberty from "./statue-of-liberty.json";
import bigBen from "./big-ben.json";
import tiger from "./tiger.json";
import elephant from "./elephant.json";
import lion from "./lion.json";
import horse from "./horse.json";
import eagle from "./eagle.json";
import owl from "./owl.json";
import butterfly from "./butterfly.json";
import dolphin from "./dolphin.json";
import whale from "./whale.json";
import koi from "./koi.json";
import classicCar from "./classic-car.json";
import autoRickshaw from "./auto-rickshaw.json";
import bicycle from "./bicycle.json";
import biplane from "./biplane.json";
import spaceShuttle from "./space-shuttle.json";
import hotAirBalloon from "./hot-air-balloon.json";

const f = (json: unknown) => json as ScanFile;

export const SKETCHFAB: AnimatedFormation<unknown>[] = [
  scanFormation(f(charminar), {
    paint: { ramp: ["#ffc88a", "#ffe8c8", "#fff8ee"], regions: [{ hex: "#ffb04a", y: [0.86, 1] }, { hex: "#fff0d0", level: 1.2, y: [0.56, 0.6] }] },
    blurb: "Hyderabad's Charminar — four minarets around the arch.",
    colors: ["#fff1dc", "#ffffff"],
    theme: "landmarks",
    minDrones: 500,
  }),
  scanFormation(f(indiaGate), {
    paint: { palette: ["#ffd9a0", "#ff6a3a", "#ff9a6a", "#ff5030", "#ff3020"], regions: [{ hex: "#ff7a4a", level: 0.85, y: [0, 0.07] }, { hex: "#fff0d0", y: [0.9, 1] }] },
    blurb: "India Gate, New Delhi.",
    colors: ["#ff9933", "#fff0d0"],
    motion: "sway",
    sway: 25,
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
    motion: "sway",
    sway: 25,
    theme: "objects",
    minDrones: 200,
  }),
  scanFormation(f(violin), {
    paint: { ramp: ["#5a1a00", "#d0601a", "#ffa040", "#ffe0b0"] },
    blurb: "A violin and its bow.",
    colors: ["#ff9a4a", "#fff0d0"],
    motion: "sway",
    sway: 25,
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
    paint: { mode: "texture", regions: [{ hex: "#fff6d0", level: 1.3, y: [0.66, 0.74], z: [0.75, 1] }] },
    blurb: "Big Ben's clock tower.",
    colors: ["#ffd27a", "#fff3d6"],
    theme: "landmarks",
    minDrones: 100,
  }),
  scanFormation(f(tiger), {
    paint: { ramp: ["#1a0600", "#ff6a00", "#ff9a3a", "#fff0e0"], floor: 0.25 },
    blurb: "A tiger on the prowl.",
    colors: ["#ff8a1f", "#fff0d0"],
    motion: "sway",
    sway: 25,
    theme: "animals",
    minDrones: 200,
  }),
  scanFormation(f(elephant), {
    paint: { ramp: ["#202538", "#6a7498", "#c0c8ec", "#ffffff"] },
    blurb: "An elephant, trunk raised.",
    colors: ["#c9d6ff", "#ffffff"],
    motion: "sway",
    sway: 25,
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
    motion: "sway",
    sway: 25,
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
    motion: "sway",
    sway: 25,
    theme: "animals",
    minDrones: 100,
  }),
  scanFormation(f(dolphin), {
    paint: { ramp: ["#1a3a6a", "#4a7ab8", "#bcdcff", "#ffffff"] },
    blurb: "A dolphin mid-leap.",
    colors: ["#5aa8ff", "#e0f0ff"],
    motion: "sway",
    sway: 25,
    theme: "animals",
    minDrones: 200,
  }),
  scanFormation(f(whale), {
    paint: { mode: "texture" },
    blurb: "A blue whale.",
    colors: ["#3d8bff", "#d8ecff"],
    motion: "sway",
    sway: 25,
    theme: "animals",
    minDrones: 200,
  }),
  scanFormation(f(koi), {
    paint: { palette: ["#2a1a1c", "#fff0f0", "#c8a8b0", "#ffffff", "#ff4a1a"] },
    blurb: "A koi, fins trailing.",
    colors: ["#ff6a2a", "#ffe8d0"],
    motion: "sway",
    sway: 25,
    theme: "animals",
    minDrones: 200,
  }),
  scanFormation(f(classicCar), {
    paint: { palette: ["#fff4e0", "#3a4258", "#9aa0b0", "#ffffff", "#ff2010"] },
    blurb: "A classic car — for the wedding drive-away.",
    colors: ["#ffd27a", "#ffffff"],
    motion: "sway",
    sway: 25,
    theme: "travel",
    minDrones: 200,
  }),
  scanFormation(f(autoRickshaw), {
    paint: { palette: ["#3a3a44", "#a06a30", "#ffb030", "#25d060", "#ffd400"] },
    blurb: "The auto-rickshaw.",
    colors: ["#ffd400", "#ffffff"],
    motion: "sway",
    sway: 25,
    theme: "travel",
    minDrones: 200,
  }),
  scanFormation(f(bicycle), {
    paint: { mode: "texture" },
    blurb: "A bicycle with a basket.",
    colors: ["#9fd8ff", "#ffffff"],
    motion: "sway",
    sway: 25,
    theme: "travel",
    minDrones: 200,
  }),
  scanFormation(f(biplane), {
    paint: { ramp: ["#c8a860", "#ffe8b0"] },
    blurb: "A First World War biplane, from a museum scan.",
    colors: ["#ffcf7a", "#fff3d6"],
    motion: "sway",
    sway: 25,
    theme: "travel",
    minDrones: 200,
  }),
  scanFormation(f(spaceShuttle), {
    paint: { mode: "texture" },
    blurb: "The Space Shuttle Discovery, from the Smithsonian scan.",
    colors: ["#e8f0ff", "#ffffff"],
    motion: "sway",
    sway: 25,
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
