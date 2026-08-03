// Home-screen / PWA app icons, derived from the brand logo.
//
// Why this exists: `public/desk-logo.png` is a *lockup* — the chevrons plus the
// "MrGoma TIRES" wordmark — and its ink occupies only 513x90 of a 513x512
// canvas. Pointed at as an app icon it produced a tile that was 82% empty, with
// a wordmark far too small to read at the ~60px iOS actually renders. Several
// browsers refused it outright and fell back to a generated letter tile, which
// is the bug this script fixes.
//
// So the icon is built from the chevrons alone — the part of the mark that
// survives being shrunk — on a flat brand field. Same reasoning as
// src/app/opengraph-image.tsx, which was likewise redrawn for legibility at
// thumbnail size: one big shape, nothing that has to be *read*.
//
// Outputs are committed to public/icons/. This is a design-time tool, not part
// of the build — nothing in CI runs it. Re-run it only when the brand art
// changes, and commit the result:
//
//   npm run icons:generate
//
// Requires `sharp`, which is present transitively via Next's image optimizer.

import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'public', 'desk-logo.png');
const OUT_DIR = join(ROOT, 'public', 'icons');

/** Brand lime, sampled from the logo art itself. */
const LIME = { r: 0x9b, g: 0xff, b: 0x05 };
/** The near-black used for "TIRES" in the logo and for the OG wordmark. */
const INK = { r: 0x0a, g: 0x0a, b: 0x0a };

/** Band of the source lockup that holds the four chevrons, ahead of "MrGoma". */
const CHEVRONS = { left: 0, top: 211, width: 272, height: 90 };

/**
 * Share of the tile width the mark spans on a normal icon. Full-bleed: iOS and
 * Android both apply their own rounded mask, so the field must reach the edges.
 */
const COVERAGE = 0.78;

/**
 * Maskable icons may be cropped to any shape inside a circle 80% of the tile
 * wide, so the mark has to fit that circle. At this coverage the 3:1 mark's
 * half-diagonal is ~170px against the 205px safe radius — comfortably inside.
 */
const MASKABLE_COVERAGE = 0.63;

/** The chevrons, lifted out of the lockup and trimmed to their own ink. */
async function chevronMark() {
  // Two passes on purpose: within one pipeline sharp runs trim before extract.
  const band = await sharp(SRC).extract(CHEVRONS).png().toBuffer();
  return sharp(band).trim().png().toBuffer();
}

/** Repaint art to a flat colour, preserving its alpha exactly. */
async function recolour(art, { r, g, b }) {
  const img = sharp(art);
  const { width, height } = await img.metadata();
  const alpha = await img.clone().extractChannel('alpha').toBuffer();
  return sharp({ create: { width, height, channels: 3, background: { r, g, b } } })
    .joinChannel(alpha)
    .png()
    .toBuffer();
}

/**
 * A square tile: flat opaque field, mark centred at `coverage` of the width.
 * The result carries no alpha — iOS composites a transparent icon onto black,
 * which is how a light logo turns into a dark smudge on the home screen.
 */
async function tile({ size, art, coverage }) {
  const mark = await sharp(art)
    .resize({ width: Math.round(size * coverage) })
    .toBuffer();
  // Compositing RGBA art promotes the canvas back to RGBA, so alpha has to be
  // dropped explicitly at the output stage — `channels: 3` on the field alone
  // is not enough. The mark's antialiased edges flatten against LIME.
  return sharp({ create: { width: size, height: size, channels: 3, background: LIME } })
    .composite([{ input: mark, gravity: 'centre' }])
    .removeAlpha()
    .png({ compressionLevel: 9 })
    .toBuffer();
}

const mark = await recolour(await chevronMark(), INK);
mkdirSync(OUT_DIR, { recursive: true });

// 192 and 512 are the two sizes an installable manifest is expected to declare;
// 180 is the size Apple documents for apple-touch-icon.
const targets = [
  { file: 'icon-192.png', size: 192, coverage: COVERAGE },
  { file: 'icon-512.png', size: 512, coverage: COVERAGE },
  { file: 'icon-maskable-512.png', size: 512, coverage: MASKABLE_COVERAGE },
  { file: 'apple-touch-icon.png', size: 180, coverage: COVERAGE },
];

for (const { file, size, coverage } of targets) {
  const png = await tile({ size, art: mark, coverage });
  await sharp(png).toFile(join(OUT_DIR, file));
  console.log(`${file.padEnd(24)} ${size}x${size}  ${(png.length / 1024).toFixed(1)} KB`);
}
