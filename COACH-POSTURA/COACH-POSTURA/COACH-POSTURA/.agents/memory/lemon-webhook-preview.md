---
name: Webhooks de Lemon
description: Diferencia entre recibos válidos de Lemon Squeezy y URLs antiguas del preview
---

Un pedido de Lemon Squeezy puede estar pagado y tener una URL válida en `attributes.urls.receipt` mientras la URL de retorno o webhook de un preview antiguo devuelve la página 404 de Replit.

**Why:** Los dominios temporales de preview cambian, y Lemon conserva la URL configurada anteriormente; el pago no se reenvía automáticamente a la nueva URL.

**How to apply:** Separar siempre la verificación del pedido/comprobante de la verificación de la URL de la app. Antes de probar, actualizar el webhook al dominio actual o publicado y reenviar el evento perdido desde Lemon.