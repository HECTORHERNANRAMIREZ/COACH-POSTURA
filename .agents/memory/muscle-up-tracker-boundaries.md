---
name: Separación del tracker de muscle-up
description: Regla del proyecto para mantener independientes la detección de repeticiones correctas e incorrectas.
---

El contador de repeticiones correctas de muscle-up debe exigir que la posición alta quede confirmada durante los cuadros configurados y que la repetición regrese al fondo. No añadir una vía alternativa que acepte señales parciales de cabeza, codo o ángulo cuando `topReached` sea falso. Las condiciones para identificar repeticiones incorrectas deben implementarse aparte.

**Why:** Los registros del usuario mostraron cuatro repeticiones incorrectas sumadas como correctas por una vía alternativa de “suavizado”; el usuario pidió evitar que esa regla choque con el futuro tracker de incorrectas.

**How to apply:** Al modificar el muscle-up, conservar la validación estricta de correctas y añadir cualquier clasificación de incorrectas como lógica independiente, usando ejemplos del usuario.
