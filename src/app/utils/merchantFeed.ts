import { timingSafeEqual } from 'node:crypto';

import { SITE_NAME, absUrl, getSiteUrl } from '@/app/utils/seo';
import { generateTireDescription } from '@/app/utils/tireDescription';
import { buildTireSlug } from '@/app/utils/tireSlug';
import type { FeedTireRecord } from '@/repositories/feedQuery';

/** Cache/revalidation window for the feed (12 hours). GMC fetches ~daily. */
export const FEED_REVALIDATE_SECONDS = 43200;

/** Google product category for "Motor Vehicle Tires". */
export const GOOGLE_PRODUCT_CATEGORY_TIRES = '912';

const GENERIC_IMAGE = '/assets/images/generic-tire-image.webp';

/**
 * The explicit, whitelisted shape of a Google Merchant feed item. Only these
 * fields are ever serialized — internal DB columns cannot leak because they are
 * neither selected (see `FeedTireRecord`) nor mapped here.
 */
export interface GmcItem {
  id: string;
  title: string;
  description: string;
  link: string;
  imageLink: string;
  additionalImageLink: string[];
  price: string;
  availability: string;
  condition: string;
  brand: string;
  googleProductCategory: string;
  productType: string;
  identifierExists: string;
}

/** The exact set of keys a `GmcItem` may contain (used to guard against leaks). */
export const GMC_ITEM_KEYS: readonly (keyof GmcItem)[] = [
  'id',
  'title',
  'description',
  'link',
  'imageLink',
  'additionalImageLink',
  'price',
  'availability',
  'condition',
  'brand',
  'googleProductCategory',
  'productType',
  'identifierExists',
];

/** Escapes the five XML-significant characters. */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Search-oriented product title: `Brand Size Condition Tire — {life} tread`.
 * The tread suffix is added only for used tires with a known remaining life.
 * e.g. `Michelin 225/40/18 Used Tire — 80% tread`.
 */
export function buildFeedTitle(params: {
  brand?: string;
  size?: string;
  condition?: string; // 'New' | 'Used'
  remainingLife?: string;
}): string {
  const brand = (params.brand || '').trim();
  const size = (params.size || '').trim();
  const isUsed = (params.condition || '').toLowerCase() === 'used';
  const conditionLabel = isUsed ? 'Used' : 'New';
  const base = [brand, size, `${conditionLabel} Tire`].filter(Boolean).join(' ');
  const life = params.remainingLife;
  const hasLife = isUsed && Boolean(life) && life !== '-';
  return hasLife ? `${base} — ${life} tread` : base;
}

/**
 * Maps a whitelisted DB record to a Google Merchant item. Returns ONLY the
 * `GmcItem` whitelist — no raw record fields pass through.
 */
export function buildFeedItem(record: FeedTireRecord): GmcItem {
  const id = String(record.TireId ?? '');
  const brand = record.Brand || 'Unknown';
  const size = record.RealSize || '';
  const condition = record.ProductTypeId === 1 ? 'new' : 'used';
  const conditionLabel = condition === 'new' ? 'New' : 'Used';
  const patched = record.Patched === '0' ? 'No' : 'Yes';

  const title = buildFeedTitle({
    brand,
    size,
    condition: conditionLabel,
    remainingLife: record.RemainingLife,
  });

  const description =
    record.Description?.trim() ||
    generateTireDescription({
      brand,
      model: record.Model2,
      size,
      condition: conditionLabel,
      remainingLife: record.RemainingLife,
      treadDepth: record.Tread,
      patched,
      loadIndex: record.loadIndex,
      speedIndex: record.speedIndex,
    });

  const rawImages = [record.Image1, record.Image2, record.Image3, record.Image4].filter(
    (src): src is string => Boolean(src)
  );
  const images = (rawImages.length > 0 ? rawImages : [GENERIC_IMAGE]).map(absUrl);

  const priceNum = typeof record.Price === 'string' ? Number(record.Price) : record.Price;
  const priceStr =
    typeof priceNum === 'number' && Number.isFinite(priceNum) ? priceNum.toFixed(2) : '0.00';

  return {
    id,
    title,
    description,
    link: absUrl(`/tires/${buildTireSlug(id, brand, size)}`),
    imageLink: images[0],
    additionalImageLink: images.slice(1, 11), // GMC allows up to 10 extra
    price: `${priceStr} USD`,
    availability: 'in_stock',
    condition,
    brand,
    googleProductCategory: GOOGLE_PRODUCT_CATEGORY_TIRES,
    productType: `Tires > ${brand} > ${size}`.trim(),
    identifierExists: 'no',
  };
}

function itemToXml(item: GmcItem): string {
  const extra = item.additionalImageLink
    .map(u => `    <g:additional_image_link>${escapeXml(u)}</g:additional_image_link>`)
    .join('\n');
  return [
    '  <item>',
    `    <g:id>${escapeXml(item.id)}</g:id>`,
    `    <title>${escapeXml(item.title)}</title>`,
    `    <description>${escapeXml(item.description)}</description>`,
    `    <link>${escapeXml(item.link)}</link>`,
    `    <g:image_link>${escapeXml(item.imageLink)}</g:image_link>`,
    extra,
    `    <g:price>${escapeXml(item.price)}</g:price>`,
    `    <g:availability>${escapeXml(item.availability)}</g:availability>`,
    `    <g:condition>${escapeXml(item.condition)}</g:condition>`,
    `    <g:brand>${escapeXml(item.brand)}</g:brand>`,
    `    <g:google_product_category>${escapeXml(item.googleProductCategory)}</g:google_product_category>`,
    `    <g:product_type>${escapeXml(item.productType)}</g:product_type>`,
    `    <g:identifier_exists>${escapeXml(item.identifierExists)}</g:identifier_exists>`,
    '  </item>',
  ]
    .filter(Boolean)
    .join('\n');
}

/** Builds the complete RSS 2.0 Google Merchant feed document. */
export function buildMerchantFeedXml(items: GmcItem[]): string {
  const site = getSiteUrl();
  const header =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n' +
    '<channel>\n' +
    `  <title>${escapeXml(`${SITE_NAME} Product Feed`)}</title>\n` +
    `  <link>${escapeXml(site)}</link>\n` +
    `  <description>${escapeXml(`${SITE_NAME} — new and used tires`)}</description>`;
  const body = items.map(itemToXml).join('\n');
  return `${header}\n${body}\n</channel>\n</rss>\n`;
}

/**
 * Timing-safe comparison of the provided `?key=` against the configured token.
 * Length-guarded so `timingSafeEqual` never throws on mismatched buffers.
 */
export function isValidFeedToken(provided: string | null | undefined, expected: string | undefined): boolean {
  if (!provided || !expected) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
