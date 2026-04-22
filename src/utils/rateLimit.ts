import { NextRequest } from 'next/server';

interface RateLimitOptions {
  windowMs: number;
  max: number;
}

const stores = new Map<string, Map<string, number[]>>();

export function createRateLimiter(name: string, options: RateLimitOptions) {
  if (!stores.has(name)) {
    stores.set(name, new Map());
  }

  return function isRateLimited(req: NextRequest): boolean {
    const ip = getClientIp(req);
    if (!ip) return false;

    const store = stores.get(name)!;
    const now = Date.now();
    const timestamps = store.get(ip) ?? [];
    const recent = timestamps.filter(ts => now - ts < options.windowMs);
    recent.push(now);
    store.set(ip, recent);
    return recent.length > options.max;
  };
}

function getClientIp(req: NextRequest): string | undefined {
  const xff = req.headers.get('x-forwarded-for');
  const xri = req.headers.get('x-real-ip');
  return xff?.split(',')[0]?.trim() || xri || undefined;
}
