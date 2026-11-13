import type { ChatSetCard, ChatSetOutcome } from '@/app/utils/chatSets';
import type { SetSize, TireCity } from '@/app/utils/tireSets';
import { whatsAppLink } from '@/app/utils/whatsapp';

/**
 * Tire sets in the public chat (feature 041, chat step 1).
 *
 * The chat cannot build a set itself — that is feature 044. What it can do is
 * stop a customer who asked for "4 tires" from landing on the catalog without
 * knowing that every tire page builds the set for them. The tip is appended by
 * the server, like the narrowing hint, so it can be asserted in a test rather
 * than merely requested of a model.
 */

const NUMBER = '(?:2|3|4|two|three|four|dos|tres|cuatro)';

/**
 * "a set", "pair of tires", "4 tires", "juego de llantas", "par de llantas",
 * "cuatro llantas", "las 4"… Only the last user turn is read: a set asked for
 * three messages ago has already been answered.
 */
const SET_PATTERN = new RegExp(
  [
    `\\b(?:set|sets|pair)\\b`,
    `\\b${NUMBER}\\s+(?:matching\\s+)?(?:tires|tyres)\\b`,
    `\\b(?:juego|juegos|par)\\s+de\\s+(?:llantas|cauchos|neum[aá]ticos|gomas)\\b`,
    `\\b(?:juego|juegos)\\b`,
    `\\b${NUMBER}\\s+(?:llantas|cauchos|neum[aá]ticos|gomas)\\b`,
    `\\blas\\s+(?:4|cuatro)\\b`,
  ].join('|'),
  'i'
);

export function asksForSet(messages: { role: string; content: string }[]): boolean {
  const last = [...messages].reverse().find(m => m.role === 'user');
  return last ? SET_PATTERN.test(last.content) : false;
}

/** How to get the set, in the customer's language. */
export function buildSetHint(spanish: boolean): string {
  return spanish
    ? '\n\n🛞 Para armar tu juego: abre cualquier llanta y en "Build your set" elige 2, 3 o 4. Te armamos el juego con llantas iguales (misma marca, modelo y medida y labrado parecido, de Miami u Orlando) y lo agregas al carrito de una vez. Lo recoges en la tienda que prefieras.'
    : '\n\n🛞 To build your set: open any tire and use "Build your set" to pick 2, 3 or 4. We match identical tires (same brand, model and size, similar tread, from Miami or Orlando) and you add the whole set to your cart at once. Pick it up at any of our stores.';
}

/* ── Feature 044: sets the chat looked up itself ─────────────────────────── */

export type SetsMessageInput = {
  outcome: ChatSetOutcome;
  /** The number asked for. */
  requested: SetSize;
  /** The number of the sets shown (smaller than `requested` for `smaller`). */
  shown: SetSize;
  /** `w/s/d`. */
  size: string;
  /** What the customer narrowed by, so "none" says none *of what* (AC8). */
  brands?: string[];
  condition?: 'new' | 'used';
  /** A city the customer named (not the estimate). */
  namedCity?: TireCity;
};

/**
 * "used Pirelli 315/30R22" / "Pirelli 315/30R22 usadas", plus " in Orlando".
 * The city is a preference since 047 (D7): only `found` sets are all in it, so
 * only `found` names it in the sentence; the others add `pickupIn`.
 */
function describeAsk(spanish: boolean, m: SetsMessageInput, size: string) {
  const brand = (m.brands ?? []).join(spanish ? ' o ' : ' or ');
  const cond = m.condition
    ? spanish
      ? m.condition === 'new'
        ? ' nuevas'
        : ' usadas'
      : `${m.condition} `
    : '';
  const city = m.namedCity ? (spanish ? ` en ${m.namedCity}` : ` in ${m.namedCity}`) : '';
  return spanish
    ? { what: `${brand ? `${brand} ` : ''}${size}${cond}`, city }
    : { what: `${cond}${brand ? `${brand} ` : ''}${size}`, city };
}

/** "You can pick them up at any of our Orlando stores." — 047, D2 / D7. */
const pickupIn = (spanish: boolean, city?: TireCity) =>
  city
    ? spanish
      ? ` Puedes recogerlas en cualquiera de nuestras tiendas de ${city}.`
      : ` You can pick them up at any of our ${city} stores.`
    : '';

const prettySize = (size: string) => {
  const [w, s, d] = size.split('/');
  return w && s && d ? `${w}/${s}R${d}` : size;
};

const catalogHref = (size: string) => {
  const [w, s, d] = size.split('/');
  return `/tires?w=${w}&s=${s}&d=${d}&page=1`;
};

/**
 * The text above the set cards, written by the server for each outcome (D7):
 * the model never states counts, prices or availability. Always ends with the
 * "as of now" line when cards follow (D5).
 */
export function buildSetsMessage(spanish: boolean, m: SetsMessageInput): string {
  const size = prettySize(m.size);
  const { what, city } = describeAsk(spanish, m, size);
  const asOfNow = spanish
    ? '\n\nPrecios y disponibilidad de este momento: revisas el juego y lo confirmas en la página de la llanta.'
    : '\n\nPrices and stock as of now: you review the set and confirm it on the tire page.';

  switch (m.outcome) {
    case 'found':
      return (
        (spanish
          ? `Estos juegos de ${m.shown} llantas ${what}${city} se pueden armar ahora:`
          : `These sets of ${m.shown} ${what} tires${city} can be built right now:`) + asOfNow
      );
    case 'any_city':
      return (
        (spanish
          ? `No hay juegos de ${m.shown} llantas ${what} con todas en ${m.namedCity} ahora mismo, pero estos sí se pueden armar (cada uno dice dónde están sus llantas).` +
            pickupIn(true, m.namedCity)
          : `There's no set of ${m.shown} ${what} tires all in ${m.namedCity} right now, but these can be built (each one says where its tires are).` +
            pickupIn(false, m.namedCity)) + asOfNow
      );
    case 'smaller':
      return (
        (spanish
          ? `No hay juegos de ${m.requested} llantas ${what} ahora mismo. Estos de ${m.shown} sí se pueden armar:` +
            pickupIn(true, m.namedCity)
          : `There's no set of ${m.requested} ${what} tires right now. These sets of ${m.shown} can be built:` +
            pickupIn(false, m.namedCity)) + asOfNow
      );
    case 'none':
    default: {
      const wa = whatsAppLink(
        spanish
          ? `Hola, busco un juego de ${m.requested} llantas ${what}${city}.`
          : `Hi, I'm looking for a set of ${m.requested} ${what} tires${city}.`
      );
      return spanish
        ? `No hay ningún juego de llantas ${what} que se pueda armar ahora mismo. ` +
            `Puedes ver las llantas sueltas de esa medida o escribirnos:\n\n` +
            `🛞 [Ver llantas ${size}](${catalogHref(m.size)})\n💬 [Escribir por WhatsApp](${wa})`
        : `No set of ${what} tires can be built right now. ` +
            `You can see single tires in that size or message us:\n\n` +
            `🛞 [See ${size} tires](${catalogHref(m.size)})\n💬 [Chat on WhatsApp](${wa})`;
    }
  }
}

/**
 * What the next model turn sees of the cards, so "only Michelin" refines the
 * same search. Brand, model, cities and count only — no prices or treads, so the
 * model has nothing to quote — and short: the route rejects any message over
 * 2,000 characters, assistant turns included.
 */
export function summarizeSetsForHistory(cards: ChatSetCard[]): string {
  if (cards.length === 0) return '';
  const lines = cards.map(c =>
    `- ${c.brand} ${c.model} · ${c.count} · ${c.cities.join(' and ')}`.slice(0, 120)
  );
  return `\n\n[Sets shown: ${cards.length}]\n${lines.join('\n')}`;
}

/** Message + summary, cut to fit the route's 2,000-character cap. */
export const MAX_HISTORY_MESSAGE = 2000;
export function withSetsSummary(message: string, cards: ChatSetCard[]): string {
  const full = `${message}${summarizeSetsForHistory(cards)}`;
  return full.length <= MAX_HISTORY_MESSAGE ? full : full.slice(0, MAX_HISTORY_MESSAGE);
}
