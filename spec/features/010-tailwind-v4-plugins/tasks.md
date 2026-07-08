# Tasks — Retire the dead Tailwind config & unused plugin deps

> Feature: `010-tailwind-v4-plugins` · Based on: [plan.md](./plan.md) · Created: 2026-07-08

Ordered, **very small, independently verifiable** tasks. Check each off as it is
completed. This is a zero-visual-change cleanup — the recurring check is "build +
suite stay green and the UI is unchanged."

- [x] **T1** — Delete the dead v3 config file. · files: **delete** `tailwind.config.ts` · check: `npm run build` compiles; grep shows no `import`/`require` of it (only comments referenced it).
- [x] **T2** — Remove the 4 unused deps from `dependencies`: `@tailwindcss/forms`, `@tailwindcss/typography`, `@tailwindcss/aspect-ratio`, `tailwindcss-animate`. Keep `@tailwindcss/postcss` + `tailwindcss`. · files: `package.json` · check: the 4 names are absent from `package.json`.
- [x] **T3** — Sync the lockfile: run `npm install` so the 4 removed trees are pruned. · files: `package-lock.json` · check: `npm install` succeeds; the 4 packages no longer appear in `package-lock.json`.
- [x] **T4** — Fix the stale plugin claim in the constitution. Replace `tech-stack.md` line 17-18 ("+ plugins forms, typography, aspect-ratio, tailwindcss-animate") with the real setup: Tailwind v4 via `@tailwindcss/postcss` + `@import "tailwindcss"`, design tokens in CSS `@theme` (no v3 plugins, no `tailwind.config.ts`). · files: `spec/tech-stack.md` · check: no doc claim that the v3 plugins are active.
- [x] **T5** — Sweep **all** stale comment references to `tailwind.config.ts` so none name the deleted file, while keeping the rationale (tokens live in CSS `@theme` because Tailwind v4 has no JS-config auto-load). Reword: `src/app/layout.tsx` (line 34-35, the `variable` bullet → point at `globals.css` `@theme`), `src/app/globals.css` (lines 5, 43, 58), and `src/font-token.test.ts` (line 8). · files: `src/app/layout.tsx`, `src/app/globals.css`, `src/font-token.test.ts` · check: `grep -rn "tailwind.config" src/` returns nothing; `tsc` + `npm test` green.
- [x] **T6** — Mark the roadmap backlog item resolved: `roadmap.md` line 85-90 "Tailwind v4 config activation" → ✅ done, noting `007` migrated the live tokens and `010` retired the inert remainder (deleted config + removed unused deps) with no regression. · files: `spec/roadmap.md` · check: item shows ✅ with the 007/010 note.
- [x] **T-tests** — No new logic to test (deletion/config cleanup). Confirm the existing guards still pass unchanged: `src/font-token.test.ts` and `src/tailwind-tokens.test.ts` (they assert the live tokens stay in `globals.css` `@theme`). · check: `npm test` — full suite green (125 on this branch), those two files included.
- [x] **T-DoD** — Definition of Done: `npx tsc --noEmit` + `npm run lint` + `npm test` + `npm run build` all green (tsc ✅ · lint ✅ · 125 tests ✅ · build ✅); **manual visual check** on home, `/tires`, a detail page, `guides/[slug]`, and a form-bearing page (checkout / filters) — UI identical to before (inputs, checkboxes, `aspect-*` media, guide article, cart slide-in animation all unchanged). Leave changes **staged, not committed**, until the user confirms the manual check.

## Traceability

| Task     | Acceptance criteria |
| -------- | ------------------- |
| T1       | AC1                 |
| T2, T3   | AC2                 |
| T4, T5, T6 | AC4               |
| T-tests  | AC2, AC5            |
| T-DoD    | AC1, AC3, AC5       |

_Every AC is covered: AC1 (T1, T-DoD build), AC2 (T2/T3/T-tests), AC3 (T-DoD manual pass), AC4 (T4/T5/T6), AC5 (T-DoD gate)._
