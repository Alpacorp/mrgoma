import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TireGrid } from '@/app/(shop)/tires/container/TireGrid/TireGrid';
import { CartProvider } from '@/app/context/CartContext';
import type { TransformedTire } from '@/app/interfaces/tires';
import { resetViewItemList } from '@/app/ui/components/ViewItemList/useViewItemList';
import { LISTS, type ListPayload } from '@/app/utils/ecommerce';

import TireResults from './TireResults';

vi.mock('@/app/utils/analytics', () => ({ trackEcommerce: vi.fn(() => Promise.resolve()) }));
vi.mock('next/image', () => ({ default: () => <img alt="" /> }));
const { trackEcommerce } = await import('@/app/utils/analytics');
const sent = vi.mocked(trackEcommerce);

const tire = (id: number) =>
  ({
    id: String(id),
    name: `(C${id}) | Michelin | Pilot | 225/40/18`,
    price: '99',
    brand: 'Michelin',
    condition: 'used',
    features: [],
  }) as unknown as TransformedTire;
const page = (from: number) => Array.from({ length: 20 }, (_, i) => tire(from + i));
const lists = () =>
  sent.mock.calls.filter(([e]) => e === 'view_item_list').map(([, p]) => p as ListPayload);

beforeEach(() => {
  sent.mockClear();
  resetViewItemList();
});

describe('listing names and positions (046, T7)', () => {
  it('page 2 of /tires starts at position 21', () => {
    render(
      <CartProvider>
        <TireResults products={page(21)} list={LISTS.catalog} indexOffset={20} />
      </CartProvider>
    );
    expect(lists()[0]).toMatchObject({ item_list_id: 'catalog' });
    expect(lists()[0].items[0].index).toBe(21);
  });

  it('a brand page reports its own list (AC13)', () => {
    render(
      <CartProvider>
        <TireGrid
          tires={page(1)}
          totalCount={20}
          viewAllHref="/tires"
          list={LISTS.brand('Michelin')}
        />
      </CartProvider>
    );
    expect(lists()[0]).toMatchObject({
      item_list_id: 'brand_tires',
      item_list_name: 'Brand: Michelin',
    });
  });
});
