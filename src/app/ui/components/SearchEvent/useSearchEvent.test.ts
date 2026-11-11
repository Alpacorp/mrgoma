import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/app/utils/analytics', () => ({ trackEvent: vi.fn() }));
const { trackEvent } = await import('@/app/utils/analytics');
const { resetSearchEvent, useSearchEvent } = await import('./useSearchEvent');
const sent = vi.mocked(trackEvent);

const qs = (s: string) => new URLSearchParams(s);

beforeEach(() => {
  sent.mockClear();
  resetSearchEvent();
});

describe('useSearchEvent (046, AC8)', () => {
  it('reports a size search once, with readable term and parts', () => {
    const { rerender } = renderHook(({ q }) => useSearchEvent(qs(q)), {
      initialProps: { q: 'w=225&s=45&d=17&brands=Michelin' },
    });
    rerender({ q: 'w=225&s=45&d=17&brands=Michelin' });

    expect(sent).toHaveBeenCalledTimes(1);
    expect(sent.mock.calls[0][0]).toMatchObject({
      action: 'search',
      params: {
        search_term: '225/45R17',
        tire_width: '225',
        tire_profile: '45',
        tire_rim: '17',
        tire_brand: 'Michelin',
      },
    });
  });

  it('a brand or condition change with the size set is not a new search', () => {
    const { rerender } = renderHook(({ q }) => useSearchEvent(qs(q)), {
      initialProps: { q: 'w=225&s=45&d=17' },
    });
    rerender({ q: 'w=225&s=45&d=17&brands=Pirelli&condition=used&page=2' });
    expect(sent).toHaveBeenCalledTimes(1);
  });

  it('a new size is a new search; a partial size counts', () => {
    const { rerender } = renderHook(({ q }) => useSearchEvent(qs(q)), {
      initialProps: { q: 'w=225' },
    });
    rerender({ q: 'w=225&s=45' });
    expect(sent).toHaveBeenCalledTimes(2);
    expect(sent.mock.calls[1][0].params).toMatchObject({ search_term: '225/45' });
  });

  it('coming back to the same size does not resend', () => {
    renderHook(() => useSearchEvent(qs('w=225&s=45&d=17'))).unmount();
    renderHook(() => useSearchEvent(qs('w=225&s=45&d=17')));
    expect(sent).toHaveBeenCalledTimes(1);
  });

  it('no size part, no search', () => {
    renderHook(() => useSearchEvent(qs('brands=Michelin&condition=used')));
    expect(sent).not.toHaveBeenCalled();
  });
});
