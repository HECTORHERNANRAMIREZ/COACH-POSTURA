---
name: Uploaded video playback
description: Performance constraint for pose analysis of uploaded exercise videos.
---

Uploaded exercise videos must keep normal playback independent from pose inference. Synchronous pose detection on every source frame can block the browser's main thread and make the video appear slow; analyze a resized detector frame at a bounded cadence and prefer the faster model for uploaded clips. Keep the export canvas below 4K unless full source resolution is explicitly required.

**Why:** The diagnostic buffer showed many repeated video timestamps while heavy per-frame inference was running, so the player advanced much more slowly than the source video. A supplied clip was 3840×2160, which also made full-resolution canvas capture unnecessarily expensive.

**How to apply:** Keep uploaded-video analysis on a bounded cadence (currently 12 readings per second), resize the detector input to about 1280×720, and capture the processed output around 1920×1080. Do not duplicate full-resolution canvas work on skipped source frames. Live camera analysis can retain its separate higher-fidelity path.