# Results — 032-catalog-ux

> Feature: `032-catalog-ux` · 2026-08-26 · Branch: `feat/032-catalog-ux`

> **Gates compressed on purpose.** Four small, independent UX corrections from an
> outside audit of `/tires`, plus a reported defect found while testing them.
> Each was verified against the running page before and after; there is no
> capability being designed that `/specify` and `/plan` would have had to decide.

## Where it came from

An external tool audited the UX of `/tires` and reported ten items. **Verified
one by one against the live page, five were already implemented** — it counted
DOM nodes rather than what is drawn, and reported the 115 brand links, the
applied-filter chips and the sort control as missing when all three exist.

That first false positive is worth recording: the brand options are all in the
markup **on purpose**, hidden with CSS, so the page works without JavaScript and
a crawler sees the whole list. Cutting them to eight — the audit's suggested
"fix" — is precisely the regression `030` removed, which had hidden 102 tires in
23", 24" and 26".

Four suggestions were real and are implemented here.

## 1. Tread depth had no unit

The card read `TREAD 8.0`. Tread is measured in **thirty-seconds of an inch**: a
new passenger tire is about 10/32" and the legal minimum is 2/32", so `8/32"`
means "most of its life left" to anyone who has bought tires, and `8.0` means
nothing at all — on the one number that exists to reassure a used-tire buyer.

Now `8/32"` on the card, in the table and on the detail page, from one formatter.

## 2. "Patched: Yes" was a fact with no context

It is the point where a used-tire buyer hesitates, and the page said nothing. A
patch is a repair to a standard, so the page now says so: *"Professionally
inspected and repaired to DOT safety standards."* — an info marker on the card,
visible text on the detail page.

The fact is not hidden or softened. **Transparency over hiding** is the mission's
own rule; the answer to a truth that sounds alarming is context, not silence.

## 3. Two ways to sort that the catalogue could not express

"Most tread left" and "Newest arrivals" join the two price orders.

**The remaining-life sort is numeric, not textual.** `RemainingLife` is stored as
`'99%'`, and compared as text **`'9%'` sorts above `'80%'`** — "most tread left"
would have put the worst tires first while looking entirely plausible. Both new
orders also break ties on `TireId`, without which rows sharing a value reshuffle
between requests and a tire appears on two pages or on none while paging.

`tireSort.test.ts` asserts both, and that the UI never offers an order the query
cannot honour.

## 4. The filters were too small to tap

Measured in a 390 px viewport: **60 of 61 controls in the mobile filter panel
were 32 px tall.** They clear WCAG 2.2's 24 px minimum — the rows are 309 px
wide — but sit under the 44 px Apple's HIG and WCAG 2.5.5 ask for.

Now **0 under 44 px**, on mobile only: the desktop rail is a 240 px column where
compact is right, so every change carries an `lg:` reset.

## The one the owner reported, which had two causes

> *"There are logos that look tiny."*

**Cause one: the files were mostly empty.** The General Tire logo was 128×85 with
the ink occupying **100×14** — **87% of the file was transparent padding**.
`object-contain` fits the whole canvas, so the mark drew at **5 px tall**. Not a
CSS problem: a bad asset.

Measured across all 161 files: **80 had ≥25% transparent padding, 37 had ≥60%**,
and some were **3840×2160** for an image served at 128 px. 92 were trimmed to
their ink and capped at 512 px wide. The folder went from **3.8 MB to 2.8 MB**.

**Cause two, which the owner's second example exposed.** Hankook *was* trimmed
and still looked small. Its mark is **8:1**; the box was **4:1** (128×32). It
filled the width and used 16 of the 32 px of height.

So the box was measured against the set rather than assumed. **The median brand
mark here is 5.2:1** — these are wordmarks, not emblems — and the box had been
built for a shape almost none of them have.

| box | median drawn height |
| --- | ---: |
| 128×32 *(4:1, before)* | 25 px |
| **160×32 *(5:1, chosen)*** | **31 px** |
| 176×28 (6.3:1) | 28 px |
| 192×24 (8:1) | 24 px |

| | before | after |
| --- | ---: | ---: |
| Average drawn height, 161 logos | 24.5 px | **27.8 px** |
| Hankook, visible ink | ~50×6 px | **160×20 px** |
| General Tire | 38×5 px | **160×20 px** |

`width`/`height` on the component said `128×96` — 4:3, which no logo here is and
which matched nothing once the files were trimmed. They now describe the box.

## Two things left as they are, deliberately

**82 of 161 logos carry a baked-in background** — General on black, Goodyear on
blue, Dunlop on yellow. While they drew small the colour went unnoticed; at full
size they read as coloured badges on a white card. That is how the files are
made, not something introduced here. Removing those backgrounds is per-asset
design work.

**A returning visitor may keep an old logo for a while.** `next.config` sets
`minimumCacheTTL` to 31 days and the optimizer's URL does not change when the
source file does — a version query is rejected (`400`) for a local path. Chrome
served the old bitmaps throughout this work while the server was already sending
the new ones, which is worth knowing before judging the result from a warm cache.

## Definition of Done

| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | ✅ |
| `npm run lint` | ✅ |
| `npm test` | ✅ **1.531 passed** (baseline 1.512, +19) |
| `npm run build` | ✅ |
| `npm run perf:budget` | ✅ 624.4 KB / 680 |
| Manual | ✅ owner verified on a device |
