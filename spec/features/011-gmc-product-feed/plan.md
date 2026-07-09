# Plan — Google Merchant Center product feed (token-protected XML)

> Feature: `011-gmc-product-feed` · Based on: [spec.md](./spec.md) · Created: 2026-07-08

## Technical approach

A single **App Router route handler** at `src/app/feed/google-merchant.xml/route.ts`
(folder name with `.xml` → route path `/feed/google-merchant.xml`) returns a
hand-built **RSS 2.0 XML** document with the `xmlns:g="http://base.google.com/ns/1.0"`
namespace, one `<item>` per online-sellable tire.

Flow on GET:
1. **Token gate** — read `?key=` and compare (timing-safe) against server-only env
   `MERCHANT_FEED_TOKEN`. Missing/empty/wrong → `403` with no body detail. Env
   unset → `503` (feature not configured), logged. Read via `process.env`
   directly (not `constants.ts`) so the route never throws at build/import.
2. **Fetch (cached)** — call a new repository function `fetchSellableTiresForFeed()`
   wrapped in `unstable_cache([...], { revalidate: FEED_REVALIDATE_SECONDS, tags:
   ['tires'] })` (same pattern as `api/tires/route.ts:15`). `FEED_REVALIDATE_SECONDS
   = 43200` (12h). Reusing `tags: ['tires']` means existing tire cache invalidation
   also refreshes the feed.
3. **Serialize** — map each record to a whitelisted `GmcItem`, build the XML string,
   return `new Response(xml, { headers: { 'Content-Type': 'application/xml;
   charset=utf-8', 'Cache-Control': 'public, s-maxage=43200,
   stale-while-revalidate=86400' } })`. The tokenized URL varies by query string, so
   CDN caching keyed on the full URL is safe.
4. **Errors** — wrap the fetch/serialize in try/catch; `logger.error` server-side;
   return a generic `500` (no stack trace / connection string / env in the body).

**Security is realized in code**, not prose (maps to the spec's Security NFR):
- The repository selects **only whitelisted columns** at the SQL level (no `SELECT
  *`), and the serializer emits an explicit `GmcItem` shape — internal columns
  (`VaultName`, `DOT`, `Local`, `Trash`, `Amount`, `ModificationDate`, …) can never
  appear (AC4).
- The feed query reuses the **exact storefront clause**, extracted to a shared
  constant, so it can never drift to the dashboard's `Trash='false'` (everything)
  clause (AC2).
- Timing-safe token compare; token server-only; no error leakage; `robots` disallow
  + absent from sitemap.

## Reuse first

- **`unstable_cache` + `revalidate` + `tags:['tires']`** — copy the caching pattern
  from `src/app/api/tires/route.ts:15-19`.
- **`getPool` / `logQuery`** (`@/connection/db`, `@/connection/queryLogger`) — same
  data-access plumbing every repo function uses.
- **Storefront WHERE clause** `tiresRepository.ts:185` — extract to
  `STOREFRONT_SELLABLE_WHERE` and reuse in **both** `fetchTires` (pure refactor,
  zero behaviour change) and the new feed query.
- **`buildTireSlug`** (`tireSlug.ts:13`) → product `link`; **`absUrl`/`getSiteUrl`**
  (`seo.ts:20-38`) → absolute `link`/`image_link`; **`generateTireDescription`**
  (`tireDescription.ts:17`) → `description` fallback.
- **`DocumentRecord`** field names (`tiresRepository.ts:114`) and the new/used
  derivation `ProductTypeId === 1 ? 'New' : 'Used'` (from `mapTireRecordToSingleTire.ts:40`).
- **`robots.ts`** disallow array pattern (`robots.ts:12`).
- **Zod** (already a dep) for the minimal query validation at the boundary.

## Files to add / change

- **NEW `src/app/feed/google-merchant.xml/route.ts`** — the GET route handler:
  token gate, cached fetch, XML response, error handling. Wrapped in `withLogging`
  (`@/app/api/_lib/withLogging`) to match logging conventions.
- **NEW `src/app/utils/merchantFeed.ts`** — pure, testable helpers (no DB):
  - `FEED_REVALIDATE_SECONDS = 43200`, `GOOGLE_PRODUCT_CATEGORY_TIRES = '912'`.
  - `type GmcItem` — the explicit whitelist of output fields.
  - `buildFeedTitle({brand, size, condition, remainingLife})` → `Michelin
    225/40R18 Used Tire — 80% tread` (Brand + Size + Condition + tread%).
  - `buildFeedItem(record)` → `GmcItem` (title, description via
    `generateTireDescription`, link via `buildTireSlug`+`absUrl`, image_link +
    additional_image_link, price `"80.00 USD"`, availability `in_stock`, condition
    `new`/`used`, brand, `google_product_category=912`, `product_type=Tires >
    {Brand} > {Size}`, `identifier_exists=no`).
  - `escapeXml(s)`, `buildMerchantFeedXml(items)` → full RSS 2.0 string.
  - `isValidFeedToken(provided, expected)` — timing-safe (`crypto.timingSafeEqual`,
    length-guarded) boolean.
- **CHANGE `src/repositories/tiresRepository.ts`**:
  - Export `const STOREFRONT_SELLABLE_WHERE = "Local = '0' AND Trash = 'false' AND
    Condition != 'sold' AND RemainingLife >= '50%' AND Price != 0"` and use it at
    line 185 (`fetchTires`) — **identical string**, pure refactor.
  - Add `type FeedTireRecord` (whitelisted columns) + `buildFeedQuery()` (returns
    the SQL string; pure, testable) + `fetchSellableTiresForFeed(): Promise<
    FeedTireRecord[]>` — `SELECT <whitelist> FROM dbo.View_Tires WHERE
    ${STOREFRONT_SELLABLE_WHERE} ORDER BY ModificationDate DESC`, **no row cap**,
    via `getPool`/`logQuery`.
- **CHANGE `src/app/robots.ts`** — add `'/feed/'` to the `disallow` array.
- **NEW `src/app/utils/merchantFeed.test.ts`** — unit tests for the serializer,
  title format, whitelist keys, token compare, `buildFeedQuery` (reuses storefront
  clause / not dashboard), and robots/sitemap assertions.
- **NEW `src/app/feed/google-merchant.xml/route.test.ts`** — route tests mocking
  `fetchSellableTiresForFeed`: 403 without/with wrong token, 200 + XML with correct
  token, generic 500 on forced fetch error, cache header present.
- **DOCS** — add `MERCHANT_FEED_TOKEN` to `.env.example` (if present) and note the
  new endpoint; update `spec/roadmap.md` (GMC feed item + backlog line for the
  public-API security review).

## Data & flow

- **Input:** `GET /feed/google-merchant.xml?key=<token>`. Only `key` is read;
  validated minimally (Zod `z.object({ key: z.string().min(1) })`) → 403 on failure.
- **DB:** one read via `fetchSellableTiresForFeed()` (cached 12h). Reuses the
  storefront filter — no business-rule change, no cap. Parameterless constant
  clause (no injection surface).
- **Output:** `application/xml` RSS 2.0; `Cache-Control: public, s-maxage=43200,
  stale-while-revalidate=86400`.
- **No writes, no auth session, no new external calls.** Env: `MERCHANT_FEED_TOKEN`
  (server-only), plus the existing `NEXT_PUBLIC_SITE_URL`/`SITE_URL` for `absUrl`.

## Acceptance criteria → implementation

| AC  | How it's met | How it's verified/tested |
| --- | ------------ | ------------------------ |
| AC1 (valid feed) | `buildMerchantFeedXml` emits RSS 2.0 + `g:` ns; route returns 200 XML | Unit: parse output, assert `channel`+`item`s+`xmlns:g`; route test asserts 200 + Content-Type |
| AC2 (mirrors storefront, no cap) | `fetchSellableTiresForFeed` reuses `STOREFRONT_SELLABLE_WHERE`, no `TOP`/OFFSET | Unit on `buildFeedQuery()`: contains storefront clause, **not** dashboard `Trash='false'`-only; no cap keyword |
| AC3 (required attributes) | `buildFeedItem` sets all required `g:` fields | Unit asserts each field present + formats (price 2-dec USD, title format, category 912, product_type) |
| AC4 (no data leak) | SQL selects whitelist; `GmcItem` explicit keys | Unit asserts `Object.keys(item)` == whitelist; no `VaultName`/`DOT`/`Local`/etc. |
| AC5 (token required) | `isValidFeedToken` gate in route | Unit on token compare + route tests: no key→403, wrong→403, right→200 |
| AC6 (input validated, no leak) | Zod on `key`; try/catch → generic 500 | Route test: forced fetch throw → 500 with no stack/secret in body |
| AC7 (cached ~12h) | `unstable_cache` revalidate 43200 + Cache-Control | Assert `FEED_REVALIDATE_SECONDS===43200` and header on response |
| AC8 (not discoverable) | `robots` disallow `/feed/`; not in sitemap | Test reads `robots.ts`/`sitemap.ts` sources |
| AC9 (DoD) | Full gate | `tsc`+`lint`+`test`+`build` green; manual fetch with/without token |

## Tradeoffs / alternatives

- **Hand-built XML vs an XML library.** Chosen hand-built with `escapeXml` — no new
  dependency, format is simple and fixed, and we fully control escaping. Risk
  (malformed XML) is covered by a parse-the-output test.
- **Route handler vs `sitemap.ts`-style MetadataRoute.** Merchant feed isn't a Next
  metadata type, and we need a custom `Content-Type` + token gate, so a route
  handler is the right primitive.
- **Location outside `app/api/*` (deliberate exception).** `tech-stack.md:70` says
  route handlers live in `app/api/*` and return JSON. The feed intentionally
  deviates: XML, at `/feed/google-merchant.xml`, for a clean GMC-friendly URL — and
  `/api` is robots-disallowed, which would hide the feed from the very reader we
  want. There's precedent for non-`/api`, non-JSON handlers (`sitemap.ts`,
  `robots.ts`, `opengraph-image`). If the dotted route segment fails to build, fall
  back to `/feed/google-merchant` (GMC doesn't require the `.xml` extension).
- **Whitelist columns in SQL vs mapping from `SELECT *`.** Chosen SQL whitelist —
  defense-in-depth: internal fields never even leave the DB layer, and it's a
  smaller payload. `fetchTiresInternal`'s `SELECT *` is left untouched (out of
  scope).
- **Extracting `STOREFRONT_SELLABLE_WHERE` and refactoring `fetchTires`.** Tiny,
  behaviour-preserving (identical string), and it guarantees feed↔site parity — the
  central business guarantee of this feature.
- **Query-string token vs HTTP Basic Auth.** Query string chosen (owner's call) for
  GMC scheduled-fetch simplicity; server-to-server has no `Referer` leak. Basic Auth
  remains an easy future swap (same env, different read location).

## Risks

- **Full-catalog query cost.** Mitigated by 12h `unstable_cache` (≈1 DB read/window)
  + CDN `s-maxage`. The query is a single indexed read of the same view the site
  already hits.
- **Relative image URLs.** If any `Image1..4` is relative, `absUrl` prefixes the
  **site** origin, not the image host. Current data is absolute `usedtires.online`
  URLs; `buildFeedItem` passes them through unchanged. Note in results if any
  relative URLs surface.
- **Token in env missing in an environment.** Route returns 503 (not a crash);
  logged. Documented as a required env for the feature.
- **GMC disapprovals for used tires without GTIN.** Handled by `identifier_exists:
  no`; further attribute tuning (mpn) is a later data-model phase (out of scope).

## Out of scope

- Any change to the tire **filter/business rule** (the storefront clause is reused
  verbatim).
- Content API (real-time), data-model enrichment (`gtin`/`mpn`/real stock `Amount`),
  `ItemList` structured data, fixing the detail page's hardcoded `InStock`.
- Registering/operating the feed inside GMC (owner does this in the admin).
- Site-wide public-API security review — **separate follow-up feature** (backlog).

---

_The concrete steps live in [tasks.md](./tasks.md)._
