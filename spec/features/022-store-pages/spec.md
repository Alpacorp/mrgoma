# Spec — Seven stores that read like one

> Feature: `022-store-pages` · Status: Clarified — ready for `/plan`
> Created: 2026-08-18 · Clarified: 2026-08-18
> Roadmap: Backlog (SEO — Screaming Frog audit, block 2) · Branch: `feat/022-store-pages`

## Why — problem & value

The seven store pages are the closest thing this business has to a shopfront in
search. They rank. They are seen. Almost nobody clicks them.

From the Search Console export taken on 2026-08-18, three months, Web:

| Page | Clicks | Impressions | CTR | Avg. pos |
| --- | ---: | ---: | ---: | ---: |
| `/locations/cutler-bay` | 22 | 5.590 | 0,39% | 3,61 |
| `/locations/miami-gardens` | 19 | 5.295 | 0,36% | 4,13 |
| `/locations/hialeah` | 4 | 3.284 | 0,12% | 3,89 |
| `/locations/coral-gables` | 3 | 3.062 | 0,10% | 3,66 |
| **`/locations/miami-airport`** | **0** | **2.757** | **0%** | **3,50** |
| `/locations/east-orlando` | 2 | 388 | 0,52% | 5,71 |
| **`/locations/orlando-west-colonial`** | — | **absent** | — | — |
| **Total (live stores)** | **50** | **20.376** | **0,25%** | |

Twenty thousand impressions in the top four positions produced **fifty clicks**.
One store — Miami Airport — was shown 2.757 times and clicked **zero** times.
Another — Orlando West Colonial — does not appear in the report at all: not low
performance, **absence**.

### What the pages themselves say

**The seven meta descriptions are one description.** `locationMetadata()` builds
them from a single template, so they differ only by store name and city:

```
MrGoma Tires Cutler Bay: like-new used and new tires, every used tire
backed by a 30-day warranty. Walk-ins welcome and same-day installation in Miami.
```

Nothing names the street the shop is on, the neighbourhoods it serves, or what is
different about going to that one rather than the next. The config already holds
all three — `address`, `neighborhoods`, `serving` — and none of it reaches Google.

**The seven `<h1>`s are the name of an area.** `Cutler Bay`. `Hialeah`. The most
prominent element on the page says neither what the business sells nor who it is.

**No store title says "used tires".** They read `Cutler Bay Tire Shop — 30-Day
Warranty | MrGoma`, while the highest-volume non-brand query on the whole site is
`used tires near me` at 2.697 impressions. The state abbreviation is missing too,
which local queries use.

**And one page sends people twenty kilometres the wrong way.** East Orlando is at
575 N Semoran Blvd, beside Orlando **Executive** Airport. The page — in its
visible copy *and* in its "areas served" list — says **Orlando International**.
Someone searching for tires near MCO who drives to this shop has made a wasted
trip. That is not a metadata defect; it is wrong information about a physical
place.

### The honest counter-evidence, before anyone promises a number

The audit projects that lifting these pages to a conservative 4% CTR would add
~945 clicks a quarter — **about +30% of the site's entire organic traffic**. That
arithmetic assumes the copy is the whole reason nobody clicks. The query data says
it is not:

| Query | Impressions | Clicks | CTR | Pos |
| --- | ---: | ---: | ---: | ---: |
| `mr goma tires` | 2.100 | 449 | **21,4%** | 1,2 |
| `mr goma` | 1.189 | 198 | **16,7%** | 1,8 |
| `mr goma tires us1` | 385 | 3 | **0,78%** | **1,1** |
| all `near me` / `cerca de mi` | 14.848 | 209 | **1,41%** | 6–8,4 |

The site earns a **21% CTR** when someone searches the brand. It earns **0,78% at
position 1.1** when someone searches the brand *plus a specific store*. A title
cannot explain that gap. What explains it is that a store-seeking query returns
the Business Profile — address, hours, directions, a call button — and the person
gets what they came for without a click.

**So this feature is a fix and a measurement.** The pages are genuinely
templated, the H1s genuinely waste the biggest element on the page, and one of
them is genuinely wrong about which airport it is near — all worth correcting on
their own terms. But if CTR does not move afterwards, that is the answer, not a
failure: it would mean the traffic lives in Google Business Profile, and the next
work is `017` rather than more copy. Either outcome is worth having.

### The one prediction that does not depend on CTR

Orlando West Colonial has **zero impressions** while the other six have thousands,
and the audit's own guidance for that case is to check whether Google has filed it
as a duplicate — which is exactly what seven near-identical descriptions invite.
If that is the cause, making the seven pages actually different is what gets a
whole store back into the index. That is not a CTR bet.

## User stories

- As **someone searching for a tire shop near them**, I want the result to tell me
  which street the shop is on and which neighbourhoods it covers, so that I can
  tell whether it is the one closest to me before clicking.
- As **someone who lands on a store page**, I want its headline to say what the
  business is and what it sells, not just the name of my suburb.
- As **someone looking for tires near an Orlando airport**, I want the site to
  name the one the shop is actually beside, so that I do not drive twenty
  kilometres to the wrong place.
- As **the site owner**, I want each store page to be visibly a different page, so
  that Google indexes all seven rather than treating six as copies of one.
- As **the site owner**, I want to know whether metadata is what is costing us
  these clicks, so that the next effort goes where the traffic actually is.

## Scope

**In:**

- Store **titles** (T047–T053): name the product and the state.
- Store **meta descriptions** (T063–T069): built from the street, the
  neighbourhoods and the city that `locationsConfig` already holds, so the seven
  differ in substance rather than in one word.
- Store **`<h1>`s** (T085–T091): say what the business is, keeping the visual
  design.
- **The East Orlando airport error** (T093), in both places it appears.
- A Search Console **baseline before merge**, and the follow-up measurement that
  decides whether block 2's premise held.
- Tests that fail if the seven ever collapse back into one template.

**Out:**

- **Google Business Profile** — `sameAs` (T013), reviews (T096), and the profile
  copy that repeats the airport error. Blocked on `017`, and see Decision 1: the
  evidence points there, but only the owner can unblock it.
- **Opening hours** (T097): the site says Sunday 10:00–16:00, Yelp says 09:00 for
  Cutler Bay. Three sources must agree — page, schema and profile — and only the
  owner can say which is right.
- `@type` on the store schema (T022) and the rest of the structured data —
  block 4.
- The tire detail page's 100-character titles — its own item.
- Any change to addresses, phones, coordinates or map links, which were verified
  store by store on 2026-08-04 and are not in question here.

## Functional requirements

- **FR1:** Each store title must name what is sold and where, including the state,
  and fit the width Google displays.
- **FR2:** Each store meta description must be **specific to that store** — its
  street and the neighbourhoods it serves — and must not be derivable from another
  store's by swapping a name.
- **FR3:** Each store `<h1>` must state the business and what it sells, not only
  the area name, **without changing the visual design of the hero**.
- **FR4:** The East Orlando page must name Orlando **Executive** Airport wherever
  it names an airport.
- **FR5:** No store page may claim a landmark, neighbourhood or road that its
  address does not support.
- **FR6:** All seven stores are treated alike — no store may be left on the old
  template.
- **FR7:** Copy comes from `locationsConfig`, which already holds the street,
  neighbourhoods, city and "areas served" for every store. This feature must not
  introduce a second place where a store's facts live.
- **FR8:** Requirements are covered by tests that fail if undone, following the
  guard pattern used for the WhatsApp number, the retired events and the founding
  year.

## Acceptance criteria (testable)

- [ ] **AC1:** Given each of the seven store titles, when read, then it contains
      the product term and the state, and fits `TITLE_MAX`.
- [ ] **AC2:** Given the seven titles, when compared, then all seven are distinct.
- [ ] **AC3:** Given each store meta description, when read, then it contains that
      store's street (from `address`) and at least one of its `neighborhoods`, and
      falls inside `DESCRIPTION_MIN`–`DESCRIPTION_MAX`.
- [ ] **AC4:** Given any two store descriptions, when one has its store name, city
      and street substituted for the other's, then the result is **not** equal to
      the other. This is the templating test: near-identical copy must fail it.
- [ ] **AC5:** Given each store `<h1>`, when its text content is read, then it
      contains the brand and a product term, and is not merely the area name.
- [ ] **AC6:** Given each store page, when rendered, then it still has exactly one
      `<h1>`.
- [ ] **AC7:** Given the whole source tree, when searched, then no file pairs East
      Orlando with "Orlando International Airport"; the guard covers the visible
      copy and the `neighborhoods` list, the two places it appears today.
- [ ] **AC8:** Given every store, when its `neighborhoods` and description are
      checked against its `address`, then no store claims an airport, road or city
      that its own address contradicts.
- [ ] **AC9:** Given `locationsConfig`, when a new store is added without a street
      or neighbourhoods, then the build fails rather than emitting a generic
      description (FR7).
- [ ] **AC10:** Given the store hero, when compared before and after, then the
      layout, type scale and spacing are unchanged — only the words differ
      (FR3).
- [ ] **AC11:** Given the full suite, build and performance budget, when run, then
      all are green and the JS budget is unchanged.
- [ ] **AC12 (manual, before merge):** Search Console export for the seven store
      pages and their queries, captured while the old copy is live.
- [ ] **AC13 (manual, after deploy):** URL Inspection on
      `/locations/orlando-west-colonial` to see whether its coverage state changes
      once the seven descriptions differ.
- [ ] **AC14 (manual, at 28 days):** Compare impressions and CTR for the seven.
      **A flat result is a finding, not a failure** — it would say the clicks are
      being taken by the Business Profile, and that `017` is where the next effort
      belongs.

## Non-functional / constraints

- **Reuse before creating.** `locationMetadata()` already builds these; the store
  facts already live in `locationsConfig`. This feature changes what they say, not
  where they live.
- **The builders stay pure.** `metadata.test.ts` guards every entry point with no
  database and no mocks; that must survive.
- **No client JavaScript.** Titles, descriptions and heading text are all
  server-rendered. The performance budget must not move.
- **Accessibility.** One `<h1>` per page, and the heading must still read
  sensibly to a screen reader when the visual design splits it across lines —
  the H1 spacing defect in block 3 is exactly that failure and must not be
  reintroduced here.
- **Correctness before conversion.** The mission ranks trust above performance
  above scope. The airport error is a correctness fix and ships regardless of what
  happens to CTR.

## Decisions taken during `/clarify`

**Decision 1 — block 2 ships now, and AC14 is the experiment that decides what
comes after.** The query data says the local pack is probably taking these clicks,
so the audit's +30% projection is not something to plan around. The block is still
worth doing on its own terms: the airport reference is **false**, the seven
descriptions really are one template, and a whole store may be missing from the
index because of it. It is cheap and almost entirely config. At 28 days, a flat
CTR is the finding that sends the next effort to `017` (Google Business Profile)
rather than to more copy — and that answer is worth having either way.

**Decision 2 — East Orlando leads with Semoran Blvd and names Executive Airport
as support.** The correction is not optional: 575 N Semoran Blvd is beside Orlando
**Executive**, and the page currently says **International**, 20 km away. But
"Executive" alone is a weak landmark — few people know it. The street is what
someone nearby actually navigates by, so it leads, with the airport named for
accuracy behind it. The error appears in **two** places for this store: the
visible `description` and the `neighborhoods` list.

**Decision 3 — `modern-web-guidance` is still not installed, and the H1 work
proceeds anyway, on the "words, not design" reading.**

Checked after the owner restarted the terminal on 2026-08-18:
`known_marketplaces.json` was rewritten at 19:46 and lists only
`claude-plugins-official`; there is no trace of `modern-web` anywhere under
`~/.claude`; `settings.json` has no `enabledPlugins`. The repository
(`GoogleChrome/modern-web-guidance`) does exist and returns HTTP 200, so the
command is valid — the marketplace add simply has not completed.

Proceeding is defensible rather than convenient: T085–T091 ask to **keep the
visual design and change the words**, and **AC10 verifies exactly that** — same
layout, same type scale, same spacing, only the text differs. Changing the text of
an existing heading is not designing a new interface. The gap is recorded here so
it is a decision rather than an omission, and if the skill becomes available
before `/plan` it will be consulted then.

## Open questions

_None. All three markers were resolved during `/clarify` — see **Decisions taken**
above. One item is deferred rather than unknown: the opening-hours discrepancy
(T097) needs the owner to say which of the three sources is right, and is out of
scope here._

---

_The WHAT and WHY only. The HOW lives in [plan.md](./plan.md)._
