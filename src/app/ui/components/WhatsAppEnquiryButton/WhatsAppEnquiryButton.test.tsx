import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { SingleTire } from '@/app/interfaces/tires';
import { buildTireEnquiry } from '@/app/utils/tireEnquiry';

import { WhatsAppEnquiryButton } from './WhatsAppEnquiryButton';

const tire: SingleTire = {
  id: '471004',
  code: 'A4821',
  status: 'Used',
  name: '(A4821) | BRIDGESTONE | 235/50/20',
  color: 'Black',
  price: '135',
  brand: 'Bridgestone',
  brandId: 3,
  condition: 'Used',
  patched: 'Yes',
  remainingLife: '80%',
  treadDepth: '8/32',
  size: '235/50/20',
  model2: 'Alenza A/S 02',
  images: [],
  details: [],
};

const link = () => screen.getByRole('link');

describe('WhatsAppEnquiryButton', () => {
  // AC10 — one event, distinguished by surface
  it('is instrumented declaratively, with the surface that separates it', () => {
    render(<WhatsAppEnquiryButton product={tire} />);
    const el = link();
    expect(el.getAttribute('data-track')).toBe('open_whatsapp');
    expect(el.getAttribute('data-track-category')).toBe('product_enquiry');
    expect(el.getAttribute('data-track-surface')).toBe('tire_detail');
  });

  // AC6 end-to-end — the href decodes back to exactly the built message
  it('carries the whole message through the URL intact', () => {
    render(<WhatsAppEnquiryButton product={tire} />);
    const url = new URL(link().getAttribute('href')!);
    expect(url.origin + url.pathname).toBe('https://wa.me/14073644016');
    expect(url.searchParams.get('text')).toBe(buildTireEnquiry(tire));
  });

  // AC11
  it('says what it does and that it leaves the site', () => {
    render(<WhatsAppEnquiryButton product={tire} />);
    const name = link().textContent ?? '';
    expect(name).toContain('Ask about this tire');
    expect(name).toContain('WhatsApp');
    expect(name).toContain('opens in a new tab');
  });

  it('opens externally without handing the new tab a window reference', () => {
    render(<WhatsAppEnquiryButton product={tire} />);
    expect(link().getAttribute('target')).toBe('_blank');
    expect(link().getAttribute('rel')).toContain('noopener');
  });

  // AC11 / AC12 — keyboard and touch affordances
  it('keeps a visible focus ring and a 44px target', () => {
    render(<WhatsAppEnquiryButton product={tire} />);
    const cls = link().getAttribute('class') ?? '';
    expect(cls).toContain('focus-visible:ring-2');
    expect(cls).toContain('min-h-11');
    expect(cls).toContain('w-full');
  });

  it('changes what it offers when the tire is already sold', () => {
    render(<WhatsAppEnquiryButton product={{ ...tire, status: 'sold' }} />);
    expect(link().textContent).toContain('Ask about a similar tire');
  });

  /**
   * The one constraint a render test cannot observe: this must stay on the
   * server. A `'use client'` here would add a hydration boundary to a page
   * `003-detail-server-render` deliberately keeps server-only, and nothing about
   * the rendered output would change to tell us.
   *
   * Checked as the *first statement*, which is the only position where the
   * directive does anything — prose mentioning it does not count.
   */
  it('is a Server Component — no client directive', async () => {
    const { readFileSync } = await import('node:fs');
    const source = readFileSync(
      'src/app/ui/components/WhatsAppEnquiryButton/WhatsAppEnquiryButton.tsx',
      'utf8'
    );
    const firstStatement = source.split('\n').find(l => l.trim() && !l.trim().startsWith('//'));
    expect(firstStatement?.trim()).not.toMatch(/^['"]use client['"]/);
  });
});
