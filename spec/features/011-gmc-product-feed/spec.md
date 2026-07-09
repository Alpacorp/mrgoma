# Spec — Google Merchant Center product feed (token-protected XML)

> Feature: `011-gmc-product-feed` · Status: Draft · Created: 2026-07-08
> Roadmap: Backlog — SEO (new: GMC integration) · Branch: `feat/011-gmc-product-feed`

## Why — problem & value

Google Merchant Center (GMC) currently shows only ~800 of our 3,000+ inventory
rows, and those ~800 come from **Google's automatic crawl** of the site (sitemap +
on-page `Product` JSON-LD), not from any feed we control — there is **no feed or
Merchant integration in the codebase today**. Crawl-based listings are fragile:
Google guesses the catalog, may under-count, and can drift on price/availability,
which risks disapprovals and lost Shopping/free-listing surface.

The mission is to sell used tires with **trust and transparency**. An authoritative
feed lets us hand Google **exactly the sellable set** — the same lot the storefront
already shows — with correct price, availability and condition. This positions the
brand in Google Shopping and free listings without exposing anything that shouldn't
be sold online.

Crucially, the **business rule that defines the sellable lot must not change**. The
storefront's existing filter (`fetchTires`) is the source of truth for what may be
sold online; the feed mirrors it exactly. The ~800/3,000 gap is **by design** (most
rows are sold, trashed, local-only, unpriced, or below the tread threshold) — the
goal is a reliable authoritative feed, **not** a bigger catalog.

## User stories

- As the **store owner**, I want Google Merchant Center to read an authoritative
  product feed of exactly our online-sellable tires, so Shopping/free listings are
  complete, correctly priced and never show tires we don't sell online.
- As the **store owner**, I want the feed URL protected by a secret token, so
  competitors can't trivially scrape our full catalog while Google (which I
  configure with the tokenized URL in the GMC admin I own) still reads it fine.
- As a **shopper on Google**, I want product listings whose price, image and
  availability match the site, so I trust the result and click through.

## Scope

- **In:**
  - A **public, token-protected endpoint** that returns a valid **Google Merchant
    XML feed (RSS 2.0 with the `g:` namespace)** of the online-sellable tires.
  - Emits **all** sellable products (no pagination / no 100- or 2000-row cap),
    matching the storefront's existing `fetchTires` filter **exactly** (reusing the
    same base WHERE clause — no business-rule change).
  - Per-product GMC attributes derivable from existing data: `id`, `title`,
    `description`, `link` (absolute canonical `/tires/{slug}`), `image_link` +
    `additional_image_link`, `price` (USD), `availability`, `condition` (new/used),
    `brand`, `google_product_category`, `product_type`, `identifier_exists`.
  - **Security controls** (see Non-functional): mandatory secret token, output
    field whitelist, storefront-clause reuse, Zod input validation, cached
    response, no error leakage, `robots.txt` disallow, absent from the sitemap.
- **Out:**
  - **Any change to the tire filters / business rule** — the current `fetchTires`
    WHERE clause is fixed and authoritative.
  - Google **Content API** (real-time sync) — a later phase if needed.
  - Enriching the **data model** with new columns (`gtin`, `mpn`, real stock
    `Amount`) — used tires ship as `identifier_exists: no`; a later phase.
  - `ItemList` structured data on listing pages; fixing the hardcoded `InStock`
    in the detail JSON-LD — separate SEO items.
  - Registering/operating the feed inside GMC (the owner does that in the admin).
  - Site-wide security hardening of other public endpoints (flagged below as a
    recommended **separate** feature).

## Functional requirements

- **FR1:** A GET endpoint serves a well-formed XML document in Google Merchant RSS
  2.0 format (channel + one `item` per product, `g:` namespaced attributes).
- **FR2:** The product set equals the storefront-sellable set — the **same base
  filter** as `fetchTires` (`Local='0' AND Trash='false' AND Condition!='sold' AND
  RemainingLife>='50%' AND Price!=0`), reused (not re-implemented), with **no**
  row cap.
- **FR3:** Each `item` includes the required GMC attributes: `id` (TireId),
  `title`, `description`, `link`, `image_link`, `price` + currency (USD),
  `availability`, `condition`, `brand`, `google_product_category` (**912** — Motor
  Vehicle Tires), `product_type` (**`Tires > {Brand} > {Size}`**),
  `identifier_exists: no`; plus `additional_image_link` when extra images exist.
- **FR3a (title format):** `title` follows **Brand + Size + Condition (+ tread%)**,
  e.g. `Michelin 225/40R18 Used Tire — 80% tread`, built from existing fields
  (Google favours search-oriented titles). `description` reuses the existing
  generated description (`generateTireDescription`) when the DB `Description` is
  empty.
- **FR4:** The feed includes **both new and used** tires (the full storefront lot);
  `condition` reflects new vs used correctly (from `ProductTypeId`), and
  `link`/`image_link` are absolute URLs on the canonical site/image hosts.
- **FR5:** The endpoint requires a valid secret token (env `MERCHANT_FEED_TOKEN`,
  server-only, passed as query string `?key=`); requests without it (or with a
  wrong one) are rejected without returning any product data.
- **FR6:** The response is cached with **~12-hour revalidation** so GMC's scheduled
  fetches don't re-hit the database on every request.

## Acceptance criteria (testable)

- [ ] **AC1 (valid feed):** Given a valid token, when the endpoint is requested,
      then it returns HTTP 200 with `Content-Type` XML and a well-formed Merchant
      RSS 2.0 document that validates (parses; has `channel` + `item`s with the
      required `g:` attributes).
- [ ] **AC2 (mirrors storefront, no cap):** The number and identity of `item`s
      equals the storefront-sellable set from the reused `fetchTires` base clause,
      with no 100/2000 cap. A row that is sold / trashed / `Local!='0'` / unpriced
      is **absent** from the feed. _(Verified by a unit test on the query/selector
      layer asserting it reuses the storefront clause, not the dashboard clause.)_
- [ ] **AC3 (required attributes):** Every `item` carries `id`, `title` (Brand +
      Size + Condition format), `description`, `link`, `image_link`, `price` (USD,
      2 decimals), `availability`, `condition` (`new`/`used`), `brand`,
      `google_product_category=912`, `product_type=Tires > {Brand} > {Size}`,
      `identifier_exists=no`. _(Unit test over the item serializer.)_
- [ ] **AC4 (no data leak):** The serialized feed contains **only** whitelisted
      fields — it never exposes internal columns (`VaultName`, `DOT`, `Local`,
      `Trash`, `Amount`, `ConditionId`, `ModificationDate`, etc.). _(Unit test
      asserts the output object keys are the whitelist.)_
- [ ] **AC5 (token required):** No `?key=` → 403; wrong `?key=` → 403; correct
      `?key=` (matching `MERCHANT_FEED_TOKEN`) → 200. No product data is returned on
      rejection. _(Unit test on the auth check + route.)_
- [ ] **AC6 (input validated, no leak on error):** A malformed request (bad query
      params) yields a clean 4xx; an internal failure (e.g. DB down) yields a
      generic 5xx with no stack trace, connection string, or env value in the
      response body. _(Unit test with a forced error.)_
- [ ] **AC7 (cached, ~12h):** The response sets caching / route revalidation of
      **~12 hours** so GMC's scheduled fetches don't trigger a DB query on every
      hit. _(Assert the cache header / revalidate config.)_
- [ ] **AC8 (not discoverable):** `robots.ts` disallows `/feed/` (or the feed path)
      and the feed URL is **not** present in `sitemap.ts`. _(Test/inspection of
      both files.)_
- [ ] **AC9 (DoD):** `npx tsc --noEmit` + `npm run lint` + `npm test` +
      `npm run build` all green; feed manually fetched with/without token verified.

## Non-functional / constraints — **Security (primary)**

The feed is a public URL by nature (GMC's scheduled fetch is unauthenticated
server-to-server; full OAuth would mean Content API, out of scope). All data it
emits is already public on the storefront. The controls below manage the real
risks — **DoS/DB-load, scraping, and accidental data leakage** — and are encoded as
acceptance criteria:

- **Mandatory secret token** stored **server-only** (no `NEXT_PUBLIC_` prefix; per
  tech-stack env rules). The owner pastes the tokenized URL into the GMC admin, so
  Google reads it while unauthenticated callers get 403.
- **Output field whitelist** — never serialize the raw DB record (`fetchTiresInternal`
  does `SELECT *`); map only GMC-safe fields so internal columns never leak (AC4).
- **Storefront-clause reuse, not dashboard** — reuse the exact `fetchTires` base
  WHERE (ideally extracted to a shared constant so feed and site never drift);
  guard with a test so the feed can never accidentally use the dashboard's
  `Trash='false'` (everything) clause (AC2).
- **Parameterized SQL + Zod input validation** — the base clause is a constant (no
  injection surface); any query-string input is validated at the boundary (AC6);
  never concatenate input into SQL (existing repo convention).
- **Aggressive caching** — revalidate on an interval (GMC fetches a few times/day),
  turning N requests into ~1 DB query per window; primary DoS defense (AC7).
- **No error leakage** — log server-side with Winston; return generic 4xx/5xx (AC6).
- **Not discoverable** — `Disallow` in `robots.ts`, omit from `sitemap.ts`; GMC
  still reads a configured feed regardless of robots (AC8).
- Correctness first (mission tie-break): the feed must never misrepresent price,
  availability or condition, and must never expose a non-sellable tire.

_Note (site-wide security, per the owner's question):_ a broader review of the
**existing** public API surface (`/api/tires`, `/api/tire`, `/api/brands`,
`/api/ranges`, `/api/dimensions/*`, `/api/instant-quote`) for consistent input
validation, rate limiting and field whitelisting is **worthwhile but a separate
feature** — bundling it here would break the "small, verifiable slice" rule. See
Open questions.

## Clarifications resolved (2026-07-08)

- **Feed URL path:** `/feed/google-merchant.xml` — clean, file-like, outside the
  robots-blocked `/api`. Served as XML by a route handler.
- **Token:** env `MERCHANT_FEED_TOKEN` (server-only), passed as query string
  `?key=`. The owner pastes the tokenized URL into the GMC admin.
- **Revalidation window:** ~**12 hours**.
- **Coverage:** **new + used** — the full storefront-sellable lot, `condition`
  set correctly per `ProductTypeId`.
- **`google_product_category`:** **912** (Motor Vehicle Tires).
  **`product_type`:** hierarchical `Tires > {Brand} > {Size}`.
- **`title`:** **Brand + Size + Condition (+ tread%)** (search-oriented for
  Shopping); `description` reuses the existing generated description when the DB
  field is empty.
- **Site-wide public-API security review:** **backlog**, scoped as a **separate**
  feature to tackle after this one (keeps this slice small).

_No blocking unknowns remain — ready for `/plan`._

---

_The WHAT and WHY only. The HOW lives in [plan.md](./plan.md)._
