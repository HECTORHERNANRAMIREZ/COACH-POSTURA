---
name: Pull-up anchoring
description: Durable behavior rule for the pull-up session tracker.
---

For the standard pull-up flow, anchoring protects the detection state from transient confidence or framing loss; it must not freeze coordinates or angle measurements. Recovered live keypoints continue feeding the existing repetition tracker.

**Why:** Users may need to walk to the screen after calibration, and repetition counting must still reflect real movement after they return to frame.

**How to apply:** Keep calibration persistence and active-session retention separate from the existing angle ranges, endpoint conditions, and repetition state machine.