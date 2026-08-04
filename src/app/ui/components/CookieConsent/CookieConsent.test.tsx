import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import CookieConsent from './CookieConsent';

/**
 * Characterization tests — written against the banner **as it behaved on
 * 2026-08-04**, before feature 016 refactored it.
 *
 * The component had no tests at all, and it gates a legal obligation: whether
 * Google Analytics is allowed to run. Feature 016 moves its storage writes into
 * `consent.ts`, changes its timer, teaches it to reopen on demand and rewrites
 * its copy. These tests exist so that if any of that quietly breaks consent,
 * something fails loudly instead of a visitor being tracked without agreement.
 *
 * They describe what the code *does*, not what it ought to do. Where behaviour
 * is deliberately changed later, the corresponding test should be updated in the
 * same commit and the reason recorded — never deleted to make a build pass.
 */

const banner = () => screen.queryByRole('region', { name: /cookie consent/i });

/** Wipe every cookie visible to jsdom, plus the keys the banner writes. */
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
  vi.restoreAllMocks();
});

describe('CookieConsent — first visit', () => {
  it('shows the banner when no decision has been recorded', () => {
    render(<CookieConsent />);

    expect(banner()).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /accept cookies/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /decline non-essential cookies/i })
    ).toBeInTheDocument();
  });
});

describe('CookieConsent — accepting', () => {
  it('records consent in both localStorage and a cookie, and hides', async () => {
    const user = userEvent.setup({ delay: null });
    render(<CookieConsent />);

    await user.click(screen.getByRole('button', { name: /accept cookies/i }));

    expect(window.localStorage.getItem('cookiesAccepted')).toBe('true');
    expect(document.cookie).toContain('cookiesAccepted=true');
    expect(banner()).not.toBeInTheDocument();
  });

  it('announces the decision so the analytics loader can react', async () => {
    const user = userEvent.setup({ delay: null });
    const onAccepted = vi.fn();
    window.addEventListener('cookies:accepted', onAccepted);

    render(<CookieConsent />);
    await user.click(screen.getByRole('button', { name: /accept cookies/i }));

    expect(onAccepted).toHaveBeenCalledTimes(1);
    window.removeEventListener('cookies:accepted', onAccepted);
  });

  it('stays hidden on a later visit', () => {
    window.localStorage.setItem('cookiesAccepted', 'true');

    render(<CookieConsent />);

    expect(banner()).not.toBeInTheDocument();
  });

  it('stays hidden when only the cookie survives, without localStorage', () => {
    document.cookie = 'cookiesAccepted=true; path=/';

    render(<CookieConsent />);

    expect(banner()).not.toBeInTheDocument();
  });
});

describe('CookieConsent — declining', () => {
  it('does not persist a "false" cookie, only a re-prompt timestamp', async () => {
    const user = userEvent.setup({ delay: null });
    render(<CookieConsent />);

    await user.click(screen.getByRole('button', { name: /decline non-essential cookies/i }));

    expect(document.cookie).not.toContain('cookiesAccepted');
    expect(window.localStorage.getItem('cookiesAccepted')).toBeNull();
    expect(Number(window.localStorage.getItem('cookieConsentDeclineUntil'))).toBeGreaterThan(
      Date.now()
    );
    expect(banner()).not.toBeInTheDocument();
  });

  it('announces the decision', async () => {
    const user = userEvent.setup({ delay: null });
    const onDeclined = vi.fn();
    window.addEventListener('cookies:declined', onDeclined);

    render(<CookieConsent />);
    await user.click(screen.getByRole('button', { name: /decline non-essential cookies/i }));

    expect(onDeclined).toHaveBeenCalledTimes(1);
    window.removeEventListener('cookies:declined', onDeclined);
  });

  it('stays hidden while the re-prompt timer is still running', () => {
    window.localStorage.setItem('cookieConsentDeclineUntil', String(Date.now() + 60_000));

    render(<CookieConsent />);

    expect(banner()).not.toBeInTheDocument();
  });

  it('asks again once the timer has expired', () => {
    window.localStorage.setItem('cookieConsentDeclineUntil', String(Date.now() - 60_000));

    render(<CookieConsent />);

    expect(banner()).toBeInTheDocument();
  });

  it('treats Escape as declining when focus is already inside the banner', async () => {
    const user = userEvent.setup({ delay: null });
    render(<CookieConsent />);

    screen.getByRole('button', { name: /decline non-essential cookies/i }).focus();
    await user.keyboard('{Escape}');

    expect(banner()).not.toBeInTheDocument();
    expect(Number(window.localStorage.getItem('cookieConsentDeclineUntil'))).toBeGreaterThan(
      Date.now()
    );
  });

  it('ignores Escape when focus is elsewhere on the page', async () => {
    // Characterizing a limitation, not endorsing it. The `onKeyDown` handler sits
    // on a `role="region"` div with no `tabIndex`, so the region can never hold
    // focus itself and the event only reaches it by bubbling from a child. A
    // visitor who has not tabbed into the banner cannot dismiss it with the
    // keyboard. Worth fixing, but out of scope here — changing it now would mean
    // this suite no longer describes the code it was written to protect.
    const user = userEvent.setup({ delay: null });
    render(<CookieConsent />);

    document.body.focus();
    await user.keyboard('{Escape}');

    expect(banner()).toBeInTheDocument();
  });
});
