/**
 * The prompts each assistant offers a visitor who hasn't typed anything yet.
 *
 * Kept as data rather than inline in the component so the route tests can drive
 * themselves from this exact array. That matters here: three of the public
 * suggestions — `Pirelli`, `usadas menos de $50` and `used tires under $80` —
 * are partial filters, and until 2026-08-06 tapping the one the interface itself
 * suggested made the assistant ask for a tire size instead of searching. A
 * suggestion the chat cannot honour should fail a test, not a customer.
 */

export const PUBLIC_EXAMPLE_QUERIES = [
  '205/55/16 nuevas Michelin',
  'used Michelin aro 17',
  'usadas menos de $50',
  '¿qué diferencia hay entre nueva y usada?',
  '195/65/15 with more than 50% life',
  'Pirelli',
  'used tires under $80',
];

export const DASHBOARD_EXAMPLE_QUERIES = [
  '275/55/20',
  'used tires under $80',
  'new tires rim 17',
  'Bridgestone 195/65/15',
  'tires at Orlando store',
  'used with more than 50% life',
];
