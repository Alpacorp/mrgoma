---
description: SDD step 5 — consistency check across spec, plan and tasks
---

You are running the **/analyze** step of our SDD workflow (the consistency gate
before implementing).

Operate on the feature of the current git branch (`feat/NNN-slug`).

Do this:

1. Read the feature's `spec.md`, `plan.md`, `tasks.md` and the constitution.
2. Cross-check for:
   - acceptance criteria with no covering task,
   - tasks not traceable to the spec (scope creep),
   - plan steps that violate `tech-stack.md` conventions,
   - missing tests or verification,
   - remaining ambiguity or `[NEEDS CLARIFICATION]`.
3. Report findings as a short table: **issue · severity · where · fix**.
4. If there are blocking inconsistencies, propose concrete edits to
   spec/plan/tasks and apply them after I confirm. If everything is consistent,
   say it's ready for `/implement`.

Do not write feature code here.
