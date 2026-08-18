# Results — 019-whatsapp-tire-enquiry

> Recorded: 2026-08-17 · Status: implemented, awaiting manual verification

## Definition of Done

| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | ✅ |
| `npm run lint` | ✅ |
| `npm test` | ✅ **592 passed** (baseline 550, +42) in 73 files (was 68) |
| `npm run build` | ✅ 450 static pages generated |
| `npm run perf:budget` | ✅ shared 166.0 KB / 180 · total 617.2 KB / 680 |

**The JS budget did not move.** 166.0 KB and 617.2 KB are byte-for-byte the
numbers from before this feature — the proof that the button really is a
server-rendered `<a>` with no client island.

## Read this before comparing WhatsApp numbers

**No new event name was created.** This surface emits `open_whatsapp`, the same
name the contact page, guides, locations and services already emit, distinguished
by a new `surface = tire_detail` property.

So an **absent `surface` means "not the detail page"** — it does not mean
"before 019". The other surfaces will keep emitting `open_whatsapp` with no
`surface` at all, indefinitely, because this feature did not touch their
instrumentation. A chart that filters `surface = tire_detail` shows only this
button; a chart that ignores `surface` shows every WhatsApp click on the site,
which is exactly what it did before.

`surface` on `open_whatsapp` is unrelated to the `surface` property `018` added
to the `ai_chat_*` events. Same word, different event families.

## Verified during implementation

- **AC13** — production returns `200` to `facebookexternalhit` and serves four
  `og:image` tags; the image host answers in 1.2 s. Ordinary `curl` still gets
  `429`, so the firewall bypass is correctly scoped to preview crawlers.
- **The rendered message**, read off a real detail page in dev:

  ```
  Hi MrGoma, I'm interested in this tire:

  #260298 — BRIDGESTONE ALENZA A/S 02 RSC RFT
  Size: 235/50/20
  Condition: Used · 80% life · 8.0/32" tread · Patched
  Price shown: $135
  https://www.mrgomatires.com/tires/471004-bridgestone-235-50-20
  ```

- **The `<a>` ships in the server HTML** with all three `data-track-*`
  attributes, `target`, `rel`, `min-h-11`, `w-full` and the focus ring.

## Two things the plan did not anticipate

**The guard test found three copies nobody knew about.** The number was expected
in twelve places; a `grep` for the digit string found exactly those. The guard —
which strips punctuation before matching — found **fifteen across ten files**.
The three extra were written as `+1 (407) 364-4016`: in the contact page's
footer, in the assistant's prompt, and inside the prose of a rideshare guide,
where no digit search would ever have surfaced it. The tool built to prevent the
next copy discovered three existing ones on its first run.

**The tread depth had no unit.** The `Tread` column stores a bare number (`8.0`),
and every other surface appends `/32"` when displaying it —
`TreadWearExplorer` and `generateTireDescription` both do. Composed without it,
the first real message read `8.0 tread`, which tells a buyer nothing. Caught by
reading the live output, not by a test: every fixture had been written with the
unit already in the value, so the tests agreed with the bug.

## Still to verify (manual)

- [ ] **AC12 / T14** — keyboard tab-through and 360px layout, on an available
      tire **and a sold one**.
- [ ] **AC14 / T15** — a real WhatsApp chat renders the preview card. Use a tire
      URL **not shared before**: WhatsApp caches previews by URL, so a link
      fetched before the firewall rule was published may still arrive card-less.
      Facebook's Sharing Debugger forces a re-scrape.
- [ ] **AC15** — field Core Web Vitals on the detail route after deploy. The lab
      signal is good (no JS added, no layout inserted above the fold), but the
      budget is a field measurement.

## Known limitation

`og:image` points at `https://www.usedtires.online/...`, a host outside our
firewall and outside Vercel. It answered in 1.2 s at 379 KB on 2026-08-17. If it
slows or fails, the preview card degrades to plain text and nothing on our side
can fix it. Mitigation, if it ever becomes a problem: serve OG images from our own
domain — a separate feature.

## Deferred

Naming the holding store in the message. `VaultName` reaches the record but its
values are internal operational naming — `Warehouse`, `441`, `27th Ave`,
`Pembroke WH` — not the seven public stores. It needs a `VaultName` → public-store
mapping only the owner can confirm. `tireEnquiry.test.ts` asserts that no store
or warehouse name reaches a message, so this stays deliberate rather than
forgotten.

---

_Spec: [spec.md](./spec.md) · Plan: [plan.md](./plan.md) · Tasks: [tasks.md](./tasks.md)_
