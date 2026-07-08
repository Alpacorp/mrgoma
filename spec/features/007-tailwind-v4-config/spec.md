# Spec — Reconcile brand green & activate dormant Tailwind v4 tokens

> Feature: `007-tailwind-v4-config` · Status: Draft · Created: 2026-07-07
> Roadmap: Backlog (Tailwind v4 config activation) · Branch: `feat/007-tailwind-v4-config`

## Why — problem & value

The project migrated to **Tailwind v4**, but its custom design tokens still live
in a **v3-style `tailwind.config.ts`**. In v4 that file is **not auto-loaded** —
it only takes effect if the CSS opts in (there is no such opt-in today). So the
tokens are **silently inactive in production right now**, and the UI is rendering
without design details it was built to have. This slice fixes the two that have
visible impact, and reconciles a brand-color inconsistency it exposed:

- **`green-primary` (#1dbd5b) — a redundant, dormant near-duplicate of the brand
  green.** It's referenced on focus rings, checkboxes and accents in **27 places
  across 7 files** (filters, cart, product carousel, image zoom, home "more
  filters"), but because the token is dormant those controls fall back to
  **browser defaults** (no brand green). Meanwhile the **canonical** brand green,
  Tailwind's `green-600`/`green-700`, is used in **144 places across 55 files**
  (CTAs, buttons, badges — everywhere). Rather than revive a second, slightly
  different green (#1dbd5b vs `green-600`), we **reconcile to one brand green**:
  replace the `green-primary` usages with `green-600`/`green-700` and **retire the
  token** — killing the redundancy that caused the bug.
- **`slide-in-right`** — the **cart drawer's slide-in animation** — never runs, so
  the cart just appears abruptly. We **activate** it (migrate to CSS `@theme`).
- **`xs` (350px) breakpoint** — defined but **not referenced** anywhere, so it has
  no visual effect. We **activate** it (migrate to `@theme`) for config/framework
  consistency; it's a no-op on screen.

This is a **correctness / brand-consistency** fix, not a redesign: it makes the
UI look and behave the way the code already intends, with a single canonical brand
green. It serves the mission's **"superior digital experience"** and **"reuse
before creating"**. Found while shipping P1.3 (`006-fonts-cls`).

## User stories

- As a **customer**, I want the store's controls (filters, checkboxes, cart) to
  show the **brand green** and the cart to **slide in smoothly**, so the site
  feels polished and intentional, not half-styled.
- As a **maintainer**, I want the project's design tokens to **actually apply**
  under Tailwind v4, so what's in the config is the truth and new UI can rely on
  `green-primary` and friends working.

## Scope

- **In:**
  - **Reconcile the brand green:** replace the 29 `green-primary` usages (7 files)
    with the canonical `green-600` (base) / `green-700` (hover/active) and **remove
    the `green-primary` token**. Result: one brand green across the app.
  - **Activate `slide-in-right`** and the **`xs` (350px)** breakpoint the
    Tailwind-v4 way (migrate to CSS `@theme` in `globals.css`).
  - No visual change **other than**: the cart now slides in, and the ~7
    green-primary controls now show the canonical brand green (slightly darker
    #16a34a instead of the never-rendered #1dbd5b).
  - Preserve everything already working, including the **P1.3 font token**
    (`--font-sans` / Inter) once both changes are on `main`.
  - Verify visually across the affected screens (desktop + mobile): filters, cart,
    product carousel, image zoom, home "more filters".
- **Out:**
  - Any redesign, new colors, new components, new breakpoints or new animations
    beyond what already exists in the code.
  - **The other dormant parts of `tailwind.config.ts`** — the plugins
    (`@tailwindcss/forms`, `typography`, `aspect-ratio`) and the `backgroundImage`
    utilities (`gradient-radial`, `gradient-conic`) are ignored by v4 for the same
    reason. They are **out of this slice** (tracked as a follow-up); this feature
    only touches the brand green, `slide-in-right` and `xs`, and must not change
    their current (dormant) behaviour.

## Functional requirements

- **FR1:** Every `green-primary` utility (`text-`, `bg-`, `border-`, `ring-`,
  `focus:ring-`, etc.) is replaced by the canonical `green-600` (base) or
  `green-700` (hover/active) equivalent, and the `green-primary` token is removed.
  No `green-primary` reference remains in the codebase.
- **FR2:** The affected ~7 controls now render the canonical brand green
  (`green-600`/`green-700`), matching the rest of the app.
- **FR3:** The cart drawer plays the **`slide-in-right`** animation when it opens
  (the `animate-slide-in-right` utility resolves to the defined keyframes),
  honouring `prefers-reduced-motion`.
- **FR4:** The `xs` (350px) breakpoint is available to `xs:` utilities (nothing
  references it yet), so the config and the framework agree.
- **FR5:** No other visual or behavioural change — screens that did **not** use
  these tokens look exactly as before; the dormant plugins/`backgroundImage`
  remain untouched (still out of scope).
- **FR6:** The change must **not regress** the P1.3 Inter font token; once both are
  merged, the document still renders in Inter and `font-sans` still resolves to
  Inter.
- **FR7:** `slide-in-right` and `xs` are wired the **Tailwind v4-supported way**
  (CSS `@theme`), so they are no longer silently ignored.

## Acceptance criteria (testable)

- [ ] **AC1 (green reconciled):** No `green-primary` reference remains anywhere in
      the codebase (grep returns nothing outside spec docs), and the token is gone
      from the config. On a page that used it (e.g. `/tires` filters or the home
      "more filters" panel), the control's computed color now **matches a sibling
      `green-600` element** on the same page — the canonical brand green (Tailwind
      v4 renders it in OKLCH, ≈ #16a34a; the relative match is authoritative, not
      the exact hex string DevTools shows).
- [ ] **AC2 (cart animates):** Opening the cart drawer runs the slide-in
      animation (the element has a resolved `animation` using the
      `slide-in-right` keyframes), respecting `prefers-reduced-motion`.
- [ ] **AC3 (xs available):** An `xs:`-prefixed utility applied to a probe element
      takes effect at ≥ 350px viewport width (verified once, then the probe is
      removed) — or, equivalently, the generated CSS includes the `xs` breakpoint.
- [ ] **AC4 (no unintended change):** Screens that don't reference these tokens are
      visually unchanged (spot-check home hero, detail, checkout); the dormant
      plugins/`backgroundImage` behaviour is unchanged by this slice.
- [ ] **AC5 (font not regressed):** With P1.3 present, body text and a `font-sans`
      element still compute to **Inter**; this change did not touch the font token.
- [ ] **AC6 (no regression / DoD):** `tsc --noEmit`, `lint`, `test`, `build` are
      green; manual visual check across the affected screens on desktop **and**
      mobile confirms the canonical brand green + cart animation appear and nothing
      else shifts.

## Non-functional / constraints

- **Brand/experience:** restores intended brand look; must not introduce layout
  shift (CLS) or jank — the cart animation must honour `prefers-reduced-motion`
  (the app already tames looping animations under that setting).
- **Accessibility:** brand-green focus rings must keep a visible, sufficiently
  contrasting focus indicator (WCAG 2.1 AA) — activating them should improve, not
  harm, focus visibility.
- **Reuse before creating:** use the tokens already defined; do not duplicate or
  rename them. No new dependencies.
- **Mobile-first:** verified on a phone viewport (filters and cart are
  mobile-heavy surfaces).

## Resolved clarifications

- **Restore intent = yes, all three.** The dormant tokens should take effect (the
  cart slide + a real brand green on the affected controls); the current
  default-look is not the desired end-state. `xs` is included for consistency
  though it renders no change.
- **Brand green = reconcile to one, retire `green-primary`.** `green-600`/`green-700`
  is the canonical brand green (144 uses / 55 files) vs `green-primary`'s 27/7. We
  replace the `green-primary` usages with `green-600`/`green-700` and remove the
  token — one brand green, no near-duplicate. (#1dbd5b is not revived.)
- **Approach = migrate to CSS `@theme`** (v4-idiomatic), not an `@config` bridge:
  `slide-in-right` (keyframes + `--animate-*`) and `xs` (`--breakpoint-xs`) move
  into `globals.css` `@theme`, alongside the P1.3 `--font-sans`.
- **Known related follow-up (out of scope):** the same config's plugins
  (`forms`, `typography`, `aspect-ratio`) and `backgroundImage` utilities are also
  dormant under v4 — to be handled separately so this slice stays small and safe.

---

_The WHAT and WHY only. The HOW lives in [plan.md](./plan.md)._
