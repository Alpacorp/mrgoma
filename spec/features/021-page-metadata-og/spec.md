# Spec — One way to describe a page

> Feature: `021-page-metadata-og` · Status: Planned — ready for `/tasks`
> Created: 2026-08-18 · Clarified: 2026-08-18
> Roadmap: Backlog (SEO — Screaming Frog audit, block 1) · Branch: `feat/021-page-metadata-og`

## Why — problem & value

This site describes itself to Google and to every social network twice over, and
the two descriptions disagree. Which one a page gets depends on a detail nobody
chose: whether it happens to call a helper.

`src/app/utils/seo.ts` already contains the right answer — `pageMetadata()`, which
gives a page an absolute title, its own canonical and its own `og:url`. **Roughly
four hundred pages use it. Fifteen do not.** And the helper has a gap of its own:
it emits no `og:image` and no `og:locale`. In Next, a segment that defines
`openGraph` **replaces** the root layout's rather than merging with it, so
declaring three fields silently drops the other three.

The result is a site split in half, each half broken in the opposite way.
Verified in production on 2026-08-18:

| | `og:url` | `og:image` | Title |
| --- | --- | --- | --- |
| **Uses the helper** — home, `/tires`, `/tires/used`, `/tires/new`, `/locations` + the 7 stores, 113 brand pages, 272 size pages | ✅ its own | ❌ **none** | ✅ |
| **Does not** — `/services` + 8 service pages, `/about-us`, `/guides`, `/contact`, `/instant-quote`, `/legal-policies`, `/checkout` | ❌ **the home page** | ✅ | ❌ brand twice |

### What each half costs

**No `og:image` on four hundred pages.** Share a tire size, a brand page or a
store on WhatsApp, Facebook or a group chat and it arrives as bare text. This is
the capability `019` went to the trouble of unblocking — the firewall rule that
lets `facebookexternalhit` through was published on 2026-08-17 precisely so
preview cards would render. Every page that reaches a customer through a shared
link, except the tire detail page, is still shipping without a picture.

**The wrong `og:url` on fifteen.** A page whose `og:url` names the home page is
telling every social network that it *is* the home page. Shares of `/services`
and `/about-us` consolidate their engagement onto the front door.

**The brand printed twice, on twelve pages.** These pages return `title` as a
plain string, so the root template appends ` | MrGoma Tires` on top of a title
that already ends in it:

```
62  Auto Services in Miami & Orlando | MrGoma Tires | MrGoma Tires
88  Wheel Alignment in Miami & Orlando | Hunter HawkEye Elite® | MrGoma Tires | MrGoma Tires
48  Tire Guides & Tips | MrGoma Tires | MrGoma Tires
52  Website Legal Policies – MrGoma Tires | MrGoma Tires
```

Google shows about 60 characters. On the wheel-alignment page, 30 of the 88 are
the brand repeated, and the one thing no competitor can claim — **Hunter HawkEye
Elite®**, the actual alignment rig — sits right at the edge of what gets shown.
The site is spending its most valuable characters saying its own name a second
time.

### The sitemap and `/instant-quote` contradict each other

Neither of the two conversion pages is in the audit, because Screaming Frog could
not reach them. Checking them directly turned up something different from what
their canonicals suggested.

**Both already declare `noindex, nofollow`.** `/checkout` has done so since the
WJM audit's Phase 1 (commit `b754578`), which also marked `/instant-quote`,
grouping it with `/dashboard` as a page that should not be an entry point. So the
root canonical both serve is a consequence of having no metadata of their own, and
on a page Google is told not to index it is cosmetic rather than harmful. This
spec originally called `/checkout`'s canonical serious; it is not, and that is
recorded here so the correction is not lost.

**The real defect is that the sitemap publishes `/instant-quote` anyway.** We ask
Google to index a URL that then tells it not to — which Search Console reports as
*"Submitted URL marked 'noindex'"*. One of the two statements has to go.

`/instant-quote` is also **orphaned**: nothing in `src/` links to it. Whichever
way the contradiction resolves, a page no one links to and no one can find is not
doing anything today.

### Why this is one feature and not nineteen
### Why this is one feature and not nineteen

The audit lists nineteen tickets here — T023–T029 for the Open Graph tags,
T038–T046 for the service titles, T054 and T055 for `/about-us` and `/guides`.
Read as nineteen jobs they look like a week of tedium. They are two edits to one
helper and a migration of fifteen pages onto it, because they all have the same
cause. The mission asks for *small, verifiable changes* and *reuse before
creating*: the reusable thing already exists and is already correct. This feature
is mostly deletion of the code that works around it.

Nothing a visitor sees changes. Titles change in search results and shared links
gain a picture; the pages themselves render exactly as they do now.

## User stories

- As **someone sent a link to a store or a tire size**, I want the message to show
  a picture and a real title, so that I can see what it is before deciding to tap.
- As **someone scanning search results**, I want a title that spends its width on
  what this page offers, so that I can tell the alignment page from the oil-change
  page without opening both.
- As **the site owner**, I want each page to claim its own address, so that
  attention paid to a service or a guide accumulates on that page instead of on
  the home page.
- As **the site owner**, I want the pages where a customer converts to be
  described as themselves, so that we are not asking Google to index a quote form
  that says it is the front page.
- As **a developer adding a page tomorrow**, I want one way to describe it, so
  that getting it right is the default rather than something to remember.

## Scope

**In:**

- Making the shared metadata helper emit a complete Open Graph block, so that
  every page already using it gains an image and a locale.
- Migrating the fifteen pages that bypass it onto it, which removes the duplicated
  brand and gives each its own `og:url`.
- Giving `/checkout` and `/instant-quote` metadata that describes them rather than
  the home page.
- Tests that fail if a page ships a duplicated brand, an over-width title, a
  missing `og:image` or a canonical that is not its own.

- The title and description copy the audit proposes for the non-store pages:
  T035 (home), T036 (`/tires`), T037, T054–T059 (the guides), and T060, T061,
  T062, T070, T071 (descriptions). Decision 1.
- A footer link to `/instant-quote`, without which its new metadata cannot earn
  anything. Decision 2.

**Out:**

- The seven store pages' titles, descriptions and H1s (T047–T053, T063–T069,
  T085–T091) — block 2, a data edit in `locationsConfig`.
- The H1 spacing defect (T072–T084) — block 3.
- Structured data (T009–T022) — block 4.
- The `/tires/{id}-…` URL consolidation (T006, T007, T017) — block 5.
- The tire detail page, which already builds correct metadata and its own
  `og:image` and is not touched.

## Decisions taken during `/clarify`

**Decision 1 — the audit's copy comes in, but not verbatim where it contradicts a
decision we already made.** Title and description rewrites for the non-store
pages are in scope alongside the structural fix. Two carve-outs:

- **The home title is a synthesis, not the audit's version.** T035 proposes
  `Used & New Tires in Miami & Orlando | MrGoma Tires`, which adds Orlando — its
  entire stated justification — but **drops "30-Day Warranty"**, the
  differentiator `014-serp-differentiators` was built to put there and which
  `metadata.test.ts` pins with a note saying it should change in the spec first.
  It also uses the long brand, where `TITLE_SUFFIX` is deliberately the short one.
  We take the intent and keep what works:
  **`Used & New Tires Miami & Orlando — 30-Day Warranty | MrGoma`** — 59
  characters, inside the 60 Google shows.
- **No description may hardcode a stock figure.** T061 proposes "Search 4,000+
  used and new tires…". The online count is live (~4,274 today) and will drift,
  and `014` exists partly because the home once claimed a number the catalog
  contradicted — `brandClaims.test.ts` still guards that phrasing. The valuable
  half of T061 is "by size or brand", which is what the visitor came to do; the
  number must come from the existing inventory claims or be dropped.

**Decision 2 — `/instant-quote` becomes a real landing page, which means
deliberately reversing an earlier SEO decision.** It captures leads and has its
own intent, so it keeps its place in the sitemap and gains its own title,
description and canonical — and its `noindex, nofollow` is **removed**.

That last part is not a bug fix. Commit `b754578` ("SEO phase 1") marked this
page `noindex` on purpose, alongside `/dashboard`, treating it as a funnel step
rather than an entry point. The owner has decided otherwise, with the conflict
put in front of them. Recorded here so that nobody later reads the reversal as an
oversight, and so that if it is reconsidered the earlier reasoning is still
findable.

Two things follow. The sitemap and the page stop contradicting each other, which
removes a live Search Console error either way. And the page needs a **footer
link**: nothing in `src/` points at it, and a page only Google can find will not
rank. That anchor is the one visible change in this feature.

`/checkout` is left `noindex` and keeps its `robots.txt` block; it only gains its
own canonical, which is a one-line tidy rather than the serious defect this spec
first claimed.

**Decision 3 — the guides' proposed titles are adopted, though the audit's
baseline for them was wrong.** Three of the four "current" titles it recorded do
not match production: it has `How to Read Tire Size Numbers` (29 chars) where
production serves 72, and `Used Tire Safety: 8-Point Inspection Checklist` (46)
where production serves 73. So the guides' real defect is **length, not
duplication**, and the audit named the wrong one. Its proposals are adopted
anyway: at 55–58 characters they fix the real defect, and the query data behind
them (`used vs new tires`, 140 impressions and zero clicks) is measured rather
than inferred. The reasoning is recorded so nobody later reads the audit's
"current" column as fact.

**Decision 4 — everything ships in one deploy, after a Search Console baseline.**
Fifteen titles change at once. These are corrections of a defect — nobody chose to
print the brand twice — not an experiment needing per-page attribution, and
staggering them costs more than the attribution is worth. The baseline is captured
before merge, as `020` did, because after the deploy the "before" is gone.

**Decision 5 — one generic `og:image`, except the seven stores.** Completing the
helper gives every brand, size and catalog page the site's default preview card.
The seven stores get their own, because `locationsConfig` **already carries a
photo for all seven** — the data exists and using it costs nothing. It is also
where it matters most: people share "the Hialeah shop", not a size page. Per-page
images for brands and sizes would need a generation pipeline and are a separate
feature.

## Functional requirements

- **FR1:** A page's Open Graph block must be complete wherever it is declared. A
  page that declares its own `og:url` must not thereby lose the image and locale
  the site declares by default.
- **FR2:** Every page must declare **its own** canonical and `og:url`. No page may
  name a different page as itself.
- **FR3:** No title may contain the brand more than once.
- **FR4:** Every title must fit the width Google displays, so that the page's
  differentiator is inside it rather than truncated after it. Every description
  must fit the window Google shows without truncating.
- **FR5:** `/checkout` and `/instant-quote` must describe themselves.
  `/instant-quote` must additionally become indexable, stay in the sitemap and be
  reachable by a link from the site, so that its metadata can earn something
  (Decision 2). `/checkout` stays `noindex` and stays disallowed.
- **FR5b:** The sitemap must never publish a URL that declares `noindex`. Today it
  publishes `/instant-quote`, which does.
- **FR6:** There must be **one** way to build page metadata. A page added after
  this feature must get FR1–FR4 by using the shared path, not by remembering to
  repeat it.
- **FR7:** No page's rendered content changes, with the single exception of the
  footer link in FR5. Only what pages declare about themselves changes.
- **FR8:** The seven store pages declare their own photo as `og:image`; every
  other page using the helper declares the site default (Decision 5).
- **FR9:** No copy introduced here may state a stock figure that the catalog can
  contradict. Inventory claims come from the existing `brandClaims` constants,
  which are already guarded (Decision 1).
- **FR10:** The home title keeps the differentiator `014` established. Changing it
  is a spec decision, not a side-effect of a refactor.
- **FR11:** Each requirement is covered by a test that fails if it is undone,
  following the guard pattern already used for the WhatsApp number, the retired
  event names and the founding year.

## Acceptance criteria (testable)

- [ ] **AC1:** Given every page that builds metadata through the shared helper,
      when its metadata is produced, then it declares an `og:image` with
      dimensions and alt text, and an `og:locale`.
- [ ] **AC2:** Given each of the fifteen pages that bypass the helper today, when
      the page is rendered, then its `og:url` equals its own canonical.
- [ ] **AC3:** Given every page in the site's metadata surface, when its title is
      read, then the brand name appears **at most once**. Tested over the whole
      set, not a sample.
- [ ] **AC4:** Given every page in that set, when its title is read, then it is no
      longer than `TITLE_MAX`; and when its description is read, then it falls
      inside `DESCRIPTION_MIN`–`DESCRIPTION_MAX`.
- [ ] **AC5:** Given `/services/wheel-alignment`, when its title is read, then it
      still contains `Hunter HawkEye Elite®` — the differentiator must survive the
      shortening, not be what gets cut.
- [ ] **AC6:** Given each of the eight service pages, when its title is read, then
      it names that service and is distinct from the other seven.
- [ ] **AC7:** Given the home page, when its title is read, then it is exactly
      `Used & New Tires Miami & Orlando — 30-Day Warranty | MrGoma`, it contains
      both cities, and it still states the warranty (FR10).
- [ ] **AC8:** Given `/tires`, when its title and description are read, then they
      are materially different from the home page's — not the one-word difference
      they carry today — and the description names searching **by size and by
      brand**.
- [ ] **AC9:** Given every description introduced by this feature, when it is
      searched for a stock quantity, then any figure present comes from
      `brandClaims` and passes its existing guard (FR9).
- [ ] **AC10:** Given `/checkout`, when it is rendered, then its canonical is
      `https://www.mrgomatires.com/checkout` and not the site root, and it still
      declares `noindex` and is still disallowed in `robots.txt`.
- [ ] **AC11:** Given `/instant-quote`, when it is rendered, then its canonical is
      its own URL, its title is not the root default, and it **no longer declares
      `noindex`** (Decision 2).
- [ ] **AC11b:** Given the sitemap, when it is generated, then no URL it publishes
      declares `noindex`. The contradiction Search Console reports as "Submitted
      URL marked 'noindex'" must be impossible to reintroduce.
- [ ] **AC12:** Given the footer, when it is rendered on any page, then it contains
      a link to `/instant-quote`, and the link is keyboard reachable with a visible
      focus ring.
- [ ] **AC13:** Given the sitemap, when each URL it publishes is fetched, then that
      page's canonical is that same URL. We must never ask Google to index a page
      that names something else as itself.
- [ ] **AC14:** Given any page module in the repository, when a test inspects how
      it declares metadata, then it goes through the shared helper — a page
      hand-rolling a `title` string fails the build (FR6).
- [ ] **AC15:** Given each of the seven store pages, when it is rendered, then its
      `og:image` is that store's own photo from `locationsConfig`, and that file
      exists.
- [ ] **AC16:** Given every page touched, when its rendered HTML is compared
      before and after, then only `<head>` differs — apart from the footer link.
- [ ] **AC17:** Given the full suite, build and performance budget, when run, then
      all are green and the JS budget is unchanged. This feature adds no client
      code; the footer link is a plain anchor.
- [ ] **AC18 (manual, before merge):** A Search Console export of the affected
      pages' queries, clicks, impressions and average position, captured while the
      old titles are still live (Decision 4).
- [ ] **AC19 (manual, after deploy):** A link to a store, a brand page and a size
      page shared into a real WhatsApp chat renders a preview card, and the store
      card shows that store's photo. Use URLs not shared before — WhatsApp caches
      previews by URL.

## Non-functional / constraints

- **Reuse before creating.** `pageMetadata()` already exists and is already right
  about the hard part. This feature completes it and deletes what worked around
  it; it must not introduce a second mechanism beside it.
- **The builders stay pure.** `seo.ts`'s metadata builders take plain values and
  return `Metadata` with no I/O, which is what lets `metadata.test.ts` guard every
  commercial entry point with no database and no mocks. That property must
  survive — including for the store images, which come from config, not a query.
- **No client JavaScript.** All of this is server-rendered `<head>`, and the
  footer link is a plain anchor. The performance budget must come out unchanged.
- **English-only.** The locale declared is `en_US`; this feature adds no i18n and
  no `hreflang` (audit T031 is explicit that adding it would create Search Console
  errors).
- **Accessibility.** The footer link meets the same bar as every other control:
  keyboard reachable, visible focus, adequate target size (WCAG 2.1 AA).
- **`modern-web-guidance` is not installed.** The constitution requires consulting
  it before building new interfaces. The only interface change here is one anchor
  added to an existing footer list, which is not a new interface — but the gap is
  recorded, and it must be closed before block 2 touches the store pages.

## Open questions

_None. All four markers were resolved during `/clarify`, and a second round
settled the two conflicts the answers exposed — the home title against `014`'s
approved copy, and where `/instant-quote` should be linked from. See **Decisions
taken** above._

---

_The WHAT and WHY only. The HOW lives in [plan.md](./plan.md)._
