---
name: Restricciones de huesos
description: Regla de integración para detectar saltos imposibles en segmentos corporales sin duplicar la retención de pose.
---

Las longitudes de segmentos deben calcularse con coordenadas WORLD 3D crudas antes de One Euro. Un distal que se desvía de su referencia se entrega al filtro existente con `heldReason: 'bone-length'`; no se crea una segunda retención.

**Why:** medir después del suavizado puede ocultar saltos o contaminar la referencia, mientras que otra máquina de retención puede desincronizar `heldFrames`, el conteo y el feedback.

**How to apply:** calibrar con una ventana de muestras válidas, bloquear el segmento solo después del mínimo de muestras, reiniciar la calibración tras rechazos consecutivos persistentes y conservar el mismo tratamiento de baja confianza en overlay, encuadre y trackers.