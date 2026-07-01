# Spec — Performance baseline

> Feature: `001-perf-baseline` · Status: Draft · Created: 2026-06-30
> Roadmap: P1.0 · Branch: `feat/001-perf-baseline`

## Why — problem & value

Track 1 of the roadmap is Performance / Core Web Vitals, and the mission treats
performance as a feature (targets: LCP < 2.5s · INP < 200ms · CLS < 0.1). But we
have **no recorded measurement** of where we stand today. Without a baseline we'd
be optimizing on guesses, unable to prove improvement, and unable to rank the
following phases (P1.1–P1.7) by impact.

This feature produces that baseline: a recorded, reproducible snapshot of the
Core Web Vitals on the key routes, plus a **prioritized list of the worst
offenders** that seeds the rest of Track 1. It changes **no application code**.

## User stories

- As the **team**, we want a recorded CWV baseline for the key routes, so that we
  optimize with data instead of guesses and can later prove improvement.
- As a **developer picking the next perf task**, I want a ranked list of the top
  offenders per route mapped to roadmap phases, so I know exactly where to start.

## Scope

- **In:**
  - Measure Core Web Vitals — **LCP, INP, CLS** — and supporting diagnostics
    (TTFB, FCP, total JS transferred, the LCP element, main CLS sources) on the
    three key routes: home `/`, `/tires`, and one product **detail** page.
  - Measure for **mobile and desktop** form factors.
  - Record everything in a doc inside this feature folder
    (`baseline.md`), including the measurement method, environment, date and
    commit, so it is reproducible.
  - Produce a **prioritized "top offenders" table** mapping each issue to a
    roadmap phase (P1.1–P1.7).
- **Out:**
  - Any code change or optimization (that is P1.1 onward).
  - Setting up new RUM/analytics infrastructure.
  - CI performance gates / performance budget enforcement (that is P1.8).

## Functional requirements

- **FR1:** Capture LCP, INP (or a documented lab proxy such as TBT when field INP
  isn't available), and CLS for `/`, `/tires`, and one detail page.
- **FR2:** Capture the measurement environment for reproducibility: form factor
  (mobile/desktop), throttling profile, tool + version, the exact URLs, and the
  app commit/deployment measured.
- **FR3:** Capture supporting diagnostics per route: TTFB, FCP, total JS
  transferred, the identified LCP element, and the top CLS contributors.
- **FR4:** Produce a ranked list of offenders, each tied to the roadmap phase that
  would address it (e.g. LCP image → P1.1, below-the-fold images → P1.2).
- **FR5:** Persist the results as `spec/features/001-perf-baseline/baseline.md`
  (docs only — no source files touched).

## Acceptance criteria (testable)

- [ ] **AC1:** `baseline.md` exists and records LCP, INP (or documented proxy),
  and CLS for **all three routes** (`/`, `/tires`, a detail page), for **both**
  mobile and desktop, measured on the **production** URLs with **PageSpeed
  Insights** (lab) and **CrUX** (field).
- [ ] **AC2:** For each route, the doc names the **LCP element** and the **top CLS
  contributors**.
- [ ] **AC3:** The doc includes a **ranked "top offenders" table** where every row
  maps to a roadmap phase (P1.1–P1.7).
- [ ] **AC4:** **No application source code changes** in this feature — only docs
  under `spec/features/001-perf-baseline/`.
- [ ] **AC5:** Results are **reproducible**: the doc states the tool + version,
  device/throttling profile, the exact URLs, and the commit/deployment measured.

## Non-functional / constraints

- Measurements are taken on the **live production** deployment (real optimized
  build + CDN), so the numbers reflect what users actually experience.
- We record **both** lab (PSI/Lighthouse) and **field** (CrUX + GA4 Web Vitals)
  data; field is authoritative for INP where CrUX has enough samples.

## Measurement setup (decided)

- **Environment:** the **live production** deployment.
  - Base URL: `https://www.mrgomatires.com`
- **Routes measured:**
  - Home: `https://www.mrgomatires.com/`
  - Listing: `https://www.mrgomatires.com/tires`
  - Detail: `https://www.mrgomatires.com/tires/469690-continental-235-60-18`
- **Data:** lab **and** field. Field via **CrUX** (through PageSpeed Insights) and
  **GA4 Web Vitals** where available; lab via **PageSpeed Insights** (Lighthouse).
- **Source-of-truth tool:** **PageSpeed Insights** (lab + CrUX). For diagnostics
  CrUX doesn't provide (the LCP element, specific CLS sources), use the PSI/
  Lighthouse lab audits, supplemented by Chrome DevTools when needed.
- **Form factors:** **mobile** (PSI default emulated mobile + throttling) and
  **desktop**.

> All measurement URLs are now set.

---

_The WHAT and WHY only. The HOW lives in [plan.md](./plan.md)._
