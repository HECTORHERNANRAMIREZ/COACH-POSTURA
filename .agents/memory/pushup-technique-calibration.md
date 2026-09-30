---
name: Push-up technique calibration
description: Decision about validating standard push-up technique from the 3D elbow–torso and body-line readings.
---

For standard side-view push-ups, the accepted elbow–torso range must account for the 3D perspective produced by the pose model. A correct real session produced elbow–torso readings around 68–77° with body-line readings around 163–174°, so the effective regular range is 0–80° for the elbow–torso measure while body alignment remains 162–180°.

**Why:** The previous narrow elbow range rejected every visually correct repetition in a real session even though the body-line criterion passed. Sparse uploaded-video samples can also be smoothed above the valid bottom threshold even when a fresh, stable raw reading reached it.

**How to apply:** When recalibrating this exercise, use real correct-session samples and keep the body-line constraint independent. Do not loosen pose freshness, camera readiness, stability, or repetition-counting guards to compensate for a technique threshold mismatch. For standard push-ups, let an in-range raw angle register the bottom only after the existing stable, camera-ready repetition-frame gate passes; keep technique validation and the return-to-start check. For regular uploaded push-ups with techniqueMustHoldThroughout disabled, evaluate technique on the return frame rather than letting an isolated intermediate body-line reading invalidate the repetition. When a clip is seeded at the bottom, require the return to pass the activation threshold before counting so smoothing cannot count the same rise twice.