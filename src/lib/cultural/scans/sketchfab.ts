// Formations from models found on Sketchfab (CC0 and CC BY 4.0),
// downloaded 12 Nov 2026 and converted with scripts/scan-to-formation.mjs
// (sources: Airimation/Scans/SOURCES.md; credits on /credits).
//
// Long, side-on subjects (animals, vehicles, instruments) sway so they
// never turn edge-on to the audience; towers, statues and birds turn.

import type { AnimatedFormation } from "../kit";
import { scanFormation, type ScanFile } from "../scan";
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
    blurb: "Hyderabad's Charminar — four minarets around the arch.",
    colors: ["#fff1dc", "#ffffff"],
    theme: "landmarks",
    minDrones: 500,
  }),
  scanFormation(f(indiaGate), {
    blurb: "India Gate, New Delhi.",
    colors: ["#ff9933", "#fff0d0"],
    motion: "sway",
    sway: 25,
    theme: "landmarks",
    minDrones: 200,
  }),
  scanFormation(f(qutubMinar), {
    blurb: "Qutub Minar, its five storeys rising.",
    colors: ["#ffb27a", "#fff0d0"],
    theme: "landmarks",
    minDrones: 100,
  }),
  scanFormation(f(sikhara), {
    blurb: "A temple tower (shikhara), from a museum model.",
    colors: ["#ffcf7a", "#fff3d6"],
    theme: "culture",
    minDrones: 200,
  }),
  scanFormation(f(ganeshaStanding), {
    blurb: "Ganesha standing, a bronze scanned in the round.",
    colors: ["#ffab4f", "#fff3d6"],
    theme: "culture",
    minDrones: 500,
  }),
  scanFormation(f(sitar), {
    blurb: "The sitar.",
    colors: ["#ffc246", "#fff3d6"],
    motion: "sway",
    sway: 25,
    theme: "objects",
    minDrones: 200,
  }),
  scanFormation(f(violin), {
    blurb: "A violin and its bow.",
    colors: ["#ff9a4a", "#fff0d0"],
    motion: "sway",
    sway: 25,
    theme: "objects",
    minDrones: 200,
  }),
  scanFormation(f(rose), {
    blurb: "A single red rose.",
    colors: ["#ff2d55", "#ffd1dc"],
    theme: "objects",
    minDrones: 200,
  }),
  scanFormation(f(eiffelTower), {
    blurb: "The Eiffel Tower.",
    colors: ["#ffcf7a", "#fff3d6"],
    theme: "landmarks",
    minDrones: 200,
  }),
  scanFormation(f(burjKhalifa), {
    blurb: "Burj Khalifa, the tallest tower in the world.",
    colors: ["#9fd8ff", "#ffffff"],
    theme: "landmarks",
    minDrones: 100,
  }),
  scanFormation(f(statueOfLiberty), {
    blurb: "The Statue of Liberty.",
    colors: ["#5fe0b0", "#e8fff4"],
    theme: "landmarks",
    minDrones: 500,
  }),
  scanFormation(f(bigBen), {
    blurb: "Big Ben's clock tower.",
    colors: ["#ffd27a", "#fff3d6"],
    theme: "landmarks",
    minDrones: 100,
  }),
  scanFormation(f(tiger), {
    blurb: "A tiger on the prowl.",
    colors: ["#ff8a1f", "#fff0d0"],
    motion: "sway",
    sway: 25,
    theme: "animals",
    minDrones: 200,
  }),
  scanFormation(f(elephant), {
    blurb: "An elephant, trunk raised.",
    colors: ["#c9d6ff", "#ffffff"],
    motion: "sway",
    sway: 25,
    theme: "animals",
    minDrones: 200,
  }),
  scanFormation(f(lion), {
    blurb: "A seated lion, from a sculpture.",
    colors: ["#ffc246", "#fff3d6"],
    theme: "animals",
    minDrones: 500,
  }),
  scanFormation(f(horse), {
    blurb: "A horse at full gallop.",
    colors: ["#ffb066", "#fff0d0"],
    motion: "sway",
    sway: 25,
    theme: "animals",
    minDrones: 200,
  }),
  scanFormation(f(eagle), {
    blurb: "A golden eagle, from a museum specimen.",
    colors: ["#ffcf7a", "#fff3d6"],
    theme: "animals",
    minDrones: 500,
  }),
  scanFormation(f(owl), {
    blurb: "A barn owl on its branch.",
    colors: ["#e8d9c0", "#ffffff"],
    theme: "animals",
    minDrones: 500,
  }),
  scanFormation(f(butterfly), {
    blurb: "A butterfly, wings open.",
    colors: ["#ff9a1f", "#fff0c0"],
    motion: "sway",
    sway: 25,
    theme: "animals",
    minDrones: 100,
  }),
  scanFormation(f(dolphin), {
    blurb: "A dolphin mid-leap.",
    colors: ["#5aa8ff", "#e0f0ff"],
    motion: "sway",
    sway: 25,
    theme: "animals",
    minDrones: 200,
  }),
  scanFormation(f(whale), {
    blurb: "A blue whale.",
    colors: ["#3d8bff", "#d8ecff"],
    motion: "sway",
    sway: 25,
    theme: "animals",
    minDrones: 200,
  }),
  scanFormation(f(koi), {
    blurb: "A koi, fins trailing.",
    colors: ["#ff6a2a", "#ffe8d0"],
    motion: "sway",
    sway: 25,
    theme: "animals",
    minDrones: 200,
  }),
  scanFormation(f(classicCar), {
    blurb: "A classic car — for the wedding drive-away.",
    colors: ["#ffd27a", "#ffffff"],
    motion: "sway",
    sway: 25,
    theme: "travel",
    minDrones: 200,
  }),
  scanFormation(f(autoRickshaw), {
    blurb: "The auto-rickshaw.",
    colors: ["#ffd400", "#ffffff"],
    motion: "sway",
    sway: 25,
    theme: "travel",
    minDrones: 200,
  }),
  scanFormation(f(bicycle), {
    blurb: "A bicycle with a basket.",
    colors: ["#9fd8ff", "#ffffff"],
    motion: "sway",
    sway: 25,
    theme: "travel",
    minDrones: 200,
  }),
  scanFormation(f(biplane), {
    blurb: "A First World War biplane, from a museum scan.",
    colors: ["#ffcf7a", "#fff3d6"],
    motion: "sway",
    sway: 25,
    theme: "travel",
    minDrones: 200,
  }),
  scanFormation(f(spaceShuttle), {
    blurb: "The Space Shuttle Discovery, from the Smithsonian scan.",
    colors: ["#e8f0ff", "#ffffff"],
    motion: "sway",
    sway: 25,
    theme: "travel",
    minDrones: 200,
  }),
  scanFormation(f(hotAirBalloon), {
    blurb: "A hot-air balloon.",
    colors: ["#ff6fa8", "#ffe0ec"],
    theme: "travel",
    minDrones: 100,
  }),
] as AnimatedFormation<unknown>[];
