# Results — 023-heading-text

> Recorded: 2026-08-18 · Status: implemented, awaiting manual verification

## Definition of Done

| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | ✅ |
| `npm run lint` | ✅ |
| `npm test` | ✅ **951 passed** (baseline 927, +24) in 80 files (was 77) |
| `npm run build` | ✅ 450 static pages |
| `npm run perf:budget` | ✅ 166.0 KB / 180 · 617.4 KB / 680 — **unchanged** |

## Verified against the production build

Every heading now reads as a phrase:

```
/tires                     New & Used Tires in Miami
/services                  Auto Services Miami & Orlando
/about-us                  About MrGoma Tires
/guides                    Tire Guides & Tips
/contact                   Contact MrGoma Tires
/locations                 Our Locations Miami & Orlando
/tires/used                Used Tires Miami & Orlando
/tires/brands/michelin     MICHELIN Tires
/tires/size/235-50-20      235/50/20 Tires in Miami
/services/wheel-alignment  Wheel Alignment Miami & Orlando, FL
```

**`/guides` has a shape**: one `<h1>`, four `<h2>`s (three sections plus the
call-to-action), and the seven cards are now `<h3>`. The page renders ten `<h3>`s
in total — the seven cards plus the three the footer contributes.

**The guide's four surfaces agree**, which was the actual defect:

```
h1                 How to Buy Used Tires
breadcrumb JSON-LD How to Buy Used Tires
breadcrumb visible How to Buy Used Tires
Article headline   How to Buy Used Tires
```

**The home page's guide cards** now show the short card name and pull their read
time and intro from the config.

## It was twelve headings, not eleven

The spec and plan counted eleven `<h1>` templates. Making the guard cover **all
six heading levels** — a decision recorded in the plan as insurance — found a
twelfth on its first run:

```
src/app/(shop)/about-us/container/AboutUs/AboutUs.tsx  <h2>
  Built in Miami.Driven by trust.
```

Restricting the guard to `<h1>` would have left it there, and it is the same
defect. The audit's count of "thirteen pages" was eleven `<h1>` templates covering
roughly four hundred pages, plus one `<h2>` nobody had counted.

## The guard caught itself before it caught anything else

The language rule's first run failed on **correct code**:

```
× finds no Spanish in an aria-label, alt or title
  + "…/HamburgerMenu.tsx: aria-label=\"Abrir menú de navegación\""
  + "…/MenuHeader.tsx: aria-label=\"Close menu\""
```

`menu` was in the word list, and it is spelled the same in English. A guard that
fails on correct code is a guard that gets deleted, so `menu` came out — `menú`
with its accent is already covered by the character rule. The reasoning is in the
test beside the list.

## The home page had a second copy of the guides

The plan expected `Home.tsx:352` to be a one-line field swap. TypeScript refused
it: the home page does not read `guidesConfig` at all. It carried
`FEATURED_GUIDES`, a **hand-copied list of three guides** with their titles, read
times and intros duplicated.

So "one guide under two names across two grids" was not a field mix-up — it was a
second source. The home page was still showing `How to Buy Used Tires: The
Complete Guide` because nothing connected it to the name being retired.
`FEATURED_GUIDES` is now three slugs resolved against the config, which is one
file beyond the plan's list and the same fix pattern as the WhatsApp number, the
founding year and the store facts.

## All four guards verified red

Not one of them has only ever been seen passing:

```
× has no <br /> inside any h1–h6            (a <br /> restored in locations/page)
× finds no Spanish in an aria-label…        (the Spanish label restored)
× does not enable trailingSlash             (the flag flipped to true)
× east-orlando does not name two airports   (022's, still green here)
```

## One thing that went wrong, and how

After verifying the `trailingSlash` guard red, the working tree was restored but
`.next` was not — so a later check against `npm start` showed `/locations`
redirecting to `/locations/` and every heading extraction returning nothing. The
config was clean; the **build** was not. A `rm -rf .next` and a rebuild resolved
it. Worth remembering: a negative test that touches build configuration leaves
artefacts the source no longer explains.

## About the trailing slash that started T8

The home canonical has no trailing slash. It never had one during this work — the
tag reads `href="https://www.mrgomatires.com"`, verified in production three
times, and the owner confirmed the slash they were seeing comes from a browser
extension re-serialising the URL. That is the same artefact that made the original
audit file it as T030.

The guard stays because looking for the symptom found a real gap beside it:
`metadata.test.ts` pins what the **builder** returns, while the rendered tag is
clean only because `trailingSlash` defaults to `false`. Flipping that one flag
would put a slash on the canonical of every page on the site with every existing
test still green — as the red run above demonstrates.

## A claim this feature made and had to withdraw

The spec, the plan and the tasks all said that a `<br />` heading "copies as one
run-on word", and offered select-and-paste as the way to see the fix. **That was
wrong.** A browser inserts a newline at a `<br />` when copying, exactly as it
does at a block boundary, so the clipboard produced three lines before this change
and produces three lines after it. Nothing about copy-and-paste ever showed the
defect.

The owner found this by testing what the task told them to test, and pasting

```
About
MrGoma
Tires
```

What actually changed is the element's text — which is what Google parses and what
a screen reader announces:

```
before   textContent: "AboutMrGomaTires"
after    textContent: "About MrGoma Tires"
```

Confirmed against the built page: the markup is
`About<!-- --> <span class="block …">MrGoma</span> <span class="block …">Tires</span>`,
with real space text nodes between the blocks.

The fix is right and the defect was real; the symptom was described in the wrong
place. Corrected in the spec, the plan and the task rather than left to mislead
the next reader.

## Still to verify (manual)

- [ ] **T10 — at 360 px, and the check no test can make.** Each of the twelve
      headings still breaks **where it did**, at the same sizes, nothing
      overflowing. `/about-us` (three lines, middle one outlined) and `/contact`
      (two lines, not three) are the two most likely to have moved, because they
      were the two that needed more than the mechanical swap.
      Also look at the home page's guide cards, which now show the short name.
- [ ] **T11 — screen reader.** The mobile menu button announces in English, and a
      corrected heading reads as a phrase rather than a token.

---

_Spec: [spec.md](./spec.md) · Plan: [plan.md](./plan.md) · Tasks: [tasks.md](./tasks.md)_
