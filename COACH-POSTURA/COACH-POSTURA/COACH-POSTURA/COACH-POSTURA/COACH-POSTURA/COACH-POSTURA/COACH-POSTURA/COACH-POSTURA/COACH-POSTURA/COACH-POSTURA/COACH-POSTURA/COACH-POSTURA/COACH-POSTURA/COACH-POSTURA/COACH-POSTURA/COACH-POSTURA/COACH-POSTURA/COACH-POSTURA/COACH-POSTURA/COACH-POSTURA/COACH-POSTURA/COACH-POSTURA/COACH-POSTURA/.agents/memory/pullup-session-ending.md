---
name: Pull-up session ending
description: The bar-release detector must distinguish a true release from the flexed top position.
---

The pull-up session-ending detector must require evidence of an extended bottom position in addition to wrists dropping below the shoulders/head. If a detached-bar posture appears while the tracker is in `subiendo`, block the tracker instead of allowing it to emit a repetition. Wrist height alone can be misread both at the flexed top and while the athlete is stepping away.

**Why:** In the reference recordings, flexed elbows once froze the counter at the top, and stepping away later produced a false extra repetition because the tracker was still in `subiendo`.

**How to apply:** Preserve the bottom-position gate whenever changing pull-up counting or automatic session completion logic; do not broaden the detector based only on 2D wrist/head relations.

**Confirmation:** A later five-repetition test stayed at 5 after the athlete left the bar and finalized without adding a sixth repetition.