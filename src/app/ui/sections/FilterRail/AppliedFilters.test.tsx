import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import AppliedFilters from './AppliedFilters';

const chip = (label: string, group = 'brand', href = '/tires') => ({ group, label, href });

describe('AppliedFilters', () => {
  it('renders nothing when nothing is applied', () => {
    const { container } = render(<AppliedFilters chips={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows one removable chip per applied filter', () => {
    render(
      <AppliedFilters
        chips={[
          chip('Pirelli', 'brand', '/tires?d=20'),
          chip('20"', 'rim', '/tires?brands=PIRELLI'),
        ]}
      />
    );

    expect(screen.getByRole('link', { name: 'Remove Pirelli filter' })).toHaveAttribute(
      'href',
      '/tires?d=20'
    );
    expect(screen.getByRole('link', { name: 'Remove 20" filter' })).toHaveAttribute(
      'href',
      '/tires?brands=PIRELLI'
    );
  });

  /**
   * Both this component and the rail's header rendered a Clear all, so the page
   * showed the same control twice, four lines apart. Neither test nor type
   * caught it — it only appeared once the two were on screen together.
   */
  it('leaves Clear all to the rail header rather than showing it twice', () => {
    render(<AppliedFilters chips={[chip('Pirelli'), chip('20"', 'rim')]} />);
    expect(screen.queryByRole('link', { name: 'Clear all' })).not.toBeInTheDocument();
  });

  it('uses links, so removing a filter is navigation like everything else', () => {
    const { container } = render(<AppliedFilters chips={[chip('Pirelli')]} />);
    expect(container.querySelectorAll('button')).toHaveLength(0);
    expect(container.querySelectorAll('[aria-pressed]')).toHaveLength(0);
  });
});
