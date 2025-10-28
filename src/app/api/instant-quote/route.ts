import { NextRequest, NextResponse } from 'next/server';

import { logger } from '@/utils/logger';

export async function POST(req: NextRequest) {
  try {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) {
      logger.error('N8N_WEBHOOK_URL is not set');
      return NextResponse.json({ message: 'Server webhook not configured' }, { status: 500 });
    }

    const payload = await req.json().catch(() => ({}));

    // Basic validation (all required by spec)
    const required = [
      'size',
      'width',
      'sidewall',
      'diameter',
      'tireBrand',
      'carBrand',
      'year',
      'condition',
      'name',
      'email',
      'phone',
    ];
    const missing = required.filter(k => !payload?.[k]);
    if (missing.length) {
      return NextResponse.json(
        { message: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    // Append some meta information
    const xff = req.headers.get('x-forwarded-for');
    const xri = req.headers.get('x-real-ip');
    const clientIp = (xff?.split(',')[0]?.trim()) || xri || undefined;
    const meta = {
      ip: clientIp,
      userAgent: req.headers.get('user-agent') || undefined,
      referer: req.headers.get('referer') || undefined,
      url: req.nextUrl?.toString?.() || undefined,
      submittedAt: payload.submittedAt || new Date().toISOString(),
      source: payload.source || 'instant-quote',
    };

    const body = { ...payload, _meta: meta };

    const resp = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      logger.error(`n8n webhook responded with ${resp.status}: ${text}`);
      return NextResponse.json(
        { message: 'Upstream webhook failed', status: resp.status },
        { status: 502 }
      );
    }

    const data = await resp.json().catch(() => ({ ok: true }));
    return NextResponse.json({ ok: true, data });
  } catch (err: unknown) {
    logger.error('Failed to process instant-quote POST', err as any);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ message }, { status: 500 });
  }
}
