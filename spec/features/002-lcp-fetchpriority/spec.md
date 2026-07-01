# Spec — High fetch priority for the LCP element

> Feature: `002-lcp-fetchpriority` · Status: Draft · Created: 2026-06-30
> Roadmap: P1.1 · Branch: `feat/002-lcp-fetchpriority`

## Why — problem & value

The baseline ([001-perf-baseline](../001-perf-baseline/baseline.md)) confirmed that
on **all three key routes** the Largest Contentful Paint element is **not fetched
with high priority**, and on the detail page it is even `loading="lazy"`. That
makes the browser discover and download the most important pixels late, delaying
LCP (4.5 s on mobile for Home and Detail; 3.2 s on `/tires`).

Applying **`fetchpriority=high`** to each route's LCP resource (and making the
detail image eager instead of lazy) is the **cheapest, highest-leverage,
cross-cutting** win in Track 1: a small, low-risk change that tells the browser to
race the LCP resource to the top of the queue. It moves every route toward the
LCP < 2.5 s target and unblocks the "LCP discovery" audits that currently fail.

This is a first, surgical step. It does **not** fix the deeper causes (the detail
image being client-fetched → P1.7, the payload sizes → P1.2); those are separate
phases.

## User stories

- As a **visitor on a phone**, I want the main image/hero to appear sooner, so the
  page feels fast and I trust it.
- As the **team**, we want the "LCP request discovery" audits to pass on every
  route, so we lock in the easy LCP gains before the structural work.

## Scope

- **In:** ensure the **LCP resource of each route is fetched at high priority**:
  - **Home `/`** — the hero `<video>` **poster** (`banner-hero.webp`) is the LCP;
    make that resource high-priority so it paints sooner.
  - **`/tires`** — the hero background image (`bg-header.svg`) is the LCP; mark it
    high-priority.
  - **Detail `/tires/[slug]`** — the **main product image** is the LCP; it must be
    **eager (not `loading="lazy"`) and high-priority**.
  - The **hero video** and the **3D animations** stay untouched (brand constraint).
- **Out:**
  - Server-rendering the detail product fetch so the image is discoverable in the
    initial HTML (**P1.7**).
  - Compressing/optimizing image & video payloads (**P1.2**).
  - Reducing the 3D selector's main-thread cost / TBT (**P1.5/P1.6**).
  - Any CLS work (**P1.4**), accessibility work, or changes to other images.

## Functional requirements

- **FR1:** On each of the three routes, the LCP resource is requested with **high
  fetch priority** (via the mechanism appropriate to that element type).
- **FR2:** The detail main product image is **not** `loading="lazy"` — it loads
  eagerly as the LCP.
- **FR3:** Exactly one LCP resource per route is prioritized (avoid marking many
  images high-priority, which would dilute the effect).
- **FR4:** No visual or layout change; the hero video and 3D selector remain and
  behave as before.
- **FR5:** Follow `tech-stack.md` conventions (e.g. `next/image` `priority`) and
  keep changes confined to the relevant components.

## Acceptance criteria (testable)

- [ ] **AC1:** After the change, PSI's **"LCP request discovery"** audit shows
  **`fetchpriority=high` applied** on all three routes, and on Detail the image is
  **not `loading=lazy`**. _(The "discoverable in the initial HTML" sub-check on
  Detail stays failing until P1.7 — expected.)_ Verified in the **post-deploy PSI
  run**.
- [ ] **AC2:** Before/after LCP is recorded (a short note appended to
  `001-perf-baseline/baseline.md` or a new `002` note) from the **post-deploy PSI
  run**: mobile LCP for Home and Detail should **improve** (trend toward < 2.5 s;
  full target may still need P1.2/P1.7).
- [ ] **AC3:** **No layout/visual regression** — the hero video autoplays, the 3D
  selector works, and no new CLS is introduced on any route.
- [ ] **AC4:** Only the **LCP element of each route** is prioritized (no extra
  images marked high-priority).
- [ ] **AC5:** Definition of Done green: `tsc` + `lint` + `test` + `build`, plus a
  manual check on the three routes (mobile viewport).

## Non-functional / constraints

- **Brand:** the hero video and the 3D tire animation must remain.
- Minimal footprint: no new dependencies; smallest change that satisfies the ACs.

## Decisions (from /clarify)

- **Detail scope = partial now.** Apply `fetchpriority=high` + eager (remove
  `loading="lazy"`) to the main product image now — a partial LCP win. The
  server-render that makes it discoverable in the initial HTML is deferred to
  **P1.7**; that sub-audit is expected to keep failing here.
- **Home mechanism = preload the poster.** Prioritize the LCP via
  `<link rel="preload" as="image" fetchpriority="high" href="…/banner-hero.webp">`.
  The `<video>` and the hero markup are otherwise unchanged.
- **Verification = you re-run PSI after deploy.** Once the change ships to
  production, you re-run PageSpeed Insights on the three URLs and share the numbers;
  the before/after is recorded against the baseline. A local DevTools/Lighthouse
  check may confirm the attributes pre-deploy, but the authoritative AC1/AC2
  verification is the production PSI run.

---

_The WHAT and WHY only. The HOW lives in [plan.md](./plan.md)._
