import { act, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/app/ui/sections/Header/Header', () => ({
  default: ({ compact }: { compact?: boolean }) => <header data-compact={String(!!compact)} />,
}));

import StickyHeader from './StickyHeader';

const scrollTo = (y: number) =>
  act(() => {
    Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
    window.dispatchEvent(new Event('scroll'));
  });

describe('StickyHeader — no resize loop near the top', () => {
  it('compacts past 40 px and only expands again below 4 px', () => {
    const { container } = render(<StickyHeader />);
    const compact = () => container.querySelector('header')!.getAttribute('data-compact');
    scrollTo(30);
    expect(compact()).toBe('false');
    scrollTo(41);
    expect(compact()).toBe('true');
    // The page moves ~24 px when the header shrinks: that must not expand it.
    scrollTo(17);
    expect(compact()).toBe('true');
    scrollTo(3);
    expect(compact()).toBe('false');
    // …and growing back (~24 px) must not compact it again.
    scrollTo(27);
    expect(compact()).toBe('false');
  });
});
