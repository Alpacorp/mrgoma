import { whatsAppLink } from '@/app/utils/whatsapp';

import type { Dimension } from './dimensions';

/**
 * Copy the server writes, rather than the model.
 *
 * The model already replies in the customer's language, so composing these here
 * costs a duplicated language decision. It buys something worth more: these
 * strings can be asserted in a test. A hint the model was merely *asked* to
 * produce can only be checked by reading transcripts and hoping.
 *
 * `buildNoResultsMessage` established the pattern before this feature; the other
 * two follow it.
 */

export function buildNoResultsMessage(
  spanish: boolean,
  filterParams: Record<string, unknown>
): string {
  const w = filterParams.w;
  const s = filterParams.s;
  const d = filterParams.d;
  const sizeStr = w && s && d ? ` ${w}/${s}R${d}` : '';
  const waUrl = whatsAppLink(
    spanish
      ? `Hola, busco llantas${sizeStr} y no encontré disponibilidad en el sitio web.`
      : `Hi, I'm looking for tires${sizeStr} and didn't find availability on the website.`
  );

  if (spanish) {
    return (
      `No tenemos llantas${sizeStr} disponibles en este momento en nuestro inventario en línea 😔\n\n` +
      `Nuestro inventario se actualiza constantemente — es posible que tengamos lo que necesitas en tienda. ` +
      `Te recomendamos contactarnos directamente para una confirmación rápida:\n\n` +
      `💬 [Escribir por WhatsApp](${waUrl})`
    );
  }

  return (
    `We don't have tires${sizeStr} available in our online inventory right now 😔\n\n` +
    `Our inventory updates constantly — we may have what you need in store. ` +
    `We recommend reaching out directly for a quick confirmation:\n\n` +
    `💬 [Chat on WhatsApp](${waUrl})`
  );
}

const DIMENSION_WORDS: Record<Dimension, { en: string; es: string }> = {
  size: { en: 'tire size', es: 'medida' },
  rim: { en: 'rim size', es: 'aro' },
  brand: { en: 'brand', es: 'marca' },
  condition: { en: 'condition', es: 'condición' },
  price: { en: 'price', es: 'precio' },
  tread: { en: 'tread life', es: 'vida útil' },
  store: { en: 'store', es: 'tienda' },
  sale_kind: { en: 'sale kind', es: 'tipo de venta' },
  local: { en: 'local stock', es: 'stock local' },
  code: { en: 'tire code', es: 'código' },
};

function joinWords(words: string[], spanish: boolean): string {
  if (words.length <= 1) return words[0] ?? '';
  const last = words[words.length - 1];
  return `${words.slice(0, -1).join(', ')} ${spanish ? 'o' : 'or'} ${last}`;
}

/**
 * "You can also narrow by…", naming only what this search has not used (FR4).
 *
 * Returns an empty string when nothing is left, so a customer who has already
 * given everything is not offered a menu of what they just said.
 */
export function buildNarrowingHint(spanish: boolean, dimensions: Dimension[]): string {
  if (dimensions.length === 0) return '';

  const words = dimensions.map(d => DIMENSION_WORDS[d][spanish ? 'es' : 'en']);

  return spanish
    ? `\n\nTambién puedo filtrar por ${joinWords(words, true)} si quieres afinar más.`
    : `\n\nI can also narrow by ${joinWords(words, false)} if you'd like to refine.`;
}

/**
 * A brand we do not carry, said plainly (FR6).
 *
 * Deliberately distinguishable from `buildNoResultsMessage`: "we don't stock
 * that brand" and "we have none of it right now" are different facts, and a
 * customer acts differently on each — one waits for restock, the other picks
 * something else. Reporting the first as the second is the kind of hiding the
 * mission rules out.
 */
export function buildUnknownBrandMessage(spanish: boolean, brands: string[]): string {
  const list = joinWords(brands, spanish);
  const waUrl = whatsAppLink(
    spanish ? `Hola, pregunto por llantas ${list}.` : `Hi, I'm asking about ${list} tires.`
  );

  if (spanish) {
    return (
      `No trabajamos ${list} en nuestro catálogo 🙁\n\n` +
      `Sí tenemos muchas otras marcas — dime tu medida o un presupuesto y te muestro ` +
      `lo que hay. Si buscas esa marca en concreto, escríbenos:\n\n` +
      `💬 [Escribir por WhatsApp](${waUrl})`
    );
  }

  return (
    `We don't carry ${list} in our catalog 🙁\n\n` +
    `We do stock plenty of other brands — tell me your size or a budget and I'll ` +
    `show you what we have. If you need that brand specifically, reach out:\n\n` +
    `💬 [Chat on WhatsApp](${waUrl})`
  );
}
