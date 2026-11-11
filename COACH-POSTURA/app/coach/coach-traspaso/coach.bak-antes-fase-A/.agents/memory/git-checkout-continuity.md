---
name: Git checkout continuity
description: Branch and baseline-tag checks for continuing phase-based work after artifact metadata changes.
---

For phased work in this project, verify the requested Git branch and baseline tag again before editing after a turn boundary. Stop if they do not match rather than continuing on another branch.

**Why:** an artifact metadata update was followed by a newly initialized checkout that retained the refactored source but lacked the prior branch and commit history; the user then established the intended working branch and baseline tag.

**How to apply:** from `~/workspace/p`, check `git branch --show-current` and the expected tag before making changes. Do not assume the previous turn's commit or branch is still active.

For `git show HEAD:<path>` checks, resolve the tracked path instead of assuming the worktree-relative path is valid in Git's tree.

**Why:** the nested checkout can have a Git-tree path prefix that differs from the path used from `~/workspace/p`, causing scripted line-count checks to fail before evaluating the code.

**How to apply:** use `git ls-files --full-name -- <worktree-relative-path>` and pass that exact result to `git show HEAD:<path>`.
