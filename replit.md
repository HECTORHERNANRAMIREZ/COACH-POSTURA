# Coach de postura

Coach de postura analiza ejercicios desde la cámara del usuario y corrige la técnica en tiempo real con una cuenta protegida y un plan anual de Lemon Squeezy.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/posture-coach/src/App.tsx` — experiencia del coach, Clerk, acceso al plan y checkout.
- `artifacts/api-server/src/routes/billing.ts` — checkout de Lemon Squeezy, estado de suscripción y webhook firmado.
- `lib/db/src/schema/billingSubscriptions.ts` — persistencia del vínculo entre Clerk y Lemon Squeezy.
- `lib/api-spec/openapi.yaml` — contrato fuente de las rutas de facturación.

## Architecture decisions

- Clerk es la identidad principal; el `clerkUserId` se transporta como `custom_data` en el checkout.
- El acceso premium solo se activa después de validar la firma del webhook de Lemon Squeezy.
- Las llamadas del navegador usan cookies de sesión de Clerk; no se manejan tokens manualmente en la aplicación web.
- Las credenciales de Lemon Squeezy viven en Secrets y los identificadores de tienda/variante viven como variables compartidas.

## Product

- Entrada y registro con Google mediante Clerk.
- Plan anual de US$2 mediante Lemon Squeezy.
- Activación y actualización automática del acceso según eventos de suscripción.
- Coach de ejercicios con análisis de postura en cámara.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Lemon Squeezy debe apuntar en producción a `/api/billing/webhook` y enviar el webhook signing secret correspondiente.
- Una respuesta correcta del checkout no activa el acceso por sí sola; el webhook firmado es la fuente de verdad.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
