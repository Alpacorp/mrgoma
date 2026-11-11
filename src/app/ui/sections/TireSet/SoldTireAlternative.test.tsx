import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SingleTire } from '@/app/interfaces/tires';
import type { SetUnit } from '@/app/utils/tireSets';

const h = vi.hoisted(() => ({
  byCity: {} as Record<string, SetUnit[]>,
  fail: false,
}));

vi.mock('@/connection/db', () => ({ getPool: async () => ({}) }));
vi.mock('@/connection/queryLogger', () => ({ logQuery: vi.fn() }));
vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }));
vi.mock('@/repositories/tireSetsRepository', async () => {
  const real = await vi.importActual<typeof import('@/repositories/tireSetsRepository')>(
    '@/repositories/tireSetsRepository'
  );
  return {
    setGroupOf: real.setGroupOf,
    getCachedSetCandidates: async (g: { city: string }) => {
      if (h.fail) throw new Error('db down');
      return h.byCity[g.city] ?? [];
    },
  };
});

import SoldTireAlternative from './SoldTireAlternative';

const unit = (id: string, tread: number, over: Partial<SetUnit> = {}): SetUnit => ({
  id,
  price: 100,
  tread,
  patched: false,
  condition: 'Used',
  city: 'Miami',
  ...over,
});

const tire: SingleTire = {
  id: 10,
  name: '(1) | PIRELLI | 295/30/21',
  color: '',
  price: '650',
  brand: 'PIRELLI',
  brandId: 1,
  condition: 'Used',
  patched: 'No',
  remainingLife: '90%',
  treadDepth: '9.0',
  size: '295/30/21',
  model2: 'P ZERO',
  images: [],
  details: [],
  status: 'sold',
  city: 'Miami',
};

const renderIt = async () => render(await SoldTireAlternative({ tire }));

beforeEach(() => {
  h.byCity = {};
  h.fail = false;
});

describe('SoldTireAlternative (045)', () => {
  it('links the closest match in either city with the count (AC4)', async () => {
    h.byCity = {
      Miami: [unit('10', 9), unit('20', 6)],
      Orlando: [unit('30', 8.8, { city: 'Orlando' })],
    };
    await renderIt();
    const link = screen.getByRole('link', { name: 'We have 2 like it in stock →' });
    expect(link).toHaveAttribute('href', '/tires/30-pirelli-295-30-21');
    expect(screen.getByText(/This tire is sold\./)).toBeInTheDocument();
  });

  it('renders nothing with no match or when the lookup fails', async () => {
    const { container } = await renderIt();
    expect(container).toBeEmptyDOMElement();
    h.fail = true;
    const second = await renderIt();
    expect(second.container).toBeEmptyDOMElement();
  });
});
