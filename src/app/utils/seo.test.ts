import { describe, expect, it } from 'vitest';

import {
  absUrl,
  buildBreadcrumbJsonLd,
  buildProductJsonLd,
  canonical,
  getSiteUrl,
  productDescription,
  productTitle,
} from './seo';

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

describe('productDescription', () => {
  it('describes a new tire', () => {
    expect(productDescription({ brand: 'Michelin', size: '225/40/18', condition: 'new' })).toContain(
      'New tire by Michelin 225/40/18 available in Miami, Florida.'
    );
  });

  it('adds remaining life and patched status only for used tires', () => {
    const d = productDescription({ condition: 'used', remainingLife: '70%', patched: 'No' });
    expect(d).toContain('Used tire');
    expect(d).toContain('Approx. remaining life: 70%.');
    expect(d).toContain('Patched: No.');
  });
});

describe('buildProductJsonLd', () => {
  it('builds a Product schema with a formatted Offer price', () => {
    const ld = buildProductJsonLd({
      url: 'https://x/p',
      name: 'Tire',
      brand: 'Michelin',
      price: '120',
      condition: 'New',
      sku: '42',
    });
    expect(ld['@type']).toBe('Product');
    expect(ld.name).toBe('Tire');
    const offer = ld.offers as Record<string, unknown>;
    expect(offer.price).toBe('120.00');
    expect(offer.itemCondition).toBe('https://schema.org/NewCondition');
    expect(offer.availability).toBe('https://schema.org/InStock');
  });

  it('uses UsedCondition and omits an invalid price', () => {
    const ld = buildProductJsonLd({ url: 'u', name: 'n', condition: 'Used', price: '-' });
    const offer = ld.offers as Record<string, unknown>;
    expect(offer.itemCondition).toBe('https://schema.org/UsedCondition');
    expect(offer.price).toBeUndefined();
  });
});

describe('buildBreadcrumbJsonLd', () => {
  it('numbers items from 1 and tags the list', () => {
    const ld = buildBreadcrumbJsonLd([
      { name: 'Home', url: '/' },
      { name: 'Tires', url: '/tires' },
    ]);
    expect(ld['@type']).toBe('BreadcrumbList');
    const items = ld.itemListElement as Array<Record<string, unknown>>;
    expect(items).toHaveLength(2);
    expect(items[0].position).toBe(1);
    expect(items[1].name).toBe('Tires');
  });
});
