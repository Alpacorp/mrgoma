import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import PromoBanner, { PromoContent } from './PromoBanner';

const content: PromoContent = {
  enabled: true,
  title: 'Test promo',
  description: 'Some description',
  dismissible: true,
};

const clearCookie = () => {
  document.cookie = 'promo_test=;path=/;max-age=0';
};

beforeEach(clearCookie);
afterEach(() => {
  cleanup();
  clearCookie();
});

describe('PromoBanner dismissal (cookie-persisted, no CLS)', () => {
  it('renders when no dismiss cookie is set', () => {
    render(<PromoBanner content={content} storageKey="test" />);
    expect(screen.queryByRole('region', { name: 'Promotion' })).not.toBeNull();
  });

  it('writes the dismiss cookie and hides the banner on close', () => {
    render(<PromoBanner content={content} storageKey="test" />);
    fireEvent.click(screen.getByRole('button', { name: 'Close promotion' }));
    expect(document.cookie).toContain('promo_test=dismissed');
    expect(screen.queryByRole('region', { name: 'Promotion' })).toBeNull();
  });

  it('does not render when the dismiss cookie is already set (returning user)', () => {
    document.cookie = 'promo_test=dismissed;path=/';
    render(<PromoBanner content={content} storageKey="test" />);
    expect(screen.queryByRole('region', { name: 'Promotion' })).toBeNull();
  });

  it('exposes an id matching the pre-paint hide selector', () => {
    render(<PromoBanner content={content} storageKey="test" />);
    expect(document.getElementById('promo-test')).not.toBeNull();
  });
});
