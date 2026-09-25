import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const replace = vi.fn();
const push = vi.fn();
let search = '';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, push, prefetch: vi.fn() }),
  useSearchParams: () => new URLSearchParams(search),
  usePathname: () => '/tires',
}));

import SearchResults from './SearchResults';
import type { PaginatedTiresResponse } from '../utils/fetchTiresServer';

const initialData = (page: number): PaginatedTiresResponse => ({
  tires: [],
  totalCount: 200,
  page,
  pageSize: 20,
  totalPages: 10,
  error: '',
});

/** The address bar the component reads through `window.location`. */
const loadAt = (query: string) => {
  search = query;
  window.history.replaceState(null, '', `/tires?${query}`);
};

beforeEach(() => {
  replace.mockClear();
  push.mockClear();
});

afterEach(() => {
  window.history.replaceState(null, '', '/');
});

describe('SearchResults pagination on load', () => {
  /**
   * The bug (039): reloading `/tires?page=7&pageSize=20` sent the buyer back to
   * page 1. State started at page 1, and the effect that writes state into the
   * URL ran in the first commit — before `setPage(7)` had landed — so it
   * replaced the URL with `?page=1`.
   */
  it('keeps the page from the URL on a reload instead of resetting to page 1', () => {
    loadAt('page=7&pageSize=20');
    render(<SearchResults initialData={initialData(7)} />);

    const urls = replace.mock.calls.map(([url]) => String(url));
    expect(urls.some(url => /[?&]page=1(&|$)/.test(url))).toBe(false);
  });

  it('does not rewrite a URL that already describes the current page', () => {
    loadAt('page=7&pageSize=20');
    render(<SearchResults initialData={initialData(7)} />);

    // The URL is already right, so there is nothing to replace — and every
    // replace here costs a second full server render of /tires.
    expect(replace).not.toHaveBeenCalled();
  });

  it('still starts on page 1 when the URL names no page', () => {
    loadAt('');
    render(<SearchResults initialData={initialData(1)} />);

    const urls = replace.mock.calls.map(([url]) => String(url));
    expect(urls.every(url => /[?&]page=1(&|$)/.test(url))).toBe(true);
  });
});
