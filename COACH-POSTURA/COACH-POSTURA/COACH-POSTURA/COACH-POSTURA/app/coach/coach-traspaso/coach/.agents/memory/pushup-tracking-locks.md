---
name: Push-up tracking lock semantics
description: The intended boundary between stable landmark identity and live movement in standard push-up tracking.
---

For standard push-ups, lock anatomical landmark assignments and the chosen measurement side after initial body detection, but never freeze screen coordinates. Continue following real movement and hold only implausible, unconfirmed jumps.

**Why:** Users move from the initial detection pose into push-up position. Frozen coordinates would prevent exercise tracking, while changing anatomical assignments mid-session can make extremities jump and corrupt angle measurements.

**How to apply:** Keep identity/side stable across setup and repetitions, preserve live coordinate updates, and reset locks only when the exercise session or camera tracking is deliberately reset.