---
name: Preview startup
description: Condiciones necesarias para iniciar el preview web del workspace
---

El preview web requiere que las dependencias del workspace estén instaladas y que el proceso de Vite reciba `PORT` y `BASE_PATH`.

**Why:** Los workflows pueden existir antes de que `node_modules` esté disponible, y la configuración de Vite falla explícitamente si faltan esas variables.

**How to apply:** Antes de iniciar el preview en un entorno recién creado, instala el lockfile del workspace y arranca el frontend con puerto 5000 y una ruta base `/`.