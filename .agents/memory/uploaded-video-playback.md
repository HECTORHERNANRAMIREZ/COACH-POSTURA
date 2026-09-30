---
name: Uploaded video playback
description: Performance constraint for pose analysis of uploaded exercise videos.
---

Uploaded exercise videos must keep normal playback independent from pose inference. Use a dedicated worker for uploaded-video pose detection; send resized transferable frames and avoid redundant processed-canvas draws. Other uploaded exercises can analyze at 12 readings per second while playback continues.

For standard push-up exports, use two passes: first analyze the paused clip from its beginning at 20 samples per second with the already locked anatomical calibration; then replay at 1× to render the cached pose, angle, and counter samples without running inference. Require sufficient stable measurement coverage before starting the recording, and never expose a partial download after cancellation or failure. Composite at the source video's native dimensions and request a pixel-scaled bitrate; exact source codec quality cannot be guaranteed.

**Why:** Synchronous inference and canvas composition can slow playback and leave too few pose readings to count short movements reliably. Separating push-up analysis from recording gives the counter a complete timeline without slowing the final video; browser re-encoding still cannot guarantee identical quality.

**How to apply:** For other uploaded clips, initialize the faster full model in a worker and transfer detector-sized frames around 1280×720 at 12 readings per second. For standard push-ups, scan the paused clip at 20 samples per second, preserve locked side assignments while requiring fresh stable frames, and then record a separate 1× playback using timeline-matched samples. Preserve native dimensions and use a bitrate proportional to pixel count only for standard push-up exports; capture independently of inference and do not composite a source frame twice. Native high-resolution exports use more memory and can be browser-limited. If worker initialization fails, log the cause and fall back to the same faster model on the main thread so the exercise remains usable; preserve a visible warning that playback may stutter. Live camera analysis can retain its separate higher-fidelity path.