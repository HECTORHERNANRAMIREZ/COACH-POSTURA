// abajo: codo extendido; arriba: codo flexionado.
// En la vista trasera del video, la extensión real se midió entre 130–180°.
// Se amplía el inicio válido para no convertir una lectura 3D comprimida en
// un falso "sin bloqueo".
export const PULLUP_BOTTOM_MIN_ANGLE = 125;
export const PULLUP_BOTTOM_MAX_ANGLE = 180;
export const PULLUP_PULL_ACTIVATION_ANGLE = 120;
export const PULLUP_NO_LOCKOUT_ANGLE = 155;
// La cabeza sobre las muñecas es la señal principal; el rango bilateral de
// codos aporta una confirmación secundaria cuando la cabeza pierde confianza.
export const PULLUP_BOTTOM_SHOULDER_MIN_ANGLE = 125;
export const PULLUP_TOP_SHOULDER_MIN_ANGLE = 70;
export const PULLUP_TOP_SHOULDER_MAX_ANGLE = 125;
// En la ejecución de referencia, la parte alta llegó aproximadamente a
// 57–135° por lado. El rango acepta esa variación 3D sin exigir una postura
// idéntica en ambos brazos.
export const PULLUP_TOP_ELBOW_MIN_ANGLE = 45;
export const PULLUP_TOP_ELBOW_MAX_ANGLE = 145;
export const PULLUP_TOLERANCE_DEG = 5;
export const PULLUP_SMOOTHING_SAMPLES = 5;
export const PULLUP_BOTTOM_STABLE_FRAMES = 3;
export const PULLUP_TOP_CONFIRMATION_FRAMES = 2;
export const PULLUP_RISING_DELTA_DEG = 3;
export const PULLUP_BAR_DETACH_STABLE_FRAMES = 3;
export const PULLUP_BAR_DETACH_SHOULDER_MARGIN_RATIO = 0.18;
export const PULLUP_BAR_DETACH_MIN_SHOULDER_MARGIN_PX = 24;
export const PULLUP_BODY_DETECTION_HOLD_MS = 5000;
export const PULLUP_BAR_PREPARATION_COUNTDOWN_MS = 5000;
