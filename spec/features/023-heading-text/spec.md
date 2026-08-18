# Spec — Headings that read as words

> Feature: `023-heading-text` · Status: Draft — open clarifications
> Created: 2026-08-18
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

**One guide has three names.** *How to Buy Used Tires* is called three different
things depending where you look:

| Where | What it says |
| --- | --- |
| Search result | `How to Buy Used Tires: What to Check First` |
| `<h1>` and Article JSON-LD | `How to Buy Used Tires: The Complete Guide` |
| Card and breadcrumb | `The Complete Buyer's Guide to Used Tires` |

The reason it drifted is visible in the config: the field called **`title`** is
used for the `<h1>`, and the field called **`headline`** is used for cards and
breadcrumbs. The two are named the opposite of what they do, so nobody editing one
had any reason to think they were editing a heading (T100).

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
- One name for the guide that has three (T100), and renaming the two config fields
  so the next editor can tell which is which.
- A guard that fails the build if a `<br />` appears inside a heading again.

**Out:**

- Any change to the **visual** design: the same two lines, the same type scale,
  the same spacing. Only the text content changes.
- Heading *copy* — what the headings say is not revisited here, only how it is
  spelled out. `/tires`, `/services` and the rest keep their words.
- `<br />` outside headings, which is not a defect.
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
- **FR6:** A guide is called one thing. Where its name appears — search result,
  heading, card, breadcrumb, structured data — it is the same name.
- **FR7:** The config fields behind FR6 must be named for what they do.
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
- [ ] **AC8:** Given the guide `how-to-buy-used-tires`, when its name is read from
      its heading, its card, its breadcrumb and its Article JSON-LD, then all four
      agree.
- [ ] **AC9:** Given every guide, when the same four surfaces are compared, then
      each guide has one name — not only the one the audit found.
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

## Open questions

- [NEEDS CLARIFICATION: **What should the guide be called?** Its three names are
  `How to Buy Used Tires: What to Check First` (the search result, set in `021`),
  `How to Buy Used Tires: The Complete Guide` (the heading), and
  `The Complete Buyer's Guide to Used Tires` (the card and breadcrumb). The audit
  proposes collapsing all four to **`How to Buy Used Tires`**, keeping the longer
  form only in the search result where the extra words earn their space.
  Recommendation: **take the audit's proposal** — a card and a breadcrumb want the
  short name, a title tag wants the differentiator. Confirm.]

- [NEEDS CLARIFICATION: **Should the two config fields be renamed, and to what?**
  `title` drives the `<h1>` and the Article JSON-LD; `headline` drives cards and
  breadcrumbs. They are named the opposite of what they do, which is the
  mechanism by which three names drifted apart. Renaming them costs a rename
  across seven guides and four call sites and makes the next drift much less
  likely. Recommendation: **rename** — `title` → `heading`, `headline` → `cardName`
  — or say if you would rather not churn the config now.]

- [NEEDS CLARIFICATION: **How far should the Spanish guard reach?** AC7 as written
  covers `aria-label`, `alt`, `title` and visually-hidden text in `src/app`. The
  dashboard (`/dashboard`) is a staff-facing area where Spanish may be
  deliberate — the crew works in it — and `noindex`. Recommendation: **guard the
  public site and exempt `/dashboard`**, stating the exemption, rather than
  forcing English on a tool the staff use in Spanish. Confirm.]

---

_The WHAT and WHY only. The HOW lives in [plan.md](./plan.md)._
