// Leonida Trophy Guide — GTA 6 trophy guide entry (Node 22, stdlib only).
// The guide itself is plain static files in app/ (index.html, style.css,
// app.js and app/data/trophies.json): no build step, no network at run time.
// This program hands the entry in: it copies app/ and screenshots/ from
// beside this file into /output (or MAKEFUN_OUTPUT_DIR outside the grader)
// and writes /output/dossier.json with the vendored make.fun library, the
// summary the judge reads. Leave vendor/makefun-frontend.ts untouched: the
// scorer rebuilds the dossier with its own copy and compares byte for byte.
//
// Run it locally to check the entry before submitting:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps: only text_max_bytes shapes the bytes; the rest
// refuse an entry the scorer would refuse (more than 4 screenshots or one
// over 256 KiB; more than 993 files and directories in app/ or 48 MiB of
// app files, counted beside /output's own 1000-entry cap).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
