# Spec — Public API security hardening (audit + consistent controls)

> Feature: `012-public-api-hardening` · Status: Draft · Created: 2026-07-09
> Roadmap: Backlog — Public-API security review (follow-up to `011`) · Branch: `feat/012-public-api-hardening`

## Why — problem & value

Feature `011` protected the new Google Merchant feed with defense-in-depth
(whitelisted output, no error leakage, validated input). That same rigor is **not
applied consistently** to the store's **existing public, unauthenticated API
endpoints** — the ones any visitor (or bot) can call without logging in, that read
from the database and power the storefront.

A quick audit of the in-scope endpoints surfaced concrete, repeated gaps:

- **Error leakage (all 8 endpoints).** Every handler returns the raw
  `err.message` to the client on failure (e.g. `/api/tires` route.ts:47-48,
  `/api/tire`:25-26, `/api/brands`:23-24, `/api/ranges`:22-23, all three
  `/api/dimensions/*`, `/api/instant-quote`:149-150). A DB or driver error can
  expose internal details (schema, connection strings, stack fragments) to the
  public.
- **Raw record leakage (`/api/tires`).** It returns the repository's `SELECT *`
  rows (`DocumentRecord`) directly, so internal columns never meant for the client
  ship to the browser: `VaultName` (store/vault), `Local`, `Trash`, `DOT`,
  `Amount`, `ModificationDate`, `ConditionId`, etc. (`/api/tire` already maps to a
  safe shape; the **list** endpoint does not.)
- **Ad-hoc input handling.** Parameters are parsed inline with no schema
  (`parseInt`/`parseFloat` that can yield `NaN`, presence-only checks). There's no
  single validation boundary, so malformed input is handled inconsistently.
- **Uneven abuse protection.** `/api/tires` caps page size and `/api/instant-quote`
  has rate-limiting + origin allowlist + honeypot, but the pattern isn't applied or
  verified across the other list endpoints.

This serves the mission's **trust** pillar and its decision rule
(**trust/correctness first**): a store that leaks internal data or error internals
erodes exactly the confidence we compete on. It's the natural, already-scheduled
follow-up to `011`, and it's a **small, verifiable hardening slice** — not a
rewrite. The public contracts and the storefront behavior must stay **identical**;
only the safety of the responses changes.

## User stories

- As the **store owner**, I want our public API endpoints to never leak internal
  database columns or raw error details, so a curious visitor or competitor can't
  learn our internal data model or infrastructure from a browser.
- As a **developer on the team**, I want one consistent validation + error +
  whitelist pattern across the public endpoints (like the GMC feed already has), so
  new endpoints are safe by default and the safe path is the obvious one.
- As a **shopper**, I want the site to keep working exactly as it does today —
  same search, filters, detail data — while being safer underneath.

## Scope

- **In:** an **audit** (documented catalog) plus **hardening** of the public,
  unauthenticated, DB-reading endpoints:
  `/api/tires`, `/api/tire`, `/api/brands`, `/api/ranges`,
  `/api/dimensions/heights`, `/api/dimensions/sizes`, `/api/dimensions/widths`,
  `/api/instant-quote`.
  Hardening covers four consistent controls:
  1. **Input validation** at the boundary with **Zod** (query params / body),
     replacing ad-hoc parsing — reject or safely coerce malformed input.
  2. **Output whitelisting** — responses expose only intended fields; no raw
     `SELECT *` record reaches the client (fix `/api/tires`; confirm the others).
  3. **No error leakage** — clients get generic messages + correct status; full
     detail is logged server-side with Winston (already imported).
  4. **Abuse protection** — confirm/enforce pagination & request-size caps across
     list endpoints consistently.
- **Out:**
  - **Authenticated `dashboard/*` endpoints** and their AI-chat routes — behind a
    session; separate concern.
  - **`checkout/*`, `login`, `auth/[...nextauth]`** — payment/auth flows with their
    own review track.
  - Any **change to a public contract** (response shape/fields the storefront reads,
    query-param names, status codes for existing happy paths).
  - A full **API gateway / WAF**, a new rate-limiting service, or auth on public
    reads.
  - Business-logic or query changes (the tire filter/business rule stays as-is).

## Functional requirements

- **FR1 (audit):** Produce a short catalog (in the feature docs) of each in-scope
  endpoint's current state across the four controls (validation, whitelist, error
  handling, abuse), so the gaps and the fixes are traceable.
- **FR2 (no error leakage):** On failure, every in-scope endpoint returns a
  **generic** message with the correct HTTP status and **never** the raw
  `err.message`/stack; full error detail is logged server-side.
- **FR3 (output whitelisting):** No in-scope endpoint returns internal-only DB
  columns. `/api/tires` list items expose only the fields the storefront needs
  (the same safe set already used elsewhere), never the raw `DocumentRecord`.
- **FR4 (input validation):** Each endpoint validates its inputs with Zod at the
  boundary; malformed input yields a clean `400` (or a safe documented default),
  never an unhandled `NaN`/crash, and never reaches the DB layer malformed.
- **FR5 (abuse caps):** Every list endpoint enforces a bounded result/pagination
  size; request bodies (e.g. `/api/instant-quote`) are size-bounded. Existing
  protections (page-size cap, instant-quote rate-limit/honeypot) are preserved.
- **FR6 (contract preserved):** The storefront and all existing callers keep
  working unchanged — same happy-path response shapes, field names, and statuses.

## Acceptance criteria (testable)

- [ ] **AC1 (audit documented):** The feature docs contain a per-endpoint table of
      before/after for the four controls; every gap has a corresponding fix.
- [ ] **AC2 (generic errors):** For each endpoint, a forced internal failure
      returns a generic body (no `err.message`, no stack, no connection string) with
      the right status, and the full error is logged. _(Unit test per handler with a
      mocked throwing dependency asserts the body is generic.)_
- [ ] **AC3 (no raw fields):** Each `/api/tires` record contains **only** the
      `transformTireData` whitelist (`TireId, Code, Brand, Model2, RealSize,
      Image1..4, Price, BrandId, ProductTypeId, Patched, RemainingLife, Tread,
      KindSaleId`) and **none** of `VaultName, Local, Trash, Amount, DOT,
      ModificationDate, ConditionId` (and `/api/tire` likewise). _(Unit test asserts
      record keys ⊆ whitelist and excludes each internal column.)_
- [ ] **AC4 (input validated, resilient):** Optional bad inputs are **coerced to a
      safe default** — non-numeric `page`/`pageSize` clamp to valid values, `NaN`
      dimension filters are ignored (unfiltered result), never a 500 from a
      downstream `NaN`/parse. Missing/invalid **required** inputs (e.g. `/api/tire`
      `productId`) return a clean `400`. _(Unit tests over each endpoint's Zod
      boundary.)_
- [ ] **AC5 (caps enforced, no new read limits):** `pageSize` above the max is
      clamped (not honored); list endpoints can't be coerced into unbounded results;
      `/api/instant-quote` still rate-limits and rejects oversized bodies (new
      body-size cap). Read endpoints add **no** per-IP rate-limiting. _(Unit tests.)_
- [ ] **AC6 (contract intact):** Golden happy-path responses match today's shape
      for each endpoint (same fields the storefront reads); a manual pass of home,
      `/tires` (search + filters), and a detail page shows identical behavior.
- [ ] **AC7 (DoD):** `npx tsc --noEmit` + `npm run lint` + `npm test` +
      `npm run build` all green; new tests cover the hardened logic.

## Non-functional / constraints

- **Trust/correctness first** (mission tie-break): prefer shipping less over
  shipping something that misrepresents or leaks. A safe default beats a clever fix.
- **Reuse before creating:** build on `withLogging`, `buildTireFilters`/
  `buildBrandFilters`, `paginationUtils` (`MAX_PAGE_SIZE`), the
  `mapTireRecordToSingleTire` whitelist pattern, and the `011` feed approach. Zod is
  already a dependency.
- **Zero contract drift:** the storefront must not need any change; this is
  invisible to end users except via correctness/safety.
- **Small, verifiable:** a handful of handlers + a shared validation/whitelist
  helper + tests; verified by unit tests and a manual storefront pass.
- **Server-only secrets** stay server-only; no new client-exposed values.

## Clarifications resolved (2026-07-09)

The guiding rule for every decision: **harden internally, change nothing the client
consumes**. Verified against the actual consumers before deciding.

- **`/api/tires` list whitelist → the exact fields `transformTireData` reads.**
  The storefront consumes `/api/tires` as `{ records }` and transforms them
  client-side via `transformTireData` (`transformTireData.ts:8-48`), which reads
  only: `TireId, Code, Brand, Model2, RealSize, Image1..4, Price, BrandId,
  ProductTypeId, Patched, RemainingLife, Tread, KindSaleId`. We keep the `{ records }`
  shape but each record is trimmed to exactly this set — internal columns
  (`VaultName, Local, Trash, Amount, DOT, ModificationDate, ConditionId`) drop off.
  The client transform keeps working unchanged (all fields it reads remain). We do
  **not** move the transform server-side (that would change the contract).
- **Rate limiting → keep, don't extend to reads.** Preserve `/api/instant-quote`'s
  limiter + the `pageSize` cap. Do **not** add per-IP rate-limiting to the read
  endpoints — behind a CDN/shared IP it could block legitimate shoppers. Reads are
  protected by caching + platform + bounded result sizes.
- **`/api/instant-quote` body → permissive Zod (`passthrough`) + size cap.**
  Validate the required fields (as today) and add a request-body size cap, but keep
  forwarding unknown/extra fields to the n8n webhook. No strict schema that could
  drop fields n8n expects.
- **Malformed-input policy → coerce + safe default for optional params; `400` only
  for genuinely required/invalid.** Bad `page`/`pageSize` → clamp to a valid value;
  `NaN` dimension filters → ignore the filter (return unfiltered), never a 500.
  Reserve `400` for missing/invalid required inputs (e.g. `/api/tire` `productId`).
  This keeps the storefront resilient and always-responding.

_No blocking unknowns remain — ready for `/plan`._

---

_The WHAT and WHY only. The HOW lives in [plan.md](./plan.md)._
