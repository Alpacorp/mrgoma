# Spec — Retire the dead Tailwind config & unused plugin deps

> Feature: `010-tailwind-v4-plugins` · Status: Draft · Created: 2026-07-08
> Roadmap: Backlog (Tailwind v4 config activation) · Branch: `feat/010-tailwind-v4-plugins`

## Why — problem & value

Feature `007` established that **Tailwind v4 ignores `tailwind.config.ts`** (there's
no `@config` directive), and migrated the tokens that mattered into CSS `@theme`.
It left the config's **plugins** and `backgroundImage` utilities as a noted
follow-up, on the assumption they were dormant *features* worth reviving.

Investigation shows they are **not** — there is nothing to activate:

- **`@tailwindcss/forms`** — no `form-*` classes are used anywhere; inputs are
  styled manually and render correctly. Activating it would apply the plugin's
  global input reset and **restyle every input across the app** — a regression, not
  a fix.
- **`@tailwindcss/aspect-ratio`** — `aspect-*` utilities are used, but they work
  **natively in Tailwind v4**; the plugin is a v3 relic (redundant).
- **`@tailwindcss/typography`** — `prose` appears once (the guides article wrapper)
  but is **neutralized**: all five content blocks on that page are `not-prose`
  (styled manually). Activating it adds CSS weight for ~zero visible effect.
- **`gradient-radial` / `gradient-conic`** (`backgroundImage`) — used in **no**
  component.
- **`tailwindcss-animate`** — a dependency that is imported **nowhere** and isn't
  even listed in the config's `plugins` (fully dead).

So the honest resolution is **cleanup, not activation**: the dormant config is
**dead code plus an inaccurate constitution** (`tech-stack.md` still lists these as
active plugins). Removing it reduces confusion and dependency surface with **zero
visual or behavioural change**. This serves the mission's **"reuse before
creating"** and **small, verifiable changes** principles, and closes the backlog's
"Tailwind v4 config activation" item truthfully.

## User stories

- As a **maintainer**, I want the repo to contain only config and dependencies
  that actually do something, so I'm not misled by a dead `tailwind.config.ts` or
  by docs that claim plugins are active when they aren't.
- As a **new contributor**, I want the constitution (`tech-stack.md`) to describe
  the real styling setup (Tailwind v4 with CSS `@theme`, no v3 plugins), so I don't
  waste time editing a file that has no effect.

## Scope

- **In:**
  - **Delete `tailwind.config.ts`** — Tailwind v4 does not load it (no `@config`);
    only comments reference it, no code imports it.
  - **Remove the four unused dependencies** from `package.json`:
    `@tailwindcss/forms`, `@tailwindcss/typography`, `@tailwindcss/aspect-ratio`,
    `tailwindcss-animate` (and update the lockfile).
  - **Correct `tech-stack.md`** — describe the real setup (Tailwind v4 via
    `@tailwindcss/postcss` + `@import "tailwindcss"` + CSS `@theme`; no v3 plugins),
    removing the stale "plugins forms, typography, aspect-ratio, tailwindcss-animate"
    claim.
  - **Tidy stale comments** that reference `tailwind.config.ts` as the place tokens
    live (e.g. in `layout.tsx`, now that the `sans` token is in `@theme`).
  - **Mark the roadmap** "Tailwind v4 config activation" backlog item **resolved**
    (`007` migrated the live tokens; this closes the plugin/backgroundImage tail).
- **Out:**
  - Any **visual change** — this must look identical before and after.
  - **Activating** any plugin (forms/typography/aspect-ratio) — explicitly rejected
    by the investigation.
  - Restyling the **guides** page to actually use `prose` (removing `not-prose`) —
    that is a separate UI improvement, not this cleanup.
  - Keeping/removing **`@tailwindcss/postcss`** — it stays (it's the v4 engine).

## Functional requirements

- **FR1:** `tailwind.config.ts` is removed and the app builds and styles
  identically (v4 never used it).
- **FR2:** `@tailwindcss/forms`, `@tailwindcss/typography`, `@tailwindcss/aspect-ratio`
  and `tailwindcss-animate` are removed from `package.json` and the lockfile;
  `@tailwindcss/postcss` remains.
- **FR3:** No visual or behavioural change on any page (home, `/tires`, detail,
  guides, checkout, dashboard) — styling is unchanged.
- **FR4:** `tech-stack.md` accurately describes the Tailwind v4 setup with no
  reference to active v3 plugins; stale comments referencing the config are fixed.
- **FR5:** The roadmap's dormant-config backlog item is marked resolved.

## Acceptance criteria (testable)

- [ ] **AC1 (config gone, build green):** With `tailwind.config.ts` deleted,
      `npm run build` compiles and the generated CSS/utilities are unchanged
      (e.g. `aspect-*`, `green-600`, `font-sans`, the cart `slide-in-right`
      animation all still work).
- [ ] **AC2 (deps removed):** The four packages are absent from `package.json` and
      the lockfile; `npm install` succeeds; `tsc`, `lint`, `test` stay green.
- [ ] **AC3 (no visual change):** A manual pass on home, `/tires`, detail, guides
      and a form-bearing page (checkout / filters) shows the UI is **identical** to
      before — inputs, checkboxes, aspect-ratio media and guide articles all look
      the same.
- [ ] **AC4 (docs accurate):** `tech-stack.md` no longer lists the v3 plugins as
      active and describes the real `@theme`-based setup; comments referencing
      `tailwind.config.ts` are corrected; the roadmap item is marked resolved.
- [ ] **AC5 (DoD):** `npx tsc --noEmit` + `npm run lint` + `npm test` +
      `npm run build` all green.

## Non-functional / constraints

- **Zero regression:** the guiding constraint is that nothing changes visually or
  behaviourally; this is pure cleanup.
- **Reuse before creating:** removes dead code/deps; adds nothing.
- **Small, verifiable:** a handful of files, verified by an unchanged build + a
  visual spot-check.

## Open questions

_None — the investigation resolved the approach (cleanup, zero visual change) and
the owner confirmed it. Ready for `/plan`._

---

_The WHAT and WHY only. The HOW lives in [plan.md](./plan.md)._
