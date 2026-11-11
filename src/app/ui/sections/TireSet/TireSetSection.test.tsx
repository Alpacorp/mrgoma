import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SingleTire } from '@/app/interfaces/tires';
import type { SetUnit } from '@/app/utils/tireSets';

const h = vi.hoisted(() => ({ units: [] as SetUnit[], calls: 0 }));

vi.mock('@/connection/db', () => ({ getPool: async () => ({}) }));
vi.mock('@/connection/queryLogger', () => ({ logQuery: vi.fn() }));
vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }));

vi.mock('@/repositories/tireSetsRepository', async () => {
  const real = await vi.importActual<typeof import('@/repositories/tireSetsRepository')>(
    '@/repositories/tireSetsRepository'
  );
  return {
    setGroupOf: real.setGroupOf,
    getCachedSetCandidates: async () => {
      h.calls++;
      return h.units;
    },
  };
});
vi.mock('./TireSetPanel', () => ({
  default: ({ more, sizes, fromSize }: { more: number; sizes: number[]; fromSize: number }) => (
    <div data-testid="builder">{`more:${more} sizes:${sizes.join(',')} from:${fromSize}`}</div>
  ),
}));

const { default: TireSetSection } = await import('./TireSetSection');

const tire = (over: Partial<SingleTire> = {}): SingleTire =>
  ({
    id: '1',
    name: '(1) | MICHELIN | 225/65/17',
    brand: 'MICHELIN',
    model2: 'DEFENDER',
    size: '225/65/17',
    price: '100',
    treadDepth: '9.0',
    patched: 'No',
    condition: 'Used',
    city: 'Miami',
    runFlat: 'No',
    images: [],
    ...over,
  }) as SingleTire;

const unit = (id: string, tread: number): SetUnit => ({
  id,
  price: 100,
  tread,
  patched: false,
  condition: 'Used',
  city: 'Miami',
});

beforeEach(() => {
  h.units = [];
  h.calls = 0;
});

const renderSection = async (t: SingleTire) => render(await TireSetSection({ tire: t }));

describe('TireSetSection', () => {
  it('counts only tires that can join a set with this one (FR4, AC1)', async () => {
    h.units = [
      unit('1', 9),
      ...['2', '3', '4', '5', '6', '7'].map(id => unit(id, 8)),
      unit('8', 6),
    ];
    await renderSection(tire());
    expect(screen.getByTestId('builder')).toHaveTextContent('more:6 sizes:2,3,4 from:2');
  });

  it('renders nothing when no set can be built (AC3)', async () => {
    h.units = [unit('9', 5)];
    const { container } = await renderSection(tire());
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing and queries nothing for a sold tire (AC17)', async () => {
    const { container } = await renderSection(tire({ status: 'sold' }));
    expect(container).toBeEmptyDOMElement();
    expect(h.calls).toBe(0);
  });

  it('renders nothing for a tire without a model', async () => {
    const { container } = await renderSection(tire({ model2: undefined }));
    expect(container).toBeEmptyDOMElement();
    expect(h.calls).toBe(0);
  });
});
