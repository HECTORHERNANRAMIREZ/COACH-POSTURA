---
name: Pull-up change scope
description: Preserve already validated exercise behavior when changing the supine pull-up flow.
---

When working on `dominadas-supinas`, change only what is necessary for that variant. Preserve the validated behavior of `dominadas`, `dominadas-comando`, and all other exercises.

**Why:** The user stated that those exercises are already validated and must keep their behavior exactly the same.

**How to apply:** Treat this as a scope constraint for future changes touching supine pull-ups; expand only the necessary supine-specific gates.
