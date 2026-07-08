# Spec — Structural CLS hardening (reserve space, no hydration jumps)

> Feature: `008-structural-cls` · Status: Draft · Created: 2026-07-07
> Roadmap: P1.4 · Branch: `feat/008-structural-cls`

## Why — problem & value

Cumulative Layout Shift (CLS) is one of our three Core Web Vitals targets
(**< 0.1**, field p75) and the mission treats **performance as a feature**. The
baseline (001) found the project's worst shift on the **detail page (CLS 0.914
mobile / 0.525 desktop)** — and **P1.7 already fixed it** (server-render →
detail CLS ≈ 0). Home and `/tires` measured **0 / ≤ 0.004** in lab.

So in the **lab**, CLS is already green. But:

- **Field CLS is unknown** — the routes don't yet have enough CrUX traffic, so we
  have **no p75 field data**.
- **Lab understates real shift.** Lab runs on a fast, consistent profile; **real
  phones on slow networks** load images, fonts, badges and client-mounted UI at
  staggered times — exactly when unreserved space reflows. A lab score of 0 does
  **not** guarantee a field score < 0.1.

This phase is therefore **preventive hardening**: audit the key routes for
elements that *can* still shift on real devices — **badges** that mount
client-side, **carousels/sliders**, **media/images without reserved dimensions**,
and **content that renders differently on hydration** — and **reserve their
space** so nothing reflows. It's the P1.4 slice of Track 1: lock in the green lab
CLS and protect the field number before it's measured, with **no visual
redesign**.

## User stories

- As a **mobile visitor on a slow connection**, I want the page layout to stay put
  as images, badges and sliders load, so I never tap the wrong thing because
  content jumped.
- As a **shopper scanning the `/tires` grid**, I want each card to hold its shape
  while its photo and condition/stock badges load, so the grid doesn't reflow
  under my eyes.
- As a **maintainer**, I want shift-prone surfaces to reserve their space by
  construction, so field CLS stays < 0.1 and future changes don't silently
  regress it.

## Scope

- **In:**
  - **Audit** the three key routes for structural shift-risk surfaces and produce a
    short documented list (what shifts / why / how reserved). **Prioritize the
    high-traffic funnel** — the **home hero** and the **`/tires` grid cards**
    (images + badges) — and **spot-check** the rest (detail, secondary sliders),
    since detail CLS was already resolved in P1.7.
  - For any surface the audit finds **already safe** (already reserves its space),
    the outcome is **"audit only, no code change"** — recorded in `results.md`. We
    reserve space **only where there is real shift risk** (no speculative defensive
    changes).
  - **Reserve space** on the confirmed shift-risk surfaces so they don't reflow:
    - **Media/images:** intrinsic `width`/`height` or a fixed `aspect-ratio`
      container for every content image that currently lacks reserved dimensions.
    - **Badges** (condition, stock, free-shipping and similar) that mount/paint
      client-side: reserve their footprint (min size / placeholder) so appearing
      doesn't push siblings.
    - **Carousels/sliders** (PromoBanner, ProductCarousel, InfoSlider,
      LocationsSlider, image miniatures): a fixed height / aspect box so the slot
      is stable before the first slide/image paints.
    - **Hydration-dependent UI:** client components whose first client render
      differs from the server output reserve their final space (skeleton /
      min-height), including the areas **around** the hero video and the 3D
      canvases.
  - Keep **lab CLS at 0** on all three routes and set up the change so **field CLS
    stays < 0.1**.
- **Out:**
  - The detail-page footer shift — **already fixed in P1.7**; not re-done here.
  - Any visual redesign, restyle, or content change; this is space-reservation
    only.
  - **Removing or replacing the hero video or the 3D animations** — explicitly
    preserved; we only reserve space around them.
  - INP / JS / bundle work (P1.5/P1.6, done) and re-measurement/budget (P1.8).

## Functional requirements

- **FR1:** Every content image on the key routes renders inside **reserved space**
  — intrinsic `width`/`height` or a fixed `aspect-ratio`/sized container — so it
  occupies its final box **before** the bytes arrive (no image-driven reflow).
- **FR2:** Client-mounted **badges** (condition, stock, free-shipping, etc.)
  reserve their footprint so that appearing after hydration does **not** displace
  surrounding content.
- **FR3:** Each **carousel/slider** has a **stable slot** (fixed height or
  aspect-ratio box) that holds its size before the first slide/image paints.
- **FR4:** No **hydration reflow**: components whose client render differs from the
  server render reserve their final space (skeleton / min-height), so the swap
  from server HTML → hydrated UI causes no shift — including around the hero video
  and the 3D canvases.
- **FR5:** **No visual redesign** — the reserved layout matches the current final
  layout; nothing looks different once fully loaded.
- **FR6:** Lab CLS remains **0** on home, `/tires` and detail; the change is
  structured to keep **field CLS < 0.1**.

## Acceptance criteria (testable)

- [ ] **AC1 (audit documented):** A list in `results.md` names each audited
      shift-risk surface on the three routes, whether it was already safe or
      needed reservation, and how it's reserved.
- [ ] **AC2 (images reserved):** Every content image on the key routes has intrinsic
      dimensions or a fixed aspect/sized container — verifiable in the markup; with
      images throttled/blocked, their boxes still occupy final space (no collapse
      → no reflow).
- [ ] **AC3 (badges reserved):** With hydration/JS delayed (slow network or
      throttling), condition/stock/free-shipping badges appear **without pushing**
      neighbouring content (before/after position identical).
- [ ] **AC4 (carousels reserved):** Each slider's container holds its height before
      the first slide/image paints — the area below it does not jump on first
      paint.
- [ ] **AC5 (no hydration jump):** Reloading each route on a throttled profile
      shows **no visible reflow** as it hydrates, including around the hero video
      and the 3D canvases.
- [ ] **AC6 (CLS held):** Lab CLS stays **0** on home, `/tires` and detail
      (Lighthouse/PSI) **and** a throttled/slow-network reload shows no visible
      reflow on the audited surfaces — this is the bar to close the phase.
      Post-deploy field CLS (**< 0.1**) is confirmed later via PSI and recorded in
      `results.md` (not a blocker to close, same cadence as 002/003/005).
- [ ] **AC7 (no regression / DoD):** `tsc --noEmit`, `lint`, `test`, `build` green;
      manual check confirms the pages look identical once loaded, on desktop and
      mobile.

## Non-functional / constraints

- **Performance:** contributes to the Track 1 CLS budget (< 0.1 field); reservation
  must not add render-blocking work or meaningfully change payload.
- **Accessibility:** reserved placeholders/skeletons must not trap focus or be
  announced as content; respect `prefers-reduced-motion` for any skeleton shimmer.
- **Mobile-first:** verified on a phone viewport and a slow-network profile (this
  is where unreserved space actually shifts).
- **Reuse before creating:** use existing skeletons/patterns (e.g. the 3D
  `<Skeleton>`, `next/image` sizing) before adding new ones; no new deps.
- **Brand constraint:** hero video and 3D animations stay — reserve around them.

## Resolved clarifications

- **Acceptance bar = lab 0 + no reflow under throttling.** Close the phase when lab
  CLS stays 0 and a throttled/slow-network reload shows no visible reflow on the
  audited surfaces. Field CLS (< 0.1) is confirmed **later** via post-deploy PSI
  (same cadence as 002/003/005) — not a blocker to close.
- **Breadth = funnel-first.** Prioritize the high-traffic, high-impact surfaces
  (home hero + `/tires` grid cards: images + badges); spot-check detail and
  secondary sliders. Keeps the slice small; detail's big CLS was already fixed in
  P1.7.
- **Already-safe surfaces = audit only.** If a surface already reserves its space,
  record that in `results.md` and make **no code change**. Reserve space **only
  where there is real shift risk** — no speculative defensive edits.

---

_The WHAT and WHY only. The HOW lives in [plan.md](./plan.md)._
