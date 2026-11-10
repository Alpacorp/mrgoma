# UX notes — Build your tire set (T0)

> Feature: `041-tire-sets` · 2026-11-10 · Stand-in for the `modern-web-guidance`
> skill, which is not available in this environment (CLAUDE.md rule).

## Decisions

| #   | Decision                                                                                                                                                                                                           | Why / source                                                                                                                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| U1  | Set size (2 / 3 / 4) is a **native radio group**: `<fieldset>` + `<legend>` + `<input type="radio">`, styled as large buttons. No custom `role="radiogroup"`.                                                       | The APG itself recommends native radios in a fieldset/legend before a custom widget: built-in semantics, keyboard and no JS required. [APG radio group examples][apg]                              |
| U2  | Only feasible sizes are rendered; infeasible ones are **not shown** (not disabled-and-greyed).                                                                                                                    | Baymard: shoppers who overlook availability waste time and trigger avoidable errors; mobile makes cross-checking options costly. Also the spec's "never offer what is not in stock". [Baymard][bs] |
| U3  | Buttons, not a dropdown, for the size: three options, always visible. Targets ≥ 44 px tall.                                                                                                                         | Few options → visible buttons scan faster; Baymard's size-selector research. WCAG 2.5.8 target size. [Baymard][bs]                                                                                |
| U4  | Swapping a tire uses a **native `<select>`** per unit, labelled "Swap tire 2 of 4". Options read "9/32 · 88% life · no patch · $120".                                                                              | Real form controls with accessible names per option; a select scales to many candidates on a phone without layout jumps. [testparty — ARIA in e-commerce][tp]                                    |
| U5  | One **polite, atomic live region**, present in the DOM from first render, announces "Set of 4 · total $480 · tread 9–10/32". Not assertive; one region only (no duplicate announcements).                         | ESDC ARIA live course (aria-atomic so label + amount read together; polite by default); WebAIM list (avoid duplicate announcements); live region must exist before the update. [esdc][esdc] [webaim][webaim] |
| U6  | The price of every tire is shown next to it, and the total under the list — no hidden discount math.                                                                                                              | Spec FR9; competitor anti-pattern (one figure per set).                                                                                                                                            |
| U7  | Mobile layout: one column; each unit row = thumbnail (or tread icon when no photo) · tread · life · patch · DOT · price, then its swap control. Sticky nothing; the add button sits right after the total.        | Baymard: mobile squeezes product info into a long column; avoid scrolling back and forth between controls. [Baymard mobile][bm]                                                                     |
| U8  | "Add set of N to cart" opens the existing cart drawer (same as single add). Focus is not moved programmatically.                                                                                                  | Consistency with the current add-to-cart; avoids double announcements with the live region (U5).                                                                                                  |

## Not verified

- Baymard's conclusion on buttons vs. dropdown for sizes was not readable in
  full from the search results; U3 rests on option count and WCAG target size.
- No source found for swap-specific announcement wording; U5's wording is ours.

[apg]: https://masup9.github.io/apg-patterns-examples/patterns/radio-group/react
[bs]: https://baymard.com/blog/use-buttons-for-size-selection
[bm]: https://baymard.com/blog/mobile-ux-ecommerce
[tp]: https://testparty.ai/blog/aria-labels-ecommerce
[esdc]: https://bati-itao.github.io/learning/esdc-self-paced-web-accessibility-course/module11/aria-live.html
[webaim]: https://webaim.org/discussion/mail_message?id=41353
