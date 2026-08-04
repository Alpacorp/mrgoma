/**
 * Analytics consent: the one place it is read and the one place it is written.
 *
 * Consent lives in two stores that must agree — a cookie (so it survives a
 * cleared localStorage and is readable early) and localStorage (so it survives a
 * cleared cookie jar). Reading them was previously duplicated between the banner
 * and the analytics loader, which is how two copies of a rule start to drift.
 *
 * What consent actually governs: **Google Analytics only**. Vercel Web Analytics
 * writes no cookie, stores nothing on the device and cannot follow anyone
 * between sites, so it runs regardless — decision D1 of feature 015. Any copy
 * shown to a visitor must say so rather than implying the choice switches off
 * all measurement.
 *
 * `GA_ID` lives here rather than in `gtag.ts` on purpose: revoking needs the
 * measurement id to set Google's opt-out property, and `gtag.ts` needs
 * `hasConsent()`. Were the id to stay there, the two modules would import each
 * other. This module imports nothing of ours, so the dependency runs one way.
 */

export const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

/** Days of silence after declining on a first visit — a soft "not now". */
export const DECLINE_DAYS = 1;

/**
 * Days of silence after withdrawing an existing consent. Deliberately longer
 * than `DECLINE_DAYS`: withdrawing is a considered reversal by someone who
 * already decided once, and asking again the next morning would be exactly the
 * nagging this feature exists to remove.
 */
export const WITHDRAW_DAYS = 30;

export const CONSENT_KEY = 'cookiesAccepted';
export const DECLINE_UNTIL_KEY = 'cookieConsentDeclineUntil';

declare global {
  interface Window {
    /** Google's documented opt-out property, `ga-disable-<MEASUREMENT_ID>`. */
    [gaDisableKey: `ga-disable-${string}`]: boolean | undefined;
  }
}

const readCookie = (name: string): string | null => {
  try {
    if (typeof document === 'undefined') return null;
    const hit = document.cookie
      .split(';')
      .map(c => c.trim())
      .find(c => c.startsWith(`${name}=`));
    return hit ? (hit.split('=')[1] ?? null) : null;
  } catch {
    return null;
  }
};

const readLocal = (key: string): string | null => {
  try {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
  } catch {
    // Safari in private mode, storage disabled, quota errors — all mean "unknown",
    // and unknown must read as "no consent".
    return null;
  }
};

/** Has the visitor agreed to the cookie-based analytics? */
export function hasConsent(): boolean {
  return readLocal(CONSENT_KEY) === 'true' || readCookie(CONSENT_KEY) === 'true';
}

/**
 * The domains a cookie may have been written against.
 *
 * Google sets `_ga` on the **registrable** domain (`.mrgomatires.com`) so that it
 * is shared across subdomains. A deletion that omits the domain attribute only
 * removes a host-scoped cookie and leaves that one untouched — silently, because
 * writing a cookie never reports failure.
 *
 * Exported so it can be asserted directly: jsdom rejects any `domain` that is not
 * a suffix of the test URL, so an observable "the cookie is gone" test can only
 * ever prove the host-scoped half. See feature 016's plan.
 */
export function cookieDomainCandidates(hostname: string): (string | null)[] {
  const bare = hostname.replace(/^www\./, '');
  const candidates: (string | null)[] = [null, hostname];
  if (bare !== hostname) candidates.push(bare);
  // A leading dot is what makes it match subdomains; `localhost` has no dots and
  // browsers reject a domain attribute for it, so it is skipped.
  if (bare.includes('.')) candidates.push(`.${bare}`);
  return candidates;
}

/** Every `document.cookie` assignment needed to delete `name` everywhere. */
export function cookieDeletions(name: string, hostname: string): string[] {
  return cookieDomainCandidates(hostname).map(domain => {
    const scope = domain ? `; domain=${domain}` : '';
    return `${name}=; Max-Age=0; path=/${scope}`;
  });
}

const deleteCookieEverywhere = (name: string) => {
  try {
    for (const assignment of cookieDeletions(name, window.location.hostname)) {
      document.cookie = assignment;
    }
  } catch {
    // no-op
  }
};

/** Cookie names Google Analytics writes: `_ga` and `_ga_<STREAM_ID>`. */
const gaCookieNames = (): string[] => {
  try {
    return document.cookie
      .split(';')
      .map(c => c.split('=')[0]?.trim() ?? '')
      .filter(name => name.startsWith('_ga'));
  } catch {
    return [];
  }
};

/** Record consent and let the analytics loader know it may start. */
export function grantConsent(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CONSENT_KEY, 'true');
    window.localStorage.removeItem(DECLINE_UNTIL_KEY);
  } catch {
    // no-op
  }
  try {
    const oneYear = 60 * 60 * 24 * 365;
    document.cookie = `${CONSENT_KEY}=true; path=/; max-age=${oneYear}`;
  } catch {
    // no-op
  }
  if (GA_ID) window[`ga-disable-${GA_ID}`] = undefined;
  try {
    window.dispatchEvent(new Event('cookies:accepted'));
  } catch {
    // no-op
  }
}

/**
 * Withdraw consent, for real.
 *
 * Unmounting the analytics component revokes nothing: by then gtag has run, its
 * cookies are written and `window.gtag` is still callable. Three things are
 * needed instead — stop the library sending, remove the identifiers it stored,
 * and forget the decision.
 *
 * @param silenceDays how long before the banner may appear again.
 */
export function revokeConsent(silenceDays: number): void {
  if (typeof window === 'undefined') return;

  // 1. Stop gtag sending, in this session, without a reload. Google checks this
  //    property internally on every call.
  if (GA_ID) window[`ga-disable-${GA_ID}`] = true;

  // 2. Remove the identifiers, so returning later does not re-link the visitor.
  for (const name of gaCookieNames()) deleteCookieEverywhere(name);

  // 3. Forget the decision, and note how long to stay quiet. The cart and every
  //    other preference are left alone — this touches only what it named.
  deleteCookieEverywhere(CONSENT_KEY);
  try {
    window.localStorage.removeItem(CONSENT_KEY);
    window.localStorage.setItem(
      DECLINE_UNTIL_KEY,
      String(Date.now() + silenceDays * 24 * 60 * 60 * 1000)
    );
  } catch {
    // no-op
  }

  try {
    window.dispatchEvent(new Event('cookies:declined'));
  } catch {
    // no-op
  }
}

/** Is the banner still within its agreed period of silence? */
export function isSilenced(): boolean {
  const until = Number(readLocal(DECLINE_UNTIL_KEY) ?? 0);
  return until > Date.now();
}
