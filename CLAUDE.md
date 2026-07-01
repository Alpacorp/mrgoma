# CLAUDE.md — Mr. Goma Tires

Guidance for AI agents (and humans) working in this repo. This project runs on
**Spec-Driven Development (SDD)**: the spec is the source of truth; code is
derived from it.

## Read first: the constitution

Before any feature work, read the project constitution — it is the stable set of
rules and priorities:

- [`spec/mission.md`](./spec/mission.md) — what we are and how we decide.
- [`spec/tech-stack.md`](./spec/tech-stack.md) — canonical stack, conventions,
  structure, testing & the **Definition of Done**.
- [`spec/roadmap.md`](./spec/roadmap.md) — implementation order, in small phases.

## SDD workflow

Each feature is one small, shippable slice (typically a roadmap phase) and moves
through review gates. Artifacts live in `spec/features/NNN-slug/`.

| Step | Command      | Artifact / action                             |
| ---- | ------------ | --------------------------------------------- |
| 1    | `/specify`   | `spec.md` — WHAT & WHY (+ `feat/NNN-slug`)    |
| 2    | `/clarify`   | resolve `[NEEDS CLARIFICATION]` via questions |
| 3    | `/plan`      | `plan.md` — HOW (grounded in the code)        |
| 4    | `/tasks`     | `tasks.md` — small verifiable steps           |
| 5    | `/analyze`   | consistency check spec ↔ plan ↔ tasks         |
| 6    | `/implement` | code + tests, enforce the Definition of Done  |

Commands are defined in [`.claude/commands/`](./.claude/commands). Don't skip
gates: don't plan with open clarifications, don't implement before `/analyze` is
clean.

## Hard rules

- **One branch per feature** (`feat/NNN-slug`), off `main`. Never commit to `main`.
- **Commit locally; the user does the push.** Don't push unless explicitly told.
- **No `Co-Authored-By` line** in commit messages.
- **Reuse before creating** — existing components, endpoints, param names,
  patterns (see `tech-stack.md`).
- **Research modern UX/UI** with the `modern-web-guidance` skill before building
  new interfaces.
- **Definition of Done** (from `tech-stack.md`) before closing any change:
  `npx tsc --noEmit` + `npm run lint` + `npm test` + `npm run build` green, tests
  for new logic, and a manual check for UI.

## Quick reference

- Dev: `npm run dev` · Build: `npm run build` · Test: `npm test` · Lint:
  `npm run lint` · Format: `npm run format`.
- Stack: Next.js 16 (App Router) · React 19 · TS · Tailwind v4 · SQL Server
  (`mssql`) · NextAuth v5 · Stripe · Vercel. Full detail in `spec/tech-stack.md`.
