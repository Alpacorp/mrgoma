# Feature specs

One folder per feature: `NNN-slug/` containing `spec.md`, `plan.md`, `tasks.md`.
Templates live in [`_templates/`](./_templates).

## Spec-Driven Development (SDD) flow

The spec is the source of truth; code is derived from it. Each step is a review
gate — nothing proceeds until the previous artifact is agreed.

| Step  | Command      | Produces / does                                   |
| ----- | ------------ | ------------------------------------------------- |
| 1     | `/specify`   | `spec.md` — WHAT & WHY (+ feature branch)         |
| 2     | `/clarify`   | resolves `[NEEDS CLARIFICATION]` via questions    |
| 3     | `/plan`      | `plan.md` — HOW (technical, grounded in the code) |
| 4     | `/tasks`     | `tasks.md` — small, verifiable steps              |
| 5     | `/analyze`   | consistency check across spec ↔ plan ↔ tasks      |
| 6     | `/implement` | code + tests, enforces the Definition of Done     |

The commands live in [`.claude/commands/`](../../.claude/commands). The stable
project rules they build on are the constitution: [`../mission.md`](../mission.md),
[`../tech-stack.md`](../tech-stack.md), [`../roadmap.md`](../roadmap.md).

## Conventions

- Feature id: zero-padded number + kebab slug, e.g. `001-perf-baseline`.
- One branch per feature: `feat/NNN-slug`, off `main`.
- Keep each feature to one small, shippable slice (a roadmap phase).
