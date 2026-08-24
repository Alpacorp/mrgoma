# Spec — A tire says where it actually is

> Feature: `027-tire-city` · Status: Implemented · Created: 2026-08-24
> Roadmap: reported defect · Branch: `feat/027-tire-city`

> **Gates compressed on purpose.** This is a reported defect with a known cause,
> not a new capability. The investigation that `/specify` and `/plan` would have
> produced was done before any code was written and is recorded below; `/clarify`
> ran as two questions to the owner. `/analyze` would have had nothing to
> cross-check that this document does not already state.

## Why — problem & value

Reported from production. This page —
`/tires/299189-bridgestone-245-50-19` — ends its description with:

> Free shipping. **Available at MrGoma Tires in Miami, FL.**

That tire is in **Clifton**, which is Orlando.

The sentence was a hardcoded literal in `tireDescription.ts`, in a function that
was never given the warehouse at all. It could not have been right except by
coincidence.

**793 of 4.157 sellable tires — one in five — are in Orlando** (`Clifton`,
`Semoran`, `Orlando`) and every one of them named Miami.

### It was wider than the page

`generateTireDescription` has three consumers, and the wrong city reached all of
them:

| Surface | What it feeds |
| --- | --- |
| `TireInformation.tsx` | the visible Description block — what was reported |
| `/tires/[slug]` | the **Product JSON-LD** Google reads |
| `merchantFeed.ts` | the **Google Merchant feed** Shopping ads are built from |

And two more sentences said it independently, both added in `025`:

- `productDescription()` — `"… tire in Miami for $155."` (the meta description)
- `productSocialTitle()` — `"… Tire in Miami | $155 | Free Shipping"` (the
  WhatsApp and social card)

So a wrong city was being published on the storefront, in structured data, in
social previews and in a shopping feed.

## Scope

- **In:** every per-tire sentence that names a city, and the plumbing that carries
  the warehouse to them.
- **Out:** the site-wide claims (`"7 locations in Miami & Orlando"`, the home
  page, the store pages). Those are about the business and are correct.
- **Out:** the ~985 feed items that carry a **seller-written** `Description`.
  Those override the generated sentence and name no city; they never said Miami
  either, so this is unchanged rather than unfixed.

## The rule

Confirmed with the owner, 2026-08-24:

| `VaultName` | City |
| --- | --- |
| `Clifton`, `Semoran`, `Orlando` | **Orlando** |
| everything else | **Miami** |

Two were checked rather than assumed, because between them they hold half the
catalog:

- **`Warehouse`** — 1.771 sellable tires, 43% of the catalog, and a name that says
  nothing about where it is. Confirmed Miami.
- **`Pembroke WH`** — 657 tires, and Pembroke Pines is Broward County, not
  Miami-Dade. Confirmed Miami, because the metro area is what a buyer recognises.

## Functional requirements

- **FR1:** Every per-tire sentence naming a city derives it from that tire's
  warehouse.
- **FR2:** The city is derived **server-side and exposed as a city** — never as
  the warehouse name. `pickTireListFields` already keeps `VaultName` off the
  public list API and the `GmcItem` whitelist keeps it out of the feed; a buyer
  needs to know where the tire is, not what the warehouse is called inside.
- **FR3:** The feed's query selects `VaultName` so the city can be derived, and
  the whitelist still prevents it being serialized.
- **FR4:** An unknown or missing warehouse falls back to Miami — the status quo
  and the larger group — but the fallback is documented as a gap, not an answer.

## Acceptance criteria (testable)

- [x] **AC1:** `storeCity` returns `Orlando` for each of the three Orlando
      warehouses and `Miami` for each of the seven others, ignoring case and
      surrounding whitespace.
- [x] **AC2:** **Each of the three per-tire builders returns different text for
      the same tire in the two cities.** Stated over *variation* rather than over
      wording: a builder that ignores its city fails this even if the Miami
      sentence is still spelled correctly. This is the assertion the original
      defect would have failed.
- [x] **AC3:** `mapTireRecordToSingleTire` sets `city` from `VaultName` and the
      warehouse name appears nowhere in the mapped object.
- [x] **AC4:** A feed item built from an Orlando warehouse says Orlando, and the
      warehouse name is not serialized anywhere in it.
- [x] **AC5:** `buildFeedQuery()` selects `VaultName`.
- [x] **AC6:** A seller-written `Description` still wins over the generated one.
- [x] **AC7:** The reported tire (`Clifton`) says Orlando on all four surfaces,
      and a `Hialeah` tire still says Miami.

## Non-functional / constraints

- **The fallback is the same shape as the bug.** A warehouse opening in Kissimmee
  would silently read as Miami until someone adds it to the list. There is no way
  to detect that from code — the test suite cannot reach the database — so it is
  handled by naming all ten warehouses explicitly in one file, where a reader can
  see the whole set.
- No change to page weight; `perf:budget` unchanged.

---

_The record of what shipped lives in [results.md](./results.md)._
