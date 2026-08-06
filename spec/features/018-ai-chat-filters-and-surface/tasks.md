# Tasks — Let the assistant search on what the customer actually said

> Feature: `018-ai-chat-filters-and-surface` · Based on: [plan.md](./plan.md) ·
> Created: 2026-08-06

Ordered, **very small, independently verifiable** tasks. Check each off as it is
completed.

The pure helpers come first: they carry the acceptance criteria that would
otherwise depend on model output, so they must be green before anything calls
them.

## Shared helpers (pure, no model involved)

- [x] **T1** — Filter vocabulary, `usedDimensions(filters)`,
      `unusedDimensions(filters)` and `dimensionsParam(filters)` — the
      comma-joined string the events carry, so that rule has one home.
      Dimensions are the customer-facing groupings (size, brand, rim, condition,
      price, tread life), not raw param names, so `minPrice` and `maxPrice`
      collapse to one `price`. **`sort` is not a dimension**: it reorders a
      result set rather than narrowing it, and a hint offering "you could also
      narrow by ordering" would be nonsense. · files:
      `src/app/api/_lib/aiChat/dimensions.ts` (+ test) · check: brand-only input
      reports `['brand']` used and brand absent from unused; an input using every
      dimension reports `[]` unused; an input carrying `sort` reports it in
      neither list; `dimensionsParam` yields `"brand,rim"`.

- [x] **T2** — Move `isSpanish` out of the public route into shared `_lib`, no
      behaviour change. · files: `src/app/api/_lib/aiChat/language.ts` (+ test),
      `src/app/api/tires/ai-chat/route.ts` · check: existing route tests stay
      green; unit test covers a Spanish turn, an English turn, and a mixed
      history where only the last three user turns count.

- [x] **T3** — Move `buildNoResultsMessage` alongside it, unchanged. · files:
      `src/app/api/_lib/aiChat/messages.ts` (+ test),
      `src/app/api/tires/ai-chat/route.ts` · check: existing zero-results
      behaviour identical; test asserts the WhatsApp link and the size string in
      both languages.

- [x] **T4** — `buildNarrowingHint(spanish, dimensions)`. Returns empty string
      for an empty list. · files: `src/app/api/_lib/aiChat/messages.ts` (+ test) ·
      check: **AC5** — given `['rim','price']` the hint names both and never
      names brand; **AC6** — given `[]` it returns `''`. Both languages.

- [x] **T5** — Cached catalogue brands and `unknownBrands(requested, catalogue)`
      with normalized comparison (lowercase, strip spacing and punctuation).
      Extract the `unstable_cache` wrapper so `/api/brands` and this share one
      accessor rather than each keeping its own. Lives at the shared `_lib` root,
      not under `aiChat/`, since `/api/brands` imports it too. · files:
      `src/app/api/_lib/brandCatalogue.ts` (+ test),
      `src/app/api/brands/route.ts` · check: `"michelin"`, `"MICHELIN"` and
      `"Michelin "` all match a catalogue `"Michelin"`; a brand absent from the
      list is returned as unknown; `/api/brands` responses unchanged.

- [x] **T6** — `buildUnknownBrandMessage(spanish, brands)`, worded so it is
      distinguishable from the out-of-stock message and offers both an
      alternative and WhatsApp. · files: `src/app/api/_lib/aiChat/messages.ts`
      (+ test) · check: **AC8** — the string differs from
      `buildNoResultsMessage` output for the same input, names the brand, and
      contains a WhatsApp link. Both languages.

## Event vocabulary

- [x] **T7** — Add `AI_CHAT_FILTERS_APPLIED` and `AI_CHAT_NO_RESULTS` to the
      shared table, each documented with when it fires **and when it must not** —
      the applied one never fires on an empty result set. · files:
      `src/app/utils/analyticsEvents.ts` · check: `retiredEvents.guard.test.ts`
      still green; names follow the "what actually happened" rule.

## Public route

- [x] **T8** — Rewrite `## CONVERSATION FLOW` step 3 so a size is requested only
      when the customer gave nothing filterable, and state in
      `## INVENTORY SEARCH` that a single dimension is a valid search. · files:
      `src/app/api/tires/ai-chat/route.ts` · check: **AC1–AC4** — route tests with
      a stubbed tool call for brand-only, rim-only and condition/price-only return
      `type: 'filters'`; a response with no tool call still returns `message`.

- [x] **T9** — Add `sort` to the tool schema as an enum of exactly
      `price-asc` / `price-desc` — the only two values `tiresRepository`
      implements. · files: `src/app/api/tires/ai-chat/route.ts` · check: **AC7** —
      a tool call carrying `sort` passes it through to the filters payload.

- [x] **T10** — Unknown-brand branch, evaluated **before** the inventory query so
      an absent brand never spends a database round-trip. · files:
      `src/app/api/tires/ai-chat/route.ts` · check: **AC8** — a brand outside the
      catalogue returns `no_results` with the specific copy and `fetchTiresServer`
      is not called.

- [x] **T11** — Introduce the `no_results` response type and add `dimensions` to
      both it and `filters` responses. · files:
      `src/app/api/tires/ai-chat/route.ts` · check: **AC13/AC14** — the empty-result
      path returns `no_results` with the same message as today and the dimensions
      used; the rendered text is unchanged.

- [x] **T12** — Append the narrowing hint to the model's confirmation, omitted
      entirely when nothing is unused. · files:
      `src/app/api/tires/ai-chat/route.ts` · check: **AC5/AC6** — brand-only
      response ends with a hint; all-dimensions response equals the model's
      confirmation exactly.

- [x] **T13a** — Rate-limit the public chat endpoint. It is anonymous and spends
      money on every call, while the **authenticated** dashboard route is the one
      that limits today. Reuse `createRateLimiter('ai-chat-public', …)` at
      **20 requests per minute per IP**, matching the dashboard so there is one
      number to reason about; that is roughly one message every three seconds
      sustained, far above conversational pace. Return the same `429` shape the
      dashboard returns. · files: `src/app/api/tires/ai-chat/route.ts` · check:
      21 requests from one IP inside a minute — the 21st returns 429 **and the
      Anthropic client was not called**; a request with no forwarded IP still
      succeeds (the limiter fails open by design).

- [x] **T13b** — Cap the request body. A limiter closes frequency, not size: 20
      requests a minute each carrying a vast conversation history still bills by
      the token. Cap the number of messages and the length of each, rejecting
      with `400` — the same shape as the instant-quote body cap that `012` set.
      Validate at the boundary per the tech stack. · files:
      `src/app/api/tires/ai-chat/route.ts` · check: a history longer than the cap
      and a single over-long message are both rejected **before** the Anthropic
      client is called; a normal conversation of a dozen short turns passes
      untouched.

## Dashboard route

- [x] **T14** — Add the same `sort` enum to its tool schema and `dimensions` to
      its filter responses. No inventory check and no no-results event: that route
      does not query the catalogue and does not want the WhatsApp fallback. ·
      files: `src/app/api/dashboard/ai-chat/route.ts` · check: **AC7/AC17** — a
      brand-only tool call returns filters; `sort` passes through.

## Client

- [x] **T15** — Forward `sort` in `applyFiltersToUrl`. It forwards fourteen
      params today and omits this one, so an ordering chosen by the assistant
      would be dropped on the way to the listing. · files:
      `src/app/ui/components/AiChat/hooks/useAiChat.ts` (+ test) · check:
      **AC7** — the pushed URL carries `sort=price-asc`.

- [x] **T16** — Add a **required** `surface` prop to `AiChat` and emit it as
      `data-track-surface` on the three already-tracked elements (launcher, send
      button, example chips). Required rather than defaulted: a default is how the
      dashboard silently inherited the public component's instrumentation in the
      first place. · files: `src/app/ui/components/AiChat/AiChat.tsx` · check: the
      three elements carry the attribute; omitting the prop is a type error.

- [x] **T17** — Pass `surface="site"` from the public wrapper and
      `surface="dashboard"` from the dashboard. · files:
      `src/app/ui/components/AiChat/SiteAiChat.tsx`,
      `src/app/(sellers)/dashboard/container/Dashboard.tsx` · check: **AC9/AC10** —
      component tests assert each value and that the two differ.

- [x] **T18** — Fire the two events from `useAiChat` on the response type,
      carrying `surface` and the `dimensions` string the server already sent
      (built by `dimensionsParam` in T1 — not re-joined here, so the
      "names, never typed values" rule keeps one implementation). · files:
      `src/app/ui/components/AiChat/hooks/useAiChat.ts` · check: **AC11/AC12/AC13** —
      with `trackEvent` mocked: `filters` fires the applied event exactly once;
      `message` fires neither; `no_results` fires only the no-results event.

## Tests and closing

- [x] **T19** — Drive route tests from the actual `PUBLIC_EXAMPLE_QUERIES` array
      so a prompt the chat advertises but cannot honour fails the suite. Cover
      **all seven**, not only the partial filters: each is asserted against what
      it implies — the five that are searches produce a filtered listing, and the
      one that is a question (`¿qué diferencia hay entre nueva y usada?`) produces
      a plain answer rather than a search. Iterating the array means a prompt
      added later without support fails here. · files:
      `src/app/api/tires/ai-chat/route.test.ts` · check: **AC16** — every entry in
      `PUBLIC_EXAMPLE_QUERIES` has an assertion, enforced by asserting the array's
      length matches the case count.

- [x] **T20** — Guard test that no event this feature emits carries a
      customer-typed value — dimension names only. Tests `dimensionsParam` from
      T1 directly, which is why it is a real unit test and not a promise. · files:
      `src/app/api/_lib/aiChat/dimensions.guard.test.ts` · check: **AC15** —
      given `{ brands: 'Michelin', stores: 'Hialeah' }` the result is
      `"brand,store"` and contains neither `Michelin` nor `Hialeah`.

- [x] **T21** — Record the event-series discontinuity in the feature's results:
      readings before this ships carry no `surface` and mix staff with customers,
      so an absent value means "before 018", never "public site". · files:
      `spec/features/018-ai-chat-filters-and-surface/results.md` · check: the note
      exists and states the date the surface property first shipped.

- [x] **T-DoD** — Definition of Done: `npx tsc --noEmit` + `npm run lint` +
      `npm test` + `npm run build` + `npm run perf:budget` green. Manual pass on
      the public chat (a brand-only request, a "cheapest first" request, a brand
      we do not stock, a store question, an off-topic question, and a WhatsApp
      request — the last three to catch prompt regressions) and on the dashboard
      chat, **on a phone**, per the plan's prompt-regression risk.

## Traceability

| Task | Acceptance criteria |
| ---- | ------------------- |
| T1   | AC5, AC6 (foundation) |
| T2   | AC5, AC8 (language selection) |
| T3   | AC14 |
| T4   | AC5, AC6 |
| T5   | AC8 |
| T6   | AC8 |
| T7   | AC11, AC13 (naming) |
| T8   | AC1, AC2, AC3, AC4 |
| T9   | AC7 |
| T10  | AC8 |
| T11  | AC13, AC14 |
| T12  | AC5, AC6 |
| T13a | — (risk from plan; no AC) |
| T13b | — (risk from plan; no AC) |
| T14  | AC7, AC17 |
| T15  | AC7 |
| T16  | AC9, AC10 |
| T17  | AC9, AC10 |
| T18  | AC11, AC12, AC13 |
| T19  | AC16 |
| T20  | AC15 |
| T21  | — (non-functional: event history) |
| T-DoD | all, via manual pass |

Every acceptance criterion AC1–AC17 appears at least once. T13a, T13b and T21
carry no criterion because they answer a risk and a non-functional constraint
rather than a behaviour the spec promised.

## Before writing the first route test

Importing either chat route naively throws `Environment variable SERVER_URL is
not set` — the route reaches the repository, which reaches `db.ts`, which reads
env at module scope, and nothing loads `.env` under Vitest. Follow the mocking
recipe in [plan.md](./plan.md) § *How the routes get tested*; the pattern already
exists in `api/brands/route.test.ts`.

---

_Run `/analyze` before implementing._
