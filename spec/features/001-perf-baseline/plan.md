# Plan — Performance baseline

> Feature: `001-perf-baseline` · Based on: [spec.md](./spec.md) · Created: 2026-06-30

## Technical approach

This is a **measurement-and-documentation** feature — **no application code
changes**. We produce `baseline.md`: a reproducible snapshot of Core Web Vitals on
the three production routes, plus a ranked offenders table that seeds P1.1–P1.7.

- **Source of truth:** **PageSpeed Insights** (PSI) — gives lab (Lighthouse) +
  field (CrUX) for a public URL, per the spec. Run each route for **mobile** and
  **desktop**.
- **Field data:** CrUX via PSI (URL-level, falling back to origin-level when the
  URL lacks samples) + **GA4 Web Vitals** if those events exist in the property.
  Field is authoritative for **INP** (lab has no INP — record **TBT** as the lab
  proxy and label it as such).
- **Diagnostics PSI doesn't fully give (LCP element, specific CLS culprits):**
  confirm with **Chrome DevTools** (Lighthouse panel + Performance/Insights) per
  route.
- **Variance control:** PSI lab is a single run; take **3 runs per route/form
  factor and record the median** (note run-to-run spread).
- **Provenance:** record the production **commit/deployment** measured and the
  date, so the baseline is reproducible and comparable after fixes.

## Reuse first

Docs-only feature, so nothing to reuse from the component library. It does reuse:

- The **CWV targets** and **performance budget** already fixed in
  `spec/tech-stack.md` (LCP < 2.5s · INP < 200ms · CLS < 0.1).
- The **roadmap phase ids** (P1.1–P1.7) as the mapping target for offenders.
- The **grounded code map** below (from a read-only exploration of the routes) so
  the offenders are tied to real files, not guesses.

## Files to add / change

- **Add** `spec/features/001-perf-baseline/baseline.md` — the recorded results
  (metrics tables + diagnostics + offenders table).
- **Add** `spec/features/001-perf-baseline/raw/` (optional) — PSI JSON exports
  and/or screenshots per route/form factor, for auditability.
- **No source files touched** (satisfies AC4).

## Data & flow (measurement procedure)

Inputs (from spec): base `https://www.mrgomatires.com`, routes `/` and `/tires`;
**detail URL still `[PENDING]`** — needed before running.

1. **Fix the target build.** Note the current production commit/deploy (so the
   numbers map to a known state).
2. **Per route × {mobile, desktop}** run PSI (3×, median). Capture:
   - Score; **LCP, CLS** (lab+field), **INP** (field) / **TBT** (lab proxy);
     supporting **FCP, Speed Index, TTFB**, total JS transferred.
   - The **LCP element** and the **top CLS contributors** (DevTools if PSI is
     insufficient).
3. **Field pull.** CrUX (URL, else origin) via PSI; GA4 Web Vitals report if
   configured (document if it isn't).
4. **Write `baseline.md`:** an environment/provenance header + one metrics table
   per route (mobile/desktop columns) + per-route diagnostics (LCP element, CLS
   sources) + the ranked offenders table.
5. **Offenders → phases.** Rank issues by impact and map each to the roadmap phase
   that will address it.

## Grounded offender hypotheses (to confirm by measurement)

From the codebase map — these seed the offenders table; measurement confirms/ranks.

**Home `/`** (server component; hero embeds the 3D selector)
- **LCP** — hero `<video>` poster `banner-hero.webp`; **no `priority` image**
  anchoring LCP (`(home)/container/Home/Home.tsx:107`). → **P1.1**
- **INP/TBT** — three.js `TireScene` (`@react-three/*`, ~150 KB) in the hero on
  desktop + stacked root providers' hydration (`SearchBySize`/`TirePreview3D`). →
  **P1.5 / P1.6**
- **CLS** — `PromoBanner` (localStorage show/dismiss) collapsing the Services
  block after hydration. → **P1.4**

**Listing `/tires`** (top-level `'use client'` `SearchResults`, client refetch)
- **LCP** — first tire card remote image (`priority` on first 2,
  `TireCard.tsx:106`) vs the SSR dark-hero `<h1>`; remote-host latency dominates.
  → **P1.1 / P1.2**
- **INP** — hydration + interaction cost of the large `SearchResults` client
  component (pagination/filter effects, client refetch to `/api/tires`). →
  **P1.6 / P1.7**
- **CLS** — stock-count chip / `ResultsHeader` reflow when `totalCount` resolves +
  `PromoBanner` + skeleton→results swap. → **P1.4**

**Detail `/tires/[slug]`** (top-level `'use client'` `Detail`, client fetch)
- **LCP** — main image is **`priority={false}`** AND only fetched **client-side**
  (`/api/tire`, `no-store`) after hydration (`ProductImageZoom.tsx`,
  `detail/container/Detail/Detail.tsx`). Biggest single lever. → **P1.1 + P1.7**
- **INP/TBT** — `TreadWearExplorer` three.js `TreadScene` + `ProductImageZoom`
  lens/fullscreen layer, on a fully client-rendered page. → **P1.5 / P1.6**
- **CLS** — skeleton→content swap (breadcrumb label, hero badges, right-column
  price/specs) resolving after the client fetch. → **P1.4**

**Cross-cutting** — `/tires` and `/tires/[slug]` do their own **client-side data
fetching** on top-level client components; this is the biggest structural LCP/INP
lever and likely a **P1.7** (data/routes: move fetch server-side) theme beyond the
per-route fixes.

## Acceptance criteria → implementation

| AC  | How it's met                                                                                      | How it's verified                                                        |
| --- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| AC1 | PSI runs (3× median) for `/`, `/tires`, detail × mobile/desktop recorded in `baseline.md`          | Open `baseline.md`: LCP/INP/CLS present for 3 routes × 2 form factors     |
| AC2 | Per-route LCP element + top CLS contributors captured (PSI + DevTools)                             | Each route section names its LCP element and CLS sources                  |
| AC3 | Ranked offenders table with a roadmap-phase column (P1.1–P1.7)                                     | Every table row has a phase mapping                                       |
| AC4 | Only files under `spec/features/001-perf-baseline/` are added                                      | `git diff --stat` shows no `src/**` changes                              |
| AC5 | Provenance header: tool+version, device/throttling, exact URLs, commit/deploy, date               | Header present and complete; a second run reproduces within noted variance |

## Tradeoffs / alternatives

- **PSI vs Lighthouse CLI vs WebPageTest.** Chose **PSI** (lab **and** field, matches
  the spec, zero setup). Lighthouse CLI is more scriptable/reproducible but gives
  **no field data**; WebPageTest gives richer waterfalls but is heavier. We use
  DevTools only to fill the LCP-element / CLS-source gap.
- **Field vs lab.** Field (CrUX/GA4) reflects real users but needs traffic; lab is
  always available but synthetic. We record **both** and flag coverage.
- **Single vs multiple runs.** Median of 3 to tame PSI lab variance, accepting a
  bit more manual effort.

## Risks

- **Sparse CrUX** — a newer domain may lack URL-level (or even origin-level) field
  data → document coverage and lean on lab where field is missing.
- **GA4 Web Vitals may not be wired** — if the property has no Web-Vitals events,
  note it (and flag "add web-vitals RUM" as a possible follow-up, out of scope
  here).
- **Run-to-run variance** — mitigated by median-of-3 and recording spread.
- **Moving target** — a deploy mid-measurement invalidates comparisons; pin the
  commit and re-run affected routes if it changes.

## Out of scope

- Any optimization or code change (P1.1 onward).
- CI performance budget / gates (P1.8).
- Adding a web-vitals RUM library (possible follow-up if GA4 lacks field INP).

---

_The concrete steps live in [tasks.md](./tasks.md)._
