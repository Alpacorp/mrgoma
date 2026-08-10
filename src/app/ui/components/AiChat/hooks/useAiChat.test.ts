import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { EVENTS } from '@/app/utils/analyticsEvents';

const h = vi.hoisted(() => ({ push: vi.fn(), track: vi.fn() }));

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: h.push }) }));
vi.mock('@/app/utils/analytics', () => ({ trackEvent: h.track }));

import { useAiChat } from './useAiChat';

const respondWith = (body: unknown) => {
  global.fetch = vi.fn(async () => ({
    ok: true,
    json: async () => body,
  })) as unknown as typeof fetch;
};

beforeEach(() => {
  h.push.mockClear();
  h.track.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

const send = async (text = 'Michelin') => {
  const { result } = renderHook(() => useAiChat({ surface: 'site', redirectBasePath: 'tires' }));
  await act(async () => {
    await result.current.sendMessage(text);
  });
  return result;
};

describe('reporting the outcome', () => {
  it('reports an applied search exactly once, with surface and dimensions', async () => {
    respondWith({
      type: 'filters',
      filters: { brands: 'Michelin' },
      message: 'Searching…',
      dimensions: 'brand',
    });

    await send();

    const applied = h.track.mock.calls.filter(([e]) => e.action === EVENTS.AI_CHAT_FILTERS_APPLIED);
    expect(applied).toHaveLength(1);
    expect(applied[0][0].params).toEqual({ surface: 'site', dimensions: 'brand' });
  });

  it('reports nothing when the assistant merely talked', async () => {
    // A conversation that never produced a search is exactly what we want to be
    // able to see, so it must not be counted as one.
    respondWith({ type: 'message', message: 'What size are you looking for?' });

    await send('I need tires');

    expect(h.track).not.toHaveBeenCalled();
  });

  it('reports an empty search as its own outcome, never as a success', async () => {
    respondWith({ type: 'no_results', message: 'Nothing right now', dimensions: 'brand' });

    await send('Nokian');

    const names = h.track.mock.calls.map(([e]) => e.action);
    expect(names).toContain(EVENTS.AI_CHAT_NO_RESULTS);
    expect(names).not.toContain(EVENTS.AI_CHAT_FILTERS_APPLIED);
  });

  it('carries the surface it was given, so staff and customers stay apart', async () => {
    respondWith({ type: 'filters', filters: { d: 17 }, message: 'ok', dimensions: 'rim' });

    const { result } = renderHook(() =>
      useAiChat({ surface: 'dashboard', redirectBasePath: 'dashboard' })
    );
    await act(async () => {
      await result.current.sendMessage('rim 17');
    });

    expect(h.track.mock.calls[0][0].params.surface).toBe('dashboard');
  });
});

describe('navigating to the results', () => {
  it('forwards the ordering the assistant chose', async () => {
    // It forwarded fourteen params and not this one, so "cheapest first"
    // silently arrived in the default order.
    respondWith({
      type: 'filters',
      filters: { condition: 'used', sort: 'price-asc' },
      message: 'ok',
      dimensions: 'condition',
    });

    await send('cheapest used');

    await waitFor(() => expect(h.push).toHaveBeenCalled());
    expect(h.push.mock.calls[0][0]).toContain('sort=price-asc');
  });

  it('does not navigate when nothing was found', async () => {
    respondWith({ type: 'no_results', message: 'Nothing right now', dimensions: 'rim' });

    await send('rim 17');

    expect(h.push).not.toHaveBeenCalled();
  });
});
