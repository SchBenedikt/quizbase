#!/usr/bin/env node
/**
 * build-worker-assets.mjs
 *
 * After `next build`, assembles the `out/` directory for Cloudflare Workers:
 *
 *   1. Copies pre-rendered HTML from `.next/server/app/**` to `out/`
 *      - index page:      .next/server/app/index.html → out/index.html
 *      - static pages:    .next/server/app/login.html → out/login.html
 *      - dynamic shells:  .next/server/app/presenter/_.html → out/presenter/_.html
 *
 *   2. Copies client-side JS/CSS from `.next/static/**` to `out/_next/static/**`
 *
 * The Cloudflare Worker (src/worker.js) then routes each URL to the correct
 * HTML file from this `out/` directory.
 */

import fs from 'fs';
import path from 'path';

const ROOT = new URL('..', import.meta.url).pathname;
const SERVER_APP = path.join(ROOT, '.next', 'server', 'app');
const STATIC_SRC = path.join(ROOT, '.next', 'static');
const OUT = path.join(ROOT, 'out');

// ── Helpers ──────────────────────────────────────────────────────────────────

function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFile(src, dest) {
  mkdirp(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  mkdirp(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else {
      copyFile(s, d);
    }
  }
}

/**
 * Walk `.next/server/app/` and collect every `.html` file.
 * Returns an array of { src, destRelative } objects.
 *
 * Next.js App Router names static HTML files like:
 *   - Root page  : index.html  (url: /)
 *   - login.html              (url: /login)
 *   - dashboard.html          (url: /dashboard)
 *   - presenter/_.html        (url: /presenter/<id>)
 *   - presenter/_/stats.html  (url: /presenter/<id>/stats)
 *   - etc.
 */
function collectHtmlFiles(dir, baseDir) {
  const results = [];
  if (!fs.existsSync(dir)) {
    console.error(`❌  Source directory not found: ${dir}`);
    console.error('   Run `npm run build` before running this script.');
    process.exit(1);
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectHtmlFiles(fullPath, baseDir));
    } else if (entry.name.endsWith('.html')) {
      const relative = path.relative(baseDir, fullPath);
      results.push({ src: fullPath, destRelative: relative });
    }
  }
  return results;
}

// ── Main ─────────────────────────────────────────────────────────────────────

console.log('📦  Building Cloudflare Worker assets...\n');

// 1. Clean output directory
if (fs.existsSync(OUT)) {
  fs.rmSync(OUT, { recursive: true, force: true });
}
mkdirp(OUT);

// 2. Copy HTML files
const htmlFiles = collectHtmlFiles(SERVER_APP, SERVER_APP);
let copied = 0;
for (const { src, destRelative } of htmlFiles) {
  const dest = path.join(OUT, destRelative);
  copyFile(src, dest);
  console.log(`  ✓  ${destRelative}`);
  copied++;
}
console.log(`\n  Copied ${copied} HTML file(s) to out/\n`);

// 3. Copy robots.txt and sitemap.xml
// In Next.js App Router these are route handlers (directories), not plain files.
// Skip them here — the worker handles robots.txt and sitemap.xml inline.

// 4. Copy _next/static (JS chunks, CSS, media)
const staticDest = path.join(OUT, '_next', 'static');
copyDir(STATIC_SRC, staticDest);
console.log('\n  ✓  _next/static/ copied\n');

// 5. Copy public/ directory (images, favicon, etc.)
const PUBLIC_SRC = path.join(ROOT, 'public');
if (fs.existsSync(PUBLIC_SRC)) {
  copyDir(PUBLIC_SRC, OUT);
  console.log('  ✓  public/ copied\n');
}

console.log('✅  Worker assets assembled in out/\n');

// Print a summary of the out/ directory
function listDir(dir, prefix = '') {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      console.log(`  ${prefix}${entry.name}/`);
      if (!['_next'].includes(entry.name)) {
        listDir(path.join(dir, entry.name), prefix + '  ');
      }
    } else {
      console.log(`  ${prefix}${entry.name}`);
    }
  }
}
console.log('out/ structure:');
listDir(OUT);
