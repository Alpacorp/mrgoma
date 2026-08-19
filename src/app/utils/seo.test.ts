import { describe, expect, it } from 'vitest';

import { locationsConfig } from '@/app/(shop)/locations/locationsConfig';
import { servicesConfig } from '@/app/(shop)/services/servicesConfig';
import { SHIPPING, WARRANTY } from '@/app/utils/brandClaims';
import { WHATSAPP_TEL } from '@/app/utils/whatsapp';

import {
  absUrl,
  TITLE_MAX,
  DESCRIPTION_MAX,
  DEFAULT_OG_IMAGE,
  productMetadata,
  brandName,
  buildBreadcrumbJsonLd,
  buildItemListJsonLd,
  buildLocationsJsonLd,
  buildProductJsonLd,
  canonical,
  getSiteUrl,
  locationMetadata,
  buildArticleJsonLd,
  buildServiceJsonLd,
  organizationId,
  organizationJsonLd,
  productDescription,
  productTitle,
  storeServes,
  storeStreet,
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

// AC5
describe('brandName', () => {
  it('renders a stored ALL-CAPS brand for display', () => {
    expect(brandName('BRIDGESTONE')).toBe('Bridgestone');
    expect(brandName('YOKOHAMA')).toBe('Yokohama');
  });

  /**
   * `'BACK COUNTRY '` is stored with a trailing space. Left alone it renders a
   * double space before the model in every title for that brand.
   */
  it('trims a brand the catalog stores with a trailing space', () => {
    expect(brandName('BACK COUNTRY ')).toBe('Back Country');
    expect(brandName('BACK COUNTRY ')).not.toMatch(/ {2}/);
  });

  it('keeps the spelling of a brand that title case would get wrong', () => {
    expect(brandName('BFGOODRICH')).toBe('BFGoodrich');
  });

  it('degrades to title case for a brand it has never seen', () => {
    expect(brandName('NEWBRAND')).toBe('Newbrand');
    expect(brandName('Unknown')).toBe('Unknown');
    expect(brandName(undefined)).toBe('');
    expect(brandName('')).toBe('');
  });
});

describe('productTitle', () => {
  // AC1, AC3 — rung 1: everything fits, including the brand suffix.
  it('keeps model, price and the brand suffix when they all fit', () => {
    expect(
      productTitle({
        brand: 'BRIDGESTONE',
        model: 'WEATHERPEAK',
        size: '225/55/18',
        condition: 'Used',
        price: 145,
      })
    ).toBe('Used Bridgestone WEATHERPEAK 225/55/18 — $145 | MrGoma');
  });

  /**
   * AC3 — rung 2. The suffix is sacrificed *before* the price: it is identical on
   * all 1.622 product pages, so it differentiates nothing, while the price is the
   * reason `014` touched this builder at all.
   */
  it('drops the brand suffix before it drops the price', () => {
    const title = productTitle({
      brand: 'GOODYEAR',
      model: 'EAGLE F1 ASYMMETRIC 5 NF0 XL',
      size: '265/35/21',
      condition: 'Used',
      price: 260,
    });

    expect(title).toContain('$260');
    expect(title).not.toContain(' | MrGoma');
    expect(title.length).toBeLessThanOrEqual(TITLE_MAX);
  });

  // AC3 — rung 4: a 51-character model cannot fit, so the model goes last.
  it('drops the model only when nothing shorter will do', () => {
    const title = productTitle({
      brand: 'GOODYEAR',
      model: 'EAGLE F1 ASYMMETRIC SUV 4X4 AT J LR XL SOUNDCOMFORT',
      size: '235/50/20',
      condition: 'Used',
      price: 120,
    });

    expect(title).toBe('Used Goodyear 235/50/20 — $120 | MrGoma');
    expect(title).toContain('$120');
  });

  // AC6 — the manufacturer's spelling of a model is never rewritten.
  it('passes acronyms in a model through untouched', () => {
    expect(
      productTitle({
        brand: 'BRIDGESTONE',
        model: 'ALENZA A/S 02 RSC RFT',
        size: '235/50/20',
        condition: 'Used',
      })
    ).toContain('ALENZA A/S 02 RSC RFT');
  });

  /**
   * The price arrives as the string `'-'` for a tire that has none — the sentinel
   * `mapTireRecordToSingleTire` writes. `Number('-')` is `NaN`.
   */
  it('omits the price when it is zero, absent or the catalog sentinel', () => {
    for (const price of [0, undefined, '-', 'n/a'] as const) {
      expect(productTitle({ brand: 'Toyo', size: '225/40/18', condition: 'Used', price })).toBe(
        'Used Toyo 225/40/18 | MrGoma'
      );
    }
  });

  // AC10 — `fitTitle` selects by length; it does not normalise what it selects.
  it('leaves no gap where an absent field would have gone', () => {
    const cases = [
      { brand: 'Toyo', size: '225/40/18', condition: 'Used', price: 120 },
      { brand: 'Toyo', condition: 'Used', price: 120 },
      { brand: 'Toyo', model: 'PROXES', condition: 'Used' },
      { brand: 'BACK COUNTRY ', model: 'A/T', size: '265/70/17', condition: 'Used' },
      { brand: 'Toyo' },
    ];

    for (const params of cases) {
      expect(productTitle(params)).not.toMatch(/ {2}/);
      expect(productTitle(params)).toBe(productTitle(params).trim());
    }
  });

  // AC1, AC2 — the budget holds, and nothing supplied is silently discarded.
  it('fits the budget and keeps every field it was given', () => {
    const params = {
      brand: 'PIRELLI',
      model: 'SCORPION TM ZERO ALL SEASON MOE-S ELECT PNCS RFT XL',
      size: '275/45/21',
      condition: 'New',
      price: 310,
    };
    const title = productTitle(params);

    expect(title.length).toBeLessThanOrEqual(TITLE_MAX);
    expect(title).toContain('New');
    expect(title).toContain('Pirelli');
    expect(title).toContain('275/45/21');
  });
});

describe('productDescription', () => {
  const USED = {
    brand: 'BRIDGESTONE',
    model: 'WEATHERPEAK',
    size: '225/55/18',
    condition: 'Used',
    remainingLife: '90%',
    patched: 'No',
    price: 145,
  };

  // AC7 — the price is inside the window, not appended past it.
  it('states the price where Google will still be rendering', () => {
    const d = productDescription(USED);
    expect(d.indexOf('$145')).toBeGreaterThan(-1);
    expect(d.indexOf('$')).toBeLessThan(DESCRIPTION_MAX);
    expect(d.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
  });

  it('describes the real state of a used tire', () => {
    const d = productDescription(USED);
    expect(d).toContain('Used Bridgestone WEATHERPEAK 225/55/18');
    expect(d).toContain('90% tread life left');
    expect(d).toContain('never patched');
    expect(d).toContain(WARRANTY);
    expect(d).toContain(SHIPPING);
  });

  /**
   * `WARRANTY_LONG` is "30-Day Warranty **on Like-New Used Tires**". Attaching it
   * to a new tire would claim something the constant does not support.
   */
  it('makes no used-tire warranty claim about a new tire', () => {
    const d = productDescription({ ...USED, condition: 'New' });
    expect(d).toContain('Brand new');
    expect(d).toContain(SHIPPING);
    expect(d).not.toContain(WARRANTY);
    expect(d).not.toContain('tread life');
    expect(d.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
  });

  // The `'-'` sentinel again: `remainingLife` is `'-'` when the record has none.
  it('says nothing about tread life it does not know', () => {
    const d = productDescription({ ...USED, remainingLife: '-', patched: undefined });
    expect(d).not.toContain('tread life');
    expect(d).not.toContain('-.');
    expect(d).not.toMatch(/ {2}/);
    expect(d.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
  });

  // AC7 — the ceiling holds even for the catalog's longest model.
  it('drops the model rather than overflow the window', () => {
    const d = productDescription({
      ...USED,
      model: 'EAGLE F1 ASYMMETRIC SUV 4X4 AT J LR XL SOUNDCOMFORT',
    });
    expect(d.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
    expect(d).toContain('$145');
  });
});

describe('productMetadata', () => {
  const TIRE = {
    brand: 'BRIDGESTONE',
    model: 'ALENZA A/S 02 RSC RFT',
    size: '235/50/20',
    condition: 'Used',
    remainingLife: '99%',
    patched: 'No',
    price: 135,
    path: '/tires/1234-bridgestone-235-50-20',
    images: ['/uploads/tire-1.jpg'],
  };

  /**
   * AC4 — the `021` defect this route still carried. A plain `title` string lets
   * the root `%s | MrGoma Tires` template append the brand on top of the one the
   * string already ends with.
   */
  it('sets an absolute title so the root template cannot append the brand again', () => {
    const title = productMetadata(TIRE).title as { absolute: string };

    expect(title.absolute).toBeTypeOf('string');
    expect(title.absolute.length).toBeLessThanOrEqual(TITLE_MAX);

    // "At most once", not "exactly once": this fixture's model is long enough
    // that the suffix is sacrificed, which is the ladder working. What must never
    // happen is twice — the brand in the string *and* the brand from the template.
    for (const fixture of [TIRE, { ...TIRE, model: 'WEATHERPEAK' }]) {
      const absolute = (productMetadata(fixture).title as { absolute: string }).absolute;
      expect((absolute.match(/MrGoma/g) ?? []).length).toBeLessThanOrEqual(1);
    }

    // …and the short-model fixture proves the suffix is reachable at all.
    const shortModel = (
      productMetadata({ ...TIRE, model: 'WEATHERPEAK' }).title as { absolute: string }
    ).absolute;
    expect(shortModel).toContain('MrGoma');
  });

  // AC9 — social cards are not cut at 60, so they keep what `014` added.
  it('keeps the price and the shipping promise on the social cards', () => {
    const meta = productMetadata(TIRE);

    for (const social of [meta.openGraph?.title, meta.twitter?.title]) {
      expect(String(social)).toContain('$135');
      expect(String(social)).toContain('Free Shipping');
    }
  });

  it('gives the search result and the social card different titles', () => {
    const meta = productMetadata(TIRE);
    const search = (meta.title as { absolute: string }).absolute;

    expect(String(meta.openGraph?.title).length).toBeGreaterThan(search.length);
  });

  it('declares its own canonical and the tire photo', () => {
    const meta = productMetadata(TIRE);

    expect(meta.alternates?.canonical).toBe(canonical(TIRE.path));
    expect(String(meta.openGraph?.url)).toBe(canonical(TIRE.path));
    expect(JSON.stringify(meta.openGraph?.images)).toContain(absUrl('/uploads/tire-1.jpg'));
  });

  it('falls back to the site card when the tire has no photo', () => {
    const meta = productMetadata({ ...TIRE, images: [] });
    expect(JSON.stringify(meta.openGraph?.images)).toContain(DEFAULT_OG_IMAGE.url);
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
    expect(ld.foundingDate).toBe('2006');
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

  /**
   * The logo Google may show beside a result.
   *
   * It was the 32×32 favicon, as a bare string. Google's minimum is 112 px on
   * the shorter side, so the old value was not merely poor — it was below the
   * threshold at which the field is used at all.
   */
  it('declares a real logotype, big enough for Google to use', async () => {
    const { existsSync, readFileSync } = await import('node:fs');
    const { join } = await import('node:path');

    const logo = organizationJsonLd().logo as {
      '@type': string;
      url: string;
      width: number;
      height: number;
    };

    expect(logo['@type']).toBe('ImageObject');
    expect(Math.min(logo.width, logo.height)).toBeGreaterThanOrEqual(112);

    const file = join(process.cwd(), 'public', new URL(logo.url).pathname);
    expect(existsSync(file)).toBe(true);

    // The declared dimensions must be the file's own, or the claim is decorative.
    const header = readFileSync(file).subarray(16, 24);
    expect(header.readUInt32BE(0)).toBe(logo.width);
    expect(header.readUInt32BE(4)).toBe(logo.height);
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

/**
 * The two nodes that used to be built inside a page.
 *
 * Between them they carried all three inline descriptions of this business — the
 * Article's `author` and `publisher`, and the Service's `provider` — while every
 * node emitted from `seo.ts` referenced the entity `@id` correctly. Moving them
 * is what removes the duplication; referencing the `@id` is what keeps it gone.
 */
describe('nodes that name the business reference it, rather than describing it', () => {
  const article = buildArticleJsonLd({
    heading: 'How to Buy Used Tires',
    description: 'x'.repeat(60),
    slug: 'how-to-buy-used-tires',
    publishDate: '2026-05-01',
  });
  const service = buildServiceJsonLd({ name: 'Wheel Alignment', description: 'y'.repeat(60) });

  it('points the article at the organization entity, twice', () => {
    expect(article.author).toEqual({ '@id': organizationId() });
    expect(article.publisher).toEqual({ '@id': organizationId() });
    // The old publisher carried the 32x32 favicon as its logo.
    expect(JSON.stringify(article)).not.toContain('favicon');
  });

  it('points the service at the same entity', () => {
    expect(service.provider).toEqual({ '@id': organizationId() });
    // The old provider hardcoded the site URL instead of deriving it.
    expect(JSON.stringify(service)).not.toContain("url': 'https://www.mrgomatires.com'");
  });

  it('gives the article an image with dimensions', () => {
    const image = article.image as { '@type': string; width: number; height: number };
    expect(image['@type']).toBe('ImageObject');
    expect(image.width).toBe(1200);
    expect(image.height).toBe(630);
  });

  /**
   * Absent, not corrected.
   *
   * Every guide used to claim it was modified on its publication day.
   * `guidesConfig` holds no edit date, so there is nothing true to put here, and
   * a field nobody maintains becomes a lie the first time a guide is edited.
   */
  it('claims no modification date it cannot substantiate', () => {
    expect(article).not.toHaveProperty('dateModified');
    expect(article.datePublished).toBe('2026-05-01');
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

/**
 * AC15 — a store shares as itself.
 *
 * Every one of the seven already carries a storefront photo in `locationsConfig`,
 * so this costs nothing but was never wired up. The file check matters: a bad
 * path would ship a preview card that silently fails to load, and nothing in the
 * rendered page would show it.
 */
/**
 * AC9 — the type changes; the facts underneath it must not.
 *
 * `geo`, `hasMap`, `openingHoursSpecification`, `areaServed` and `address` were
 * verified store by store on 2026-08-04, after Miami Gardens was found holding
 * the coordinates of a locksmith in the same plaza. A wrong pin sends a customer
 * to the wrong place, so these are asserted **against the config**, field by
 * field, rather than as a vague "unchanged".
 */
describe('retyping the stores leaves their verified facts alone', () => {
  const nodes = buildLocationsJsonLd(locationsConfig);

  it.each(locationsConfig.map((l, i) => [l.slug, l, i] as const))(
    '%s keeps the coordinates, map link, hours, areas and address it was verified with',
    (_slug, store, index) => {
      const node = nodes[index] as Record<string, never>;

      expect(node['@type']).toEqual(['TireShop', 'AutoRepair']);
      expect(node.geo).toMatchObject({
        latitude: store.geo.latitude,
        longitude: store.geo.longitude,
      });
      expect(node.hasMap).toBe(store.mapLink);
      expect(node.openingHoursSpecification).toHaveLength(store.hours.length);
      expect(node.areaServed).toBeTruthy();
      expect(String(JSON.stringify(node.address))).toContain(store.address.split(',')[0]);
    }
  );

  /**
   * AC9b — the type rests on a claim the site makes elsewhere.
   *
   * `/services` states the eight services run at all seven locations. If that
   * copy ever narrows, `AutoRepair` on every store stops being justified and this
   * is the test that should send someone back to it.
   */
  it('is justified by the site claiming eight services at seven locations', () => {
    expect(servicesConfig).toHaveLength(8);
    expect(locationsConfig).toHaveLength(7);
  });
});

describe('store preview cards', () => {
  it.each(locationsConfig.map(l => [l.slug, l] as const))(
    '%s shares its own storefront photo, and the file exists',
    async (_slug, store) => {
      const { existsSync } = await import('node:fs');
      const { join } = await import('node:path');

      const meta = locationMetadata({
        name: store.name,
        slug: store.slug,
        city: store.city,
        image: store.image,
      });
      const [image] = meta.openGraph?.images as Array<{ url: string; alt: string }>;

      expect(image.url).toBe(absUrl(store.image));
      expect(image.alt).toContain(store.name);
      expect(existsSync(join(process.cwd(), 'public', store.image))).toBe(true);
    }
  );
});

/**
 * The two derivations that let seven store descriptions differ in substance
 * rather than in a name. Driven from `locationsConfig` itself, so they are
 * assertions about the real stores rather than about examples chosen to pass.
 */
describe('store facts derived from config', () => {
  it.each(locationsConfig.map(l => [l.slug, l] as const))(
    '%s yields a street from its address',
    (_slug, store) => {
      const street = storeStreet(store.address);
      expect(street.length).toBeGreaterThan(3);
      // The house number belongs to the postal address, not to "where the shop is".
      expect(street).not.toMatch(/^\d/);
      expect(store.address).toContain(street);
    }
  );

  it.each(locationsConfig.map(l => [l.slug, l] as const))(
    '%s yields at least two areas to name',
    (_slug, store) => {
      const serves = storeServes(store.name, store.neighborhoods);
      expect(serves.length).toBeGreaterThanOrEqual(2);
      expect(serves).not.toContain(store.name);
      expect(serves.every(area => !area.startsWith('Near '))).toBe(true);
    }
  );

  it('drops the store name and the orientation hints, and nothing else', () => {
    expect(storeServes('Cutler Bay', ['Cutler Bay', 'Kendall', 'Near MIA Airport'])).toEqual([
      'Kendall',
    ]);
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

  it('maps a location to a tire shop that also repairs, with a parsed address', () => {
    const [ld] = buildLocationsJsonLd([CUTLER_BAY]);
    expect(ld['@type']).toEqual(['TireShop', 'AutoRepair']);
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
