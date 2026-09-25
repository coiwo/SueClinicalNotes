---
name: myvirtualassistant-changelog
description: "Create or update the current SueClinicalNotes task's changelog using Sue's required template. Use when asked to record changes; does not commit or push."
---

# myvirtualassistant-changelog

Locate the active SueClinicalNotes repository with `git rev-parse --show-toplevel` from the user's workspace. If unavailable, walk upward from this skill or the instructions directory and verify package.json names `sue-clinical-notes` alongside src/ and prisma/. Do not assume a fixed absolute path. The handoff app under docs is archived. Read root AGENTS.md and docs/app-building-virtual-assistant/AGENTS.md, applying the existing-project rules rather than restarting discovery or setup. Use the user's language and preserve unrelated work. Paths below are repository-relative.

Read docs/Sue's changelogs/README.txt and TEMPLATE.txt. Inspect the current task context, Git status and diffs, relevant untracked files, and existing task entries. Do not treat all pre-existing changes as part of this task. If scope remains unclear, ask one focused question.

Create one YYYY-MM-DD-short-description.txt entry per coherent task in docs/Sue's changelogs/, using the actual local date. Update the same task's entry instead of creating duplicates; use a numeric suffix if an unrelated entry has the same filename. Complete the template fields and sections, preserving their order. Invocation authorizes this writing without another permission question.

Describe only evidenced changes and actual check results. Mark unrun checks, unfinished work, and unconfirmed user review honestly. Do not invent commit IDs, successful tests, or authorship. Exclude passwords, tokens, private database contents, and real patient details.

Check the entry's content and formatting, then link it in the handoff. Do not stage, commit, push, or merge based on this invocation alone, or infer that Sue is finished for the day.
