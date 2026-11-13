import { describe, expect, it } from 'vitest';

import type { ChatSetCard } from '@/app/utils/chatSets';

import {
  asksForSet,
  buildSetHint,
  buildSetsMessage,
  summarizeSetsForHistory,
  withSetsSummary,
} from './sets';

const user = (content: string) => [{ role: 'user', content }];

describe('asksForSet', () => {
  it.each([
    'I need 4 tires 235/50/19',
    'a set of michelin 225/45/17',
    'pair of tires for the rear',
    'four matching tires',
    'necesito un juego de llantas aro 17',
    'busco 4 llantas 205/55/16',
    'cuatro llantas usadas',
    'un par de llantas pirelli',
    'quiero las 4 iguales',
  ])('detects "%s"', text => {
    expect(asksForSet(user(text))).toBe(true);
  });

  it.each([
    'michelin 225/45/17',
    'llantas usadas aro 17',
    'tires under $80',
    'reparar una llanta',
    'I need 1 tire',
  ])('ignores "%s"', text => {
    expect(asksForSet(user(text))).toBe(false);
  });

  it('reads only the last customer turn', () => {
    const messages = [
      { role: 'user', content: 'I need 4 tires' },
      { role: 'assistant', content: 'Sure' },
      { role: 'user', content: 'what are your hours?' },
    ];
    expect(asksForSet(messages)).toBe(false);
  });
});

describe('buildSetHint', () => {
  it('points to "Build your set" in both languages', () => {
    expect(buildSetHint(false)).toMatch(/Build your set/);
    expect(buildSetHint(true)).toMatch(/Build your set[\s\S]*juego/);
  });
});

describe('buildSetsMessage (044, D4, D5)', () => {
  const base = { requested: 4 as const, shown: 4 as const, size: '225/45/17' };

  it('found: names the size and ends with the "as of now" line, EN and ES', () => {
    const en = buildSetsMessage(false, { ...base, outcome: 'found' });
    expect(en).toContain('sets of 4 225/45R17 tires');
    expect(en).toMatch(/Prices and stock as of now/);
    const es = buildSetsMessage(true, { ...base, outcome: 'found' });
    expect(es).toContain('juegos de 4 llantas 225/45R17');
    expect(es).toMatch(/Precios y disponibilidad de este momento/);
  });

  it('any_city: none all in the named city, these from both, pickup there (047, AC15)', () => {
    const m = buildSetsMessage(false, { ...base, outcome: 'any_city', namedCity: 'Orlando' });
    expect(m).toContain('no set of 4 225/45R17 tires all in Orlando right now');
    expect(m).toContain('these can be built (each one says where its tires are)');
    expect(m).toContain('You can pick them up at any of our Orlando stores.');
    // The cards may all be in the other city: the text names no city for them.
    expect(m).not.toMatch(/Miami/);
    expect(m).not.toMatch(/only in|none in your city/i);
    const es = buildSetsMessage(true, { ...base, outcome: 'any_city', namedCity: 'Orlando' });
    expect(es).toContain('Puedes recogerlas en cualquiera de nuestras tiendas de Orlando.');
  });

  it('found with a named city: the sets are all there', () => {
    const m = buildSetsMessage(false, { ...base, outcome: 'found', namedCity: 'Orlando' });
    expect(m).toContain('sets of 4 225/45R17 tires in Orlando can be built');
  });

  it('smaller: never presents the fallback as what was asked', () => {
    const m = buildSetsMessage(true, { ...base, outcome: 'smaller', shown: 2 });
    expect(m).toContain('No hay juegos de 4 llantas');
    expect(m).toContain('Estos de 2 sí se pueden armar');
  });

  it('none: links the catalog for the size and WhatsApp, no "as of now" line', () => {
    const m = buildSetsMessage(false, { ...base, outcome: 'none' });
    expect(m).toContain('[See 225/45R17 tires](/tires?w=225&s=45&d=17&page=1)');
    expect(m).toMatch(/\[Chat on WhatsApp\]\(https:\/\/wa\.me\//);
    expect(m).not.toMatch(/as of now/);
  });

  it('names what the customer narrowed by, so "none" is not misread (AC8)', () => {
    const m = buildSetsMessage(false, {
      ...base,
      outcome: 'smaller',
      shown: 2,
      brands: ['Pirelli'],
      condition: 'used',
      namedCity: 'Orlando',
    });
    // The ladder searches both cities (047): the city becomes a pickup line.
    expect(m).toContain("There's no set of 4 used Pirelli 225/45R17 tires right now");
    expect(m).toContain('You can pick them up at any of our Orlando stores.');
    const es = buildSetsMessage(true, {
      ...base,
      outcome: 'none',
      brands: ['Pirelli'],
      condition: 'new',
      namedCity: 'Miami',
    });
    expect(es).toContain('No hay ningún juego de llantas Pirelli 225/45R17 nuevas que');
  });

  it('never mentions warehouses or shelves', () => {
    for (const outcome of ['found', 'any_city', 'smaller', 'none'] as const) {
      expect(buildSetsMessage(false, { ...base, outcome, namedCity: 'Miami' })).not.toMatch(
        /vault|warehouse|shelf|location code/i
      );
    }
  });
});

describe('summarizeSetsForHistory (044, analyze #2, #3)', () => {
  const card = (over: Partial<ChatSetCard> = {}): ChatSetCard => ({
    brand: 'Michelin',
    model: 'Pilot Sport 4',
    condition: 'Used',
    cities: ['Miami'],
    count: 4,
    total: 480,
    treadLabel: '7–8/32, Δ1/32',
    href: '/tires/1-michelin-225-45-17?set=1,2,3,4',
    size: '225/45/17',
    units: [{ id: '1', price: 120 }],
    ...over,
  });

  it('carries brand, model, count and cities — never prices or treads', () => {
    const s = summarizeSetsForHistory([card()]);
    expect(s).toContain('Michelin Pilot Sport 4 · 4 · Miami');
    expect(summarizeSetsForHistory([card({ cities: ['Miami', 'Orlando'] })])).toContain(
      '· 4 · Miami and Orlando'
    );
    expect(s).not.toMatch(/\$|480|\/32/);
    expect(summarizeSetsForHistory([])).toBe('');
  });

  it('keeps message + summary within the 2,000-character cap at the worst case', () => {
    const long = 'X'.repeat(300);
    const cards = [1, 2, 3].map(() => card({ brand: long, model: long }));
    const message = buildSetsMessage(false, {
      outcome: 'any_city',
      requested: 4,
      shown: 4,
      size: '225/45/17',
      namedCity: 'Orlando',
    });
    expect(withSetsSummary(message, cards).length).toBeLessThanOrEqual(2000);
    expect(withSetsSummary('a'.repeat(1990), cards).length).toBeLessThanOrEqual(2000);
  });
});
