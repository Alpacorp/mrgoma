import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/app/utils/analytics', () => ({ trackEcommerce: vi.fn(() => Promise.resolve()) }));

const { trackEcommerce } = await import('@/app/utils/analytics');
const { toVercelEcommerceProps } =
  await vi.importActual<typeof import('@/app/utils/analytics')>('@/app/utils/analytics');
const { LISTS } = await import('@/app/utils/ecommerce');
type ListPayload = import('@/app/utils/ecommerce').ListPayload;
const { resetViewItemList, useViewItemList } = await import('./useViewItemList');
const sent = vi.mocked(trackEcommerce);

const tire = (id: number) => ({ id, name: `(C${id}) | PIRELLI | P ZERO | 225/45/17`, price: 90 });
const page = (from: number, n = 20) => Array.from({ length: n }, (_, i) => tire(from + i));

beforeEach(() => {
  sent.mockClear();
  resetViewItemList();
});

describe('useViewItemList (046, D1)', () => {
  it('reports the result shown, positioned 1–20 (AC1)', () => {
    renderHook(() => useViewItemList(LISTS.catalog, page(1), 0));
    expect(sent).toHaveBeenCalledTimes(1);
    const [name, payload] = sent.mock.calls[0];
    expect(name).toBe('view_item_list');
    expect(payload).toMatchObject({ item_list_id: 'catalog', item_list_name: 'All tires' });
    expect((payload as ListPayload).items.map(i => i.index)).toEqual(
      Array.from({ length: 20 }, (_, i) => i + 1)
    );
  });

  it('reports a new page with positions from 21, and not the same result twice (AC2)', () => {
    const { rerender } = renderHook(
      ({ tires, offset }) => useViewItemList(LISTS.catalog, tires, offset),
      {
        initialProps: { tires: page(1), offset: 0 },
      }
    );
    rerender({ tires: page(1), offset: 0 });
    expect(sent).toHaveBeenCalledTimes(1);

    rerender({ tires: page(21), offset: 20 });
    expect(sent).toHaveBeenCalledTimes(2);
    expect((sent.mock.calls[1][1] as ListPayload).items[0].index).toBe(21);
  });

  it('does not resend when the same result is mounted again (coming back)', () => {
    const first = renderHook(() => useViewItemList(LISTS.catalog, page(1), 0));
    first.unmount();
    renderHook(() => useViewItemList(LISTS.catalog, page(1), 0));
    expect(sent).toHaveBeenCalledTimes(1);
  });

  it('reports a filter or sort change as a new result', () => {
    const { rerender } = renderHook(({ tires }) => useViewItemList(LISTS.catalog, tires, 0), {
      initialProps: { tires: page(1) },
    });
    rerender({ tires: [...page(1)].reverse() });
    expect(sent).toHaveBeenCalledTimes(2);
  });

  it('sends nothing without a list or without tires', () => {
    renderHook(() => useViewItemList(undefined, page(1), 0));
    renderHook(() => useViewItemList(LISTS.catalog, [], 0));
    expect(sent).not.toHaveBeenCalled();
  });

  it('gives Vercel the flat summary: list id and count, no items (AC12)', async () => {
    const { listPayload } = await import('@/app/utils/ecommerce');
    const props = toVercelEcommerceProps(listPayload(LISTS.catalog, page(1)));
    expect(props).toMatchObject({ item_list_id: 'catalog', item_count: 20 });
    expect(props).not.toHaveProperty('items');
  });
});
