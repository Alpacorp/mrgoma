# Tasks — Tires as they appear on Stripe Checkout

> Feature: `048-stripe-line-items` · Based on: [plan.md](./plan.md) · Created: 2026-11-13

Each task is one sitting, leaves the build green, and names its check.

## Pure builder

- [x] **T1** — `isSiteHost(url, siteHosts)` and `stripeProduct(tire, { siteHosts,
      fallbackImage })` → `{ name, description?, images? }` · files:
      `src/app/api/_lib/stripeProduct.ts` (+ `stripeProduct.test.ts`) ·
      check:
      - name = `cartLine().title` ("Pirelli Scorpion TM MS LR XL"), no `(`,
        `|` or code; a tire without model keeps its composed name (AC1);
      - description "235/50/19 · Used · 8.6/32 · 86% life · Patched · Stock
        #264890"; new tire "size · New · Stock #…"; unknown facts skipped; no
        DOT; empty → omitted (AC2, AC8);
      - photo on `www.usedtires.online` kept (AC3); image on the site's host →
        fallback when set, none when unset; a fallback on the site's host is
        refused; an image on the request's own host (a Preview's
        `*.vercel.app`, also protected) is treated as the site's (AC4).

## Route

- [x] **T2** — `create-session`: keep `treadDepth`, `remainingLife`,
      `patched`, `code`, `condition` on each validated line; build
      `product_data` with `stripeProduct()` (site hosts from the request
      origin, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_BASE_URL` and the
      mrgomatires.com names); WhatsApp keeps `v.name` · files:
      `src/app/api/checkout/create-session/route.ts` · check: tsc; existing
      route tests green.
- [x] **T3** — Route test with `stripe` mocked: capture
      `checkout.sessions.create` params for a used tire with photo, one
      without (env fallback set / unset) and a pickup order · files:
      `src/app/api/checkout/create-session/route.test.ts` · check: AC1–AC5
      through the route (names, descriptions, images, 040 metadata keys, tax
      line for pickup, free shipping), AC7 (no `adaptive_pricing`); WhatsApp
      message still has the internal name and ID.

## Owner-side setup (account changes)

- [x] **T4** — Generic image as PNG (`sips`, scratchpad, not the repo);
      **with the owner's approval in chat**: a public Vercel Blob store in the
      team, the PNG uploaded, its URL in `CHECKOUT_FALLBACK_IMAGE_URL`
      (Production + Preview) — or the owner does these steps. If the Vercel
      tools can create the store but not upload a file, the owner uploads the
      PNG in Vercel → Storage → Blob → Upload and pastes the URL · check: the URL
      answers `200 image/png` to `curl`; `CHECKOUT_FALLBACK_IMAGE_URL` listed
      in the project's env vars (D5).

## Docs and done

- [x] **T5** — `results.md`: option-1 rule (GET, `/assets/images/*`,
      Bypass) and its `curl` check, marked **not applied**, with today's
      result (429); the Blob steps; `tech-stack.md` Stripe line · files:
      `spec/features/048-stripe-line-items/results.md`, `spec/tech-stack.md`
      · check: AC6.
- [x] **T-DoD** — `tsc` + lint + tests + build + `perf:budget`; manual by the
      agent: a Stripe **test-mode** session through the local route for a used
      tire with photo, one without, a new tire, and a pickup order, viewed in
      Chrome at desktop and phone width: readable names, descriptions, no
      broken image (fallback image once T4 is done), tax line, USD/adaptive
      unchanged; after a test payment, the confirmation page lists the
      readable name · check: `results.md`.

## Traceability

| Task | AC |
| ---- | -- |
| T1 | AC1, AC2, AC3, AC4, AC8 |
| T2 | AC1–AC5 (wiring) |
| T3 | AC1, AC2, AC3, AC4, AC5, AC7 |
| T4 | AC4 (fallback image available) |
| T5 | AC6 |
| T-DoD | all (AC1–AC8) |
