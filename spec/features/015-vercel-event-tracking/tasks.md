# Tasks — Event tracking in Vercel Web Analytics, alongside GA4

> Feature: `015-vercel-event-tracking` · Based on: [plan.md](./plan.md) ·
> Created: 2026-08-04

Ordered, **very small, independently verifiable** tasks. Check each off as it is
completed.

Groups A → B → C → D are independently shippable in that order. The build stays
green after every task; nothing below leaves the tree half-wired.

## Group A — fan-out (nothing else works without this)

- [x] **T1** — Add the pure property normaliser and the event-name constants.
      `toVercelProps()` maps `category`/`label`/`value` plus each `params` entry,
      drops `undefined`, passes scalars through, and `JSON.stringify`s anything
      else (falling back to `String()`). `EVENTS` names the four new events so no
      call site spells one by hand. · files: `src/app/utils/analytics.ts` ·
      check: new `src/app/utils/analytics.test.ts` covers each row of the mapping
      table, including an object property surviving as a string with its siblings
      intact.

      _Deviation from the plan, deliberate:_ `EVENTS` and `RETIRED_EVENTS` went
      into a separate, zero-import `analyticsEvents.ts` rather than into
      `analytics.ts`. The server-side emitter needs the `purchase` name, and
      importing it from `analytics.ts` would drag `@vercel/analytics` — a browser
      client — into a route handler.

- [x] **T2** — Add `trackEvent()` on top of T1: calls `gtag.event()` and Vercel's
      `track()` in **separate `try` blocks**, and returns early off the browser. ·
      files: `src/app/utils/analytics.ts`, `src/app/utils/analytics.test.ts` ·
      check: both sinks receive the same event name; with `window.gtag` absent
      the Vercel sink still fires; making either sink throw leaves the other
      still called.

- [x] **T3** — Point the global listener at `trackEvent`. Import and call it
      instead of `event`; the listener logic itself is untouched. · files:
      `src/app/ui/components/InteractionTracker/InteractionTracker.tsx` · check:
      `npm test` green **with `src/app/utils/gtag.test.ts` unmodified** — that
      file passing as-is is the evidence GA4's payload did not change (FR4).

## Group B — conversion accuracy

- [x] **T4** — Rename the checkout button's event to `add_shipping_info`. ·
      files: `src/app/(shop)/checkout/container/Checkout/Checkout.tsx` (~line 816)
      · check: the rendered button carries `data-track="add_shipping_info"` and no
      longer carries `place_order`.

- [x] **T5** — Emit `whatsapp_order_sent` inside the `if (data?.whatsappUrl)`
      branch of `proceedToPayment`, before the redirect. · files:
      `Checkout.tsx` (~line 244) · check: the event fires on that branch only —
      not on the Stripe-URL branch, not on the 409/501/error paths.

- [x] **T6** — Move the quote conversion onto success: drop the `data-track`
      attributes from the submit button and emit `generate_lead` immediately
      after `setSuccess(true)`, which already sits past the `!res.ok` throw. ·
      files:
      `src/app/(shop)/instant-quote/container/InstantQoute/InstantQoute.tsx`
      (~lines 524 and 230) · check: the button has no `data-track` left.

- [x] **T7a** — Extend the **existing** quote test file for T6. · files:
      `src/app/(shop)/instant-quote/container/InstantQoute/InstantQoute.test.tsx`
      · check: a rejected submission (`res.ok === false`) emits nothing; an
      accepted one emits exactly one `generate_lead`. _Note: this suite has shown
      5s timeouts under CPU contention when a dev server is running. If it fails,
      run the file in isolation before suspecting the change._

- [x] **T7b** — Create the **first** test file for the checkout container, for T4
      and T5. `Checkout.tsx` has no test today and is ~840 lines with cart
      context, Stripe config and store data, so the harness is the bulk of this
      task — budget for it accordingly, and keep the harness minimal: mount,
      stub `fetch`, assert. · files:
      `src/app/(shop)/checkout/container/Checkout/Checkout.test.tsx` · check: the
      button renders `data-track="add_shipping_info"`; the WhatsApp branch emits
      exactly one `whatsapp_order_sent`; the Stripe-URL branch and the
      409/501/error paths emit none.

- [x] **T8** — Add the retired-name guard: scan `src/` and fail if `place_order`
      or `quote_submit` appears as an event name. Follow the existing
      `imageSizes.guard.test.ts` shape. · files:
      `src/app/utils/retiredEvents.guard.test.ts` · check: passes now; fails if
      either name is reintroduced anywhere.

## Group C — server-side purchase

- [x] **T9** — Add `buildPurchaseProps()`: pure, no Vercel import, returning
      **exactly** `value`, `currency`, `fulfillment_method`, `store`,
      `item_count`. Take the item count from `items` (`route.ts:79`, function
      scope), filtering `productId !== 'tax'` — **not** from `detailItems`, which
      is block-scoped inside the nested `try` at `route.ts:160` and is already
      out of scope where the event is emitted. · files:
      `src/app/api/checkout/_lib/purchaseEvent.ts` ·
      check: `purchaseEvent.test.ts` asserts **exact key-set equality** (not a
      subset), and — built from a fixture carrying an email, phone, address and
      Stripe session id — asserts none of those values appear anywhere in the
      payload.

- [x] **T10** — Add `emitPurchase()`: awaits `@vercel/analytics/server`'s
      `track()` inside `try/catch`, bounded by a short timeout so neither a
      rejection nor a hang can escape. · files: `purchaseEvent.ts`,
      `purchaseEvent.test.ts` · check: with `track` rejecting, and again with it
      never settling, `emitPurchase` still resolves and throws nothing.

      **Two traps this repo has already hit — read before writing the test:**
      (a) `vitest.config.ts` runs the whole suite in **jsdom**, so `window`
      exists, and the real `@vercel/analytics/server` throws by design when it
      sees `window` outside production. The module **must** be `vi.mock`ed; a
      test that reaches the real one fails for reasons unrelated to this code.
      (b) A `vi.fn` that rejects is re-reported by Vitest as an unhandled error
      **even when the code catches it** — `src/app/api/tires/route.test.ts`
      documents this and solves it with a swappable plain function (`h.impl`).
      Reuse that pattern instead of `mockRejectedValue`.

- [x] **T11** — Call `emitPurchase` from the route, inside the existing
      `if (!existing)` new-order branch, after the order and its details are
      written. Every input is already in scope; add no fetch and no query. ·
      files: `src/app/api/checkout/session/route.ts` · check: the route's
      response payload is byte-identical to before.

- [x] **T12** — Route-level tests for T11. New file, but there is an established
      pattern to follow in `src/app/api/tires/route.test.ts` and its siblings. ·
      files: `src/app/api/checkout/session/route.test.ts` · check: nothing emitted when
      `payment_status` is unpaid; nothing emitted in `CHECKOUT_TEST_MODE`;
      nothing emitted on a repeat request for a session that already has an
      order; and with the analytics send failing, the route still returns its
      payload with the order recorded. **Both traps from T10 apply here too**:
      mock `@vercel/analytics/server`, and use the swappable-plain-function
      pattern for the failing-send case.

## Group D — privacy & disclosure

- [x] **T13** — Rewrite the policy's single "Cookies" bullet into cookies vs.
      analytics, naming Google Analytics (cookie-based, only after acceptance)
      and Vercel Web Analytics (stores nothing on the device, always on). ·
      files: `src/app/(shop)/legal-policies/page.tsx` (line 77) · check: a test
      asserts both tool names render; read it on a phone-width viewport.

- [x] **T14** — Update the banner wording so it no longer implies all analytics
      are cookie-based, and correct the stale comment claiming a 30-day re-prompt
      when `DECLINE_DAYS = 1`. **Behaviour does not change.** · files:
      `src/app/ui/components/CookieConsent/CookieConsent.tsx` (lines 11 and ~152)
      · check: existing banner tests pass unmodified; accept/decline still behave
      exactly as before.

- [x] **T15** — Update the constitution's "Analytics & tracking" section, which
      currently says events go to GA4 only. State both platforms, that Vercel is
      ungated, and the no-personal-data rule for event properties. While in the
      file, refresh the stale suite size under _Testing_: it claims
      "107 tests / 24 files"; the suite measured **350 tests / 45 files** green
      on 2026-08-04, before any of this feature's code. · files:
      `spec/tech-stack.md` · check: an agent reading only `tech-stack.md` would
      instrument a new button correctly.

## Closing

- [x] **T16** — Definition of Done: `npx tsc --noEmit` + `npm run lint` +
      `npm test` + `npm run build` + `npm run perf:budget` all green. Manual
      check on `/checkout`, `/instant-quote` and `/legal-policies`, on mobile
      width. In `npm run dev` the Vercel client logs events to the console
      instead of sending them — use that to confirm each new event fires at the
      right moment before deploying.

      _Done 2026-08-04._ `tsc`, `lint`, **382 tests / 51 files**, `build` and
      `perf:budget` (157.3 KB shared / 612.8 KB total, both under limit) all
      green. Verified in a real browser on `next dev`:
      - After pressing **Decline** on the cookie banner, `window.gtag` is
        `undefined` and a tracked click still logs
        `[Vercel Web Analytics] [event] add_to_cart` — AC2 confirmed outside the
        test doubles.
      - `/checkout` renders `data-track="add_shipping_info"` with category
        `checkout`; a DOM query for the retired names returns **0** elements.
      - `/legal-policies#privacy` shows the split Cookies / Analytics items,
        readable at narrow width.

      _Note for the next person:_ `window.vaq` is **not** a reliable way to check
      this. Once the client script has loaded, `window.va` is the real function
      and processes events rather than queueing them, so the queue stays empty
      while tracking works perfectly. Read the console instead.

- [ ] **T17** — **Owner gate:** the privacy-policy and banner copy is read and
      approved before merge (FR21). Record the approval in the PR.

- [ ] **T18** — **Post-deploy, owner-verified:** the Events panel of the
      `mrgomatires` project stops reading "No custom events" and lists the names
      from the spec's vocabulary table. Then compare `add_shipping_info` against
      the captured baseline — it should land near **38% of `begin_checkout` by
      users**; a wide miss means it is anchored to the wrong moment, not that
      behaviour changed.

## Traceability

| Task | Acceptance criteria     |
| ---- | ----------------------- |
| T1   | AC3, AC4                |
| T2   | AC1, AC2, AC3, AC5      |
| T3   | AC1, AC2, AC3           |
| T4   | AC8, AC9                |
| T5   | AC10                    |
| T6   | AC6, AC7, AC9           |
| T7a  | AC6, AC7                |
| T7b  | AC8, AC10               |
| T8   | AC9                     |
| T9   | AC13, AC16              |
| T10  | AC15                    |
| T11  | AC11, AC12, AC14        |
| T12  | AC11, AC12, AC14, AC15  |
| T13  | AC17                    |
| T14  | AC17                    |
| T15  | — (constitution upkeep) |
| T16  | AC19                    |
| T17  | AC18                    |
| T18  | AC20                    |

All twenty acceptance criteria are covered. T15 carries no criterion of its own:
it keeps the constitution truthful, which no acceptance test can assert.

---

_Run `/analyze` before implementing._
