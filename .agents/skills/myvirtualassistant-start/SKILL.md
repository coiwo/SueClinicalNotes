---
name: myvirtualassistant-start
description: "Resume development of the existing SueClinicalNotes app using its project instructions, recent changes, and daily Git workflow. Use when Sue wants to begin or continue a work session."
---

# myvirtualassistant-start

Locate the active SueClinicalNotes repository with `git rev-parse --show-toplevel` from the user's workspace. If unavailable, walk upward from this skill or the instructions directory and verify package.json names `sue-clinical-notes` alongside src/ and prisma/. Do not assume a fixed absolute path. The handoff app under docs is archived. Read root AGENTS.md and docs/app-building-virtual-assistant/AGENTS.md, applying the existing-project rules rather than restarting discovery or setup. Use the user's language and preserve unrelated work. Paths below are repository-relative.

Read README.md, package.json, docs/app-building-virtual-assistant/project-plan.md, and recent entries in docs/Sue's changelogs/. Inspect Git status, current branch, recent commits, and relevant active source before describing progress. Distinguish recorded claims from verified implementation.

Briefly summarize where work stopped. If a task is supplied, continue it; otherwise ask what Sue wants to work on. Follow the guide's start-of-session Git planning once, respecting choices already given. Use docs/local-setup-instructions.txt for testing and docs/git-instructions.txt for Git operations. Do not reinstall dependencies or create another app merely to resume.

Record completed changes using the changelog template and follow the guide's natural wrap-up workflow. Starting a session alone does not authorize commit, push, or merge. If the user instead requests a progress review with confirmation, perform that review and wait before implementation.
