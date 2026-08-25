# Results — 028-brand-casing

> Recorded: 2026-08-24 · Status: implemented, awaiting manual verification

## Why

`025` title-cased the brand in the tire `<title>`, so the browser tab read
`Bridgestone` while the heading directly below it shouted `BRIDGESTONE`. The
catalog stores brands in capitals; that is fine as data and wrong as a label.

The same drift ran through the site: **115 brand landing pages** headed
`GROUNDSPEED Tires`, the cards, the breadcrumb, the filter list — which even
called `.toUpperCase()` explicitly — the image alt text, the WhatsApp enquiry,
and the screen-reader label on Add to Cart.

## Definition of Done

| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | ✅ |
| `npm run lint` | ✅ |
| `npm test` | ✅ **1.221 passed** (baseline 1.216, +5) in 93 files |
| `npm run build` | ✅ |
| `npm run perf:budget` | ✅ 619.9 KB / 680 — **+0.2 KB** |

The 0.2 KB is `brandDisplay.ts` reaching the client bundle, which is the point of
extracting it.

## Where the brand is now written for a reader

| Surface | Was | Is |
| --- | --- | --- |
| brand landing `<h1>` and `<title>` | `GROUNDSPEED Tires` | `Groundspeed Tires` |
| brand breadcrumb, visible and JSON-LD | `GROUNDSPEED` | `Groundspeed` |
| tire card title | `BRIDGESTONE …` | `Bridgestone …` |
| tire detail `<h2>` | `(102692) \| BRIDGESTONE \| …` | `(102692) \| Bridgestone \| …` |
| detail hero and breadcrumb | `BRIDGESTONE` | `Bridgestone` |
| visible description | `Used BRIDGESTONE DUELER…` | `Used Bridgestone DUELER…` |
| Product JSON-LD `name` and `brand` | `BRIDGESTONE` | `Bridgestone` |
| image `alt`, `title`, `aria-label` | `BRIDGESTONE` | `Bridgestone` |
| brand filter list and carousel | `GROUNDSPEED` | `Groundspeed` |
| WhatsApp enquiry message | `BRIDGESTONE` | `Bridgestone` |
| Add to Cart screen-reader label | `BRIDGESTONE` | `Bridgestone` |
| Merchant feed title, brand, description | `BRIDGESTONE` | `Bridgestone` |

On the reported tire page, `BRIDGESTONE` went from **23 occurrences to 3**.

## What deliberately kept the capitals

**The data, not the display.** The three remaining occurrences are the serialized
React payload — `brand` and `name` on the tire object. Those are matched on by the
cart and by checkout re-validation, so they stay exactly as stored. Filter
`value` attributes stay raw for the same reason: the query has to match the
catalog.

**One thing changed that I first said would not.** `data-track-label` on the tire
card and the image zoom derives from strings that are now cased, so those event
labels change spelling from today. Kept rather than worked around — the label is
free text with one value per tire, nothing aggregates on it, and an event that
reads back what the person actually saw is the more useful record. The comment in
`mapTireRecordToSingleTire` claiming analytics kept the capitals was wrong and has
been corrected.

## Where it lives

`brandName` moved out of `seo.ts` into **`src/app/utils/brandDisplay.ts`**, a small
module with no other imports, so client components (`TireCard`, `FilterBody`,
`BrandImage`, `CtaButton`, the brand carousel) can use it without pulling the
metadata layer into the browser. `seo.ts` re-exports it, so nothing that imported
it from there had to change.

## Still to verify (manual)

- [ ] A brand landing page — `/tires/brands/groundspeed` should read
      `Groundspeed Tires`, in the heading, the tab and the breadcrumb.
- [ ] A tire detail page — heading, hero, breadcrumb and description.
- [ ] The brand filter list and the carousel on `/tires`.
- [ ] The WhatsApp message for a tire.
