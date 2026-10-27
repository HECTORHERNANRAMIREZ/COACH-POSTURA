---
name: Pose model fallback
description: Regla de transición entre modelos MediaPipe durante una sesión de cámara
---

La degradación de heavy a full debe ocurrir sin detener la cámara, con una sola transición activa, timestamps estrictamente crecientes y reinicio coordinado de los filtros de landmarks.

**Why:** MediaPipe rechaza timestamps que retroceden y los estados de One Euro, huesos y lados pueden conservar referencias incompatibles cuando cambia el modelo.

**How to apply:** Mantener el modelo/delegate activo en el detector, bloquear nuevas detecciones mientras se crea el reemplazo, conservar full hasta la siguiente sesión y recalibrar las Fases 1–4 después del cambio.