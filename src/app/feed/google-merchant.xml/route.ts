import { unstable_cache } from 'next/cache';
import { NextRequest } from 'next/server';

import { z } from 'zod';

import { withLogging } from '@/app/api/_lib/withLogging';
import {
  FEED_REVALIDATE_SECONDS,
  buildFeedItem,
  buildMerchantFeedXml,
  isValidFeedToken,
} from '@/app/utils/merchantFeed';
import { fetchSellableTiresForFeed } from '@/repositories/tiresRepository';
import { logger } from '@/utils/logger';

// Google Merchant Center product feed (RSS 2.0). Token-protected and cached so
// GMC's scheduled fetches don't re-query the DB on every hit. Lives outside
// `/api` on purpose: a clean, GMC-friendly URL, and `/api` is robots-disallowed.
// The owner pastes the tokenized URL (`?key=…`) into the Merchant Center admin.

const getCachedFeedRecords = unstable_cache(() => fetchSellableTiresForFeed(), ['merchant-feed'], {
  revalidate: FEED_REVALIDATE_SECONDS,
  tags: ['tires'],
});

const querySchema = z.object({ key: z.string().min(1) });

export const GET = withLogging('merchantFeed.GET', async (req: NextRequest) => {
  const token = process.env.MERCHANT_FEED_TOKEN;
  if (!token) {
    logger.error('Merchant feed requested but MERCHANT_FEED_TOKEN is not configured');
    return new Response('Service Unavailable', { status: 503 });
  }

  const parsed = querySchema.safeParse({
    key: new URL(req.url).searchParams.get('key') ?? undefined,
  });
  if (!parsed.success || !isValidFeedToken(parsed.data.key, token)) {
    return new Response('Forbidden', { status: 403 });
  }

  try {
    const records = await getCachedFeedRecords();
    const xml = buildMerchantFeedXml(records.map(buildFeedItem));
    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': `public, s-maxage=${FEED_REVALIDATE_SECONDS}, stale-while-revalidate=86400`,
      },
    });
  } catch (err) {
    logger.error('Failed to build merchant feed', err);
    return new Response('Internal Server Error', { status: 500 });
  }
});
