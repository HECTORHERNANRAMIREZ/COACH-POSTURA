---
name: Muscle-up tracking isolation
description: Keep muscle-up-only telemetry separate from measurement and other exercise paths.
---

For muscle-up diagnostic changes, keep all new point reads, counters, and summaries behind the exact `muscle-up` identity. Do not feed extra landmarks into counting, camera readiness, calibration, prevalidation, or measurement-blocking logic, and do not change other exercises or thresholds.

**Why:** the user explicitly requires muscle-up instrumentation to remain observational and all other exercises to keep their current results.

**How to apply:** inspect the diff for writes to shared trackers or decision inputs; telemetry may read those values, but must not alter them.
