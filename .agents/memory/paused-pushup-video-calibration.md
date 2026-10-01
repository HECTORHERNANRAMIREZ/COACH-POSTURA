---
name: Paused push-up video calibration
description: Calibration and playback sequencing for uploaded standard push-up videos.
---

For uploaded standard push-up clips, keep playback paused while identifying and locking the body's landmarks and measurement side. After calibration, resume analysis from the start of the clip. Use animation-frame polling for paused-frame detection because video-frame callbacks do not continue while a clip is paused; stop polling once calibration is complete until playback begins. Clear preflight diagnostics and reset the source-time throttle when playback starts so the first report represents the clip from its beginning.

While calibration is pending, avoid a fixed playback delay. Show a remaining-time count only while fresh calibration points are stable; otherwise show that the body is still being detected. Keep playback controls unavailable until calibration is ready.

**Why:** Reproducing the clip during calibration skips its opening repetitions, and mixing calibration frames into the playback report hides whether the opening transition was analyzed. A stable paused frame allows calibration without advancing the source video. Calibration duration varies with detection quality, so a fixed delay can either be too short or make the user wait unnecessarily.

**How to apply:** Limit this behavior to uploaded standard push-up videos. Preserve the live-camera preparation flow and other uploaded exercise flows. If calibration used a later visible frame, seek back to the beginning before starting the count, preserve any fresh bottom-range reading from preflight, and restart throttled analysis at the first playback timestamp. Use the live calibration countdown when available; do not invent an ETA while body detection is still pending.