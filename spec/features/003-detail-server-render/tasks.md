# Tasks — Server-render the product detail page

> Feature: `003-detail-server-render` · Based on: [plan.md](./plan.md) · Created: 2026-07-06

Ordered, **very small, independently verifiable** tasks. Check each off as it is
completed. Order is by dependency: unify the shape/types first (prerequisite),
then the shared mapper, then the server render, then retire the client fetch.

## Prep — verify assumptions

- [x] **T0 — Verify legacy `/detail` route + checkout coupling** _(no code)_
  _Result: legacy `/detail?productId=` route **exists but is redirect-only** (301 →
  `/tires/{slug}`); it does **not** render `Detail`. Checkout **does** re-validate via
  `/api/tire` (`checkout/create-session/route.ts:155`). Decision: delete `Detail`
  outright (only `page.tsx` imported it); keep `/api/tire`._ · files: none (grep only)

## Data shape (prerequisite)

- [x] **T1 — Fix `SingleTire` type** · in `tires.d.ts` fix broken refs
  (`singleProductImages` → `singleTireImages` at L90, `SingleProductDetails` →
  `SingleTireDetails` at L93; `description?` already exists at L91). Add the extra
  fields (`dot`, `size?`, `loadIndex?`, `speedIndex?`) so the mapper is fully typed.
  Note `details` is a single `SingleTireDetails` object, not an array. · files:
  `src/app/interfaces/tires.d.ts` · check: `npx tsc --noEmit` clean (fix any
  consumers surfaced).
- [x] **T2 — Shared record→SingleTire mapper** · extract one mapper producing the
  full `SingleTire` (description, `images[]`, `details[]`, extra fields). · files:
  **new** `src/repositories/mapTireRecordToSingleTire.ts` · check: `tsc` clean;
  returns a plain-serializable object; unit-tested in T8.
- [x] **T3 — `/api/tire` uses the mapper** · route maps its record through the shared
  mapper; **response contract unchanged** (checkout still works). · files:
  `src/app/api/tire/route.ts` · check: `tsc` clean; response shape identical
  (diff the JSON for one id before/after).
- [x] **T4 — `page.tsx` uses the mapper + dynamic** · `fetchProduct` maps through the
  shared mapper (keep `cache()`); add `export const dynamic = 'force-dynamic'`;
  `notFound()` when null. · files: `src/app/(shop)/tires/[slug]/page.tsx` · check:
  `tsc` clean; metadata/JSON-LD still build from the same product.

## Server render

- [x] **T5 — `AddToCartButton` client island** · extract the cart logic
  (`useCart()`, `isInCart`, add handler + `CtaButton`) from `TireInformation` into a
  `'use client'` island; `props: { product: SingleTire }`. _Optional (convention):
  add `data-track` to the button — a new interactive element; the current `CtaButton`
  has none._ · files: **new**
  `src/app/ui/components/AddToCartButton/AddToCartButton.tsx` · check: `tsc` clean;
  add-to-cart + in-cart state work in dev.
- [x] **T6 — Server `DetailView`** · **Server Component**, `props: { product:
  SingleTire }`. Renders hero + breadcrumb + headline + specs grid +
  price/name/condition + server-computed `generateTireDescription(product)` +
  `Benefits`; composes the client islands (gallery/zoom, tread 3D, `AddToCartButton`,
  read-more, brand image, features) fed by props. · files: **new**
  `src/app/(shop)/detail/container/DetailView/DetailView.tsx` (+ refactor
  `TireInformation` to drop `'use client'` / delegate cart, or fold its
  presentational parts in) · check: `tsc` clean; renders from props with no client
  fetch.
- [x] **T7 — Wire `page.tsx` → `DetailView` + retire client fetch** · render
  `<DetailView product={product} />`; remove the `useEffect` HTTP fetch + skeleton +
  `useSearchParams` fallback from `Detail.tsx` (delete `Detail` or keep a thin
  wrapper only if T0 says a legacy route needs it). · files:
  `src/app/(shop)/tires/[slug]/page.tsx`, `src/app/(shop)/detail/container/Detail/Detail.tsx`
  · check: grep shows **no `/api/tire` call from the detail route**; view-source of the
  built route shows the `<img>` + price/specs in the initial HTML.

## Tests & Done

- [x] **T8 — Tests** · unit-tested the shared mapper (`record → SingleTire`: core
  fields, `description`, extra specs, images + generic fallback, sold/stock `status`,
  `details[]`) — 6 tests. _DetailView (Server Component composing three.js / next-image
  islands) and the thin `AddToCartButton` wrapper are covered by `build` + the manual
  T9 check rather than brittle jsdom render tests — consistent with the project's stance
  (see 002 T5). No test assumed the old client-fetch flow, so none needed updating._
  · files: `src/repositories/mapTireRecordToSingleTire.test.ts` · check: `npm test`
  green (**113/113**, was 107).
- [x] **T9 — Manual check** _(done: user verified — all interactions OK, no CLS)_ ·
  main image server-rendered; footer doesn't shift; zoom, tread 3D, carousel,
  add-to-cart, sold/stock all work.
- [x] **T-DoD — Definition of Done** · `npx tsc --noEmit` ✓ + `npm run lint` ✓ +
  `npm test` ✓ (113/113) + `npm run build` ✓ (`/tires/[slug]` now `ƒ Dynamic`).
  Manual check ✓ (T9). Post-deploy PSI ✓ (2026-07-06): **CLS 0.914 → 0**, LCP
  4.5 s → 3.2 s (mobile) — see [results.md](./results.md).

## Traceability

| Task            | Acceptance criteria                          |
| --------------- | -------------------------------------------- |
| T4, T6, T7      | AC1 (product content in server HTML)         |
| T7, T9, T-DoD   | AC2 (CLS < 0.1, LCP, discoverable — PSI)     |
| T6, T7, T9      | AC3 (main image priority, not lazy)          |
| T5, T6, T8, T9  | AC4 (islands still work)                     |
| T1, T2, T3, T4, T7 | AC5 (server fetch reused; client fetch gone) |
| T8, T-DoD       | AC6 (DoD + tests for the new flow)           |
| T0              | Risk gate (legacy route / checkout coupling) |
