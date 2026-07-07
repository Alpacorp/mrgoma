# Spec — Font loading without layout shift (Inter)

> Feature: `006-fonts-cls` · Status: Draft · Created: 2026-07-07
> Roadmap: P1.3 · Branch: `feat/006-fonts-cls`

## Why — problem & value

Type is the first thing a visitor reads, and how the font loads directly affects
two of our success metrics: **CLS** (a late-swapping web font reflows the page)
and **perceived speed** (a flash of invisible or unstyled text reads as "slow"
or "broken"). Our mission makes **performance a feature** and sets a hard budget
of **CLS < 0.1** on `/`, `/tires` and detail.

Today the site loads **Inter** through `next/font`, which already does most of
the right things automatically — but the setup is **implicit and partially
wired**: nothing declares the swap behaviour on purpose, and the font is applied
only through the `<body>` class, not through the app's shared "sans" design
token. That leaves a gap where some text can render in the **system font instead
of Inter** (an inconsistency / flash), and it leaves our font-loading correctness
resting on undocumented defaults instead of an explicit, verified decision.

This phase **verifies and hardens** font loading so it is correct on purpose and
proven not to shift layout — **no redesign, same typeface**. It is the P1.3 slice
of Track 1 (Performance / Core Web Vitals).

## User stories

- As a **visitor on a slow connection**, I want text to appear immediately and
  never disappear or jump when the web font finishes loading, so that the page
  feels fast and stable.
- As a **mobile visitor**, I want the whole page to render in **one consistent
  typeface**, so that nothing looks half-styled or flashes from one font to
  another.
- As a **maintainer**, I want the site's font to be defined as a single shared
  token that every component inherits, so that new UI is automatically consistent
  and we never regress into mixed fonts.

## Scope

- **In:**
  - Verify and make **explicit** the `next/font` (Inter) loading behaviour on the
    root layout so there is no font-driven layout shift and no flash of invisible
    text (FOIT) or unstyled text (FOUT).
  - Ensure the font is **preloaded** and uses an **automatic size-adjusted
    fallback** (a system fallback metric-matched to Inter) so the swap does not
    move surrounding content.
  - Wire Inter as the app's **shared sans "design token"** so utility-driven text
    (the framework's `sans` font utilities) resolves to Inter — not the system
    stack — eliminating mixed-font inconsistency.
  - Keep the **latin subset** (US English-only market).
  - Confirm behaviour on the three key routes: home, `/tires`, detail.
- **Out:**
  - Any change of typeface, weights on screen, sizes, spacing or visual design.
  - Adding new fonts or new weights beyond what the UI already uses.
  - Non-Latin subsets / i18n (English-only for now).
  - Broader CLS work from other sources (badges, carousels, media) — that is
    **P1.4**, a separate phase.

## Functional requirements

- **FR1:** Text on every key route must be **visible from first paint** (no
  invisible-text period): the fallback shows immediately and Inter swaps in when
  ready.
- **FR2:** When Inter finishes loading and swaps in, **surrounding layout must not
  move** — the fallback must be metric-matched (size-adjusted) so line heights
  and widths are effectively unchanged.
- **FR3:** All body/UI text must render in **Inter** once loaded, including text
  styled via the framework's `sans` font utility — no element may fall back to
  the system font while Inter is available.
- **FR4:** The font loading behaviour (swap, preload, fallback adjustment, subset)
  must be **explicit in the codebase**, not left to undocumented defaults, so the
  decision is reviewable and regression-resistant.
- **FR5:** The primary font used above the fold must be **preloaded** so it is
  requested as early as possible.
- **FR6:** No visual or behavioural change beyond font-loading correctness; the
  rendered design must look the same as before (same typeface).

## Acceptance criteria (testable)

- [ ] **AC1 (no CLS from fonts):** In a lab audit (Lighthouse/PageSpeed) of `/`,
      `/tires` and a detail page, **CLS stays < 0.1** and no layout-shift entry is
      attributed to a font swap (before/after recorded in `results.md`).
- [ ] **AC2 (no FOIT):** With the network throttled and cache disabled, text is
      **visible during the entire load** (fallback first), never blank while the
      font downloads.
- [ ] **AC3 (no FOUT jump):** When Inter swaps in, there is **no perceptible
      reflow** of the text block or the elements around it (visual check + the
      CLS number from AC1).
- [ ] **AC4 (single typeface):** On each key route, **all** visible body/UI text
      computes to Inter (with the intended system fallback in its stack) — no
      element renders in the default system sans while Inter is available,
      including elements using the `sans` font utility. **Exception:** the
      reference-code / SKU snippets in checkout intentionally use a monospace
      (`font-mono`) system stack; those are excluded and stay monospace (no web
      font, no loading/CLS concern).
- [ ] **AC5 (explicit config):** The font setup declares swap, preload, the
      size-adjusted fallback and the latin subset **explicitly**, and exposes
      Inter as the shared sans token; this is visible in review, not inferred.
- [ ] **AC6 (no regression / DoD):** `tsc --noEmit`, `lint`, `test` and `build`
      are green; the manual check confirms the site looks identical (same font,
      no flashes) on desktop and mobile.

## Non-functional / constraints

- **Performance:** contributes to the Track 1 budget — CLS < 0.1 on the three key
  routes; must not increase blocking time or add render-blocking font requests.
- **Accessibility:** text must remain readable throughout load (no invisible
  text); respects existing `prefers-reduced-motion` behaviour (unrelated but must
  not regress).
- **Mobile-first:** verified on a phone viewport; the fallback must not cause a
  visible jump on slower mobile connections.
- **Reuse before creating:** harden the existing `next/font` Inter setup and the
  existing styling system — do not introduce a new font pipeline or self-hosted
  font files unless a clarification says otherwise.
- **English-only:** latin subset only.

## Resolved clarifications

- **Only one web font.** Inter (`next/font`) is the sole loaded font. The
  checkout reference-code / SKU snippets use `font-mono` (system monospace, no web
  font) **on purpose** and stay monospace — excluded from AC4 (see exception
  there). `opengraph-image.tsx` hardcodes `system-ui`, but that is the edge-
  rendered social image, not a page, and is out of scope. → No second family to
  harden in this slice.
- **`latin` subset is sufficient.** English-only US market; brand/UI text is ASCII
  (accented Latin, if any, is within the `latin` subset). No extra subset needed.
- **CLS evidence source.** The authoritative before/after numbers come from
  **post-deploy PageSpeed** on the live URLs (same as 002/003/005). You run PSI
  and provide the numbers; the assistant records them in `results.md`.

---

_The WHAT and WHY only. The HOW lives in [plan.md](./plan.md)._
