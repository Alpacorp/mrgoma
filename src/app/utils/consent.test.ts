import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CONSENT_KEY,
  DECLINE_DAYS,
  DECLINE_UNTIL_KEY,
  WITHDRAW_DAYS,
  cookieDeletions,
  cookieDomainCandidates,
  grantConsent,
  hasConsent,
  isSilenced,
  revokeConsent,
} from './consent';

const clearStorage = () => {
  for (const c of document.cookie.split(';')) {
    const name = c.split('=')[0]?.trim();
    if (name) document.cookie = `${name}=; Max-Age=0; path=/`;
  }
  window.localStorage.clear();
};

beforeEach(clearStorage);
afterEach(() => {
  clearStorage();
  vi.unstubAllEnvs();
});

describe('hasConsent', () => {
  it('is false when nothing has been recorded', () => {
    expect(hasConsent()).toBe(false);
  });

  it('is true from localStorage alone', () => {
    window.localStorage.setItem(CONSENT_KEY, 'true');
    expect(hasConsent()).toBe(true);
  });

  it('is true from the cookie alone', () => {
    document.cookie = `${CONSENT_KEY}=true; path=/`;
    expect(hasConsent()).toBe(true);
  });

  it('treats any value other than "true" as no consent', () => {
    window.localStorage.setItem(CONSENT_KEY, 'false');
    expect(hasConsent()).toBe(false);
  });
});

describe('cookie deletion targets', () => {
  // These are asserted directly rather than through observed behaviour because
  // jsdom silently rejects a `domain` that is not a suffix of the test URL. An
  // observable test can only ever prove the host-scoped half — the half that
  // never fails in production. See feature 016's plan.
  it('covers the bare domain with a leading dot, which is where GA writes', () => {
    expect(cookieDomainCandidates('www.mrgomatires.com')).toEqual([
      null,
      'www.mrgomatires.com',
      'mrgomatires.com',
      '.mrgomatires.com',
    ]);
  });

  it('covers the apex host too', () => {
    expect(cookieDomainCandidates('mrgomatires.com')).toEqual([
      null,
      'mrgomatires.com',
      '.mrgomatires.com',
    ]);
  });

  it('emits no domain attribute for localhost, which browsers reject', () => {
    expect(cookieDomainCandidates('localhost')).toEqual([null, 'localhost']);
  });

  it('expires the cookie on every candidate', () => {
    const deletions = cookieDeletions('_ga', 'www.mrgomatires.com');

    expect(deletions).toHaveLength(4);
    expect(deletions.every(d => d.startsWith('_ga=; Max-Age=0; path=/'))).toBe(true);
    expect(deletions).toContain('_ga=; Max-Age=0; path=/; domain=.mrgomatires.com');
  });
});

describe('grantConsent', () => {
  it('records consent in both stores', () => {
    grantConsent();

    expect(window.localStorage.getItem(CONSENT_KEY)).toBe('true');
    expect(document.cookie).toContain(`${CONSENT_KEY}=true`);
  });

  it('clears any silence timer', () => {
    window.localStorage.setItem(DECLINE_UNTIL_KEY, String(Date.now() + 60_000));

    grantConsent();

    expect(window.localStorage.getItem(DECLINE_UNTIL_KEY)).toBeNull();
  });

  it('announces the decision', () => {
    const heard = vi.fn();
    window.addEventListener('cookies:accepted', heard);

    grantConsent();

    expect(heard).toHaveBeenCalledTimes(1);
    window.removeEventListener('cookies:accepted', heard);
  });
});

describe('revokeConsent', () => {
  it('forgets the decision in both stores', () => {
    grantConsent();

    revokeConsent(WITHDRAW_DAYS);

    expect(hasConsent()).toBe(false);
    expect(window.localStorage.getItem(CONSENT_KEY)).toBeNull();
    expect(document.cookie).not.toContain(`${CONSENT_KEY}=true`);
  });

  it('removes the Google identifiers it can reach', () => {
    document.cookie = '_ga=GA1.1.123456789.1700000000; path=/';
    document.cookie = '_ga_ABC123=GS1.1.1700000000; path=/';

    revokeConsent(WITHDRAW_DAYS);

    expect(document.cookie).not.toContain('_ga=');
    expect(document.cookie).not.toContain('_ga_ABC123');
  });

  it('sets the opt-out property so gtag stops sending in this session', async () => {
    vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', 'G-TEST123');
    vi.resetModules();
    const consent = await import('./consent');

    consent.revokeConsent(consent.WITHDRAW_DAYS);

    expect((window as unknown as Record<string, unknown>)['ga-disable-G-TEST123']).toBe(true);
  });

  it('silences the banner for the number of days it was given', () => {
    revokeConsent(WITHDRAW_DAYS);

    const until = Number(window.localStorage.getItem(DECLINE_UNTIL_KEY));
    const expected = Date.now() + WITHDRAW_DAYS * 24 * 60 * 60 * 1000;

    expect(until).toBeGreaterThan(expected - 5_000);
    expect(until).toBeLessThan(expected + 5_000);
    expect(isSilenced()).toBe(true);
  });

  it('honours the shorter first-visit period when that is what it is given', () => {
    revokeConsent(DECLINE_DAYS);

    const until = Number(window.localStorage.getItem(DECLINE_UNTIL_KEY));
    const oneDay = 24 * 60 * 60 * 1000;

    expect(until).toBeLessThan(Date.now() + oneDay + 5_000);
    expect(WITHDRAW_DAYS).toBeGreaterThan(DECLINE_DAYS);
  });

  it('announces the decision', () => {
    const heard = vi.fn();
    window.addEventListener('cookies:declined', heard);

    revokeConsent(DECLINE_DAYS);

    expect(heard).toHaveBeenCalledTimes(1);
    window.removeEventListener('cookies:declined', heard);
  });

  it('leaves the cart and other preferences alone', () => {
    // The single thing a visitor would be upset to lose, and it lives in the
    // same store as the consent flag.
    window.localStorage.setItem('cart', '[{"id":1,"quantity":2}]');
    window.localStorage.setItem('promo_summer', 'dismissed');
    grantConsent();

    revokeConsent(WITHDRAW_DAYS);

    expect(window.localStorage.getItem('cart')).toBe('[{"id":1,"quantity":2}]');
    expect(window.localStorage.getItem('promo_summer')).toBe('dismissed');
  });
});

describe('isSilenced', () => {
  it('is false with no timer', () => {
    expect(isSilenced()).toBe(false);
  });

  it('is false once the timer has passed', () => {
    window.localStorage.setItem(DECLINE_UNTIL_KEY, String(Date.now() - 1_000));
    expect(isSilenced()).toBe(false);
  });
});
