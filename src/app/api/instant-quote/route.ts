import { NextRequest, NextResponse } from 'next/server';

import { logger } from '@/utils/logger';

// --- Simple in-memory rate limiter (per instance) ---
const RATE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const RATE_MAX = 5; // max 5 requests per window per IP
const ipRequestLog = new Map<string, number[]>();

function getClientIp(req: NextRequest): string | undefined {
  const xff = req.headers.get('x-forwarded-for');
  const xri = req.headers.get('x-real-ip');
  const first = xff?.split(',')[0]?.trim();
  return first || xri || undefined;
}

function isRateLimited(ip?: string): boolean {
  if (!ip) return false; // if we cannot detect IP, don't rate-limit
  const now = Date.now();
  const arr = ipRequestLog.get(ip) || [];
  const recent = arr.filter(ts => now - ts < RATE_WINDOW_MS);
  recent.push(now);
  ipRequestLog.set(ip, recent);
  return recent.length > RATE_MAX;
}

function isAllowedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin') || '';
  const referer = req.headers.get('referer') || '';
  const host = req.headers.get('host') || '';

  const allowed = new Set<string>([
    process.env.NEXT_PUBLIC_BASE_URL || '',
    process.env.BASE_URL_PROD || '',
    process.env.BASE_URL_DEV || '',
    `https://${host}`,
    `http://${host}`,
  ]);

  const checks = [origin, referer].filter(Boolean);
  if (checks.length === 0) return true; // allow non-browser clients
  try {
    return checks.every(urlStr => {
      try {
        const u = new URL(urlStr);
        for (const allow of allowed) {
          if (!allow) continue;
          const au = new URL(allow);
          if (u.host === au.host) return true;
        }
        return false;
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) {
      logger.error('N8N_WEBHOOK_URL is not set');
      return NextResponse.json({ message: 'Server webhook not configured' }, { status: 500 });
    }

    // 1) Origin/Referer allow-list
    if (!isAllowedOrigin(req)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const clientIp = getClientIp(req);

    // 2) Rate limiting per IP
    if (isRateLimited(clientIp)) {
      return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
    }

    const payload = await req.json().catch(() => ({}));

    // 3) Honeypot detection – short-circuit with 200 to avoid tipping bots
    if (typeof payload?.hp === 'string' && payload.hp.trim() !== '') {
      logger.warn('Honeypot triggered on instant-quote', { ip: clientIp });
      return NextResponse.json({ ok: true });
    }

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
