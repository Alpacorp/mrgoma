# Results — 029-site-review

> Recorded: 2026-08-24 · A full pass over the running site, and everything it found

## What was checked

The site was navigated in a real browser — home, catalogue, a tire, the cart, the
checkout, locations — alongside a crawl of 20 routes and every internal link, plus
console, network and server logs.

| Check | Result |
| --- | --- |
| 20 routes: status, headings, metadata | **exactly one `<h1>` each**, titles ≤60, descriptions in range |
| internal links | **268 checked, 0 broken** |
| `noindex` | only `/checkout` and the 404 |
| images without `alt` · buttons without a name · unlabelled fields | **0 · 0 · 0** |
| canonicals on filtered views | as designed in `020` |
| JSON-LD after client-side navigation | 4 nodes, all parse |
| filters | 4.157 → 148 on brand + rim |

## Defects found and fixed

**1. A hydration error on every product page — the important one.**
`CartContext` read `localStorage` inside the `useState` initialiser, guarded by
`typeof window !== 'undefined'` — the first cause React's own hydration message
lists. The server rendered "Add to Cart" and the client's first render said "In
Cart", so anyone with a cart got a console error and a flash of the wrong label
while React threw the tree away and rebuilt it.

Now read in an effect after mount. **The fix has a trap**: the effect that saves
the cart must not run before the one that loads it, or the first render's empty
array is written over a real cart and the customer loses it. A `loadedFromStorage`
flag holds that order, and a test asserts the cart survives mounting.

The initialiser also had no `try/catch` — a corrupt payload took the page down.
It now starts empty instead.

**2. A shipping promise the checkout contradicts.** The tire page offered
"Canada, Hawaii, Puerto Rico, request a quote" while checkout refuses Alaska,
Hawaii and Puerto Rico outright. A buyer in Hawaii read an invitation and hit a
wall at payment.

**3. `After sales suport`** — a typo in copy under every tire.

**4. Two more claims retyped instead of reused.** That same file said "up to 30
days warranty" — diverging from the site's `30-Day Warranty` *and* weakening it
with an "up to" nothing else claims — and "Free US shipping" against the canonical
"Free shipping nationwide". Both now come from `brandClaims`.

**5. `Product.name` in the JSON-LD was `(594712) | Nitto | 275/45/20`** — a stock
code leading a pipe-delimited row, model missing, and a string Google may print in
a rich result. Now `Nitto NT 420 V XL 275/45/20`.

**6. The cart thumbnail's `alt`** was the same raw identity, with the brand
shouted.

**7. The checkout showed two identifiers per line** — an `ID` column with the
internal TireId beside the stock code under the product name. The column is gone;
the stock code stays, because that is what staff search by.

**8. The screen reader said the identity, not the name.** The cart button
announced "In Cart, (594712) | Nitto | 275/45/20"; it now says
"In Cart, Nitto NT 420 V XL 275/45/20".

**9. Ten rows per page** put the catalogue at 416 pages. Now 20 — already one of
`VALID_PAGE_SIZES`, and the row count is not what a visitor waits for: a listing
query measures ~100 ms on the server against 225 ms of network latency.

**10. Phone numbers read `(305)-278-4632`**, with a hyphen after the parenthesis.
Now `(305) 278-4632`. Safe to change: the dialable E.164 lives in a separate `tel`
field, and it also feeds `telephone` in each store's JSON-LD.

**11. The logo's `alt` was dead.** Five components gave the image `alt`, `title`
**and** `aria-label` with different text — and `aria-label` wins, so
"MrGoma Tires logo" was never announced. The `aria-label` is gone.

## Three false alarms, discarded rather than reported

**The other hydration errors are a browser extension of mine.** The diff showed
`data-yd-metadata-content-site`, `data-wxt-integrated` and a
`youtube-dubbing-button` div — injected markup, which React's message explicitly
allows for. Only the *text* mismatch was ours, and its tree pointed at
`AddToCartButton → CtaButton text="In Cart"`.

**A blank product image in a screenshot.** The element was `complete: true` at
500×375 — a capture-timing artefact, not a missing image.

**My own accessibility check was wrong.** A regex pass reported 19 unnamed buttons
and 5 unlabelled fields; the browser's accessibility tree showed **zero of both**.
The regex looked inside the button for `aria-label` instead of at the opening tag.
The tree is the authority and was used instead.

## Not verified

**Mobile.** The resize tool reported success three times and the viewport never
changed, so the site was only seen at 1512px. The hero heading now carries the
size and is longer than before — that wrap is the thing to look at on a phone.

## Left alone, deliberately

- **Two near-identical cards for one tire**, where the **$100** unit has *better*
  life, tread and no patch against the **$155** one. That is block 5 visible on
  screen, and it is blocked on the owner's answers.
- **Two queries over 2 s** during the session. The catalogue analysis already
  established the database is not the bottleneck — 54–100 ms server-side against
  225 ms of network — so there is nothing here to fix without the indexing work
  that was deliberately deferred.
- **Filtered views keep the generic `<h1>`** when the filter is a brand or a rim
  size. Those URLs canonicalise to `/tires`, so it costs nothing today.

## Definition of Done

| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | ✅ |
| `npm run lint` | ✅ |
| `npm test` | ✅ **1.236 passed** (baseline 1.232, +4) in 95 files |
| `npm run build` | ✅ |
| `npm run perf:budget` | ✅ 620.4 KB / 680 |

Verified in the browser afterwards, with a cart seeded in `localStorage` on a
product page — the exact condition that produced the error before:

```
console errors                0
button                        In Cart
cart after mount              intact, 1 item
screen reader                 In Cart, Nitto NT 420 V XL 275/45/20
JSON-LD Product.name          Nitto NT 420 V XL 275/45/20
benefits heading              After-sales support
/api/tires default page size  20
```

The hydration guard was verified red against the old initialiser.
