# Tasks — Ask about this tire on WhatsApp

> Feature: `019-whatsapp-tire-enquiry` · Based on: [plan.md](./plan.md) · Created: 2026-08-17
> Revised: 2026-08-17 after `/analyze` (six fixes applied)

Ordered, **very small, independently verifiable** tasks. Baseline before starting:
**550 tests in 68 files, green.** After: **592 in 73 files.**

T14 and T15 are manual and remain open — see [results.md](./results.md).

Ordering rule: the guard test (T4) fails until every copy is repointed, so it
lands *after* T2–T3. Everything before it leaves the suite green.

---

## A. One home for the number

- [x] **T1** — Create the source of truth: `WHATSAPP_NUMBER` (digits),
      `WHATSAPP_TEL` (`+1…`, for JSON-LD) and `whatsAppLink(message?)`.
      **No imports** in the module — it is pulled into both the browser bundle
      and route handlers, the same constraint `analyticsEvents.ts` documents.
      · files: `src/app/utils/whatsapp.ts` (new),
      `src/app/utils/whatsapp.test.ts` (new)
      · check: `npm test` — `whatsAppLink()` with no message returns the bare
      `wa.me` URL; with a message the `text` param round-trips through
      `decodeURIComponent`; a message containing `#`, `&`, `"` and a newline
      survives intact.

- [x] **T2** — Repoint the five plain call sites (nine occurrences). Each is a
      literal `wa.me` href that becomes `whatsAppLink(...)`; **no copy changes**.
      · files: `src/app/(shop)/contact/container/Contact/Contact.tsx` (2),
      `src/app/(shop)/guides/[slug]/page.tsx` (1),
      `src/app/(shop)/locations/[location]/container/LocationDetail/LocationDetail.tsx` (1),
      `src/app/(shop)/services/[service]/container/ServiceDetail/ServiceDetail.tsx` (1),
      `src/app/ui/sections/PromoBanner/config/promoBanner.ts` (3)
      · **Do not touch `DashboardCartModal`.** It builds `wa.me/?text=` with **no
      recipient**, deliberately, so a staff member picks the customer. Giving it
      the business's own number would send every internal order to ourselves.
      · check: `npm test` still green; `/contact`, a guide, a location and a
      service page still open the same chat.

- [x] **T3** — Repoint the three risky call sites (three occurrences). The AI
      chat system prompt is a **template literal**, where a bad substitution
      type-checks and fails silently in production — read the rendered prompt, do
      not just run it.
      · files: `src/app/api/tires/ai-chat/route.ts` (2 occurrences in the
      prompt), `src/app/api/_lib/aiChat/messages.ts` (its local
      `WHATSAPP_NUMBER` becomes an import), `src/app/utils/seo.ts`
      (`telephone: WHATSAPP_TEL`)
      · check: `npm test` — the `018` guard tests (`prompt.guard.test.ts`,
      `messages.test.ts`) and `seo.test.ts` stay green **without being edited to
      accommodate the change**. If one needs editing, the substitution is wrong.

- [x] **T4** — Add the guard that stops a thirteenth copy appearing. Model it on
      `storeData.guard.test.ts`: walk `src/`, match the number in any
      punctuation, exempt `whatsapp.ts` and test files.
      · files: `src/app/utils/whatsapp.guard.test.ts` (new)
      · check: `npm test` — passes now; and **verify it actually bites** by
      temporarily pasting the literal into another file and watching it fail.

- [x] **T5** — Point the two tests that assert the number at the constant instead
      of a literal, so they cannot drift from the source they are meant to guard.
      · files: `src/app/utils/seo.test.ts`,
      `src/app/api/_lib/aiChat/messages.test.ts`
      · check: `npm test` green.

## B. The shared icon

- [x] **T6** — Extract the WhatsApp glyph, which is currently written out
      verbatim in two files while `src/app/ui/icons/` has none, and repoint both.
      Keep the existing `className` prop shape so neither caller changes visually.
      · files: `src/app/ui/icons/WhatsAppIcon.tsx` (new),
      `src/app/ui/icons/WhatsAppIcon.test.tsx` (new),
      `src/app/(shop)/contact/container/Contact/Contact.tsx`,
      `src/app/ui/sections/DashboardCartModal/DashboardCartModal.tsx`
      · check: `npm test` — the icon renders an `<svg>`, forwards `className`,
      and is `aria-hidden`. Manual: `/contact` and the dashboard cart modal show
      the same icon at the same size as before.

## C. The message

- [x] **T7** — Give `SingleTire` a `code` field. **The stock code does not
      currently reach the UI at all** — the mapper folds `record.Code` into the
      display name (`(A4821) | BRIDGESTONE | 235/50/20`) and nothing else carries
      it, so FR3 is unimplementable without this. Parsing it back out of `name`
      was rejected: it would couple the message to a string format assembled in
      another module.
      · files: `src/app/interfaces/tires.d.ts`,
      `src/repositories/mapTireRecordToSingleTire.ts`,
      `src/repositories/mapTireRecordToSingleTire.test.ts`
      · check: `npm test` — the mapper sets `code` from `record.Code` and omits
      it when the column is empty. Note this widens the public `/api/tire`
      payload; that is safe because `012-public-api-hardening` already whitelists
      `Code` on `/api/tires`.

- [x] **T8** — Write the message builder. The whole feature's behaviour lives
      here and it is a pure function: `SingleTire` in, string out.
      Include the `present()` helper that treats the record's `'-'` marker as
      absence — **not** a falsiness check, which is true for a missing value and
      would print `Tread: -` to a customer.
      · files: `src/app/utils/tireEnquiry.ts` (new)
      · check: compiles; covered by T9.

- [x] **T9** — Test the builder. This is where most acceptance criteria are
      actually proven.
      · files: `src/app/utils/tireEnquiry.test.ts` (new)
      · check: `npm test` — used tire carries code/brand/size/condition/life/
      tread/price (AC1); new tire has no life or tread line (AC2); a fixture with
      `remainingLife`/`treadDepth`/`dot`/`price` all `'-'` produces no bare dash,
      no empty label, no `undefined` (AC3); last line is the absolute canonical
      URL (AC4); a 200-character name truncates with an ellipsis (AC5); a sold
      fixture says the tire is sold and **does not** contain "interested in this
      tire" (AC7); no message contains any `locationsConfig` store name nor
      `Warehouse`/`441`/`27th Ave` (AC8).

## D. The button

- [x] **T10** — Build the button as a **Server Component** — no `'use client'`,
      no hydration boundary. A plain `<a>` with `target="_blank"`,
      `rel="noopener noreferrer"`, a neutral slate outline (see T13), a 44px
      minimum target, `focus-visible` ring, and an accessible name that says it
      opens WhatsApp. Tracking is declarative:
      `data-track="open_whatsapp"`, `data-track-category="product_enquiry"`,
      `data-track-surface="tire_detail"` — **no new event name**.
      · files: `src/app/ui/components/WhatsAppEnquiryButton/WhatsAppEnquiryButton.tsx` (new)
      · check: covered by T11.

- [x] **T11** — Test the button: the three `data-track-*` attributes are present
      (AC10), the accessible name states the action and the external target
      (AC11), and the `href` decodes back to the built message (AC6 end-to-end).
      · files: `src/app/ui/components/WhatsAppEnquiryButton/WhatsAppEnquiryButton.test.tsx` (new)
      · check: `npm test`.

- [x] **T12** — Render it in the detail page beneath the price/cart row, in
      **both** branches: below `AddToCartButton` when available, and below the
      "Not available" notice when sold. The primary action stays first in DOM
      order.
      · files: `src/app/ui/sections/TireInformation/TireInformation.tsx`
      · check: manual — `npm run dev`, open a used tire, a new tire and a sold
      tire; confirm the button appears in all three and the message differs on
      the sold one.

## E. Consistency and verification

- [x] **T13** — Amend **FR1 in `spec.md`**. It states Add to cart is filled and
      WhatsApp outlined; `AddToCartButton` actually passes `style="primary"`,
      which `CtaButton` renders as *outlined green*. Two outlined buttons would
      erase the hierarchy FR1 asks for, so the WhatsApp button takes a neutral
      slate outline. Correct the requirement rather than leaving the artifacts
      contradicting each other.
      · files: `spec/features/019-whatsapp-tire-enquiry/spec.md`
      · check: FR1 describes what is built; no spec↔plan conflict remains.

- [ ] **T14** — Manual accessibility and responsive check.
      · check: keyboard-only — Tab reaches the button, focus ring visible, Enter
      opens WhatsApp (AC11); DevTools at **360px** on an available tire **and a
      sold one** — the primary action and the button are both fully visible,
      ≥44×44px, no overflow, no overlap, primary first (AC12); a screen reader
      announces the external target.

- [ ] **T15** — Manual WhatsApp preview check (AC14). **This does not require the
      button to be deployed**: the card is generated from the tire detail URL,
      which already exists in production. Paste one into a WhatsApp chat with
      yourself. Use a tire URL **not shared before** — WhatsApp caches previews by
      URL, so anything fetched before the firewall rule was published may still
      render card-less. Force a re-scrape with Facebook's Sharing Debugger if
      needed.
      · check: the chat renders a card with the tire's photo and title.

- [x] **T-DoD** — Definition of Done: `npx tsc --noEmit` + `npm run lint` +
      `npm test` + `npm run build` + `npm run perf:budget` all green. Test count
      up from the 550 baseline. Manual check on a detail route, on mobile.
      Leave changes **staged, not committed**, until the owner confirms.

---

## Traceability

| Task | Acceptance criteria |
| ---- | ------------------- |
| T1   | AC6 (encoding) |
| T2   | AC9 |
| T3   | AC9, AC16 |
| T4   | AC9 |
| T5   | AC16 |
| T6   | — (reuse; no AC) |
| T7   | AC1 (prerequisite) |
| T8   | AC1–AC5, AC7, AC8 |
| T9   | AC1, AC2, AC3, AC4, AC5, AC7, AC8 |
| T10  | AC10, AC11, AC12 |
| T11  | AC6, AC10, AC11 |
| T12  | AC7, AC12 |
| T13  | — (artifact consistency) |
| T14  | AC11, AC12 |
| T15  | AC14 |
| T-DoD | AC15, AC16 |

**AC13** (firewall → `200` with `og:image`) was verified on 2026-08-17, before
implementation began, and needs no task.

Every criterion AC1–AC16 is covered.

---

_Implementation runs via `/implement`._
