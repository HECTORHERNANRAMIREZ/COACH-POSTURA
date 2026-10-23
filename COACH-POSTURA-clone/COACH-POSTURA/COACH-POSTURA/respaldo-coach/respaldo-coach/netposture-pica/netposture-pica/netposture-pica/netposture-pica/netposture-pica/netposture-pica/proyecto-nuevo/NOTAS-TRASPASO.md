# Traspaso NetPosture (flexiones pica con video)

## Estado al 11/10/2026
- Commit 06a3bd5 = base con A7 (analisis cubre todo el video, logs pica-regla/pica-embudo/pica-rangos/pica-video).
- Commit 1059561 = cambios A8 del agente: pica con video usa 1 cuadro estable y suavizado de 1 muestra, inicio 142-180, activacion <130, fondo 94-109, excepcion de muneca retenida, logs [pica-tracker]. Solo App.tsx cambio (121 anadidas, 17 quitadas).
- Resultado de la ultima prueba: entra a 'inicio' en los 5 topes, 0 bloqueos falsos, pero repeticiones=0.
- Causa: estando en 'inicio', el tracker vuelve a 'esperando inicio' en el primer cuadro con codo <142 (t=2.136 codo 139; 4.126 codo 136; 6.033 codo 140; 8.028 codo 138), antes de llegar a la activacion <130 (que llega 2-3 cuadros despues).
- NO esta en GitHub: solo existe el remoto interno gitsafe-backup.

## PENDIENTE 1: aplicar el prompt A9 en Message Agent
Contexto: proyecto NetPosture. Localiza App.tsx con: find ~/workspace/proyecto-nuevo -path '*posture-coach/src/App.tsx' -not -path '*/node_modules/*'. No uses git, no pnpm install, no reinicies el servidor, no pidas videos. Solo 'flexiones-pica' con video subido; no cambies ningun otro ejercicio. Cambios minimos.

PASO 0: cp <ruta> /tmp/App.tsx.A9 y confirma con wc -l.

Evidencia (consola, video a 0.35x): el tracker de pica entra a 'inicio' en cada tope (t=1.63, 3.53, 5.53, 7.53, 9.43) pero vuelve a 'esperando inicio' en el PRIMER cuadro con codo <142 (t=2.136 codo 139; 4.126 codo 136; 6.033 codo 140; 8.028 codo 138), antes de cruzar la activacion <130 (que llega 2-3 cuadros despues: 126, 123, 129, 124). Por eso nunca pasa a 'en movimiento' y repeticiones=0.

TAREA:
1. Encuentra la condicion exacta que, estando en 'inicio', devuelve a 'esperando inicio' al salir del rango 142-180 hacia abajo. Reporta su linea.
2. Solo para pica con video: estando en 'inicio', bajar de 142 NO reinicia el tracker; pasa a 'en movimiento' al cruzar <130 (activacion existente), cuenta al llegar al fondo 94-109 y al volver a >=142. Conserva cualquier otro motivo de reinicio que ya exista (pose perdida, tecnica invalida).
3. Manten los logs [pica-tracker], [pica-regla], [pica-rangos], [pica-embudo], [pica-hb] y [pica-video]. Anade una linea [pica-tracker] cuando cambie la fase con la condicion que la causo, y al terminar el video un resumen [pica-tracker] FINAL con repeticiones contadas y el tVideo de cada una.

REGLA: si necesitas cambiar una linea que afecte a otros ejercicios, DETENTE y preguntame sin editar. Si te quedas sin creditos, el archivo debe quedar compilable.

Al terminar responde con: (a) la causa y su linea; (b) diff /tmp/App.tsx.A9 <ruta> | grep '^<'; (c) diff /tmp/App.tsx.A9 <ruta> | grep -c '^>'; (d) que quedo sin hacer.

## PENDIENTE 2: comprobar las 17 lineas quitadas del cambio A8
Son 4 sitios compartidos con otros ejercicios (frameLowConfidence, hasFreshPushupMeasurement, el valor 4 de cuadros estables, postBottomRawPeakForReturn). Falta confirmar que reaparecen identicas y no cambiaron el comportamiento de otros ejercicios:
cd ~/workspace/proyecto-nuevo && git diff 06a3bd5 1059561 -- '*posture-coach/src/App.tsx' > /tmp/d.txt; grep '^+' /tmp/d.txt | grep -v '^+++' | sed 's/^+[[:space:]]*//' | sort -u > /tmp/add.txt; grep '^-' /tmp/d.txt | grep -v '^---' | sed 's/^-[[:space:]]*//' | while IFS= read -r l; do if grep -qxF -- "$l" /tmp/add.txt; then echo "REAPARECE: $l"; else echo "DESAPARECE: $l"; fi; done | cut -c1-130

## PRUEBA FINAL
Arrancar: W=$(find ~/workspace/proyecto-nuevo -path '*posture-coach/src/App.tsx' -not -path '*/node_modules/*' | head -1); cd "${W%/src/App.tsx}" && PORT=24009 BASE_PATH=/ pnpm run dev
URL: echo "url: https://$REPLIT_DEV_DOMAIN"
Consola: F12, Preserve log, filtro /\[(pica-tracker|pica-regla|pica-video)\]/. Subir el mismo video de pica completo.
Esperado: 4 repeticiones (topes 1.8, 3.9, 5.8, 7.7, 9.7 s de video). Pendiente confirmar con el usuario si cuenta 4 o 5.
