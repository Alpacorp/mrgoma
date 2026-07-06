import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useIdleReady } from './useIdleReady';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('useIdleReady', () => {
  it('starts false and becomes true once requestIdleCallback fires', () => {
    let idleCb: (() => void) | null = null;
    vi.stubGlobal('requestIdleCallback', (cb: () => void) => {
      idleCb = cb;
      return 1;
    });
    vi.stubGlobal('cancelIdleCallback', vi.fn());

    const { result } = renderHook(() => useIdleReady());
    expect(result.current).toBe(false);

    act(() => idleCb?.());
    expect(result.current).toBe(true);
  });

  it('falls back to a setTimeout when requestIdleCallback is unavailable', () => {
    vi.useFakeTimers();
    vi.stubGlobal('requestIdleCallback', undefined);

    const { result } = renderHook(() => useIdleReady());
    expect(result.current).toBe(false);

    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe(true);
  });

  it('cancels the idle callback on unmount', () => {
    const cancel = vi.fn();
    vi.stubGlobal('requestIdleCallback', () => 42);
    vi.stubGlobal('cancelIdleCallback', cancel);

    const { unmount } = renderHook(() => useIdleReady());
    unmount();
    expect(cancel).toHaveBeenCalledWith(42);
  });
});
