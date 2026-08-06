# Plan — Let the assistant search on what the customer actually said

> Feature: `018-ai-chat-filters-and-surface` · Based on: [spec.md](./spec.md) ·
> Created: 2026-08-06

## What the code says that the spec assumed

Two findings from reading the routes, both of which change the work.

**The dashboard assistant was never blocked.** Its prompt says only "extract the
relevant filter criteria and use the apply_filters tool" — there is no
conversation script demanding a size, unlike the public one. D2 asked for it to
be unblocked "on the same terms"; in practice that part is already true and the
work reduces to keeping it true under test. What the dashboard genuinely lacks is
ordering, the surface property, and the events.

**The dashboard route never checks the inventory.** The public route calls
`fetchTiresServer` before redirecting and offers WhatsApp when nothing matches;
the dashboard hands back filters unconditionally. So it has no zero-results
concept to attach FR9's event to. Giving it one would mean adding an inventory
round-trip to a staff tool that does not want the WhatsApp fallback. The
no-results event is therefore **public-surface only**, and the plan says so
rather than quietly skipping an FR.

## Technical approach

Three strands, all landing in the two route handlers and the one shared chat
component.

**1 — Unblock the public prompt.** The `apply_filters` tool already accepts
`brands`, `d`, `condition`, price and tread bounds, and requires only
`confirmationMessage`. Nothing in the schema needs to change for partial filters
to work. What blocks them is step 3 of `## CONVERSATION FLOW` ("ask for size or
vehicle"), which runs before the inventory section. That step is rewritten to ask
only when the customer gave nothing filterable, and `## INVENTORY SEARCH` gains an
explicit statement that a single dimension is a valid search.

**2 — Compose the added copy on the server, not in the model.** The hint about
what else can be narrowed (FR4) and the absent-brand message (FR6) are written by
deterministic builders, in the customer's language, and appended to the model's
own confirmation.

This is the pivotal choice, and it is what makes the acceptance criteria
testable. Model output cannot be asserted in a unit test; a pure function can.
It is also not a new pattern — the public route **already** composes bilingual
copy this way in `buildNoResultsMessage`, using an `isSpanish` heuristic over the
recent user turns. This feature extends an established local pattern rather than
introducing one.

**3 — Instrument the outcome, and say which surface it came from.** `AiChat`
gains a required `surface` prop rendered as `data-track-surface`; the existing
delegated listener already forwards any `data-track-*` as an event param, so no
tracking machinery changes. The two new events fire from `useAiChat` when the
response arrives, because that is the moment the outcome becomes real for the
customer, and it keeps every event on the single `trackEvent` path that reaches
both sinks.

To let the client tell "no results" from ordinary chat, the response gains a
third discriminant, `no_results`. It renders exactly like `message` — no visual
change — but carries the dimensions used and tells the client which event to fire.

## Reuse first

| Existing thing | Where | Used for |
| --- | --- | --- |
| `isSpanish()` | `api/tires/ai-chat/route.ts` | Language choice for the new builders. Moves to `_lib` so the dashboard can share it. |
| `buildNoResultsMessage()` | same | The bilingual-builder pattern the new copy follows. Moves alongside it. |
| `fetchTiresServer()` | `(shop)/tires/utils/` | Already the zero-results check. Unchanged. |
| `fetchBrands()` | `repositories/tiresRepository` | The catalogue brand list for FR6. Returns `string[]`. |
| `unstable_cache` wrapper | `api/brands/route.ts` | Same 300s caching shape for the brand list; extracted so both callers share one. |
| `trackEvent()` / `EVENTS` | `app/utils/analytics.ts`, `analyticsEvents.ts` | Both new events. No new transport. |
| `InteractionTracker` | `ui/components/InteractionTracker/` | Already forwards `data-track-*` → params. **No change.** |
| `buildTireFilters` param names | `app/utils/filterUtils.ts` | `sort` must be spelled exactly as the catalogue reads it. |
| `_lib` colocation | `api/checkout/_lib`, `api/tires/ai-chat/_lib` | Where the new helpers go. |
| `createRateLimiter` | `utils/rateLimit.ts` | See Risks — the public route has none. |

## Files to add / change

**New**

- `src/app/api/_lib/aiChat/language.ts` — `isSpanish`, moved out of the public
  route so both routes share one heuristic.
- `src/app/api/_lib/aiChat/dimensions.ts` — the filter vocabulary, plus
  `usedDimensions(filters)`, `unusedDimensions(filters)` and
  `dimensionsParam(filters)` (the comma-joined string the events carry).
  Pure. **`sort` is deliberately not a dimension**: it reorders a result set, it
  does not narrow one, and offering "you could also narrow by ordering" would be
  nonsense.
- `src/app/api/_lib/aiChat/messages.ts` — `buildNoResultsMessage` (moved),
  `buildNarrowingHint`, `buildUnknownBrandMessage`. Pure, bilingual.
- `src/app/api/_lib/brandCatalogue.ts` — cached catalogue brands and
  `unknownBrands(requested, catalogue)` with normalized comparison. Sits at the
  shared API `_lib` root, **not** under `aiChat/`, because `/api/brands` imports
  it too and a brands route reaching into a chat library would be the wrong way
  round.
- Test files for each of the four.

**Changed**

- `src/app/utils/analyticsEvents.ts` — add `AI_CHAT_FILTERS_APPLIED` and
  `AI_CHAT_NO_RESULTS`, each documented with when it fires and when it must not.
- `src/app/api/tires/ai-chat/route.ts` — rewrite the flow step; add `sort` to the
  tool; append the narrowing hint; detect absent brands; return `no_results` and
  `dimensions`.
- `src/app/api/dashboard/ai-chat/route.ts` — add `sort` to the tool; return
  `dimensions` on filter responses. No inventory check added.
- `src/app/ui/components/AiChat/AiChat.tsx` — required `surface` prop; emit
  `data-track-surface` on the three existing tracked elements.
- `src/app/ui/components/AiChat/SiteAiChat.tsx` — pass `surface="site"`.
- `src/app/(sellers)/dashboard/container/Dashboard.tsx` — pass
  `surface="dashboard"`.
- `src/app/ui/components/AiChat/hooks/useAiChat.ts` — accept `surface`; forward
  `sort` in `applyFiltersToUrl` (it forwards fourteen params today and not this
  one); fire the two events.
- Tests for the routes and the hook.

## Data & flow

The response contract becomes a three-way discriminated union:

```ts
type AiChatResponse =
  | { type: 'filters';    filters: Record<string, unknown>; message: string; dimensions: string[] }
  | { type: 'no_results'; message: string; dimensions: string[] }
  | { type: 'message';    message: string };
```

Public request flow:

1. Messages → Claude Haiku with the `apply_filters` tool.
2. No tool call → `{ type: 'message' }`. Unchanged.
3. Tool call → extract `filterParams`.
4. If `brands` were requested, compare against the cached catalogue. Any brand
   with no normalized match → `{ type: 'no_results' }` with the absent-brand copy.
5. Otherwise `fetchTiresServer(params)`. `totalCount === 0` →
   `{ type: 'no_results' }` with the existing WhatsApp copy.
6. Otherwise append `buildNarrowingHint(spanish, unusedDimensions(filterParams))`
   to the model's confirmation — omitted entirely when nothing is unused — and
   return `{ type: 'filters', dimensions: usedDimensions(filterParams) }`.

Client, in `useAiChat`:

- `filters` → render, `trackEvent(AI_CHAT_FILTERS_APPLIED, { surface, dimensions })`,
  then push the URL.
- `no_results` → render, `trackEvent(AI_CHAT_NO_RESULTS, { surface, dimensions })`,
  no navigation.
- `message` → render only.

**Event property shape.** Vercel accepts only flat scalars, so `dimensions` is
sent as a comma-joined string (`"brand,rim"`), never an array. That joining is
`dimensionsParam(filters)` in the shared `_lib`, not inline in the hook, so the
rule "dimension names, never typed values" (D4, FR11) has one implementation and
one test rather than being retyped at each call site.

## How the routes get tested

Importing either chat route naively in a test throws
`Environment variable SERVER_URL is not set` — the route reaches
`fetchTiresServer` → `tiresRepository` → `db.ts` → `constants.ts`, which calls
`requireEnv` at module scope. Nothing loads `.env` under Vitest.

This is not a blocker; it is a trap worth an hour if unrecorded. The repository
already has the pattern, in `api/brands/route.test.ts`: mock the modules beneath
the route so the database chain is never imported at all.

```ts
const h = vi.hoisted(() => ({ impl: (() => …) as () => unknown }));
vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }));
vi.mock('@/repositories/tiresRepository', () => ({ fetchBrands: () => h.impl() }));
vi.mock('@/utils/logger', () => ({ logger: { error: vi.fn(), warn: vi.fn(), … } }));
import { POST } from './route';
```

The chat routes need two more: `@/app/(shop)/tires/utils/fetchTiresServer` (so
the inventory count is controllable, and so "was it called?" is assertable for
the unknown-brand branch) and `@anthropic-ai/sdk` (so a tool call can be stubbed
without a network round-trip or an API key). The dashboard route additionally
needs `@/app/utils/authOptions`.

The `h.impl` shape rather than a plain `vi.fn` is deliberate and already
documented in the existing test: a `vi.fn` that rejects is re-reported by Vitest
as an unhandled error even when the route catches it.

`sort` travels as `price-asc` / `price-desc`, exactly the two values
`tiresRepository` implements, added to both tool schemas as an enum and forwarded
by `applyFiltersToUrl`.

## Acceptance criteria → implementation

| AC | How it's met | How it's verified/tested |
| --- | --- | --- |
| AC1 | Flow step rewritten; schema already permits brand-only | Route test: stubbed tool call with `brands` only returns `type: 'filters'`; prompt guard test asserts the flow no longer orders an unconditional size question |
| AC2 | Same, `d` only | Route test with `d` only |
| AC3 | Same, `condition` / price only | Route test for each |
| AC4 | Flow step still asks when nothing filterable was given | Route test: no tool call → `type: 'message'`; manual check |
| AC5 | `buildNarrowingHint(spanish, unusedDimensions(f))` appended | Unit: brand-only input yields a hint naming rim/condition/price and **not** brand, in both languages |
| AC6 | Hint omitted when `unusedDimensions` is empty | Unit: all-dimensions input yields no hint; route test asserts the message equals the model's confirmation exactly |
| AC7 | `sort` enum in both tools, forwarded by `applyFiltersToUrl` | Unit on `applyFiltersToUrl` (URL carries `sort=price-asc`); route test both directions |
| AC8 | `unknownBrands()` + `buildUnknownBrandMessage` | Unit: brand absent from catalogue → distinct copy, both languages; route test returns `no_results` without hitting `fetchTiresServer` |
| AC9 | `surface="site"` → `data-track-surface` | Component test: rendering `SiteAiChat` puts `data-track-surface="site"` on the launcher, send button and example chips |
| AC10 | `surface="dashboard"` from `Dashboard.tsx` | Component test asserts the attribute and that it differs from the public value |
| AC11 | `trackEvent` on `type: 'filters'` | Hook test with a mocked `trackEvent`: fires once, carries surface and dimensions |
| AC12 | No call on `type: 'message'` | Hook test: plain message → `trackEvent` not called with the applied name |
| AC13 | `no_results` branch fires the other event only | Hook test asserts the no-results name fires and the applied name does not |
| AC14 | Existing zero-results path untouched | Existing route test kept; assert no navigation occurs |
| AC15 | Only dimension names are sent | Unit on the property builder; `storeData`-style guard scanning event params for typed values |
| AC16 | The three partial-filter example prompts now work | Route tests driven by the actual `PUBLIC_EXAMPLE_QUERIES` array, so adding a prompt without support fails the suite |
| AC17 | Dashboard prompt already permits it; `sort` added | Route test on the dashboard route with a brand-only tool call |

## Tradeoffs / alternatives

- **Server-composed hint over model-composed.** Asking the model to mention only
  unused dimensions would read more naturally, but no unit test can assert it and
  AC5/AC6 would degrade to manual checks. Chose determinism, at the cost of a
  fixed phrasing. `buildNoResultsMessage` already set this precedent in the same
  file.
- **Validating brands over injecting the catalogue into the prompt.** The
  catalogue holds 100+ brands; listing them in the system prompt would cost tokens
  on every request and still leave the model free to invent one. Validating what
  it returned against a cached list is deterministic and costs one cached query.
- **Client-side events over server-side.** `@vercel/analytics/server` would
  survive ad-blockers, as the purchase event does, but it reaches only Vercel —
  GA4 would miss both events, and the two would sit on different transports from
  every other chat event. Chose one path.
- **Required `surface` prop over a default.** A default is the reason we are here:
  the dashboard inherited the public component's instrumentation silently. Making
  it required means a new mount site cannot mislabel itself without a type error.
- **`no_results` as a response type over a boolean flag.** A discriminated union
  keeps the client's branching exhaustive under TypeScript.

## Risks

- **The public chat endpoint is anonymous, unlimited and unvalidated.** The
  authenticated dashboard route limits to 20/min; the anonymous one that spends
  money on every call limits nothing, and its body is checked only for
  `Array.isArray`. This feature does not cause either gap, but it makes the
  assistant more useful and therefore more used. **Both are closed here (T13).**

  Frequency and size are separate holes and a limiter only closes the first: an
  attacker inside 20 requests a minute can still send each one with a vast
  conversation history, and cost scales with tokens, not with requests. So the
  route also caps how many messages it accepts and how long each may be — the
  same shape as the instant-quote body cap that `012-public-api-hardening`
  established, and what the tech stack means by validating external input at the
  boundary.

  Neither cap can be justified by a test that asserts "no money was spent". What
  is assertable is that an over-limit request is rejected **before** the Anthropic
  client is called, which is what the tests check.
- **Prompt edits regress unrelated behaviour.** The public prompt also governs
  store cards, WhatsApp rules and scope refusals. Mitigation: AC16's example-prompt
  matrix plus a manual pass over a store question, an off-topic question and a
  WhatsApp request before merge.
- **A misspelled brand is reported as "not stocked".** Mitigation: compare
  normalized (lowercased, punctuation and spacing stripped). Residual risk
  accepted — the message still offers WhatsApp, so a typo costs a slightly wrong
  sentence, not a lost customer.
- **Brand cache staleness.** A newly stocked brand is unrecognised for up to five
  minutes, matching `/api/brands`. Acceptable.
- **Event series discontinuity.** Readings before this ships carry no surface and
  mix staff with customers; absence must be read as "before 018". To be recorded
  in this feature's results, per the spec's non-functional note.
- **Model non-compliance.** Haiku may still ask for a size occasionally. The
  deterministic parts (hint, brand check, events) do not depend on it, so a lapse
  degrades the experience without corrupting the data.

## Out of scope

- Adding an inventory check to the dashboard route, and with it a no-results
  event on that surface.
- Reviewing how the dashboard's internal filters (`kindSale`, `local`, `code`) are
  exposed conversationally (spec, D2).
- Orderings beyond price (D7) and vehicle lookup.
- The stray "Tire size format in Colombia" line in the dashboard prompt — wrong
  country for a Miami business, harmless, and not this feature's business.

---

_The concrete steps live in [tasks.md](./tasks.md)._
