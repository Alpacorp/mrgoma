# Plan — Tire sets in the AI chat

> Feature: `044-chat-tire-sets` · Based on: [spec.md](./spec.md) · Created: 2026-11-10

## Technical approach

Three pieces, each reusing what 041 and 043 already ship.

1. **Find sets on the server, not in the model.** The public chat route
   (`/api/tires/ai-chat`) gets a second tool, `find_sets`, next to
   `apply_filters`. The model only **extracts** what the customer asked: size
   (`w`, `s`, `d`), quantity (2/3/4, default 4 — D3), and optional brand,
   condition and city. The route then:
   - reads every sellable unit of that size in **one cached query per size**
     (new, in `tireSetsRepository`);
   - groups the units by 041's group (brand, model, size, run-flat, condition,
     city) and asks a new pure function for the **cheapest valid set** of the
     requested size in each group (041 tread rule, reused helpers);
   - applies the narrowing (brand, condition, city), the ordering (D1) and the
     fallback ladder (D4) in a pure function, `pickChatSets`;
   - gives the lookup **4 seconds** at most (`Promise.race`); past that, or
     on an error, it answers like today with the 041 tip (AC12) — the pool of
     10 connections has made queries wait 4–30 s before;
   - returns `type: 'sets'` with up to 3 **card objects** and a short message
     the server writes in EN or ES (no second model call, no model-written
     numbers — FR9, D7).

   The model never sees the inventory; it can only trigger the lookup. A
   `find_sets` call without a full size is answered like today (ask for the
   size, with the 041 tip — FR11).

2. **Cards in the chat.** `useAiChat` keeps the cards on the assistant
   message; `AiChat` renders them under the text with a new small
   `ChatSetCards` component. "Review set →" is a link to the anchor tire's
   page with `?set=<id>,<id>,…`; tapping it records the GA4 event (D8) and
   closes the chat. Unlike a catalog search, a `sets` reply does **not**
   auto-close the panel or navigate. The estimated city (043) is read from
   the browser's stored estimate (`readGuess`) when the message is sent — no
   new fetch — and sent as an optional hint.

3. **The tire page opens the panel with those tires.** `TireSetPanel` reads
   `?set=` on the client after mount (the page HTML does not change — no
   `searchParams` on the server, same canonical URL). A pure function,
   `resolvePresetSet`, checks the ids against the page's candidates:
   - every id is present and the set is valid → the panel opens with exactly
     those tires (D6);
   - some ids are gone (sold) → they are replaced with `pickReplacement`
     (041) and the panel opens with a one-line notice;
   - no valid set of that size can be built → the panel stays closed and the
     card shows a short notice;
   - ids that do not belong to this group, duplicates, or a size outside 2–4
     are ignored (never an invalid set — AC5).

   `TireSetBuilder` gets an optional `initialSet`: its starting set instead of
   the suggestion. Changing the size returns to 041's suggestion; swaps work
   on top as today.

## Reuse first

- **041 engine** (`src/app/utils/tireSets.ts`): `effectiveTread`,
  `isWithinTolerance`, `treadRange`, `setTotal`, `pickReplacement`,
  `MAX_TREAD_SPREAD`, `SetUnit`, `SetSize`. The new set search is a sibling
  of `suggestSet` in the same module, with the same 2/32" windows.
- **041 repository** (`tireSetsRepository.ts`): column whitelist,
  `toSetUnit` (city from `VaultName`, which is never returned),
  `STOREFRONT_SELLABLE_WHERE`, the lazy `@/connection/db` import (barrel trap)
  and the `unstable_cache` pattern.
- **Chat route**: rate limiter, body caps, `isSpanish`, `asksForSet`,
  `buildSetHint`, `parseBrands` / `getCachedBrands` / `unknownBrands`
  (unknown brand → today's message), `buildNoResultsMessage`,
  `withLogging`.
- **Chat client**: `useAiChat` response handling, `MessageContent`,
  `trackEvent` + `EVENTS`.
- **043**: `readGuess` (stored estimate; no fetch), `TireCity`.
- **Links**: `buildTireSlug` (`/tires/{id}-{brand}-{size}`).
- **Set panel**: `TireSetPanel`'s `showModal()` and focus-on-open.

## Files to add / change

- `src/repositories/tireSetsRepository.ts` — `fetchSizeUnitsFresh(size)` +
  `getCachedSizeUnits(size)`: one query per size reading `Brand`, `Model2`,
  `KindSaleId` plus 041's `SET_COLUMNS`, `TOP 400` (the largest size has 266
  sellable units today; 290 sizes, 6,754 units), cached 120 s, keyed by
  size. Returns `SizeUnit = SetUnit & { brand, model2, runFlat }`. A pure
  `buildSizeUnitsQuery()` for the test.
- `src/app/utils/tireSets.ts` — `cheapestSet(units, size)`: across every
  2/32" window, the `size` cheapest units (ties: unpatched first, then id);
  `null` when none. Pure, unit-tested next to `suggestSet`.
- `src/app/utils/chatSets.ts` (new, pure, + test) — `pickChatSets(units,
  request)`: groups by 041 group, `cheapestSet` per group, narrowing, D1
  order (visitor city first, then total ascending; one card per
  brand+model), at most 3; and the D4 ladder (requested city → other city →
  smaller sizes → none), returning `{ outcome, sets }` where `outcome` is
  `found | other_city | smaller | none`. Also `toChatSetCard()` (brand,
  model, condition, city, count, total, tread label, href) and
  `resolvePresetSet()` for the tire page. The tire page's client panel
  imports this module, so it may import **only types** from the repository
  (`import type`) — otherwise `@/connection/db` would reach the client, 041's
  barrel trap. Guarded by a test, like `serverBoundary.guard.test.ts`.
- `src/app/api/_lib/aiChat/sets.ts` — `buildSetsMessage(spanish, outcome,
  request)` (EN/ES intro + "prices and stock as of now; you confirm on the
  page" line) and `summarizeSetsForHistory(cards)` (a compact text the next
  model turn sees, so "only Michelin" refines the same search): brand, model,
  city and number of tires only — **no totals, prices or treads**, so the
  model has nothing to quote — and message + summary always under the
  route's 2,000-character cap (`MAX_MESSAGE_LENGTH`), which applies to the
  assistant turns the browser sends back. + tests.
- `src/app/api/tires/ai-chat/route.ts` — `FIND_SETS_TOOL`; prompt section
  "TIRE SETS" rewritten (use `find_sets` when a set is asked and the size is
  known; never state counts or prices yourself; quantity default 4); a
  `sets` response branch with the guards (missing size, unknown brand, lookup
  failure → today's reply + 041 tip). Reads an optional `city` from the body
  (`'Miami' | 'Orlando'`, zod-validated; anything else ignored).
- `src/app/api/tires/ai-chat/route.test.ts`, `prompt.guard.test.ts` — new
  branch, guards, and the prompt no longer says "never say a set is
  available" for looked-up sets.
- `src/app/ui/components/AiChat/hooks/useAiChat.ts` — `type: 'sets'`; cards
  stored on the message; history gets `message + summary`; sends `city` from
  `readGuess()`; `ai_chat_sets_shown` / `ai_chat_no_results` tracking as
  today's pattern.
- `src/app/ui/components/AiChat/ChatSetCards.tsx` (new, + test) — list of
  cards (`<ul>`, each card an `<li>` with a link "Review set: {brand model},
  {n} tires, {city}, {total}"), 360 px layout, EN/ES labels. Each link carries
  `data-track="chat_set_open"` with `data-track-category="ai_chat"`,
  `data-track-position`, `data-track-set-size` and `data-track-city` — the
  declarative tracking `tech-stack.md` asks for, routed by
  `InteractionTracker` to GA4 (consent-gated) and Vercel (always), as 043's
  `city_match_open`. Clicking closes the chat.
- `src/app/ui/components/AiChat/AiChat.tsx` — render `ChatSetCards` under an
  assistant message that has cards; no auto-close for `sets`.
- `src/app/utils/analyticsEvents.ts` — `CHAT_SET_OPEN: 'chat_set_open'` (named
  for the `data-track` value),
  `AI_CHAT_SETS_SHOWN: 'ai_chat_sets_shown'`.
- `src/app/ui/sections/TireSet/TireSetPanel.tsx` — read `?set=` after mount,
  `resolvePresetSet`, open the dialog with the preset or show the notice;
  remove `set` from the URL afterwards (`history.replaceState`) so a reload
  or share does not reopen it.
- `src/app/ui/sections/TireSet/TireSetBuilder.tsx` — optional `initialSet`
  and `notice`. For new tires (041's quantity mode) the preset sets the
  quantity; the units shown and the total are those of the preset.
- Tests next to each changed file (Vitest + RTL), as the existing ones.

## Data & flow

```
Customer: "4 Michelin 225/45R17"
  → useAiChat POST /api/tires/ai-chat { messages, city?: 'Miami'|'Orlando' }
  → model → tool_use find_sets { w:225, s:45, d:17, quantity:4, brands:'Michelin' }
  → route: unknown brand? → today's message
           getCachedSizeUnits('225/45/17')     (1 query per size / 120 s)
           pickChatSets(units, {quantity, brands, condition, city, visitorCity})
           → { outcome, sets[≤3] } → toChatSetCard()
  ← { type:'sets', message (server-written, EN/ES), sets:[card…], dimensions }
  → AiChat shows the text + ChatSetCards (panel stays open)
  → tap "Review set →"  /tires/{anchorId}-michelin-225-45-17?set=a,b,c,d
     → GA4 chat_set_open {position, set_size, city}; chat closes
  → tire page renders as today (server HTML unchanged)
  → TireSetPanel (client) reads ?set=, resolvePresetSet(ids, anchor, candidates)
     → open dialog with those tires | replacement + notice | notice only
     → replaceState removes ?set=
  → shopper adds to cart in the panel (041 flow, unchanged)
```

- **Size string:** `RealSize` is `w/s/d` (`225/45/17`), built from the
  tool's numbers; non-integer or out-of-range values are rejected by zod.
- **Card shape** (no internal fields): `{ brand, model, condition, city,
  count, total, treadLabel, href }`. `href` uses the set's best-tread unit as
  the anchor (the page's photo and title are that tire's).
- **City in the card** comes from `storeCity` (VaultName read on the server,
  never returned).
- **DB load:** one query per size, shared by every chat for 120 s; no query
  per group. Tire pages keep their 60 s group cache.

## Acceptance criteria → implementation

| AC | How it's met | How it's verified/tested |
| --- | --- | --- |
| AC1 | `find_sets` → `pickChatSets` → cards with all fields + "as of now" line | route test (mocked repo + model); `ChatSetCards` test; manual on a real size |
| AC2 | `cheapestSet` uses 041 windows + `isWithinTolerance`; one card per brand+model; total = `setTotal` | unit tests on `cheapestSet` and `pickChatSets` (spread, city, dedupe, total) |
| AC3 | D1 order in `pickChatSets` with `visitorCity` from `readGuess` | unit test (Orlando first; no estimate → ascending total); hook test sends `city` |
| AC4 | `?set=` → `resolvePresetSet` → `initialSet` → `showModal()` | `TireSetPanel` test (opens with those ids and total); manual from the chat |
| AC5 | `resolvePresetSet` outcomes: exact / replaced / unavailable / ignored | unit tests (sold id, foreign id, duplicate, bad size); panel test for notices |
| AC6 | tool schema default `quantity: 4`; prompt rule | route test (no quantity → sets of 4) |
| AC7 | D4 ladder in `pickChatSets` + `buildSetsMessage` per outcome | unit tests per outcome; message tests EN/ES |
| AC8 | narrowing before grouping (brand, condition, city) | unit test; route test with an unknown brand → today's message |
| AC9 | `isSpanish` → ES message and card labels | message + card tests in ES |
| AC10 | no cart code in the chat path; prompt says nothing is reserved | guard test: `ChatSetCards`/`useAiChat` do not import the cart context; prompt guard |
| AC11 | `find_sets` without size → ask for size + 041 tip; `apply_filters` unchanged | route tests |
| AC12 | repo error, or no answer within 4 s (`Promise.race`) → today's reply + 041 tip | route tests with a throwing repo and a slow (fake-timer) repo |
| AC13 | `data-track="chat_set_open"` + `-position`, `-set-size`, `-city` on each card link; `InteractionTracker` sends GA4 (consent) + Vercel (always) | `ChatSetCards` test asserts the attributes and no personal data |
| AC14 | `SizeUnit`/card types have no warehouse or shelf fields; query never selects `Location` | repo query test; card snapshot keys test |

## Tradeoffs / alternatives

- **Model writes the list vs. the app renders cards** — D7: cards. Numbers
  from the model could drift from the inventory; this way the model never
  sees them.
- **Second model call to phrase the result** — rejected (cost; anonymous
  endpoint). The server writes a short, tested message per outcome.
- **One query per group vs. per size** — per size: a chat request touches
  every model of a size (up to 49 groups); one bounded query (≤ 400 rows)
  cached 120 s is far cheaper than 49 group queries on a pool of 10.
- **Cheapest set vs. 041's anchor-based suggestion** — the chat has no tire
  "being looked at", so there is no anchor; D1 asks for the cheapest. Same
  tread rule, different preference.
- **`?set=` read on the server** — rejected: it would change the page's HTML
  per URL (cache, canonical). Read after mount; the panel opens a beat after
  load, which is acceptable for a deliberate tap from the chat.
- **Fresh re-check of the tires before showing cards** — not needed: the
  page re-validates the exact ids on arrival (D6) and checkout re-checks
  again (041).

## Risks

- **History cap.** The route rejects any message over 2,000 characters,
  assistant turns included. The set summary is kept short (no prices) and
  tested at the worst case (3 cards with long names) so a follow-up turn is
  never rejected.
- **Model picks the wrong tool** (catalog search for a set request, or the
  reverse). Mitigation: explicit prompt rules + examples; the 041 tip still
  appears on `apply_filters` when a set is asked; route tests on the
  branches. Manual check with 6–8 phrasings in EN and ES.
- **Stale cards** (120 s cache): a tire may sell between the chat and the
  tap. Covered by `resolvePresetSet` replacement and checkout's re-check.
- **Big groups vs. the page's 60 candidates.** The tire page loads at most 60
  units of a group (by tread desc, price asc); groups can exceed 100. A set
  the chat built from unit #75 would look "sold" on the page. Mitigation:
  `pickChatSets` first trims each group to the same 60, in the same order
  (`MAX_CANDIDATES` exported and shared), so every proposed id is one the
  page can see. Unit-tested.
- **`unstable_cache` payload size**: ≤ 400 small rows per size (~60 KB) — well
  under the cache item limit.
- **Panel opening after hydration**: a short delay; focus moves into the
  dialog as in 041. Check on a 360 px phone and with VoiceOver.
- **Shared JS budget**: the chat is lazy-loaded; `ChatSetCards` lives in the
  chat chunk. The panel change is a few lines in an existing client
  component. `perf:budget` must stay green.

## Out of scope

- Adding to the cart from the chat, vehicle → size lookup, mixed or staggered
  sets, the dashboard assistant (spec "Out").
- A shareable "saved set" URL: `?set=` is removed after opening on purpose.

---

_The concrete steps live in [tasks.md](./tasks.md)._
