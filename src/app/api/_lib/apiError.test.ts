import { describe, expect, it, vi } from 'vitest';

vi.mock('@/utils/logger', () => ({ logger: { error: vi.fn() } }));

import { jsonError } from '@/app/api/_lib/apiError';
import { logger } from '@/utils/logger';

describe('jsonError', () => {
  it('returns a generic body with the given status (no err.message leak)', async () => {
    const res = jsonError(500, 'Failed to fetch tires', new Error('secret DB connection=abc'));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toEqual({ message: 'Failed to fetch tires' });
    expect(JSON.stringify(body)).not.toContain('secret');
    expect(JSON.stringify(body)).not.toContain('connection');
  });

  it('logs the full error server-side when provided', () => {
    const err = new Error('boom');
    jsonError(500, 'Generic message', err);
    expect(logger.error).toHaveBeenCalledWith('Generic message', err);
  });

  it('does not log when no error is passed', () => {
    (logger.error as unknown as ReturnType<typeof vi.fn>).mockClear();
    jsonError(400, 'Bad request');
    expect(logger.error).not.toHaveBeenCalled();
  });
});
