import { describe, expect, it } from 'vitest';

import { cartLine } from './cartLine';
import { brandName, modelName, tireTitle } from './tireNaming';

/**
 * The same tire used to be named five different ways across five screens, fed by
 * three different composers: `transformTireData` built
 * `(CODE) | BRAND | MODEL | SIZE`, `mapTireRecordToSingleTire` built
 * `(CODE) | BRAND | SIZE`, and the dashboard built `BRAND | MODEL | 275/55R20`.
 * A tire in the cart was therefore named according to the screen it was added
 * from.
 */

describe('modelName', () => {
  /**
   * Casing model names was recommended against and asked for anyway. A length
   * rule alone produced `Primacy ALL Season` in `025`; this rule is built from
   * the catalog's real token distribution, where 166 all-caps tokens of four
   * letters or fewer are almost all codes.
   */
  it('writes words and leaves codes alone', () => {
    expect(modelName('ADVAN SPORT V107 XL')).toBe('Advan Sport V107 XL');
    expect(modelName('P ZERO TM PZ4 RSC RFT XL')).toBe('P Zero TM PZ4 RSC RFT XL');
    expect(modelName('ALENZA SPORT A/S')).toBe('Alenza Sport A/S');
    expect(modelName('VENTUS S1 EVO3 SUV HRS KONTROL RSC RFT XL')).toBe(
      'Ventus S1 EVO3 SUV HRS Kontrol RSC RFT XL'
    );
  });

  // The case that made the first attempt fail: `ALL` is three letters and a word.
  it('cases the short words that really are words', () => {
    expect(modelName('PRIMACY ALL SEASON DT')).toBe('Primacy All Season DT');
    expect(modelName('SCORPION ZERO ALL SEASON')).toBe('Scorpion Zero All Season');
  });

  // `NO` marks Nissan original equipment on a Pirelli, not the English word.
  it('leaves NO alone, because it is not the word', () => {
    expect(modelName('CINTURATO P7 ALL SEASON NO ECOIMPACT XL')).toBe(
      'Cinturato P7 All Season NO EcoImpact XL'
    );
  });

  it('restores the capital inside a compound the manufacturer writes that way', () => {
    expect(modelName('PREMIUMCONTACT 6 XL')).toBe('PremiumContact 6 XL');
    expect(modelName('CROSSCONTACT ATR')).toBe('CrossContact ATR');
    expect(modelName('BLUEARTH ES32')).toBe('BluEarth ES32');
  });

  it('survives an empty or missing model', () => {
    expect(modelName('')).toBe('');
    expect(modelName(undefined)).toBe('');
  });
});

describe('tireTitle', () => {
  it('is the one name the site uses for a tire', () => {
    expect(tireTitle({ brand: 'BRIDGESTONE', model: 'DUELER H/L ALENZA' })).toBe(
      'Bridgestone Dueler H/L Alenza'
    );
  });

  it('works with only a brand', () => {
    expect(tireTitle({ brand: 'TOYO' })).toBe('Toyo');
  });
});

describe('cartLine', () => {
  const item = {
    name: '(259893) | BRIDGESTONE | DUELER H/L ALENZA | 275/55/20',
    brand: 'BRIDGESTONE',
    model: 'DUELER H/L ALENZA',
    size: '275/55/20',
    code: '259893',
  };

  it('reads like the card the buyer clicked, not like a database row', () => {
    expect(cartLine(item)).toEqual({
      title: 'Bridgestone Dueler H/L Alenza',
      size: '275/55/20',
      code: '#259893',
    });
  });

  /**
   * Carts saved before this shipped are still in `localStorage` carrying only
   * `name`. Composing from a lone brand would turn `Michelin Pilot Sport` into
   * `Michelin` — less than the line said before.
   */
  it('keeps the old name for an item saved before the fields existed', () => {
    expect(cartLine({ name: 'Michelin Pilot Sport', brand: 'Michelin' }).title).toBe(
      'Michelin Pilot Sport'
    );
    expect(cartLine({ name: 'Michelin Pilot Sport' }).title).toBe('Michelin Pilot Sport');
  });

  it('leaves size and code empty rather than inventing them', () => {
    expect(cartLine({ name: 'x' })).toEqual({ title: 'x', size: '', code: '' });
  });
});

/**
 * The guard: one tire, every screen, one name. If a surface ever composes its
 * own again, these stop agreeing.
 */
describe('every screen names the same tire the same way', () => {
  const tire = { brand: 'BRIDGESTONE', model: 'DUELER H/L ALENZA' };
  const expected = 'Bridgestone Dueler H/L Alenza';

  it('card, detail heading and cart line all agree', () => {
    expect(tireTitle(tire)).toBe(expected);
    expect(brandName(tire.brand) + ' ' + modelName(tire.model)).toBe(expected);
    expect(cartLine({ name: 'raw', ...tire }).title).toBe(expected);
  });
});
