import { logger } from '@/utils/logger';

/**
 * Wraps a database query so every execution is logged to the server console
 * (terminal in dev, Vercel logs in prod):
 *   - success → `db_query_ok` at debug level (label, duration, row count)
 *   - failure → `db_query_error` at error level (label, duration, message)
 *
 * Success logs sit at `debug` so they stay verbose in development but are
 * hidden in production unless LOG_LEVEL=debug is set. Errors always surface.
 *
 * Usage:
 *   const result = await logQuery('tires.fetchTires', () => request.query(sql), { offset, pageSize });
 */
export async function logQuery<T>(
  label: string,
  run: () => Promise<T>,
  meta?: Record<string, unknown>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await run();
    const ms = Math.round(performance.now() - start);
    // mssql returns an IResult with a `recordset`; surface the row count when present.
    const rows = (result as { recordset?: unknown[] } | null)?.recordset?.length;
    logger.debug('db_query_ok', {
      label,
      ms,
      ...(rows !== undefined ? { rows } : {}),
      ...meta,
    });
    return result;
  } catch (err) {
    const ms = Math.round(performance.now() - start);
    logger.error('db_query_error', {
      label,
      ms,
      error: err instanceof Error ? err.message : String(err),
      ...meta,
    });
    throw err;
  }
}
