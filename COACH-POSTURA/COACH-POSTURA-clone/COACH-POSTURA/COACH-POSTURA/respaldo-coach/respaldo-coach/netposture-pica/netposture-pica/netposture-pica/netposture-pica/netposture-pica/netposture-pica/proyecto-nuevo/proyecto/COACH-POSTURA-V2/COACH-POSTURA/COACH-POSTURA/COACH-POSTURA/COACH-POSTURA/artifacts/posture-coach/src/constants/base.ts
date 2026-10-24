import { shadcn } from '@clerk/themes';

export const TOTAL_FRAMES = 11;
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
export const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

export const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {},
  variables: {
    colorPrimary: '#39ff6a',
    colorForeground: '#f0f5fb',
    colorMutedForeground: '#a6b7ca',
    colorDanger: '#ff9b93',
    colorBackground: '#101c31',
    colorInput: '#0b1728',
    colorInputForeground: '#f0f5fb',
    colorNeutral: '#55708b',
    fontFamily: 'var(--app-font-sans)',
    borderRadius: '1rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-[#101c31] rounded-[1.5rem] w-[440px] max-w-full overflow-hidden',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'text-[#f0f5fb]',
    headerSubtitle: 'text-[#a6b7ca]',
    socialButtonsBlockButtonText: 'text-[#f0f5fb]',
    formFieldLabel: 'text-[#d5e2ef]',
    footerActionLink: 'text-[#8bffa5]',
    footerActionText: 'text-[#a6b7ca]',
    dividerText: 'text-[#a6b7ca]',
    identityPreviewEditButton: 'text-[#8bffa5]',
    formFieldSuccessText: 'text-[#8bffa5]',
    alertText: 'text-[#ffb8b2]',
    logoBox: 'h-10',
    logoImage: 'h-10 w-10',
    socialButtonsBlockButton: 'border-white/15 bg-white/5 hover:bg-white/10',
    formButtonPrimary: 'bg-[#39ff6a] text-[#08150c] hover:bg-[#8bffa5]',
    formFieldInput: 'border-white/15 bg-[#0b1728] text-[#f0f5fb]',
    footerAction: 'border-white/10',
    dividerLine: 'bg-white/15',
    alert: 'border-[#ff9b93]/40 bg-[#ff9b93]/10',
    otpCodeFieldInput: 'border-white/15 bg-[#0b1728] text-[#f0f5fb]',
    formFieldRow: 'text-[#f0f5fb]',
    main: 'bg-transparent',
  },
};

export const GREEN = '#39ff6a';
