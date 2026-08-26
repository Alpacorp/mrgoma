import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import FacetGroup, { type FacetOption } from './FacetGroup';

const option = (over: Partial<FacetOption> = {}): FacetOption => ({
  value: 'PIRELLI',
  label: 'Pirelli',
  count: 964,
  href: '/tires?brands=PIRELLI',
  applied: false,
  ...over,
});

describe('FacetGroup', () => {
  it('shows a count beside every option', () => {
    render(
      <FacetGroup
        title="Brand"
        trackGroup="brand"
        options={[option(), option({ value: 'MICHELIN', label: 'Michelin', count: 303 })]}
      />
    );
    expect(screen.getByText('964')).toBeInTheDocument();
    expect(screen.getByText('303')).toBeInTheDocument();
  });

  it('groups thousands so a four-digit count is readable at a glance', () => {
    render(
      <FacetGroup
        title="Condition"
        trackGroup="condition"
        options={[option({ count: 2698 }), option({ value: 'x' })]}
      />
    );
    expect(screen.getByText('2,698')).toBeInTheDocument();
  });

  /**
   * The accessibility fault this feature exists partly to fix: `/tires` emitted
   * **254 `aria-pressed` attributes on links** on a single page. `aria-pressed`
   * belongs to a button role; a filter that navigates is a link, and its applied
   * state is `aria-current`.
   */
  it('marks the applied option with aria-current and nothing with aria-pressed', () => {
    const { container } = render(
      <FacetGroup
        title="Brand"
        trackGroup="brand"
        options={[option({ applied: true }), option({ value: 'MICHELIN', label: 'Michelin' })]}
      />
    );

    expect(screen.getByRole('link', { name: /Pirelli/ })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('link', { name: /Michelin/ })).not.toHaveAttribute('aria-current');
    expect(container.querySelectorAll('[aria-pressed]')).toHaveLength(0);
  });

  it('renders filters as links, so a filtered view is a real URL', () => {
    render(
      <FacetGroup
        title="Brand"
        trackGroup="brand"
        options={[option(), option({ value: 'M', label: 'M' })]}
      />
    );
    expect(screen.getByRole('link', { name: /Pirelli/ })).toHaveAttribute(
      'href',
      '/tires?brands=PIRELLI'
    );
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('instruments each option, as tech-stack.md requires of new controls', () => {
    render(
      <FacetGroup
        title="Brand"
        trackGroup="brand"
        options={[option(), option({ value: 'M', label: 'M' })]}
      />
    );
    const link = screen.getByRole('link', { name: /Pirelli/ });
    expect(link).toHaveAttribute('data-track', 'filter_apply');
    expect(link).toHaveAttribute('data-track-label', 'brand:PIRELLI');
  });

  /**
   * A group where every tire shares the same value cannot narrow anything. It
   * would render as a single option whose count equals the total — a control
   * that looks like a choice and is not one.
   */
  it('renders nothing when there is only one option to choose', () => {
    const { container } = render(
      <FacetGroup title="Brand" trackGroup="brand" options={[option()]} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing at all when there are no options', () => {
    const { container } = render(<FacetGroup title="Brand" trackGroup="brand" options={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('still renders a lone option when it carries its own control, like the brand search', () => {
    render(
      <FacetGroup title="Brand" trackGroup="brand" options={[option()]}>
        <input aria-label="Search brands" />
      </FacetGroup>
    );
    expect(screen.getByLabelText('Search brands')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Pirelli/ })).toBeInTheDocument();
  });

  it('names the group so the options are not read as a bare list', () => {
    render(
      <FacetGroup
        title="Rim size"
        trackGroup="rimsize"
        options={[option(), option({ value: 'x' })]}
      />
    );
    expect(screen.getByRole('heading', { name: 'Rim size' })).toBeInTheDocument();
  });
});

/**
 * **Found by clicking it, not by reading the code.** With Pirelli applied, the
 * Bridgestone option read "Bridgestone 440" and clicking it returned 1.397 —
 * because brands combine with OR. Both numbers are true; the presentation was
 * not. A plain link with a number beside it promises that number.
 */
describe('groups whose options add up say so', () => {
  it('shows a box on an additive group', () => {
    const { container } = render(
      <FacetGroup
        title="Condition"
        trackGroup="condition"
        multiSelect
        options={[option(), option({ value: 'x' })]}
      />
    );
    // Decoration only: the state is announced by aria-current, and a checkbox
    // role would promise an interaction the link does not have.
    const boxes = container.querySelectorAll('span[aria-hidden="true"]');
    expect(boxes.length).toBeGreaterThanOrEqual(2);
    expect(container.querySelectorAll('[role="checkbox"]')).toHaveLength(0);
  });

  it('does not on a group where only one value can be true at a time', () => {
    // A tire has one rim size. Picking 21" replaces 20"; nothing is added.
    const { container } = render(
      <FacetGroup
        title="Rim size"
        trackGroup="rimsize"
        options={[option({ label: '20"' }), option({ value: 'x', label: '21"' })]}
      />
    );
    const applied = container.querySelectorAll('span[aria-hidden="true"]');
    expect(applied).toHaveLength(0);
  });

  it('still marks the applied option for a screen reader either way', () => {
    for (const multi of [true, false]) {
      const { container, unmount } = render(
        <FacetGroup
          title="Condition"
          trackGroup="condition"
          multiSelect={multi}
          options={[option({ applied: true }), option({ value: 'x' })]}
        />
      );
      expect(container.querySelector('[aria-current="true"]')).toBeTruthy();
      unmount();
    }
  });
});
