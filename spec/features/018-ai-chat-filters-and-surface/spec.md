# Spec — Let the assistant search on what the customer actually said

> Feature: `018-ai-chat-filters-and-surface` · Status: Clarified — ready for
> `/plan` · Created: 2026-08-06 · Clarified: 2026-08-06
> Roadmap: Backlog (AI chat improvements) · Branch: `feat/018-ai-chat-filters-and-surface`

## Why — problem & value

Ask the assistant for Michelin tires and it will not show you any. It asks for
your tire size first, and until you give it one, nothing happens.

That is not a limitation of what it can do. The assistant can already search by
brand, by rim diameter, by condition, by price and by tread life — every one of
those filters is available to it today. What stops it is its own script, which
tells it to collect a size before searching. So it declines to do something it is
perfectly able to do, and the customer has to answer a question they may not be
able to answer: plenty of people know they want Michelin, or that they need a
17-inch rim, long before they know the full `225/45R17`.

The site itself is already past this. The home page offers brand, condition and
price filters, and `/tires` has the full set. **A customer can filter by brand in
two clicks on the page, but not by asking for it in the assistant** — the feature
built to reduce friction is the one place with more of it.

The mission names smart assistance as one of five experience pillars, and defines
it as help that "supports without getting in the way". A blocking question is
getting in the way.

The clearest evidence that this is a defect rather than a design choice is that
**the chat already advertises the behaviour it refuses to perform.** Of the seven
example prompts it offers a new visitor, three are partial filters — `Pirelli`,
`usadas menos de $50` and `used tires under $80`. Tap the one the interface
itself suggested and the assistant asks for your tire size.

There is a second gap, smaller but sharper. Nobody sorts a used-tire list by
accident: the buyer we serve "wants to save without taking a risk", and *cheapest
first* is the most natural thing they could ask for. The catalogue supports
ordering. The assistant has no way to express it, so the request quietly fails.

### And we cannot tell whether any of it works

The third problem is that we would not be able to measure the first two.

The public assistant and the internal dashboard assistant are the same component
with the same instrumentation. They emit identical events, with no property
saying which one fired. Every search a member of staff runs from `/dashboard`
lands in the same counters as a customer's. The numbers we would use to judge
this change describe customers and employees mixed together, and there is no way
to separate them after the fact from the event alone.

Worse, **no event marks the moment a search actually happens.** We record that
someone opened the chat and that they typed, but not that the conversation
produced a filtered result. That is precisely the outcome this feature exists to
increase, and it is the one thing we do not count. The tech stack is explicit
about this: name events for what actually happened, not for the click that might
cause it — the reason `place_order` and `quote_submit` were retired on
2026-08-04.

Fixing the measurement in the same slice as the behaviour is deliberate. Shipping
the unblocking first would mean changing the assistant and then having no honest
way to say whether it helped.

## User stories

- As a **shopper who knows the brand I trust but not my tire size**, I want to
  ask for that brand and see tires, so that I can start looking instead of being
  interrogated.
- As a **shopper on a budget**, I want to ask for the cheapest ones first, so
  that I can see what is within reach without reading every card.
- As a **shopper who asked for one thing**, I want to be told what else I can
  narrow by, so that I can refine my search without guessing what the assistant
  understands.
- As a **shopper who genuinely needs a fitting tire**, I still want to be asked
  for my size when I have given nothing to search on, so that I am not shown a
  list that has nothing to do with my car.
- As the **owner**, I want customer conversations counted separately from staff
  ones, so that the numbers I steer by describe customers.
- As the **owner**, I want to know when a conversation actually produced a
  search, so that I can tell whether the assistant helps or merely talks.

## Scope

- **In:**
  - The public assistant searches immediately on whatever the customer gave —
    brand alone, rim alone, condition alone, price alone, or any combination —
    without first demanding a size.
  - After searching, it says what it filtered by and names the other things it
    can narrow by.
  - Ordering results by price becomes expressible in conversation, on both
    assistants.
  - The assistant says so plainly when a requested brand is not in the catalogue,
    instead of reporting it as a generic lack of availability.
  - Every chat event carries which surface it came from (public site or internal
    dashboard).
  - A new event fires when filters are actually applied to a listing, and a
    separate one when a search finds nothing (public surface only — see FR9).
  - The dashboard assistant gains ordering, the surface property and the
    filters-applied event, and is kept unblocked under test.

- **Out:**
  - Any redesign of the chat interface. No visual change is in scope.
  - The zero-results behaviour. Today the server checks the inventory before
    redirecting and offers WhatsApp when nothing matches; that stays exactly as
    it is.
  - New filtering capability in the catalogue. This exposes what the search API
    already supports and adds nothing to it.
  - Changes to the analytics plumbing — `InteractionTracker`, `trackEvent`, the
    consent gate. This feature adds events through the existing mechanism.
  - Vehicle lookup (year/make/model → size). Valuable, separate, not here.
  - Any change to the language behaviour or to i18n.
  - Orderings beyond price. The catalogue supports `price-asc` and `price-desc`
    and nothing else (`tiresRepository.ts`); anything richer would mean new
    catalogue capability, which is out (D7).
  - The dashboard assistant's own internal filters (sale kind, local, tire code).
    They keep working as they do; reviewing how well they are exposed is separate
    work (D2).
  - Setting a success target. Deliberately deferred until there is data to set it
    from (D1).

## Functional requirements

- **FR1:** When the customer's message contains anything the catalogue can filter
  on, the assistant searches on it immediately rather than asking a qualifying
  question first.
- **FR2:** A partial filter is a valid search. One brand, one rim size, one
  condition or one price bound is enough on its own.
- **FR3:** When the customer's message contains nothing filterable, the assistant
  still asks what it needs, as it does today.
- **FR4:** After applying filters, the assistant states in the customer's own
  language what it filtered by, and names **only the dimensions it has not yet
  used** as further ways to narrow. Once every dimension is in play, the hint
  stops.
- **FR5:** The assistant can order results by price ascending or descending, and
  a request for cheapest or most expensive first is honoured.
- **FR6:** When the customer names a brand the catalogue does not carry, the
  assistant says that specifically — distinguishing "we don't stock that brand"
  from "we have none right now" — and offers to continue with what is available
  or to move to WhatsApp.
- **FR7:** Every event emitted by either assistant identifies the surface it came
  from, so public and internal activity can be told apart in both analytics tools.
- **FR8:** An event fires when filters are applied to a listing — on the
  application, not on the button press or the message send — and carries the
  names of the dimensions used.
- **FR9:** A distinct event fires when a search finds nothing, carrying the same
  dimension names, so unmet demand is visible and is never counted as a
  successful search. **Public surface only** — it is the only one that queries the
  catalogue before answering, so it is the only one that can know a search came
  back empty (D2).
- **FR10:** The zero-results path is otherwise unchanged: the customer is told so
  and offered WhatsApp instead of being sent to an empty list.
- **FR11:** No event name or property carries personal data or the customer's own
  typed values — dimension names only — and no event may delay or fail the
  response it observes.
- **FR12:** The example prompts the chat offers a new visitor all produce the
  behaviour they advertise.

## Acceptance criteria (testable)

- [ ] **AC1:** Given a customer writes only a brand name (for example
      "Michelin"), when the assistant replies, then results are filtered by that
      brand and no question about tire size was asked first.
- [ ] **AC2:** Given a customer writes only a rim size (for example "aro 17" or
      "17 inch"), when the assistant replies, then results are filtered by that
      rim diameter.
- [ ] **AC3:** Given a customer writes a condition or a price bound alone (for
      example "used under $80"), when the assistant replies, then results are
      filtered accordingly.
- [ ] **AC4:** Given a customer's message contains nothing that can be filtered
      on (for example "I need tires"), when the assistant replies, then it asks
      for a size or a vehicle, as it does today.
- [ ] **AC5:** Given a search filtered by brand only, when the assistant replies,
      then the reply mentions rim, condition or price as further options and does
      **not** offer brand again.
- [ ] **AC6:** Given a search in which every available dimension has been used,
      when the assistant replies, then it offers no further narrowing.
- [ ] **AC7:** Given a customer asks for the cheapest first, when the assistant
      replies, then the resulting listing is ordered by ascending price; and for
      most expensive first, descending.
- [ ] **AC8:** Given a customer names a brand the catalogue does not carry, when
      the assistant replies, then it says that brand is not stocked — wording
      distinguishable from the out-of-stock message — and offers an alternative
      or WhatsApp.
- [ ] **AC9:** Given the assistant is used from the public site, when any of its
      events fires, then the event carries a surface value identifying the public
      site.
- [ ] **AC10:** Given the assistant is used from `/dashboard`, when any of its
      events fires, then the event carries a surface value identifying the
      internal dashboard, and that value differs from the public one.
- [ ] **AC11:** Given a conversation results in filters being applied, when the
      application happens, then exactly one filters-applied event fires, carrying
      the names of the dimensions used.
- [ ] **AC12:** Given a conversation does not result in filters being applied,
      when it ends, then no filters-applied event has fired.
- [ ] **AC13:** Given a search **on the public surface** that matches nothing,
      when the assistant replies, then a no-results event fires carrying the
      dimensions used, **and no filters-applied event fires**.
- [ ] **AC14:** Given a search that matches nothing, when the assistant replies,
      then the customer is told and offered WhatsApp, and is not redirected to an
      empty listing.
- [ ] **AC15:** Given any event this feature emits, when it is inspected, then it
      contains no email, phone number, name, address, other value traceable to
      one person, or any string the customer typed.
- [ ] **AC16:** Given each example prompt the chat offers a new visitor, when it
      is sent, then the assistant does what the prompt implies — the three that
      are partial filters produce a filtered listing rather than a question.
- [ ] **AC17:** Given the dashboard assistant receives a partial filter, when it
      replies, then it searches immediately, on the same terms as the public one.

## Non-functional / constraints

- **Mobile-first.** The assistant is used mostly on phones; any added text must
  stay readable on a small screen and must not push the input out of view.
- **Accessibility (WCAG 2.1 AA).** New assistant text is announced to screen
  readers on the same terms as existing replies; no new interactive element is
  introduced that would need its own keyboard handling.
- **Performance.** No meaningful growth in client JavaScript; the budget
  (`shared First-Load ≤ 180 KB`, `total ≤ 680 KB`) must still pass. Assistant
  response time should not visibly regress.
- **English-only UI**, with the existing behaviour of replying in the customer's
  detected language preserved.
- **Two analytics sinks.** Events reach GA4 and Vercel Web Analytics through the
  existing single path; nothing here may gate Vercel behind consent.
- **Event history.** Adding a property to events already in use creates a break
  in the series: every `open_ai_chat` and `ai_chat_send` recorded before this
  ships carries no surface value, and those readings mix customers with staff.
  Absence of the property must be read as "before 018", not as "public site" —
  recorded in this feature's results so the 28-day comparison in D1 is not drawn
  across the boundary.

## Decisions

Resolved on 2026-08-06. All six markers closed; one of them by reading the code
rather than by asking.

- **D1 — Instrument now, set the target later.** There is no baseline to capture
  before shipping, because the event that would measure it does not exist yet:
  waiting would mean waiting for a number we have no way to produce. The
  instrumentation ships, runs for at least 28 days, and the target is set from
  real data. **This feature is not merge-gated on a measurement** — unlike `014`,
  which is, because its baseline was destroyable and this one is unobtainable.
  The 28-day floor is not arbitrary: a 7-day window on these events produced a
  wrong conclusion on 2026-08-04.
- **D2 — The dashboard assistant behaves the same, which it mostly already did.**
  The decision was taken on the assumption that it blocked as the public one does.
  Reading its prompt during `/plan` showed otherwise: it has no conversation
  script demanding a size, only "extract the relevant filter criteria and use the
  tool". So the unblocking is largely already true there, and the work is to keep
  it true under test rather than to change it.

  The same reading found a real limit. The dashboard route never queries the
  catalogue — it returns filters unconditionally, where the public route checks
  the inventory first and offers WhatsApp when nothing matches. It therefore has
  no empty-result state to report, so **FR9's no-results event is public-surface
  only.** Giving the dashboard one would mean adding a database round-trip to a
  staff tool that does not want the WhatsApp fallback; that is out of scope, and
  named as such rather than silently skipped.

  Reviewing its own internal filters stays out either way.
- **D3 — The hint offers only dimensions not yet used.** Filter by brand and it
  suggests rim, condition or price — never brand again. The hint stays useful
  every turn without repeating, and fades out by itself as the customer narrows.
  Repeating the same paragraph each turn would push the input off a phone screen.
- **D4 — The filters-applied event carries the dimension names, not the values.**
  Knowing people filter by brand is what tells us the unblocking gets used;
  knowing they typed "Michelin" would mean forwarding what customers write to two
  third parties for no added decision.
- **D5 — Empty results are a different event, not the same one.** Nothing was
  filtered, so the success event must not fire; but how often a search dies for
  lack of stock, and on which dimensions, is buying information, not just
  analytics. Folding both into one number would blur "I took you to a list" into
  "we had nothing".
- **D6 — An absent brand is named as such.** "We don't stock that brand" and "we
  have none right now" are different facts and the customer acts differently on
  each. The mission puts transparency over hiding. This requires the assistant to
  know which brands the catalogue holds.
- **D7 — Price ordering only, by inspection.** `tiresRepository.ts` implements
  `price-asc` and `price-desc`; every other value falls through to the default.
  Offering tread life or newest would mean new catalogue capability, which this
  feature excludes. No question was asked because the code already answered it.

---

_The WHAT and WHY only. The HOW lives in [plan.md](./plan.md)._
