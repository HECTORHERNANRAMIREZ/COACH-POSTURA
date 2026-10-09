---
name: Squat counter thresholds
description: Preserve the distinction between motion rejection and squat-depth classification.
---

A cycle needs movement greater than twice the 5° tolerance to qualify as an exercise cycle. Once qualified, classify its valley against the tolerant depth boundaries; count shallow cycles as incorrect instead of dropping them.

**Why:** bounded ±3° oscillation can pass phase hysteresis and look like a cycle. A separate minimum-motion check rejects that noise without losing genuine but shallow repetitions.

**How to apply:** when changing the squat tracker or its synthetic tests, keep motion rejection separate from depth classification and do not tune either from a specific video.
