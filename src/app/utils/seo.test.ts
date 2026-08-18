import { describe, expect, it } from 'vitest';

import { locationsConfig } from '@/app/(shop)/locations/locationsConfig';
import { WHATSAPP_TEL } from '@/app/utils/whatsapp';

import {
  absUrl,
  buildBreadcrumbJsonLd,
  buildItemListJsonLd,
  buildLocationsJsonLd,
  buildProductJsonLd,
  canonical,
  getSiteUrl,
  organizationJsonLd,
  productDescription,
  productTitle,
  websiteJsonLd,
} from './seo';

describe('absUrl / canonical', () => {
  it('builds absolute URLs from a path using the configured site', () => {
    const site = getSiteUrl();
    expect(site).toMatch(/^https?:\/\//);
    expect(site.endsWith('/')).toBe(false);
    expect(absUrl('/tires')).toBe(`${site}/tires`);
    expect(canonical('/about-us')).toBe(`${site}/about-us`);
  });

  // AC15a — `''` and `'/'` name the same place, so they must produce one string.
  it('treats the bare root and "/" as the same address', () => {
    expect(absUrl('/')).toBe(getSiteUrl());
    expect(absUrl('/')).toBe(absUrl(''));
    expect(absUrl('/').endsWith('/')).toBe(false);
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
    expect(
      productDescription({ brand: 'Michelin', size: '225/40/18', condition: 'new' })
    ).toContain('New tire by Michelin 225/40/18 available in Miami, Florida.');
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

  // AC15a — the site root has one spelling, and the breadcrumb uses it.
  //
  // This is the emitter that used to disagree. `absUrl('/')` returned the
  // slashed form; Next strips it on the way to a canonical tag but not on the
  // way into JSON-LD, so a page claimed `…com` in four places and `…com/` here.
  it('spells the site root the same way the canonical does', () => {
    const ld = buildBreadcrumbJsonLd([{ name: 'Home', url: '/' }]);
    const items = ld.itemListElement as Array<Record<string, unknown>>;
    expect(items[0].item).toBe(getSiteUrl());
    expect(String(items[0].item).endsWith('/')).toBe(false);
  });
});

describe('site-wide JSON-LD', () => {
  it('organizationJsonLd includes the brand and the official TikTok handle', () => {
    const ld = organizationJsonLd();
    expect(ld['@type']).toBe('Organization');
    expect(ld.sameAs).toContain('https://www.tiktok.com/@mrgomatiresofficial');
  });

  it('organizationJsonLd carries the contact and history fields a complete entity needs', () => {
    const ld = organizationJsonLd();
    expect(ld.telephone).toBe(WHATSAPP_TEL);
    expect(ld.foundingDate).toBe('2007');
    expect(ld.slogan).toBeTruthy();
    expect(ld.description).toBeTruthy();
    expect(ld['@id']).toMatch(/#organization$/);
  });

  /**
   * AC15c — the `@id` values keep their slash, deliberately.
   *
   * Unifying how the site spells its own root (AC15a) stops at the entity
   * identifiers. An `@id` is the stable key Google uses to merge an entity
   * across pages and crawls; it is not a claim about a URL and nothing resolves
   * it as one. Changing it re-mints the entity for no gain, so this pins them.
   */
  it('leaves the entity @id values alone — they are keys, not URLs', () => {
    const site = getSiteUrl();
    expect(organizationJsonLd()['@id']).toBe(`${site}/#organization`);
    expect(websiteJsonLd()['@id']).toBe(`${site}/#website`);
  });

  it('organizationJsonLd survives serialization with an ampersand in its description', () => {
    // The description says "Miami & Orlando"; JsonLd must round-trip it.
    const ld = organizationJsonLd();
    expect(String(ld.description)).toContain('&');
    expect(JSON.parse(JSON.stringify(ld))).toEqual(ld);
  });

  it('websiteJsonLd no longer emits the retired sitelinks search box', () => {
    const ld = websiteJsonLd();
    expect(ld['@type']).toBe('WebSite');
    expect(ld).not.toHaveProperty('potentialAction');
  });

  it('websiteJsonLd links to the organization entity', () => {
    expect((websiteJsonLd().publisher as Record<string, unknown>)['@id']).toBe(
      organizationJsonLd()['@id']
    );
  });
});

describe('buildItemListJsonLd', () => {
  it('declares the item count so the rendered claim is backed by data', () => {
    const ld = buildItemListJsonLd({ url: '/tires/used', name: 'Used tires', count: 4342 });
    expect(ld['@type']).toBe('ItemList');
    expect(ld.numberOfItems).toBe(4342);
    expect(ld.url).toBe(absUrl('/tires/used'));
  });
});

describe('buildLocationsJsonLd', () => {
  const CUTLER_BAY = {
    slug: 'cutler-bay',
    name: 'Cutler Bay',
    address: '18200 S Dixie Hwy, Miami, FL 33157',
    phone: '(305) 123',
    mapLink: 'http://map',
    image: '/assets/images/Locations/18200.jpg',
    neighborhoods: ['Cutler Bay', 'Pinecrest'],
    geo: { latitude: 25.6004443, longitude: -80.3537512 },
    hours: [{ days: ['Monday'], opens: '08:00', closes: '18:00' }],
  };

  it('maps a location to an AutoPartsStore with a parsed address', () => {
    const [ld] = buildLocationsJsonLd([CUTLER_BAY]);
    expect(ld['@type']).toBe('AutoPartsStore');
    expect(ld.name).toBe('MrGoma Tires — Cutler Bay');
    expect(ld.hasMap).toBe('http://map');
    const addr = ld.address as Record<string, unknown>;
    expect(addr.streetAddress).toBe('18200 S Dixie Hwy');
    expect(addr.postalCode).toBe('33157');
  });

  // The bug this feature exists to fix: every store used to declare the site
  // root as its URL, so seven businesses claimed one page.
  it('points each store at its own location page, never the site root', () => {
    const [ld] = buildLocationsJsonLd([CUTLER_BAY]);
    expect(ld.url).toBe(absUrl('/locations/cutler-bay'));
    expect(ld.url).not.toBe(getSiteUrl());
    expect(ld['@id']).toBe(`${absUrl('/locations/cutler-bay')}#store`);
  });

  it('gives every real store a distinct URL and identity', () => {
    const nodes = buildLocationsJsonLd(locationsConfig);
    expect(nodes).toHaveLength(locationsConfig.length);
    expect(new Set(nodes.map(n => n.url)).size).toBe(locationsConfig.length);
    expect(new Set(nodes.map(n => n['@id'])).size).toBe(locationsConfig.length);
  });

  it('emits hours and coordinates for every real store', () => {
    for (const node of buildLocationsJsonLd(locationsConfig)) {
      const geo = node.geo as { latitude: number; longitude: number };
      expect(geo).toBeDefined();
      // Florida's bounding box — catches a transposed or mistyped pair.
      expect(geo.latitude).toBeGreaterThan(24);
      expect(geo.latitude).toBeLessThan(31);
      expect(geo.longitude).toBeGreaterThan(-88);
      expect(geo.longitude).toBeLessThan(-80);

      const hours = node.openingHoursSpecification as unknown[];
      expect(hours.length).toBeGreaterThan(0);
      expect(node.priceRange).toBeTruthy();
      expect(node.telephone).toBeTruthy();
    }
  });

  it('links every store back to the organization entity', () => {
    for (const node of buildLocationsJsonLd(locationsConfig)) {
      expect((node.parentOrganization as Record<string, unknown>)['@id']).toBe(
        organizationJsonLd()['@id']
      );
    }
  });

  it('omits optional fields when the source has none', () => {
    const [ld] = buildLocationsJsonLd([
      { slug: 'x', name: 'X', address: 'A St, Town, FL 1', phone: 'p' },
    ]);
    expect(ld.hasMap).toBeUndefined();
    expect(ld.geo).toBeUndefined();
    expect(ld.openingHoursSpecification).toBeUndefined();
  });
});
