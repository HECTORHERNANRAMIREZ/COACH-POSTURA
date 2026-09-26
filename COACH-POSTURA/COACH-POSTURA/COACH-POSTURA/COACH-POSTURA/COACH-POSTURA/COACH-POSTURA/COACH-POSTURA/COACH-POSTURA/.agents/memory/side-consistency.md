---
name: Consistencia izquierda/derecha
description: Regla de estado para detectar intercambios de lados de MediaPipe sin convertir un candidato en movimiento válido.
---

La referencia WORLD 3D de cada par debe actualizarse en el primer frame y en frames normales, pero permanecer congelada mientras el swap sea solo candidato. Al confirmar, la asignación persistente y los estados de One Euro/restricciones deben cambiar juntos.

**Why:** si un frame cruzado actualiza la referencia antes de confirmarse, el siguiente frame puede parecer normal y el intercambio estable nunca alcanza la histéresis; si los filtros downstream no cambian de estado, arrastran la historia del lado equivocado.

**How to apply:** comparar coste cruzado y sin cruzar contra la última asignación aceptada, ignorar pares con score bajo o separación insuficiente, confirmar tras frames consecutivos y reiniciar toda la máquina tras pérdida prolongada de pose.