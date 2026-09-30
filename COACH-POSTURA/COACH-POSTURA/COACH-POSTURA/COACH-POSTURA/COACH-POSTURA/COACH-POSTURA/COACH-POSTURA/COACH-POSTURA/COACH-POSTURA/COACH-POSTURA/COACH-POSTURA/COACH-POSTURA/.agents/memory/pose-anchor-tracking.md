---
name: Anclaje persistente de pose
description: Regla para conservar el vínculo entre las articulaciones detectadas y el cuerpo durante una sesión activa.
---

Después de la calibración completa, las articulaciones deben mantenerse asociadas al cuerpo mientras los puntos de anclaje del torso sigan dentro del encuadre. Una pérdida breve del detector no debe convertirse automáticamente en una pérdida de la pose ni en un bloqueo de ocho frames.

**Why:** El conteo de repeticiones depende de que muñecas, codos, hombros y caderas conserven su identidad entre frames. Una retención limitada por frames provoca que el sistema marque extremidades visibles como perdidas aunque el usuario siga dentro de la cámara.

**How to apply:** Aceptar nuevas detecciones confiables para actualizar la posición; durante pérdidas breves, propagar el movimiento desde el segmento proximal y usar una pose persistida. Liberar el anclaje cuando los puntos corporales base salgan del encuadre o al reiniciar/finalizar la sesión.

En el rastreador de dominadas, una pérdida momentánea de una extremidad no debe devolver una repetición ya armada desde `abajo` a `esperando abajo`. La fase debe conservarse y evaluar la subida con los datos válidos disponibles; si el usuario regresa sin alcanzar arriba, se debe emitir una evaluación negativa.

**Why:** El diagnóstico mostró que el rastreador estaba armado, pero un punto retenido hizo que `atBottom` fuera falso durante un frame. Eso canceló la transición posterior a `subiendo` y dejó los contadores sin evento.

**How to apply:** Mantener la máquina de estados armada durante pérdidas temporales y reservar el desarme para un reinicio real de la sesión o una pérdida confirmada de la pose base.