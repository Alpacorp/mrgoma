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
performance budget is in place (P1.8).

- ⬜ **P1.0 — Baseline.** Measure CWV (Lighthouse/PageSpeed + field data) on home,
  `/tires` and detail. Record LCP/INP/CLS and the top 3 offenders. _No code
  changes; produces the prioritized list._
- ⬜ **P1.1 — LCP image.** Identify the LCP image of each route and ensure
  `priority`/preload, correct `sizes`, and a modern format (webp/avif).
- ⬜ **P1.2 — Below-the-fold images.** Proper lazy-loading, reserved dimensions
  (no CLS), responsive `sizes` in the `/tires` grids.
- ⬜ **P1.3 — Fonts.** Verify `next/font` (Inter) with no CLS: `display: swap`,
  no flashes; subset if applicable.
- ⬜ **P1.4 — Structural CLS.** Reserve space for badges, carousels and media;
  avoid jumps on hydration.
- ⬜ **P1.5 — JS / bundle.** Audit heavy imports; confirm that 3D (three.js) and
  other non-critical chunks load deferred; trim the rest.
- ⬜ **P1.6 — INP / interactivity.** Reduce main-thread work; confirm the 3D
  canvases only run when active.
- ⬜ **P1.7 — Data / routes.** Review caching/ISR where applicable and hot SQL
  queries that affect TTFB.
- ⬜ **P1.8 — Re-measure and budget.** Confirm CWV in the green and set a
  performance budget to prevent regressions.

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
- 🟡 **GMC product feed (`011-gmc-product-feed`).** Token-protected XML feed at
  `/feed/google-merchant.xml` serving the online-sellable lot (reuses the
  `fetchTires` filter, no business-rule change) so Google Merchant Center reads an
  authoritative catalog instead of guessing via crawl. Owner registers the
  tokenized URL in the GMC admin. _In progress._
- 🟡 **Public-API security review (`012-public-api-hardening`).** Consistent
  defense-in-depth across the public API surface (`/api/tires`, `/api/tire`,
  `/api/brands`, `/api/ranges`, `/api/dimensions/*`, `/api/instant-quote`): generic
  error responses (no `err.message` leak), output field-whitelisting on `/api/tires`
  (drops internal columns), Zod coercion on numeric dimension params, and an
  instant-quote body-size cap — all with **zero contract change**. Follow-up to
  `011`. _In progress._
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
