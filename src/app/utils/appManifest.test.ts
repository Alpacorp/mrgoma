import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { APPLE_TOUCH_ICON, APP_ICONS, staffManifest, storefrontManifest } from './appManifest';

/**
 * The bug these guard against: the manifests advertised one icon as
 * `sizes: 'any'` pointing at a 513x512 file whose artwork occupied a 513x90
 * band, and the head linked the same file as apple-touch-icon. Home screens
 * showed a generated letter tile instead of the brand, and where the file did
 * load the logo was a sliver adrift in empty space.
 *
 * So the assertions are about the actual bytes on disk, not just the strings in
 * the manifest — a declared size that no longer matches its PNG is the failure
 * mode that would bring the bug back.
 */

const PUBLIC_DIR = join(process.cwd(), 'public');

/** PNG colour type 6 carries an alpha channel; 2 is plain truecolour RGB. */
const COLOUR_TYPE_RGBA = 6;

/**
 * Read width, height and colour type straight out of a PNG's IHDR chunk, which
 * is always the first chunk and always at a fixed offset. Done by hand so the
 * test suite needs no image library.
 */
function readPngHeader(path: string) {
  const buf = readFileSync(path);
  const signature = buf.subarray(0, 8).toString('hex');
  expect(signature, `${path} is not a PNG`).toBe('89504e470d0a1a0a');
  expect(buf.subarray(12, 16).toString('ascii'), `${path} has no IHDR`).toBe('IHDR');
  return {
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
    colourType: buf.readUInt8(25),
  };
}

const iconFile = (src: string) => join(PUBLIC_DIR, src.replace(/^\//, ''));

describe('app icons', () => {
  it('declares an explicit pixel size for every icon, never "any"', () => {
    expect(APP_ICONS?.length).toBeGreaterThan(0);
    for (const icon of APP_ICONS ?? []) {
      expect(icon.sizes, `${icon.src} must declare real pixels`).toMatch(/^\d+x\d+$/);
    }
  });

  it('offers the 192 and 512 pair an installable manifest is expected to have', () => {
    const sizes = (APP_ICONS ?? []).filter(i => i.purpose === 'any').map(i => i.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');
  });

  it('ships a separate maskable drawing, so Android does not crop the mark', () => {
    const maskable = (APP_ICONS ?? []).filter(i => i.purpose === 'maskable');
    expect(maskable).toHaveLength(1);
    // Same art at a smaller coverage would still be one file; it must not be
    // the full-bleed icon doing double duty.
    const anyIcons = (APP_ICONS ?? []).filter(i => i.purpose === 'any').map(i => i.src);
    expect(anyIcons).not.toContain(maskable[0].src);
  });

  it('points every declared icon at a file that exists and is exactly that size', () => {
    for (const icon of [...(APP_ICONS ?? []), { src: APPLE_TOUCH_ICON, sizes: '180x180' }]) {
      const path = iconFile(icon.src);
      expect(existsSync(path), `${icon.src} is missing from public/`).toBe(true);

      const [w, h] = icon.sizes!.split('x').map(Number);
      const header = readPngHeader(path);
      expect({ width: header.width, height: header.height }, `${icon.src} size drifted`).toEqual({
        width: w,
        height: h,
      });
    }
  });

  it('keeps the icons square', () => {
    for (const icon of [...(APP_ICONS ?? []), { src: APPLE_TOUCH_ICON }]) {
      const { width, height } = readPngHeader(iconFile(icon.src));
      expect(width, `${icon.src} is not square`).toBe(height);
    }
  });

  // iOS composites a transparent home-screen icon onto black, which is how a
  // logo drawn in light ink turns into a dark smudge on the phone.
  it('gives iOS an opaque apple-touch-icon', () => {
    expect(readPngHeader(iconFile(APPLE_TOUCH_ICON)).colourType).not.toBe(COLOUR_TYPE_RGBA);
  });
});

describe('web app manifests', () => {
  it('serves both apps from the one icon list', () => {
    expect(storefrontManifest().icons).toBe(APP_ICONS);
    expect(staffManifest().icons).toBe(APP_ICONS);
  });

  it('opens the storefront at the site root', () => {
    const m = storefrontManifest();
    expect(m.start_url).toBe('/');
    expect(m.display).toBe('standalone');
  });

  // The crew's app opens on /login and then lives on /dashboard, so a scope
  // that stopped at the entry point would drop them into the browser one tap
  // after signing in.
  it('opens the staff portal on /login but scopes it to the whole site', () => {
    const m = staffManifest();
    expect(m.start_url).toBe('/login');
    expect(m.scope).toBe('/');
    expect(m.display).toBe('standalone');
  });

  it('keeps the two apps distinguishable on a home screen', () => {
    expect(staffManifest().short_name).not.toBe(storefrontManifest().short_name);
  });
});
