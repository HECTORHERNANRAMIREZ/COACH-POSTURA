---
name: Uploaded video playback
description: Performance constraint for pose analysis of uploaded exercise videos.
---

Uploaded exercise videos must keep normal playback independent from pose inference. Synchronous pose detection on every source frame can block the browser's main thread and make the video appear slow; analyze at a bounded cadence and prefer the faster model for uploaded clips.

**Why:** The diagnostic buffer showed many repeated video timestamps while heavy per-frame inference was running, so the player advanced much more slowly than the source video.

**How to apply:** Keep uploaded-video analysis on a bounded cadence (currently 12 readings per second) and do not duplicate full-resolution canvas work on skipped source frames. Live camera analysis can retain its separate higher-fidelity path.