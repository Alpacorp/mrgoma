# Tasks — Performance baseline

> Feature: `001-perf-baseline` · Based on: [plan.md](./plan.md) · Created: 2026-06-30

Ordered, **very small, independently verifiable** tasks. Check each off as it is
completed.

> **Note:** this is a **docs-only / measurement** feature — no application code
> changes. There are no unit tests to add (measurement is manual); verification is
> the acceptance criteria plus confirming `src/**` is untouched. The final DoD is
> adapted accordingly.

- [x] **T1 — Collect inputs** · get the **detail URL** from the user and record the
  base + all three route URLs. · files: `baseline.md` · check: header lists `/`,
  `/tires` and the detail URL, no `[PENDING]` left.
- [x] **T2 — Scaffold `baseline.md`** · create the doc structure: provenance
  header, one metrics table per route (mobile/desktop columns), a per-route
  diagnostics block (LCP element, CLS sources), and an empty offenders table. ·
  files: `baseline.md` · check: file exists with all sections present (empty
  tables OK).
- [x] **T3 — Pin provenance** · record the production **commit/deployment**, the
  **date**, the **tool + version** (PageSpeed Insights), and the **device/
  throttling** profile (PSI mobile default + desktop). · files: `baseline.md` ·
  check: header is complete and reproducible (satisfies AC5).
- [x] **T4 — Measure Home `/`** · PSI ×3 (record **median + run-to-run spread**),
  mobile + desktop; record LCP,
  CLS, INP(field)/TBT(lab proxy), FCP, Speed Index, TTFB, total JS; identify the
  LCP element and top CLS sources (DevTools if needed). · files: `baseline.md`
  (+ `raw/`) · check: Home row complete for both form factors + diagnostics.
- [x] **T5 — Measure `/tires`** · same procedure. · files: `baseline.md`
  (+ `raw/`) · check: `/tires` row complete + diagnostics.
- [x] **T6 — Measure detail** (depends on T1) · same procedure on the detail URL. ·
  files: `baseline.md` (+ `raw/`) · check: detail row complete + diagnostics.
- [x] **T7 — Field data** _(coverage gap recorded — lab-only batch; no CrUX/GA4)_ · pull CrUX (URL-level, fall back to origin) per route;
  check whether GA4 has Web-Vitals events and record the field INP/LCP/CLS or note
  the coverage gap. · files: `baseline.md` · check: field columns filled or
  coverage explicitly noted.
- [x] **T8 — Offenders table** · rank the measured issues by impact and map each to
  a roadmap phase (P1.1–P1.7); confirm or correct the plan's hypotheses with the
  real numbers. · files: `baseline.md` · check: every offenders row has a phase
  mapping (satisfies AC3).
- [~] **T9 — Archive raw (optional)** _(skipped — the pasted PSI screenshots are the record)_ · save PSI JSON exports / screenshots per
  route/form factor. · files: `raw/*` · check: files present, or a line noting it
  was skipped.
- [x] **T10 — Confirm no source changes** · `git diff --stat` (or status) shows
  only `spec/features/001-perf-baseline/**`. · check: no `src/**` in the diff
  (satisfies AC4).
- [x] **T-DoD — Definition of Done (adapted)** · `src/**` untouched; run
  `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build` to confirm the
  repo is still green (trivially, since no code changed); `baseline.md` complete
  with valid internal links; every acceptance criterion in `spec.md` satisfied. ·
  check: all commands green and AC1–AC5 met.

## Traceability

| Task       | Acceptance criteria    |
| ---------- | ---------------------- |
| T1, T3     | AC5                    |
| T2         | scaffold for AC1–AC3   |
| T4, T5, T6 | AC1, AC2               |
| T7         | AC1 (field)            |
| T8         | AC3                    |
| T9         | AC5 (auditability)     |
| T10, T-DoD | AC4                    |
| T-DoD      | AC1–AC5 (final gate)   |
