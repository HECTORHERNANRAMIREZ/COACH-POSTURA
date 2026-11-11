---
name: Separación del tracker de muscle-up
description: Regla del proyecto para mantener independientes la detección de repeticiones correctas e incorrectas.
---

El contador de repeticiones correctas de muscle-up debe usar la posición de la cabeza: la cabeza debe superar el codo y la muñeca, con un margen proporcional al torso respecto a la muñeca. Basta un cuadro claro de esa posición; la repetición se cuenta al regresar al fondo. Las condiciones para identificar repeticiones incorrectas deben implementarse aparte.

**Why:** Exigir que cabeza, hombros y codos superen las muñecas no cuenta algunos muscle-ups correctos. En cambio, aceptar solo una señal simple de cabeza sobre muñecas también cuenta repeticiones incorrectas; un margen proporcional distingue los ejemplos compartidos por el usuario.

**How to apply:** Mantener el criterio de cabeza sobre codo y muñeca con margen del torso, contar solo al terminar el regreso al fondo, y añadir cualquier clasificación de incorrectas como lógica independiente.
