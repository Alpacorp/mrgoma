# Plan — One way to describe a page

> Feature: `021-page-metadata-og` · Based on: [spec.md](./spec.md) · Created: 2026-08-18

## Technical approach

The shape of this feature is **completion and deletion**, not construction.
`seo.ts` already holds the right mechanism; this finishes it and removes the
fifteen hand-rolled metadata objects that grew up beside it.

1. **Complete `pageMetadata()` (FR1, FR8).** Two fields — `images` and `locale` —
   plus an optional per-page image override. That one edit gives ~400 pages an
   `og:image` and an `og:locale` they have never had, because they were always
   asking through this function.

2. **Add a builder per remaining page, and delete its inline object (FR2, FR6).**
   Each of the fifteen becomes a `pageMetadata()` call in `seo.ts`, matching the
   shape of `homeMetadata()`, `locationMetadata()` and the rest. That is what
   fixes the doubled brand: `pageMetadata` sets `title: { absolute }`, so the
   root `%s | MrGoma Tires` template stops appending a second copy.

3. **Move the copy into those builders (Decisions 1 and 3).** The audit's wording,
   with the brand stripped so `TITLE_SUFFIX` supplies it once — see *The title
   ladder* below.

4. **The two conversion pages (FR5, FR5b).** `/checkout` gains a canonical and
   keeps everything else. `/instant-quote` loses its `noindex`, gains full
   metadata, keeps its sitemap entry, and gets a footer link. A new guard makes
   the sitemap/`noindex` contradiction impossible to reintroduce.

Nothing renders differently except one footer anchor.

## Reuse first

| Existing thing | Used for | Instead of |
| --- | --- | --- |
| `pageMetadata()` in `seo.ts` | FR1, FR2, FR3, FR6 | Fifteen inline `Metadata` objects |
| `fitTitle(...)` | FR4, AC5 | Hand-counting characters |
| `fitDescription(head, tails)` | FR4 | Fixed description strings that overflow |
| `TITLE_SUFFIX` (` | MrGoma`) | FR3 | The audit's ` | MrGoma Tires`, 6 chars longer |
| `WARRANTY`, `SHIPPING`, `LOCATIONS_LABEL_LONG`, `INVENTORY_NETWORK` in `brandClaims` | FR9 | Hardcoding "4,000+" |
| `locationsConfig[].image` | FR8, AC15 | A new per-store image map |
| `defaultSections` in `Footer.tsx` | FR5, AC12 | New footer markup |
| `servicesConfig[].metaTitle` / `guidesConfig[].metaTitle` | Decisions 1, 3 | A second copy of the copy |
| `metadata.test.ts` `ENTRY_POINTS` | AC3, AC4 | A new test file |
| The `*.guard.test.ts` pattern | AC13, AC14, AC11b | Ad-hoc assertions |

The footer link is **one entry in `defaultSections`**, the array that already
drives the "Quick Links" and "Customer Service" columns. No markup, no component,
no styling decision — `FooterSection` already renders and styles these, focus ring
included. This is why the missing `modern-web-guidance` skill does not block the
feature: nothing here is a new interface.

## The title ladder

Every title is built as `fitTitle(candidate…)` with `TITLE_SUFFIX` appended, so
the width rule is enforced by the function rather than by counting. Computed:

| Page | Final title | Len |
| --- | --- | --- |
| `/` | `Used & New Tires Miami & Orlando — 30-Day Warranty \| MrGoma` | 59 |
| `/tires` | `Shop Tires by Size & Brand — Used & New \| MrGoma` | 48 |
| `/tires/used` | `Used Tires Miami & Orlando — 30-Day Warranty \| MrGoma` | 53 |
| `/services` | `Auto Services in Miami & Orlando \| MrGoma` | 41 |
| `/about-us` | `About MrGoma Tires — 7 Locations in Miami & Orlando \| MrGoma` | 60 |
| `/guides` | `Tire Guides: Buying, Safety & Maintenance \| MrGoma` | 50 |
| `/contact` | `Contact Us — 7 Locations in Miami & Orlando \| MrGoma` | 52 |
| guide `used-vs-new` | `Used vs. New Tires: Cost, Safety & Lifespan \| MrGoma` | 52 |
| guide `how-to-buy` | `How to Buy Used Tires: What to Check First \| MrGoma` | 51 |
| guide `read-size` | `How to Read Tire Size: 225/65R17 Explained \| MrGoma` | 51 |
| guide `safety-checklist` | `Used Tire Safety: 8-Point Inspection Checklist \| MrGoma` | 55 |

**Using our short suffix instead of the audit's is what makes them all fit.** The
audit writes ` | MrGoma Tires`; `TITLE_SUFFIX` is six characters shorter, and
`seo.ts` documents that it exists precisely so the differentiator gets the budget.

**One service title needs the ladder rather than a single string.** Keeping both
cities and the rig overflows:

```
64  Wheel Alignment Miami & Orlando — Hunter HawkEye Elite® | MrGoma   ✗
55  Wheel Alignment — Hunter HawkEye Elite®, Miami | MrGoma            ✓
```

So `fitTitle` is given the long form first and the second as fallback. **The rig
is never the candidate that gets dropped** — that is AC5, and it is the reason
the ladder is ordered this way rather than trimming from the right.

`/about-us` lands at exactly 60. `TITLE_MAX` is inclusive, so it passes, but it
has no headroom: any future word added there fails AC4. Worth a comment at the
call site.

## Files to add / change

**`src/app/utils/seo.ts`** — the centre of the feature.

- `pageMetadata()` gains `images` (default `/opengraph-image`, 1200×630, alt) and
  `locale: 'en_US'`, plus an optional `image?: { url; alt }` override.
- `locationMetadata()` passes the store's photo through that override (FR8).
- New builders: `servicesMetadata()`, `serviceMetadata()`, `aboutMetadata()`,
  `guidesMetadata()`, `guideMetadata()`, `contactMetadata()`,
  `legalPoliciesMetadata()`, `checkoutMetadata()`, `instantQuoteMetadata()`.
- **`pageMetadata()` also gains an optional `type` and `publishedTime`.** The
  guide pages emit `og:type="article"` and `article:published_time` today —
  verified in production — and `pageMetadata` hardcodes `type: 'website'`.
  Migrating them without this would silently downgrade seven articles to generic
  pages and drop their publication dates, which is a regression dressed as a
  refactor. `guideMetadata()` passes both through.
- `homeMetadata()`, `tiresMetadata()` and `usedTiresMetadata()` take the new copy.

**Pages that lose their inline object and call a builder** — `/services`,
`/services/[service]`, `/about-us`, `/guides`, `/guides/[slug]`, `/contact`,
`/legal-policies`, `/checkout`, `/instant-quote`.

**`src/app/(shop)/instant-quote/page.tsx`** — `noindex` removed (Decision 2).

**`servicesConfig.ts` / `guidesConfig.ts`** — `metaTitle` values lose their
trailing brand so the builder appends it once, and take the audit's new wording.

**`src/app/ui/sections/Footer/Footer.tsx`** — one entry appended to the
"Customer Service" column: `{ label: 'Instant Quote', href: '/instant-quote' }`.

**`src/app/sitemap.ts`** — no change expected, but it is the subject of AC11b's
guard.

**Tests** — `metadata.test.ts` extended (its `ENTRY_POINTS` table grows to cover
every page); new `src/app/utils/pageMetadata.guard.test.ts` for AC14 and AC11b;
`seo.test.ts` extended for the store image.

## Data & flow

No database, no API, no client state. Every value is a constant or comes from
`servicesConfig`, `guidesConfig` or `locationsConfig`, all of which are static
TypeScript. The builders stay pure, so `metadata.test.ts` keeps running with no
`mssql` and no mocks — the property the spec names as a constraint.

The store image is the only new indirection: `locationMetadata()` receives the
`image` path the caller already has from `locationsConfig` and passes it to
`pageMetadata`, which resolves it with `absUrl()`. No lookup, no I/O.

## Acceptance criteria → implementation

| AC | How it's met | How it's verified/tested |
| --- | --- | --- |
| AC1 | `images` + `locale` added to `pageMetadata` | `metadata.test.ts`: every entry in `ENTRY_POINTS` declares an image with width, height and alt, and `locale === 'en_US'` |
| AC2 | The fifteen pages call builders that set `url` from the same path as the canonical | `metadata.test.ts`: `openGraph.url === alternates.canonical`, table-driven over all entries |
| AC3 | `title: { absolute }` via `pageMetadata`, brand supplied once by `TITLE_SUFFIX` | `metadata.test.ts`: count of `MrGoma` occurrences in each title is ≤ 1, over the whole set |
| AC4 | `fitTitle` / `fitDescription` | Existing width assertions, now covering every page rather than the commercial subset |
| AC5 | `fitTitle` ladder, rig-first | `metadata.test.ts`: the wheel-alignment title contains `Hunter HawkEye Elite®` **and** fits `TITLE_MAX` |
| AC6 | One builder call per service, fed from `servicesConfig` | `metadata.test.ts`: the eight titles are pairwise distinct and each contains its service name |
| AC7 | New home copy | `metadata.test.ts`: exact string match, plus assertions for both cities and the warranty — replacing the current "approved copy" test, which is amended not deleted |
| AC8 | New `/tires` copy | `metadata.test.ts`: `/tires` title ≠ home title by more than one word; description contains "size" and "brand" |
| AC9 | Copy draws numbers from `brandClaims` | `brandClaims.test.ts`'s existing inventory guard already walks `src/`; extended to catch a bare `N,000+` in a description |
| AC10 | `checkoutMetadata()` | `metadata.test.ts`: canonical is `/checkout`; `robots.index === false` still |
| AC11 | `instantQuoteMetadata()`, `noindex` removed | `metadata.test.ts`: canonical is `/instant-quote`, title ≠ root default, no `noindex` |
| AC11b | Guard | New guard over `sitemap.ts`'s **static** list — the ~17 fixed paths, not the dynamic groups: every one resolves to a builder whose `robots.index` is not `false` |
| AC12 | One entry in `defaultSections` | `Footer.test.tsx`: a link with href `/instant-quote` renders; existing focus/keyboard assertions cover the rest since it reuses `FooterSection` |
| AC13 | Builders derive canonical from the same path the sitemap publishes | Guard: for each **static** sitemap path, the builder's canonical equals `absUrl(path)`. The dynamic groups — 2.000 tires, 272 sizes, 113 brands, and the service, location and guide slug lists — are covered structurally instead: each derives its canonical from the same slug the sitemap publishes, which `020` established for sizes |
| AC14 | No page spells the brand in a plain `title:` | Guard: walks `src/app/**/page.tsx` and fails a plain `title:` containing `MrGoma`. `/login`'s bare `'Seller Portal'` must pass — it is the correct pattern and is documented as such at its call site |
| AC14b | Indexable pages delegate to `seo.ts` | Same guard: a page that does **not** declare `noindex` and hand-rolls a metadata object fails. The exemption is read from the page's own `robots` declaration, not from a list someone maintains |
| AC15 | `locationMetadata()` override | `seo.test.ts`: each of the seven produces an `og:image` equal to `absUrl(store.image)`, and the file exists on disk |
| AC16 | Only `<head>` and the footer change | Reviewed in the diff; no page component is touched except `instant-quote/page.tsx` (metadata only) and `Footer.tsx` |
| AC17 | No client code | `npx tsc --noEmit` + `npm run lint` + `npm test` + `npm run build` + `npm run perf:budget`, budget expected at **166.0 / 617.2 KB** |
| AC18 | — | Manual, **before merge**: Search Console export of the affected pages |
| AC19 | — | Manual, after deploy: share a store, a brand and a size link into a real WhatsApp chat |

## Tradeoffs / alternatives

**Setting `openGraph` once in the root layout and never in a segment.** Rejected —
it is what produces the bug. Next replaces rather than merges, so any page needing
its own `og:url` would still lose the rest. Completing the helper is the fix that
survives the next page.

**Leaving the fifteen inline and just adding the missing fields to each.**
Rejected. It works today and reintroduces the same defect the first time someone
adds a page, which is what FR6 and AC14 exist to prevent.

**Taking the audit's copy verbatim.** Rejected in two places, both recorded in the
spec: the home title would have dropped the warranty `014` was built to add, and
`/tires`' description would have hardcoded a stock figure the catalog can
contradict. The audit's *intent* is adopted in both.

**Per-page `og:image` for brand and size pages.** Deferred. It needs a generation
pipeline; the seven stores are done here only because their photos already exist
in config.

**Leaving `/instant-quote` `noindex` and dropping it from the sitemap.** This was
the cheaper resolution of the contradiction and was put to the owner explicitly.
They chose to make it a landing page instead. Recorded in spec Decision 2 with the
earlier reasoning, so the reversal is legible.

## Risks

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| A title regresses below the width but loses its differentiator | Medium | `fitTitle` ladders are ordered differentiator-first; AC5 pins the one case where it matters most |
| `/about-us` sits at exactly 60 and any future edit breaks AC4 | Medium | A comment at the call site; AC4 covers every page so the failure is immediate and named |
| Changing fifteen titles moves rankings the wrong way | Medium | AC18 captures the baseline before merge, as `020` did. These are defect corrections, but the measurement is what lets us tell |
| Removing `noindex` from `/instant-quote` exposes a thin page | Low–Medium | It gains real metadata and a footer link in the same change. If it underperforms, reverting is one line and the earlier reasoning is recorded |
| A store's photo path in config does not exist on disk | Low | AC15 asserts the file exists, so a bad path fails the build rather than shipping a broken preview card |
| The AC14 guard is too strict and blocks a legitimate page | Low | It only rejects a `title:` that is neither `{ absolute }` nor a builder call; `not-found` and error pages are exempted explicitly |

## Out of scope

- Store titles, descriptions and H1s (T047–T053, T063–T069, T085–T091) — block 2.
- The H1 spacing defect (T072–T084) — block 3.
- Structured data (T009–T022) — block 4.
- URL consolidation (T006, T007, T017) — block 5.
- Per-page images for brand and size pages.
- **The tire detail page.** Left alone deliberately, not because it is correct:
  its title is **100 characters** in production and Google truncates it before the
  price and "Free Shipping" that `014` added. 1.622 pages, worse than anything in
  this feature, and it needs its own baseline — see spec, *Out*.

---

_The concrete steps live in [tasks.md](./tasks.md)._
