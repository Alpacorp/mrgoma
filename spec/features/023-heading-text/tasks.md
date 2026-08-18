# Tasks — Headings that read as words

> Feature: `023-heading-text` · Based on: [plan.md](./plan.md) · Created: 2026-08-18

Ordered, **very small, independently verifiable** tasks. Baseline before starting:
**927 tests in 77 files, green.**

**Two ordering rules:**

1. **The guard lands after the headings (T3 after T1–T2).** It fails on every
   template not yet corrected, so writing it first means a red suite through the
   middle of the feature — the same reason `019`'s WhatsApp guard and `022`'s
   store guard landed after their call sites.
2. **T2 is not T1 with more files.** Three of the eleven need more than the
   mechanical swap, and doing them alongside the easy eight is how one gets a
   half-substitution and nobody notices.

Groups B, C, D and E are independent of A and of each other.

---

## A. Eleven headings that read as one word

- [ ] **T1** — The eight mechanical ones. Each is `{text}` `<br />`
      `<span className="…">`; each becomes `{text}{' '}` and `className="block …"`
      on the span.
      · files: `src/app/(shop)/tires/brands/[brand]/page.tsx`,
      `src/app/(shop)/tires/used/page.tsx`, `src/app/(shop)/tires/new/page.tsx`,
      `src/app/(shop)/locations/page.tsx`, `src/app/(shop)/services/page.tsx`,
      `src/app/(shop)/guides/page.tsx`,
      `src/app/(shop)/services/[service]/container/ServiceDetail/ServiceDetail.tsx`,
      `src/app/(shop)/tires/container/SearchResults.tsx` (**both branches** of the
      conditional — the size branch and the default branch)
      · **Do not touch the `<h1>`'s own classes.** Only the contents change; AC5
      asserts the wrapper is untouched, and that is the whole basis for calling
      this invisible to a sighted user.
      · check: `npm run dev` — `/tires/brands/michelin` reads `MICHELIN Tires`,
      `/locations` reads `Our Locations Miami & Orlando`, and each still breaks
      onto two lines exactly where it did.

- [ ] **T2** — The three that need more than the swap:
      - **`tires/size/[size]`** is the other shape — `<span>` `<br />` *bare
        text*. There is no element on the second line to put `block` on, so the
        text needs wrapping.
      - **`contact/Contact.tsx`** has `<span className="text-[#9dfb40]">MrGoma</span> Tires`
        — text **after** the span on the same visual line. Putting `block` on the
        green span would drop " Tires" to a third line; the second line needs its
        own wrapper with the green span inside it.
      - **`about-us/AboutUs.tsx`** has **two** `<br />`s and three lines, and the
        middle one carries an inline `WebkitTextStroke` that must survive.
      · files: `src/app/(shop)/tires/size/[size]/page.tsx`,
      `src/app/(shop)/contact/container/Contact/Contact.tsx`,
      `src/app/(shop)/about-us/container/AboutUs/AboutUs.tsx`
      · check: `npm run dev` — `/tires/size/235-50-20` reads
      `235/50/20 Tires in Miami`; `/contact` still shows `Contact` then
      `MrGoma Tires` on **two** lines, not three; `/about-us` still shows three
      lines with the middle one outlined.

- [ ] **T3** — `headings.guard.test.ts` (new). **After T1 and T2.**
      · Walks `src/app/**/*.tsx`, extracts the body of every `<h1>`–`<h6>`, and
      fails on a `<br`. **All six levels**, not only `<h1>` — the next one is as
      likely to arrive in a section heading.
      · check: `npm test`; then **verify it red** by restoring one `<br />`, and
      confirm it names the file.

## B. A list with a shape

- [ ] **T4** — On `/guides`, the card's `<h2>` becomes `<h3>`. One edit covers all
      seven cards.
      · **The three section `<h2>`s stay**, and so does the CTA `<h2>` further
      down the page. Only the card inside a section moves a level.
      · The home page already gets this right — its guide cards are `<h3>` — so
      this brings `/guides` in line rather than inventing a convention.
      · files: `src/app/(shop)/guides/page.tsx`,
      `src/app/(shop)/guides/guides.test.tsx` (new)
      · check: `npm test` — one `<h1>`, the section and CTA `<h2>`s, seven
      `<h3>`s, and no `<h3>` outside a section.

## C. One string in the wrong language

- [ ] **T5** — `aria-label="Abrir menú de navegación"` → `"Open navigation menu"`,
      matching `MenuHeader`'s existing `"Close menu"` two files away.
      · Add the language assertion to `headings.guard.test.ts`: no `aria-label`,
      `alt`, `title` or `sr-only` string under `src/app` in Spanish. **No
      exemption for `/dashboard`** (spec Decision 4) — there is exactly one match
      in the tree today and it is on the public site, so the guard costs nothing;
      if the crew later wants the dashboard in Spanish, the exemption is added
      then with the reason recorded.
      · files: `src/app/ui/components/HamburgerMenu/HamburgerMenu.tsx`,
      `src/app/utils/headings.guard.test.ts`
      · check: `npm test`; **verify red** by putting the Spanish label back.

## D. One guide, one name in the places that name it

- [ ] **T6** — Rename the config fields and fix what they feed:
      `title` → `heading`, `headline` → `cardName`, across seven guides and seven
      call sites. `how-to-buy-used-tires` becomes **`How to Buy Used Tires`** in
      both fields.
      · **Three of the seven are behaviour changes, not renames:**
        - the breadcrumb JSON-LD (`page.tsx:43`) and the visible trail
          (`page.tsx:90`) move from the card name to the **heading** — today a
          page's trail names a different article than its own `<h1>`, three lines
          below it. That is FR6, and the whole point.
        - `Home.tsx:352` moves from the heading to **`cardName`**. It is a card,
          and it has been showing the heading while `/guides`' cards showed the
          card name — the same guide under two names across two grids. The rename
          is what makes that visible.
      · **The other seven guides keep two names.** A card wants a short name and
        an `<h1>` can afford a longer one; those pairs were chosen. T7 asserts it.
      · files: `src/app/(shop)/guides/guidesConfig.ts`,
      `src/app/(shop)/guides/page.tsx`, `src/app/(shop)/guides/[slug]/page.tsx`,
      `src/app/(home)/container/Home/Home.tsx`
      · check: `npx tsc --noEmit` — the fields are required on a typed config, so
      a missed call site cannot compile.

- [ ] **T7** — `guideNames.test.ts` (new).
      · For all seven: the breadcrumb JSON-LD name, the visible trail and the
      `<h1>` are the same string (AC8); the Article JSON-LD `headline` equals the
      `<h1>` (AC9).
      · **And that at least one guide's `cardName` differs from its `heading`**
      (AC9b). That assertion is not decoration: without it, a future
      "consistency" pass flattens fourteen deliberate pieces of copy and the
      suite applauds.
      · files: `src/app/(shop)/guides/guideNames.test.ts` (new)
      · check: `npm test`.

## E. The canonical, and the flag that could put a slash on every page

- [ ] **T8** — Guard `trailingSlash` in `next.config.mjs`.
      · **The home canonical has no trailing slash** — verified in production
      three times, and `metadata.test.ts` has pinned it since `020`. But that test
      asserts what the **builder** returns; the slash is absent from the
      **rendered** tag because Next strips it, and Next strips it because
      `trailingSlash` defaults to `false`. Setting that one flag to `true` would
      put a slash on the canonical of **every page on the site**, and every
      existing test would still pass. Nothing guards it.
      · files: `src/app/utils/headings.guard.test.ts` (or alongside the existing
      `legacySlugs.guard.test.ts`, which already imports `next.config.mjs`)
      · check: `npm test`; **verify red** by setting `trailingSlash: true`.

## F. Close it out

- [ ] **T9** — Definition of Done: `npx tsc --noEmit` + `npm run lint` +
      `npm test` + `npm run build` + `npm run perf:budget`, all green.
      · The budget must not move: this is markup and config, and the one client
      component touched (`SearchResults`) gains no code.

- [ ] **T10** — Manual, **at 360 px**, and the check that matters most because no
      test can see it: each of the eleven headings still breaks **where it did**,
      at the same sizes, with nothing overflowing.
      · `/about-us` (three lines, middle one outlined) and `/contact` (two lines,
      not three) are the two most likely to have moved.
      · On one of them, select the heading and copy it — it must paste as a
      phrase.
      · Also look at the home page's guide cards, which now show the short card
      name instead of the heading (T6).

- [ ] **T11** — Manual, screen reader: the mobile menu button announces in
      English, and one corrected heading reads as a phrase rather than a token.

---

## Traceability

| Task | Acceptance criteria |
| ---- | ------------------- |
| T1 | AC2, AC3, AC5 |
| T2 | AC2, AC4, AC5 |
| T3 | AC1 |
| T4 | AC6 |
| T5 | AC7 |
| T6 | AC8, AC9 |
| T7 | AC8, AC9, AC9b |
| T8 | AC13 |
| T9 | AC10 |
| T10 | AC5 (visual half), AC11 |
| T11 | AC12 |

Every criterion in `spec.md` is covered. AC2 and AC5 appear against three tasks
because they are properties of all eleven headings — asserted by rendering for
the five templates that need no database, by the absence of `<br />` for the
other six, and by a human at 360 px for the visual half that no test can see.

---

_Implementation follows in `/implement`._
