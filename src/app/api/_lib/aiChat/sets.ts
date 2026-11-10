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
    ? '\n\n🛞 Para armar tu juego: abre cualquier llanta y en "Build your set" elige 2, 3 o 4. Te armamos el juego con llantas iguales (misma marca, modelo y medida, labrado parecido y en la misma ciudad) y lo agregas al carrito de una vez.'
    : '\n\n🛞 To build your set: open any tire and use "Build your set" to pick 2, 3 or 4. We match identical tires (same brand, model and size, similar tread, same city) and you add the whole set to your cart at once.';
}
