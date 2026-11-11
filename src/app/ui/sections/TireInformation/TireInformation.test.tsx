import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SingleTire } from '@/app/interfaces/tires';

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));
vi.mock('@/app/ui/components/ViewItemTracker/ViewItemTracker', () => ({ default: () => null }));
vi.mock('@/app/ui/components/AddToCartButton/AddToCartButton', () => ({ default: () => null }));
vi.mock('@/app/ui/components/WhatsAppEnquiryButton/WhatsAppEnquiryButton', () => ({
  WhatsAppEnquiryButton: () => null,
}));
vi.mock('@/app/ui/components/OtherCityMatch/OtherCityMatch', () => ({
  default: ({ tireCity }: { tireCity: string }) => <span data-testid="match">{tireCity}</span>,
}));

import TireInformation from './TireInformation';

const tire = (over: Partial<SingleTire> = {}): SingleTire => ({
  id: 10,
  code: '407562',
  name: '(407562) | CONTINENTAL | 235/50/19',
  color: '',
  price: '125',
  brand: 'CONTINENTAL',
  brandId: 1,
  condition: 'Used',
  patched: 'No',
  remainingLife: '69%',
  treadDepth: '7.0',
  size: '235/50/19',
  model2: 'PROCONTACT GX',
  images: [],
  details: [],
  city: 'Orlando',
  ...over,
});

beforeEach(() => localStorage.clear());

describe('TireInformation — location line (043)', () => {
  it('says where the tire is, the same for every visitor, with the match slot inline', () => {
    render(<TireInformation singleTire={tire()} setSlot={<div data-testid="set" />} />);
    const line = screen.getByText(/Located in/).closest('p')!;
    expect(line).toHaveTextContent('Located in Orlando');
    expect(screen.getByTestId('match')).toHaveTextContent('Orlando');
    // Kept apart from the set block (041), which follows it.
    expect(
      line.compareDocumentPosition(screen.getByTestId('set')) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('is not shown for a sold tire', () => {
    render(<TireInformation singleTire={tire({ status: 'Sold' })} />);
    expect(screen.queryByText(/Located in/)).toBeNull();
  });
});

describe('TireInformation — sold tire alternative (045)', () => {
  it('shows the sold slot only for a sold tire (AC4, AC5)', () => {
    const slot = <p data-testid="sold-slot" />;
    const { unmount } = render(<TireInformation singleTire={tire()} soldSlot={slot} />);
    expect(screen.queryByTestId('sold-slot')).toBeNull();
    unmount();
    render(<TireInformation singleTire={tire({ status: 'sold' })} soldSlot={slot} />);
    expect(screen.getByTestId('sold-slot')).toBeInTheDocument();
    expect(screen.getByText('Not available')).toBeInTheDocument();
  });

  it('shows no price and no shipping badge for a sold tire', () => {
    const { unmount } = render(<TireInformation singleTire={tire()} />);
    expect(screen.getByText('Free Shipping')).toBeInTheDocument();
    unmount();
    render(<TireInformation singleTire={tire({ status: 'sold', price: '650' })} />);
    expect(screen.queryByText(/\$650/)).toBeNull();
    expect(screen.queryByText('Free Shipping')).toBeNull();
  });
});
