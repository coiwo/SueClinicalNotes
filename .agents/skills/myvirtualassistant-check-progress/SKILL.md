---
name: myvirtualassistant-check-progress
description: "Review actual SueClinicalNotes code, Git state, plans, and changelogs to reestablish progress; obtain user confirmation before continuing implementation. Use for a progress-check handoff."
---

# myvirtualassistant-check-progress

Locate the active SueClinicalNotes repository with `git rev-parse --show-toplevel` from the user's workspace. If unavailable, walk upward from this skill or the instructions directory and verify package.json names `sue-clinical-notes` alongside src/ and prisma/. Do not assume a fixed absolute path. The handoff app under docs is archived. Read root AGENTS.md and docs/app-building-virtual-assistant/AGENTS.md, applying the existing-project rules rather than restarting discovery or setup. Use the user's language and preserve unrelated work. Paths below are repository-relative.

Perform a read-only review of README.md, package.json, docs/app-building-virtual-assistant/project-plan.md, relevant recent changelogs, Git status/current branch/recent commits/pending diffs, and relevant current source and tests. Inspect meaningful untracked work without reading private credentials or patient data. Compare implemented behavior with recorded progress and call out discrepancies. Do not treat the presence of tests as evidence they have passed.

Summarize implemented work, checks actually evidenced, unfinished work, uncertainties, and a specific suggested next step. Ask the user to confirm or correct this understanding and approve that next step. In Chinese, for example: “这是我核对代码和 changelog 后理解的进度。是否准确？有没有遗漏？确认后，我可以先做［具体下一步］吗？”

Wait for the user's reply. During this review, do not edit files, create a changelog, install dependencies, run migrations or tests with side effects, commit, or push. Silence is not confirmation. If corrections leave the next step unclear, clarify before proceeding. Approval of development work does not by itself authorize upload or merging. This confirmation checkpoint is specifically requested for this workflow.
