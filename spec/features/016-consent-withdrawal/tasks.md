# Tasks — Let a visitor change their mind about cookies

> Feature: `016-consent-withdrawal` · Based on: [plan.md](./plan.md) ·
> Created: 2026-08-04

Ordered, **very small, independently verifiable** tasks. Check each off as it is
completed.

**Read this before starting.** `CookieConsent`, `GoogleAnalytics` and `Footer`
have **no tests at all** today. This feature refactors the component that gates a
legal obligation, with no safety net under it — so T1 builds the net before
anything is touched. Skipping it turns every later task into a guess.

## Groundwork

- [x] **T0** — Consult the **`modern-web-guidance`** skill before writing any UI.
      This feature adds a control and reworks a consent surface; the constitution
      requires the research first. Focus it on: current patterns for consent
      re-entry points, giving two actions equal visual weight without looking
      broken, and focus management when a persistent region reappears on demand.
      · check: the findings inform T7, T9 and T10 and are noted in the PR.

- [x] **T1** — Write characterization tests for the banner **exactly as it
      behaves today**, before changing a line: shows on a first visit; hides and
      never returns after accept; writes cookie + localStorage on accept; sets the
      decline timer and does not persist a `false` cookie on decline; Escape
      counts as decline. · files:
      `src/app/ui/components/CookieConsent/CookieConsent.test.tsx` · check: all
      green against the **unmodified** component. These must keep passing through
      every task below, and are the only thing that will tell you if the refactor
      broke consent.

## The consent module

- [x] **T2** — Add the read side: `hasConsent()`, the `DECLINE_DAYS = 1` and
      `WITHDRAW_DAYS = 30` constants, and **`GA_ID`** — moved here from `gtag.ts`.
      Lifted from the duplicated logic in `GoogleAnalytics.tsx:10`. · files:
      `src/app/utils/consent.ts`, `src/app/utils/consent.test.ts` · check: reads
      `true` from either store, `false` when neither is set, and never throws when
      storage is unavailable.

      **`GA_ID` must move, or the build breaks.** `revokeConsent()` needs it for
      `ga-disable-<GA_ID>` and `gtag.ts` needs `hasConsent()` — leaving the id in
      `gtag.ts` makes the two modules import each other. `consent.ts` owns it and
      imports nothing of ours; `gtag.ts` re-exports it so current importers keep
      working. Also note `GA_ID` is evaluated at import time, so any test that
      stubs the env must call `vi.resetModules()` — `gtag.test.ts` already shows
      the pattern.

- [x] **T3** — Add the write side: `grantConsent()` and `revokeConsent()`.
      Revoking must set `window['ga-disable-<GA_ID>'] = true` (declare the
      index signature on `Window` here, since this is the only module that writes
      it), delete every cookie whose name starts with `_ga` **against both the
      host and the dot-prefixed registrable domain**, and clear `cookiesAccepted`
      from cookie and localStorage. · files: `consent.ts`, `consent.test.ts`

      **Split the deletion in two, or the test will lie to you.** jsdom silently
      rejects any cookie whose `domain` is not a suffix of the test URL —
      measured, not assumed:

      ```
      set    _ga host-scoped              → "_ga=GA1.1.123"   ✓
      set    _ga_ABC domain=.mrgomatires… → "_ga=GA1.1.123"   ✗ rejected
      delete _ga     domain=.mrgomatires… → "_ga=GA1.1.123"   ✗ no effect
      delete _ga     host-scoped          → ""                ✓
      ```

      So seeding `_ga` and asserting it is gone **passes even if the dot-domain
      deletion is missing entirely** — green while covering only the half that
      never fails in production.

      · check, in two parts: (a) an exported **pure** function returns the full
      list of deletion strings, asserted directly, including one entry for the
      host and one for the dot-prefixed registrable domain; (b) the observable
      test seeds a host-scoped `_ga` and confirms it is gone, plus the opt-out
      property is set and the `cart` key survives both grant and revoke. The real
      path is only confirmable in production — that is what T15 is for.

- [x] **T4** — Make `event()` and `pageview()` consult `hasConsent()` instead of
      trusting that `window.gtag` only exists when consent was given. · files:
      `src/app/utils/gtag.ts`, `src/app/utils/gtag.test.ts` · check: with
      `window.gtag` present but consent revoked, nothing is sent. _This closes a
      real latent bug: the current guard passes after a withdrawal because the
      script already ran, so events would keep reaching Google._

- [x] **T5** — Point `GoogleAnalytics` at the shared `hasConsent()` and delete its
      private copy. · files:
      `src/app/ui/components/GoogleAnalytics/GoogleAnalytics.tsx` · check: T1 and
      T4 still green; two readings of consent become one.

## The banner

- [x] **T6** — Route the banner's accept/decline through `consent.ts`, and choose
      the interval from prior state: consent previously granted → withdrawal → 30
      days; otherwise → first-visit decline → 1 day. · files:
      `CookieConsent.tsx`, `CookieConsent.test.tsx` · check: withdrawing sets the
      timer 30 days out and revokes GA; declining without prior consent sets it 1
      day out and revokes nothing that was never granted.

- [x] **T7** — Listen for a `cookies:reopen` window event that forces the banner
      visible regardless of stored decision or timer, and show the visitor's
      **current** decision when it opens. · files: `CookieConsent.tsx`,
      `CookieConsent.test.tsx` · check: dispatching the event shows the banner for
      an accepted, a declined and an undecided visitor, and each sees their own
      state stated.

- [x] **T8** — Banner copy. Say what the choice governs and what it does not:
      name Vercel Web Analytics as continuing regardless, and state that the cart
      lives on the device and is unaffected. Wording must match the privacy
      policy that feature 015 rewrote. · files: `CookieConsent.tsx`,
      `CookieConsent.test.tsx` · check: both statements render; the tool names
      match the policy exactly.

- [x] **T9** — ~~Give accept and decline equal visual weight.~~ **Dropped by the
      owner (D7), 2026-08-04**, to protect the acceptance rate on a surface every
      visitor sees. The buttons keep their current styling. What remains of this
      task: check that **neither label nor helper text** words one option as the
      recommended choice, that focus is visible on both, and that nothing
      overflows at 360px. · files: `CookieConsent.tsx`, `CookieConsent.test.tsx`
      · check: AC13 as amended — wording only, no styling assertion.

## The entry point and the disclosure

- [x] **T10** — Add the footer control that dispatches `cookies:reopen`, in the
      existing legal-link row beside Privacy Policy. A native `<button>`, not a
      link — it performs an action rather than navigating. · files:
      `src/app/ui/components/CookieConsent/CookieSettingsLink.tsx`,
      `src/app/ui/sections/Footer/Footer.tsx`, plus a test for each · check:
      clicking it brings the banner back on the same page with no navigation;
      it is keyboard reachable with visible focus.

      **`Footer.tsx` is a Server Component** — it has no `'use client'`, so an
      `onClick` cannot go in it. Put the directive on `CookieSettingsLink.tsx`
      and have the Footer merely render it. The footer is mounted in
      `(home)`, `(shop)` and `not-found`, so one insertion covers the storefront.

- [x] **T11** — State both waiting periods in the privacy policy — 1 day after
      declining, 30 days after withdrawing — and say the choice can be changed
      from the footer at any time. · files:
      `src/app/(shop)/legal-policies/page.tsx`, `page.test.tsx` · check: both
      numbers and the footer mention render; the analytics wording still matches
      the banner.

- [x] **T12** — Record in the constitution that consent is read and written
      **only** through `consent.ts`, so the duplication we just removed does not
      grow back. · files: `spec/tech-stack.md` · check: an agent reading only
      `tech-stack.md` would not reimplement a consent read.

## Closing

- [x] **T13** — Definition of Done: `npx tsc --noEmit` + `npm run lint` +
      `npm test` + `npm run build` + `npm run perf:budget` all green. Manual
      check at phone width on the home page: accept, then reopen from the footer
      and withdraw, and confirm with devtools that the `_ga` cookies are gone and
      that a tracked click sends nothing to GA afterwards.

      _Done 2026-08-04._ `tsc`, `lint`, **433 tests / 53 files**, `build` and
      `perf:budget` (157.3 KB shared / 613.5 KB total) all green. Verified in a
      real browser against `next dev`, which turned out to have GA configured —
      so Google wrote a genuine `_ga_W4TYFF5YZH` cookie on accept, and the
      withdrawal had something real to delete rather than only seeded fakes:

      | after pressing Withdraw | result                            |
      | ----------------------- | --------------------------------- |
      | `cookiesAccepted` (LS)  | `null`                            |
      | `cookiesAccepted` (cookie) | gone                           |
      | `_ga*` cookies          | **`[]`** — all three removed      |
      | `ga-disable-G-…`        | `true`                            |
      | silence                 | **30 days**                       |
      | `cart`                  | untouched                         |

      And the latent bug, in the exact conditions that used to trigger it:
      `window.gtag` still a loaded function, consent `null`, a tracked element
      clicked — `dataLayer` stayed at 5 entries. It would have sent before.

- [ ] **T14** — **Owner gate:** the banner's new copy, the equalised buttons and
      the privacy-policy changes are reviewed and approved before merge (FR13).
      Show the banner side by side with the current one — the button change is
      the part with a business consequence.

- [ ] **T15** — **Post-deploy, owner-verified:** on production, accept, withdraw,
      and confirm in devtools that the `_ga*` cookies are actually gone. Locally
      there is no `.mrgomatires.com` domain, so cookie deletion **cannot be fully
      proven before deploy** — a test that passes in development can still be
      wrong in production. This check is not optional.

## Traceability

| Task | Acceptance criteria  |
| ---- | -------------------- |
| T0   | AC12, AC13 (informs) |
| T1   | AC19 (safety net)    |
| T2   | AC2, AC3             |
| T3   | AC4, AC5, AC8, AC9   |
| T4   | AC6, AC7             |
| T5   | AC7                  |
| T6   | AC14, AC15           |
| T7   | AC2, AC3             |
| T8   | AC10, AC11, AC17     |
| T9   | AC12, AC13           |
| T10  | AC1, AC12            |
| T11  | AC11, AC16           |
| T12  | — (constitution)     |
| T13  | AC19                 |
| T14  | AC18                 |
| T15  | AC5 (in production)  |

All nineteen acceptance criteria are covered. T12 carries none of its own: it
keeps the constitution truthful, which no acceptance test can assert.

---

_Run `/analyze` before implementing._
