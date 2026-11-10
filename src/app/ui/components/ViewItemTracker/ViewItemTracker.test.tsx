import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ViewItemTracker from './ViewItemTracker';

vi.mock('@/app/utils/analytics', () => ({ trackEcommerce: vi.fn(() => Promise.resolve()) }));
const { trackEcommerce } = await import('@/app/utils/analytics');
const track = vi.mocked(trackEcommerce);

const tire = {
  id: 42,
  name: '(42) | MICHELIN | DEFENDER | 225/65R17',
  price: '120',
  brand: 'MICHELIN',
  model: 'DEFENDER',
  size: '225/65R17',
  condition: 'Used',
};

beforeEach(() => track.mockClear());

describe('ViewItemTracker', () => {
  it('reports view_item once with the tire as the single item', () => {
    render(<ViewItemTracker tire={tire} />);
    expect(track).toHaveBeenCalledTimes(1);
    const [name, payload] = track.mock.calls[0];
    expect(name).toBe('view_item');
    expect(payload).toMatchObject({ currency: 'USD', value: 120 });
    expect(payload.items).toEqual([
      expect.objectContaining({ item_id: '42', item_name: 'Used Michelin Defender 225/65R17' }),
    ]);
  });

  it('does not report again when re-rendered for the same tire', () => {
    const { rerender } = render(<ViewItemTracker tire={tire} />);
    rerender(<ViewItemTracker tire={{ ...tire }} />);
    expect(track).toHaveBeenCalledTimes(1);
  });

  it('reports again for a different tire without a reload', () => {
    const { rerender } = render(<ViewItemTracker tire={tire} />);
    rerender(<ViewItemTracker tire={{ ...tire, id: 43 }} />);
    expect(track).toHaveBeenCalledTimes(2);
    expect(track.mock.calls[1][1].items[0].item_id).toBe('43');
  });

  it('renders nothing', () => {
    const { container } = render(<ViewItemTracker tire={tire} />);
    expect(container).toBeEmptyDOMElement();
  });
});
