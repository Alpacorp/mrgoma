# Mission — Mr. Goma Tires

> Project constitution · last updated: 2026-06-30

## What we are

Mr. Goma Tires is a **modern used-tire store** (plus other related automotive
services). We don't compete on having the biggest catalog or the lowest price:
we compete on the **digital experience**.

We serve the **US market** with an **English-language** experience.

## Mission

> Make buying a used tire online as clear, fast and trustworthy as buying a
> brand-new premium product — so the customer understands **what they're buying**
> and **why it fits them**, with zero friction.

## Core differentiator: a superior digital experience

The experience _is_ the product. Everything we build must reinforce that
Mr. Goma feels more agile, more transparent and more "alive" than any other
used-tire seller.

Experience pillars:

1. **Frictionless search.** Find the right tire by size and by filters (brand,
   condition, price) straight from the home page, in the fewest steps.
2. **Visual transparency.** The customer sees the real state of the tire: photos
   with zoom/magnifier, 3D visualization of tread & wear, understandable sizing.
   No surprises.
3. **Perceived and real speed.** Fast loads, smooth interactions, solid mobile
   behavior (iOS included). Performance is a feature.
4. **Smart assistance.** Contextual help (AI chat, instant quote, guides) that
   supports without getting in the way.
5. **Trustworthy closing.** A clear, secure checkout; the customer knows what
   they pay and what comes next.

## Who we serve

- **The used-tire buyer** who wants to save without taking a risk: they need
  confidence (condition, correct size, availability) before paying.
- **The automotive-services customer** for related services (a complement to the
  tire core).

## How we earn trust

Trust is what turns a used-tire browser into a buyer. We back it with:

- **A clear condition standard.** Every tire shows its real state — tread depth
  (in 1/32") and remaining life (%) — made visual (tread & wear 3D, photos with
  zoom) so the buyer sees exactly what they're getting.
- **Warranty on used tires.** Purchases are backed by a warranty, so buying used
  isn't buying blind.

## How we decide (principles)

- **Mobile-first and accessible.** If it doesn't work well on a phone, it's not
  done.
- **Transparency over hiding.** Showing the real state/condition always beats
  dressing it up.
- **Reuse before creating.** Existing components, endpoints and patterns first.
- **Performance is part of design**, not an afterthought.
- **Small, verifiable changes.** Tiny phases, green build + tests before closing.
- **Research modern UX/UI before building** new interfaces.
- **Accessible to WCAG 2.1 AA.** Accessibility is a requirement, not a
  nice-to-have.
- **When goals conflict**, decide in this order:
  **trust/correctness → accessibility → performance → scope**. We'd rather ship
  less than ship something misleading or broken.

## Voice & tone

- **Plain and honest.** Explain sizing and condition in words a non-expert
  understands; never oversell.
- **Confident, not pushy.** Guide the decision and let transparency do the
  selling.
- **US English**, concise, written for small screens.

## How we measure success

- **Primary funnel:** search → detail → checkout. We optimize this conversion
  path (tracked in GA4).
- **Core Web Vitals (field, p75):** LCP < 2.5s · INP < 200ms · CLS < 0.1 on the
  key routes.
- **Accessibility:** WCAG 2.1 AA on key flows.
- **Checkout completion** without friction or errors.

## Out of scope (for now)

- Multi-seller marketplace.
- New-tire inventory as a primary line.
- Native mobile app (the responsive web is the channel).
- Multi-language / i18n (English-only for now).

---

_Sibling documents: [tech-stack.md](./tech-stack.md) · [roadmap.md](./roadmap.md)_
