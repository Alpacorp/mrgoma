import { describe, expect, it } from 'vitest';

import { WHATSAPP_NUMBER, WHATSAPP_TEL, whatsAppLink } from './whatsapp';

describe('the number itself', () => {
  it('is digits only — wa.me rejects a leading +', () => {
    expect(WHATSAPP_NUMBER).toMatch(/^\d+$/);
  });

  it('exposes an E.164 form for tel: and schema.org', () => {
    expect(WHATSAPP_TEL).toBe(`+${WHATSAPP_NUMBER}`);
    expect(WHATSAPP_TEL.startsWith('+')).toBe(true);
  });
});

describe('whatsAppLink', () => {
  it('opens an empty chat when there is nothing to say', () => {
    expect(whatsAppLink()).toBe(`https://wa.me/${WHATSAPP_NUMBER}`);
    expect(whatsAppLink('')).toBe(`https://wa.me/${WHATSAPP_NUMBER}`);
  });

  it('carries a plain message', () => {
    const url = new URL(whatsAppLink('Hi MrGoma'));
    expect(url.searchParams.get('text')).toBe('Hi MrGoma');
  });

  /**
   * The reason the message is encoded rather than interpolated. `#` starts a
   * fragment and `&` starts the next parameter, so an unencoded message is
   * truncated at the first one — silently, and only for the customers whose
   * tire happens to contain one.
   */
  it('survives characters that would otherwise truncate the query string', () => {
    const message = [
      'Hi MrGoma, I\'m interested in this tire:',
      '',
      '#A4821 — Bridgestone "Alenza" A/S 02 & more',
      'Size: 235/50/20',
      'https://www.mrgomatires.com/tires/471004-bridgestone-235-50-20?a=1&b=2',
    ].join('\n');

    const url = new URL(whatsAppLink(message));
    expect(url.searchParams.get('text')).toBe(message);
  });

  it('encodes rather than emits the raw characters', () => {
    const link = whatsAppLink('a#b&c d\ne');
    expect(link).toContain('%23'); // #
    expect(link).toContain('%26'); // &
    expect(link).toContain('%0A'); // newline
    expect(link).not.toContain('#');
    expect(link).not.toContain(' ');
  });
});
