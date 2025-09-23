This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started Mr goma Tires V1  

First, run the development server: 

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Environment configuration

Before running the application you must provide a `.env` file with the database
connection details. Use `.env.template` as a starting point:

```bash
cp .env.template .env
```

Fill in the values for `SERVER_URL`, `DB_NAME`, `DB_USER` and `DB_PASSWORD`.
These variables are **only** consumed by the server and therefore **must not**
be prefixed with `NEXT_PUBLIC_`. In Next.js, any variable that begins with this
prefix is exposed to the browser. By omitting it we keep the credentials
private. If in the future you need a variable to be readable on the client you
can declare it again with the `NEXT_PUBLIC_` prefix, but sensitive values should
remain server-only.

This project uses the [winston](https://github.com/winstonjs/winston) library fo
r logging. You can adjust the log verbosity by setting `LOG_LEVEL` (defaults to
`info`).

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Payments (Stripe)

This project supports Stripe Checkout to process payments from the Checkout page.

1) Configure environment variables (use `.env.template` as reference):

- STRIPE_SECRET_KEY=sk_live_... (or test key sk_test_...)
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... (optional for future client SDK usage)
- NEXT_PUBLIC_STRIPE_CURRENCY=usd (e.g. usd, cop, eur)
- NEXT_PUBLIC_TAX_RATE=0 (UI only, set to a decimal like 0.19 for 19%)
- NEXT_PUBLIC_BASE_URL=http://localhost:3000 (or your deployed domain)

2) How it works
- When a user clicks "Proceed to payment" on /checkout, the app posts the cart items (id, quantity) to `/api/checkout/create-session`.
- The server re-validates each product by ID using the internal `/api/tire?productId=<id>` endpoint to ensure availability and obtain pricing.
- If all items are valid, the server creates a Stripe Checkout Session and returns a `url`. The client then redirects to that URL.
- If any item is unavailable, the server responds with 409 and the UI shows a clear error message.
- If Stripe is not configured, the server responds with 501 and the UI informs the user.

3) Local testing
- Without Stripe keys, clicking the button will show a configuration error (501) — this is expected.
- With valid test keys, you should be redirected to Stripe's hosted checkout page.

Notes
- The Stripe SDK is dynamically imported on the server route and guarded so development builds will not fail if the library is not installed; however, to process real payments you must install it: `npm i stripe`.
- Amounts are sent in the smallest currency unit (e.g., cents) using authoritative server pricing.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.


## Temporary WhatsApp Orders (Stripe disabled)

While Stripe is being configured, you can route checkout orders to WhatsApp.

Environment switches:
- ENABLE_STRIPE_CHECKOUT (server-only): set to `true` to use Stripe. Any other value will use WhatsApp.
- NEXT_PUBLIC_ENABLE_STRIPE (client): mirror of the server flag to adjust the CTA label in the UI.
- WHATSAPP_NUMBER and NEXT_PUBLIC_WHATSAPP_NUMBER: recipient number in international format without `+` (e.g. 573222202887). Defaults to 573222202887 if not set.

How it works:
- The Checkout page posts the cart items to `/api/checkout/create-session`.
- The server revalidates each item by ID via `/api/tire?productId=<id>`.
- If any item is unavailable, the server responds with 409 and the UI shows the error.
- If Stripe is disabled (ENABLE_STRIPE_CHECKOUT != 'true'), the server returns `{ whatsappUrl }` (a wa.me link) with a prefilled message including:
  - Each item name, ID, quantity, and line total
  - Subtotal, taxes (based on NEXT_PUBLIC_TAX_RATE), and total
  - A short note requesting confirmation
- The client redirects the user to WhatsApp (web or app) using that link.

To enable Stripe later:
1) Set `ENABLE_STRIPE_CHECKOUT=true` and `NEXT_PUBLIC_ENABLE_STRIPE=true`.
2) Provide `STRIPE_SECRET_KEY` and optional `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
3) Optionally set `NEXT_PUBLIC_STRIPE_CURRENCY`.
4) Restart the app. The CTA will read “Proceed to payment”, and the server will create a Stripe Checkout Session as documented above.


## About NEXT_PUBLIC_ environment variables

In Next.js, variables prefixed with NEXT_PUBLIC_ are exposed to the browser at build/runtime and are appropriate for non‑sensitive, UI-related configuration. Keep the following as NEXT_PUBLIC_ because they either drive client UI, links, or harmless display values:
- NEXT_PUBLIC_TAX_RATE: used on the client to show estimated taxes.
- NEXT_PUBLIC_STRIPE_CURRENCY: informs price formatting/Stripe currency.
- NEXT_PUBLIC_ENABLE_STRIPE: toggles the CTA label on the client.
- NEXT_PUBLIC_BASE_URL: can be used by client code for absolute links.
- NEXT_PUBLIC_WHATSAPP_NUMBER: allows client code to form wa.me links when needed.

Server-only variables must NOT be prefixed with NEXT_PUBLIC_ (they stay private):
- STRIPE_SECRET_KEY
- Database credentials (SERVER_URL, DB_NAME, DB_USER, DB_PASSWORD)
- ENABLE_STRIPE_CHECKOUT (server switch; the client uses NEXT_PUBLIC_ENABLE_STRIPE to mirror label changes)

If you ever need the same value on both server and client, declare it twice: once without NEXT_PUBLIC_ for server-only logic, and once with NEXT_PUBLIC_ for client consumption (ensuring it is not sensitive).


## Post‑payment confirmation (Checkout)

After Stripe redirects back to `/checkout?success=1&session_id=...`, the app now fetches and shows a detailed order confirmation:

- Copyable reference (the `session_id` parameter from Stripe)
- Payment status
- Total amount and currency
- Itemized list (name, quantity, line totals)
- Customer email (if available)
- Date/time of the checkout session
- A "View receipt" link to Stripe, when available (depends on Stripe providing `receipt_url` on the latest charge)

How it works under the hood:
- Client calls `GET /api/checkout/session?session_id=<id>`
- Server retrieves the Checkout Session, lists line items (with expanded product info), and the PaymentIntent’s latest charge to obtain `receipt_url`.
- The endpoint returns a sanitized JSON with only user‑relevant fields used by the UI.

WhatsApp flow
- When Stripe is disabled or the WhatsApp route is selected, the page shows a distinct confirmation (no Stripe details are requested). The cart is cleared and the user is prompted to continue shopping.


## Google Analytics (GA4)

This project includes a Google Analytics 4 integration with consent-controlled loading:
- GA scripts are loaded only after the user accepts cookies in the consent banner.
- Page views are sent on initial load and on every SPA route change in the App Router (after consent).

Setup
1) Add your GA4 Measurement ID to `.env`:

```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

2) Restart the dev server/build.

How tracking is activated
- On first visit, the cookie banner appears at the bottom. GA will not load yet.
- When the user clicks “Accept”, the app:
  - Stores `cookiesAccepted=true` in localStorage and as a cookie (1 year).
  - Dispatches a `cookies:accepted` browser event.
  - Immediately loads GA and starts sending page views.
- If the user clicks “Decline”, GA remains disabled. The banner will reappear after a short period.

Testing tips
- Clear the value and refresh:
  - localStorage: remove the key `cookiesAccepted`
  - Cookie: delete `cookiesAccepted`
- You can simulate consent in dev tools by running:
  - `localStorage.setItem('cookiesAccepted','true'); window.dispatchEvent(new Event('cookies:accepted'));`

Notes
- Existing Vercel Analytics remains enabled; it can be used alongside GA.
- If you prefer to always load GA regardless of consent (not recommended), render the GoogleAnalytics component unconditionally and remove the consent checks.
