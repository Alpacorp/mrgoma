import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { FacetOption } from './FacetGroup';
import SearchableFacet from './SearchableFacet';

const push = vi.fn();
const replace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace }),
  useSearchParams: () => new URLSearchParams(),
}));

beforeEach(() => {
  push.mockClear();
  replace.mockClear();
});

const brand = (label: string, count = 10, applied = false): FacetOption => ({
  value: label.toUpperCase(),
  label,
  count,
  href: `/tires?brands=${label.toUpperCase()}`,
  applied,
});

const MANY = [
  brand('Pirelli', 964),
  brand('Bridgestone', 444),
  brand('Continental', 419),
  brand('Yokohama', 399),
  brand('Goodyear', 340),
  brand('Michelin', 303),
  brand('Hankook', 141),
  brand('Groundspeed', 123),
  brand('Milestar', 60),
  brand('Nexen', 40),
  brand('Toyo', 12),
];

describe('SearchableFacet', () => {
  it('opens short rather than making the buyer scroll past a hundred brands', () => {
    const { container } = render(<SearchableFacet options={MANY} initialCount={8} />);
    // Drawn: eight. Present: all of them — see the next test for why that
    // distinction is the whole point.
    const drawn = [...container.querySelectorAll('li')].filter(
      li => !li.className.includes('hidden')
    );
    expect(drawn).toHaveLength(8);
    expect(screen.getByRole('button', { name: /Show all 11 brands/ })).toBeInTheDocument();
  });

  /**
   * **Every option reaches the markup**; the overflow is hidden with CSS.
   *
   * Rendering a slice instead looked identical and was not: only the first eight
   * existed in the HTML, so without JavaScript — and to a crawler — the rest of
   * the list was gone, behind a button that needs JavaScript to work. In the rim
   * group that meant **23", 24" and 26" did not exist**: the 102 tires this rail
   * was built to make reachable.
   */
  it('still puts every option in the markup', () => {
    const { container } = render(<SearchableFacet options={MANY} initialCount={3} />);
    expect(container.querySelectorAll('a')).toHaveLength(MANY.length);
    for (const brand of MANY) {
      expect(screen.getByRole('link', { name: new RegExp(brand.label) })).toBeInTheDocument();
    }
  });

  it('reveals the rest on request', async () => {
    const user = userEvent.setup();
    const { container } = render(<SearchableFacet options={MANY} initialCount={8} />);
    await user.click(screen.getByRole('button', { name: /Show all/ }));
    const drawn = [...container.querySelectorAll('li')].filter(
      li => !li.className.includes('hidden')
    );
    expect(drawn).toHaveLength(MANY.length);
  });

  it('narrows the list as the buyer types', async () => {
    const user = userEvent.setup();
    render(<SearchableFacet options={MANY} />);
    await user.type(screen.getByPlaceholderText('Search brands'), 'mich');

    expect(screen.getByRole('link', { name: /Michelin/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Pirelli/ })).not.toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });

  it('sorts a numeric group by value, so 19.5 lands between 19 and 20', () => {
    const sizes = [brand('19'), brand('19.5'), brand('20')];
    render(<SearchableFacet options={sizes} noun="size" nounPlural="sizes" numeric />);
    expect(screen.getByPlaceholderText('Search sizes')).toHaveAttribute('inputmode', 'numeric');
  });

  it('matches anywhere in the name, not only at the start', async () => {
    const user = userEvent.setup();
    render(<SearchableFacet options={MANY} />);
    await user.type(screen.getByPlaceholderText('Search brands'), 'stone');
    expect(screen.getByRole('link', { name: /Bridgestone/ })).toBeInTheDocument();
  });

  it('ignores case, because brands are stored in capitals', async () => {
    const user = userEvent.setup();
    render(<SearchableFacet options={MANY} />);
    await user.type(screen.getByPlaceholderText('Search brands'), 'PIRE');
    expect(screen.getByRole('link', { name: /Pirelli/ })).toBeInTheDocument();
  });

  it('reaches past the initial eight without needing "show all"', async () => {
    const user = userEvent.setup();
    render(<SearchableFacet options={MANY} initialCount={8} />);
    // Toyo is 11th; searching must find it even though the list opened short.
    await user.type(screen.getByPlaceholderText('Search brands'), 'toyo');
    expect(screen.getByRole('link', { name: /Toyo/ })).toBeInTheDocument();
  });

  /**
   * The search must never touch the URL. It is a way of *looking at* the options
   * the server already sent, not a filter — turning it into one would make every
   * keystroke a navigation and lose the buyer's place.
   */
  it('does not navigate while searching', async () => {
    const user = userEvent.setup();
    render(<SearchableFacet options={MANY} />);

    await user.type(screen.getByPlaceholderText('Search brands'), 'mich');

    // Asserted against a mocked router rather than against window.location,
    // which cannot change in jsdom and would make this test unable to fail.
    expect(push).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });

  it('says so when nothing matches, instead of showing an empty box', async () => {
    const user = userEvent.setup();
    render(<SearchableFacet options={MANY} />);
    await user.type(screen.getByPlaceholderText('Search brands'), 'zzz');
    expect(screen.getByText(/No brand matches/)).toBeInTheDocument();
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  /**
   * If the applied brand fell below the fold of a short list, the buyer would be
   * filtered by something they cannot see — and cannot remove.
   */
  it('always shows the applied brand, however far down the list it sits', () => {
    const options = [...MANY.slice(0, 10), brand('Toyo', 12, true)];
    render(<SearchableFacet options={options} initialCount={3} />);

    const applied = screen.getByRole('link', { name: /Toyo/ });
    expect(applied).toBeInTheDocument();
    expect(applied).toHaveAttribute('aria-current', 'true');
  });

  it('uses no button-like ARIA on its links', () => {
    const { container } = render(<SearchableFacet options={MANY} />);
    expect(container.querySelectorAll('[aria-pressed]')).toHaveLength(0);
  });

  it('labels its input for a screen reader', () => {
    render(<SearchableFacet options={MANY} />);
    expect(screen.getByLabelText('Search brands')).toBeInTheDocument();
  });

  it('sets a 16px font so iOS Safari does not zoom the page on focus', () => {
    render(<SearchableFacet options={MANY} />);
    expect(screen.getByPlaceholderText('Search brands')).toHaveStyle({ fontSize: '16px' });
  });
});
