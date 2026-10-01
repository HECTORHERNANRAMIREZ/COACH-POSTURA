---
name: Pose continuity safety
description: Safety rules for separating retained pose display from valid repetition measurement.
---

Retained pose data is suitable for visual continuity only. Counting and technique evaluation must require fresh points, a camera-ready frame, and renewed temporal stability after a pose gap or a bilateral coordinate crossing.

**Why:** A detector can preserve an anchored overlay while its points are stale, off-frame, or abruptly exchanged between symmetric landmarks. Treating that overlay as fresh data can create false repetition events.

**How to apply:** Keep anatomical assignments and measurement side locked independently from coordinates. Use short consecutive confirmation for implausible pair crossings, and gate repetition trackers and diagnostic events on fresh, unblocked, stable frames. Before tuning extremity thresholds, compare raw-model and filtered wrist/ankle samples; never treat retained overlay coordinates as fresh measurements.