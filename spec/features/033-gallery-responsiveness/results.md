# Results — 033-gallery-responsiveness

> Feature: `033-gallery-responsiveness` · 2026-08-26 · Branch: `feat/033-gallery-responsiveness`

> **Gates compressed on purpose.** A reported defect — the detail page's photo
> interaction "feels slow" — with the cause found by measurement rather than
> design. Nothing new is specified; what follows is the diagnosis and what it
> changed.

## What was reported

> *"When you interact with the photos — tap another one and it should become the
> main photo — it feels slow. Hover for the magnifier and it takes a while."*

## The measurement that nearly went wrong

The first cold load took **over 11 seconds** for the main photo to appear, and
the design was almost blamed for it. It was the dev server compiling the route.
Measured separately, the image optimizer answers in **0.23–0.78 s cold and ~1 ms
warm**, and the optimized photo is **90 KB against a 283 KB original**. That
number was discarded; everything below was measured on a **fully warm page**.

## Two real causes

### The magnifier fetched its image when you hovered

**1.754 ms from hover to lens**, on a page where every byte of the photo on
screen was already cached.

The lens mounted on the first mouse move, and it loaded the **original file** —
1600×1200, **283 KB of JPEG** — while the photo behind it was 600×450. You
hovered and watched an empty circle.

### Switching photos left the frame blank

Only the selected photo was rendered, so changing it swapped a single `src` and
the browser had to fetch a photo nothing had asked for. Measured: **blank at
970 ms, still blank nine seconds later** on a photo that had not been fetched.

## What changed

**Every photo is mounted; only one is opaque.** Switching is now a class change
with no network at all. The others are fetched at `low` priority so they queue
behind the photo on screen — left to `lazy` they stayed unrequested entirely
(measured: 1 of 4 loaded), which mounted them without preloading them.

**The magnifier is ready before the pointer arrives.** It mounts on
`requestIdleCallback`, only where a pointer can hover, and — the part that looked
right and was not — with `opacity: 0` rather than `visibility: hidden`, because
**Chrome does not download images inside a hidden subtree**. Mounted early behind
`visibility: hidden` it fetched nothing and the wait was unchanged.

**The lens and the full-screen view read the optimized variant.** The source is
1600 px wide either way, so the 283 KB JPEG and the **146 KB WebP carry the same
pixels** — 48% less for identical detail.

**Thumbnails load eagerly.** They sit beside the photo they belong to and were
`loading="lazy"`, arriving after the frame had already been drawn empty.

## Measured after

| | before | after |
| --- | ---: | ---: |
| Network requests caused by hovering | 1 (283 KB) | **0** |
| Hover → lens visible | 1.754 ms | image already loaded |
| Frame blank after a thumbnail click | from 970 ms | **never** |
| Photos loaded before any interaction | 1 of 4 | **4 of 4** |
| Requests caused by a thumbnail click | 1 photo | 1 — the new photo's zoom variant, in the background |

## What it costs, and what was done about it

Preloading is not free. A detail page's images go from roughly **130 KB to
550–690 KB**, depending on how many photos the tire has and how large they are.

On a product page whose purpose is inspecting a used tire, that is the right
trade — but not unconditionally:

- **The zoom image is skipped on a metered or slow connection.** It is the single
  heaviest item (146 KB) and the only one a buyer may never ask for;
  `saveData` or a `2g` effective type defers it to the hover that justifies it.
  The photos themselves still preload, because that is the fix.
- **Phones never mount the lens at all** — the pre-mount is gated on
  `(hover: hover) and (pointer: fine)`.

## The touch path, reported after the desktop fix

> *"When I tap an image it takes a couple of seconds to show. Then it works and I
> can zoom with the next tap — but that first tap feels slow."*

The pre-fetch is gated on a pointer that can hover, so a phone reaches the
full-screen view with the large variant not downloaded and waits for it on a
black screen. **The desktop fix had quietly covered desktop's full-screen view
too** — the lens and the dialog request the same URL — and left mobile with the
same problem in a different place. Confirmed on desktop: opening full-screen
caused **0 new requests**, because the lens had already fetched it.

Rather than spend 146 KB on every mobile visit for a tap that may never come, the
view now **opens with the copy the page already has** — the same `sizes` as the
main photo, so it is the same request, already in the browser — and the sharp one
fades in when it lands.

### Three bugs came from tracking "has it arrived yet?"

The first attempt kept a flag, set by `onLoad`, and faded the sharp copy in.

1. **`onLoad` does not fire for an image the browser already has.** On desktop
   the pre-fetch guarantees it always does — so the handler never ran, the flag
   stayed false, and the sharp copy sat at `opacity: 0` above a placeholder that
   had already been removed. **The view opened empty.** Seen in the DOM as
   `complete: true, opacity: 0`, and caught only by opening it: `tsc`, lint and
   1.539 tests were green throughout.
2. **A ref checking `complete` on mount missed it too** — the element exists
   before the decode does, so the check ran too early and the flag stayed false.
3. **Removing the placeholder mid-fade left 200 ms with nothing fully opaque** —
   reported from the phone as a flicker: *"it loads, flickers, then shows without
   flickering."*

So the flag is gone. **An `<img>` with no pixels is transparent**: two layers,
the cached one underneath at `z-0` and the sharp one above at `z-10`, and the one
below shows until the one above has something to paint. No state, no `onLoad`, no
fade — the browser was already doing the work.

`z-0` and `z-10` are load-bearing: an absolutely positioned sibling paints above
an in-flow one, so without them the low-res copy would cover the sharp one
permanently.

## Not verified here

**The touch path itself.** An iframe reports the host machine's pointer, so
`matchMedia('(hover: hover)')` is true inside it whatever width it is given —
the lens mounted in the 390 px probe for that reason. On a real phone `canHover`
is false and the lens is never mounted, but that is read from the code, not seen.
It needs a device.

## Definition of Done

| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | ✅ |
| `npm run lint` | ✅ |
| `npm test` | ✅ **1.542 passed** (baseline 1.531, +11) |
| `npm run build` | ✅ |
| `npm run perf:budget` | ✅ 624.8 KB / 680 — client JS unchanged; this is image bytes, which it does not measure |
