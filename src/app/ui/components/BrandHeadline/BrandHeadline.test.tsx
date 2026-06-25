import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import BrandHeadline from './BrandHeadline';

describe('BrandHeadline', () => {
  it('renders the full headline as an h1 by default', () => {
    render(<BrandHeadline />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('The Tires you need, The Price you want');
  });

  it('honors the `as` prop for the heading level', () => {
    render(<BrandHeadline as="h2" />);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('highlights the four accent words in source order', () => {
    const { container } = render(<BrandHeadline />);
    const accents = Array.from(container.querySelectorAll('.text-lime-400')).map(
      el => el.textContent
    );
    expect(accents).toEqual(['Tires', 'need', 'Price', 'want']);
  });
});
