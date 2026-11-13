# Plan — Tires as they appear on Stripe Checkout

> Feature: `048-stripe-line-items` · Based on: [spec.md](./spec.md) · Created: 2026-11-13

## Technical approach

`POST /api/checkout/create-session` already re-reads every tire from
`/api/tire?productId=` (authoritative price and availability) and builds one
Stripe `price_data.product_data` per tire with `name: v.name` (the composed
`(CODE) | BRAND | MODEL | SIZE`) and `images: [v.image]` (the first image,
made absolute against the site's origin — the generic
`/assets/images/generic-tire-image.webp` for the 72% of tires without a
photo).

048 changes only **what goes into `product_data`**, through one pure function
so every rule is a unit test:

```ts
// src/app/api/_lib/stripeProduct.ts
stripeProduct(tire, { siteHosts, fallbackImage }) →
  { name, description?, images? }
```

1. **Name (FR1).** `cartLine({ name, brand, model: model2, size }).title` —
   the same composer the cart, the checkout page and GA4's `item_name` use
   ("Pirelli Scorpion TM MS LR XL"). Falls back to the composed name only if
   the tire has no model (as `cartLine` does).
2. **Description (FR2, D3).** `[size, condition, ...facts, "Stock #code"]`
   joined with " · ". Facts come from 047's `factsFromSingleTire` +
   `factsParts` **without DOT** (tread, life, patch) and only for **used**
   tires. Missing facts are skipped; empty description → omitted.
3. **Image (FR3, FR4, D1).** The tire's first image, made absolute as today,
   is sent **only if its host is not the site's own** (`siteHosts`: the
   request origin's host, `NEXT_PUBLIC_SITE_URL`'s and `NEXT_PUBLIC_BASE_URL`'s
   hosts, and `www.mrgomatires.com` / `mrgomatires.com`). Real photos live on
   the photo supplier's host and pass; the generic image and anything else on
   the site is replaced by `CHECKOUT_FALLBACK_IMAGE_URL` when it is set and
   is itself not a site host; otherwise `images` is omitted.
   The env var already exists in the route (unused in production); its
   meaning narrows to "the generic image Stripe can fetch".
4. **Unchanged:** `unit_amount`, currency, metadata (040), the 7% pickup tax
   line, free shipping, no `adaptive_pricing` parameter (D4). The **WhatsApp
   order message** keeps the composed internal name with the ID — staff read
   it to pull the tire — so `v.name` stays and a new `v.display` feeds Stripe.

### Option 1 — firewall rule (documented, not applied; D2)

Written into `results.md` (and the owner's checklist), not into code:

- Vercel → Project → Firewall → **Custom rule** "Stripe can fetch images":
  *If* Request Path **starts with** `/assets/images/` **and** Method
  **equals** `GET` → **Bypass**. Nothing else.
- Check after setting it:
  `curl -s -o /dev/null -w "%{http_code} %{content_type}\n" https://www.mrgomatires.com/assets/images/generic-tire-image.webp`
  → `200 image/webp` (today: `429 text/html`).
- Caveat to verify then: if the 429 comes from **Attack Challenge Mode**
  rather than a custom rule, a Bypass rule may not exempt it; the check shows
  which.

### The generic image on Vercel Blob (D5)

- Convert `public/assets/images/generic-tire-image.webp` to **PNG** (Stripe
  documents no WebP support for Checkout images; PNG is the safe format) with
  macOS `sips`, into the scratchpad — not into the repo.
- A **public Blob store** in team `team_ASmPq5S27VGh7Y7jny70bjw3`, the PNG
  uploaded, its URL set as `CHECKOUT_FALLBACK_IMAGE_URL` for Production and
  Preview. All three are **account changes**: done by the owner, or by the
  agent only after the owner approves each one in chat. The code works
  without them (no image instead of a broken one).

## Reuse first

- `cartLine()` (`src/app/utils/cartLine.ts`) — the one tire title.
- `factsFromSingleTire()` / `factsParts()` (`src/app/utils/cartFacts.ts`,
  047) — tread · life · patch, same words as the cart.
- `normalizeProductImage()` and `CHECKOUT_FALLBACK_IMAGE_URL` — already in
  `create-session/route.ts`.
- `GENERIC_TIRE_IMAGE` — not needed: the host rule covers it.
- The route's existing test (`create-session/route.test.ts`, `fetch` stub of
  `/api/tire`).

## Files to add / change

- `src/app/api/_lib/stripeProduct.ts` (new, pure) — `stripeProduct()`,
  `isSiteHost()`.
- `src/app/api/_lib/stripeProduct.test.ts` (new) — names, descriptions,
  images (see table).
- `src/app/api/checkout/create-session/route.ts` — keep the facts the
  `/api/tire` response already has (`treadDepth`, `remainingLife`, `patched`,
  `code`, `condition`) on each validated line; build `product_data` with
  `stripeProduct()`; `v.name` stays for WhatsApp.
- `src/app/api/checkout/create-session/route.test.ts` — a Stripe-enabled case
  with `stripe` mocked, asserting the `sessions.create` params (name,
  description, images, metadata, no `adaptive_pricing`, tax line for pickup);
  the WhatsApp case still shows the internal name with the ID.
- `spec/tech-stack.md` — one line under Stripe: line names/descriptions from
  `stripeProduct()`; site-hosted images never sent;
  `CHECKOUT_FALLBACK_IMAGE_URL` is the Blob-hosted generic image.
- `spec/features/048-stripe-line-items/results.md` — results, option-1 rule
  and check, Blob steps.

## Data & flow

- No new request: `/api/tire` already returns `treadDepth`, `remainingLife`,
  `patched`, `code`, `condition`, `model2`, `size`, `images`.
- Stripe `product_data`: `name` (≤ ~60 chars in practice), `description`
  (new), `images` (0 or 1), `metadata` (unchanged).
- Downstream: `/api/checkout/session` returns `description: li.description ||
  product.name` — the confirmation page now prints the readable name; GA4
  `purchase` builds `item_name` from metadata (040), so it does not change;
  only pre-040 sessions parsed the composed name, and those already exist
  with their old names.

## Acceptance criteria → implementation

| AC | How it's met | How it's verified/tested |
| --- | --- | --- |
| AC1 | `cartLine().title` as `name` | `stripeProduct.test`: PIRELLI / SCORPION TM MS LR XL → "Pirelli Scorpion TM MS LR XL", no `(`, `|` or code |
| AC2 | description from size, condition, facts (no DOT), stock | test: used patched tire → exact string; new tire → "size · New · Stock #…"; unknown facts skipped |
| AC3 | non-site host passes | test: `https://www.usedtires.online/…jpg` kept |
| AC4 | site host → fallback or none | test: generic on `www.mrgomatires.com` → fallback URL; no env → no `images`; a fallback on the site host is refused too |
| AC5 | amounts, tax line, shipping, metadata untouched | route test with Stripe mocked: pickup → tax line present; metadata keys as 040 |
| AC6 | rule + check in `results.md` | review; the check is run once by the agent now (expect 429) |
| AC7 | no `adaptive_pricing` sent | route test: `sessions.create` params have no `adaptive_pricing` |
| AC8 | only whitelisted `/api/tire` fields used | test: description never contains warehouse or shelf text (none read) |

Manual: a Stripe **test-mode** session through the real route (local, test
key) for a used tire with photo, one without, and a new tire, at phone width
in Chrome; then, once the Blob URL exists, the same in a Preview.
DoD: `tsc`, lint, tests, build, `perf:budget` (server-only change; no client
JS).

## Tradeoffs / alternatives

- **Apply the firewall bypass and keep sending site images:** rejected by D2;
  it would also leave the generic image as WebP, whose Stripe support is
  undocumented.
- **No image for tires without a photo:** the fallback when the env var is
  unset; with it, lines look uniform (D1).
- **Upload the generic image to Stripe Files:** works, but ties the image to
  one Stripe account (test vs live) and needs the live key; Blob is one URL
  for both (D5).
- **Change `v.name` everywhere:** rejected — the WhatsApp order message is
  read by staff, who look tires up by the code in it.

## Risks

- **Stripe display limits:** long model names wrap on phones; the
  description keeps the details off the name line. Checked at 390 px.
- **Firewall rule semantics (option 1):** unverified until applied; the
  documented check settles it.
- **Blob store as a new account resource:** public by design (one generic
  image); no customer data in it.

## Out of scope

- Adaptive Pricing (D4: unchanged).
- Photos for tires without one.
- The rest of Track 2 (S2.2–S2.6).

---

_The concrete steps live in [tasks.md](./tasks.md)._
