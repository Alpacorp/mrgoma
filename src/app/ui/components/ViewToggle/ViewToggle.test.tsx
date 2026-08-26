import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ViewToggle from './ViewToggle';

describe('ViewToggle', () => {
  it('marks the current view', () => {
    render(<ViewToggle current="table" search="?view=table" basePath="/tires" />);
    expect(screen.getByRole('link', { name: 'Table' })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('link', { name: 'List' })).not.toHaveAttribute('aria-current');
  });

  it('keeps every filter when switching', () => {
    render(<ViewToggle current="list" search="?brands=PIRELLI&d=20" basePath="/tires" />);
    const href = screen.getByRole('link', { name: 'Table' }).getAttribute('href')!;
    expect(href).toContain('brands=PIRELLI');
    expect(href).toContain('d=20');
    expect(href).toContain('view=table');
  });

  it('leaves the default view out of the URL rather than spelling it out', () => {
    // `?view=list` is the default; writing it would give the same page two URLs,
    // which is the duplicate-URL problem `022` spent a feature removing.
    render(<ViewToggle current="table" search="?view=table&d=20" basePath="/tires" />);
    expect(screen.getByRole('link', { name: 'List' })).toHaveAttribute('href', '/tires?d=20');
  });

  it('is a group of links, not a set of buttons', () => {
    const { container } = render(<ViewToggle current="list" search="" basePath="/tires" />);
    expect(screen.getByRole('group', { name: 'Result view' })).toBeInTheDocument();
    expect(container.querySelectorAll('button')).toHaveLength(0);
    expect(container.querySelectorAll('[aria-pressed]')).toHaveLength(0);
  });
});
