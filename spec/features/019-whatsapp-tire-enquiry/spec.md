# Spec — Ask about this tire on WhatsApp

> Feature: `019-whatsapp-tire-enquiry` · Status: Planned — ready for `/tasks`
> Created: 2026-08-17 · Clarified: 2026-08-17
> Roadmap: Backlog (detail-page conversion) · Branch: `feat/019-whatsapp-tire-enquiry`

## Why — problem & value

A customer looking at a used tire has questions the page cannot answer. Is this
one still there? Will it fit my car? Can you mount it today at the Hialeah shop?
Those are the questions that decide the sale, and every one of them needs a
person.

Today the detail page offers exactly one way forward: **Add to cart**. For a
buyer who is nearly convinced but not quite, that button is the wrong size of
commitment, and there is nothing smaller beside it. The nearest human contact is
the phone number in the footer or the `/contact` page — both of which mean
leaving the tire behind. Whatever the customer was looking at is gone by the time
they reach someone.

And when they do reach someone, the conversation starts from nothing. The person
answering has no idea which of 15,000+ tires this is about. So the first three
messages are spent re-establishing what the customer was already looking at:
which tire, what size, what price did the site show you. The buyer we serve
"wants to save without taking a risk" — making them re-type what the page
already knew is friction at exactly the moment they were ready to act.

WhatsApp is not a hypothesis here. It is already the primary contact CTA on
`/contact`, it appears in the promo banner, in every location page, in every
service page, and in the AI chat's own escape hatch. **It is where this business
already talks to its customers.** The one place it is missing is the page where
the customer is actually looking at a product.

The mission names *smart assistance* — help that "supports without getting in the
way" — and *trustworthy closing* as two of five experience pillars. A one-tap
route to a human, with the tire already described, serves both without adding a
single step for anyone who does not want it.

### Why the message content matters as much as the button

A WhatsApp link that opens an empty chat is a worse version of the phone number
in the footer. The value is in what is already typed when the chat opens: the
stock number, the tire, its size, its real condition, the price the customer saw,
and a link back to the page.

That last part carries more than it looks. When a WhatsApp message contains a
link, WhatsApp fetches that page and renders a **preview card** — the tire's
photo, its title, its description. The customer sends a message that already
shows the product. The staff member sees the tire before reading a word. Neither
of them has to describe anything.

We already publish everything that card needs. The detail page has emitted
complete Open Graph metadata — title, description, and the tire's real photos —
since `003-detail-server-render`. **The preview is a capability we already paid
for and have never used.**

### What is currently blocking it

We do not get that card today, and would not get it the moment we shipped this
button, because production refuses the request that builds it.

WhatsApp generates link previews with a crawler identifying itself as
`facebookexternalhit`. The Vercel firewall's Bot Protection is set to
`Challenge`, which answers any non-browser client with `429`. Verified against
production on 2026-08-17:

```
curl -A "facebookexternalhit/1.1" https://www.mrgomatires.com/   →  429
```

This is not a new problem that this feature introduces — it is a pre-existing
one that this feature makes visible and finally worth fixing. **Every link to
this site shared on WhatsApp, Facebook or Messenger today arrives as bare text**,
with no image, no title and nothing to distinguish it from a spam URL. For a
business whose differentiator is visual transparency, our links are the least
transparent thing we produce.

The fix is a firewall rule, not code. It is called out here because the feature's
main visible benefit depends on it, and shipping the button without it would
deliver a plain-text message and quietly look like the feature underperformed.

### A duplication we should not add to

The WhatsApp number `14073644016` is currently written by hand **fifteen times
across ten files**: the contact page (three times), guide pages, the guides
config, location pages, service pages, the promo banner config (three times), the
AI chat's system prompt (three times), the chat's composed messages, and the
organization JSON-LD. Adding a sixteenth is how a business ends up with a phone
number that is correct in fifteen places and wrong in the one that matters.

The count rose from twelve during implementation. A `grep` for the digit string
found twelve; the guard test — which strips punctuation before matching — found
three more written as `+1 (407) 364-4016`, including one inside a guide's prose
that no digit search would ever have surfaced. The tool built to prevent the next
copy discovered three existing ones on its first run.

The dashboard cart modal is **not** among them, and is deliberately left alone:
it opens `wa.me` with **no recipient** so a staff member picks the customer to
send to. Pointing it at the business's own line would send every internal order
to ourselves.

This is the same defect we closed for store hours and store addresses in
`018-ai-chat-filters-and-surface`, for the same reason, and the fix is the same
shape: one source of truth, everything else derived. Doing it in this slice keeps
it small — the alternative is a separate cleanup nobody schedules.

## User stories

- As a **shopper looking at a tire I am interested in but not sure about**, I
  want to ask a real person about *this* tire in one tap, so that I can get my
  question answered without losing the page or committing to a purchase.
- As a **shopper who does not know whether this tire fits my car**, I want the
  message to already say which tire I mean, so that I do not have to describe a
  product I do not have the vocabulary for.
- As a **staff member answering WhatsApp**, I want the tire, its condition and
  its price to arrive with the first message, so that I can answer the actual
  question instead of spending three messages identifying the product.
- As a **shopper who receives or forwards that link**, I want to see the tire's
  photo in the chat, so that the message is recognisably about a real product.
- As the **business**, I want to know how many enquiries the detail page
  produces, so that we can tell whether this is worth the space it occupies.

## Scope

- **In:**
  - A WhatsApp action on the tire detail page (`/tires/[slug]`) that opens
    WhatsApp with a pre-filled message about that tire.
  - A composed message carrying the tire's identity, key condition facts, the
    displayed price, and the canonical link back to the detail page.
  - One source of truth for the WhatsApp number, with the existing twelve
    hard-coded copies pointed at it.
  - An analytics event recording that a detail-page WhatsApp enquiry was opened.
  - Written instructions for the firewall rule that lets link-preview crawlers
    through (the change itself is applied by the owner in the Vercel dashboard,
    not by code).

- **Out:**
  - Any change to the Open Graph metadata itself — it is already correct and
    already shipped.
  - WhatsApp on any other page (cart, `/tires` listing cards, checkout). The
    dashboard cart modal already has its own and is untouched.
  - Two-way messaging, WhatsApp Business API, message templates, or any
    integration that receives replies. This is a `wa.me` link.
  - Routing the enquiry to a per-store WhatsApp number, and naming the holding
    store in the message (see *Resolved decisions* — the data is not
    customer-facing).
  - Spanish message copy. The mission puts i18n out of scope; the site is
    English-only.

## Functional requirements

- **FR1:** The tire detail page offers a clearly labelled WhatsApp action
  **directly beneath the primary action**, styled so the purchase path keeps its
  visual weight.

  Amended twice on 2026-08-17. The requirement originally read "outlined, not
  filled", assuming Add to cart was already a filled button. It was not —
  `AddToCartButton` passed `style="primary"`, which `CtaButton` renders as an
  *outlined green* button — so the WhatsApp action took a **neutral slate
  outline** to avoid two equal-weight outlined buttons.

  On seeing it rendered, the owner asked for Add to cart to carry the weight the
  requirement always intended: it is now **filled brand green**
  (`bg-green-600` / `hover:bg-green-700`), reverting to outlined only in its
  disabled "In Cart" state, where `CtaButton`'s forced `!text-gray-500` over a
  half-opacity green fill would fail contrast. The WhatsApp action keeps the
  neutral outline. The hierarchy the requirement asks for now exists in the form
  it originally described.
- **FR2:** Activating it opens WhatsApp — the app where installed, the web
  client otherwise — addressed to the business's WhatsApp number, with a message
  already composed.
- **FR3:** The composed message identifies the tire by its **stock code**
  (`Code`, the value already shown in parentheses in the product name and the
  one staff search by in the dashboard) — not by the internal `TireId` that
  appears in the URL. The code must reach the message as a **first-class field**,
  not by parsing it back out of a display string assembled elsewhere.
- **FR4:** The message states the tire's size, its condition, and the price shown
  on the page at that moment, labelled as the displayed price rather than a
  quote.
- **FR5:** For a used tire, the message states the condition facts a buyer
  actually weighs — remaining life and tread depth — and whether it is patched.
  For a new tire these are omitted rather than printed as blanks or zeroes.
- **FR6:** The message ends with the canonical absolute URL of the tire's detail
  page.
- **FR7:** Any fact the tire record does not carry is omitted from the message
  entirely. **The record's absent-value marker is the string `-`**, not `null` or
  an empty string: `mapTireRecordToSingleTire` writes `'-'` for a missing
  `remainingLife`, `treadDepth`, `dot` or `price`. A message must never contain a
  bare dash, an empty label, or the word `undefined`.
- **FR8:** The message opens with `Hi MrGoma, I'm interested in this tire:` and
  stays short enough to read without scrolling on a phone; long tire names are
  truncated rather than allowed to dominate it.
- **FR9:** The WhatsApp number is defined in exactly one place in the codebase,
  and **all twelve existing hard-coded copies are repointed at it** — the contact
  page, guide pages, location pages, service pages, the promo banner config, the
  AI chat system prompt, the chat's composed messages and the organization
  JSON-LD.
- **FR10:** Opening a detail-page WhatsApp enquiry emits an analytics event that
  is distinguishable from WhatsApp actions elsewhere on the site. The event names
  what is observable — that WhatsApp was **opened** — never that a message was
  sent.
- **FR11:** A tire marked sold **still offers the action**, with a different
  message: it states plainly that this tire is sold and asks whether another in
  the same size is available. The message must not read as interest in buying
  the sold tire.
- **FR12:** The message states no store or location. `VaultName` is internal
  operational naming (see *Resolved decisions*) and is deliberately excluded.

## Acceptance criteria (testable)

- [ ] **AC1:** Given a used tire detail page, when the WhatsApp action is
      activated, then WhatsApp opens with a message containing that tire's stock
      code, brand, size, condition, remaining life, tread depth and displayed
      price.
- [ ] **AC2:** Given a new tire, when the message is composed, then it contains
      no remaining-life and no tread-depth line.
- [ ] **AC3:** Given a tire record whose `remainingLife`, `treadDepth`, `dot` and
      `price` are all the marker string `-`, when the message is composed, then
      those lines are absent and the message contains no bare dash, no empty
      label and no `undefined`.
- [ ] **AC4:** Given any tire, when the message is composed, then its last line
      is the absolute canonical URL of that tire's detail page on the production
      host, and that URL resolves to the same page.
- [ ] **AC5:** Given a tire whose name is longer than the readable limit, when
      the message is composed, then the name is truncated with an ellipsis and
      the total message stays within the readable length.
- [ ] **AC6:** Given the composed message contains characters that are unsafe in
      a URL (`#`, `&`, newlines, `"`), when the WhatsApp link is built, then they
      are encoded and the link opens with the full message intact.
- [ ] **AC7:** Given a tire whose `status` is `sold`, when the detail page
      renders, then the WhatsApp action is present and its message says the tire
      is sold and asks about another in the same size — and contains no phrase
      expressing interest in buying this one.
- [ ] **AC8:** Given the composed message for any tire, then it contains no
      `VaultName` value and no store or warehouse name.
- [ ] **AC9:** Given the codebase, when `14073644016` is searched for as a
      literal string, then it appears in exactly one non-test file.
- [ ] **AC10:** Given the WhatsApp action is activated, then an analytics event
      fires that identifies the detail page as its origin and is distinct from
      the events emitted by the contact page, promo banner, location and service
      pages.
- [ ] **AC11:** Given a keyboard-only user on the detail page, when they tab to
      the WhatsApp action, then it receives a visible focus indicator, activates
      with Enter, and its accessible name says what it does and that it opens an
      external application.
- [ ] **AC12:** Given the detail page on a 360px-wide viewport, when it renders,
      then the primary action — Add to cart, or the "Not available" notice on a
      sold tire — and the WhatsApp action are both fully visible and tappable
      with a target of at least 44x44 CSS pixels, the primary action appears
      first, and neither overflows nor overlaps.
- [x] **AC13:** Given the firewall rule is published, when the production tire
      detail page is requested with a `facebookexternalhit` user agent, then it
      responds `200` with HTML containing the tire's `og:image`.
      _Verified 2026-08-17 against `/tires/471004-bridgestone-235-50-20`: `200`,
      four `og:image` tags, image reachable (JPEG, 379 KB). `curl` with no
      special agent still gets `429`, so the bypass is correctly scoped._
- [ ] **AC14:** Given the firewall rule is published, when a composed message is
      sent in WhatsApp, then the chat renders a preview card showing the tire's
      photo and title. _(Manual - no automated check can observe WhatsApp's
      renderer.)_
- [ ] **AC15:** Given the detail page after this change, when Core Web Vitals are
      measured, then LCP, INP and CLS stay within the budget defined in
      `009-perf-budget`.
- [ ] **AC16:** Given the twelve repointed occurrences, when the full test suite
      runs, then the `018` guard tests for the AI chat prompt and composed
      messages still pass.

## Non-functional / constraints

- **Mobile-first.** The detail page is predominantly mobile traffic, and this
  action is most valuable there — on a phone, `wa.me` opens the installed app
  directly. It must not push Add to cart below the fold on a small screen.
- **Accessibility — WCAG 2.1 AA.** Visible focus, a meaningful accessible name
  (not "click here"), and a target size of at least 44×44 px. The action opens an
  external application, which must be conveyed to assistive technology rather
  than left as a surprise.
- **No client-side cost.** The detail page is a Server Component by design
  (`003-detail-server-render`); the LCP image ships in the initial HTML. This
  action is a link with a pre-computed `href` and must not introduce a client
  island, a hydration boundary, or any runtime message-building.
- **Honest analytics.** Per the tech stack, the event names what happened. We can
  observe that WhatsApp was *opened*, not that a message was *sent* — the event
  name must not claim the latter. This is the same distinction that retired
  `place_order` and `quote_submit` on 2026-08-04.
- **Truthfulness.** The price in the message is the price the page displayed at
  that moment, and is labelled as such. It is not a quote and must not read like
  one.
- **English only**, US voice, concise — written for a small screen.
- **Privacy.** The message is composed on the customer's device and sent by them.
  We attach no identifier, no session token and no tracking parameter to the URL
  in the message.

## Resolved decisions

_All resolved on 2026-08-17 during `/clarify`._

- **Prominence — secondary, beneath Add to cart.** The purchase path keeps its
  weight; the enquiry is outlined rather than filled. A sticky mobile bar was
  considered and rejected: it occludes content and reintroduces the layout-shift
  risk `008-structural-cls` was built to remove.

- **Sold tires — the action stays, the message changes.** Today a sold tire
  shows "Not available" and the customer leaves with nothing. A sold tire is the
  best moment to ask "do you have another 225/45R17?", so the action remains with
  wording that states the tire is gone rather than expressing interest in it.

- **Stock code, not tire id.** `Code` is what staff search by — the dashboard's
  cart uses it and the product name already displays it in parentheses. `TireId`
  exists only in the URL. Resolved from the code, not asked.

- **The absent-value marker is `-`.** `mapTireRecordToSingleTire` writes the
  string `'-'` — never `null` or `''` — for a missing `remainingLife`,
  `treadDepth`, `dot` or `price`, and always writes `'Yes'` or `'No'` for
  `patched`. Any omission logic that tests for falsiness will print `Tread: -`.
  Resolved from the code, not asked.

- **One central number; no store line.** Enquiries go to `14073644016`, which is
  the business's WhatsApp line and not any store's — all seven stores have their
  own landlines and none is confirmed as a WhatsApp.

  Naming the holding store was proposed and **withdrawn once the data was
  inspected**. `VaultName` is available on the record (`fetchTireById` does
  `SELECT *`) and is already publicly filterable via `?stores=`, so it looked
  viable. But its actual values are internal operational naming, not the seven
  public stores: `Warehouse`, `Semoran`, `Pembroke WH`, `Orlando`, `Hialeah`,
  `Cutler bay`, `Coral Gables`, `Clifton`, `441`, `27th Ave`. Only three match a
  `/locations` page, one differs in casing, and the rest are warehouses, streets
  and highway numbers. `Location: Warehouse` tells a customer their tire is in a
  depot; `Location: 441` tells them nothing.

  This also settles the tension with `012-public-api-hardening`, which listed
  `VaultName` among the internal columns that must never reach the browser. The
  concern there was never the name of a public shop — those have seven public
  pages — but the internal operational structure, which is exactly what these
  values expose. **A follow-up would need a `VaultName` -> public-store mapping
  that only the owner can confirm.** Out of scope here.

- **Greeting — `Hi MrGoma, I'm interested in this tire:`.** Mirrors the FME
  pattern already in production, and matches the mission's "plain and honest,
  confident, not pushy".

- **The number cleanup ships in this slice.** All twelve copies are repointed at
  the single source. Two of them — the AI chat system prompt and its composed
  messages — carry guard tests from `018`, so the riskiest edits are the ones
  already covered by automated checks (AC16).

- **The firewall rule is published before implementation completes.** The owner
  applies it in the Vercel dashboard; the MCP integration has no access to the
  production team and does not expose Firewall configuration in any case. This
  keeps AC13 and AC14 genuinely verifiable rather than deferred, and the rule
  delivers value on its own — it restores link previews across the whole site,
  which have been broken for every channel, not just this feature.

## Open questions

_None. Ready for `/plan`._

---

_The WHAT and WHY only. The HOW lives in [plan.md](./plan.md)._
