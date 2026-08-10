# Results — 018-ai-chat-filters-and-surface

> Recorded: 2026-08-06 · Status: implemented, awaiting merge

## Read this before comparing any AI-chat numbers

**A `surface` property first shipped with this feature.** Every `open_ai_chat`,
`ai_chat_send` and `ai_chat_example` recorded before it has no such property, and
those readings **mix customers with staff**: both assistants rendered the same
component and emitted identical events, so every search a seller ran from
`/dashboard` landed in the same counters as a shopper's.

So an absent `surface` means **"before 018"** — never "the public site". Any
chart that filters on `surface = site` silently drops the entire history rather
than showing it; any chart that doesn't is comparing a mixed population against a
clean one.

The two new events, `ai_chat_filters_applied` and `ai_chat_no_results`, have no
history at all. They begin on the deploy date.

## When to draw the first conclusion

Per **D1**, no target was set before shipping, because there was nothing to
measure: the event that would have produced a baseline is the one this feature
adds. The instrumentation runs first and the target is set from real data.

**Wait at least 28 days.** Not a round number — on 2026-08-04 a 7-day window on
these dashboards produced a confident and wrong conclusion (an event was recorded
as "never fired, history empty"; the 28-day window showed 11 events across 6
users). Anything shorter than 28 days on this data has already misled us once.

## What to look at

- **Share of conversations that reach a search.** `ai_chat_filters_applied`
  against `ai_chat_send`, filtered to `surface = site`. This is the number the
  feature exists to move: before it, asking for a brand produced a question
  rather than results.
- **Which dimensions people actually use.** The `dimensions` property on the same
  event. If `brand` and `rim` appear frequently, the unblocking is being used for
  what it was built for.
- **Unmet demand.** `ai_chat_no_results` with its dimensions — which brands and
  sizes customers ask for and leave without. This is buying information as much as
  analytics, and it is worth reading even if nothing else here moves.
- **Staff versus customer volume.** Now separable for the first time. Worth one
  look purely to learn how much of the previous year's chat numbers were
  employees.

## Verification

To be completed after the manual pass and deploy.

- [ ] Public chat: brand-only request returns results, not a question.
- [ ] Public chat: "cheapest first" reorders the listing.
- [ ] Public chat: a brand we don't stock is named as such.
- [ ] Prompt regressions: a store question, an off-topic question and a WhatsApp
      request all still behave.
- [ ] Dashboard chat: still searches, `sort` works.
- [ ] Events arrive in both GA4 and Vercel carrying `surface`.
