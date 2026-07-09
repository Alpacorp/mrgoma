// Performance budget guard (feature 009-perf-budget / P1.8).
//
// Enforces a JS-weight budget on the production build so a future change can't
// silently regress the JS that drives INP/TBT. Next 16 (Turbopack) does not emit
// per-route First-Load JS, so we budget the two numbers it exposes reliably:
//   - sharedFirstLoadJs: gzip of rootMainFiles + polyfillFiles (the First Load JS
//     shared by EVERY app-router page — the dominant, cross-route floor).
//   - totalClientJs: gzip of every static chunk (catches deferred/dep bloat too).
//
// Pure functions are exported for unit tests; the CLI runs only when executed
// directly. Fails loudly (non-zero) on a breach OR a missing/empty manifest, so a
// broken build or a Turbopack format change can never pass silently.
//
// Usage: node scripts/perf-budget.mjs   (after `next build`)

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const KB = 1024;

/** Gzipped byte length of a file. */
export const gzipBytes = filePath => gzipSync(readFileSync(filePath)).length;

/**
 * Measure the build's JS weight from `.next`. Returns bytes (gzip).
 * Throws if the manifest is missing or has no `rootMainFiles` — a build that
 * didn't produce shared chunks (or a format change) must fail, not pass.
 */
export function measure(nextDir = '.next') {
  const manifest = JSON.parse(readFileSync(join(nextDir, 'build-manifest.json'), 'utf8'));
  const sharedFiles = [...(manifest.rootMainFiles ?? []), ...(manifest.polyfillFiles ?? [])];
  if (sharedFiles.length === 0) {
    throw new Error(
      'build-manifest.json has no rootMainFiles — the build is missing or its format changed.'
    );
  }

  let sharedFirstLoadJs = 0;
  for (const f of sharedFiles) sharedFirstLoadJs += gzipBytes(join(nextDir, f));

  const chunkDir = join(nextDir, 'static', 'chunks');
  let totalClientJs = 0;
  for (const f of readdirSync(chunkDir)) {
    if (f.endsWith('.js')) totalClientJs += gzipBytes(join(chunkDir, f));
  }

  return { sharedFirstLoadJs, totalClientJs };
}

/**
 * Compare measured bytes against a budget ({ metric: { limitKB } }).
 * Returns per-metric results and an overall pass flag. Pure — easy to unit-test.
 */
export function evaluateBudget(measured, budget) {
  const results = Object.keys(budget)
    .filter(key => typeof budget[key]?.limitKB === 'number')
    .map(key => {
      const limitBytes = budget[key].limitKB * KB;
      const valueBytes = measured[key] ?? 0;
      return { key, valueBytes, limitBytes, ok: valueBytes <= limitBytes };
    });
  return { results, pass: results.every(r => r.ok) };
}

function main() {
  const budget = JSON.parse(readFileSync('perf-budget.json', 'utf8'));
  const measured = measure();
  const { results, pass } = evaluateBudget(measured, budget);

  console.log('Performance budget — client JS (gzip):');
  for (const r of results) {
    const value = (r.valueBytes / KB).toFixed(1);
    const limit = (r.limitBytes / KB).toFixed(0);
    console.log(`  ${r.ok ? '✓' : '✗'} ${r.key}: ${value} KB (limit ${limit} KB)`);
  }

  if (!pass) {
    console.error('\n✗ Performance budget exceeded. Trim JS or bump perf-budget.json deliberately.');
    process.exit(1);
  }
  console.log('\n✓ Within performance budget.');
}

// Run the CLI only when executed directly (not when imported by tests).
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
