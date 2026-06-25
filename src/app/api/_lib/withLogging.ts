import { NextRequest, NextResponse } from 'next/server';

import { logger } from '@/utils/logger';

type RouteContext = { params?: Promise<Record<string, string>> } | undefined;
type RouteHandler = (req: NextRequest, ctx?: RouteContext) => Promise<Response> | Response;

/**
 * Wraps an API route handler so every request is logged to the server console
 * (terminal in dev, Vercel logs in prod) with method, path, status and duration:
 *   - 2xx/3xx → `http_request` at info
 *   - 4xx     → `http_request` at warn
 *   - 5xx / thrown → `http_request` at error
 *
 * Usage:
 *   export const GET = withLogging('tires.GET', async (req) => { ... });
 */
export function withLogging(label: string, handler: RouteHandler): RouteHandler {
  return async (req: NextRequest, ctx?: RouteContext) => {
    const start = performance.now();
    const method = req.method;
    let path = '';
    try {
      path = new URL(req.url).pathname;
    } catch {
      /* req.url may be relative in some runtimes; path stays empty */
    }

    try {
      const res = await handler(req, ctx);
      const ms = Math.round(performance.now() - start);
      const status = res instanceof NextResponse || res instanceof Response ? res.status : undefined;
      const level = status && status >= 500 ? 'error' : status && status >= 400 ? 'warn' : 'info';
      logger.log(level, 'http_request', { label, method, path, status, ms });
      return res;
    } catch (err) {
      const ms = Math.round(performance.now() - start);
      logger.error('http_request', {
        label,
        method,
        path,
        ms,
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  };
}
