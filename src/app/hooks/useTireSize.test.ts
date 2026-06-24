import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useTireSize } from './useTireSize';

describe('useTireSize', () => {
  it('starts empty and reports incomplete by default', () => {
    const { result } = renderHook(() => useTireSize());
    expect(result.current.tireSize).toEqual({ width: '', sidewall: '', diameter: '' });
    expect(result.current.isComplete()).toBe(false);
  });

  it('updates individual fields and becomes complete when all are set', () => {
    const { result } = renderHook(() => useTireSize());
    act(() => result.current.handleFilterChange('225', 'width'));
    act(() => result.current.handleFilterChange('40', 'sidewall'));
    act(() => result.current.handleFilterChange('18', 'diameter'));
    expect(result.current.tireSize).toEqual({ width: '225', sidewall: '40', diameter: '18' });
    expect(result.current.isComplete()).toBe(true);
  });

  it('removeFilter clears a single field', () => {
    const { result } = renderHook(() =>
      useTireSize({ width: '225', sidewall: '40', diameter: '18' })
    );
    act(() => result.current.removeFilter('sidewall'));
    expect(result.current.tireSize.sidewall).toBe('');
    expect(result.current.isComplete()).toBe(false);
  });

  it('updateTireSize replaces the whole value', () => {
    const { result } = renderHook(() => useTireSize());
    act(() => result.current.updateTireSize({ width: '195', sidewall: '65', diameter: '15' }));
    expect(result.current.tireSize).toEqual({ width: '195', sidewall: '65', diameter: '15' });
  });
});
