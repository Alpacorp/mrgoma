# Tech Stack — Mr. Goma Tires

> Project constitution · last updated: 2026-06-30
>
> This document fixes the **canonical** stack, the **conventions/structure**, and
> the **testing and quality** standards. It is the source of truth: stack changes
> are discussed and reflected here before being adopted.

## 1. Canonical stack

Versions taken from `package.json` (2026-06-30). Update here when they change.

### Core
- **Next.js 16.1.5** — App Router, Server Components, Turbopack.
- **React 19.2** + **React DOM 19.2**.
- **TypeScript 5.9** — strict mode; no `any` unless justified.
- **Tailwind CSS v4** (`tailwindcss` 4.1, `@tailwindcss/postcss`) + plugins
  `forms`, `typography`, `aspect-ratio`, `tailwindcss-animate`.

### Data and backend
- **SQL Server** via **`mssql` 12** (repository pattern in `src/repositories/`).
- **NextAuth v5 (beta)** — credentials provider against `/api/login`.
- **Winston 3** — structured logging (`src/utils/logger.ts`), `LOG_LEVEL`.
- **Zod 4** — schema validation.

### Product / features
- **Stripe 20** — checkout (with a temporary fallback to WhatsApp orders).
- **@anthropic-ai/sdk** — dashboard AI chat (model `claude-haiku-4-5`).
- **Three.js 0.185** + **@react-three/fiber 9** + **@react-three/drei 10** — 3D
  visualizations (home size selector, tread & wear on the detail page).
- **react-hook-form 7** + **@hookform/resolvers** — forms.
- **@tanstack/react-table 8** — dashboard tables.

### Platform / analytics
- **Vercel** — hosting and deployment.
- **Google Analytics 4** (consent-gated) + **@vercel/analytics**.

## 2. Conventions and structure

### Folder layout (`src/`)
- `app/(shop)/` — store routes (home, `tires`, `detail`, `dashboard`,
  `checkout`, `services`, `guides`).
- `app/api/` — route handlers (tire, tires, brands, ranges, checkout, login,
  dashboard/*, `*/ai-chat`).
- `app/ui/components/` — reusable components (one per folder).
- `app/ui/sections/` — composed page sections.
- `app/ui/icons/` — icons.
- `app/hooks/`, `app/context/`, `app/utils/`, `app/interfaces/` — hooks, context,
  utilities and domain types for the app.
- `repositories/` — data access (SQL Server).
- `utils/` — cross-cutting utilities (e.g. `logger`).

### Naming and style
- Components in **PascalCase**, one component per folder with a same-named file.
- Hooks as `useX`, utilities in camelCase.
- Client Components marked with `'use client'` only when needed.
- **Reuse before creating**: existing endpoints (`/api/brands`, `/api/ranges`),
  components (`Dialog`, `RangeSlider`) and param names.
- Styling with Tailwind v4 (use `shrink-0`, not `flex-shrink-0`). Brand green:
  `green-600` / `hover:green-700`.

### Platform conventions
- Sensitive env vars **without** the `NEXT_PUBLIC_` prefix (server-only). Only
  non-sensitive/UI values carry `NEXT_PUBLIC_`.
- `NEXTAUTH_URL` must point to the production URL on Vercel.
- Remote image handling via `next/image` (the magnifier uses the original URL).
- **English-only UI** (US market) — no i18n layer yet.

### API & error conventions
- Route handlers live in `app/api/*` and return JSON with a correct HTTP status.
  Established contracts: **409** when a cart item is unavailable, **501** when a
  payment provider isn't configured, **200** with a sanitized payload for reads.
- Validate external input at the boundary with **Zod**.

### Data access & security
- All SQL goes through `src/repositories/` using **parameterized `mssql`
  queries** — never concatenate user input into SQL.
- Secrets stay server-only (no `NEXT_PUBLIC_`); the client receives only
  non-sensitive UI values. Auth via NextAuth v5.

### Analytics & tracking
- Instrument user actions **declaratively** with `data-track` (+
  `data-track-category` / `-label` / `-value`) attributes, delegated to GA4
  (consent-gated). Add them to new interactive elements.

### Feature flags
- Client-visible flags use the `NEXT_PUBLIC_*` prefix (e.g. AI chat, Stripe
  toggle), mirrored by a server-only flag when server logic depends on it. Flags
  gate incomplete or rolling-out features.

### State management
- Prefer props and local state. Use React **Context** only for cross-cutting
  selection shared across a subtree (e.g. `SelectedFiltersContext` for tire
  size). Don't store server data in Context.

### Browser support
- Target **Baseline 2025** web features (e.g. the Popover API is fine). Avoid
  non-Baseline APIs (e.g. CSS Anchor Positioning) without a fallback; verify with
  the `modern-web-guidance` skill.

## 3. Testing and quality

### Tools
- **Vitest 4** (`npm test`) — jsdom, Testing Library (`react`, `jest-dom`,
  `user-event`). Current suite: **107 tests / 24 files**.
- **ESLint 9** (`eslint-config-next`, `@typescript-eslint`) — `npm run lint`.
- **`tsc --noEmit`** — typecheck without emitting.
- **Prettier 3** — formatting (`npm run format` / `format:check`).

### Definition of Done
A change is done when:
1. `npx tsc --noEmit` passes (no type errors).
2. `npm run lint` passes.
3. `npm test` passes (107+ green; add tests for new logic).
4. `npm run build` compiles.
5. Manual behavior check when it's UI (ideally on mobile).

### Accessibility
- Target **WCAG 2.1 AA** on key flows: semantic HTML, labelled controls, keyboard
  operability, visible focus, and `prefers-reduced-motion` respected. Aim to add
  `eslint-plugin-jsx-a11y` / axe checks to catch regressions.

### Performance budget
- Core Web Vitals targets (field, p75): **LCP < 2.5s · INP < 200ms · CLS < 0.1**
  on `/`, `/tires` and detail. Heavy/optional code (three.js) loads deferred;
  images through `next/image` with correct `sizes` / `priority`.

### Working rules
- **Small, verifiable** changes; one branch per feature (never commit directly to
  `main`).
- Research modern UX/UI (the `modern-web-guidance` skill) before building new
  interfaces.
- Local commits; **the user does the push**.

---

_Sibling documents: [mission.md](./mission.md) · [roadmap.md](./roadmap.md)_
