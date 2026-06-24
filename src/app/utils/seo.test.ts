import { describe, expect, it } from 'vitest';

import { absUrl, canonical, getSiteUrl, productTitle } from './seo';

describe('absUrl / canonical', () => {
  it('builds absolute URLs from a path using the configured site', () => {
    const site = getSiteUrl();
    expect(site).toMatch(/^https?:\/\//);
    expect(site.endsWith('/')).toBe(false);
    expect(absUrl('/tires')).toBe(`${site}/tires`);
    expect(canonical('/about-us')).toBe(`${site}/about-us`);
  });

  it('leaves already-absolute URLs untouched', () => {
    expect(absUrl('https://example.com/x')).toBe('https://example.com/x');
  });

  it('adds a leading slash when the path is missing one', () => {
    const site = getSiteUrl();
    expect(absUrl('tires')).toBe(`${site}/tires`);
  });
});

describe('productTitle', () => {
  it('composes a title and includes the price when valid', () => {
    expect(
      productTitle({ brand: 'Michelin', size: '225/40/18', condition: 'New', price: 120 })
    ).toBe('New Michelin 225/40/18 Tire in Miami | $120 | Free Shipping');
  });

  it('omits the price when it is zero or invalid', () => {
    expect(productTitle({ brand: 'Toyo', price: 0 })).toBe('Toyo Tire in Miami | Free Shipping');
  });
});
