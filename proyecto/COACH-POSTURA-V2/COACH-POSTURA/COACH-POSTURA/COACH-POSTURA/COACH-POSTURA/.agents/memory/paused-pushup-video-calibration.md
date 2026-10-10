---
name: Uploaded push-up video preflight
description: Pre-count detection and playback sequencing for regular and declined push-up uploads.
---

For uploaded regular and declined push-up clips, complete the existing body-detection preflight before counting, save the measurement side, reset counts, and analyze again from the beginning of the clip. Clear preflight diagnostics and reset source-time throttles so measurements from the preflight are not treated as repetitions in the replay.

While calibration is pending, avoid a fixed playback delay. Show a remaining-time count only while fresh calibration points are stable; otherwise show that the body is still being detected. Keep playback controls unavailable until calibration is ready.

**Why:** Reproducing the clip during calibration skips its opening repetitions, and mixing calibration frames into the playback report hides whether the opening transition was analyzed. Calibration duration varies with detection quality, so a fixed delay can either be too short or make the user wait unnecessarily.

**How to apply:** Limit this behavior to uploaded regular and declined push-up videos. Preserve the live-camera preparation flow and other uploaded exercise flows. Keep detection and gap handling video-agnostic: never tune thresholds to one clip or introduce new numeric constants for an individual video. After detection on a later frame, seek back to the beginning before counting. Do not require the exercise's starting pose as part of body-detection preflight.