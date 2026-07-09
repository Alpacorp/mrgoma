import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import robots from '@/app/robots';
import {
  GMC_ITEM_KEYS,
  buildFeedItem,
  buildFeedTitle,
  buildMerchantFeedXml,
  escapeXml,
  isValidFeedToken,
} from '@/app/utils/merchantFeed';
import { STOREFRONT_SELLABLE_WHERE, buildFeedQuery } from '@/repositories/feedQuery';
import type { FeedTireRecord } from '@/repositories/feedQuery';

const usedRecord: FeedTireRecord = {
  TireId: '591388',
  Brand: 'Michelin',
  Model2: 'Pilot',
  RealSize: '225/40/18',
  Price: 80,
  ProductTypeId: 2,
  Condition: 'available',
  RemainingLife: '80%',
  Patched: '0',
  Tread: '7',
  loadIndex: '91',
  speedIndex: 'V',
  Image1: 'https://www.usedtires.online/img/1.jpg',
  Image2: 'https://www.usedtires.online/img/2.jpg',
};

describe('buildFeedTitle', () => {
  it('used: Brand + Size + Condition + tread', () => {
    expect(buildFeedTitle({ brand: 'Michelin', size: '225/40/18', condition: 'Used', remainingLife: '80%' }))
      .toBe('Michelin 225/40/18 Used Tire — 80% tread');
  });

  it('new: no tread suffix', () => {
    expect(buildFeedTitle({ brand: 'Pirelli', size: '205/55/16', condition: 'New', remainingLife: '100%' }))
      .toBe('Pirelli 205/55/16 New Tire');
  });

  it('used without known life: no tread suffix', () => {
    expect(buildFeedTitle({ brand: 'Goodyear', size: '195/65/15', condition: 'Used', remainingLife: '-' }))
      .toBe('Goodyear 195/65/15 Used Tire');
  });
});

describe('escapeXml', () => {
  it('escapes the five XML-significant characters', () => {
    expect(escapeXml(`a & b < c > d " e ' f`)).toBe('a &amp; b &lt; c &gt; d &quot; e &apos; f');
  });
});

describe('buildFeedItem', () => {
  const item = buildFeedItem(usedRecord);

  it('emits the required GMC attributes with correct formats', () => {
    expect(item.id).toBe('591388');
    expect(item.title).toBe('Michelin 225/40/18 Used Tire — 80% tread');
    expect(item.price).toBe('80.00 USD');
    expect(item.availability).toBe('in_stock');
    expect(item.condition).toBe('used');
    expect(item.brand).toBe('Michelin');
    expect(item.googleProductCategory).toBe('912');
    expect(item.productType).toBe('Tires > Michelin > 225/40/18');
    expect(item.identifierExists).toBe('no');
    expect(item.description.length).toBeGreaterThan(0);
  });

  it('builds absolute link and image URLs', () => {
    expect(item.link).toMatch(/^https?:\/\/.+\/tires\/591388-michelin-225-40-18$/);
    expect(item.imageLink).toBe('https://www.usedtires.online/img/1.jpg');
    expect(item.additionalImageLink).toEqual(['https://www.usedtires.online/img/2.jpg']);
  });

  it('maps new tires to condition "new" without a tread suffix', () => {
    const newItem = buildFeedItem({ ...usedRecord, ProductTypeId: 1 });
    expect(newItem.condition).toBe('new');
    expect(newItem.title).toBe('Michelin 225/40/18 New Tire');
  });

  it('falls back to the generic image when none are present', () => {
    const noImg = buildFeedItem({ ...usedRecord, Image1: undefined, Image2: undefined });
    expect(noImg.imageLink).toMatch(/generic-tire-image\.webp$/);
    expect(noImg.additionalImageLink).toEqual([]);
  });

  it('exposes ONLY whitelisted keys (no internal DB fields leak)', () => {
    expect(Object.keys(item).sort()).toEqual([...GMC_ITEM_KEYS].sort());
    for (const leaked of ['VaultName', 'DOT', 'Local', 'Trash', 'Amount', 'ModificationDate', 'ConditionId']) {
      expect(item).not.toHaveProperty(leaked);
    }
  });
});

describe('buildMerchantFeedXml', () => {
  const xml = buildMerchantFeedXml([buildFeedItem(usedRecord), buildFeedItem({ ...usedRecord, TireId: '2' })]);

  it('is a Google Merchant RSS 2.0 document', () => {
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('xmlns:g="http://base.google.com/ns/1.0"');
    expect(xml).toContain('<channel>');
    expect(xml).toContain('<g:google_product_category>912</g:google_product_category>');
  });

  it('emits one <item> per product', () => {
    expect((xml.match(/<item>/g) || []).length).toBe(2);
  });

  it('emits a repeated additional_image_link per extra image', () => {
    expect((xml.match(/<g:additional_image_link>/g) || []).length).toBe(2);
  });
});

describe('isValidFeedToken', () => {
  it('accepts an exact match', () => {
    expect(isValidFeedToken('s3cret', 's3cret')).toBe(true);
  });
  it('rejects wrong, empty, null, or missing-expected', () => {
    expect(isValidFeedToken('wrong', 's3cret')).toBe(false);
    expect(isValidFeedToken('', 's3cret')).toBe(false);
    expect(isValidFeedToken(null, 's3cret')).toBe(false);
    expect(isValidFeedToken('s3cret', undefined)).toBe(false);
  });
  it('rejects a length mismatch without throwing', () => {
    expect(isValidFeedToken('abc', 's3cret')).toBe(false);
  });
});

describe('buildFeedQuery (mirrors storefront, no cap)', () => {
  const q = buildFeedQuery();

  it('reuses the storefront sellable clause', () => {
    expect(q).toContain(STOREFRONT_SELLABLE_WHERE);
    expect(q).toContain("RemainingLife >= '50%'");
  });

  it('is NOT the dashboard (Trash-only, everything) clause', () => {
    expect(q).not.toMatch(/WHERE\s+Trash = 'false'\s+ORDER/);
  });

  it('has no row cap', () => {
    expect(q).not.toMatch(/\bTOP\b|OFFSET|FETCH/i);
  });
});

describe('feed is not discoverable', () => {
  it('robots.ts disallows /feed/', () => {
    const r = robots();
    const rules = Array.isArray(r.rules) ? r.rules : [r.rules];
    const disallow = rules[0]?.disallow;
    const list = Array.isArray(disallow) ? disallow : [disallow];
    expect(list).toContain('/feed/');
  });

  it('sitemap.ts does not include the feed URL', () => {
    const src = readFileSync('src/app/sitemap.ts', 'utf8');
    expect(src).not.toContain('google-merchant');
    expect(src).not.toContain('/feed/');
  });
});
