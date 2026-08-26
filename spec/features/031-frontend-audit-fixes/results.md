# Results — 031-frontend-audit-fixes

> Feature: `031-frontend-audit-fixes` · 2026-08-25 · Branch: `feat/031-frontend-audit-fixes`

> **Gates compressed on purpose.** This is a batch of small, independent defects
> reported by an outside audit of production, each with a known cause. There is
> no capability being designed, so `/specify` and `/plan` would have had nothing
> to decide that this record does not already state. Every claim was verified
> against the code before anything was changed, and three were rejected.

## Where it came from

An external tool audited `https://www.mrgomatires.com/` over CDP and reported
eight frontend findings. **Five were real. Three were not.** A report from a tool
is evidence, not instruction, so each was checked first.

## The one that mattered, and it was ours

**Every size filter reported itself as a brand.**

`SearchableFacet` was generalised out of the brand facet in `030`, and its
analytics label kept the word it was born with:

```html
<a href="/tires?w=205"  data-track-label="Brand:205">
<a href="/tires?s=55"   data-track-label="Brand:55">
<a href="/tires?d=16"   data-track-label="Brand:16">
```

Nothing failed. The filter worked, the count was right, the page was correct —
and GA4 and Vercel Analytics recorded tire dimensions as brand names.

**Cause: a silent no-op.** The edit that should have replaced `Brand:` with the
group's name was a string replacement without an assertion; it did not match, it
did not error, and it was never checked. That failure mode was identified
mid-feature and assertions were added from then on — but the earlier edits were
never re-checked. This was one of them.

**Also fixed while there:** the groups disagreed about vocabulary. Four labelled
in lowercase (`brand`, `width`) and five used the display title (`Price`,
`Condition`). Every group now reports the **group key**, not the title: titles
change with the copy — `Rim size` today, `Wheel size` tomorrow — and a rename
silently splits one metric in two. It is also the key `AppliedFilters` already
reports on removal, so applying and removing a filter now share a vocabulary.

`tracking.guard.test.ts` asserts the label comes from the group key and that no
group name is written into the template. **Verified red** by restoring `Brand:`.

## The other four

**A decorative image announced itself.** The shadow under the tread graphic had
`alt="shadow"`, so a screen reader read "image: shadow". Now `alt=""` and
`aria-hidden`.

**Twenty tire titles were `<h2>`.** Each card sits under the results section's
own heading, so twenty product names as `<h2>` put twenty siblings beside it
rather than children under it. `/tires` went from **41 `<h2>`** to **1 `<h1>`,
7 `<h2>`, 61 `<h3>`**.

**Duplicate ids from Figma.** `id="Group"`, `id="Vector"`, `id="Vector_2"` …
exported with the icons and never referenced. **17 removed.** Duplicated ids on
`/tires` went from four kinds to **one** — `clip0_199_1053`, which appears twice
because the same icon renders twice. That one stays: it is the target of a
`url(#…)` and removing it breaks the clip, while making it unique per instance
needs `useId()`, which would turn thirteen icons into client components. A bad
trade for a validity nit that renders identically either way.

**34 buttons had no `type`.** The report described this as `type="submit"` used
outside a form; no source does that. What it saw was the *default*: a bare
`<button>` is a submit button in HTML. Harmless where they render today, and a
form submitted by the wrong control the first time one is placed inside a
`<form>`. All 34 now declare their type — the one that sits inside a form keeps
`submit`, because it **is** that form's submit button.

One more the audit missed: `ButtonSearch` took `type` as an optional prop with no
default, and React omits an attribute whose value is `undefined`. Defaulted to
`button`.

## Rejected, with the evidence

| Claim | Why not |
| --- | --- |
| *"The More filters control is marked up as a heading"* | The trigger is a `<button>`. The `<h2>` is the popover panel's title, and the panel carries `aria-label="More filters"`. |
| *"`bg-header.svg` needs explicit width and height"* | It uses `fill`, which is the correct `next/image` pattern and **forbids** width and height. |
| *"Images request 1920 px for a 256 px box"* | `w=1920` is the `src` fallback Next.js always emits beside the srcset. Measured what the browser actually fetched: **40 images at 256 px, 6 at 640**. None at 1920. `sizes` is already right. |

## And one where the audit is wrong in the other direction

It reports **"excellent colour contrast, meets WCAG AA and AAA"**.

Measured with axe on the running site: **22 nodes on `/tires` and 15 on the home
page fail AA** — white on `bg-green-600` at **3.21:1** against the 4.5:1
required. Every "Add to Cart" button. Their script appears to have sampled the
dark hero only.

**Not changed here.** It is the brand green named in `tech-stack.md`; repainting
the primary button is the owner's decision, not a side effect of an audit
follow-up. Same finding recorded in `030`.

## Definition of Done

| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | ✅ |
| `npm run lint` | ✅ |
| `npm test` | ✅ **1.512 passed** (baseline 1.508, +4) |
| `npm run build` | ✅ |
| `npm run perf:budget` | ✅ 624.0 KB / 680 — unchanged |
| axe on `/tires` and `/` | ✅ no violation from any change here |
| Manual | ✅ pagination, view toggle, filters and the login form re-checked after the button change |
