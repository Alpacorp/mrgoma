---
description: SDD step 4 — break the plan into small, verifiable tasks
---

You are running the **/tasks** step of our SDD workflow.

Operate on the feature of the current git branch (`feat/NNN-slug`).

Do this:

1. Read the feature's `spec.md` and `plan.md`.
2. Create `spec/features/NNN-slug/tasks.md` from the template: an ordered list of
   **very small, independently verifiable** tasks (checkboxes). Each task states a
   single concrete change, the files it touches, and its check (the test or
   behavior that proves it done).
3. Order by dependency; keep each task to roughly one sitting. Include a task to
   add/adjust tests and a final Definition-of-Done task
   (tsc + lint + tests + build + manual check).
4. Add a traceability table mapping tasks back to acceptance criteria — every
   criterion must be covered.
5. Summarize and **stop** — do not implement yet. Recommend `/analyze` next.
