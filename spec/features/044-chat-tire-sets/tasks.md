# Tasks — Tire sets in the AI chat

> Feature: `044-chat-tire-sets` · Based on: [plan.md](./plan.md) · Created: 2026-11-10

Each task is one sitting, leaves the build green, and names its check.

## Engine and data (pure first)

- [x] **T1** — `cheapestSet(units, size)` in the 041 engine: every 2/32"
      window, the `size` cheapest units (ties: unpatched, then id); `null` when
      none · files: `src/app/utils/tireSets.ts` (+ `tireSets.test.ts`) ·
      check: spread ≤ 2/32" always; cheapest window wins; 6–8–10 overshoot
      case; units without tread excluded; new tires with no tread use
      `NEW_TIRE_TREAD`.
- [x] **T2** — Size query: `buildSizeUnitsQuery()`, `fetchSizeUnitsFresh`,
      `getCachedSizeUnits(size)` (TOP 400, 120 s, keyed by size, lazy DB
      import), `SizeUnit` type; export `MAX_CANDIDATES` · files:
      `src/repositories/tireSetsRepository.ts` (+ test) · check: query binds
      `@size`, uses `STOREFRONT_SELLABLE_WHERE`, selects Brand/Model2/
      KindSaleId but never `Location`; `SizeUnit` has no `VaultName`.
- [x] **T3** — `pickChatSets(units, request)` + `toChatSetCard()`: group by
      041 group, trim each group to the page's 60 (tread desc, price asc),
      `cheapestSet` per group, narrowing (brand, condition, city), D1 order
      (visitor city first, then total; one card per brand+model; ≤ 3), D4
      ladder → `{ outcome, sets }` · files: `src/app/utils/chatSets.ts`
      (+ `chatSets.test.ts`, `chatSets.guard.test.ts`) · check: AC2, AC3,
      AC7, AC8 cases; the module imports only types from the repository
      (guard); card keys are
      only `brand, model, condition, city, count, total, treadLabel, href`;
      `href` = best-tread unit + `?set=` ids.
- [x] **T4** — `resolvePresetSet(ids, anchor, candidates)` → `exact |
      replaced | unavailable | ignored` · files: `src/app/utils/chatSets.ts`
      (+ test) · check: exact ids; a missing id replaced via
      `pickReplacement`; no valid set → `unavailable`; foreign id, duplicate,
      < 2 or > 4 ids, anchor not in list → `ignored`.

## Chat server

- [x] **T5** — Messages: `buildSetsMessage(spanish, outcome, request)` (per
      outcome, with the "prices and stock as of now; confirm on the page"
      line) and `summarizeSetsForHistory(cards)` · files:
      `src/app/api/_lib/aiChat/sets.ts` (+ `sets.test.ts`) · check: EN/ES for
      `found`, `other_city` (pickup/delivery note), `smaller`, `none`
      (catalog link for the size + WhatsApp); no warehouse words; summary has
      no prices or treads and message + summary ≤ 2,000 characters with 3
      long-named cards.
- [x] **T6** — `find_sets` tool + `sets` branch in the route: zod for
      `w/s/d`, `quantity` (default 4), brands, condition, city; optional body
      `city` hint; guards (no full size → today's reply + 041 tip; unknown
      brand → today's message; repo error or no answer within 4 s → today's
      reply + tip) · files:
      `src/app/api/tires/ai-chat/route.ts`, `route.test.ts` · check: AC1, AC6,
      AC8, AC11, AC12 with mocked model and repo (throwing and slow, fake
      timers); `apply_filters` tests
      unchanged.
- [x] **T7** — Prompt: rewrite "TIRE SETS" (use `find_sets` when a set is
      asked and the size is known; never state counts or prices; nothing is
      reserved; quantity default 4) · files: `route.ts`,
      `prompt.guard.test.ts` · check: guard asserts the new rules and that
      the cart is never mentioned as something the chat can do (AC10).

## Chat client

- [x] **T8** — Analytics events `AI_CHAT_SETS_SHOWN`, `CHAT_SET_OPEN` ·
      files: `src/app/utils/analyticsEvents.ts` · check: tsc; names follow
      the existing snake_case.
- [x] **T9** — `useAiChat`: `type: 'sets'`, cards on the message, history =
      message + summary (≤ 2,000 chars), `city` from `readGuess()` in the body, no navigation
      for `sets`, `ai_chat_sets_shown` / `ai_chat_no_results` tracking ·
      files: `hooks/useAiChat.ts` (+ test) · check: body carries `city` only
      when stored; cards kept; router not called.
- [x] **T10** — `ChatSetCards` (cards, EN/ES labels, accessible link names,
      360 px) and mount in `AiChat` under the message; no auto-close for
      `sets`; each link `data-track="chat_set_open"` + `data-track-category`,
      `-position`, `-set-size`, `-city`; click closes the chat · files: `ChatSetCards.tsx` (+ test), `AiChat.tsx` · research:
      `modern-web-guidance` (cards in a chat log, link vs button) before
      building · check: AC1 fields, AC9 labels, AC13 attributes (no personal data); guard: no
      cart import in the chat (AC10).

## Tire page

- [x] **T11** — `TireSetBuilder`: optional `initialSet` (starting set; size
      change returns to the suggestion) and `notice` · files:
      `TireSetBuilder.tsx` (+ test) · check: shows exactly the preset and its
      total; changing size drops it; swaps still work; new tires (quantity
      mode) show the preset's quantity and total.
- [x] **T12** — `TireSetPanel`: read `?set=` after mount →
      `resolvePresetSet` → open with preset / replacement + notice / notice on
      the card; `replaceState` removes `set` · files: `TireSetPanel.tsx`
      (+ test) · check: AC4, AC5; without `?set=` behaves exactly as today;
      server HTML unchanged (no `searchParams`).

## Done

- [x] **T-DoD** — `tsc` + lint + tests + build + `perf:budget`; manual in
      Chrome by the agent: 6–8 phrasings EN/ES (set with size, without size,
      without number, brand + city, a size with no set of 4, catalog search
      unaffected), tap a card → panel with the same tires and total, a
      tampered `?set=`, 360 px and keyboard/VoiceOver pass on the cards and
      the panel; no warehouse or shelf text anywhere · check: `results.md`.

## Traceability

| Task | AC |
| ---- | -- |
| T1 | AC2 |
| T2 | AC14 |
| T3 | AC1, AC2, AC3, AC7, AC8, AC14 |
| T4 | AC4, AC5 |
| T5 | AC7, AC9, AC14 |
| T6 | AC1, AC6, AC8, AC11, AC12 |
| T7 | AC10, AC11 |
| T8 | AC13 |
| T9 | AC3, AC10 |
| T10 | AC1, AC9, AC10, AC13 |
| T11 | AC4, AC5 |
| T12 | AC4, AC5 |
| T-DoD | all (AC1–AC14) |
