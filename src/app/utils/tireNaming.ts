/**
 * How a tire is written when a person reads it.
 *
 * The catalog stores brands in capitals — `BRIDGESTONE`, `GROUNDSPEED` — which is
 * fine as data and shouting as a heading. `025` title-cased them in the tire
 * `<title>`, and the visible headings kept the capitals, so the same tire read
 * `Bridgestone` in the browser tab and `BRIDGESTONE` on the page.
 *
 * This lives in its own module rather than in `seo.ts` so client components can
 * import it without pulling the whole metadata layer into the browser bundle.
 *
 * It is the single place a tire's name is composed. Before it there were three:
 * `transformTireData` built `(CODE) | BRAND | MODEL | SIZE`,
 * `mapTireRecordToSingleTire` built `(CODE) | BRAND | SIZE`, and the dashboard
 * built `BRAND | MODEL | 275/55R20` — so the same tire in the cart was named
 * three different ways depending on which screen it was added from.
 */

/**
 * Brands the catalog spells in a way `brandName` cannot derive.
 *
 * Keyed by the stored (upper-case) form. The catalog holds **75 brands** and
 * plain title-casing is right for 74 of them; this exists for the one that is not
 * and grows only when another arrives.
 */
const BRAND_EXCEPTIONS: Record<string, string> = {
  BFGOODRICH: 'BFGoodrich',
};

/**
 * Renders a stored brand for display: `BRIDGESTONE` → `Bridgestone`.
 *
 * Two things this must not do. It must not touch **model** names — the catalog
 * has 96 distinct all-caps tokens of three letters or fewer (`XL`, `RFT`, `RSC`,
 * `A/S`) against a handful of real words spelled the same way (`ALL`, `NO`,
 * `FIT`), so any length-based rule mangles one set; `Primacy ALL Season` is what
 * the first attempt produced. And it must not assume the stored value is clean:
 * `'BACK COUNTRY '` carries a **trailing space**, which is why today's titles
 * render a double space before the model.
 *
 * An unknown brand degrades to title case rather than throwing.
 */
export function brandName(brand?: string): string {
  const raw = (brand ?? '').trim().replace(/\s+/g, ' ');
  if (!raw) return '';

  const exception = BRAND_EXCEPTIONS[raw.toUpperCase()];
  if (exception) return exception;

  return raw
    .toLowerCase()
    .replace(/(^|[\s-])(\w)/g, (_, sep: string, ch: string) => sep + ch.toUpperCase());
}

/**
 * Words that appear inside model names in four letters or fewer.
 *
 * The catalog holds **166 all-caps tokens of four letters or fewer** and almost
 * all are codes: `XL`, `RFT`, `RSC`, `PNCS`, `MOE`, `HRS`. These are the ones
 * that are actually words, taken from the catalog rather than guessed.
 *
 * `NO` is deliberately absent: in a Pirelli model it marks Nissan original
 * equipment, not the English word.
 */
const MODEL_WORDS = new Set([
  'ZERO',
  'ALL',
  'PLUS',
  'TOUR',
  'EDGE',
  'MAXX',
  'MAX',
  'AVID',
  'NEO',
  'PRO',
  'SEAL',
  'EVO',
  'IOTA',
  'LION',
  'OPEN',
  'GRIP',
  'HAWK',
  'GEN',
  'NERO',
  'CUP',
  'FIT',
  'BACK',
  'ECO',
  'ION',
  'TRAC',
  'CITY',
  'PAW',
  'APEX',
  'FUEL',
  'LIFE',
  'SNOW',
  'BIG',
  'BLUE',
  'REVO',
  'STAR',
  'TECH',
  'OCTA',
  'RUN',
  'FLAT',
  'ALP',
  'ROAD',
  'VIVA',
  'LOAD',
  'ZIEX',
]);

/**
 * Compounds the manufacturer writes with an internal capital. Stored in flat
 * capitals, the casing cannot be recovered — `PREMIUMCONTACT` would otherwise
 * read `Premiumcontact`.
 */
const MODEL_EXCEPTIONS: Record<string, string> = {
  ECOIMPACT: 'EcoImpact',
  PROCONTACT: 'ProContact',
  PREMIUMCONTACT: 'PremiumContact',
  CROSSCONTACT: 'CrossContact',
  ECOCONTACT: 'EcoContact',
  SPORTCONTACT: 'SportContact',
  CONTISPORTCONTACT: 'ContiSportContact',
  CONTISILENT: 'ContiSilent',
  SOUNDCOMFORT: 'SoundComfort',
  DRIVEGUARD: 'DriveGuard',
  BLUEARTH: 'BluEarth',
};

/**
 * Renders a stored model for display: `ADVAN SPORT V107 XL` → `Advan Sport V107 XL`.
 *
 * A token is a word — and so title-cased — when it is **five letters or more**,
 * or when it is one of the short words listed above. Everything else keeps its
 * stored form, which is what protects `XL`, `A/S`, `PZ4`, `V107`, `RSC`, `SUV`
 * and the roman numerals.
 *
 * **This was recommended against and asked for anyway.** A first attempt in `025`
 * used a length rule alone and produced `Primacy ALL Season`; the rule here is
 * built from the catalog's actual token distribution instead of guessed, which
 * is what makes it survivable. It will still be wrong for a compound nobody has
 * added to the exceptions above — the failure is visible rather than silent.
 */
export function modelName(model?: string): string {
  const raw = (model ?? '').trim().replace(/\s+/g, ' ');
  if (!raw) return '';

  return raw
    .split(' ')
    .map(token => {
      const exception = MODEL_EXCEPTIONS[token.toUpperCase()];
      if (exception) return exception;

      const isWord = /^[A-Za-z]+$/.test(token);
      if (!isWord) return token;
      if (token.length >= 5 || MODEL_WORDS.has(token.toUpperCase())) {
        return token[0].toUpperCase() + token.slice(1).toLowerCase();
      }
      return token;
    })
    .join(' ');
}

/** The tire as a person would name it: brand, then model. */
export function tireTitle(tire: { brand?: string; model?: string }): string {
  return [brandName(tire.brand), modelName(tire.model)].filter(Boolean).join(' ');
}
