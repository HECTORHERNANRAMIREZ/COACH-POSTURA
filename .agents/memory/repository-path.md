---
name: Repository path in workspace
description: Workspace and Git path handling for the posture-coach repository.
---

The checked-out repository is reached through `~/workspace/p`, a symlink to a deeply nested directory. Shell commands should run from `cd ~/workspace/p`. `apply_patch` paths are relative to the workspace root, so prefix repository paths with `p/`; using repository-relative paths from the workspace root can create files outside the Git repository.

**Why:** The workspace root and repository root differ, so changes must land in the nested Git repository rather than alongside it.

**How to apply:** Before patching, use `p/<repository-relative-path>` and verify the result with `git -C ~/workspace/p status --short`.
