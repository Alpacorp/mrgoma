# Results — 022-store-pages

> Recorded: 2026-08-18 · Status: implemented, awaiting manual verification

## Definition of Done

| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | ✅ |
| `npm run lint` | ✅ |
| `npm test` | ✅ **1.005 passed** (baseline 927, +78) in 79 files (was 77) |
| `npm run build` | ✅ |
| `npm run perf:budget` | ✅ 166.0 KB / 180 · 617.4 KB / 680 — **unchanged** |

## Verified against the production build

Seven titles, 40–54 characters, each naming the product and the state — where
none previously contained "used tires", the site's biggest non-brand query:

```
43  Used & New Tires in Cutler Bay, FL | MrGoma
46  Used & New Tires in Miami Airport, FL | MrGoma
54  Used & New Tires in Orlando West Colonial, FL | MrGoma
```

Seven descriptions, 145–157, each naming **its own street and its own areas**:

```
153  cutler-bay             …on S Dixie Hwy…       Serving Palmetto Bay and South Miami.
157  miami-gardens          …on NW 2nd Ave…        Serving Hollywood, Aventura and Opa-locka.
145  orlando-west-colonial  …on W Colonial Dr…     Serving Winter Garden, Metrowest and West Orlando.
155  east-orlando           …on N Semoran Blvd…    Serving Azalea Park and Winter Park.
```

**The heading keeps its space** — the whole point of not using `<br />`:

```
MrGoma Tires Orlando West Colonial Used & New Tires
```

**All four airport surfaces corrected**, counted in the rendered HTML:

| Surface | `Orlando Executive` | `Orlando Int…` |
| --- | ---: | ---: |
| `/` (home slider) | 1 | **0** |
| `/contact` | 1 | **0** |
| `/locations/east-orlando` | 1 | **0** |

## AC4 was verified both ways

The templating test passes now — but a test that has only ever passed proves
nothing, so the old copy was run through it:

```
old template, swap "Cutler Bay"→"Hialeah" and the city:
  does it produce the other store's description?  True
```

That is what seven store pages were: one sentence with the nouns swapped. It is
also the most plausible reason Orlando West Colonial has never appeared in Search
Console at all.

## The guards were verified red

Both defects reintroduced, one at a time:

```
× east-orlando does not name two different airports
  AssertionError: expected 2 to be less than or equal to 1
× hialeah has a street and at least two areas to name
  AssertionError: expected 0 to be greater than 3
```

The first is the important one: the wrong airport was put back in **one of the
three fields**, which is exactly how the original error survived.

## Three things the plan did not anticipate

**The guard found a fourth store with the same shape of problem.** Coral Gables
names two airports — `Near MIA Airport` in `serving` and
`Near Miami International Airport` in `neighborhoods`. Unlike East Orlando these
are the *same* airport under two names, so it is drift in spelling rather than a
false fact. Miami International is in fact written **three ways** across the
config (`MIA`, `Miami Int'l`, `Miami International`).

Flattening them was rejected: `serving` renders on a card where space is tight,
which is why the short forms exist. Instead the guard normalises known aliases,
so it still catches *two different airports* — the real failure — without
demanding one spelling in a place where a shorter one is better copy.

**`metadata.test.ts` was widening a lie.** Its location entries were four stores
written by hand with `slug: 'x'`. Every store-wide assertion — "all seven titles
are distinct", "each description names its own street" — was a statement about
four stores standing in for seven, and could not have caught a defect in the
other three. T2 fixed that before any copy changed, and the suite stayed green,
which means no defect was hiding there.

**`andList` had to move tasks.** T1 added it alongside the two derivations, and
lint failed it as unused until T4 consumed it — the suite has to be green after
every task, not only at the end.

## Deliberately not adopted

**The audit's second title variant.** T049 and T052 propose
`Tires & Auto Service` for Hialeah and East Orlando, with headings naming
**"MrGoma Tires Automotive"** — a string that appears **nowhere in this
repository**, presumably those stores' Business Profile names. It may be correct
and may matter for local search, but putting a possibly-wrong business name on two
pages is not something to ship unverified. **Question for the owner.**

## Still to verify (manual)

- [ ] **T9 — the only check that needs eyes.** The longer `<h1>` at **360 px** on
      `/locations/orlando-west-colonial`, the longest of the seven names. Two
      lines, second smaller, nothing overflowing, the paragraph below not pushed
      off-screen. Then select the heading text and confirm it copies **with the
      space**.
- [ ] **T10 — before merge.** Search Console export for the seven stores and
      their queries, while the old copy is live.
- [ ] **T11 — after deploy.** URL Inspection on
      `/locations/orlando-west-colonial`. It has zero impressions today; if it
      reports "Crawled — currently not indexed", the identical descriptions were
      plausibly the cause and this is where it changes.
- [ ] **T12 — at 28 days.** Impressions and CTR for the seven. **A flat result is
      a finding, not a failure** — it says the clicks go to the Business Profile
      and that `017` is where the next effort belongs.

## What this is expected to achieve

The store pages drew **20.376 impressions in the top four positions and fifty
clicks** in three months. The audit projects +30% of site traffic from fixing the
copy. This feature deliberately does not promise that: the site earns a 21% CTR on
brand queries and **0,78% at position 1.1** on brand-plus-store queries, a gap no
title explains and the local pack does.

What it does deliver regardless of CTR: the home page stops naming the wrong
airport, and seven pages stop being one page with the nouns swapped.

---

_Spec: [spec.md](./spec.md) · Plan: [plan.md](./plan.md) · Tasks: [tasks.md](./tasks.md)_
