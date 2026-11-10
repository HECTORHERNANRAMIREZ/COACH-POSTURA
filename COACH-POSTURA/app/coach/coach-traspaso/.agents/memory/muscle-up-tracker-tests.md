---
name: Muscle-up tracker tests
description: Running tracker node:test files in the Vite application environment.
---

Run tracker tests through Vite's SSR module loader, with `PORT` and `BASE_PATH` set. Plain `tsx` does not provide the app's `import.meta.env` values, even when given the package tsconfig.

Set `NODE_ENV=production` when creating the Vite middleware server for tests so the Replit-only Cartographer and development-banner plugins are skipped. Those plugins can add a development port mapping to the workspace `.replit`.

**Why:** Direct `tsx` runs failed on Vite aliases and `import.meta.env`; Vite SSR ran the tests, but the Replit development plugin added an unrelated port entry.

**How to apply:** Use Vite SSR to load the test module, close the middleware server, and verify `.replit` was not changed.
