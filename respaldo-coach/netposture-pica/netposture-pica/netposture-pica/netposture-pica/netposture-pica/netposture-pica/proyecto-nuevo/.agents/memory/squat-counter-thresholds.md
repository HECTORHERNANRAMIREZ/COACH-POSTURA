---
name: Squat counter thresholds
description: Preserve the distinction between motion rejection and squat-depth classification.
---

A cycle needs movement greater than twice the 5° tolerance to qualify as an exercise cycle. Once qualified, depth classification has only a maximum knee-angle threshold with tolerance; any lower valley is sufficiently deep.

**Why:** bounded ±3° oscillation can pass phase hysteresis and look like a cycle, while a deeper-than-target squat should not be penalized. A separate minimum-motion check rejects noise without making depth a two-sided range.

**How to apply:** when changing the squat tracker or its synthetic tests, keep motion rejection separate from depth classification, classify shallow cycles as incorrect instead of dropping them, and do not tune either from a specific video.
