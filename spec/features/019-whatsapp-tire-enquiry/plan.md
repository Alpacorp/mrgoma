# Plan — Ask about this tire on WhatsApp

> Feature: `019-whatsapp-tire-enquiry` · Based on: [spec.md](./spec.md) · Created: 2026-08-17

## Technical approach

Three separable pieces, in dependency order:

1. **One home for the WhatsApp number** (`src/app/utils/whatsapp.ts`) — a plain
   string plus a link builder, with a guard test that fails if a twelfth copy
   ever appears. Everything downstream imports it.
2. **A pure message builder** (`src/app/utils/tireEnquiry.ts`) — `SingleTire` in,
   a plain-text string out. No React, no DOM, no environment. This is where all
   the interesting behaviour lives (the `'-'` sentinel, the sold branch, the
   truncation), which makes almost every acceptance criterion a unit test rather
   than a manual click.
3. **A Server Component button** rendered from `TireInformation`.

**The button ships zero JavaScript.** `InteractionTracker` already listens for
clicks on anything carrying `data-track` from a single delegated listener in the
root layout, so an ordinary `<a>` is fully instrumented without `'use client'`,
without a hydration boundary and without a runtime message build. The `href` is
computed on the server during the existing render. This is what the
"No client-side cost" constraint requires, and the mechanism `015` built exists
precisely so features like this cost nothing.

## Reuse first

| Existing thing | How it is reused |
| --- | --- |
| `InteractionTracker` (`data-track-*`) | Instruments the link declaratively; any `data-track-*` becomes an event param. **No tracking code is written.** |
| `absUrl()` / `buildTireSlug()` (`utils/seo.ts`, `utils/tireSlug.ts`) | Builds the canonical detail URL exactly the way `generateMetadata` already does, so the link in the message and the `og:url` cannot drift. |
| `isSold` in `TireInformation` | The sold check already exists at the insertion point; the button reads it rather than recomputing. |
| `storeData.guard.test.ts` | Copied as the shape for `whatsapp.guard.test.ts` — same walk-the-source-tree approach, same exemption pattern. |
| `messages.ts` `WHATSAPP_NUMBER` | Already a named constant in the AI-chat lib; it becomes a re-export of the new source instead of its own literal. |
| `EVENTS` / `analyticsEvents.ts` | The event vocabulary. See *Data & flow* for why no new name is added. |
| `src/app/ui/icons/` | The WhatsApp glyph moves here (see below) rather than being written a third time. |

### A third copy we would otherwise have created

The WhatsApp SVG path is already written out **verbatim in two places** —
`Contact.tsx` and `DashboardCartModal.tsx` — while `src/app/ui/icons/` holds
twenty-odd icons and no WhatsApp one. Writing the glyph inline in a new button
would make three. It moves to `src/app/ui/icons/WhatsAppIcon.tsx` and both
existing copies are repointed.

## Files to add / change

### Add

- `code` on `SingleTire` (`src/app/interfaces/tires.d.ts`) and in
  `mapTireRecordToSingleTire` — see *The missing field* below.
- `src/app/utils/whatsapp.ts` — `WHATSAPP_NUMBER`, `WHATSAPP_TEL` (E.164, for
  JSON-LD), `whatsAppLink(message?)`. No imports, for the same reason
  `analyticsEvents.ts` has none: it is pulled into both the browser bundle and
  route handlers, so it must stay environment-free.
- `src/app/utils/whatsapp.test.ts` — encoding, absent message, digit stripping.
- `src/app/utils/whatsapp.guard.test.ts` — walks `src/`, asserts the literal
  `14073644016` (in any punctuation) appears in no file but `whatsapp.ts`.
- `src/app/utils/tireEnquiry.ts` — `buildTireEnquiry(tire: SingleTire): string`.
- `src/app/utils/tireEnquiry.test.ts` — the bulk of the ACs.
- `src/app/ui/icons/WhatsAppIcon.tsx` — extracted glyph.
- `src/app/ui/components/WhatsAppEnquiryButton/WhatsAppEnquiryButton.tsx` —
  Server Component; renders the `<a>`.

### Change

- `src/app/ui/sections/TireInformation/TireInformation.tsx` — renders the button
  beneath the price/cart row, in both the sold and available branches.
- `src/app/(shop)/contact/container/Contact/Contact.tsx` — drop the local icon
  and the two hard-coded `wa.me` hrefs.
- `src/app/ui/sections/DashboardCartModal/DashboardCartModal.tsx` — drop the
  local icon **only**. It holds no number to repoint: it builds
  `https://wa.me/?text=…` with **no recipient**, deliberately, so the staff
  member picks the customer to send to. Pointing it at the business's own line
  would send every internal order to ourselves.
- `src/app/(shop)/guides/[slug]/page.tsx` — repoint href.
- `src/app/(shop)/locations/[location]/container/LocationDetail/LocationDetail.tsx` — repoint href.
- `src/app/(shop)/services/[service]/container/ServiceDetail/ServiceDetail.tsx` — repoint href.
- `src/app/ui/sections/PromoBanner/config/promoBanner.ts` — three hrefs become
  `whatsAppLink(...)` calls.
- `src/app/api/tires/ai-chat/route.ts` — the system prompt interpolates the
  number instead of spelling it (two occurrences).
- `src/app/api/_lib/aiChat/messages.ts` — its local `WHATSAPP_NUMBER` imports.
- `src/app/utils/seo.ts` — `telephone: WHATSAPP_TEL`.
- `src/app/utils/seo.test.ts`, `src/app/api/_lib/aiChat/messages.test.ts` —
  assert against the imported constant, not a literal (they are exempt from the
  guard, but should not re-introduce drift).

## Data & flow

Everything happens during the existing server render of `/tires/[slug]`. **No new
request, no new query, no new route, no DB read**: `fetchProduct` is already
`cache()`-wrapped and shared by `generateMetadata`, the JSON-LD and the page, and
this button reads the same `SingleTire` that `TireInformation` already receives
as a prop.

```
fetchTireById  →  mapTireRecordToSingleTire  →  SingleTire
                                                    │
                        TireInformation ────────────┤
                                                    ▼
                                        buildTireEnquiry(tire)
                                                    │  plain text
                                                    ▼
                                        whatsAppLink(message)
                                                    │  https://wa.me/…?text=…
                                                    ▼
                                    <a href> in the server-rendered HTML
                                                    │  click
                                                    ▼
                            InteractionTracker → trackEvent → GA4 + Vercel
```

### The missing field

`SingleTire` **has no `code`**. The stock code exists on the DB record as `Code`,
but the mapper only folds it into the display name — `(A4821) | BRIDGESTONE |
235/50/20` — and nothing else carries it. A message builder taking a `SingleTire`
therefore cannot satisfy FR3 as written.

Parsing it back out of `name` with a regex was rejected: it would couple the
message to a string format assembled in a different module, and a change to that
format would silently produce messages with no usable identifier.

So `code` becomes a first-class field on `SingleTire`, set by the mapper.

**This is safe to expose.** `mapTireRecordToSingleTire` is returned verbatim as
JSON by the public `/api/tire` route, so adding a field widens a public payload —
but `012-public-api-hardening` already lists `Code` in the `/api/tires`
whitelist. The field is public by an explicit prior decision, not by oversight.
Contrast `VaultName`, which the same feature deliberately excluded and which this
one also refuses to surface.

### The `'-'` sentinel

`mapTireRecordToSingleTire` writes the **string `'-'`** for a missing
`remainingLife`, `treadDepth`, `dot` or `price`, and always writes `'Yes'`/`'No'`
for `patched`. A falsiness check (`if (tire.treadDepth)`) is therefore true for a
missing value and would print `Tread: -`. The builder gets one helper:

```ts
/** The record's "no value" marker is a literal dash, not null or ''. */
const present = (v?: string) => Boolean(v && v.trim() && v.trim() !== '-');
```

Every optional line goes through it. This is the single most likely bug in the
feature and it is invisible to TypeScript, so it gets its own test (AC3).

### Message shape

Available:

```
Hi MrGoma, I'm interested in this tire:

#A4821 — Bridgestone Alenza A/S 02
Size: 235/50/20
Condition: Used · 80% life · 8/32" tread · Patched
Price shown: $135
https://www.mrgomatires.com/tires/471004-bridgestone-235-50-20
```

Sold (FR11) — states the fact before asking, so it can never read as interest in
buying this one:

```
Hi MrGoma, I saw this tire is already sold:

#A4821 — Bridgestone Alenza A/S 02 (235/50/20)

Do you have another one in this size?
https://www.mrgomatires.com/tires/471004-bridgestone-235-50-20
```

### Analytics

**No new event name is added.** `open_whatsapp` already exists and is already
emitted by the contact page, guides, locations and services; adding
`whatsapp_tire_detail` would split one behaviour across two names and make the
totals unanswerable. FR10 asks for *distinguishable*, not *separate*, and `018`
established exactly this vocabulary for exactly this problem:

```tsx
data-track="open_whatsapp"
data-track-category="product_enquiry"
data-track-surface="tire_detail"
```

`InteractionTracker` forwards `data-track-surface` as the param `surface`. The
tire's brand and size are **not** attached: they are not personal data, but they
are high-cardinality and the detail URL is not something we should mirror into
two third parties for no analytical gain.

## Acceptance criteria → implementation

| AC | How it's met | How it's verified/tested |
| --- | --- | --- |
| AC1 | `code` added to `SingleTire` + mapper; `buildTireEnquiry` composes code, brand, size, condition, life, tread, price | Unit: mapper sets `code` from `record.Code`; fixture used tire → assert each substring present |
| AC2 | `condition === 'New'` skips the life/tread segment | Unit: new-tire fixture → assert `%` and `/32` absent |
| AC3 | `present()` rejects `'-'` | Unit: fixture with all fields `'-'` → assert no `-`, no empty label, no `undefined` |
| AC4 | `absUrl('/tires/' + buildTireSlug(...))` — same call `generateMetadata` makes | Unit: last line equals expected absolute URL. Manual: open it |
| AC5 | `trim()` at `MAX_NAME`, ellipsis | Unit: 200-char name → assert `…` and total length under cap |
| AC6 | `encodeURIComponent` in `whatsAppLink` | Unit: message with `#`, `&`, `\n`, `"` → decode the `text` param, assert round-trip equality |
| AC7 | Sold branch in `buildTireEnquiry`, driven by the existing `isSold` | Unit: sold fixture → assert "already sold" present and "interested in this tire" absent |
| AC8 | The builder never reads `VaultName`; it is not on `SingleTire` | Unit: assert the message matches no store name from `locationsConfig`, nor `Warehouse`/`441`/`27th Ave` |
| AC9 | `whatsapp.ts` is the only home | `whatsapp.guard.test.ts` walks `src/` (the `storeData.guard.test.ts` pattern) |
| AC10 | `data-track-surface="tire_detail"` | Unit: render the component, assert the attribute set. Manual: Vercel Analytics after deploy |
| AC11 | Native `<a>`; `focus-visible:ring-2`; accessible name includes "opens WhatsApp" | Unit: accessible name assertion. **Manual: keyboard tab-through** |
| AC12 | `w-full` stacked below the cart row in both branches; `min-h-11` (44px) | **Manual: DevTools at 360px, on an available tire and a sold one.** Unit: classes present |
| AC13 | Firewall rule (already published) | ✅ **Verified 2026-08-17**: `facebookexternalhit` → `200`, `og:image` present |
| AC14 | Depends on AC13 | **Manual: send a message in a real WhatsApp chat** |
| AC15 | No JS added; no layout inserted above the fold | `npm run perf:budget`; manual PSI on a detail URL |
| AC16 | The `018` guard tests are untouched and must stay green | `npm test` — `prompt.guard.test.ts`, `messages.test.ts`, `storeData.guard.test.ts` |

## Tradeoffs / alternatives

**Server-rendered `<a>` over a client island.** A client component could build
the message on click and read live state. It would also add a hydration boundary
to a page that `003-detail-server-render` deliberately kept server-only, for a
message whose inputs are all known at render time. Rejected.

**One event with a `surface` param over a new event name.** Covered above.

**Extending `CtaButton` rather than a new component.** `CtaButton` builds
*internal* product URLs from `buildTireSlug` and has no notion of an external
target. Bending it to also emit `target="_blank"` external links would make a
shared component serve two unrelated jobs. A separate small component is the
smaller change.

**A neutral outline, not a green one — and a finding that contradicts the spec's
wording.** FR1 says Add to cart is filled and WhatsApp outlined. **It is not:**
`AddToCartButton` passes `style="primary"`, which `CtaButton` renders as
*outlined green* (`!border-green-600 text-green-700`). Making the WhatsApp button
"outlined" would produce two visually equal outlined buttons and lose the
hierarchy FR1 asks for.

Two ways out: restyle Add to cart to `filled` (changes the primary CTA across
every surface using `primary` — out of scope and needs its own visual check), or
give the WhatsApp button a **neutral slate outline** (`border-gray-300
text-gray-700`), which reads as clearly quieter than green without touching
anything existing. **The plan takes the second.** FR1's intent — Add to cart
keeps the weight — is satisfied; its literal wording is not, and the spec should
be read as amended by this paragraph.

## Risks

**The preview image lives on a host we do not control.** `og:image` points at
`https://www.usedtires.online/...`, outside our firewall and outside Vercel.
Measured 2026-08-17: `200`, `image/jpeg`, 379 KB, 1.2 s. It works today, but if
that host slows or dies the card degrades to text — and no change on our side
would fix it. Worth knowing; not worth blocking on. Mitigation if it becomes a
problem: route OG images through `next/image` on our own domain (a separate
feature).

**WhatsApp caches link previews hard**, keyed by URL. During manual verification
of AC14, a URL fetched *before* the firewall rule was published may still render
without a card. Test with a tire URL not shared before, or use Facebook's Sharing
Debugger to force a re-scrape.

**Repointing twelve occurrences touches the AI chat's system prompt**, which is a
template literal — a place where a broken substitution type-checks fine and fails
silently in production. The `018` guard tests cover the prompt's content, and
AC16 makes keeping them green explicit. Prompt edits get read, not just run.

**`modern-web-guidance` is not installed in this session.** `CLAUDE.md` requires
researching modern UX/UI before building a new interface, and the skill is absent
from `~/.claude/skills/` and the project. The new surface here is one button
reusing existing tokens and an existing icon, so the exposure is small — but the
rule was not followed and that is a gap, not a judgement call. Flagged for the
owner to waive or to supply the skill.

## Out of scope

- **Naming the holding store in the message.** Needs a `VaultName` → public-store
  mapping only the owner can confirm; see *Resolved decisions* in `spec.md`.
- Rewriting `DashboardCartModal`'s own message builder — it keeps its format and
  only stops re-declaring the number.
- WhatsApp on `/tires` listing cards, the cart or checkout.
- Restyling `CtaButton`'s `primary` variant.
- Self-hosting OG images.

---

_The concrete steps live in [tasks.md](./tasks.md)._
