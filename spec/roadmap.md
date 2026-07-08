# Roadmap — Mr. Goma Tires

> Project constitution · last updated: 2026-06-30
>
> **High-level** implementation order, in **very small work phases**. Each phase
> is deliverable on its own. Current priority:
> **1) Performance / Core Web Vitals → 2) Payments go-live (Stripe)**.

## How to read this roadmap

- Each phase is **small**: ideally one work session, a single goal.
- Each phase meets the **Definition of Done** in
  [tech-stack.md](./tech-stack.md) (tsc + lint + tests + build + verification)
  before it closes.
- One branch per phase (or per small group of phases). The user does the push.
- New work enters through the SDD flow: `/specify` creates the feature spec and
  branch under `spec/features/` (see [features/README](./features/README.md)).
- Phases within a track are ordered; **P1.0 baseline** gates the sequencing of
  the rest of Track 1.
- States: ⬜ pending · 🟡 in progress · ✅ done.

---

## Track 1 — Performance / Core Web Vitals (PRIORITY)

Goal: hit the Core Web Vitals targets (field, p75) —
**LCP < 2.5s · INP < 200ms · CLS < 0.1** — on the key routes (`/`, `/tires`,
detail).

**Exit criteria:** the three metrics meet target on all key routes and a
performance budget is in place (P1.8). **Status:** the anti-regression **JS-weight
budget is in place** (P1.8, CI-enforced); the **CWV re-measurement on the deployed
site is the last step** to confirm the metric targets and formally close the track.

- ✅ **P1.0 — Baseline.** Measured CWV on home, `/tires` and detail; recorded
  LCP/INP/CLS and the top offenders (`001-perf-baseline`).
- ✅ **P1.1 — LCP image.** Hero LCP prioritized (`priority`/preload/`fetchpriority`),
  correct `sizes`, modern format (`002-lcp-fetchpriority`).
- ✅ **P1.2 — Below-the-fold images.** Lazy-loading, reserved dimensions, responsive
  `sizes`, AVIF/WebP + payload trims (`004-image-payload`).
- ✅ **P1.3 — Fonts.** `next/font` (Inter) made explicit — `display: swap`, preload,
  metric-matched fallback, wired as the `sans` token (`006-fonts-cls`).
- ✅ **P1.4 — Structural CLS.** Audit + PromoBanner hydration-jump fix; other
  surfaces already reserved space (`008-structural-cls`).
- ✅ **P1.5 — JS / bundle.** three.js deferred (dynamic import + idle-mount), other
  chunks confirmed non-blocking (`005-home-3d-defer`).
- ✅ **P1.6 — INP / interactivity.** 3D canvases run only when active/visible; idle
  mount reduces main-thread work on load (`005-home-3d-defer`).
- ✅ **P1.7 — Data / routes.** Detail page server-rendered (shared mapper, force-
  dynamic), cutting the client-fetch CLS/LCP cost (`003-detail-server-render`).
- 🟡 **P1.8 — Re-measure and budget.** JS-weight performance budget shipped as a
  local/pre-deploy gate — `npm run perf:budget` (`009-perf-budget`); not a CI step
  because `next build` needs the DB. The deployed-site CWV re-measurement (PSI)
  remains to confirm targets and close Track 1.

## Track 2 — Payments go-live (Stripe)

Goal: move from WhatsApp orders to a **real Stripe checkout** in production,
safely and verifiably.

**Exit criteria:** a real payment completes in production and is verified — order
persisted (`SC_Order`/`SC_OrderDetail`), tire marked `sold`, and receipt shown.

- ⬜ **S2.0 — Pre-flight.** Checklist of Stripe account and keys (test + live),
  currency, taxes and env vars (`STRIPE_SECRET_KEY`, `ENABLE_STRIPE_CHECKOUT`,
  `NEXT_PUBLIC_ENABLE_STRIPE`, `NEXT_PUBLIC_STRIPE_CURRENCY`, `NEXT_PUBLIC_BASE_URL`).
- ⬜ **S2.1 — Checkout in test mode.** With test keys and `CHECKOUT_TEST_MODE=true`:
  validate `create-session`, redirect to Stripe and the confirmation page (no DB
  writes).
- ⬜ **S2.2 — Order persistence.** With test data, verify writes to
  `SC_Order`/`SC_OrderDetail` and the tire status update to `sold` (outside test
  mode).
- ⬜ **S2.3 — Edge cases.** Unavailable item (409), Stripe not configured (501),
  empty cart, amount/currency rounding.
- ⬜ **S2.4 — Confirmation and receipt.** Post-payment page:
  `GET /api/checkout/session`, `receipt_url`, email and a copyable reference.
- ⬜ **S2.5 — Switch default.** Make Stripe the default flow; keep WhatsApp as a
  fallback via flag.
- ⬜ **S2.6 — Live + smoke test.** Live keys on Vercel, a real end-to-end test,
  logging/monitoring of payment errors.

---

## Backlog (tracked, not prioritized yet)

To be resumed after the two tracks above; no fixed order yet.

- ⬜ **Tailwind v4 config activation (bug).** `tailwind.config.ts` is ignored by
  Tailwind v4 (no `@config` directive), so its custom tokens are dormant **in
  production today**: `green-primary` (brand accent on focus rings/checkboxes),
  the `xs` (350px) breakpoint, and the `slide-in-right` cart animation. Activate
  them the v4 way (migrate to CSS `@theme` or add `@config`) and visually verify
  no regressions. Found during P1.3 (`006-fonts-cls`).
- ⬜ **SEO — phased plan.** 4 phases from the WJM audit; Phase 1 ready to
  implement.
- ⬜ **TireCard redesign.** UX/UI improvements for the `/tires` cards (analysis
  done).
- ⬜ **Dashboard AI chat improvements.**
- ⬜ **Document Stakeholders/Requirements** if formal sources appear.

## Recently delivered (context)

_As this list grows it will move to a dedicated CHANGELOG._

- ✅ Brand/Condition/Price filters in the home hero.
- ✅ Magnifier/zoom on detail photos (desktop + mobile).
- ✅ Discovery cue for the home 3D selector.
- ✅ Tread & wear 3D model with a curved surface (tire section).

---

_Sibling documents: [mission.md](./mission.md) · [tech-stack.md](./tech-stack.md)_
