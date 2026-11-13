import { describe, expect, it } from 'vitest';

import { isSiteHost, siteHostsFrom, stripeProduct, type StripeTire } from './stripeProduct';

const PHOTO = 'https://www.usedtires.online/LOTS/PEM/LOTP1015ML/images/a.jpg';
const GENERIC = 'https://www.mrgomatires.com/assets/images/generic-tire-image.webp';
const BLOB = 'https://abc123.public.blob.vercel-storage.com/generic-tire.png';

const used: StripeTire = {
  name: '(264890) | PIRELLI | 235/50/19',
  brand: 'PIRELLI',
  model: 'SCORPION TM MS LR XL',
  size: '235/50/19',
  code: '264890',
  condition: 'Used',
  treadDepth: '8.6',
  remainingLife: '86%',
  patched: 'Yes',
  image: GENERIC,
};

const hosts = siteHostsFrom(['https://www.mrgomatires.com']);

describe('stripeProduct (048)', () => {
  it('names the tire as the cart does, with no codes or bars (AC1)', () => {
    const p = stripeProduct(used, { siteHosts: hosts });
    expect(p.name).toBe('Pirelli Scorpion TM MS LR XL');
    expect(p.name).not.toMatch(/[()|]|264890/);
  });

  it('keeps the composed name for a tire without a model', () => {
    expect(stripeProduct({ ...used, model: undefined }, { siteHosts: hosts }).name).toBe(
      '(264890) | PIRELLI | 235/50/19'
    );
  });

  it('describes a used tire: size, condition, tread, life, patch, stock — no DOT (AC2, D3)', () => {
    expect(stripeProduct(used, { siteHosts: hosts }).description).toBe(
      '235/50/19 · Used · 8.6/32 · 86% life · Patched · Stock #264890'
    );
  });

  it('describes a new tire without tread, life or patch', () => {
    const p = stripeProduct(
      { ...used, condition: 'New', treadDepth: '10', remainingLife: '100%', patched: 'No' },
      { siteHosts: hosts }
    );
    expect(p.description).toBe('235/50/19 · New · Stock #264890');
  });

  it('skips facts the tire does not have, and omits an empty description', () => {
    const p = stripeProduct(
      { ...used, treadDepth: '-', remainingLife: '-', patched: 'No' },
      { siteHosts: hosts }
    );
    expect(p.description).toBe('235/50/19 · Used · No patch · Stock #264890');
    const bare = stripeProduct({ name: 'Item 9' }, { siteHosts: hosts });
    expect(bare).toEqual({ name: 'Item 9' });
  });

  it('sends a real photo from the photo host (AC3)', () => {
    expect(stripeProduct({ ...used, image: PHOTO }, { siteHosts: hosts }).images).toEqual([PHOTO]);
  });

  it("never sends the site's own image: fallback when set, none when not (AC4)", () => {
    expect(stripeProduct(used, { siteHosts: hosts, fallbackImage: BLOB }).images).toEqual([BLOB]);
    expect(stripeProduct(used, { siteHosts: hosts }).images).toBeUndefined();
    // A fallback on the site itself would be just as broken.
    expect(
      stripeProduct(used, { siteHosts: hosts, fallbackImage: GENERIC }).images
    ).toBeUndefined();
  });

  it("treats a Preview's own host as the site's", () => {
    const preview = siteHostsFrom(['https://mrgoma-git-feat-x.vercel.app']);
    const p = stripeProduct(
      {
        ...used,
        image: 'https://mrgoma-git-feat-x.vercel.app/assets/images/generic-tire-image.webp',
      },
      { siteHosts: preview, fallbackImage: BLOB }
    );
    expect(p.images).toEqual([BLOB]);
  });

  it('carries nothing internal (AC8)', () => {
    const text = JSON.stringify(stripeProduct(used, { siteHosts: hosts }));
    expect(text).not.toMatch(/vault|warehouse|shelf|location/i);
  });
});

describe('isSiteHost', () => {
  it('knows the production names and the request host; unreadable counts as site', () => {
    expect(isSiteHost(GENERIC, hosts)).toBe(true);
    expect(isSiteHost('https://mrgomatires.com/x.png', hosts)).toBe(true);
    expect(isSiteHost(PHOTO, hosts)).toBe(false);
    expect(isSiteHost('not a url', hosts)).toBe(true);
  });
});
