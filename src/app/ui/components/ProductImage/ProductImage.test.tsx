import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ProductImage from './ProductImage';

vi.mock('next/image', () => ({
  default: ({ src, alt, onError }: { src: unknown; alt?: string; onError?: () => void }) => (
    <img
      src={typeof src === 'string' ? src : ''}
      alt={typeof alt === 'string' ? alt : ''}
      onError={onError}
    />
  ),
}));

describe('ProductImage', () => {
  it('uses a valid relative image source as-is', () => {
    render(
      <ProductImage
        product={{ imageSrc: '/tire.jpg', imageAlt: 'Michelin tire', brand: 'Michelin' }}
      />
    );
    expect(screen.getByRole('img', { name: 'Michelin tire' })).toHaveAttribute('src', '/tire.jpg');
  });

  it('accepts absolute http(s) URLs', () => {
    render(
      <ProductImage product={{ imageSrc: 'https://cdn.x.com/t.jpg', imageAlt: 'a', brand: 'B' }} />
    );
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://cdn.x.com/t.jpg');
  });

  it('falls back to the default image for the N/A sentinel', () => {
    render(<ProductImage product={{ imageSrc: 'N/A', imageAlt: 'x', brand: 'Toyo' }} />);
    expect(screen.getByRole('img')).toHaveAttribute('src', '/images/default-tire.png');
  });

  it('falls back to the default image for a malformed URL', () => {
    render(<ProductImage product={{ imageSrc: 'not a url', imageAlt: 'x', brand: 'Toyo' }} />);
    expect(screen.getByRole('img')).toHaveAttribute('src', '/images/default-tire.png');
  });

  it('falls back to the brand name when alt text is empty', () => {
    render(<ProductImage product={{ imageSrc: '/t.jpg', imageAlt: '', brand: 'Pirelli' }} />);
    expect(screen.getByRole('img', { name: 'Pirelli' })).toBeInTheDocument();
  });

  it('swaps to the default image when loading fails', () => {
    render(<ProductImage product={{ imageSrc: '/good.jpg', imageAlt: 'a', brand: 'B' }} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/good.jpg');
    fireEvent.error(img);
    expect(img).toHaveAttribute('src', '/images/default-tire.png');
  });
});
