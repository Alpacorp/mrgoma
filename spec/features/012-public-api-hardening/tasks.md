# Tasks — Public API security hardening (audit + consistent controls)

> Feature: `012-public-api-hardening` · Based on: [plan.md](./plan.md) · Created: 2026-07-09

Ordered, **very small, independently verifiable** tasks. Check each off as done.
Guiding rule: harden internally, change nothing the client consumes.

- [x] **T1** — Shared error responder. New `src/app/api/_lib/apiError.ts`: `jsonError(status, publicMessage, err?)` → logs full detail via `logger.error` (Winston) and returns `NextResponse.json({ message: publicMessage }, { status })` (generic body, never `err.message`/stack). · files: `src/app/api/_lib/apiError.ts` · check: `tsc` green; unit test in T10.
- [x] **T2** — Tire-list whitelist. New `src/repositories/tireListFields.ts`: `type TireListRecord` + pure `pickTireListFields(record)` returning ONLY `TireId, Code, Brand, Model2, RealSize, Image1, Image2, Image3, Image4, Price, BrandId, ProductTypeId, Patched, RemainingLife, Tread, KindSaleId` (the exact `transformTireData` field set). · files: `src/repositories/tireListFields.ts` · check: unit (T10) asserts keys ⊆ whitelist and internal cols absent.
- [x] **T3** — Harden `/api/tires`. Map `result.records` through `pickTireListFields` (keep `{ records, totalCount }` shape); replace the `err.message` catch with `jsonError(500, 'Failed to fetch tires', err)`. · files: `src/app/api/tires/route.ts` · check: response records carry only whitelist; forced throw → generic 500 (T10).
- [x] **T4** — Harden `/api/tire`. Replace the `err.message` catch with `jsonError(500, 'Failed to fetch tire', err)`. Keep the `productId` presence check (400) and the safe mapper. · files: `src/app/api/tire/route.ts` · check: existing `tire/route.test.ts` still green + forced throw → generic 500.
- [x] **T5** — Harden `/api/brands` + `/api/ranges`. Replace both `err.message` catches with `jsonError(500, …, err)`. · files: `src/app/api/brands/route.ts`, `src/app/api/ranges/route.ts` · check: forced throw → generic 500 (T10).
- [x] **T6** — Harden `/api/dimensions/heights`. Replace the `err.message` catch with `jsonError`. (No params to validate.) · files: `src/app/api/dimensions/heights/route.ts` · check: forced throw → generic 500.
- [x] **T7** — Validate + harden `/api/dimensions/sizes` and `/api/dimensions/widths`. Parse `height`/`width` with `z.coerce.number().positive().optional().catch(undefined)` so non-numeric → `undefined` (ignored filter, never `NaN` to the query); replace `err.message` catches with `jsonError`. · files: `src/app/api/dimensions/sizes/route.ts`, `src/app/api/dimensions/widths/route.ts` · check: `?height=abc` → 200 unfiltered (no 500); forced throw → generic 500 (T10).
- [x] **T8** — Body-size cap on `/api/instant-quote`. Reject bodies over a generous cap (e.g. `Content-Length` guard + capped read) with a clean `413`/`400` before JSON.parse; keep required-field validation, rate-limit, origin allowlist, honeypot, and the `...payload` passthrough to n8n; replace the final `err.message` catch with `jsonError`. · files: `src/app/api/instant-quote/route.ts` · check: oversized body → rejected; valid quote still forwarded (T10).
- [x] **T9** — Audit doc. Ensure the per-endpoint before/after table (from plan.md) is present in the feature docs as the AC1 artifact. · files: `spec/features/012-public-api-hardening/plan.md` (table already there) · check: table maps every gap→fix.
- [x] **T10** — Tests. New: `src/app/api/_lib/apiError.test.ts` (generic body, logs, status), `src/repositories/tireListFields.test.ts` (whitelist keys + internal cols absent), `src/app/api/tires/route.test.ts` (records whitelisted + generic 500), dimensions `sizes`/`widths` route tests (`?height=abc` ignored, generic 500), brands/ranges error tests, instant-quote body-cap test. Mirror the `tire/route.test.ts` mock pattern (`vi.mock` the repo; no DB import). · files: the above `*.test.ts` · check: `npm test` green, all new cases covered.
- [x] **T11** — Docs. Update `spec/roadmap.md`: mark "Public-API security review" 🟡/✅ with the `012` reference. · files: `spec/roadmap.md` · check: roadmap reflects the item.
- [x] **T-DoD** — Definition of Done: `npx tsc --noEmit` + `npm run lint` + `npm test` + `npm run build` all green. **Manual check:** home, `/tires` (search + filters + client-side pagination/reload), and a detail page behave identically; inspect a `/api/tires` response in devtools → no `VaultName`/`Local`/`Trash`/`Amount`/`ModificationDate`/`ConditionId`; a forced error shows a generic message. Leave changes **staged, not committed**, until the owner confirms.

## Traceability

| Task            | Acceptance criteria |
| --------------- | ------------------- |
| T9              | AC1                 |
| T1, T3–T8       | AC2                 |
| T2, T3          | AC3                 |
| T7 (+ existing coerce) | AC4          |
| T8 (+ existing caps)   | AC5          |
| T2, T3, T-DoD   | AC6                 |
| T10             | AC2, AC3, AC4, AC5, AC6 |
| T-DoD           | AC6, AC7            |

_Every AC is covered: AC1 (T9), AC2 (T1/T3–T8/T10), AC3 (T2/T3/T10), AC4 (T7/T10), AC5 (T8/T10), AC6 (T2/T3/T10/T-DoD), AC7 (T-DoD)._
