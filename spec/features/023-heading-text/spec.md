# Spec — Headings that read as words

> Feature: `023-heading-text` · Status: Planned — ready for `/tasks`
> Created: 2026-08-18 · Clarified: 2026-08-18
> Roadmap: Backlog (SEO — Screaming Frog audit, block 3) · Branch: `feat/023-heading-text`

## Why — problem & value

The largest text on most pages of this site is not a sentence. It is two words
jammed together.

```
/tires                    New & UsedTires in Miami
/services                 Auto ServicesMiami & Orlando
/about-us                 AboutMrGomaTires
/guides                   Tire Guides& Tips
/contact                  ContactMrGoma Tires
/tires/brands/michelin    MICHELINTires
/tires/size/235-50-20     235/50/20Tires in Miami
/tires/used               Used TiresMiami & Orlando
/locations                Our LocationsMiami & Orlando
```

On screen they look right. The heading is split across two lines with a `<br />`,
and a `<br />` is a line break — **not whitespace**. So anything reading the text
rather than the pixels sees one run-on word: Google, a screen reader, and anyone
who selects the heading and copies it.

### The audit counted thirteen pages. It is closer to four hundred

T072–T084 lists thirteen. That is what the crawl happened to sample. The defect
lives in **eleven templates**, and three of them are the highest-volume routes on
the site:

| Template | Pages |
| --- | ---: |
| `tires/size/[size]` | **272** |
| `tires/brands/[brand]` | **113** |
| `services/[service]` | 8 |
| `/tires`, `/services`, `/about-us`, `/guides`, `/contact`, `/locations`, `/tires/new`, `/tires/used` | 8 |
| **Total** | **~401** |

Every brand page in the catalog says `MICHELINTires`. Every size page says
`235/50/20Tires in Miami`. Those are the pages `020` fought to keep in the index
and `021` gave preview cards to.

### Why it matters more than a typo

The `<h1>` is the strongest on-page signal about what a page is for, and it is the
first thing a screen-reader user hears when they jump by heading. `MICHELINTires`
is not a phrase anyone searches for and not a phrase anyone can parse aloud. The
mission puts **accessibility above performance above scope** and asks for WCAG 2.1
AA on key flows; a heading that reads as a nonsense token fails that on its own
terms, before any question of ranking.

**And the fix is already written.** `022` hit exactly this problem building the
store headings, and solved it: a `block` span with a real space instead of a
`<br />`. CSS does the line break, the string keeps its space. This feature
applies that substitution to the eleven templates that still have it.

### Three smaller defects in the same neighbourhood

**The guides list is one flat level.** `/guides` has eleven `<h2>`s: three are
section names (*Buying Guides*, *Rideshare Driver Guides*, *Maintenance Guides*)
and seven are the guide cards beneath them. A card inside a section is a level
below it, and marking both the same removes the structure a screen-reader user
navigates by (T092).

**The mobile menu speaks Spanish.** `HamburgerMenu` carries
`aria-label="Abrir menú de navegación"` on a site that declares `lang="en"` and
serves a US market. A screen reader announces it in the wrong language, and the
sibling control two files away already says `Close menu` in English — so this is
one outlier, not a convention (T098).

**A breadcrumb that disagrees with the heading above it.** On
`/guides/how-to-buy-used-tires` the breadcrumb reads *The Complete Buyer's Guide
to Used Tires* and the `<h1>`, three lines below it, reads *How to Buy Used
Tires: The Complete Guide*. A breadcrumb exists to tell you where you are; one
that names a different article than the heading does the opposite.

The audit reports this as one guide with three names (T100). Checking the config
showed **all seven guides carry two names** — a `title` and a `headline` — which
on inspection is not a defect: a card in a grid wants a short name and an `<h1>`
can afford a longer one, and that is what the field pair is for. **The defect is
that the breadcrumb is fed from the card name.**

Why it went unnoticed is still worth fixing: the field called **`title`** drives
the `<h1>`, and the field called **`headline`** drives cards and breadcrumbs. They
are named the opposite of what they do, so nobody editing one had reason to think
they were touching a heading.

## User stories

- As **someone using a screen reader**, I want a page's heading to be a phrase, so
  that jumping by heading tells me what the page is.
- As **someone copying a heading**, I want the words separated, so that what I
  paste is not `MICHELINTires`.
- As **someone navigating the guides by structure**, I want a card to sit below
  its section, so that the list has a shape rather than eleven equal items.
- As **Google**, I want the strongest on-page signal to contain the words people
  search for, rather than a token that appears nowhere else.
- As **a developer adding a two-line heading tomorrow**, I want the wrong way to
  be impossible to ship, so that this does not come back a twelfth time.

## Scope

**In:**

- Replacing `<br />` inside every `<h1>` with the substitution `022` established,
  across the eleven templates (T072–T084 and the templates the audit did not
  reach).
- The guides list's heading levels (T092).
- The Spanish `aria-label` on the mobile menu (T098).
- Making each guide's breadcrumb agree with its heading (T100), and renaming the
  two config fields so the next editor can tell which drives which.
- Shortening `how-to-buy-used-tires` to **`How to Buy Used Tires`** in its
  heading, card and breadcrumb (Decision 2).
- A guard that fails the build if a `<br />` appears inside a heading again.

**Out:**

- Any change to the **visual** design: the same two lines, the same type scale,
  the same spacing. Only the text content changes.
- Heading *copy* — what the headings say is not revisited here, only how it is
  spelled out. `/tires`, `/services` and the rest keep their words.
- `<br />` outside headings, which is not a defect.
- **Flattening the seven guides' card names into their headings.** They are
  deliberately shorter and stay that way — `AC9b` asserts it, so a later
  "consistency" pass has to argue with a test.
- The remaining audit blocks: structured data (block 4), URL consolidation
  (block 5), the tire detail titles, and Google Business Profile (`017`).

## Functional requirements

- **FR1:** No `<h1>`–`<h6>` may contain a `<br />`. Where a heading breaks across
  lines, the break is presentational and the text keeps its spaces.
- **FR2:** Every heading's text content must read as a phrase — words separated by
  single spaces, no two words joined.
- **FR3:** The visual result must be unchanged: same lines, same sizes, same
  spacing. This feature is invisible to a sighted user.
- **FR4:** On `/guides`, a guide card's heading must be one level below its
  section's.
- **FR5:** Every `aria-label` and every other assistive-technology string must be
  in English, matching the document's declared language.
- **FR6:** A page's breadcrumb must name the page the way its heading does. A
  card may carry a shorter name — that is deliberate — but the trail that says
  *where you are* has to agree with the heading you are looking at.
- **FR7:** The config fields behind FR6 must be named for what they do, so that
  editing a heading is recognisable as editing a heading.
- **FR8:** Each requirement is covered by a test that fails if it is undone,
  following the guard pattern used for the WhatsApp number, the retired event
  names, the founding year and the store facts.

## Acceptance criteria (testable)

- [ ] **AC1:** Given every `.tsx` file under `src/app`, when its headings are
      inspected, then none contains a `<br />`. This is the guard, and it must
      cover all six heading levels, not only `<h1>`.
- [ ] **AC2:** Given each of the eleven affected templates, when its heading is
      rendered, then the text content contains no two words joined — asserted as
      a space at each point where a `<br />` used to be.
- [ ] **AC3:** Given `/tires/brands/{brand}`, when rendered, then the heading text
      reads `{BRAND} Tires`, not `{BRAND}Tires`. Checked for a brand from the real
      config, not a fixture.
- [ ] **AC4:** Given `/tires/size/{size}`, when rendered, then the heading text
      reads `{size} Tires in Miami` with the space.
- [ ] **AC5:** Given every affected template, when the heading element's
      `className` is compared before and after, then it is unchanged (FR3).
- [ ] **AC6:** Given `/guides`, when its headings are read, then the three section
      names are `<h2>` and the seven card names are `<h3>`, and there is exactly
      one `<h1>`.
- [ ] **AC7:** Given every `aria-label`, `alt`, `title` and visually-hidden string
      in `src/app`, when read, then none is in Spanish. A guard, so the next one
      cannot ship either.
- [ ] **AC8:** Given every guide, when its breadcrumb — both the visible trail and
      the `BreadcrumbList` JSON-LD — is compared with its `<h1>`, then the two are
      the same string. Checked across all seven, not only the one the audit found.
- [ ] **AC9:** Given every guide, when its Article JSON-LD `headline` is compared
      with its `<h1>`, then they agree — Google treats a mismatch there as a
      misdescribed article. This holds today and must keep holding through the
      rename.
- [ ] **AC9b:** Given every guide, when its card name is read, then it may still
      differ from the heading. **This is asserted, not merely allowed**: the seven
      short card names were chosen, and a later "consistency" pass should have to
      argue with a test before flattening them.
- [ ] **AC10:** Given the full suite, build and performance budget, when run, then
      all are green and the JS budget is unchanged.
- [ ] **AC11 (manual):** On a phone at 360 px, each corrected heading still breaks
      where it did, with the same sizes — and selecting it copies a readable
      phrase.
- [ ] **AC12 (manual):** With a screen reader, the mobile menu button announces in
      English and one page's heading reads as a phrase.

## Non-functional / constraints

- **Reuse before creating.** `022` already solved this in
  `LocationDetail`; this applies the same substitution rather than inventing a
  second approach.
- **Accessibility is the point**, not a side effect. WCAG 2.1 AA, and the
  mission's ordering — trust, then accessibility, then performance, then scope.
- **No client JavaScript.** All of it is server-rendered markup and config. The
  performance budget must not move.
- **No visual change.** If a sighted user can tell, something is wrong.
- **English-only.** The site declares `lang="en"` and serves a US market.

## Decisions taken during `/clarify`

**Decision 1 — the breadcrumb follows the heading; the cards keep their short
names.** The first framing of this was wrong and is recorded rather than quietly
replaced. The spec initially asked for *one name everywhere*, on the audit's
reading that one guide had three. Checking the config showed **all seven** carry
two names — and that this is a reasonable editorial choice, not drift: a card in
a grid wants brevity, an `<h1>` does not. Collapsing them would have flattened
fourteen deliberate pieces of copy to fix a problem that was somewhere else.

The real defect is narrower and worse: **the breadcrumb is fed from the card
name**, so a page's trail names a different article than its own heading. That is
what changes. `AC9b` asserts the cards may keep differing, so this cannot be
"tidied" later by someone who reads only the requirement.

**Decision 2 — the guide is called `How to Buy Used Tires`.** The audit's
proposal. The long form stays in the search-result title, where the extra words
buy a differentiator; the heading, breadcrumb and card get the short name.

**Decision 3 — the two config fields are renamed:** `title` → `heading`,
`headline` → `cardName`. Seven guides and seven call sites. They are currently
named the opposite of what they drive, which is the mechanism by which a
breadcrumb came to disagree with the heading three lines below it.

**Decision 4 — the language guard covers all of `src/app`, with no exemption.**
There is exactly **one** Spanish accessibility string in the entire tree today —
`aria-label="Abrir menú de navegación"` — and it is on the public site, so the
guard costs nothing and has nothing to clean up. `/dashboard` is not exempted
now: if the crew later wants it in Spanish, the exemption is added then, with the
reason written down, rather than assumed in advance.

## Open questions

_None. All three markers were resolved, and a fourth question — raised by
checking the other six guides — corrected the first answer's premise before it
reached the plan._

---

_The WHAT and WHY only. The HOW lives in [plan.md](./plan.md)._
