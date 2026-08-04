# Spec — Let a visitor change their mind about cookies

> Feature: `016-consent-withdrawal` · Status: Clarified — ready for `/plan` ·
> Created: 2026-08-04 · Clarified: 2026-08-04
> Roadmap: Backlog (trust & compliance) · Branch: `feat/016-consent-withdrawal`

## Why — problem & value

The cookie banner offers a visitor two buttons, once, and then never speaks to
them again. Accepting writes a decision that lasts a **year**, and there is no
control anywhere on the site to undo it. A visitor who accepts on a shared phone,
or who simply changes their mind, has no route back short of digging through
their browser's settings and deleting the site's data — which also empties their
shopping cart.

The gap is not new, and it was not accidental. The banner's own source carries
the admission: declining is described as "reversible via settings page if added
later." That page was never added.

What changed is that the site now **makes a promise about it**. Feature 015
rewrote the privacy policy and the banner copy so both state plainly that Google
Analytics runs only after the visitor accepts. That is an honest claim, and it is
exactly why the missing exit now matters: a site that explains what consent
controls, and then offers no way to withdraw it, undercuts the transparency it
just claimed. The mission puts trust first and says "transparency over hiding";
a one-way switch is the opposite of that.

The legal exposure is real but modest, and worth stating accurately rather than
inflating: GDPR requires that withdrawing consent be as easy as giving it, and
the site does have European visitors — but it serves the US market and 74% of its
traffic is American, under opt-out regimes aimed at the sale of data for
advertising rather than at first-party measurement. This is a trust and coherence
fix that happens to also close a compliance gap, not an emergency.

There is a second, quieter reason. Nobody on the team can currently test the
banner without wiping browser data, which is why a stale comment about a 30-day
re-prompt survived in the code for months against a value of one day. A control
that resets the decision makes the consent flow inspectable.

## User stories

- As a **visitor who accepted cookies**, I want to withdraw that consent later,
  so that a decision I made in one moment does not bind me for a year.
- As a **visitor who declined**, I want to be able to accept afterwards, so that
  I am not stuck with a choice I have since reconsidered.
- As a **visitor**, I want to be told plainly what my choice does and does not
  control, so that I am not misled into thinking I have switched off more than I
  have.
- As a **visitor who withdraws consent**, I want the analytics that was running
  to actually stop and its stored identifiers to be removed, so that withdrawing
  means something rather than merely re-hiding a banner.
- As the **owner**, I want the site's stated privacy policy and its actual
  behaviour to match, so that the transparency the brand claims holds up under
  inspection.

## Scope

- **In:**
  - A way to reach the consent decision again from the site, discoverable
    without hunting.
  - Changing the decision in either direction: accepted → withdrawn, and
    declined → accepted.
  - Withdrawal that genuinely takes effect, including removing the analytics
    identifiers already stored on the device.
  - Honest wording about what the choice governs, including that the
    cookie-free, non-identifying measurement described in the privacy policy
    keeps running either way.
  - The visitor's cart and other unrelated preferences surviving the change.

- **Out:**
  - Granular per-category consent (necessary / analytics / marketing). The site
    runs one gated tool; inventing categories for it would be theatre.
  - Any change to which analytics tools the site uses, or to decision D1 of
    feature 015 (Vercel Web Analytics stays ungated because it is cookie-free).
  - Geo-detection that shows the banner only to some regions.
  - A consent-management platform or third-party CMP.
  - Server-side or cross-device consent storage — the decision stays on the
    device, as it is today.
  - Reworking the banner's first-visit behaviour or its re-prompt interval.

## Functional requirements

- **FR1:** A visitor must be able to reach their consent decision again from any
  page of the site, through a control that is discoverable without prior
  knowledge and without opening browser settings.
- **FR2:** The control must show the visitor's **current** decision, not merely
  offer buttons. Someone who does not remember what they chose must be able to
  find out.
- **FR3:** A visitor who previously accepted must be able to withdraw. A visitor
  who previously declined must be able to accept. Both directions must take the
  same number of steps and the same effort, and neither may be presented as the
  preferable choice **through wording**. Their relative visual styling is
  explicitly out of scope — see D7.
- **FR4:** Withdrawal must actually stop the gated analytics collecting. It is
  not sufficient to hide the banner or to stop rendering a component: the
  identifiers already written to the device must be removed, and collection must
  not resume after the change.
- **FR5:** The change must take effect without the visitor being told to reload,
  clear anything, or take any further step.
- **FR6:** Changing the consent decision must not disturb anything unrelated —
  in particular the shopping cart, which lives in the same storage and is the one
  thing a visitor would be upset to lose.
- **FR7:** The control must state what the decision governs and what it does not,
  naming the tool that keeps running regardless and why. It must not imply that
  withdrawing stops all measurement.
- **FR8:** The wording must be consistent with the privacy policy, which feature
  015 rewrote. If the two disagree, the visitor is being misled by one of them.
- **FR9:** Withdrawing consent must not bring the banner back the next day.
  Someone who has just deliberately said no is left alone for **30 days**, after
  which the banner may appear again. In the meantime the footer control remains
  available, so the visitor is never locked out of changing their mind — they are
  simply not chased.
- **FR10:** The two waiting periods must both be honoured and must not be
  confused with one another: **1 day** after declining on a first visit, **30
  days** after withdrawing an existing consent. They differ deliberately —
  declining is a soft "not now" from someone who has not yet used the site, while
  withdrawing is a considered reversal by someone who already decided once, and a
  stronger signal earns a longer silence.
- **FR11:** The privacy policy must state, explicitly, how long the site waits
  before asking again in each case. A visitor should not have to discover the
  site's re-prompting behaviour by experiencing it.
- **FR12:** The control must be operable by keyboard and to WCAG 2.1 AA, and
  usable at phone width — 70% of the site's traffic is mobile.
- **FR13:** The control's copy and the privacy-policy changes must be reviewed
  and approved by the owner before merge, as with feature 015. It is
  visitor-facing text making claims about privacy.

## Acceptance criteria (testable)

- [ ] **AC1:** Given a visitor on any page of the storefront, when they reach the
      footer, then a clearly labelled control for their cookie choice sits beside
      the Privacy Policy link, and using it brings the consent choice back on that
      same page without a navigation.
- [ ] **AC2:** Given a visitor who previously accepted, when they open the
      control, then it shows that their current state is "accepted".
- [ ] **AC3:** Given a visitor who previously declined, when they open the
      control, then it shows that their current state is "declined".
- [ ] **AC4:** Given a visitor who accepted, when they withdraw, then the stored
      acceptance is gone from every place it was recorded.
- [ ] **AC5:** Given a visitor who accepted and whose analytics identifiers were
      written to the device, when they withdraw, then those identifiers are no
      longer present.
- [ ] **AC6:** Given a visitor who has just withdrawn, when they continue browsing
      and click a tracked element, then no gated-analytics event is sent.
- [ ] **AC7:** Given a visitor who previously declined, when they accept through
      the control, then the gated analytics starts and a subsequent tracked click
      is reported.
- [ ] **AC8:** Given a visitor with items in their cart, when they change their
      consent decision in either direction, then the cart is unchanged.
- [ ] **AC9:** Given a visitor who changes their decision, when the change is
      made, then it is in effect immediately, with no instruction to reload or
      clear anything shown to them.
- [ ] **AC10:** Given the control on screen, when its text is read, then it names
      the measurement that continues regardless of the choice and does not claim
      that withdrawing stops all analytics.
- [ ] **AC11:** Given the control's copy and the privacy policy, when they are
      compared, then they name the same tools and describe the same behaviour.
- [ ] **AC12:** Given a keyboard-only visitor, when they navigate to the control,
      then it is reachable, operable, and its focus is visible; and at 360px
      width nothing overflows or is cut off.
- [ ] **AC13:** Given the accept and the decline affordances, when their **labels
      and helper text** are compared, then neither is worded as the recommended
      or expected choice. Their visual styling is unchanged from today and is not
      asserted — see D7.
- [ ] **AC14:** Given a visitor who has just withdrawn, when they return the next
      day, then the banner does not reappear on its own; and when 30 days have
      passed, then it may.
- [ ] **AC15:** Given a visitor who declined on a first visit, when they return
      the next day, then the banner does reappear — the 1-day path is unchanged
      by this feature.
- [ ] **AC16:** Given the privacy policy, when it is read, then it states both
      waiting periods and which one applies to which action.
- [ ] **AC17:** Given a visitor considering the control, when they read it, then
      it tells them their cart is stored on this device and is not affected by
      the choice.
- [ ] **AC18:** Given the control's copy and the privacy-policy changes, when the
      feature is proposed for merge, then the owner has read and approved them.
- [ ] **AC19:** Given the full test suite, type check, linter, production build
      and performance budget, when they run, then all pass — including the
      characterization tests written against the **unmodified** banner before any
      refactoring began. (The banner had no tests at all before this feature, so
      those characterization tests are the only evidence that consent still
      behaves as it did.)

## Non-functional / constraints

- **Trust before convenience.** Where a smoother interaction conflicts with the
  visitor genuinely understanding or genuinely controlling what happens, the
  mission's ordering applies: trust and correctness first.
- **No dark patterns.** The withdraw path must not be slower, greyer, or buried
  relative to the accept path. If withdrawing is harder than accepting, the
  feature has failed regardless of what the code does.
- **Mobile-first.** 70% of traffic is mobile and 48% is iOS. If it does not work
  well on a phone, it is not done.
- **No new third-party dependency**, and no measurable change to the client JS
  budget — the perf budget stays green.
- **English-only** visitor-facing copy, in the brand's plain and honest voice.
- **Accessible to WCAG 2.1 AA**, as with every key flow.
- The site's data stays on the device. This feature must not introduce
  server-side storage of a privacy decision.

## Decisions

Resolved during `/clarify` on 2026-08-04. No blocking unknowns remain.

- **D1 — The control is a footer link that brings the existing banner back**, set
  beside the Privacy Policy link. Chosen over a new settings panel for two
  reasons. It reuses the interface the visitor has already seen and understood,
  per the constitution's reuse-before-creating rule. And it satisfies "withdrawal
  must be as easy as giving consent" **literally**: the same control, the same
  two buttons, the same effort. A bespoke panel could only ever approximate that.
- **D2 — Withdrawing buys 30 days of silence**; declining on a first visit keeps
  its existing 1 day. Two intervals, kept apart on purpose (FR10). The asymmetry
  is the point: bringing the banner back the morning after someone deliberately
  revoked would be precisely the dark pattern this feature exists to avoid.
- **D3 — Both intervals go in the privacy policy** (FR11). If the site waits a
  month before asking again, that is a commitment worth stating rather than a
  behaviour to be discovered.
- **D4 — The control mentions the cart, it does not manage it.** "Will I lose my
  basket?" is the reasonable fear before pressing any privacy button, so it gets
  answered in a sentence. Turning this into a data-management panel would widen
  the feature and introduce a way to destroy a cart by accident, for the sake of
  under 10 KB of non-personal preferences.
- **D5 — No per-category consent.** One gated tool means one decision; three
  checkboxes over a single switch would be theatre, and the mission puts
  transparency above the appearance of it.
- **D6 — The owner reviews the copy before merge** (FR13, AC18).
- **D7 — The banner's buttons keep their current styling.** Accept stays solid
  lime, decline stays a transparent outline. The owner's call, made with the
  trade-off stated: equalising them would land on a first-visit surface every
  visitor sees and could measurably reduce the acceptance rate, and acceptance
  is what keeps the primary analytics source populated.

  What this costs, stated plainly: the banner keeps a visual nudge toward
  accepting, which is a mild dark pattern and the one part of this feature that
  does not fully live up to its own premise.

  What it does **not** cost: the substance of "withdrawal must be as easy as
  giving consent". That requirement is about steps and effort, not colour — and
  D1 satisfies it exactly, since withdrawing means opening the same banner and
  pressing one of the same two buttons. No extra page, no extra click, nothing
  buried.

  Revisit if the acceptance rate is ever measured against a variant, or if EU
  traffic stops being negligible.

---

_The WHAT and WHY only. The HOW lives in [plan.md](./plan.md)._
