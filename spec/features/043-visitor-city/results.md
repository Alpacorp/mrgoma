# Results — Shop by your city (Miami or Orlando)

> Feature: `043-visitor-city` · Verified locally 2026-11-10 (`next dev`, Chrome,
> by the agent end to end; Vercel geo headers simulated with `curl -H` and a
> stored estimate in the browser).

## Definition of Done

`npx tsc --noEmit` ✓ · `npm run lint` ✓ · `npm test` ✓ · `npm run build` ✓ ·
`npm run perf:budget` ✓ — shared First-Load 166.0 KB of 180 (unchanged).

## What shipped (after D8)

- `/api/visitor-city` (only reader of `x-vercel-ip-*`, guard-tested) → city
  within 60 miles of a store, kept in the browser 1 day; never coordinates.
- Tire page: "Located in {city}" for everyone; "· N like this in {visitor
  city} →" when the visitor's estimated city differs and a match exists.
- Checkout: nearest store preselected only when the cart's single city equals
  the estimated city.
- Privacy policy: "Your city" item.

## Also in this branch (owner's review of 041 and 043, 2026-11-10)

1. **Checkout asks in order.** No fulfillment method preselected; the state
   selector appears only with delivery; with pickup, the store selector — or,
   for a mixed-city cart, the notice with "Remove the {city} tires". Pickup is
   selectable even with mixed cities, so the shopper reaches the explanation;
   payment stays disabled until it is resolved.
2. **"Build your set" moved to a panel.** The page shows a short card ("Need
   2–4 tires? We have N more like this in {city} · from $X for 2 · Build a set
   →"); the builder opens in a native modal `<dialog>` — right-side panel from
   640 px, bottom sheet on phones — with the total and the add button pinned to
   its bottom edge. Adding closes the panel, then the cart drawer opens. The
   tire's Description and More Details now follow the card directly.
3. **Visible city removed (spec D8).**

4. **Round 4 fixes (same day):**
   - The set builder shows the **size on every tire** ("235/50/19 · 7/32 · …").
   - **Cart drawer:** only the panel slides; the dark backdrop fades in place
     (it used to travel left with the whole layer). Measured: backdrop `left`
     stays 0 while its opacity goes 0 → 0.4; panel slides 2472 → 1472 px.
   - **Tire page opened scrolled to the footer** when coming back to a tire
     already in the router cache: Next.js re-reveals the cached page and
     measures it before it has a box, so no segment scrolls (reproduced 2/3).
     `ScrollToTopOnOpen` opens the page at the top except on back/forward.
     After: 4/4 at 0; back to `/tires` still restores its position (1500 px).
   - **Header grew and shrank in a loop** near the top: 89 → 65 px when compact
     and a single 12 px threshold, so scroll anchoring re-crossed it. Now two
     thresholds (compact after 40 px, expand below 4 px — a 36 px gap, larger
     than the 24 px change). Scrolling up 1 px at a time: one change, settles.

## Manual checks

| Check | Observed | ✓ |
| --- | --- | --- |
| `/api/visitor-city` with Hialeah / Kissimmee / Tampa coords | Miami + Hialeah store / Orlando + West Colonial / no city | ✓ |
| Tire page HTML with and without geo headers | Identical except Next's per-request dev id | ✓ |
| #287220 (Orlando) with a Miami estimate | "Located in Orlando · 45 like this in Miami →" | ✓ |
| #407562 (Miami) with an Orlando estimate | "Located in Miami" only (no Orlando match: `count: 0`) | ✓ |
| Header | No city chip or strip on desktop or 360 px; logo full size | ✓ |
| Set card → panel (desktop) | 448 px panel, no horizontal overflow, focus on the chosen size, real Esc closes, focus back on "Build a set" | ✓ |
| Add set from the panel | Panel closes, cart drawer opens with the set grouped | ✓ |
| Panel on 360 px | Bottom sheet 90 dvh, list scrolls, total + button pinned and visible | ✓ |
| Checkout, mixed cart | Nothing chosen: no state, no notice, pay disabled → Pickup: notice, no store, pay disabled → Delivery: state, no notice | ✓ |
| Checkout, remove Orlando tire | Store selector with the 5 Miami stores; Orlando estimate → nothing preselected | ✓ |
| Checkout, Miami estimate, Miami cart | Hialeah preselected, pay enabled | ✓ |

The owner's local cart was saved before these checks and restored after.

## Not verified / open

- Real Vercel geo headers need a Preview deploy (push by the user).
- Real screen reader pass (VoiceOver/TalkBack).
- The cart drawer still uses the custom `Dialog` (div, manual focus trap,
  `overflow: hidden` on `body`); moving it to native `<dialog>` like the set
  panel is a suggested follow-up.
