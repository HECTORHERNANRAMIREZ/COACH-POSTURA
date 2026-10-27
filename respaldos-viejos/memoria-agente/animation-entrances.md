---
name: Entradas escalonadas
description: Regla para animaciones secuenciales de contenido en el frontend
---

Cuando una entrada usa `animation-fill-mode: backwards`, los elementos deben conservar `opacity: 1` como estado base. El estado inicial oculto debe vivir únicamente en el primer frame de la animación.

**Why:** Una opacidad base de 0 puede dejar el contenido invisible después de que termina la animación, aunque el preview no muestre errores.

**How to apply:** Para entradas desde izquierda o derecha, usa el retraso con `backwards`, define la opacidad base en 1 y conserva `prefers-reduced-motion` para accesibilidad.