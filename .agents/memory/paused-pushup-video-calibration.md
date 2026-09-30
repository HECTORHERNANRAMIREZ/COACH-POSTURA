---
name: Paused push-up video calibration
description: Calibration and playback sequencing for uploaded standard push-up videos.
---

For uploaded standard push-up clips, keep playback paused while identifying and locking the body's landmarks and measurement side. After calibration, resume analysis from the start of the clip. Use animation-frame polling for paused-frame detection because video-frame callbacks do not continue while a clip is paused; stop polling once calibration is complete until playback begins.

**Why:** Reproducing the clip during calibration skips its opening repetitions. A stable paused frame allows calibration without advancing the source video.

**How to apply:** Limit this behavior to uploaded standard push-up videos. Preserve the live-camera preparation flow and other uploaded exercise flows. If calibration used a later visible frame, seek back to the beginning before starting the count.