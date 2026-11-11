import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ChatSetCard } from '@/app/utils/chatSets';
import type { ListPayload } from '@/app/utils/ecommerce';

import ChatSetCards, { resetChatSetList } from './ChatSetCards';

vi.mock('@/app/utils/analytics', () => ({ trackEcommerce: vi.fn(() => Promise.resolve()) }));
const { trackEcommerce } = await import('@/app/utils/analytics');
const sent = vi.mocked(trackEcommerce);

const card = (over: Partial<ChatSetCard> = {}): ChatSetCard => ({
  brand: 'Michelin',
  model: 'Pilot Sport 4',
  condition: 'Used',
  city: 'Orlando',
  count: 4,
  total: 480,
  treadLabel: '7–8/32, Δ1/32',
  href: '/tires/12-michelin-225-45-17?set=12,13,14,15',
  size: '225/45/17',
  units: [
    { id: '12', price: 120 },
    { id: '13', price: 120 },
    { id: '14', price: 120 },
    { id: '15', price: 120 },
  ],
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
    render(
      <ChatSetCards sets={[card(), card({ brand: 'Pirelli', model: 'P Zero', href: '/b' })]} />
    );

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

describe('chat sets in GA4 (046, AC4)', () => {
  beforeEach(() => {
    sent.mockClear();
    resetChatSetList();
  });

  it('reports the cards as one chat_sets list, each tire at its card position', () => {
    const second = card({
      brand: 'Pirelli',
      model: 'P Zero',
      href: '/b',
      units: [
        { id: '21', price: 90 },
        { id: '22', price: 90 },
      ],
    });
    render(
      <ChatSetCards
        sets={[card(), second, card({ href: '/c', units: [{ id: '31', price: 1 }] })]}
      />
    );

    const lists = sent.mock.calls.filter(([e]) => e === 'view_item_list');
    expect(lists).toHaveLength(1);
    const payload = lists[0][1] as ListPayload;
    expect(payload.item_list_id).toBe('chat_sets');
    expect(payload.items.map(i => [i.item_id, i.index])).toEqual([
      ['12', 1],
      ['13', 1],
      ['14', 1],
      ['15', 1],
      ['21', 2],
      ['22', 2],
      ['31', 3],
    ]);
    expect(payload.items[4]).toMatchObject({ item_brand: 'Pirelli', item_variant: '225/45/17' });
  });

  it('sends select_item with the opened set at its position', async () => {
    const second = card({
      href: '#two',
      units: [
        { id: '21', price: 90 },
        { id: '22', price: 90 },
      ],
    });
    render(<ChatSetCards sets={[card({ href: '#one' }), second]} />);

    await userEvent.click(screen.getAllByRole('link')[1]);

    const selects = sent.mock.calls.filter(([e]) => e === 'select_item');
    expect(selects).toHaveLength(1);
    expect((selects[0][1] as ListPayload).items.map(i => [i.item_id, i.index])).toEqual([
      ['21', 2],
      ['22', 2],
    ]);
  });

  it('does not resend the same cards on a re-render', () => {
    const { rerender } = render(<ChatSetCards sets={[card()]} />);
    rerender(<ChatSetCards sets={[card()]} />);
    expect(sent.mock.calls.filter(([e]) => e === 'view_item_list')).toHaveLength(1);
  });
});

describe('the chat never touches the cart (AC10)', () => {
  it.each(['ChatSetCards.tsx', 'AiChat.tsx', 'hooks/useAiChat.ts'])('%s', file => {
    const src = readFileSync(join(__dirname, file), 'utf8');
    expect(src).not.toMatch(/CartContext|useCart|addSetToCart|addToCart/);
  });
});
