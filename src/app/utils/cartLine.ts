import { brandName, modelName } from '@/app/utils/tireNaming';

/**
 * How a tire reads on a cart or checkout line.
 *
 * Until 2026-08-24 both screens printed the raw composed identity —
 * `(259893) | BRIDGESTONE | DUELER H/L ALENZA | 275/55/20` — and there were
 * three different composers feeding it, so the same tire was named one way when
 * added from a card, another from the detail page, and a third from the
 * dashboard. It also bore no resemblance to the name the buyer had just read on
 * the card they clicked.
 *
 * Now it is written the way the rest of the site writes a tire, with the stock
 * code moved to its own line where it is useful for support rather than in the
 * middle of the product name.
 */
export type CartLineItem = {
  name: string;
  brand?: string;
  model?: string;
  size?: string;
  code?: string;
};

export type CartLine = {
  /** `Bridgestone Dueler H/L Alenza` */
  title: string;
  /** `275/55/20`, or empty when the item predates the fields. */
  size: string;
  /** `#259893`, or empty. */
  code: string;
};

export function cartLine(item: CartLineItem): CartLine {
  /**
   * The model is what makes the new rendering possible, so it is also the marker
   * of an item that has it. Anything saved to `localStorage` before this shipped
   * carries only `name`, and a brand on its own would turn
   * `Michelin Pilot Sport` into `Michelin` — less than it said before.
   */
  const composed = item.model
    ? [brandName(item.brand), modelName(item.model)].filter(Boolean).join(' ')
    : '';

  return {
    title: composed || item.name,
    size: (item.size ?? '').trim(),
    code: item.code ? `#${item.code}` : '',
  };
}
