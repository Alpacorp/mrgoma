---
description: SDD step 2 — resolve open questions in the current feature's spec
---

You are running the **/clarify** step of our SDD workflow (the gate before
planning).

Operate on the feature of the current git branch (`feat/NNN-slug`). If it can't
be determined, ask which feature to clarify.

Do this:

1. Read that feature's `spec.md` and the constitution (`spec/*.md`).
2. Find every `[NEEDS CLARIFICATION]` marker, plus any ambiguity, missing
   acceptance criterion, untested edge case, or unstated assumption.
3. Ask the open questions with the **AskUserQuestion** tool — grouped (max 4 at a
   time), most impactful first, with concrete options where possible.
4. Update `spec.md` with the answers and remove the resolved markers. Tighten the
   acceptance criteria so each is testable.
5. Repeat until there are no blocking unknowns. Then say the spec is ready for
   `/plan`.

Do not write any plan or code here.
