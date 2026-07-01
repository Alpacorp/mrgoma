---
description: SDD step 6 — implement the feature task by task, enforcing the DoD
---

You are running the **/implement** step of our SDD workflow.

Operate on the feature of the current git branch (`feat/NNN-slug`). Do **not**
start until `/analyze` is clean.

Do this:

1. Read the feature's `spec.md`, `plan.md`, `tasks.md` and the constitution.
2. If this feature builds or changes UI, consult the **modern-web-guidance** skill
   FIRST (our rule for frontend work).
3. Work through `tasks.md` in order. After finishing each task, check its box in
   `tasks.md`. Keep changes small.
4. Enforce the **Definition of Done** before finishing:
   `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build` — all green;
   add/adjust tests for new logic; note a manual behavior check for UI.
5. Verify every acceptance criterion in `spec.md` is met.
6. Commit locally with a clear message. **Never** add a `Co-Authored-By` line. Do
   **not** push — leave the push to me.
7. Summarize what changed and what I should verify.
