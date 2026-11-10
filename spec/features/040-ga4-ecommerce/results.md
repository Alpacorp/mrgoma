# Results — GA4 ecommerce measurement

> Feature: `040-ga4-ecommerce` · Local verification: 2026-11-10 · Deploy date:
> **_pending — fill in on release_** (this is the date the `begin_checkout` and
> `add_shipping_info` anchors changed)

## Local end-to-end (T16)

Setup: `next dev` on `localhost:3000`, `.env` with Stripe **test** keys and
`CHECKOUT_TEST_MODE=true` (no DB writes, no server-side Vercel `purchase`),
Chrome, cookies accepted via the banner. Payloads read from `window.dataLayer`
(persisted to `sessionStorage` across the Stripe round-trip) and from the
`google-analytics.com/g/collect` requests.

| AC    | Scenario                                                              | Observed                                                                                                                                                       | ✓ |
| ----- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | - |
| AC2   | Add from catalog card (List view, desktop button)                      | `add_to_cart` · `USD` · 280 · item `476551` "Used Pirelli P Zero TM PZ4 M0-S PNCS XL 285/30/21", brand Pirelli, category Used, variant 285/30/21, `debug_mode` | ✓ |
| AC1/2b | Full load of a detail page (landing)                                 | One `view_item` · 175 · item `432917` "New Arroyo Tamarock AT XL 245/75/17"; queued until `ga:ready`, sent **after** `config`; hit carries `pr1=…` and `cu=USD` | ✓ |
| AC2   | Add from the detail page                                              | `add_to_cart` · 175 · same item (previously untracked)                                                                                                        | ✓ |
| AC4   | Typed `/checkout` with 5 items                                         | One `begin_checkout` · 990 (= 155+180+200+280+175) · 5 items                                                                                                    | ✓ |
| AC6   | Proceed with 3 sold tires in the cart (real 409)                       | Error shown; **no** `add_shipping_info`, **no** `add_payment_info`                                                                                               | ✓ |
| AC5/7 | Pickup, 2 items, server accepts                                        | `add_shipping_info` (`shipping_tier: pickup`, 330) → `add_payment_info` (`payment_type: card`, 330) → redirect to Stripe sandbox                              | ✓ |
| AC8   | Pay in Stripe sandbox (test card 4242, **paid in COP** via adaptive pricing) | `purchase` · `transaction_id` = Stripe session id · `value` 353.10 · `tax` 23.10 · `shipping` 0 · `currency` **USD** · 2 items, no tax item               | ✓ |
| AC9   | Reload the confirmation page                                           | No second `purchase` (`ga-purchase:<id>` guard present)                                                                                                         | ✓ |
| AC5/8 | Delivery to FL, 1 item, Stripe automatic tax                           | `add_shipping_info` (`delivery`) → `add_payment_info` → `purchase` · 186.38 · `tax` 11.38 · item price **175** (pre-tax) · category New                        | ✓ |
| AC10  | Withdraw consent (Cookie Preferences), reload detail, add to cart      | No gtag script, no `_ga` cookies, no request to Google; Vercel logs `[event] view_item` and `[event] add_to_cart`                                              | ✓ |
| AC11  | All payloads above                                                     | Only the listed fields; no name, email, phone or address                                                                                                        | ✓ |

### Defects found by the end-to-end run and fixed before closing

1. **`purchase` items had no condition.** The Stripe `condition` metadata holds
   the *stock status* (`data.status`), not New/Used, so `item_category` was
   missing and `item_name` lacked "Used"/"New" — splitting one product into two
   names across the funnel. Fixed with a separate `tireCondition` metadata key
   (the confirmation page keeps using `condition` as before).
2. **Item price included tax on delivery orders.** With automatic tax, Stripe
   adds the tax into each line's `amount_total`. The item price now comes from
   `amount_subtotal` (pre-tax); tax is reported once, at order level.

Both have unit tests (`ecommerce.test.ts`, `session/route.test.ts`). The
delivery run above already shows fix 1; fix 2 was confirmed against the same
real session (`amount_subtotal` 17500 → price 175).

### Verified in GA4 (2026-11-10, Realtime)

- **All six events arrived**: `view_item`, `add_to_cart` (3), `begin_checkout`
  (3), `add_shipping_info`, `add_payment_info`, `purchase` (2). The `503`
  answers seen on the local `collect` requests did not stop delivery.
- `purchase` is **already a key event** (Realtime → Key events: `purchase` 2),
  and GA4 built its automatic "Purchasers" audience.
- Property currency: **US dollar**. Reporting time zone: New York.

### ⚠ D5 did not hold as written — fixed on 2026-11-10

The spec assumed `debug_mode` keeps test traffic out of the standard reports.
In GA4 that exclusion is done by a **"Developer traffic" data filter**, and this
property has none (only "Internal Traffic", in _Testing_). So the two local test
purchases (**$353.10 and $186.38, 2026-11-10**) will show in Monetization as
real sales. Data filters are not retroactive: creating the filter protects
future tests, not these two. **Fixed:** an active "Developer Traffic" filter
(Exclude) now drops every event carrying `debug_mode`; the two test purchases
are listed in `consultant-note.md` for manual exclusion (`cs_test_…` ids).

- Pre-existing, not changed here: the first page of each visit sends two
  `config` calls (`ga-init` + the `GoogleAnalytics` effect). gtag collapsed
  them into one `page_view` in this run, but it is worth a follow-up.

## Production (T18) — after deploy

- [ ] Deploy date recorded at the top of this file.
- [x] GA4 property currency confirmed USD (2026-11-10).
- [x] `purchase` marked as key event (already was, 2026-11-10).
- [x] "Developer Traffic" data filter created and **Active** (2026-11-10,
      Exclude, with user approval). Pending: confirm on the next local test that
      events show in DebugView and not in reports.
- [x] Vercel env var `NEXT_PUBLIC_GA_DEBUG=true` created for **Preview only**
      (2026-11-10, with user approval). Preview deployments are production
      builds, so without it a test purchase on a preview would count as a real
      sale. Takes effect on the next preview build. Never set it for Production.
      Also set (by the user, type _Config_, Preview + Development) on the
      personal Hobby project `mrgoma`. Both kept on purpose.
- [ ] First real sale visible in Monetization → Ecommerce purchases and Traffic
      acquisition (within 48 h).
- [ ] After ~28 days: GA4 `purchase` count vs Vercel server `purchase` count,
      and the ratio.
