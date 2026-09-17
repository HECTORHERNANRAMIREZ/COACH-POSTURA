---
name: Calibración por referencia
description: Principio para ajustar tolerancias de ejercicios a partir de una ejecución correcta capturada por la cámara
---

La calibración debe comenzar con una ejecución correcta completa del ejercicio. La app debe conservar la secuencia temporal de los ángulos observados, separar el rango medido del margen de tolerancia y dejar la decisión final lista para revisión de una IA; no debe convertir automáticamente un rango genérico en una regla definitiva. En ejercicios bilaterales, la validación debe considerar cada lado y cada articulación relevante, con rangos distintos para las fases inicial, superior y de regreso.

**Why:** Ver solo el ángulo actual no permite distinguir las fases inicial, activa y final ni separar el movimiento válido del ruido de cámara. Una dominada puede tener un codo dentro del rango y aun así no completar el recorrido con el otro brazo o con la cabeza.

**How to apply:** Para cada ejercicio, captura muestras estables desde el inicio hasta el final, exporta articulaciones, lados, lecturas y rangos observados, y revisa cualquier tolerancia sugerida antes de aplicarla al contador.