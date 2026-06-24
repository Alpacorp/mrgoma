import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import WhatsAppButton from './WhatsAppButton';

const mocks = vi.hoisted(() => ({ usePathname: vi.fn(() => '/') }));
vi.mock('next/navigation', () => ({ usePathname: mocks.usePathname }));

describe('WhatsAppButton', () => {
  beforeEach(() => {
    mocks.usePathname.mockReturnValue('/tires');
  });

  it('renders a WhatsApp link with the FL number and prefilled message', () => {
    render(<WhatsAppButton />);
    const link = screen.getByRole('link', { name: /chat with us on whatsapp/i });
    const href = link.getAttribute('href') ?? '';
    expect(href).toContain('wa.me/14073644016');
    expect(href).toContain('tires%20and%20services');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('is hidden on the dashboard (internal admin)', () => {
    mocks.usePathname.mockReturnValue('/dashboard');
    const { container } = render(<WhatsAppButton />);
    expect(container).toBeEmptyDOMElement();
  });

  it('is hidden on login subpaths', () => {
    mocks.usePathname.mockReturnValue('/login/reset');
    const { container } = render(<WhatsAppButton />);
    expect(container.querySelector('a')).toBeNull();
  });
});
