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
};
export default files;
