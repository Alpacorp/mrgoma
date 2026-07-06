# Plan — Server-render the product detail page

> Feature: `003-detail-server-render` · Based on: [spec.md](./spec.md) · Created: 2026-07-03

## Technical approach

`page.tsx` is **already a Server Component** and already fetches the product via a
`React.cache`-wrapped `fetchProduct` (shared with `generateMetadata` + JSON-LD).
Today it throws that data away for the visible UI and renders `<Detail
productId>`, a `'use client'` component that **re-fetches over HTTP**
(`/api/tire`, `no-store`) in a `useEffect` and ships only a skeleton.

The refactor: **render the product from the server-fetched data**, keeping only the
genuinely interactive parts as **client islands**. Concretely — pass the
already-fetched `product` into a new **server** `DetailView` that renders the
hero/breadcrumb/specs/description directly and hands slices to the islands
(gallery/zoom, 3D tread, add-to-cart, read-more, brand image, features). Delete the
client HTTP fetch + skeleton. Render **dynamically** (`no-store`) so price/`sold`
stay accurate.

**Prerequisite — one product shape.** `fetchProduct` (server) and `/api/tire`
(HTTP) return **divergent** objects (server omits `description`, adds
`size/loadIndex/speedIndex`; API has `description`). We extract **one shared
mapper** → `SingleTire`, used by both, so the server render and the (still-needed)
`/api/tire` endpoint agree. `/api/tire` **stays** — checkout re-validates items
through it (per the README); we only stop the detail page from calling it.

## Reuse first

- **`fetchProduct`** (already cached, already server-side) — no second round-trip.
- **`generateTireDescription`** (pure util) — call it **server-side**, pass the
  string into the `ProductDescription` island (no client compute).
- Existing presentational components that are already server-safe: `Benefits`,
  `ProductName`, `ProductPrice`, `FreeShippingBadge`, `ProductCondition`,
  `StockBadge`, `ProductCarouselMiniature`.
- Existing client islands unchanged in behavior: `ProductCarousel` +
  `ProductImageZoom`, `TreadWearExplorer`, `ProductDescription`, `TireFeatures`,
  `BrandImage` — they already take props; we just feed them from server data.

## Files to add / change

**Data shape (do first):**
- **New** `src/repositories/mapTireRecordToSingleTire.ts` (or a `utils` home) —
  single mapper `record → SingleTire` (includes `description`, `images[]`,
  `details` — a single `SingleTireDetails` object, not an array — and the extra
  fields). One source of truth.
- `src/app/(shop)/tires/[slug]/page.tsx` — `fetchProduct` uses the shared mapper;
  keep `cache()`. Pass `product` to `DetailView`. Add `export const dynamic =
  'force-dynamic'` (dynamic/`no-store` freshness). `notFound()` when null.
- `src/app/api/tire/route.ts` — use the same shared mapper (keep the endpoint for
  checkout).
- `src/app/interfaces/tires.d.ts` — fix broken refs (`singleProductImages` →
  `singleTireImages` at L90, `SingleProductDetails` → `SingleTireDetails` at L93);
  `description?` already exists (L91). Add the extra fields (`dot`, `size?`,
  `loadIndex?`, `speedIndex?`) so the mapper is fully typed.

**Server render:**
- **New** `src/app/(shop)/detail/container/DetailView/DetailView.tsx` — **Server
  Component**, `props: { product: SingleTire }`. Renders the hero + breadcrumb +
  headline (moved from `Detail.tsx:248-332`), the specs grid + price/name/condition
  (moved from `TireInformation`), the server-computed description, `Benefits`, and
  composes the client islands below.
- `src/app/ui/sections/TireInformation/TireInformation.tsx` — drop `'use client'`;
  render specs/price/name/description server-side; delegate cart to a new island.
  (Or fold its presentational parts into `DetailView` and retire it — decide during
  implementation to minimize churn.)
- **New** `src/app/ui/components/AddToCartButton/AddToCartButton.tsx` — **client
  island** (`'use client'`, `useCart()`); `props: { product: SingleTire }`; renders
  the existing `CtaButton` with the add-to-cart handler + `isInCart` state.

**Retire the client fetch:**
- `src/app/(shop)/detail/container/Detail/Detail.tsx` — remove the `useEffect`
  HTTP fetch, skeleton, and `useSearchParams` fallback for the main route. Either
  delete `Detail` (replaced by `DetailView`) **or** keep a thin client wrapper
  **only if** a legacy `/detail?productId=` route still exists (verify first).

## Data & flow

1. `page.tsx` (server): `productId = extractIdFromSlug(slug)` → `product = await
   fetchProduct(productId)` (cached; shared with metadata/JSON-LD) → `notFound()`
   if null → `<DetailView product={product} />`.
2. `DetailView` (server) renders presentational content from `product` and passes
   slices to islands: gallery ← `{images, brand, condition, status}`; add-to-cart ←
   `product`; description ← `generateTireDescription(product)`; features ←
   `details`; brand image ← `{brand, brandId}`; tread ← `{treadDepth,
   remainingLife}`.
3. No client product fetch remains for the canonical route → content (and the LCP
   image) is in the **initial HTML**; `no-store` keeps it fresh.

## Acceptance criteria → implementation

| AC  | How it's met                                                                                 | How it's verified                                             |
| --- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| AC1 | `DetailView` renders product content server-side from `fetchProduct`                          | View-source of the built route shows the `<img>` + price/specs |
| AC2 | No late client injection (footer stable) + image in initial HTML                              | Post-deploy PSI: CLS < 0.1, LCP improved, "discoverable" passes |
| AC3 | Main image server-rendered with `priority` (from P1.1) + not lazy                             | Server HTML shows `fetchpriority=high`, no `loading=lazy`      |
| AC4 | Islands unchanged in behavior, fed by props                                                   | Manual: zoom, 3D, carousel, add-to-cart, sold/stock; tests    |
| AC5 | Client `useEffect` product fetch removed; server fetch reused via shared mapper               | Grep shows no `/api/tire` call from the detail route          |
| AC6 | DoD                                                                                           | `tsc`+`lint`+`test`+`build`; tests updated for the new flow    |

## Tradeoffs / alternatives

- **Shared mapper vs quick prop-pass.** Unifying the mapper is a little more work
  but removes a real shape drift (server vs API) and makes `SingleTire` honest;
  worth it and keeps checkout consistent.
- **Retire `Detail` vs thin wrapper.** Prefer deleting the client fetch; keep a
  wrapper only if a legacy `/detail` route needs it (verify).
- **Dynamic vs ISR.** Chose dynamic `no-store` (per `/clarify`) for price/sold
  accuracy; ISR was rejected for staleness.

## Risks

- **Checkout coupling:** `/api/tire` must keep working (checkout re-validates
  through it). Mitigate by routing it through the same shared mapper and not
  changing its response contract.
- **Legacy `/detail?productId=` route:** verify whether it exists; if so, preserve
  a thin client entry so it doesn't break.
- **Type cleanup blast radius:** `SingleTire` has broken refs + an untyped `dot`;
  fixing them may surface other consumers — run `tsc` early and often.
- **Serialization:** props crossing the server→client island boundary must be
  plain-serializable (the `product` object is plain JSON — fine).
- **Dynamic rendering:** ensure the route actually renders dynamically (no
  accidental static caching) so `sold`/price are fresh.

## Out of scope

- Redesign/layout, tread-3D or zoom behavior (P1.5/P1.6), `/tires` client-fetch,
  image/video payload (P1.2), accessibility.
- Deleting `/api/tire` (checkout needs it).

---

_The concrete steps live in [tasks.md](./tasks.md)._
