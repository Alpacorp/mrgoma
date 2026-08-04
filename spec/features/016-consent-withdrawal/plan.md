# Plan — Let a visitor change their mind about cookies

> Feature: `016-consent-withdrawal` · Based on: [spec.md](./spec.md) ·
> Created: 2026-08-04

## Technical approach

The site already has the channel this feature needs. `CookieConsent` dispatches
`cookies:accepted` / `cookies:declined` on `window`, and `GoogleAnalytics`
listens. Adding a third message in the same direction — footer asking the banner
to come back — completes the loop without inventing a state container:

```
Footer link ──cookies:reopen──▶ CookieConsent ──accepted/declined──▶ GoogleAnalytics
                                      │                                    │
                                      └── writes consent, revokes GA ──────┘
```

**Reopening** is a `cookies:reopen` event that forces `visible = true`,
bypassing the stored decision and the re-prompt timer. The banner the visitor
sees is the one they already saw — which is the whole argument of D1.

**Showing the current state** (FR2) means the banner must read its decision, not
just its visibility. `hasConsent()` logic already exists in `GoogleAnalytics`;
lifting it into a shared helper gives both components one answer instead of two
copies that can drift.

**Choosing the interval** (FR9/FR10) needs no new flag. `decline()` can ask
whether consent was previously granted: if yes this is a withdrawal → 30 days;
if no it is a first-visit decline → 1 day. One function, two paths, derived from
state that already exists.

**Actually revoking** is the part with teeth, and the reason this is not a
five-line change. Three things must happen, and none of them is "unmount the
component":

1. **`window['ga-disable-<GA_ID>'] = true`** — Google's documented opt-out
   property. The gtag library checks it internally and stops sending, which is
   what makes revocation work _in the current session with no reload_ (FR5).
2. **Delete the `_ga*` cookies**, so the identifier that would re-link a future
   visit is gone (FR4, AC5).
3. **Fix a latent bug this feature exposes.** `gtag.event()` guards only on
   `typeof window.gtag === 'function'` (`gtag.ts:32`). After a withdrawal the
   script has already run, so that check passes and events would keep flowing to
   Google. It was unreachable until now because there was no path from accepted
   to declined; this feature creates one. `ga-disable` stops the send at the
   library, but the guard should also consult consent so the intent is visible in
   our own code rather than resting on a third party's internal flag.

## Reuse first

| Reused                                                                    | Instead of                                  |
| ------------------------------------------------------------------------- | ------------------------------------------- |
| The `cookies:*` window-event channel already wired between two components | A context provider or global store          |
| `CookieConsent` itself as the control                                     | Building a settings panel (D1)              |
| `hasConsent()` logic in `GoogleAnalytics.tsx:10`                          | A second, drifting copy of the same reading |
| `setCookie()` helper in `CookieConsent.tsx:25`                            | New cookie-writing code                     |
| `DECLINE_LS_KEY` / the existing re-prompt timer                           | A new suppression mechanism for withdrawal  |
| The footer's existing legal-link row (`Footer.tsx:139-152`)               | A new footer section                        |
| `Footer` already mounted in `(home)`, `(shop)` and `not-found`            | Adding the control per page                 |
| `trackEvent` from feature 015                                             | Bespoke instrumentation for the new control |

No new dependency.

## Files to add / change

**Add**

- `src/app/utils/consent.ts` — the single source of truth: `hasConsent()`,
  `grantConsent()`, `revokeConsent()` (opt-out flag + `_ga*` cookie removal +
  storage), the `DECLINE_DAYS` / `WITHDRAW_DAYS` constants, **and `GA_ID`**.
  Pure enough to unit-test without rendering anything.

  **`GA_ID` moves here, and the direction of the dependency is the reason.**
  `revokeConsent()` needs the measurement id to set `ga-disable-<GA_ID>`, while
  `gtag.ts` needs `hasConsent()`. Leaving `GA_ID` in `gtag.ts` makes the two
  modules import each other. `consent.ts` therefore owns the id and imports
  nothing of ours; `gtag.ts` and `GoogleAnalytics.tsx` import from it. One
  direction, no cycle.

  It also owns the `ga-disable-*` index signature on `Window`, since it is the
  only module that writes it.

- `src/app/utils/consent.test.ts` — reading, granting, revoking, cookie removal,
  interval selection, and that the cart key is untouched.
- `src/app/ui/components/CookieConsent/CookieSettingsLink.tsx` — the footer
  control. Small, its own file per the one-component-per-folder convention, and
  **marked `'use client'`**: `Footer.tsx` is a Server Component, so the click
  handler cannot live there. The Server Component simply renders this one.

**Change**

- `src/app/ui/components/CookieConsent/CookieConsent.tsx` — listen for
  `cookies:reopen`; show the current decision; pick 1 or 30 days in `decline()`;
  call into `consent.ts` instead of writing storage inline; equalise the two
  buttons (see Risks).
- `src/app/ui/components/GoogleAnalytics/GoogleAnalytics.tsx` — import
  `hasConsent` **and `GA_ID`** from `consent.ts` rather than keeping its own copy
  of either.
- `src/app/utils/gtag.ts` — `event()` and `pageview()` consult consent, closing
  the latent bug above; `GA_ID` is re-exported from `consent.ts` so existing
  importers keep working.
- `src/app/ui/sections/Footer/Footer.tsx` — render the control in the legal-link
  row. It stays a Server Component; only the imported control is a client one.
- `src/app/(shop)/legal-policies/page.tsx` — state both waiting periods (FR11),
  and mention that the choice can be changed from the footer at any time.
- `spec/tech-stack.md` — record that consent is read and written through
  `consent.ts` only.

## Data & flow

Nothing server-side changes. No route, endpoint, param or DB touch.

| Key                         | Where       | Meaning                                      |
| --------------------------- | ----------- | -------------------------------------------- |
| `cookiesAccepted`           | cookie + LS | `'true'` when consent is granted             |
| `cookieConsentDeclineUntil` | LS          | Timestamp before which the banner stays away |
| `_ga`, `_ga_*`              | cookie      | Google's identifiers — removed on revoke     |
| `cart`                      | LS          | **Never touched by this feature** (FR6)      |

`revokeConsent()` removes `cookiesAccepted` from both stores, sets the opt-out
property, and deletes every cookie whose name starts with `_ga`. Cookie deletion
must be attempted against the host **and** the registrable domain
(`.mrgomatires.com`), because GA writes on the latter and a delete that omits the
domain silently does nothing.

**That half cannot be proven by an ordinary test, and this was verified rather
than assumed.** jsdom rejects any cookie whose `domain` is not a suffix of the
test URL, silently. Measured directly:

```
set    _ga host-scoped              → "_ga=GA1.1.123"   ✓
set    _ga_ABC domain=.mrgomatires… → "_ga=GA1.1.123"   ✗ rejected
delete _ga     domain=.mrgomatires… → "_ga=GA1.1.123"   ✗ no effect
delete _ga     host-scoped          → ""                ✓
```

So a test that seeds `_ga` and asserts it is gone after `revokeConsent()` **goes
green even if the dot-domain deletion is absent entirely** — passing while
covering only the half that never fails in production. To avoid that false
confidence, the deletion strings are produced by an exported pure function and
asserted directly; the observable test then covers the host path as a second,
weaker check. Production remains the only place the real path can be confirmed,
which is why T15 exists.

## Acceptance criteria → implementation

| AC   | How it's met                                                   | How it's verified/tested                                        |
| ---- | -------------------------------------------------------------- | --------------------------------------------------------------- |
| AC1  | Control in the footer's legal row; dispatches `cookies:reopen` | Component test: click shows the banner, no navigation occurs    |
| AC2  | Banner reads consent on open                                   | Test with accepted state, assert the shown status               |
| AC3  | Same, declined state                                           | Test with declined state                                        |
| AC4  | `revokeConsent()` clears cookie + localStorage                 | Unit: both stores empty afterwards                              |
| AC5  | `_ga*` cookies deleted, host and dot-domain                    | Unit: seeded `_ga` cookies are gone                             |
| AC6  | `ga-disable` flag + consent-aware `gtag.event()`               | Unit: with consent revoked, `window.gtag` present, nothing sent |
| AC7  | `grantConsent()` + existing `cookies:accepted` listener        | Unit + component: GA re-enabled, event sent                     |
| AC8  | The `cart` key is never referenced by this code                | Unit: cart survives grant and revoke; guard test on the module  |
| AC9  | Opt-out property takes effect in-session                       | Unit asserting no reload is required; manual check              |
| AC10 | Copy names Vercel Web Analytics as unaffected                  | Test asserting the string renders                               |
| AC11 | Same tool names as the policy                                  | Test asserting both surfaces name both tools                    |
| AC12 | Native `<button>`, visible focus, no fixed widths              | Keyboard pass + 360px manual check                              |
| AC13 | Both buttons share weight and size                             | Test asserting neither carries the emphasis class alone         |
| AC14 | `WITHDRAW_DAYS = 30` chosen when prior consent existed         | Unit on interval selection                                      |
| AC15 | `DECLINE_DAYS = 1` kept for the no-prior-consent path          | Unit; existing banner tests still pass                          |
| AC16 | Policy states both periods                                     | Test asserting both numbers render                              |
| AC17 | Copy mentions the cart                                         | Test asserting the string renders                               |
| AC18 | Owner review                                                   | Process gate, recorded in the PR                                |
| AC19 | Small, additive change                                         | `tsc`, `lint`, `test`, `build`, `perf:budget`                   |

## Tradeoffs / alternatives

**`ga-disable-<ID>` vs. Google Consent Mode v2.** Consent Mode is the modern,
Google-recommended path, but it requires a `gtag('consent', 'default', …)` call
at initialisation that the site does not have, so adopting it means changing how
GA boots for every visitor — a bigger blast radius than this feature deserves.
`ga-disable` is one property, documented, and works with the current setup. If
GA4 configuration is revisited later, Consent Mode is the upgrade.

**Reopening the banner vs. a settings panel.** Settled in the spec (D1). Worth
restating because it also decides testing: there is no second interface to cover.

**Deleting `_ga` cookies vs. leaving them to expire.** Leaving them would make
withdrawal cosmetic — the identifier survives and re-links the visitor the moment
consent returns. Deleting is what makes AC5 meaningful.

**Putting revocation in `decline()` vs. a separate withdraw path.** One function
that derives its interval from prior state is less code and cannot drift out of
sync with the button the visitor actually presses.

## Risks

- **This changes the banner every visitor sees.** AC13 forbids giving accept more
  visual weight than decline, and today accept is solid lime while decline is a
  transparent outline — a nudge. Equalising them is the honest reading of the
  no-dark-patterns constraint, but it is a visible brand change on a
  first-visit surface, and it may reduce acceptance rate. **The owner should see
  this before merge** (AC18), and it is the main thing to look at.
- **Cookie deletion can silently fail.** A cookie set on `.mrgomatires.com` is
  not removed by a delete that omits the domain. Locally there is no such domain,
  so a test that passes in development can still be wrong in production —
  verification must include a real production check after deploy.
- **`ga-disable` is a third-party contract.** If Google changed it, revocation
  would regress silently. Mitigated by also making our own `gtag.event()` guard
  consent-aware, so we are not relying on their flag alone.
- **`gtag.ts` gains a dependency on consent**, which slightly couples two
  concerns. Accepted deliberately: the alternative is a module that looks correct
  and leaks events.
- **The 30-day suppression is invisible if wrong.** A bug there means either
  nagging or never asking again, and neither surfaces as an error. Covered by
  unit tests on the interval rather than by observation.

## Out of scope

- Per-category consent (D5), a CMP, geo-targeted banners, server-side consent.
- Reworking the first-visit banner's timing or behaviour beyond button weight.
- Google Consent Mode v2 adoption — see Tradeoffs; a candidate if GA4 config is
  ever revisited.
- Letting the visitor inspect or clear the cart and other stored preferences
  (D4); only a sentence explains them.

---

_The concrete steps live in [tasks.md](./tasks.md)._
