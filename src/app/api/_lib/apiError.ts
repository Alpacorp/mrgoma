import { NextResponse } from 'next/server';

import { logger } from '@/utils/logger';

/**
 * Shared error responder for public API route handlers. Logs the FULL error
 * detail server-side (Winston) and returns a GENERIC message to the client — so
 * a DB/driver error never leaks its internals (schema, connection strings, stack
 * fragments) to the public. Use in every catch block instead of returning
 * `err.message`.
 *
 *   } catch (err) {
 *     return jsonError(500, 'Failed to fetch tires', err);
 *   }
 */
export function jsonError(status: number, publicMessage: string, err?: unknown): NextResponse {
  if (err !== undefined) {
    logger.error(publicMessage, err);
  }
  return NextResponse.json({ message: publicMessage }, { status });
}
