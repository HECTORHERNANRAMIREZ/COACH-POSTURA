export const TOTAL_FRAMES = 11;
export const ANGLE_DISPLAY_SAMPLES = 7;
export const REPETICIONES = 4;
export const SCROLL_LERP = 0.15;
// El detector no debe intentar procesar cada cuadro del video subido: una
// inferencia síncrona por cuadro bloquea el hilo principal y ralentiza el
// elemento <video>. Este ritmo conserva suficientes lecturas para contar
// repeticiones normales sin convertir la reproducción en cámara lenta.
export const UPLOADED_VIDEO_ANALYSIS_FPS = 12;
export const UPLOADED_VIDEO_ANALYSIS_INTERVAL_SECONDS = 1 / UPLOADED_VIDEO_ANALYSIS_FPS;
// TEMP-DIAGNOSTICO: intervalo de muestreo temporal del log; no interviene en el conteo.
export const UPLOADED_DIP_TIMELINE_LOG_INTERVAL_SECONDS = 0.2;
// TEMP-DIAGNOSTICO: máximo aproximado del registro descargable para contener su tamaño.
export const UPLOADED_DIP_DIAGNOSTIC_LOG_MAX_CHARS = 1_500_000;
export const SQUAT_LIVE_BODY_DETECTION_HOLD_MS = 5000;
export const SQUAT_LIVE_PREPARATION_COUNTDOWN_MS = 5000;
// TEMP-DIAGNOSTICO: tiempo de cuadros válidos necesario para encontrar el cuerpo en sentadilla.
export const SQUAT_BODY_DETECTION_HOLD_MS = 2000;
// TEMP-DIAGNOSTICO: hueco máximo tolerado entre cuadros válidos durante la búsqueda de sentadilla.
export const UPLOADED_SQUAT_SEARCH_GAP_TOLERANCE_SECONDS = 0.6;
// TEMP-DIAGNOSTICO: velocidad de la pasada de conteo para sentadilla subida.
export const UPLOADED_SQUAT_PLAYBACK_RATE = 0.5;
// TEMP-DIAGNOSTICO: frecuencia de análisis de la pasada de conteo para sentadilla subida.
export const UPLOADED_SQUAT_ANALYSIS_FPS = 12;
export const UPLOADED_SQUAT_ANALYSIS_INTERVAL_SECONDS = 1 / UPLOADED_SQUAT_ANALYSIS_FPS;
// TEMP-DIAGNOSTICO: frecuencia del registro temporal informativo de sentadilla subida.
export const UPLOADED_SQUAT_TIMELINE_LOG_INTERVAL_SECONDS = 0.2;
// TEMP-DIAGNOSTICO: limita los avisos de cuadro inválido por tiempo de video.
export const UPLOADED_SQUAT_INVALID_LOG_INTERVAL_SECONDS = 0.5;
// TEMP-DIAGNOSTICO: evita confundir pequeñas variaciones temporales con un seek hacia atrás.
export const UPLOADED_SQUAT_BACKWARD_SEEK_THRESHOLD_SECONDS = 0.001;
// TEMP-DIAGNOSTICO: límite fijo para el buffer descargable de sentadillas.
export const UPLOADED_SQUAT_DIAGNOSTIC_LOG_MAX_LINES = 5_000;
// Las flexiones subidas usan más muestras por segundo de video en el fondo de cada repetición.
export const UPLOADED_PUSHUP_ANALYSIS_FPS = 24;
export const UPLOADED_PUSHUP_ANALYSIS_INTERVAL_SECONDS = 1 / UPLOADED_PUSHUP_ANALYSIS_FPS;
export const UPLOADED_PUSHUP_SEARCH_GAP_TOLERANCE_SECONDS = 0.6;
export const UPLOADED_PUSHUP_PLAYBACK_RATE = 0.35;
export const UPLOADED_PULLUP_PLAYBACK_RATE = 0.35;
export const UPLOADED_DIP_VIDEO_PLAYBACK_RATE = 0.5;
export const UPLOADED_DIP_BODY_DETECTION_CONSECUTIVE_FRAMES = 3;
export const DETECTOR_MAX_FRAME_WIDTH = 1280;
export const DETECTOR_MAX_FRAME_HEIGHT = 720;
// Número de frames usados para calcular la media móvil del FPS real del detector.
export const FPS_WINDOW_FRAMES = 45;
// FPS medio mínimo que debe mantener el modelo heavy antes de degradar.
export const MIN_FPS = 15;
// Segundos consecutivos bajo MIN_FPS necesarios para cambiar a full.
export const FPS_LOW_SECONDS = 4;

// MODO TEMPORAL DE DESARROLLO:
// Se conserva todo el código de Clerk y Lemon Squeezy, pero NetPosture abre
// directamente mientras agregamos y ajustamos ejercicios.
// Para reactivar login y pagos, cambiar este valor a true.
export const AUTH_AND_BILLING_ENABLED = false;
export const PULLUP_DIAGNOSTIC_BUFFER_LIMIT = 200;
export const DIAGNOSTIC_BUFFER_LIMIT = 200;
export const PULLUP_DIAGNOSTIC_EXPORT_ENABLED = import.meta.env.DEV;

export const GREEN = '#39ff6a';
