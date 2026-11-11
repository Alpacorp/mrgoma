import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ScrollToTopOnOpen from './ScrollToTopOnOpen';

const scrollToMock = vi.fn();

beforeEach(() => {
  scrollToMock.mockClear();
  window.scrollTo = scrollToMock as unknown as typeof window.scrollTo;
  Object.defineProperty(window, 'scrollY', { value: 1177, configurable: true });
});

describe('ScrollToTopOnOpen', () => {
  it('opens the page at its top when it arrives scrolled', () => {
    render(<ScrollToTopOnOpen id="1" />);
    expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: 'instant' });
  });

  it('leaves back/forward to the browser’s restored position', () => {
    window.dispatchEvent(new PopStateEvent('popstate'));
    render(<ScrollToTopOnOpen id="2" />);
    expect(scrollToMock).not.toHaveBeenCalled();
  });
});
