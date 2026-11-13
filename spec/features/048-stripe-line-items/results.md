# Results — Tires as they appear on Stripe Checkout

> Feature: `048-stripe-line-items` · Verified locally 2026-11-13 (`next dev`,
> Stripe **test mode**, real inventory, Chrome).

## Definition of Done

`npx tsc --noEmit` ✓ · `npm run lint` ✓ · `npm test` ✓ (157 files, 1,990
tests; 14 new) · `npm run build` ✓ · `npm run perf:budget` ✓ — shared
First-Load 166.0 KB of 180, total client JS 638.2 KB of 680 (unchanged:
server-only change).

## Browser (Stripe test session through the local route)

Cart: a used Pirelli P Zero TM RSC RFT XL with a photo, a used Bridgestone
Turanza T005 RO Enliten XL without a photo, a new Mastercraft Courser Trail;
delivery to FL.

| Line | Stripe shows | ✓ |
| --- | --- | --- |
| Used, with photo | "Pirelli P Zero TM RSC RFT XL" · "255/40/19 · Used · 5.3/32 · 53% life · Patched · Stock #103861" · its photo (via `img.stripecdn.com`) | AC1, AC2, AC3 |
| Used, no photo | "Bridgestone Turanza T005 RO Enliten XL" · "255/45/21 · Used · 8/32 · 80% life · Patched · Stock #265572" · **no image** (not a broken one) | AC1, AC2, AC4 |
| New | "Mastercraft Courser Trail" · "245/75/16 · New · Stock #227765" | AC2 |
| Totals | free shipping; tax by Stripe for delivery; Adaptive Pricing unchanged (COP / USD switch, as before) | AC5, AC7 |
| Confirmation data | `/api/checkout/session` lists the readable names; the 040 metadata (`model`…) is intact, so GA4's `purchase` names are unchanged | — |

Locally the no-photo line has no image because `CHECKOUT_FALLBACK_IMAGE_URL`
points at `mrgoma.vercel.app`, which is also the local `NEXT_PUBLIC_BASE_URL`
— a site host, so refused by design. The pickup tax line, the 040 metadata,
the Blob fallback and "no `adaptive_pricing`" are asserted by the route test
with Stripe mocked.

Not done in the browser: the phone-width view (Chrome's window resize does not
change the viewport here — owner to check on the phone) and a paid test
session (the pay button lives in the Link iframe with the owner's saved test
card; the confirmation's data was read from the session API instead).

## Re-check with the Blob image (2026-11-13, after T4)

Same three tires through the local route, **pickup** at Cutler Bay, with the
local `.env` pointing at the Blob PNG: Stripe received the real photo for the
Pirelli and the Blob PNG for the Bridgestone (no photo) and the new
Mastercraft; all three thumbnails load (via `img.stripecdn.com`); the tax
line is 7% ($26.60 on $380). On desktop Stripe folds a long description to
two lines with a chevron ("… Patched · Sto…"); the full text opens with it.

## Option 1 — firewall rule (documented, **not applied**; D2)

Not needed while tires without a photo use the Blob image. For the day it is:

- Vercel → project → Firewall → **Custom rule** "Stripe can fetch images":
  **If** Request Path *starts with* `/assets/images/` **and** Method *equals*
  `GET` → **Bypass**. Nothing broader.
- Check:
  `curl -s -o /dev/null -w "%{http_code} %{content_type}\n" https://www.mrgomatires.com/assets/images/generic-tire-image.webp`
  — expected `200 image/webp` with the rule; **today `429 text/html`**
  (run 2026-11-13).
- If it still answers 429 with the rule set, the challenge comes from Attack
  Challenge Mode, which a custom Bypass may not exempt.

## The generic image on Vercel Blob (D5) — done 2026-11-13, owner's approval

- PNG made from `public/assets/images/generic-tire-image.webp` with `sips`
  (1000×751, 387 KB), kept out of the repo.
- Public Blob store **`mrgoma-checkout-assets`** (`store_5WuhlM8IyPT5dfxQ`,
  iad1) in the team, **not connected** to the project (no read-write token
  added to the site's env vars). The PNG was uploaded from the dashboard (the
  API returns no upload token): 
  `https://5wuhlm8iypt5dfxq.public.blob.vercel-storage.com/generic-tire.png`
  — answers `200 image/png`, also to a non-browser request.
- `CHECKOUT_FALLBACK_IMAGE_URL` set to that URL for **Production + Preview**
  (plain, with a comment); the local `.env` points to it too (it pointed at
  `mrgoma.vercel.app`, a site host the code now refuses).
- Stripe test session with that image on a no-photo line: the generic tire
  shows (served through `img.stripecdn.com`), with the readable name and
  description. Takes effect in production with the next deploy that includes
  048.
