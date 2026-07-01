---
description: SDD step 1 — turn a feature idea into a spec.md (WHAT & WHY)
argument-hint: <short feature description>
---

You are running the **/specify** step of our Spec-Driven Development workflow.

Goal: turn the feature idea below into a clear `spec.md` — the WHAT and the WHY.
**No implementation details** (those belong in `/plan`).

Feature idea: $ARGUMENTS

Do this:

1. Read the constitution first: `spec/mission.md`, `spec/tech-stack.md`,
   `spec/roadmap.md`. The feature must serve the mission and fit a roadmap phase.
2. Choose the feature id: scan `spec/features/` for the highest `NNN-` prefix and
   use the next number, zero-padded (e.g. `003`). Build a short kebab-case slug
   from the idea. Feature id = `NNN-slug`.
3. Create and switch to branch `feat/NNN-slug` off `main` (never work on `main`).
   If it already exists, switch to it.
4. Create `spec/features/NNN-slug/spec.md` from `spec/features/_templates/spec.md`,
   filling every section. Write for a non-developer reader: user stories,
   functional requirements, and **testable acceptance criteria**.
5. Do not invent unknowns — mark each with `[NEEDS CLARIFICATION: …]`.
6. Keep it to ONE small, shippable slice (a roadmap phase).
7. Show a summary and the list of open clarifications. **Stop** — do not plan yet.
   Recommend running `/clarify` next.
