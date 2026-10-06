---
name: Pose continuity safety
description: Safety rules for separating retained pose display from valid repetition measurement.
---

Retained pose data is suitable for visual continuity only. Counting and technique evaluation must require fresh points, a camera-ready frame, and renewed temporal stability after a pose gap or a bilateral coordinate crossing, except for the narrow uploaded-standard-push-up wrist exception below.

**Why:** A detector can preserve an anchored overlay while its points are stale, off-frame, or abruptly exchanged between symmetric landmarks. Treating that overlay as fresh data can create false repetition events.

**How to apply:** Keep anatomical assignments and measurement side locked independently from coordinates. Use short consecutive confirmation for implausible pair crossings, and gate repetition trackers and diagnostic events on fresh, unblocked, stable frames. Before tuning extremity thresholds, compare raw-model and filtered wrist/ankle samples; never treat retained overlay coordinates as fresh measurements.

For uploaded standard push-up video only, the tracker may bypass `countFrameReady` and `frameMeasurementBlocked` when the camera and view are ready, the pose is fresh, the angle is within the uploaded push-up endpoint range, shoulder/elbow/hip/ankle are fresh, and the wrist is held with score at least 0.8. No other tracked point may be held, and no other measurement blocker may be present. Do not apply this exception to live camera, other exercises, calibration, or other trackers.

**Why:** The user explicitly requested this narrow exception; the global low-confidence signal also marks the held wrist, so only its wrist-only case is eligible.

**How to apply:** Keep the general low-confidence and measurement-blocking behavior unchanged. Evaluate the wrist exception locally at the uploaded standard push-up tracker gate, and log whether its complete predicate passed.