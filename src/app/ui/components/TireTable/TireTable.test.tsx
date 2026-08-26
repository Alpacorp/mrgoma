import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { TransformedTire } from '@/app/interfaces/tires';

import TireTable from './TireTable';

vi.mock('@/app/context/CartContext', () => ({ useCart: () => ({ isInCart: () => false }) }));

const tire = (over: Partial<TransformedTire> = {}): TransformedTire => ({
  id: '299189',
  name: 'BRIDGESTONE | DUELER H/P SPORT AS XL | 245/50/19',
  model: 'DUELER H/P SPORT AS XL',
  size: '245/50/19',
  color: '',
  href: '',
  imageSrc: '',
  imageAlt: '',
  price: '$155',
  brand: 'BRIDGESTONE',
  brandId: 1,
  condition: 'Used',
  features: [
    { name: 'Remaining life', value: '63%' },
    { name: 'Tread depth', value: '6.3' },
    { name: 'Patched', value: 'No' },
    { name: 'Run Flat', value: 'No' },
  ],
  ...over,
});

describe('TireTable', () => {
  /**
   * **2.089 of 4.149 tires have no photo.** The table exists so those listings
   * stop spending their widest column on a placeholder — but only if every fact
   * a buyer decides on survives the move off the card.
   */
  it('shows every fact the buyer decides on', () => {
    render(<TireTable products={[tire()]} />);
    const row = screen.getAllByRole('row')[1];

    expect(within(row).getByRole('link')).toHaveTextContent('Bridgestone');
    expect(within(row).getByText('245/50/19')).toBeInTheDocument();
    expect(within(row).getByText('Used')).toBeInTheDocument();
    expect(within(row).getByText('63%')).toBeInTheDocument();
    // Tread carries its unit now: a bare "6.3" says nothing to a buyer, and
    // thirty-seconds of an inch is how the US market reads tread.
    expect(within(row).getByText('6.3/32"')).toBeInTheDocument();
    expect(within(row).getByText('$155')).toBeInTheDocument();
  });

  it('names each column so a screen reader can place a cell', () => {
    render(<TireTable products={[tire()]} />);
    for (const header of [
      'Tire',
      'Size',
      'Condition',
      'Life',
      'Tread',
      'Patched',
      'Run-flat',
      'Price',
    ]) {
      expect(screen.getByRole('columnheader', { name: header })).toBeInTheDocument();
    }
  });

  it('writes the tire the same way the card does', () => {
    // `028` collapsed three different name composers into one; the table must
    // not become a fourth.
    render(<TireTable products={[tire()]} />);
    expect(screen.getByRole('link', { name: /Bridgestone Dueler/ })).toBeInTheDocument();
  });

  it('links each row to the tire, with the slug the detail route expects', () => {
    render(<TireTable products={[tire()]} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/tires/299189-bridgestone-245-50-19');
  });

  it('shows a dash rather than a blank when a fact is missing', () => {
    render(<TireTable products={[tire({ features: [] })]} />);
    const row = screen.getAllByRole('row')[1];
    expect(within(row).getAllByText('—').length).toBeGreaterThanOrEqual(4);
  });

  it('fits more tires on a screen than the row view', () => {
    const many = Array.from({ length: 20 }, (_, i) => tire({ id: String(i) }));
    render(<TireTable products={many} />);
    // Header row plus one per tire, and no image to push them apart.
    expect(screen.getAllByRole('row')).toHaveLength(21);
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('scrolls inside its own box, so the page never scrolls sideways', () => {
    const { container } = render(<TireTable products={[tire()]} />);
    expect(container.firstElementChild).toHaveClass('overflow-x-auto');
  });

  it('renders nothing when there is nothing to show', () => {
    const { container } = render(<TireTable products={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
