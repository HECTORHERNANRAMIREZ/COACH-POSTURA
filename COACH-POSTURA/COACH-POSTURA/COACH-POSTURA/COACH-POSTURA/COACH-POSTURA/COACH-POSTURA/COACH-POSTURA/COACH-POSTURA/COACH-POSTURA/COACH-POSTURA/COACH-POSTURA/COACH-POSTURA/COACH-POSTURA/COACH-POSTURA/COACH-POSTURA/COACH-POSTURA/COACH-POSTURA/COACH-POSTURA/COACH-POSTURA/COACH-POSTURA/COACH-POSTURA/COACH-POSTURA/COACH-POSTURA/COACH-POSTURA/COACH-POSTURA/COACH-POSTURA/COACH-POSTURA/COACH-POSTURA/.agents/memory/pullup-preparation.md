---
name: Pull-up preparation flow
description: Product decision for safely starting standard pull-up tracking.
---

Standard pull-up tracking should not begin when the user first presses start. The system first needs a stable full-body scan, then gives the user a short automatic countdown to get onto the bar; only after that countdown does the active exercise state and repetition/technique monitoring begin. Once active, the tracker must also stabilize the bottom position and require a meaningful elbow-angle change before arming a repetition.

**Why:** The previous flow mixed pose registration with active exercise tracking, causing unstable landmarks, false starts, and confusing repetition state. Small pose fluctuations immediately after activation could otherwise be counted as an incomplete repetition.

**How to apply:** Keep preparation and active tracking as separate states. Do not count repetitions or mark technique during either preparation stage.