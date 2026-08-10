/**
 * Which language to answer a customer in.
 *
 * The model handles its own reply language; this exists for the copy the
 * **server** composes — the no-results message, the narrowing hint, the
 * absent-brand notice. Those are written here rather than by the model so they
 * can be asserted in a test, which means the server has to make the same
 * language call the model would.
 *
 * Only the last three user turns are read: a conversation that switches to
 * English should not keep answering in Spanish because it opened with "hola".
 */
const SPANISH_PATTERN =
  /\b(llantas?|llanta|medida|medidas|marca|marcas|busco|quiero|tienen|tienes|necesito|precio|precios|nueva|nuevas|usada|usadas|aro|ancho|perfil|hola|gracias|por favor|disponible|disponibles|cuánto|cuanto|dónde|donde|están|hay|puedes|puede|cómo|como)\b/i;

export function isSpanish(messages: { role: string; content: string }[]): boolean {
  const recentText = messages
    .filter(m => m.role === 'user')
    .slice(-3)
    .map(m => m.content)
    .join(' ');
  return SPANISH_PATTERN.test(recentText);
}
