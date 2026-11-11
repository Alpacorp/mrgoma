import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { ChatSetCard } from '@/app/utils/chatSets';

import ChatSetCards from './ChatSetCards';

const card = (over: Partial<ChatSetCard> = {}): ChatSetCard => ({
  brand: 'Michelin',
  model: 'Pilot Sport 4',
  condition: 'Used',
  city: 'Orlando',
  count: 4,
  total: 480,
  treadLabel: '7–8/32, Δ1/32',
  href: '/tires/12-michelin-225-45-17?set=12,13,14,15',
  ...over,
});

describe('ChatSetCards (044)', () => {
  it('shows brand and model, count, condition, city, total and tread (AC1)', () => {
    render(<ChatSetCards sets={[card()]} />);

    expect(screen.getByRole('heading', { name: 'Michelin Pilot Sport 4' })).toBeInTheDocument();
    expect(screen.getByText('4 tires · Used · Orlando')).toBeInTheDocument();
    expect(screen.getByText('$480')).toBeInTheDocument();
    expect(screen.getByText(/tread 7–8\/32/)).toBeInTheDocument();
  });

  it('names each link after the set it opens', () => {
    render(<ChatSetCards sets={[card(), card({ brand: 'Pirelli', model: 'P Zero', href: '/b' })]} />);

    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAccessibleName(
      'Review set: Michelin Pilot Sport 4, 4 tires · Used · Orlando, $480'
    );
    expect(links[0]).toHaveAttribute('href', '/tires/12-michelin-225-45-17?set=12,13,14,15');
    expect(links[1]).toHaveAccessibleName(/^Review set: Pirelli P Zero/);
  });

  it('tracks the open declaratively with position, size and city only (AC13)', () => {
    render(<ChatSetCards sets={[card(), card({ href: '/b', city: 'Miami', count: 2 })]} />);

    const second = screen.getAllByRole('link')[1];
    expect(second).toHaveAttribute('data-track', 'chat_set_open');
    expect(second).toHaveAttribute('data-track-category', 'ai_chat');
    expect(second).toHaveAttribute('data-track-position', '2');
    expect(second).toHaveAttribute('data-track-set-size', '2');
    expect(second).toHaveAttribute('data-track-city', 'Miami');
    const trackAttrs = [...second.attributes].filter(a => a.name.startsWith('data-track'));
    expect(trackAttrs.map(a => a.name).sort()).toEqual(
      [
        'data-track',
        'data-track-category',
        'data-track-city',
        'data-track-position',
        'data-track-set-size',
      ].sort()
    );
  });

  it('labels in Spanish when the conversation is in Spanish (AC9)', () => {
    render(<ChatSetCards sets={[card({ condition: 'New' })]} spanish />);

    expect(screen.getByText('4 llantas · Nuevas · Orlando')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAccessibleName(/^Ver juego:/);
  });

  it('lets the chat close when a set is opened', async () => {
    const onOpen = vi.fn();
    render(<ChatSetCards sets={[card({ href: '#set' })]} onOpen={onOpen} />);

    await userEvent.click(screen.getByRole('link'));

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('renders nothing without sets', () => {
    const { container } = render(<ChatSetCards sets={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('the chat never touches the cart (AC10)', () => {
  it.each(['ChatSetCards.tsx', 'AiChat.tsx', 'hooks/useAiChat.ts'])('%s', file => {
    const src = readFileSync(join(__dirname, file), 'utf8');
    expect(src).not.toMatch(/CartContext|useCart|addSetToCart|addToCart/);
  });
});
