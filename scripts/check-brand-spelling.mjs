#!/usr/bin/env node
// Guards against the brand name regressing to the misspelling "Airmation"
// (missing the second "i" — correct spelling is "Airimation"). Run via
// `npm run lint` (wired in package.json) or standalone: node scripts/check-brand-spelling.mjs

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const SCAN_DIRS = ["src", "public"];
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".md", ".json", ".svg"]);
const IGNORE_DIRS = new Set(["node_modules", ".next", ".git"]);

// Word-boundary, case-insensitive match on "Airmation" that is NOT preceded
// by justification for being part of a longer correctly-spelled word.
const BAD_SPELLING = /\bair mation\b|\bairmation\b/i;

// Words the company has retired from all materials (Nov 2026):
//  - "Biscope"/"Bioscope": the show-brand name was dropped; no flagship
//    show name has been chosen yet.
//  - "government": gives the wrong impression of who the company is.
const RETIRED = [
  { re: /bi[o]?scope/i, why: 'retired show name "Biscope" — say "the show" or "Airimation show"' },
  { re: /government/i, why: 'the word "government" is not used in Airimation materials — say "civic" or "public"' },
];

let violations = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (IGNORE_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      walk(full);
    } else if (EXTENSIONS.has(extname(entry))) {
      const content = readFileSync(full, "utf8");
      const lines = content.split("\n");
      lines.forEach((line, i) => {
        if (BAD_SPELLING.test(line)) {
          violations.push(`${full}:${i + 1}: ${line.trim()}`);
        }
        for (const { re, why } of RETIRED) {
          if (re.test(line)) violations.push(`${full}:${i + 1}: ${why}\n      ${line.trim().slice(0, 140)}`);
        }
      });
      // Also catch the name split across two adjacent string/JSX literals,
      // e.g. "Air" + "mation", which renders as "Airmation" but won't match
      // a single-line regex.
      if (/>\s*Air\s*<\/?[^>]*>?\s*\n?\s*<span[^>]*>\s*mation/i.test(content)) {
        violations.push(`${full}: brand name appears split as "Air" + "mation" (missing "i")`);
      }
    }
  }
}

for (const dir of SCAN_DIRS) {
  try {
    walk(join(ROOT, dir));
  } catch {
    // directory may not exist; skip
  }
}

if (violations.length > 0) {
  console.error("\n✕ Brand check failed:\n");
  for (const v of violations) console.error(`  ${v}`);
  console.error(`\nThe correct brand name is "Airimation". Fix the above and re-run.\n`);
  process.exit(1);
} else {
  console.log("✓ Brand check passed — spelling, and no retired words.");
}
