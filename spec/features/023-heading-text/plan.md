# Plan — Headings that read as words

> Feature: `023-heading-text` · Based on: [spec.md](./spec.md) · Created: 2026-08-18

## Technical approach

One substitution, eleven times, plus a guard so there is never a twelfth.

```jsx
-  {text}
-  <br />
-  <span className="…">{more}</span>
+  {text}{' '}
+  <span className="block …">{more}</span>
```

`022` established this building the store headings: `display: block` produces the
line break, and the `{' '}` keeps a real space in the text content. Nothing about
the rendered result changes — same two lines, same sizes — and the string stops
reading as `MICHELINTires`.

The three neighbours are independent one-liners: a heading level on the guides
card, an `aria-label`, and the field feeding a breadcrumb.

## Reuse first

| Existing thing | Used for | Instead of |
| --- | --- | --- |
| The `block`-span substitution from `022` | FR1, FR2, FR3 | Inventing a second way to break a heading |
| The `*.guard.test.ts` source-walking pattern | AC1, AC7 | Per-file assertions that miss the twelfth |
| `guidesConfig` as the single home for a guide's names | FR6, FR7 | A second name field somewhere else |
| The existing `<h3>` on the home page's guide cards | FR4 | Deciding a level from scratch — the home page already got it right |
| `MenuHeader`'s `aria-label="Close menu"` | FR5 | Choosing new wording; its sibling already sets the convention |

## The eleven headings, and the two shapes they come in

**Shape A — text, break, span.** Eight of them. The span gets `block`, a `{' '}`
goes before it.

```
tires/brands/[brand]     {brandName} · Tires
tires/used               Used Tires · Miami & Orlando
tires/new                New Tires · Miami & Orlando
locations/page           Our Locations · Miami & Orlando
services/page            Auto Services · Miami & Orlando
guides/page              Tire Guides · & Tips
services/[service]       {service.title} · Miami & Orlando, FL
SearchResults (×2)       both branches of the conditional
```

**Shape B — span, break, bare text.** One of them, and it needs a wrapper because
there is no element on the second line to put `block` on:

```jsx
// tires/size/[size]
<span className="text-[#9dfb40]">{originalSize}</span>
<br />
Tires in Miami
```

**Two that need more than the mechanical swap:**

- **`/contact`** — `Contact` `<br/>` `<span className="text-[#9dfb40]">MrGoma</span> Tires`.
  The green span is followed by more text **on the same visual line**. Putting
  `block` on the green span would drop " Tires" to a third line. The second line
  needs its own wrapper with the green span inside it.
- **`/about-us`** — **two** `<br />`s, three lines (`About` / `MrGoma` / `Tires`),
  and the middle one carries an inline `WebkitTextStroke`. Two substitutions, and
  the stroke style must survive.

`SearchResults` is the only client component in the set; the rest are server
components.

## Files to add / change

**The eleven headings** — `tires/brands/[brand]/page.tsx`,
`tires/size/[size]/page.tsx`, `tires/used/page.tsx`, `tires/new/page.tsx`,
`locations/page.tsx`, `tires/container/SearchResults.tsx`, `services/page.tsx`,
`guides/page.tsx`, `contact/container/Contact/Contact.tsx`,
`about-us/container/AboutUs/AboutUs.tsx`,
`services/[service]/container/ServiceDetail/ServiceDetail.tsx`.

**`guides/page.tsx`** — additionally, the card's `<h2>` becomes `<h3>` (T092). One
edit covers all seven cards; the three section `<h2>`s and the CTA `<h2>` at
line 112 stay as they are.

**`ui/components/HamburgerMenu/HamburgerMenu.tsx`** — `aria-label="Abrir menú de
navegación"` → `"Open navigation menu"`, matching `MenuHeader`'s `"Close menu"`.

**`guides/guidesConfig.ts`** — `title` → `heading`, `headline` → `cardName`, and
`how-to-buy-used-tires` becomes `How to Buy Used Tires` in both.

**Seven call sites** for the rename:

| File | Today | Becomes |
| --- | --- | --- |
| `guides/[slug]/page.tsx:127` (`<h1>`) | `guide.title` | `guide.heading` |
| `guides/[slug]/page.tsx:59` (Article JSON-LD) | `guide.title` | `guide.heading` |
| `guides/[slug]/page.tsx:43` (breadcrumb JSON-LD) | `guide.headline` | **`guide.heading`** |
| `guides/[slug]/page.tsx:90` (visible breadcrumb) | `guide.headline` | **`guide.heading`** |
| `guides/[slug]/page.tsx:243` (related list) | `guide.headline` | `guide.cardName` |
| `guides/page.tsx:163` (card) | `guide.headline` | `guide.cardName` |
| `Home.tsx:352` (card) | `guide.title` | **`guide.cardName`** |

Three of those are behaviour changes, not renames — marked in bold. The two
breadcrumbs move from the card name to the heading, which is FR6. And
**`Home.tsx` turns out to have been showing the heading in a card** while
`/guides` showed the card name, so the same guide has carried two names across two
card grids. The rename is what makes that visible; switching it to `cardName`
is what makes the two grids agree.

**Tests** — `headings.guard.test.ts` (new) for AC1 and AC7; render tests for the
five templates that need no database; `guides` naming assertions extended in a
new `guideNames.test.ts`.

## How each heading gets verified

Five of the eleven are server components over static config and render in a test
with nothing mocked: `services/page`, `guides/page`, `locations/page`, `Contact`,
`AboutUs`.

`brands/[brand]` and `size/[size]` await the database, and `ServiceDetail` and
`SearchResults` take props. For those the guard (AC1) is the standing protection —
it walks the source and fails on a `<br />` inside any heading, so it covers all
eleven regardless of testability — and the rendered output is confirmed once
against the production build (AC11).

That split is stated rather than glossed: **AC2's "no two words joined" is
asserted by rendering for five templates and by the absence of `<br />` for the
other six.**

## Data & flow

No database, no API, no client state, no new dependency. `guidesConfig` is static
TypeScript. Every change is markup or config.

## Acceptance criteria → implementation

| AC | How it's met | How it's verified/tested |
| --- | --- | --- |
| AC1 | All eleven substitutions | `headings.guard.test.ts`: walks `src/app/**/*.tsx`, extracts every `<h1>`–`<h6>` body, fails on `<br`. Covers levels 2–6 too, so the next one cannot arrive in an `<h2>` |
| AC2 | `{' '}` at each former break | Render tests on the five DB-free templates assert the heading's text content has no `wordWord` join; the guard covers the rest |
| AC3 | `brands/[brand]` substitution | Guard, plus AC11 against the built page: `MICHELIN Tires` |
| AC4 | `size/[size]` substitution, with the wrapper Shape B needs | Guard, plus AC11: `235/50/20 Tires in Miami` |
| AC5 | Only the contents change | Render tests assert the `<h1>`'s `className` still carries its size and weight tokens; the diff shows no wrapper class touched |
| AC6 | Card `<h2>` → `<h3>`, one edit in the local `GuideCard` | `guides/page` render test: exactly one `<h1>`, **four `<h2>`s** — three sections and the call-to-action at line 112, which does not move — and seven `<h3>`s |
| AC7 | One `aria-label` corrected | `headings.guard.test.ts`: no assistive-technology string carries a Spanish accented character, and none carries a word from a named list. **Not "is it Spanish"** — `"Cerrar menu"` is indistinguishable from English to a regex, and promising otherwise is the criterion `022` had to reject. The limit is written into the test's own doc comment. Verified red by restoring the old label |
| AC8 | Breadcrumbs fed from `heading` | `guideNames.test.ts`: for all seven, the breadcrumb JSON-LD name and the visible trail equal the `<h1>` |
| AC9 | Article JSON-LD already used the heading field | Same test: `headline` in the Article node equals the `<h1>`. Holds today and must survive the rename |
| AC9b | Card names left alone | Same test: **asserts at least one guide's `cardName` differs from its `heading`**, so a later flattening has to argue with a test |
| AC10 | No client code added | tsc + lint + test + build + `perf:budget`, expected unchanged |
| AC11 | — | Manual: 360 px, each heading breaks where it did; select and copy one |
| AC12 | — | Manual: screen reader on the mobile menu button and one heading |

## Tradeoffs / alternatives

**Keeping `<br />` and adding `{' '}` beside it.** Rejected. It produces the space
but leaves the `<br />`, so the guard could not simply forbid `<br />` in a
heading — the rule would have to be "a `<br />` must be preceded by whitespace",
which is far easier to get wrong and impossible to read at a glance.

**A shared `<TwoLineHeading>` component.** Rejected. The eleven differ in colour,
size, inline styles and structure — one has three lines, one has a conditional,
one has trailing text after the span. A component covering all of that would take
more configuration than the markup it replaces.

**Flattening the seven guides' card names into their headings.** Rejected, and
`AC9b` now asserts against it. A card in a grid wants a short name; those seven
were chosen. The defect was the breadcrumb, not the pair.

**Renaming only `headline`.** Rejected. `title` driving an `<h1>` is the more
misleading of the two — "title" reads as the metadata title, which is a third,
different string on the same guide.

## Risks

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| A heading breaks differently than before, because `block` and `<br />` are not identical in edge cases | Medium | `block` on a span produces the same break for these layouts; AC11 checks all eleven at 360 px, which is where a difference would show first |
| `/contact` or `/about-us` regress, being the two non-mechanical ones | Medium | Called out above; both get render tests, and `/about-us` has an inline stroke style that must survive |
| The rename misses a call site | Low | TypeScript fails on every one — the fields are required on a typed config, so a missed site cannot compile |
| The Spanish guard false-positives on a proper noun or an address | Low | It checks assistive-technology strings only, never body copy, and there is exactly one match in the tree today |
| The Spanish guard **false-negatives** on unaccented Spanish | **Certain** | Accepted and stated: no regex tells `"Cerrar menu"` from English. The guard catches accented Spanish and a named word list, which covers the string that exists and the likeliest next ones. Written into the test so nobody reads it as full coverage |
| `Home.tsx` switching to `cardName` changes what the home page shows | **Certain, and intended** | The home page shows the heading in a card today while `/guides` shows the card name. AC11 includes looking at it |

## Out of scope

- What the headings **say** — only how they are spelled out.
- `<br />` outside headings.
- Structured data beyond the two guide nodes already touched (block 4).
- The tire detail titles, URL consolidation (block 5), and `017`.

---

_The concrete steps live in [tasks.md](./tasks.md)._
