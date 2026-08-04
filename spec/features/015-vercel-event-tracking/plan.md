# Plan — Event tracking in Vercel Web Analytics, alongside GA4

> Feature: `015-vercel-event-tracking` · Based on: [spec.md](./spec.md) ·
> Created: 2026-08-04

## Technical approach

The whole of Group A is one insertion at a single choke point. Every tracked
interaction in the app already funnels through one delegated click listener that
calls `gtag.event()`. Putting a fan-out function in front of that call reaches all
eighteen event names at once, and keeps the declarative `data-track` contract
(FR6) exactly as `tech-stack.md` documents it.

So the shape is:

```
data-track markup ──▶ InteractionTracker (one listener)
                              │
                              ▼
                        trackEvent()  ◀── imperative callers
                          │       │       (generate_lead, whatsapp_order_sent)
                    gtag.event   Vercel track()
                    (unchanged)  (normalised props)
```

`trackEvent()` isolates the two platforms from each other in separate `try`
blocks, so neither can suppress the other (FR4), and it is a no-op off the
browser so a stray server import cannot throw (FR5).

Group B is anchoring: move the two conversion events off the click and onto the
moment the operation actually succeeded, which in both cases is an existing state
transition a few lines away — `setSuccess(true)` in the quote form, and the
`whatsappUrl` branch in checkout. No new state, no new flow.

Group C exploits something the codebase already has. There is **no Stripe
webhook**, but `GET /api/checkout/session` is already the authoritative
"payment settled" moment: it checks `payment_status === 'paid'`, writes the
order, and — decisively — is **already idempotent** through
`getOrderByStripeSessionId`. Emitting `purchase` inside the branch that creates a
new order therefore gets exactly-once (FR14) for free, from a guard that is
already load-bearing for the money path and cannot silently rot. That same branch
already sits inside `if (!checkoutTestMode)`, so FR16 comes for free too.

Group D is copy plus one stale comment.

## Reuse first

| Reused                                                                                                   | Instead of                                        |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `InteractionTracker`'s single delegated listener                                                         | Touching 19 component files                       |
| `gtag.event()` and its `GaEventParams` type, untouched                                                   | A parallel GA path (would risk FR4)               |
| `data-track` / `-category` / `-label` / `-value` markup                                                  | A second, per-platform attribute convention       |
| `<Analytics />`, already mounted in `layout.tsx:82`                                                      | Installing or configuring anything new            |
| `getOrderByStripeSessionId` idempotency guard                                                            | A new dedupe table, cache or webhook              |
| `checkoutTestMode`, already wrapping the DB writes                                                       | A separate analytics test-mode flag               |
| `orderTotal`, `currency`, `store`, `meta.fulfillmentMethod`, `items` — all already computed in the route | Re-reading Stripe or the DB for the event payload |
| `setSuccess(true)` in the quote form                                                                     | New submission state                              |
| `imageSizes.guard.test.ts` source-scanning pattern                                                       | Inventing a new guard-test style                  |
| `src/app/api/_lib/` for shared route helpers                                                             | A new directory                                   |

`@vercel/analytics@1.6.1` is already a dependency and already ships the client
script. **No new dependency is added.**

## Files to add / change

**Add**

- `src/app/utils/analytics.ts` — `trackEvent()`, the property normaliser
  `toVercelProps()`, and the `EVENTS` name constants. The one place that knows
  both platforms exist.
- `src/app/utils/analytics.test.ts` — normalisation, fan-out, mutual isolation.
- `src/app/utils/retiredEvents.guard.test.ts` — scans `src/` and fails if
  `place_order` or `quote_submit` reappear as event names (AC9).
- `src/app/api/checkout/_lib/purchaseEvent.ts` — `buildPurchaseProps()` (pure,
  no Vercel import, so it is testable without mocking Stripe) and
  `emitPurchase()` (the bounded, non-throwing send).
- `src/app/api/checkout/_lib/purchaseEvent.test.ts` — payload shape and the
  no-PII assertion (AC13, AC16).

**Change**

- `src/app/ui/components/InteractionTracker/InteractionTracker.tsx` — import and
  call `trackEvent` instead of `event`. Two lines; the listener logic is untouched.
- `src/app/(shop)/checkout/container/Checkout/Checkout.tsx` —
  `data-track="place_order"` → `"add_shipping_info"` (line ~816); emit
  `whatsapp_order_sent` in the `if (data?.whatsappUrl)` branch (line ~244).
- `src/app/(shop)/instant-quote/container/InstantQoute/InstantQoute.tsx` — drop
  the `data-track` attributes from the submit button (line ~524); emit
  `generate_lead` right after `setSuccess(true)` (line ~230).
- `src/app/api/checkout/session/route.ts` — `await emitPurchase(...)` inside the
  new-order branch, after the DB writes, wrapped so nothing it does can surface.
- `src/app/(shop)/legal-policies/page.tsx` — split the single "Cookies" bullet
  (line 77) into cookies vs. analytics, naming both tools (FR19).
- `src/app/ui/components/CookieConsent/CookieConsent.tsx` — banner wording (line
  ~152) and the stale 30-day comment (line 11 vs `DECLINE_DAYS = 1`, FR22).
- `spec/tech-stack.md` — the "Analytics & tracking" section says events go to GA4
  only; it must say both, and mention the no-PII rule.

## Data & flow

**Client.** `trackEvent({ action, category, label, value, params })` →
`gtag.event(...)` unchanged, and `track(action, toVercelProps(...))`.

Normalisation, documented because AC4 tests it:

| Input                              | Vercel property                              |
| ---------------------------------- | -------------------------------------------- |
| `category` / `label` / `value`     | `category` / `label` / `value`               |
| each `params` entry                | same key                                     |
| `undefined`                        | dropped                                      |
| `string`/`number`/`boolean`/`null` | passed through                               |
| anything else                      | `JSON.stringify`, falling back to `String()` |

GA keeps its `event_category` / `event_label` names; Vercel gets the plain ones.
Event **names** are identical across platforms (FR2) — only property naming
differs, because each platform has its own convention.

**Server.** No route, param or DB change. Inside
`GET /api/checkout/session`, in the existing `if (!existing)` branch after the
order and its details are written:

```
buildPurchaseProps({ orderTotal, currency, fulfillmentMethod, store, itemCount })
  → { value, currency, fulfillment_method, store, item_count }
```

**Watch the scoping.** Four of the five inputs are in scope at the emit point,
but `detailItems` — the obvious source for the item count — is **not**: it is
declared `const` inside the nested `try` at `route.ts:160` and dies at that
block's closing brace on line 192, before the emit point at ~204. Use `items`
instead (`route.ts:79`, function scope), filtering `productId !== 'tax'` and
summing `quantity`. Same numbers, correct scope, still no extra query.

`emitPurchase` awaits the send inside `try/catch`, bounded by a short timeout, so
neither a rejection nor a hang can reach the order path (FR17).
`@vercel/analytics/server` needs `VERCEL_URL`, which Vercel sets automatically;
locally it logs instead of sending, which makes the event observable in
development without any wiring.

## Acceptance criteria → implementation

| AC   | How it's met                                                             | How it's verified/tested                                                       |
| ---- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| AC1  | `trackEvent` calls both sinks                                            | Unit: both spies called with the same name                                     |
| AC2  | `gtag.event` self-guards on `window.gtag`; `track` is ungated            | Unit: with `gtag` absent, Vercel spy still called                              |
| AC3  | `toVercelProps` maps all four kinds                                      | Unit on the mapping table; existing `gtag.test.ts` passes unmodified           |
| AC4  | Non-scalar → `JSON.stringify`                                            | Unit: object property survives as a string, siblings intact                    |
| AC5  | Separate `try` blocks per platform                                       | Unit: make each sink throw in turn, assert the other still fired               |
| AC6  | `generate_lead` sits after `setSuccess(true)`, past the `!res.ok` throw  | Component test: mock a failing fetch, assert no call                           |
| AC7  | Same anchor, single call site                                            | Component test: mock `res.ok`, assert exactly one call                         |
| AC8  | `data-track="add_shipping_info"` on the button                           | Component test on the rendered attribute                                       |
| AC9  | Names removed at both call sites                                         | `retiredEvents.guard.test.ts` scans `src/`                                     |
| AC10 | `whatsapp_order_sent` in the `whatsappUrl` branch only                   | Component test on that branch                                                  |
| AC11 | Emission lives behind `payment_status === 'paid'`                        | Unit: `emitPurchase` not called for unpaid status                              |
| AC12 | Emission inside the `!existing` branch of the existing idempotency guard | Unit: second call with the same session id emits nothing                       |
| AC13 | `buildPurchaseProps` returns exactly five keys                           | Unit: exact key-set equality, not a subset                                     |
| AC14 | Branch already nested inside `if (!checkoutTestMode)`                    | Unit with test mode on                                                         |
| AC15 | `try/catch` + timeout around the send                                    | Unit: make `track` reject and hang; assert the route still returns its payload |
| AC16 | Only whitelisted fields reach the payload                                | Unit: build from a fixture carrying email/phone/address, assert none appear    |
| AC17 | Policy copy rewritten                                                    | Manual read + a test asserting both tool names render                          |
| AC18 | Owner review before merge                                                | Process gate, recorded in the PR                                               |
| AC19 | Small, additive change                                                   | `tsc --noEmit`, `lint`, `test`, `build`, `perf:budget`                         |
| AC20 | Events reach production                                                  | Owner checks the Events panel of `mrgomatires` after deploy                    |

## Tradeoffs / alternatives

**Fan-out inside `gtag.ts` vs. a new module.** Rejected: `gtag.ts` means Google
Analytics, and a module that secretly talks to a second vendor is a trap for the
next reader. A new `analytics.ts` that composes it keeps `gtag.ts` honest and
lets its tests keep passing untouched, which is itself the evidence for FR4.

**`await` vs. fire-and-forget vs. `waitUntil` on the server.** Fire-and-forget
risks the platform freezing the instance before the request completes, silently
losing the one event we care most about. `waitUntil` is the platform-correct
primitive but requires adding `@vercel/functions` for a single call. Awaiting
with a short timeout needs no dependency, and the added latency is one fetch on a
route that already makes three Stripe round-trips and several DB writes. Chosen
for now; if the confirmation ever feels slow, `waitUntil` is the upgrade path and
the change is local to `emitPurchase`.

**Emitting `purchase` from the browser too.** Rejected. It would double-count
against the server event and reintroduce exactly the ad-blocker exposure Group C
exists to remove.

**`add_payment_info` vs. `add_shipping_info`.** Settled in the spec: we can only
honestly observe the shipping submission.

**Renaming GA property keys to match Vercel.** Rejected: it would change the GA4
payload and break FR4.

## Risks

- **GA4 will have no order-completion event at all.** The server `purchase` goes
  to Vercel only, and `place_order` is retired. Today this costs nothing — there
  are zero card payments — but when Stripe goes live, GA4, which the spec calls
  the primary source of truth, would be blind to purchases. _Mitigation:_ flagged
  as the follow-up below; the natural home is roadmap step **S2.4**, which builds
  the confirmation flow anyway.
- **The funnel baseline is destroyed on deploy.** Captured in the spec
  (496 → 26 → 16 → 6) before any code changed. `add_shipping_info` should land
  near 38% of `begin_checkout` by users; a wide miss means it is anchored wrong.
- **Vercel silently strips invalid properties in production** rather than
  erroring, so a bad property is invisible. _Mitigation:_ we normalise ourselves
  and unit-test the normaliser, rather than trusting the vendor's fallback.
- **A throwing `emitPurchase` would be misdiagnosed.** The emit point sits inside
  the route's outer `try`, whose `catch` at `route.ts:207` logs
  `"Failed to insert SC_Order after payment"`. An analytics failure would
  therefore be reported as a failure on the money path, sending whoever reads
  that log to the wrong place entirely. This is the second and stronger reason
  `emitPurchase` must swallow its own errors rather than rely on the caller.
- **The test environment lies about where code runs.** `vitest.config.ts` sets
  `environment: 'jsdom'` for the whole suite, so `window` is defined even in
  server tests — and `@vercel/analytics/server` throws by design when it sees
  `window` outside production. Any test that reaches the real module fails for a
  reason that has nothing to do with the code under test. _Mitigation:_ both
  server test files mock the module; see T10 and T12.
- **Client JS budget.** `track` is a small addition to an already-loaded script,
  but `npm run perf:budget` is part of the DoD and will catch a surprise.
- **Six events still report zero.** If they stay at zero in Vercel too — where
  there is no consent gate and no ad-blocker — that is evidence of a product or
  wiring problem rather than of under-measurement. Worth revisiting a fortnight
  after deploy; the instrumentation itself has already been verified sound.

## Out of scope

- **GA4 server-side `purchase` via the Measurement Protocol** — the answer to the
  first risk above. Deferred deliberately: it is a distinct integration with its
  own credential and its own failure modes, and nothing depends on it until
  Stripe is live. Suggest attaching it to roadmap **S2.4**.
- Adding `data-track` to elements that lack it.
- The instant-quote form's zero submissions in 28 days, and `open_tire_3d`'s zero
  opens — product questions surfaced by the baseline, not tracking defects.
- Dashboards, alerting, or a scheduled GA4-vs-Vercel comparison report.

---

_The concrete steps live in [tasks.md](./tasks.md)._
