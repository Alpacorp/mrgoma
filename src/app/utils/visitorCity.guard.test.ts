import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * Feature 043 keeps one promise that no unit test of a single module can: the
 * page HTML is the same for every visitor and every crawler (FR4, AC8). The
 * only way a page could start varying by location is by reading the location
 * on the server — so only one file may: the `/api/visitor-city` route, whose
 * answer is used in the browser after the page has loaded.
 */

const SRC = join(process.cwd(), 'src');

function files(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return /\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });
}

const sources = files(SRC).map(path => ({
  path: relative(SRC, path),
  text: readFileSync(path, 'utf8'),
}));

describe('visitor city — same HTML for everyone (043)', () => {
  it('reads the network location only in the visitor-city route', () => {
    const readers = sources.filter(f => /x-vercel-ip-|geolocation\(/.test(f.text)).map(f => f.path);
    expect(readers).toEqual(['app/api/visitor-city/route.ts']);
  });

  it('keeps pages and layouts away from request headers and cookies', () => {
    const offenders = sources
      .filter(f => /(^|\/)(page|layout)\.tsx$/.test(f.path))
      .filter(f => /from 'next\/headers'/.test(f.text))
      .map(f => f.path);
    expect(offenders).toEqual([]);
  });

  it('leaves the catalog untouched: /tires code knows nothing about the visitor city (AC14)', () => {
    const catalog = sources
      .filter(f => f.path.startsWith('app/(shop)/tires/'))
      .filter(f => /visitorCity|VisitorCity|useVisitorCity/.test(f.text))
      .map(f => f.path);
    expect(catalog).toEqual([]);
  });

  it('keeps the store directory out of the browser-side module (shared JS budget)', () => {
    const client = sources.find(f => f.path === 'app/utils/visitorCity.ts')!;
    expect(client.text).not.toMatch(/^import /m);
  });
});
