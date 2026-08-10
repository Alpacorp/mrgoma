import { describe, expect, it } from 'vitest';

import { isSpanish } from './language';

const user = (content: string) => ({ role: 'user', content });

describe('isSpanish', () => {
  it('recognises a Spanish request', () => {
    expect(isSpanish([user('busco llantas usadas aro 17')])).toBe(true);
  });

  it('leaves an English request in English', () => {
    expect(isSpanish([user('looking for 17 inch tires')])).toBe(false);
  });

  it('reads only the last three user turns', () => {
    // Someone who opens with "hola" and continues in English should be answered
    // in English, not held to the language of their greeting forever.
    const history = [
      user('hola'),
      user('do you have Michelin'),
      user('what about 17 inch'),
      user('cheapest first please'),
    ];

    expect(isSpanish(history)).toBe(false);
  });

  it('ignores what the assistant said', () => {
    // The assistant's own Spanish reply must not decide the next answer.
    const history = [
      { role: 'assistant', content: '¿Qué medida buscas? tienes llantas disponibles' },
      user('do you have Pirelli'),
    ];

    expect(isSpanish(history)).toBe(false);
  });
});
