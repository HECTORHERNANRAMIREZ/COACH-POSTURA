---
name: Vite source tests
description: Testing Vite-transformed TypeScript modules without leaving workspace config changes.
---

Direct `tsx` execution does not provide Vite's `import.meta.env` transform, so importing source modules that read `import.meta.env` can fail. In this project, creating Vite in middleware mode also added a port mapping to `.replit`.

**Why:** A test harness can cause unrelated workspace configuration changes even when it does not listen on a port.

**How to apply:** Prefer tests that do not boot Vite. If Vite SSR is necessary, inspect `.replit` after testing and remove only confirmed test-generated changes through the Replit configuration validator.
