# Results — Build your tire set

> Feature: `041-tire-sets` · Verified locally 2026-11-10 (`next dev`, Stripe test
> mode, `CHECKOUT_TEST_MODE=true`, Chrome).

## Definition of Done

`npx tsc --noEmit` ✓ · `npm run lint` ✓ · `npm test` ✓ (1,736 tests / 134
files) · `npm run build` ✓ · `npm run perf:budget` ✓ — total client JS 630.9 KB
of 680 KB (+≈4 KB for the feature), shared First-Load unchanged (166 KB).

## Manual end to end (T23)

| AC       | Scenario (real inventory)                                                     | Observed                                                                                                                                       | ✓   |
| -------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| AC1      | Used Continental ProContact GX SSR RFT 235/50/19 (#407562, 7/32", Miami)      | "We have 12 more of this tire in Miami."; sizes 2/3/4                                                                                          | ✓   |
| AC4      | Same, set of 4                                                                | 4 distinct tires incl. the page's, each with tread/life/patch/DOT/price; total $520; "6.6–7.6/32, Δ1/32"                                        | ✓   |
| AC5      | Swap tire 2 (6.6/32 patched $125) → #263597 (6.3/32 no patch $100)            | Only ≤2/32-valid options, D6 order; total $495, range 6.3–7.6/32                                                                                | ✓   |
| AC6      | "Add set of 4 to cart"                                                        | Drawer: "Set of 4 · $495.00 · tread 6.3–7.6/32" + Remove set; button "Set in cart"; Vercel `add_to_cart` + `set_built`; lines carry city/tread | ✓   |
| AC9      | Set (Miami) + Orlando single                                                  | Pickup disabled with reason; delivery enabled                                                                                                  | ✓   |
| AC8/AC10 | Orlando tire removed                                                          | Only the 5 Miami stores; "Your tires are in Miami…"                                                                                            | ✓   |
| AC10     | Legacy line (saved in 040's test, no city) — Bridgestone #104748 is in Orlando | Browser could not pre-filter; **server rejected** pickup in Miami with code `city`; message names the tire                                      | ✓   |
| AC13     | Paid in Stripe sandbox, pickup Cutler Bay                                     | 4 tire lines + tax line ($529.65 = $495 + 7%); each line `tireCondition: Used`                                                                  | ✓   |
| AC16     | New Continental SportContact 7 295/40/19 (#498636)                            | "Buy more than one", 2/3/4, total, no unit list; "9 more … in Miami"                                                                           | ✓   |
| AC3      | Used Accelera Iota ST-68 275/40/21 (#476644, only unit)                        | No block; page as before                                                                                                                       | ✓   |
| AC14     | Orlando tire (#287220)                                                        | "15 more … in Orlando"; Orlando units only                                                                                                     | ✓   |
| AC12     | 356 px (iframe; window resize was not applied by the browser)                 | One column, no horizontal scroll, full-width controls, "No photo" placeholders                                                                  | ✓   |

Covered by unit/component tests only: AC2, AC7, AC11 (replacement offer/accept
and removal), AC15 (D6 tie-breaks), AC17 (sold tire page), AC18 (no change to
`/tires` code paths).

## Defects found during verification and fixed

1. **Production build broke**: `TireInformation` (exported from the
   `@/app/ui/sections` barrel that client components import) imported the set
   block, pulling `mssql` into the browser bundle. Fixed by passing the block as
   `setSlot` from `DetailView`; guarded by `serverBoundary.guard.test.ts`.
2. **Empty grey thumbnails** for units without a photo (52% of stock) → "No
   photo" placeholder.
3. **Missing space** before "· tread" in the cart and checkout set headers
   (read as one word by screen readers).
4. **Unhelpful city error** for legacy cart lines → the message now names the
   tire and its city.

## Round 2 — user test (2026-11-10)

| Finding                                                                  | Change                                                                                                                                                                                  |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Checkout: a single tire after a set looked like part of it               | Each set is its own `<tbody>`: green header, green left rail on every tire, green frame top and bottom; singles stay plain                                                               |
| Cart drawer: same                                                        | A set is one framed card (border, tinted header)                                                                                                                                         |
| Pickup unavailable was too quiet; the option still looked clickable       | Disabled option is greyed, dashed, `cursor-not-allowed`, no hover, "Not available for this cart"; amber alert names the cities and counts ("Miami (4) and Orlando (1)")                  |
| Cart lines and set tires should link to their own page                    | Drawer title and photo link to the detail page (and close the drawer); set tires 2–4 link to their page in a new tab so the set being built is kept. Shared helper `tireDetailHref`     |
| Two add buttons on the detail page were confusing                         | Block intro: "Add to Cart above adds only this tire. Here you add it together with matching tires…"; button "Add all N tires to cart"; "We have N more…" moved inside the block           |
| (found while fixing) Tire added alone, then the set: it stayed outside    | `addSetToCart` now moves a tire already in the cart into the set                                                                                                                         |

**Follow-up (same day):** the notice said "Orlando (1)" but not which tire.
Every cart and checkout line now shows its city (`CityTag`, city only — never
the warehouse); a set shows it once in its header. With mixed cities the
smaller city's tires are marked amber (pills sit beside the condition pill, so lines keep their height) (`oddCity`; none on an even split), and
the notice offers "Remove the Orlando tire (1)". Checked in Chrome; 1,742 tests,
build ✓, budget 632.6 KB.

**Hover cursor:** Tailwind v4 no longer gives buttons `cursor: pointer`, and
several buttons (new and older ones, e.g. "Remove the Orlando tire", "Remove
set", "Use this tire instead", the copy and dismiss buttons) showed the arrow.
Restored site-wide in `globals.css` (`@layer base`, enabled buttons, `[role=button]`
and selects), as Tailwind's upgrade guide recommends; disabled controls keep
`not-allowed`. Checked by computed style on every control of /checkout and a
detail page.

Re-checked in Chrome with #407562 (top button, then set of 4 → 4 lines, one set)
plus Orlando #287220: drawer and checkout framing, pickup alert, links resolve.
DoD: tsc ✓ · lint ✓ · 1,740 tests ✓ · build ✓ · budget 631.9 KB / 680.

**Placeholder image (after commit 3cea4ba):** set tires without a photo
showed "No image" in the cart and checkout (and "No photo" in the builder),
while single tires showed the site's generic tire image — the set engine keeps
`image: null` and never went through `transformTireData`'s fallback. Cart,
checkout and builder now fall back to `GENERIC_TIRE_IMAGE` at render time, which
also fixes lines already saved in shoppers' carts.

**Public AI chat (step 1):** the chat did not know about sets. When the last
customer turn asks for one ("4 tires", "a set", "pair", "juego", "4 llantas"…)
the server appends a short tip pointing to "Build your set" (`api/_lib/aiChat/sets.ts`),
to both searches and the size question, never to an empty result; the prompt
gains a TIRE SETS section (no availability claims, pickup city rule). Checked
against the real model on the local server in both languages. Step 2 — the chat
finding real sets — is roadmap item 044.

## Not verified / open

- **Lighthouse before/after (LCP)** was not run in this session. The block is
  streamed behind `<Suspense>` after the page content, so no LCP change is
  expected; please run PageSpeed on a detail page after deploy.
- **Screen reader** pass not done with a real reader; semantics checked via
  roles/labels in tests (radio group with legend, labelled selects, polite
  atomic total).
- **Replacement flow in the browser**: forcing a tire to sell mid-checkout needs
  a DB write; covered by route and component tests.
- Sellable rule note: the shared rule also requires remaining life ≥ 50%, which
  the 2026-11-10 analysis query did not — real set counts are somewhat lower than
  the analysis figures.

## Observations outside this feature

- The floating AI-chat bubble overlaps the bottom-right of full-width buttons on
  mobile (seen over "Add set of 4 to cart"); pre-existing.
- Money is formatted without thousands separators (`$1020.00`), consistent with
  the cart today.
