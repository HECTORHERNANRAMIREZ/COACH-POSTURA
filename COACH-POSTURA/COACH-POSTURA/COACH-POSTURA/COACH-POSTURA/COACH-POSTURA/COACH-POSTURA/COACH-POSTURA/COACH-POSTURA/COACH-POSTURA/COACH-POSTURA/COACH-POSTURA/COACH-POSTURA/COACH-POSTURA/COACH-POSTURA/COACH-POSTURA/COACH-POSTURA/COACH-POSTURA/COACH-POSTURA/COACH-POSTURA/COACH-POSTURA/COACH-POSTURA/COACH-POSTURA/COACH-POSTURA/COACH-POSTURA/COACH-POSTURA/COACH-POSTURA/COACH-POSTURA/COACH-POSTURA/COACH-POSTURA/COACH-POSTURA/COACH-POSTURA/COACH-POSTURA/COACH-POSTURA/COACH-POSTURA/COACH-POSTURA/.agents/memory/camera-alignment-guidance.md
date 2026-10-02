---
name: Camera alignment guidance
description: Regla para no iniciar ni contar ejercicios cuando la cámara no ve las articulaciones necesarias.
---

La detección de una persona no basta para habilitar el conteo: cada ejercicio debe validar las articulaciones que necesita y el margen del encuadre antes de comenzar o sumar repeticiones.

**Why:** Una pose parcialmente visible puede producir ángulos aparentemente válidos y bloquear el ejercicio sin explicar que el problema es la cámara.

**How to apply:** Mantén la guía visible para el usuario, pausa el conteo mientras falten puntos o estén pegados al borde y conserva un criterio específico por ejercicio para no exigir articulaciones irrelevantes.

Para los grados articulares, usa únicamente las coordenadas 3D de BlazePose. Si un punto no tiene coordenadas 3D válidas, muestra la lectura como no disponible y pausa el contador; no recurras a coordenadas de píxel como sustituto.

**Why:** Un ángulo 2D depende de la perspectiva, la altura y la inclinación del móvil, mientras que el producto punto de los vectores 3D mantiene el ángulo ante rotaciones y cambios de escala de la cámara.

**How to apply:** Centraliza todos los cálculos de ángulo y sus validaciones en mediciones 3D, y comunica explícitamente al usuario cuándo la detección todavía está calibrando.