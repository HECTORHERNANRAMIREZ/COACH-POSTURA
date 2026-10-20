---
name: Pull-up change scope
description: Preserve already validated exercise behavior when changing the supine pull-up flow.
---

Limita los cambios solicitados de dominadas a los videos subidos de `dominadas` y `dominadas-supinas`. Mantén intactos el modo cámara en vivo, `dominadas-comando`, los demás ejercicios, el conteo/tracker, los ángulos, umbrales, detector, muestreo, filtros y CSS. Si hace falta volver al inicio del video, usa un callback exclusivo de esos dos ejercicios y no modifiques funciones de reinicio ni callbacks de otros ejercicios.

**Why:** El usuario indicó que el comportamiento ya validado no debe cambiar fuera de la búsqueda previa de esos dos ejercicios en video subido.

**How to apply:** Antes de editar una ruta de dominadas, comprobar que está protegida por video subido y por el selector exacto de dominadas estándar/supinas. No ampliar el cambio a modo en vivo, dominadas-comando ni otros ejercicios.
