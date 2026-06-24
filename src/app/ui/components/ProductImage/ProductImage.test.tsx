import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ProductImage from './ProductImage';

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: unknown; alt?: string }) => (
    <img src={typeof src === 'string' ? src : ''} alt={typeof alt === 'string' ? alt : ''} />
  ),
}));

describe('ProductImage', () => {
  it('uses a valid image source as-is', () => {
    render(
      <ProductImage
        product={{ imageSrc: '/tire.jpg', imageAlt: 'Michelin tire', brand: 'Michelin' }}
      />
    );
    expect(screen.getByRole('img', { name: 'Michelin tire' })).toHaveAttribute('src', '/tire.jpg');
  });

  it('falls back to the default image for invalid sources', () => {
    render(<ProductImage product={{ imageSrc: 'N/A', imageAlt: 'x', brand: 'Toyo' }} />);
    expect(screen.getByRole('img')).toHaveAttribute('src', '/images/default-tire.png');
  });

  it('falls back to the brand name when alt text is empty', () => {
    render(<ProductImage product={{ imageSrc: '/t.jpg', imageAlt: '', brand: 'Pirelli' }} />);
    expect(screen.getByRole('img', { name: 'Pirelli' })).toBeInTheDocument();
  });
});
