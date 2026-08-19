# Results — 024-structured-data

> Recorded: 2026-08-18 · Status: implemented, awaiting manual verification

## Definition of Done

| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | ✅ |
| `npm run lint` | ✅ |
| `npm test` | ✅ **1.045 passed** (baseline 1.029, +16) in 83 files (was 82) |
| `npm run build` | ✅ |
| `npm run perf:budget` | ✅ 166.0 KB / 180 · **618.2** KB / 680 |

**The budget moved by 0.8 KB and the plan said it would not.** Unlike the 0.2 KB
in `021`, this one is real: two clean builds, with and without the branch, give
617.4 and 618.2. It is also **unattributed**. No client component imports
`seo.ts`; `Home.tsx` and `JsonLd` are server components; and `locationsConfig`
already reached the client bundle through `LocationsSlider` and `Contact`, both
of which are client. So the import added there changes nothing on that path.

Recorded as measured rather than explained: 0.12% of a limit with 9% of headroom,
reproducible, cause unknown.

## Verified against the production build

Every page now says what it is:

| Page | Gained |
| --- | --- |
| `/` | `ItemList` + `ListItem` ×7, and the logo's `ImageObject` |
| `/tires` | `CollectionPage`, `BreadcrumbList` |
| `/guides` | `CollectionPage`, `BreadcrumbList` |
| `/about-us` | `AboutPage`, `BreadcrumbList` |
| `/contact` | `ContactPage`, `BreadcrumbList` |
| `/locations` | `CollectionPage`, `BreadcrumbList` |

```
store @type   "@type":["TireShop","AutoRepair"]
logo          {"@type":"ImageObject","url":"…/desk-logo.png","width":513,"height":512}
home list     "numberOfItems":7 · "item":"…/locations/cutler-bay" …
article       "author":{"@id":"https://www.mrgomatires.com/#organization"}
              no dateModified
```

## A verification that nearly passed by mistake

The first pass over the built pages listed each page's `@type` values with a grep
for `"@type":"…"` — and **`TireShop` did not appear**. Not because the change had
failed, but because the store type is now an **array**, `"@type":["TireShop",
"AutoRepair"]`, which that pattern cannot match.

Had the sweep been read as a checklist, the conclusion would have been that T5 did
not ship. The check was wrong, not the code. Worth remembering: a verification
that reports absence is only as good as the pattern behind it.

## What the audit did not know

**The business was described inline in two files, not one.** The guide's `Article`
inlined it twice — as `author` and as `publisher`, the latter with the 32×32
favicon — and the eight service pages each declared:

```jsx
provider: { '@type': 'AutoRepair', name: 'MrGoma Tires',
            url: 'https://www.mrgomatires.com' }   // literal, not absUrl()
```

AC2 was originally written as "no `'@type': 'Organization'` outside `seo.ts`" and
would have passed that. It is now written over the **business types**, and both
nodes moved into `seo.ts` — because both were inline for the same reason: they
were the only two built inside a page rather than through an emitter. Every node
that already came from `seo.ts` referenced the entity `@id` correctly.

**And it means `AutoRepair` was already declared for this business.** Typing the
stores with it states nothing new; it connects a claim the site was already
making, unattached.

## The type list was red before it was written

`Brand` and `Service` are emitted today and were missing from the plan's first
draft of the recorded list. A guard shipped with it would have failed on arrival —
the mirror image of the mistake the list exists to prevent, which is shipping a
type that does not exist and hearing nothing about it.

`TireShop` was itself doubted during `/specify` and checked against schema.org
before being accepted. It is real.

## All three guard assertions verified red

```
× finds no business node defined anywhere else
  + "/src/app/(shop)/guides/page.tsx: '@type': 'AutoRepair'"
× emits nothing outside the recorded list
  + "TyreDepot (/src/app/(shop)/guides/page.tsx)"
× routes every node through the JsonLd component
  + "/src/app/(shop)/guides/page.tsx"
```

## The store retype changed the type and nothing else

`AC9` asserts `geo`, `hasMap`, `openingHoursSpecification`, `areaServed` and
`address` **against `locationsConfig`, field by field**, for all seven. Those
values were verified store by store on 2026-08-04, after Miami Gardens was found
holding the coordinates of a locksmith in the same plaza.

The field is `openingHoursSpecification`. The plan named it `openingHours` at
first — a test written from that would have asserted `undefined` and passed.

## Deliberately not done

- **T011** (`telephone`, `address`) and **T013** (`sameAs`) — blocked on the
  owner. The `Organization` still pairs an Orlando phone with an incomplete Miami
  address; only they know Jomah Trading Inc.'s registered details, and naming the
  wrong Business Profile would tie the brand to another business.
- **T014** (`SearchAction`) — **closed as not applicable.** It needs a results URL
  carrying a free-text query; this site has only structured filters.
- A product `ItemList` on `/tires` — waits for block 5's URL consolidation, as the
  audit itself instructs.

## Still to verify (manual)

- [ ] **T8 / AC13 — after deploy.** Google's Rich Results Test on the home, a
      store page, `/tires` and a guide. No errors, and the guide recognised as an
      article. **This is the only check that reports what Google makes of the
      markup**; everything above verifies what we emit.

---

_Spec: [spec.md](./spec.md) · Plan: [plan.md](./plan.md) · Tasks: [tasks.md](./tasks.md)_
