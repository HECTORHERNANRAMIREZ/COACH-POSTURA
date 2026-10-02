---
name: Clerk en preview
description: Causa común de errores de carga de Clerk en el preview de este proyecto
---

Si una aplicación ya contiene la integración canónica de Clerk pero el preview muestra `failed_to_load_clerk_js`, comprobar primero que la instancia administrada de Clerk haya sido provisionada; sin ese paso no existen las variables auto-provisionadas del navegador.

**Why:** El error se presenta como un fallo de carga del script y puede parecer un problema de Vite o del SDK, aunque el wiring del frontend sea correcto.

**How to apply:** Verificar el estado administrado de Clerk y provisionarlo antes de modificar el código o rotar claves. Reiniciar frontend y API después para que el preview reciba la configuración.