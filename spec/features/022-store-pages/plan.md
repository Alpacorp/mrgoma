# Plan — Seven stores that read like one

> Feature: `022-store-pages` · Based on: [spec.md](./spec.md) · Created: 2026-08-18

## Technical approach

Nothing new is invented. Every fact these pages should be saying is already in
`locationsConfig` — the street is inside `address`, the neighbourhoods are in
`neighborhoods`, the city is in `city` — and none of it reaches the metadata
builder. The work is to pass it through and to compose from it.

1. **Titles (FR1).** `locationMetadata()` swaps its `{name} Tire Shop` ladder for
   one that names the product and the state.

2. **Descriptions (FR2).** The same builder takes `address` and `neighborhoods`,
   derives the street, drops the entries that do not belong in a "serving" list,
   and feeds the existing `fitDescription` ladder. Seven descriptions that differ
   in *substance* fall out of that automatically — no per-store copy to maintain.

3. **The `<h1>` (FR3).** Composed in `LocationDetail` from `name`, in two visual
   lines. **Not with `<br />`** — see below, this is the one real trap.

4. **East Orlando (FR4).** Two edits in config, plus a guard so no store can claim
   a landmark its address contradicts.

## Reuse first

| Existing thing | Used for | Instead of |
| --- | --- | --- |
| `locationMetadata()` in `seo.ts` | FR1, FR2 | A second metadata path for stores |
| `fitTitle(...)` / `fitDescription(head, tails)` | FR1, FR2 | Hand-counting characters |
| `locationsConfig[].address` / `.neighborhoods` / `.city` | FR2, FR7 | New copy fields per store |
| `TITLE_SUFFIX`, `WARRANTY`, `SHIPPING` in `brandClaims` | FR1, FR2 | Literal brand strings |
| `getLocationBySlug()` | tests | Repeating the store list |
| `metadata.test.ts`'s location entries | AC1–AC4 | A new test file |
| The `*.guard.test.ts` pattern | AC7, AC8 | Ad-hoc assertions |

## The one real trap: how the two-line `<h1>` is built

T085–T091 ask for the area name large with the rest on a secondary line **inside
the same `<h1>`**. There is already a component that does exactly that —
`ServiceDetail`:

```tsx
<h1 …>
  {service.title}
  <br />
  <span className="text-gray-500 text-2xl sm:text-3xl font-bold">…</span>
</h1>
```

**Copying it would introduce the defect block 3 exists to remove.** `<br />` is a
line break, not whitespace: the element's text content comes out as
`Wheel AlignmentMiami & Orlando, FL`, with no space, which is exactly what the
crawl reported for thirteen pages. Building the store headings that way would add
seven more.

So the second line is produced with **`className="block"` on the span** and a real
`{' '}` before it. CSS does the breaking; the text keeps its space:

```tsx
<h1 className="…same classes as today…">
  MrGoma Tires {location.name}{' '}
  <span className="block text-2xl sm:text-3xl font-bold text-gray-300">
    Used &amp; New Tires
  </span>
</h1>
```

Text content: `MrGoma Tires Hialeah Used & New Tires`. Two lines on screen, one
readable string to a crawler and a screen reader. The wrapper's classes are
untouched, which is what AC10 checks.

This also gives block 3 its answer: the fix there is the same substitution, not a
`{' '}` patch beside a `<br />`.

## The generated copy, computed

**Titles** — `Used & New Tires in {name}, FL` + `TITLE_SUFFIX`, all inside 60:

| Store | Len |
| --- | ---: |
| Cutler Bay | 43 |
| Hialeah | 40 |
| Coral Gables | 45 |
| East Orlando | 45 |
| Miami Airport | 46 |
| Miami Gardens | 46 |
| Orlando West Colonial | 54 |

**Descriptions** — `Used and new tires on {street}, every used tire with a 30-day
warranty. Serving {a}, {b} and {c}. Walk-ins welcome, same-day installation.`,
with the tail shortened by `fitDescription` where needed. All seven land in
145–157:

```
153  cutler-bay             …on S Dixie Hwy…      Serving Palmetto Bay and South Miami.
153  miami-airport          …on NW 27th Ave…      Serving Allapattah and Midtown Miami.
157  miami-gardens          …on NW 2nd Ave…       Serving Hollywood, Aventura and Opa-locka.
157  coral-gables           …on South Le Jeune Rd… Serving Westchester and West Miami.
153  hialeah                …on E 10th Ct…        Serving Miami Springs and East Hialeah.
145  orlando-west-colonial  …on W Colonial Dr…    Serving Winter Garden, Metrowest and West Orlando.
155  east-orlando           …on N Semoran Blvd…   Serving Azalea Park and Winter Park.
```

Two derivations do the work:

- **Street** — the first comma-separated part of `address` with the house number
  stripped: `18200 S Dixie Hwy, Miami, FL 33157` → `S Dixie Hwy`. All seven
  addresses share that shape.
- **Served list** — `neighborhoods` minus the store's own `name` (saying "Cutler
  Bay serves Cutler Bay" wastes the space) and minus any entry beginning
  `Near ` — because *"Serving Allapattah, Midtown Miami and Near Miami
  International Airport"* does not read as English.

## Files to add / change

**`src/app/utils/seo.ts`** — `locationMetadata()` gains `address` and
`neighborhoods`, and the two derivations above. Still pure: they are string
operations on values the caller already holds.

**`src/app/(shop)/locations/[location]/page.tsx`** — passes the two new fields;
it already has `loc` in hand.

**`src/app/(shop)/locations/[location]/container/LocationDetail/LocationDetail.tsx`**
— the two-line `<h1>`, wrapper classes unchanged.

**`src/app/(shop)/locations/locationsConfig.ts`** — three changes:

- East Orlando's `neighborhoods`: `Near Orlando International Airport` →
  `Near Orlando Executive Airport`.
- East Orlando's visible `description`: leads with Semoran Blvd and names
  Executive behind it (spec Decision 2).
- **`h1` is removed.** It is used in exactly one place and holds the same value
  as `name` in all seven stores — a redundant second name for a store, which is
  what FR7 exists to prevent. The heading composes from `name`.

**Tests** — `metadata.test.ts` extended for AC1–AC4;
`storeFacts.guard.test.ts` (new) for AC7, AC8 and AC9;
`LocationDetail.test.tsx` (new) for AC5, AC6 and AC10.

## Data & flow

No database, no API, no client state. `locationsConfig` is static TypeScript, the
builders stay pure, and `metadata.test.ts` keeps running with no `mssql` and no
mocks — the property the spec names as a constraint.

## Acceptance criteria → implementation

| AC | How it's met | How it's verified/tested |
| --- | --- | --- |
| AC1 | New title ladder in `locationMetadata` | `metadata.test.ts`: each of the seven contains `Tires` and `FL` and fits `TITLE_MAX` |
| AC2 | The store name varies | `metadata.test.ts`: `new Set(titles).size === 7` |
| AC3 | Street + served list fed to `fitDescription` | `metadata.test.ts`: each description contains that store's derived street and ≥1 of its `neighborhoods`, and sits in the description window |
| AC4 | Descriptions differ in street **and** neighbourhoods, not only in a name | `metadata.test.ts`: for every ordered pair, substituting A's name, city and street into A's description never yields B's. The templating test — today's copy fails it |
| AC5 | `<h1>` composed from `name` plus a product line | `LocationDetail.test.tsx`: heading text contains the brand and `Tires`, and is not equal to `name` |
| AC6 | One heading element, as today | `LocationDetail.test.tsx`: exactly one `role="heading"` at level 1 |
| AC7 | Config edited in both places | `storeFacts.guard.test.ts`: no file pairs `east-orlando` with `Orlando International`; covers the visible copy and `neighborhoods` |
| AC8 | Guard over config, not a manual review | `storeFacts.guard.test.ts`: for each store, every `Near …` neighbourhood and every landmark in its description is checked against its own `city`; an Orlando store may not claim a Miami landmark or the reverse |
| AC9 | The builder needs both fields | `storeFacts.guard.test.ts`: every store has a non-empty `address` with a derivable street, and ≥2 neighbourhoods after filtering — a new store missing either fails |
| AC10 | Wrapper classes untouched; the break is CSS | `LocationDetail.test.tsx`: the `<h1>`'s `className` still contains `text-4xl`, `sm:text-5xl`, `lg:text-6xl` and `font-black`; and **the heading's text contains a space between the name and the product line** — the block-3 defect, asserted so it cannot be introduced here |
| AC11 | No client code | tsc + lint + test + build + `perf:budget`, expected unchanged |
| AC12 | — | Manual, **before merge**: Search Console export for the seven stores and their queries |
| AC13 | — | Manual, after deploy: URL Inspection on `/locations/orlando-west-colonial` |
| AC14 | — | Manual, at 28 days: impressions and CTR for the seven. **Flat is a finding** |

## Tradeoffs / alternatives

**Writing seven descriptions by hand into config.** Rejected. It is how the
current template got seven near-identical strings in the first place, it puts a
store's facts in two places (FR7), and an eighth store would arrive with none.
Composing from `address` and `neighborhoods` makes divergence the default.

**The audit's second title variant.** T049 and T052 propose
`Tires & Auto Service in …` for Hialeah and East Orlando, and H1s reading
**"MrGoma Tires Automotive"**. That string appears **nowhere in this repository** —
it is presumably those stores' Business Profile names. If it is their real
registered name it matters for local search, but it is a claim about the business
that cannot be checked from here, so all seven get one phrasing and the question
goes to the owner. Adopting it unverified would put a possibly-wrong business name
on two pages.

**Copying `ServiceDetail`'s `<br />` heading.** Rejected — it is the block-3
defect, and this would add seven instances of it.

**Keeping the `h1` config field.** Rejected. Identical to `name` in all seven, read
in one place; keeping it means two names per store and one of them silently
authoritative.

## Risks

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| An address stops matching the "number then street" shape and the street derives wrong | Low | AC9 fails the build for any store whose street cannot be derived; all seven match today |
| A store has too few neighbourhoods once its own name and `Near …` are filtered | Low–Medium | Coral Gables and East Orlando already drop to two; `fitDescription`'s ladder handles two, and AC9 fails below that |
| The longer `<h1>` wraps badly on a narrow phone | Medium | Second line is a smaller `block` span, which is what T085–T091 asks for; **this is the one thing worth checking with real eyes at 360 px** |
| The `Automotive` naming is real and we are dropping a correct business name | Medium | Not adopted, not discarded — recorded here and put to the owner. Reversible in one field |
| CTR does not move and the block looks like wasted effort | **Likely** | Anticipated in spec Decision 1: the airport error and the templating are worth fixing regardless, and AC14's flat result is the finding that redirects effort to `017` |
| `modern-web-guidance` is still absent while the largest element on seven pages changes | Medium | Copy-only change, wrapper classes asserted unchanged by AC10; recorded in spec Decision 3 |

## Out of scope

- Google Business Profile — `sameAs` (T013), reviews (T096) — blocked on `017`.
- Opening hours (T097): needs the owner to say which of three sources is right.
- The store schema's `@type` (T022) and the rest of structured data — block 4.
- The H1 spacing defect on the other thirteen pages (T072–T084) — block 3, whose
  fix is the substitution described above.
- The tire detail page's 100-character titles — its own item.

---

_The concrete steps live in [tasks.md](./tasks.md)._
