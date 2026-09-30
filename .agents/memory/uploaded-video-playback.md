---
name: Uploaded video playback
description: Performance constraint for pose analysis of uploaded exercise videos.
---

Uploaded exercise videos must keep normal playback independent from pose inference. Run pose detection in a dedicated worker so synchronous MediaPipe inference cannot block playback or rendering on the main thread. Keep analysis bounded, send resized transferable frames, and avoid redundant processed-canvas draws. For standard push-up exports, composite at the source video's native dimensions and request a pixel-scaled bitrate; other exercise exports may remain capped around 1920×1080.

**Why:** A later diagnostic advanced at nearly real-time wall-clock speed but provided only about 5.7 pose readings per second, indicating that main-thread inference and repeated canvas composition could still cause visual stutter and miss movement phases even after analysis was throttled. Push-up downloads also need to preserve the source frame size as closely as browser-side canvas re-encoding allows; exact source codec quality cannot be guaranteed.

**How to apply:** For uploaded clips, initialize the faster full model in a worker, transfer detector-sized frames around 1280×720, and cap analysis at 12 readings per second. Preserve native dimensions and use a bitrate proportional to pixel count only for standard push-up exports; capture independently of inference and do not composite a source frame twice. Native high-resolution exports use more memory and can be browser-limited. If worker initialization fails, log the cause and fall back to the same faster model on the main thread so the exercise remains usable; preserve a visible warning that playback may stutter. Live camera analysis can retain its separate higher-fidelity path.