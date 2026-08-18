/**
 * The WhatsApp line, in one place.
 *
 * **No imports, on purpose** — the same constraint `analyticsEvents.ts`
 * documents. This module is pulled into the browser bundle (the promo banner,
 * the contact page) *and* into route handlers (the AI chat prompt, the
 * organization JSON-LD). Importing anything environment-specific here would drag
 * one side onto the other.
 *
 * Before 2026-08-17 the number was written by hand twelve times across eight
 * files. That is how a business ends up with a phone number that is correct in
 * twelve places and wrong in the one that matters — the same failure mode that
 * put a stale store directory inside the assistant's prompt, where no build,
 * type check or lint could see it. `whatsapp.guard.test.ts` now fails the build
 * if a thirteenth copy appears.
 *
 * Deliberately **not** the seven store lines in `locationsConfig`: this is the
 * business's own WhatsApp and belongs to no single shop.
 */

/** Digits only. `wa.me` rejects anything else, including a leading `+`. */
export const WHATSAPP_NUMBER = '14073644016';

/** E.164, for `tel:` links and schema.org `telephone`. */
export const WHATSAPP_TEL = `+${WHATSAPP_NUMBER}`;

/**
 * How the number is written when a person reads it.
 *
 * Three of the copies this module replaced were in this punctuated form rather
 * than as digits — in the contact page, a guide's prose and the assistant's
 * prompt — which is exactly why a `grep` for the digits found twelve copies and
 * the guard test found fifteen.
 */
export const WHATSAPP_DISPLAY = '+1 (407) 364-4016';

/**
 * A `wa.me` link, optionally opening the chat with a message already typed.
 *
 * The message is encoded rather than interpolated raw: it carries newlines and
 * may carry `#` or `&`, each of which silently truncates a query string.
 */
export function whatsAppLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
