import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * Two things that look right on screen and are wrong to everything else.
 */

const APP = join(process.cwd(), 'src', 'app');

function tsxFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) tsxFiles(full, acc);
    else if (/\.tsx$/.test(entry)) acc.push(full);
  }
  return acc;
}

const FILES = tsxFiles(APP);
const rel = (file: string) => file.replace(process.cwd(), '');

describe('a heading is a phrase, not two words stuck together', () => {
  /**
   * `<br />` is a line break, **not whitespace**. A heading built with one looks
   * like two lines and reads as one run-on token to Google, to a screen reader,
   * and to anyone who selects it and copies:
   *
   *   MICHELINTires · 235/50/20Tires in Miami · AboutMrGomaTires
   *
   * Twelve of these shipped — the audit reported thirteen *pages*, which was
   * really eleven `<h1>` templates covering some four hundred, plus one `<h2>`
   * nobody had counted. The fix is a `block` span and a real `{' '}`: CSS does
   * the break, the string keeps its space.
   *
   * **All six levels, deliberately.** Restricting this to `<h1>` is what let the
   * `<h2>` on `/about-us` sit there — `Built in Miami.Driven by trust.` — and the
   * next one is as likely to arrive in a section heading as in a page title.
   */
  it('has no <br /> inside any h1–h6', () => {
    const offenders: string[] = [];

    for (const file of FILES) {
      const source = readFileSync(file, 'utf8');
      for (const match of source.matchAll(/<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/g)) {
        if (match[2].includes('<br')) offenders.push(`${rel(file)}  <${match[1]}>`);
      }
    }

    expect(offenders).toEqual([]);
  });
});

/**
 * Assistive-technology strings, in the language the document declares.
 *
 * **This is not language detection, and must not be read as such.** No regex
 * tells `"Cerrar menu"` from English, and a criterion promising otherwise was
 * rejected during `022`'s analysis for exactly that reason. What is enforced is
 * two concrete rules:
 *
 *   1. no Spanish accented character;
 *   2. no word from the list below.
 *
 * That catches the one string that was in the tree — `Abrir menú de navegación`,
 * which trips both — and the likeliest next ones. **Unaccented Spanish outside
 * the list passes**, and that is a known gap rather than an oversight.
 *
 * No exemption for `/dashboard`: there was one match in the whole tree and it was
 * on the public site, so the rule costs nothing today. If the crew later wants
 * the staff area in Spanish, add the exemption then, with the reason.
 */
const SPANISH_CHARACTERS = /[áéíóúñÁÉÍÓÚÑ¿¡]/;
/**
 * Spanish-only words. **`menu` is deliberately absent**: it is spelled the same
 * in English, and including it made this guard fail on `aria-label="Close menu"`
 * on its first run — a false positive on correct code, which is the failure mode
 * that makes a guard get deleted. `menú` with its accent is already covered by
 * the character rule above.
 */
const SPANISH_WORDS = /\b(abrir|cerrar|buscar|enviar|siguiente|anterior)\b/i;

/** `aria-label="…"`, `alt="…"`, `title="…"` — the strings a screen reader reads. */
const ASSISTIVE_STRING = /(?:aria-label|alt|title)="([^"]+)"/g;

describe('assistive-technology strings are in English', () => {
  it('finds no Spanish in an aria-label, alt or title', () => {
    const offenders: string[] = [];

    for (const file of FILES) {
      for (const match of readFileSync(file, 'utf8').matchAll(ASSISTIVE_STRING)) {
        const value = match[1];
        // Template expressions are composed elsewhere; only literals are checked.
        if (value.includes('${') || value.includes('{')) continue;
        if (SPANISH_CHARACTERS.test(value) || SPANISH_WORDS.test(value)) {
          offenders.push(`${rel(file)}: ${match[0]}`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});
