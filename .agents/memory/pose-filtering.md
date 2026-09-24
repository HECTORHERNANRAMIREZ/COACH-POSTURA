---
name: Filtrado de pose
description: Regla de separación entre el suavizado espacial de landmarks y el suavizado posterior de ángulos en NetPosture.
---

El filtrado de landmarks debe hacerse con un One Euro independiente por landmark y eje, usando timestamps reales entre frames. El suavizado por mediana puede mantenerse después, únicamente para lecturas de ángulos y transiciones de repetición.

**Why:** combinar el One Euro con una interpolación adicional de puntos introduce retraso doble y puede desplazar los umbrales temporales de las repeticiones. La mediana de ángulos cumple una función distinta: estabiliza lecturas derivadas y no debe reemplazar ni duplicar el filtro espacial.

**How to apply:** cualquier fase posterior que ajuste la estabilidad de pose debe cambiar los perfiles One Euro o los buffers de ángulos por separado; antes de añadir otro suavizado, verificar si actúa sobre landmarks o sobre mediciones derivadas.