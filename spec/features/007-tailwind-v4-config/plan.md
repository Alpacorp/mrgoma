# Plan — Reconcile brand green & activate dormant Tailwind v4 tokens

> Feature: `007-tailwind-v4-config` · Based on: [spec.md](./spec.md) · Created: 2026-07-07

## Technical approach

Tailwind **v4** ignores the repo's v3-style `tailwind.config.ts` (no `@config`
opt-in), so `green-primary`, `slide-in-right` and the `xs` breakpoint never take
effect. Per the clarified decisions, we do **not** revive `green-primary`; we
**reconcile to one brand green** and **activate** the animation + breakpoint the
v4-native way (CSS `@theme`).

Three moves, all small and mechanical:

1. **Reconcile the brand green (retire `green-primary`).** All **27** usages
   (7 files) are **base accents** — `text-`, `border-`, `ring-`, `focus:ring-`,
   `focus-visible:ring-`, `focus:border-green-primary` — with **no hover
   variants**. So each maps to **`green-600`** (the canonical base; `green-700` is
   the app's hover shade and isn't needed here). Replace `green-primary` →
   `green-600` in every file, then remove the `green-primary` color from the
   config. Net effect: those controls go from **no color** (dormant → browser
   default) to the canonical brand green **#16a34a**, matching the rest of the app.
   > ⚠️ v4 **silently drops** unknown color utilities (a stray `green-primary`
   > would render with *no* color, not a build error) — so a full-tree check that
   > **zero** `green-primary` remain is essential (guard test + grep at DoD).

2. **Activate `slide-in-right` via `@theme`.** Move the keyframes + animation into
   `globals.css`: a top-level `@keyframes slide-in-right` (mirroring the existing
   `mg-spin`/`mg-attention` keyframes in that file) plus
   `--animate-slide-in-right: slide-in-right 2.5s ease-out;` inside a `@theme`
   block → generates the `animate-slide-in-right` utility the cart already uses.
   **Reduced motion is already handled**: the file's
   `@media (prefers-reduced-motion: reduce)` blanket forces
   `animation-duration: 0.01ms` on everything, so the slide is instantly tamed —
   no extra code (AC2).

3. **Activate `xs` (350px) via `@theme`.** Add `--breakpoint-xs: 350px;` to the
   `@theme` block. v4 keeps its default `sm`–`2xl` (identical to the config's
   values), so this only **adds** the smaller `xs` breakpoint. No component uses
   `xs:` yet → no visual change (AC3 is a probe check).

The `@theme` additions are placed **near the existing keyframes** (lower in
`globals.css`), not at the very top — this keeps the animation and its keyframes
together and avoids a merge collision with the P1.3 `@theme inline { --font-sans }`
block that sits right after `@import` (see Risks). v4 merges multiple `@theme`
blocks, so this is fine.

## Reuse first

- **Canonical `green-600`/`green-700`** already used in 55 files — we standardize
  onto it rather than introduce a token.
- **Existing keyframe pattern** in `globals.css` (`mg-spin`, `mg-attention` are
  top-level `@keyframes`) — `slide-in-right` follows the same shape.
- **Existing reduced-motion blanket** in `globals.css` — no new motion handling.
- **The exact keyframe/animation/breakpoint values** already in
  `tailwind.config.ts` — copied verbatim, just relocated to the mechanism v4 reads.
- No new dependencies, no new components.

## Files to add / change

- **`src/app/globals.css`** — add, next to the existing keyframes:
  ```css
  @keyframes slide-in-right {
    0%   { transform: translateX(1000px); opacity: 0; }
    100% { transform: translateX(0);      opacity: 1; }
  }
  @theme {
    --breakpoint-xs: 350px;
    --animate-slide-in-right: slide-in-right 2.5s ease-out;
  }
  ```
- **7 component files** — `green-primary` → `green-600` (every occurrence):
  - `src/app/ui/sections/TopFilters/TopFilters.tsx` (2)
  - `src/app/ui/sections/ProductCarousel/ProductCarousel.tsx` (1: base `ring` +
    `focus:ring`)
  - `src/app/ui/sections/FiltersMobile/FiltersMobile.tsx` (1)
  - `src/app/ui/sections/FilterMobileContent/FilterMobileContent.tsx` (9)
  - `src/app/ui/sections/FilterBody/FilterBody.tsx` (7)
  - `src/app/ui/components/HomeMoreFilters/HomeMoreFilters.tsx` (6)
  - `src/app/ui/components/ProductImageZoom/ProductImageZoom.tsx` (1)
- **`tailwind.config.ts`** — remove the `green-primary` color (and the now-empty
  `colors` object) and the `slide-in-right` `keyframes`/`animation` entries (now in
  `@theme`). Leave `screens`, `content`, `backgroundImage` and `plugins` untouched
  (out of scope — the dormant plugins/backgroundImage are a separate follow-up).
- **`src/tailwind-tokens.test.ts`** — **new** guard test (see below).
- **`spec/features/007-tailwind-v4-config/results.md`** — **new**, before/after
  notes + screenshots reference for the manual visual check.

## Data & flow

No APIs, params, DB, or route changes — this is styling/config only:

- `green-primary` utilities stop resolving to nothing and become `green-600`
  (`#16a34a`) — a build-time class swap.
- `@theme` registers `animate-slide-in-right` and the `xs` breakpoint at build;
  the cart drawer's existing `animate-slide-in-right` class now animates.

## Acceptance criteria → implementation

| AC  | How it's met | How it's verified/tested |
| --- | ------------ | ------------------------ |
| AC1 (green reconciled) | Replace all 27 `green-primary` → `green-600`; remove token | Guard test: **no** `green-primary` under `src/**` + `globals.css`/config assertions; DevTools computed color = `#16a34a` on a former control; grep at DoD |
| AC2 (cart animates) | `@theme --animate-slide-in-right` + `@keyframes`; reduced-motion via existing blanket | Manual: open cart → slides in; toggle "reduce motion" → no slide/instant. Guard test asserts the token + keyframes exist |
| AC3 (xs available) | `--breakpoint-xs: 350px` in `@theme` | Guard test asserts `--breakpoint-xs`; one-off probe: an `xs:` utility takes effect ≥350px, then removed |
| AC4 (no unintended change) | Only the 3 tokens touched; plugins/bg left dormant | Manual spot-check home hero, detail, checkout — unchanged |
| AC5 (font not regressed) | Font token untouched; separate `@theme` block, merges cleanly with P1.3 | After merging 006+007: body + a `font-sans` element still compute to Inter |
| AC6 (DoD) | Minimal, mechanical diff | `tsc` + `lint` + `test` + `build` green; manual desktop+mobile visual check |

## Tradeoffs / alternatives

- **Retire `green-primary` (chosen) vs redefine it to `#16a34a`.** Redefining
  keeps a redundant near-duplicate token that invites future drift; retiring gives
  one canonical brand green — the root-cause fix. (User-confirmed.)
- **`@theme` migration (chosen) vs `@config` bridge.** `@config` is one line but
  would also revive the *out-of-scope* dormant config (plugins, backgroundImage,
  the full `screens` override) all at once — a bigger, riskier change. `@theme`
  activates exactly the two intended tokens and is v4-idiomatic. (User-confirmed.)
- **`green-600` for all (chosen) vs per-site green-600/700 mapping.** Every usage
  is a base accent (no hover), so `green-600` is correct everywhere; introducing
  `green-700` anywhere would be inventing a hover state that didn't exist.

## Risks

- **Missed `green-primary` renders colorless** (v4 drops unknown utilities
  silently, no build error). Mitigation: guard test walks `src/**` and fails on any
  remaining `green-primary`; grep at DoD. (The guard test must **exclude
  `*.test.*`** from its scan — it contains the literal string itself.)
- **Merge conflict with P1.3's `@theme` block in `globals.css`.** Both features add
  `@theme` to the same file. Mitigation: place 007's block lower (by the
  keyframes), away from 006's top-of-file `@theme inline`; v4 merges multiple
  `@theme` blocks, so the resolved file just has both. Trivial to reconcile.
- **Reduced-motion / accessibility.** The slide honours the existing blanket; the
  green-600 focus rings match the app's established (already-accessible) accent, so
  focus visibility is preserved/improved.
- **This branch is off `main` (no P1.3).** Expected; 006 merges first, then 007.
  AC5 is verified post-merge.

## Out of scope

- The other dormant config parts — plugins (`forms`, `typography`,
  `aspect-ratio`) and `backgroundImage` (`gradient-radial`/`gradient-conic`) →
  **separate follow-up** (roadmap backlog).
- Any reshade/redesign of the brand green; new breakpoints or animations.

---

_The concrete steps live in [tasks.md](./tasks.md)._
