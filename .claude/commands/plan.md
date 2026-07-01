---
description: SDD step 3 — write the technical plan (HOW) for the current feature
---

You are running the **/plan** step of our SDD workflow.

Operate on the feature of the current git branch (`feat/NNN-slug`).

Do this:

1. Read the feature's `spec.md` and the whole constitution (`spec/*.md`). The plan
   MUST comply with `tech-stack.md` conventions.
2. If `spec.md` still has unresolved `[NEEDS CLARIFICATION]`, stop and tell me to
   run `/clarify` first.
3. Explore the actual codebase to ground the plan — **reuse before creating**:
   existing components, endpoints, param names and patterns.
4. Create `spec/features/NNN-slug/plan.md` from `spec/features/_templates/plan.md`:
   technical approach, reused pieces, exact files to add/change, data & flow,
   tradeoffs/alternatives, risks, and an acceptance-criteria → implementation
   table (how each AC is met AND tested).
5. Summarize the plan and **stop** — do not write tasks or code yet. Recommend
   `/tasks` next.
