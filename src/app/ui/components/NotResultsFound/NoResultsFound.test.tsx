import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import NoResultsFound from './NoResultsFound';

/**
 * **79% of the brand × rim combinations `/tires` offers have no stock** — 338 of
 * 1.610. Every one of them used to be answered with "Please try different
 * specifications", with all 114 brand chips still on screen and nothing saying
 * which of them would have worked.
 */
describe('NoResultsFound', () => {
  it('still works as a plain message when there is nothing to suggest', () => {
    render(<NoResultsFound title="No Tires Found" message="Nothing matched." />);
    expect(screen.getByRole('heading', { name: 'No Tires Found' })).toBeInTheDocument();
    expect(screen.queryByText(/Try removing/)).not.toBeInTheDocument();
  });

  it('names each filter to drop and what dropping it returns', () => {
    render(
      <NoResultsFound
        suggestions={[
          { label: '13"', count: 957, href: '/tires?brands=PIRELLI' },
          { label: 'Pirelli', count: 2, href: '/tires?d=13' },
        ]}
      />
    );

    const first = screen.getByRole('link', { name: /Remove 13"/ });
    expect(first).toHaveAttribute('href', '/tires?brands=PIRELLI');
    expect(first).toHaveTextContent('957 tires');

    expect(screen.getByRole('link', { name: /Remove Pirelli/ })).toHaveTextContent('2 tires');
  });

  it('says "tire" when there is one, which is when the wording is most visible', () => {
    render(<NoResultsFound suggestions={[{ label: '14"', count: 1, href: '/tires' }]} />);
    expect(screen.getByRole('link')).toHaveTextContent('1 tire');
    expect(screen.getByRole('link')).not.toHaveTextContent('1 tires');
  });

  it('groups thousands, so a four-digit promise is readable', () => {
    render(<NoResultsFound suggestions={[{ label: '13"', count: 1341, href: '/tires' }]} />);
    expect(screen.getByRole('link')).toHaveTextContent('1,341 tires');
  });
});
