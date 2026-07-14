# Plan — Public API security hardening (audit + consistent controls)

> Feature: `012-public-api-hardening` · Based on: [spec.md](./spec.md) · Created: 2026-07-09

## Technical approach

Two shared, reusable helpers plus small per-endpoint edits. No contract changes,
no business-logic changes. The grounding audit narrowed the real gaps (some
controls are already fine — noted below), so the work is targeted.

**Audit result (grounds the fixes):**

| Endpoint | Input validation | Output whitelist | Error handling | Abuse caps |
| --- | --- | --- | --- | --- |
| `/api/tires` | ✅ already safe (`validatePageSize` clamps; `safeInt`→undefined on NaN; `code` guarded `^\d+$`) | 🔴 returns raw `SELECT *` `DocumentRecord` (leaks `VaultName, Local, Trash, Amount, DOT, ModificationDate, ConditionId`) | 🔴 returns `err.message` (route.ts:47-48) | ✅ `MAX_PAGE_SIZE` |
| `/api/tire` | 🟡 presence-only `productId` (param is SQL-parameterized, so injection-safe) | ✅ `mapTireRecordToSingleTire` (safe shape) | 🔴 returns `err.message` (:25-26) | ✅ single record |
| `/api/brands` | ✅ via `buildBrandFilters` | ✅ brand strings | 🔴 `err.message` (:23-24) | ✅ cached, bounded |
| `/api/ranges` | ✅ no params | ✅ min/max aggregates | 🔴 `err.message` (:22-23) | ✅ cached |
| `/api/dimensions/heights` | ✅ no params | ✅ dimension values | 🔴 `err.message` (:22-23) | ✅ cached |
| `/api/dimensions/sizes` | 🔴 `parseFloat`→`NaN` unguarded → bad query | ✅ values | 🔴 `err.message` (:33-34) | ✅ cached |
| `/api/dimensions/widths` | 🔴 `parseInt`→`NaN` unguarded → bad query | ✅ values | 🔴 `err.message` (:27-28) | ✅ cached |
| `/api/instant-quote` | 🟡 manual field checks; no body-size cap | ✅ forwards to webhook | 🔴 `err.message` (:149-150) | ✅ rate-limit + origin + honeypot |

So: **error leakage is the one universal gap** (all 8); **raw records** is
`/api/tires` only; **input** gaps are the two numeric dimensions + instant-quote
body size. Everything else is already adequate and stays untouched.

## Reuse first

- **`withLogging`** (`api/_lib/withLogging.ts`) — already wraps every handler and
  logs `http_request` with status/level. Keep it.
- **`validatePageSize` / `MAX_PAGE_SIZE`** (`paginationUtils.ts`) — already
  coerce-and-clamp; reused as-is (no change).
- **`buildTireFilters` / `safeInt`** (`filterUtils.ts`) — already NaN-safe and has
  the `code` injection guard; reused as-is.
- **`transformTireData`** (`transformTireData.ts:8-48`) — the source of truth for
  the client-consumed field set → defines the `/api/tires` whitelist.
- **`mapTireRecordToSingleTire`** — existing safe-shape mapper for `/api/tire`.
- **Zod** (already a dependency) — for the dimension coercion + instant-quote body.
- The **`011` feed approach** (whitelist + generic errors) — same philosophy.

## Files to add / change

- **NEW `src/app/api/_lib/apiError.ts`** — shared error responder:
  `jsonError(status: number, publicMessage: string, err?: unknown)`. Logs full
  detail server-side via Winston (`logger.error`) and returns
  `NextResponse.json({ message: publicMessage }, { status })` — a **generic** body,
  never `err.message`/stack. One place, used by every handler's catch.
- **NEW `src/repositories/tireListFields.ts`** — `TireListRecord` type (the exact
  `transformTireData` field set) + `pickTireListFields(record): TireListRecord`
  that returns only: `TireId, Code, Brand, Model2, RealSize, Image1, Image2,
  Image3, Image4, Price, BrandId, ProductTypeId, Patched, RemainingLife, Tread,
  KindSaleId`. Pure, testable.
- **CHANGE `src/app/api/tires/route.ts`** — map records through
  `pickTireListFields` before responding (keep `{ records, totalCount }` shape);
  replace the `err.message` catch with `jsonError(500, 'Failed to fetch tires', err)`.
- **CHANGE `src/app/api/tire/route.ts`** — replace the `err.message` catch with
  `jsonError(500, 'Failed to fetch tire', err)`. (Output already safe; input
  parameterized — leave the presence check, optionally add a light numeric guard.)
- **CHANGE `src/app/api/brands/route.ts`, `ranges/route.ts`,
  `dimensions/heights/route.ts`** — replace `err.message` catches with `jsonError`.
- **CHANGE `src/app/api/dimensions/sizes/route.ts`, `dimensions/widths/route.ts`** —
  validate `height`/`width` with a Zod coerce schema (`z.coerce.number().positive()
  .optional().catch(undefined)`) so `NaN`/garbage → `undefined` (ignored filter, as
  today's intent), never passed as `NaN`; replace `err.message` with `jsonError`.
- **CHANGE `src/app/api/instant-quote/route.ts`** — add a **body-size cap** (reject
  bodies over a small limit, e.g. via `Content-Length` check + capped read) with
  `413`/`400`; keep the existing required-field validation, rate-limit, origin
  allowlist and honeypot; keep forwarding extra fields to n8n (permissive); replace
  the final `err.message` catch with `jsonError`.
- **NEW tests** — `apiError.test.ts` (generic body + logs), `tireListFields.test.ts`
  (whitelist keys, excludes internal cols), and per-route tests
  (`tires/route.test.ts`, dimensions `sizes`/`widths` route tests, brands/ranges
  error tests, instant-quote body-cap test) mirroring the existing
  `tire/route.test.ts` mock pattern (`vi.mock` the repo so no DB import).
- **DOCS** — add the audit table to the feature docs; update `spec/roadmap.md`
  (mark the Public-API security review item in progress/done).

## Data & flow

No route/DB/business changes. Per request: same inputs, same happy-path outputs —
except (a) `/api/tires` records are trimmed to the whitelist before serialization,
(b) failures return a generic message (full detail to Winston), (c) numeric
dimension params that are non-numeric are ignored rather than passed as `NaN`,
(d) oversized instant-quote bodies are rejected. The client `getTires` +
`transformTireData` path is unaffected because every field it reads survives the
whitelist.

## Acceptance criteria → implementation

| AC  | How it's met | How it's verified/tested |
| --- | ------------ | ------------------------ |
| AC1 (audit) | The table above lives in plan + feature docs | Review; it maps every gap→fix |
| AC2 (generic errors) | `jsonError` in every catch; logs server-side | Per-route test: mocked throw → body is generic (no `err.message`), status right |
| AC3 (no raw fields) | `pickTireListFields` whitelist on `/api/tires`; `/api/tire` already mapped | Unit: record keys ⊆ whitelist; asserts `VaultName`/`Local`/`Trash`/`Amount`/`DOT`/`ModificationDate`/`ConditionId` absent |
| AC4 (input resilient) | Zod coerce+catch on dimensions; existing clamp/`safeInt` elsewhere; `400` for missing `productId` | Unit: `?height=abc` → ignored (no 500); `productId` missing → 400 |
| AC5 (caps, no new read limits) | Keep `validatePageSize` + instant-quote limiter; add body-size cap; no new read limiter | Unit: `pageSize=9999` clamps; oversized quote body → rejected; reads have no per-IP limiter |
| AC6 (contract intact) | Shape unchanged; whitelist ⊇ what UI reads | Golden-shape unit tests + manual pass of home/`/tires`/detail |
| AC7 (DoD) | Full gate | `tsc`+`lint`+`test`+`build` green |

## Tradeoffs / alternatives

- **Whitelist records vs. move transform server-side.** Chosen whitelist (keep
  `{ records }`, client keeps transforming) — zero contract change. Moving the
  transform server-side is cleaner long-term but changes the client and risks
  availability; rejected for this slice.
- **Shared `jsonError` helper vs. inline edits.** Chosen shared helper — one safe
  path, consistent, easy to test, and the obvious default for future endpoints.
- **Coerce-and-default vs. strict `400` on optional params.** Chosen
  coerce-and-default (mission: keep the storefront resilient/available); strict
  `400` reserved for genuinely required inputs.
- **No new rate-limiting on reads.** Per-IP limiting behind CDN/shared IPs risks
  blocking real shoppers; caching + caps + platform already cover reads.
- **Permissive instant-quote body (passthrough) + size cap** vs strict schema —
  strict could drop fields n8n expects; size cap gives the abuse protection without
  that risk.

## Risks

- **Whitelist drops a field the UI needs.** Mitigated: the whitelist is derived
  field-for-field from `transformTireData`; a golden-shape test + manual `/tires`
  pass confirm parity. If the AI-chat or another consumer reads a raw field, the
  test/manual pass catches it (checked: `SiteAiChat`/listing use the transform).
- **`jsonError` hides a status a caller depended on.** Mitigated: only the error
  **body** changes; statuses stay the same (500/400/404 as today).
- **Body-size cap too tight for a legit quote.** Mitigated: cap set generously
  (quotes are tiny); tuned with a comment.

## Out of scope

- Authenticated `dashboard/*` (incl. AI-chat), `checkout/*`, `login`,
  `auth/[...nextauth]` — separate review.
- New rate-limiting service / API gateway / WAF; auth on public reads.
- Moving the tire-list transform server-side; any query/business-rule change.

---

_The concrete steps live in [tasks.md](./tasks.md)._
