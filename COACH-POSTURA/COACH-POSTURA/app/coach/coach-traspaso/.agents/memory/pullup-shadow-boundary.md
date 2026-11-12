---
name: Pull-up shadow boundary
description: Scope guardrails for pull-up diagnostics that must not affect repetition counts.
---

For pull-up shadow-diagnostic work, do not modify `pullup-tracker.ts`, `constants/pullup.ts`, `pullup-incorrect-rules.ts`, or `view-estimation.ts` unless the user explicitly authorizes it. Keep shadow diagnostics separate from the existing correct/incorrect routes and total, correct, incorrect, and pending counters.

**Why:** The user states that preserving already-working repetition counting and route behavior is the highest priority.

**How to apply:** Add observability in a separate shadow path, and make sure its state and output cannot affect tracker decisions or counters.
