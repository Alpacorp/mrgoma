# Plan — Retire the dead Tailwind config & unused plugin deps

> Feature: `010-tailwind-v4-plugins` · Based on: [spec.md](./spec.md) · Created: 2026-07-08

## Technical approach

Pure cleanup, **zero visual change**. The Tailwind **v4** engine is loaded by
`postcss.config.mjs` (`@tailwindcss/postcss`) + `@import "tailwindcss"` in
`globals.css`; the v3-style `tailwind.config.ts` has **no `@config` directive**, so
v4 never reads it. Every live token it once held already lives in `globals.css`
`@theme` (migrated in `006`/`007`): `--font-sans` (Inter), `--breakpoint-xs` (350px),
`--animate-slide-in-right` (cart drawer). What's left in the config is inert:

- `theme.screens` — duplicates v4's default `sm…2xl`; the only custom one (`xs`)
  is already in `@theme` (`--breakpoint-xs`).
- `theme.extend.backgroundImage` `gradient-radial` / `gradient-conic` — used in no
  component.
- `plugins: [forms, aspectRatio, typography]` — v4 ignores this array entirely
  (plugins would load via `@plugin` in CSS, which we deliberately do **not** add).

So the change is mechanical: delete the file, drop the four dead deps, and correct
the docs/comments that still describe the old world. `aspect-*` utilities keep
working (native in v4); inputs keep their manual styling (forms plugin was never
applied); the guides article keeps rendering identically (its `prose` is already
neutralized by `not-prose` on every block, and typography was never applied).

Verification is an **unchanged `npm run build`** plus a visual spot-check — if the
config or deps had mattered, the build output or the UI would change; it won't.

## Reuse first

Nothing new is created. This removes code/deps and aligns docs with the mechanism
already in place (`globals.css` `@theme` + `@tailwindcss/postcss`). The existing
`src/font-token.test.ts` and `src/tailwind-tokens.test.ts` already guard that the
live tokens stay in CSS — they keep protecting us after the config is gone.

## Files to add / change

- **Delete `tailwind.config.ts`** — the dead v3 config (imports the 3 plugins,
  holds only inert `screens`/`backgroundImage`). No code imports it; only comments
  mention it.
- **`package.json`** — remove 4 dependencies: `@tailwindcss/forms` (0.5.10),
  `@tailwindcss/typography` (0.5.19), `@tailwindcss/aspect-ratio` (0.4.2),
  `tailwindcss-animate` (1.0.7). Keep `@tailwindcss/postcss` and `tailwindcss`
  (the v4 engine). Run `npm install` to update `package-lock.json`.
- **`spec/tech-stack.md`** (line 17-18) — replace the "+ plugins forms, typography,
  aspect-ratio, tailwindcss-animate" claim with an accurate description: Tailwind
  v4 via `@tailwindcss/postcss`, `@import "tailwindcss"`, design tokens in CSS
  `@theme` (no v3 plugins / no `tailwind.config.ts`).
- **Comment sweep** — reword every code comment that names `tailwind.config.ts`
  so none references the deleted file, keeping the rationale (tokens live in CSS
  `@theme` because v4 has no JS-config auto-load): `src/app/layout.tsx` (line
  34-35, the `variable` bullet → point at `globals.css` `@theme`),
  `src/app/globals.css` (lines 5, 43, 58), and `src/font-token.test.ts` (line 8).
- **`spec/roadmap.md`** (backlog line 85-90) — mark "Tailwind v4 config activation"
  **✅ done**, noting `007` migrated the live tokens and `010` retired the inert
  remainder (deleted the config + removed unused plugin deps), with **no
  regression** because nothing was active.

_Note:_ `src/font-token.test.ts:8` is included in the comment sweep above — its
rationale ("the `sans` token lives in CSS `@theme`") stays, but it's reworded so it
no longer names the deleted `tailwind.config.ts`. The test **assertions** are
unchanged; only the doc comment is touched.

## Data & flow

No runtime, API, DB, route, or state changes. Build-time only: PostCSS →
`@tailwindcss/postcss` scans source for utility usage (driven by `@import
"tailwindcss"` + `@theme`, **not** the config's `content` array). Deleting the
config and the dead deps does not alter the scanned sources or the emitted CSS.

## Acceptance criteria → implementation

| AC  | How it's met | How it's verified/tested |
| --- | ------------ | ------------------------ |
| AC1 (config gone, build green) | Delete `tailwind.config.ts`; v4 never read it | `npm run build` compiles; spot-check that `aspect-*`, `green-600`, `font-sans`, cart `animate-slide-in-right` still render |
| AC2 (deps removed) | Remove 4 deps from `package.json`; `npm install` rewrites lockfile | `tsc --noEmit`, `npm run lint`, `npm test` (129) stay green; deps absent from both files |
| AC3 (no visual change) | Nothing active was removed (forms never applied, aspect native, typography neutralized, animate dead) | Manual pass: home, `/tires`, detail, guides, checkout/filters — identical UI |
| AC4 (docs accurate) | Fix `tech-stack.md` 17-18 + `layout.tsx` comment; roadmap item resolved | Read-back: no doc claims the v3 plugins are active; no stale "token lives in tailwind.config.ts" comment |
| AC5 (DoD) | Run the full gate after edits | `tsc` + `lint` + `test` + `build` all green |

## Tradeoffs / alternatives

- **Delete vs. keep the config as documentation.** Rejected keeping it: a config v4
  ignores is a trap (future devs edit it expecting effect — exactly what happened in
  P1.3). `globals.css` `@theme` is the real, documented home.
- **Activate the plugins instead (original follow-up premise).** Rejected on
  evidence: `forms` would restyle every input (regression), `aspect-ratio` is native
  in v4, `typography` is neutralized by `not-prose`, gradient utils unused. Nothing
  to gain, real risk of visual change.
- **Add `@plugin` directives to keep typography/forms loadable.** Rejected: no page
  needs them today; adding them is scope creep and changes output. If a real `prose`
  page appears later, that's its own feature (add `@plugin "@tailwindcss/typography"`
  + the dep then).

## Risks

- **Build relies on the config `content` array.** Mitigated: v4 discovers sources
  via `@tailwindcss/postcss` (Next integration), not the v3 `content` globs;
  `npm run build` is the direct check.
- **A utility silently disappears (v4 drops unknown utilities without error).**
  Mitigated: the migrated tokens are in `@theme` and guarded by
  `font-token.test.ts` / `tailwind-tokens.test.ts`; the visual spot-check covers
  `aspect-*` and the cart animation.
- **Lockfile churn.** Mitigated: `npm install` only prunes the 4 removed trees;
  review the diff is limited to those packages.

## Out of scope

- Activating any Tailwind plugin (forms / typography / aspect-ratio).
- Redesigning `guides/[slug]` to actually use `prose` (strip `not-prose`) — a
  separate UI improvement; the vestigial `prose prose-gray` wrapper stays as-is
  (harmless no-op without the plugin).
- Touching `@tailwindcss/postcss` or `tailwindcss` (the live v4 engine).

---

_The concrete steps live in [tasks.md](./tasks.md)._
