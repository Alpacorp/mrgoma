# One tire, one name

> Recorded: 2026-08-24 · part of `028`

## What was reported

The same tire, five screens, five names:

```
card       Bridgestone DUELER H/L ALENZA
detail h1  Bridgestone DUELER H/L ALENZA
detail h2  (259893) | BRIDGESTONE | 275/55/20
cart       (259893) | BRIDGESTONE | DUELER H/L ALENZA | 275/55/20
checkout   (259893) | BRIDGESTONE | DUELER H/L ALENZA | 275/55/20
```

## The cause: three composers, not one

| Where | Format |
| --- | --- |
| `transformTireData.ts:11` — cards → cart | `(CODE) \| BRAND \| MODEL \| SIZE` |
| `mapTireRecordToSingleTire.ts:50` — detail → cart | `(CODE) \| BRAND \| SIZE` |
| `DashboardTable.tsx:40` — dashboard → cart | `BRAND \| MODEL \| 275/55R20` |

So **a tire in the cart was named according to the screen it was added from**, and
the dashboard wrote the size with an `R` while everything else used slashes.
`TireCard` then *parsed the composed string back apart* to recover model and size,
which is what made the whole thing brittle.

Same shape as the WhatsApp number, the founding year and the city before it: one
fact, many spellings.

## What it is now

`src/app/utils/tireNaming.ts` is the only place a tire is named.
`src/app/utils/cartLine.ts` shapes a cart or checkout line from it.

```
Bridgestone Dueler H/L Alenza
275/55/20 · Used
#259893                                    $135.00
```

The stock code moved out of the middle of the product name to its own line, where
it is useful for support. `transformTireData` and the transformed type now carry
`model` and `size` as fields, so nothing parses the composed string any more.

`name` itself is untouched: the cart and checkout re-validation match on it.

## Casing the model — asked for over a recommendation against it

`025` deliberately left model names alone, and this reverses that. The reason for
the original decision still stands: the catalog holds **166 all-caps tokens of
four letters or fewer** and almost all are codes (`XL`, `RFT`, `RSC`, `PNCS`), and
a first attempt with a length rule produced `Primacy ALL Season`.

So the rule is built from the catalog rather than guessed. A token is a word when
it is **five letters or more**, or when it is in an explicit list of the short
words that really are words — taken from the data, not imagined.

```
ADVAN SPORT V107 XL                        → Advan Sport V107 XL
P ZERO TM PZ4 RSC RFT XL                   → P Zero TM PZ4 RSC RFT XL
VENTUS S1 EVO3 SUV HRS KONTROL RSC RFT XL  → Ventus S1 EVO3 SUV HRS Kontrol RSC RFT XL
PRIMACY ALL SEASON DT                      → Primacy All Season DT
CINTURATO P7 ALL SEASON NO ECOIMPACT XL    → Cinturato P7 All Season NO EcoImpact XL
```

`NO` stays as it is: on a Pirelli it marks Nissan original equipment, not the
English word. Compounds the manufacturer writes with an internal capital —
`PremiumContact`, `CrossContact`, `EcoImpact`, `BluEarth` — are listed explicitly,
because flat capitals lose that information and it cannot be recovered.

**It will still be wrong for a compound nobody has added to that list.** The
failure is visible on the page rather than silent, which is the best that can be
done here.

## Verified

One tire, every surface:

```
hero          Bridgestone Dueler H/P Sport AS XL
heading       Bridgestone Dueler H/P Sport AS XL
description   Used Bridgestone Dueler H/P Sport AS XL (245/50/19) tire.
browser tab   Used Bridgestone Dueler H/P Sport AS XL 245/50/19 — $155
card          Bridgestone Dueler H/L Alenza
code line     #102692
```

What still holds the stored capitals, on purpose: the serialized `brand` and
`name` on the tire object, which the cart and checkout match on, and the filter
`value` attributes, which the query matches on.

## Still to verify (manual)

- [ ] Add a tire to the cart **from a card**, then **from its detail page** — both
      lines should read the same.
- [ ] A cart saved before this change should still show its old name rather than
      collapsing to a bare brand.
- [ ] The dashboard's add-to-cart, which was the third composer.

---

## Visual balance in the detail hero

Two changes asked for after the naming landed, both about composition rather than
correctness.

**The size moved into the heading.** It sat in a chip above the title at 12px —
the smallest text on the screen, while being the thing most buyers arrive already
knowing. It now reads at heading scale beside the model, in a muted grey so the
product name still leads:

```
Bridgestone Dueler H/P Sport AS XL 245/50/19
└ green ┘ └──── white ────────────┘ └ grey ─┘
```

That also puts the size in the page's accessible name, which is what a screen
reader announces and what Google reads. Joined with a real space rather than a
line break — `023` found that a `<br />` between text nodes runs the words
together in `textContent`.

**The condition badge appeared three times in one viewport**: a pill in the hero,
another over the gallery image, and the labelled `Condition` cell in the spec
grid. The gallery one is gone — it was the only one with no label and no context.
Kept where each earns its place: once at the top for immediate context, once in
the specs table where a buyer goes to compare.

Verified: `Used` now appears twice on the page, in the hero and the spec grid,
and the `<h1>` reads `Bridgestone Dueler H/P Sport AS XL 245/50/19` with no words
run together.
