// Every model JSON in scans/, for tests.
import type { ScanFile } from "../scan";
import cmaNataraja from "../scans/cma-nataraja.json";
import miaNataraja from "../scans/mia-nataraja.json";
import somaskanda from "../scans/somaskanda.json";
import ganesha from "../scans/ganesha.json";
import damru from "../scans/damru.json";
import dhanushBaan from "../scans/dhanush-baan.json";
import dragon from "../scans/dragon.json";
import diya from "../scans/diya.json";
import dil from "../scans/dil.json";
import shankh from "../scans/shankh.json";
import trishul from "../scans/trishul.json";
import kalash from "../scans/kalash.json";
import kamal from "../scans/kamal.json";
import om from "../scans/om.json";
import nandi from "../scans/nandi.json";
import tajMahal from "../scans/taj-mahal.json";
import hanuman from "../scans/hanuman.json";
import vishnuGaruda from "../scans/vishnu-garuda.json";

const files: Record<string, ScanFile> = {
  cmaNataraja: { ...(cmaNataraja as ScanFile), credit: "Cleveland Museum of Art, CC0" },
  miaNataraja: { ...(miaNataraja as ScanFile), credit: "Minneapolis Institute of Art, CC0" },
  somaskanda: { ...(somaskanda as ScanFile), credit: "Minneapolis Institute of Art, CC0" },
  ganesha: ganesha as ScanFile,
  damru: damru as ScanFile,
  dhanushBaan: dhanushBaan as ScanFile,
  dragon: dragon as ScanFile,
  diya: diya as ScanFile,
  dil: dil as ScanFile,
  shankh: shankh as ScanFile,
  trishul: trishul as ScanFile,
  kalash: kalash as ScanFile,
  kamal: kamal as ScanFile,
  om: om as ScanFile,
  nandi: nandi as ScanFile,
  tajMahal: tajMahal as ScanFile,
  hanuman: hanuman as ScanFile,
  vishnuGaruda: vishnuGaruda as ScanFile,
};
export default files;
