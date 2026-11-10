import { describe, expect, it } from 'vitest';

import { asksForSet, buildSetHint } from './sets';

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
