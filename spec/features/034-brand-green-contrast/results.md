# Results — 034-brand-green-contrast

> Feature: `034-brand-green-contrast` · 2026-08-26 · Branch: `feat/034-brand-green-contrast`

> **Gates compressed on purpose.** A measured accessibility defect carried
> forward from `030`, with a known cause. Every value below was read from axe on
> the running site, before and after.

## What it was meant to be, and what it turned out to be

The task was "the brand green fails AA on the Add to Cart buttons". Sweeping ten
routes with axe, that was one of **four** distinct faults:

| | ratio | nodes |
| --- | ---: | ---: |
| White on `green-600` — every "Add to Cart" | 3.21 | 20 |
| `green-600` **as text** on white | 3.08–3.21 | 9 |
| Greys: too light on light, too dark on dark | 1.67–4.39 | ~50 |
| Status greens as text (`#22c55e`, WhatsApp `#25D366`) | 1.98–2.27 | 4 |

## The green: one token, not 117 edits

`green-600` appears in **117 places**. Editing them would have planted the same
mistake 117 times, so the shade is redefined once:

```css
--color-green-600: #008236;
```

`#008236` is Tailwind's own `green-700` — **the shade these buttons already used
on hover**. The resting state becomes what the hover state was, hover moves one
step darker, and the hue does not shift. White on it: **3.21 → 4.95**.

**The cost, measured.** Black on that green falls from 6.52 to **4.25**, just
under AA. It costs nothing today because nothing in the codebase pairs dark text
with it — checked, not assumed — and `brandContrast.guard.test.ts` fails if
anyone ever does, because the button would then fail from the other side.

That guard computes contrast from the WCAG formula against the declared token,
so it states the requirement rather than the value: change the token to something
unreadable and it fails, whatever the hex says.

## The greys move in two directions

This is the part a token cannot fix. The same `gray-500` was **too light on
white** and **too dark on near-black** — on light surfaces the fix is darker, on
dark surfaces lighter. Roughly fifteen targeted edits, each on an element axe had
named, rather than a find-and-replace over a shade.

## Two places where one colour did two jobs

**The tread bar.** `#22c55e` painted both the filled bar and the words "Like
new". For a bar that is fine — it carries nothing a reader must decode. For the
words it measured **2.27:1**. Split into `lifeColor` for the bar and
`lifeTextColor` for the text.

**Decorative numerals**, on `/about-us` and `/contact`. Giant watermark digits at
20% and 5% opacity — **1.67:1 and 1.12:1**. `aria-hidden` did **not** satisfy
axe: it evaluates visible text regardless. They are large text (72px and 60px at
weight 900), so the bar is 3:1 rather than 4.5:1, and the minimum opacity that
clears it was computed rather than guessed: 40%. On `/about-us` that is — again —
the value the numeral already used on hover.

## The page that was never being tested

`/contact-us` returns **404**. The route is `/contact`. Several sweeps had been
reading the not-found page and calling it the contact page, which meant
`/contact` was unmeasured (14 failures) **and** the 404 itself was failing (2).
Both are fixed. A 404 is a page people land on.

## Measured after, across ten routes

`/` · `/tires` · `/tires` filtered · tire detail · `/checkout` · `/guides` ·
guide detail · `/services` · `/locations` · `/about-us` · `/contact` · 404

**Zero violations**, of any WCAG 2.0/2.1 A or AA rule.

The single node still reported on the home page is `YD-SIDEBAR` — an element
injected by a browser extension, not by this site.

## Definition of Done

| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | ✅ |
| `npm run lint` | ✅ |
| `npm test` | ✅ **1.546 passed** (baseline 1.542, +4) |
| `npm run build` | ✅ |
| `npm run perf:budget` | ✅ 624.8 KB / 680 |
| axe, ten routes | ✅ 0 violations |
| Manual | ✅ owner confirmed the design holds |

## Still open

**1.127 priced, in-stock tires the storefront hides** because their
`RemainingLife` field is blank rather than low — 175 of them new. Recorded in
`030`'s results with two questions for the owner; unchanged here.
