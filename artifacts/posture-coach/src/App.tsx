import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ClerkProvider,
  SignIn,
  SignUp,
  useAuth,
  useClerk,
  useUser,
} from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import {
  getGetBillingStatusQueryKey,
  useCreateBillingCheckout,
  useGetBillingStatus,
} from '@workspace/api-client-react';
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  Maximize2,
  ShieldCheck,
  Square,
} from 'lucide-react';
import dipImage from '@assets/ChatGPT_Image_8_sept_2026__23_00_34-removebg-preview_1788926457927.png';
import pullupImage from '@assets/ChatGPT_Image_8_sept_2026,_23_22_04_1788928280842.png';
import supinePullupImage from '@assets/ChatGPT_Image_9_sept_2026,_12_18_29_a.m._1788931453217.png';
import muscleUpImage from '@assets/ChatGPT_Image_14_sept_2026,_13_48_26_1789411716868.png';
import pulldownImage from '@assets/ChatGPT_Image_8_sept_2026,_23_45_23_1788929140639.png';
import plankImage from '@assets/ChatGPT_Image_8_sept_2026__23_06_57-removebg-preview_1788926983717.png';
import pushupImage from '@assets/Captura_de_pantalla_2026-09-08_225611-removebg-preview_1788926239892.png';
import pikePushupImage from '@assets/ChatGPT_Image_9_sept_2026,_00_01_49_1788930345371.png';
import declinePushupImage from '@assets/ChatGPT_Image_9_sept_2026,_02_57_19_p.m._1788984656423.png';
import squatImage from '@assets/ChatGPT_Image_8_sept_2026__23_03_29-removebg-preview_1788926641237.png';
import lungeImage from '@assets/ChatGPT_Image_9_sept_2026,_12_28_52_a.m._1788931785734.png';
import benchLungeImage from '@assets/ChatGPT_Image_9_sept_2026,_12_39_15_a.m._1788983914611.png';
import militaryPressImage from '@assets/ChatGPT_Image_9_sept_2026,_03_26_39_p.m._1788985622495.png';
import tricepsPushdownImage from '@assets/ChatGPT_Image_9_sept_2026,_23_52_11_1789015949955.png';
import horizontalBarExtensionImage from '@assets/ChatGPT_Image_15_sept_2026,_02_35_29_a.m._1789457735768.png';
import barbellRowImage from '@assets/ChatGPT_Image_10_sept_2026,_00_03_57_1789016813023.png';
import bicepsCurlImage from '@assets/ChatGPT_Image_10_sept_2026,_00_22_49_1789017858109.png';
import brandLogoImage from '@assets/ChatGPT_Image_15_sept_2026__02_39_33_a.m.-removebg-preview_1789458540404.png';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  POSE_LANDMARK_COUNT,
  POSE_MODEL_NAME,
  createPoseDetector,
  skeletonConnections,
  type Pose,
  type PoseDetector,
  type PosePoint,
} from '@/pose3d';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

// MODO TEMPORAL DE DESARROLLO:
// Se conserva todo el código de Clerk y Lemon Squeezy, pero el coach abre
// directamente mientras agregamos y ajustamos ejercicios.
// Para reactivar login y pagos, cambiar este valor a true.
const AUTH_AND_BILLING_ENABLED = false;

const clerkPubKey = AUTH_AND_BILLING_ENABLED
  ? publishableKeyFromHost(
      window.location.hostname,
      import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
    )
  : '';
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

if (AUTH_AND_BILLING_ENABLED && !clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in the environment.');
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
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
const GREEN = '#39ff6a';

type ExerciseId = 'fondos' | 'dominadas' | 'dominadas-supinas' | 'muscle-up' | 'jalon' | 'remo-barra' | 'flexiones' | 'flexiones-declinadas' | 'flexiones-pica' | 'press-militar' | 'triceps-polea-alta' | 'extension-horizontal-barra' | 'curl-biceps' | 'sentadillas' | 'zancadas' | 'zancada-banco' | 'plancha';
type TrackedJoint = 'shoulder' | 'elbow' | 'wrist' | 'hip' | 'knee' | 'ankle' | 'foot';
type TrackedJointDefinition = {
  joint: TrackedJoint;
  label: string;
};
type ExerciseDefinition = {
  id: ExerciseId;
  name: string;
  description: string;
  angleLabel: string;
  cameraNote?: string;
  trackedJoints: TrackedJointDefinition[];
  trackBothSides?: boolean;
  trackedAngleLabels: string[];
};
const exerciseImages: Record<ExerciseId, string> = {
  fondos: dipImage,
  dominadas: pullupImage,
  'dominadas-supinas': supinePullupImage,
  'muscle-up': muscleUpImage,
  jalon: pulldownImage,
  flexiones: pushupImage,
  'flexiones-declinadas': declinePushupImage,
  'flexiones-pica': pikePushupImage,
  'press-militar': militaryPressImage,
  'triceps-polea-alta': tricepsPushdownImage,
  'extension-horizontal-barra': horizontalBarExtensionImage,
  'remo-barra': barbellRowImage,
  'curl-biceps': bicepsCurlImage,
  sentadillas: squatImage,
  zancadas: lungeImage,
  'zancada-banco': benchLungeImage,
  plancha: plankImage,
};
type PoseSide = 'left' | 'right';
type CameraFacingMode = 'user' | 'environment';
type SessionPhase = 'exercise-select' | 'requesting' | 'loading-model' | 'tracking' | 'error';
type PoseCandidate = {
  pose: Pose;
  centerX: number;
  centerY: number;
  area: number;
  prominence: number;
};
type PoseTrack = {
  centerX: number;
  centerY: number;
  area: number;
  lostFrames: number;
};
type PosePointMemory = {
  point: PosePoint;
  missingFrames: number;
};
type PosePointMemoryMap = Partial<Record<number, PosePointMemory>>;
type DiagnosticPoint = {
  label: string;
  score: number | null;
  side: 'izq.' | 'der.' | '—';
};
type TechniqueFeedbackTone = 'checking' | 'success' | 'warning' | 'danger';
type TechniqueFeedback = {
  tone: TechniqueFeedbackTone;
  message: string;
  detail: string;
};
type SquatPhase = 'esperando arriba' | 'arriba' | 'bajando' | 'abajo';
type SquatRepEvent = 'valid' | 'too-shallow' | 'too-deep' | null;
type SquatTracker = {
  phase: SquatPhase;
  repetitions: number;
  goodRepetitions: number;
  minimumAngle: number | null;
  descentStartAngle: number | null;
  hasMeaningfulDescent: boolean;
  samples: number[];
  event: SquatRepEvent;
  currentRepCounted: boolean;
};
type PullupPhase = 'esperando abajo' | 'abajo' | 'subiendo' | 'arriba' | 'bajando';
type PullupRepEvent = 'valid' | 'no-top' | 'no-lockout' | null;
type PullupTracker = {
  phase: PullupPhase;
  repetitions: number;
  goodRepetitions: number;
  minimumAngle: number | null;
  samples: number[];
  event: PullupRepEvent;
  lastAngle: number | null;
  topFrames: number;
};
type ExerciseRepPhase = 'esperando inicio' | 'inicio' | 'en movimiento' | 'final';
type ExerciseRepDirection = 'decrease' | 'increase';
type ExerciseRepConfig = {
  direction: ExerciseRepDirection;
  startMinAngle: number;
  startMaxAngle: number;
  activationAngle: number;
  endMinAngle: number;
  endMaxAngle: number;
  endLabel: string;
  countOnReturn?: boolean;
};
type ExerciseRepTracker = {
  phase: ExerciseRepPhase;
  repetitions: number;
  goodRepetitions: number;
  endpointAngle: number | null;
  samples: number[];
  event: 'valid' | null;
};
type ExerciseRepTrackerUpdate = {
  tracker: ExerciseRepTracker;
  smoothedAngle: number;
  completedEndpointAngle: number | null;
};
type AngleDiagnosticPoint = {
  label: string;
  x: number | null;
  y: number | null;
  z: number | null;
};
type DominantSideResult = {
  side: PoseSide;
  average: number;
};
type VideoResolution = {
  width: number;
  height: number;
};
type CameraGuidanceTone = 'checking' | 'ready' | 'warning';
type CameraGuidance = {
  tone: CameraGuidanceTone;
  message: string;
  detail: string;
};
type MuscleUpAngleKey = 'leftElbow' | 'rightElbow' | 'leftKnee' | 'rightKnee' | 'leftAnkle' | 'rightAnkle';
type MuscleUpAngles = Record<MuscleUpAngleKey, number | null>;
type LiveAngleReading = {
  label: string;
  value: number | null;
  target: string;
  min?: number;
  max?: number;
};
type DipJointReading = {
  label: string;
  value: number | null;
  status?: string;
};
type ReferenceSample = {
  elapsedMs: number;
  readings: Array<{
    label: string;
    value: number;
    target: string;
  }>;
};
type CalibrationMetric = {
  label: string;
  observedMin: number;
  observedMax: number;
  recommendedMin: number;
  recommendedMax: number;
  samples: number;
  target: string;
};
type CalibrationSummary = {
  version: 1;
  exerciseId: ExerciseId;
  exerciseName: string;
  capturedAt: string;
  durationMs: number;
  sampleCount: number;
  metrics: CalibrationMetric[];
};

const REFERENCE_SAMPLE_INTERVAL_MS = 120;

function buildCalibrationSummary(
  exercise: ExerciseDefinition,
  samples: ReferenceSample[],
  durationMs: number,
): CalibrationSummary | null {
  const metricMap = new Map<string, {
    min: number;
    max: number;
    samples: number;
    target: string;
  }>();

  samples.forEach((sample) => {
    sample.readings.forEach((reading) => {
      const existing = metricMap.get(reading.label);
      if (!existing) {
        metricMap.set(reading.label, {
          min: reading.value,
          max: reading.value,
          samples: 1,
          target: reading.target,
        });
        return;
      }
      existing.min = Math.min(existing.min, reading.value);
      existing.max = Math.max(existing.max, reading.value);
      existing.samples += 1;
    });
  });

  const metrics = Array.from(metricMap.entries()).map(([label, metric]) => {
    const span = metric.max - metric.min;
    const margin = Math.max(3, Math.min(8, Math.ceil(span * 0.08)));
    return {
      label,
      observedMin: Math.round(metric.min),
      observedMax: Math.round(metric.max),
      recommendedMin: Math.max(0, Math.floor(metric.min - margin)),
      recommendedMax: Math.min(180, Math.ceil(metric.max + margin)),
      samples: metric.samples,
      target: metric.target,
    };
  });

  if (!metrics.length) return null;

  return {
    version: 1,
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    capturedAt: new Date().toISOString(),
    durationMs: Math.round(durationMs),
    sampleCount: samples.length,
    metrics,
  };
}

function createCalibrationPrompt(
  exercise: ExerciseDefinition,
  summary: CalibrationSummary,
  samples: ReferenceSample[],
) {
  return `Analiza esta ejecución de referencia correcta para calibrar el ejercicio "${exercise.name}".

Reglas:
- La ejecución fue realizada correctamente de principio a fin.
- Usa únicamente las articulaciones y ángulos definidos para este ejercicio.
- Distingue entre rango observado, rango de tolerancia recomendado y umbrales de inicio/final.
- No conviertas automáticamente el rango observado en una tolerancia amplia: revisa compensaciones, ruido de cámara y la diferencia entre fase inicial, recorrido y final.
- Devuelve una configuración concreta por ángulo con mínimo, máximo, margen y explicación breve.
- Indica qué capturas o tramos de la secuencia fueron insuficientes para calibrar.

Definición de seguimiento:
${JSON.stringify({
    joints: exercise.trackedJoints,
    bothSides: Boolean(exercise.trackBothSides),
    angleLabels: exercise.trackedAngleLabels,
  }, null, 2)}

Resumen calculado por la app:
${JSON.stringify(summary, null, 2)}

Secuencia temporal completa:
${JSON.stringify(samples, null, 2)}`;
}

const exercises: ExerciseDefinition[] = [
  {
    id: 'fondos',
    name: 'Fondos en barra',
    description: 'Inclina el torso hacia delante y desciende hasta 90° de codo para enfatizar el pecho.',
    angleLabel: 'Torso 30–40° · codo 85–95°',
    cameraNote: 'Nota: vista lateral; la cámara puede estar baja o inclinada.',
    trackedJoints: [
      { joint: 'hip', label: 'cadera' },
      { joint: 'shoulder', label: 'hombro' },
      { joint: 'elbow', label: 'codo' },
      { joint: 'wrist', label: 'muñeca' },
    ],
    trackedAngleLabels: ['Codo: inicio 150–180°, activación <135°, final 85–95°', 'Torso: 30–40°'],
  },
  {
    id: 'dominadas',
    name: 'Dominadas en barra',
    description: 'Lleva los codos hacia abajo y evita balancear el cuerpo.',
    angleLabel: 'Codo · tracción vertical',
    cameraNote: 'Nota: vista trasera; deja visibles ambos brazos, las manos, la cabeza y todo el cuerpo.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombros' },
      { joint: 'elbow', label: 'codos' },
      { joint: 'wrist', label: 'muñecas' },
    ],
    trackBothSides: true,
    trackedAngleLabels: ['Codo: inicio/regreso 160–180°', 'Altura: cabeza por encima de las muñecas'],
  },
  {
    id: 'dominadas-supinas',
    name: 'Dominadas supinas',
    description: 'Mismo recorrido que la dominada, con agarre supino.',
    angleLabel: 'Extensión completa · cabeza sobre muñecas',
    cameraNote: 'Nota: vista trasera; deja visibles ambos brazos, las manos, la cabeza y todo el cuerpo.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombros' },
      { joint: 'elbow', label: 'codos' },
      { joint: 'wrist', label: 'muñecas' },
    ],
    trackBothSides: true,
    trackedAngleLabels: ['Codo: inicio/regreso 160–180°', 'Altura: cabeza por encima de las muñecas'],
  },
  {
    id: 'muscle-up',
    name: 'Muscle-up',
    description: 'Observa la transición sobre la barra y controla el balanceo de las piernas.',
    angleLabel: 'Codos · rodillas · tobillos',
    cameraNote: 'Nota: vista en semiperfil (30°–45°); separa brazos y piernas y deja el cuerpo completo y la barra dentro del encuadre.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombros' },
      { joint: 'elbow', label: 'codos' },
      { joint: 'wrist', label: 'muñecas' },
      { joint: 'hip', label: 'caderas' },
      { joint: 'knee', label: 'rodillas' },
      { joint: 'ankle', label: 'tobillos' },
      { joint: 'foot', label: 'pies' },
    ],
    trackBothSides: true,
    trackedAngleLabels: ['Codos: lectura izquierda y derecha', 'Rodillas: lectura izquierda y derecha', 'Tobillos: lectura izquierda y derecha', 'Balanceo: solo referencia hasta calibrar'],
  },
  {
    id: 'jalon',
    name: 'Jalón al pecho en polea',
    description: 'Mantén el torso erguido entre 10° y 30° mientras llevas la barra al pecho.',
    angleLabel: 'Torso 10°–30° · cadera–hombro–codo 25°–60°',
    cameraNote: 'Nota: vista lateral; la cámara puede estar baja o inclinada.',
    trackedJoints: [
      { joint: 'hip', label: 'cadera' },
      { joint: 'shoulder', label: 'hombro' },
      { joint: 'elbow', label: 'codo' },
      { joint: 'wrist', label: 'muñeca' },
    ],
    trackedAngleLabels: ['Torso: 10–30°', 'Codo: 80–120°', 'Tirón cadera–hombro–codo: final 25–60°'],
  },
  {
    id: 'remo-barra',
    name: 'Remo con barra',
    description: 'Haz una bisagra de cadera, mantén la espalda neutra y lleva la barra al cuerpo con control.',
    angleLabel: 'Torso 30–45° · codos 15–30° · codo 70–115°',
    cameraNote: 'Nota: vista lateral, incluso desde el suelo; muestra todo el cuerpo.',
    trackedJoints: [
      { joint: 'hip', label: 'cadera' },
      { joint: 'shoulder', label: 'hombro' },
      { joint: 'elbow', label: 'codo' },
      { joint: 'wrist', label: 'muñeca' },
      { joint: 'knee', label: 'rodilla' },
      { joint: 'ankle', label: 'tobillo' },
    ],
    trackedAngleLabels: ['Torso: 30–45°', 'Rodilla: 150–180°', 'Elevación del codo: 15–30°', 'Flexión del codo: final 70–115°'],
  },
  {
    id: 'flexiones',
    name: 'Flexiones de pecho',
    description: 'Mantén los codos cerca del torso y el cuerpo en línea.',
    angleLabel: 'Codo respecto al torso 45–90° · alineación 162–180°',
    cameraNote: 'Nota: vista lateral; la cámara puede estar baja o inclinada.',
    trackedJoints: [
      { joint: 'hip', label: 'cadera' },
      { joint: 'shoulder', label: 'hombro' },
      { joint: 'elbow', label: 'codo' },
      { joint: 'wrist', label: 'muñeca' },
      { joint: 'ankle', label: 'tobillo' },
    ],
    trackedAngleLabels: ['Codo respecto al torso: 45–100°', 'Línea hombro–cadera–tobillo: 162–180°', 'Flexión del codo: final 70–105°'],
  },
  {
    id: 'flexiones-declinadas',
    name: 'Flexiones declinadas',
    description: 'Eleva los pies y mantén el cuerpo firme mientras bajas con control.',
    angleLabel: 'Codo 30–60° · cuerpo 162–180°',
    cameraNote: 'Nota: vista lateral; la cámara puede estar baja o inclinada.',
    trackedJoints: [
      { joint: 'hip', label: 'cadera' },
      { joint: 'shoulder', label: 'hombro' },
      { joint: 'elbow', label: 'codo' },
      { joint: 'wrist', label: 'muñeca' },
      { joint: 'ankle', label: 'tobillo' },
    ],
    trackedAngleLabels: ['Codo respecto al torso: 30–60°', 'Línea hombro–cadera–tobillo: 162–180°', 'Flexión del codo: final 70–105°'],
  },
  {
    id: 'flexiones-pica',
    name: 'Flexiones en pica',
    description: 'Eleva la cadera y lleva la cabeza hacia el suelo con control.',
    angleLabel: 'Codo respecto al cuerpo · objetivo 45–60°',
    cameraNote: 'Nota: vista lateral; la cámara puede estar baja o inclinada.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombro' },
      { joint: 'elbow', label: 'codo' },
      { joint: 'wrist', label: 'muñeca' },
      { joint: 'hip', label: 'cadera' },
      { joint: 'ankle', label: 'tobillo' },
    ],
    trackedAngleLabels: ['Codo respecto al cuerpo: 45–60°', 'Muñeca–hombro respecto al suelo: 75–105°', 'Pliegue de cadera: 45–125°'],
  },
  {
    id: 'press-militar',
    name: 'Press militar con mancuernas',
    description: 'Baja los codos hasta 85°–110° y vuelve a extenderlos con control.',
    angleLabel: 'Codo al bajar · objetivo 85°–110°',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombros' },
      { joint: 'elbow', label: 'codos' },
      { joint: 'wrist', label: 'muñecas' },
      { joint: 'hip', label: 'cadera' },
    ],
    trackBothSides: true,
    trackedAngleLabels: ['Codo: final 85–110°', 'Codo respecto al torso: 30–60°'],
  },
  {
    id: 'triceps-polea-alta',
    name: 'Extensiones de tríceps en polea alta',
    description: 'Mantén los codos fijos y extiende los brazos con control.',
    angleLabel: 'Codo · extensión controlada',
    cameraNote: 'Nota: vista lateral; la cámara puede estar baja o inclinada.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombro' },
      { joint: 'elbow', label: 'codo' },
      { joint: 'wrist', label: 'muñeca' },
      { joint: 'hip', label: 'cadera' },
      { joint: 'ankle', label: 'tobillo' },
    ],
    trackedAngleLabels: ['Codo: inicio 70–120°, extensión final 145–180°', 'Línea corporal: 160–180°'],
  },
  {
    id: 'extension-horizontal-barra',
    name: 'Extensión horizontal con barra',
    description: 'Túmbate, mantén los brazos estables y lleva la barra hacia la frente con control.',
    angleLabel: 'Codo · objetivo 70–105°',
    cameraNote: 'Nota: vista lateral; coloca el móvil bajo o a la altura del banco.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombro' },
      { joint: 'elbow', label: 'codo' },
      { joint: 'wrist', label: 'muñeca' },
    ],
    trackedAngleLabels: ['Codo: inicio 150–180°, activación <135°, final 70–105°'],
  },
  {
    id: 'curl-biceps',
    name: 'Curl de bíceps',
    description: 'Sube las manos casi hasta el pecho y baja sin extender por completo.',
    angleLabel: 'Codo · objetivo 30–60°',
    cameraNote: 'Nota: vista lateral; la cámara puede estar baja o inclinada.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombro' },
      { joint: 'elbow', label: 'codo' },
      { joint: 'wrist', label: 'muñeca' },
    ],
    trackedAngleLabels: ['Codo: inicio 85–135°, activación <70°, final 30–60°'],
  },
  {
    id: 'sentadillas',
    name: 'Sentadillas',
    description: 'Mide la profundidad y el control de tus piernas.',
    angleLabel: 'Cadera · rodilla · tobillo',
    cameraNote: 'Nota: vista lateral; la cámara puede estar baja o inclinada.',
    trackedJoints: [
      { joint: 'hip', label: 'cadera' },
      { joint: 'knee', label: 'rodilla' },
      { joint: 'ankle', label: 'tobillo' },
    ],
    trackedAngleLabels: ['Rodilla: inicio ≥140°, regreso >115°, fondo 83–90°'],
  },
  {
    id: 'zancadas',
    name: 'Zancadas dinámicas',
    description: 'Baja con control hasta formar 90° en las piernas.',
    angleLabel: 'Rodilla delantera · objetivo 90°',
    cameraNote: 'Nota: vista lateral; la cámara puede estar baja o inclinada.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombros' },
      { joint: 'hip', label: 'caderas' },
      { joint: 'knee', label: 'rodillas' },
      { joint: 'ankle', label: 'tobillos' },
    ],
    trackBothSides: true,
    trackedAngleLabels: ['Rodilla delantera: 80–100°', 'Rodilla trasera: 80–100°', 'Cadera: 80–100°', 'Torso respecto al suelo: 75–80°'],
  },
  {
    id: 'zancada-banco',
    name: 'Zancada en banco',
    description: 'Eleva el pie trasero y controla la rodilla delantera.',
    angleLabel: 'Rodilla 80–100° · torso 15–20°',
    cameraNote: 'Nota: vista lateral; la cámara puede estar baja o inclinada.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombros' },
      { joint: 'hip', label: 'caderas' },
      { joint: 'knee', label: 'rodillas' },
      { joint: 'ankle', label: 'tobillos' },
    ],
    trackBothSides: true,
    trackedAngleLabels: ['Rodilla delantera: 80–100°', 'Torso: inclinación 15–20°'],
  },
  {
    id: 'plancha',
    name: 'Plancha',
    description: 'Mantén la cadera alineada y el cuerpo recto.',
    angleLabel: 'Codo · objetivo 90°',
    cameraNote: 'Nota: vista lateral; la cámara puede estar baja o inclinada.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombro' },
      { joint: 'elbow', label: 'codo' },
      { joint: 'wrist', label: 'muñeca' },
      { joint: 'hip', label: 'cadera' },
      { joint: 'ankle', label: 'tobillo' },
    ],
    trackedAngleLabels: ['Codo: 80–100°', 'Brazo respecto al suelo: 80–100°', 'Línea hombro–cadera–tobillo: 162–180°'],
  },
];

const SQUAT_VALID_MIN_ANGLE = 83;
const SQUAT_VALID_MAX_ANGLE = 90;
const SQUAT_TOP_THRESHOLD = 140;
const SQUAT_RISE_THRESHOLD = 115;
const SQUAT_MEANINGFUL_DESCENT = 30;
const SQUAT_SMOOTHING_SAMPLES = 5;
const ANGLE_DISPLAY_SAMPLES = 7;
const ANGLE_DISPLAY_INTERVAL_MS = 220;
const PULLUP_BOTTOM_MIN_ANGLE = 160;
const PULLUP_BOTTOM_MAX_ANGLE = 180;
const PULLUP_NO_LOCKOUT_ANGLE = 155;
const PULLUP_SMOOTHING_SAMPLES = 5;
const DIP_VALID_MIN_ANGLE = 85;
const DIP_VALID_MAX_ANGLE = 95;
const MILITARY_PRESS_VALID_MIN_ANGLE = 85;
const MILITARY_PRESS_VALID_MAX_ANGLE = 110;
const DIP_TORSO_MIN_ANGLE = 30;
const DIP_TORSO_MAX_ANGLE = 40;
const PLANK_MAX_HIP_SAG_RATIO = 0.08;
const PLANK_MAX_HIP_RAISE_RATIO = 0.08;
const PLANK_MIN_BODY_LINE_ANGLE = 162;
const PLANK_ARM_FLOOR_MIN_ANGLE = 80;
const PLANK_ARM_FLOOR_MAX_ANGLE = 100;
const PLANK_ELBOW_MIN_ANGLE = 80;
const PLANK_ELBOW_MAX_ANGLE = 100;
const PULLDOWN_ANGLE_MIN = 25;
const PULLDOWN_ANGLE_MAX = 60;
const PULLDOWN_TORSO_MIN_ANGLE = 10;
const PULLDOWN_TORSO_MAX_ANGLE = 30;
const PULLDOWN_ELBOW_MIN_ANGLE = 80;
const PULLDOWN_ELBOW_MAX_ANGLE = 120;
const PUSHUP_ELBOW_TORSO_MIN_ANGLE = 45;
const PUSHUP_ELBOW_TORSO_MAX_ANGLE = 90;
const PUSHUP_ELBOW_TORSO_TOLERANCE = 10;
const PUSHUP_BODY_LINE_MIN_ANGLE = 162;
const PUSHUP_BODY_LINE_MAX_ANGLE = 180;
const ROW_TORSO_MIN_ANGLE = 30;
const ROW_TORSO_MAX_ANGLE = 45;
const ROW_KNEE_MIN_ANGLE = 150;
const ROW_KNEE_MAX_ANGLE = 180;
const ROW_ELBOW_TORSO_MIN_ANGLE = 15;
const ROW_ELBOW_TORSO_MAX_ANGLE = 30;
const PIKE_ELBOW_BODY_MIN_ANGLE = 45;
const PIKE_ELBOW_BODY_MAX_ANGLE = 60;
const PIKE_WRIST_SHOULDER_MIN_ANGLE = 75;
const PIKE_WRIST_SHOULDER_MAX_ANGLE = 105;
const PIKE_MIN_HIP_LIFT_RATIO = 0.12;
const PIKE_MIN_BODY_FOLD_ANGLE = 45;
const PIKE_MAX_BODY_FOLD_ANGLE = 125;
const LUNGE_KNEE_MIN_ANGLE = 80;
const LUNGE_KNEE_MAX_ANGLE = 100;
const LUNGE_HIP_MIN_ANGLE = 80;
const LUNGE_HIP_MAX_ANGLE = 100;
const LUNGE_TORSO_MIN_ANGLE = 75;
const LUNGE_TORSO_MAX_ANGLE = 80;
const LUNGE_KNEE_ANKLE_MAX_OFFSET = 0.35;
const BENCH_LUNGE_KNEE_MIN_ANGLE = 80;
const BENCH_LUNGE_KNEE_MAX_ANGLE = 100;
const BENCH_LUNGE_TORSO_MIN_LEAN = 15;
const BENCH_LUNGE_TORSO_MAX_LEAN = 20;
const FACE_POINT_MIN_SCORE = 0.22;
const CAMERA_POINT_MIN_SCORE = 0.38;
const ROW_ARM_POINT_MIN_SCORE = 0.24;
const POSE_STALE_POINT_FRAMES = 6;
const POSE_LOCK_MAX_CENTER_DISTANCE = 0.36;
const POSE_LOCK_MIN_AREA_RATIO = 0.1;
const MAX_CAMERA_ROLL_DEGREES = 34;
const MAX_FRONT_VIEW_RATIO = 0.95;
// Solo advertimos si una articulación está prácticamente cortada por el borde.
// La cámara puede estar baja, inclinada o rotada; no exigimos una posición nivelada.
const CAMERA_FRAME_MARGIN = 0.02;
const MUSCLE_UP_ANGLE_KEYS: MuscleUpAngleKey[] = [
  'leftElbow',
  'rightElbow',
  'leftKnee',
  'rightKnee',
  'leftAnkle',
  'rightAnkle',
];
const MUSCLE_UP_FOOT_INDEX: Record<PoseSide, number> = {
  left: 31,
  right: 32,
};

function createMuscleUpAngles(): MuscleUpAngles {
  return {
    leftElbow: null,
    rightElbow: null,
    leftKnee: null,
    rightKnee: null,
    leftAnkle: null,
    rightAnkle: null,
  };
}

function calculateMuscleUpAngles(keypoints: PosePoint[] | undefined): MuscleUpAngles {
  if (!keypoints) return createMuscleUpAngles();

  const left = sideKeypoints.left;
  const right = sideKeypoints.right;
  return {
    leftElbow: calculateAngle(keypoints[left.shoulder], keypoints[left.elbow], keypoints[left.wrist]),
    rightElbow: calculateAngle(keypoints[right.shoulder], keypoints[right.elbow], keypoints[right.wrist]),
    leftKnee: calculateAngle(keypoints[left.hip], keypoints[left.knee], keypoints[left.ankle]),
    rightKnee: calculateAngle(keypoints[right.hip], keypoints[right.knee], keypoints[right.ankle]),
    leftAnkle: calculateAngle(keypoints[left.knee], keypoints[left.ankle], keypoints[MUSCLE_UP_FOOT_INDEX.left]),
    rightAnkle: calculateAngle(keypoints[right.knee], keypoints[right.ankle], keypoints[MUSCLE_UP_FOOT_INDEX.right]),
  };
}

const repetitionConfigs: Partial<Record<ExerciseId, ExerciseRepConfig>> = {
  fondos: {
    direction: 'decrease',
    startMinAngle: 150,
    startMaxAngle: 180,
    activationAngle: 135,
    endMinAngle: DIP_VALID_MIN_ANGLE,
    endMaxAngle: DIP_VALID_MAX_ANGLE,
    endLabel: `codo entre ${DIP_VALID_MIN_ANGLE}–${DIP_VALID_MAX_ANGLE}°`,
  },
  jalon: {
    direction: 'decrease',
    startMinAngle: 150,
    startMaxAngle: 180,
    activationAngle: 135,
    endMinAngle: 25,
    endMaxAngle: 60,
    endLabel: 'ángulo cadera–hombro–codo entre 25–60°',
    countOnReturn: true,
  },
  'remo-barra': {
    direction: 'decrease',
    startMinAngle: 145,
    startMaxAngle: 180,
    activationAngle: 130,
    endMinAngle: 70,
    endMaxAngle: 115,
    endLabel: 'codo entre 70–115°',
  },
  flexiones: {
    direction: 'decrease',
    startMinAngle: 150,
    startMaxAngle: 180,
    activationAngle: 135,
    endMinAngle: 70,
    endMaxAngle: 105,
    endLabel: 'codo entre 70–105°',
  },
  'flexiones-declinadas': {
    direction: 'decrease',
    startMinAngle: 150,
    startMaxAngle: 180,
    activationAngle: 135,
    endMinAngle: 70,
    endMaxAngle: 105,
    endLabel: 'codo entre 70–105°',
  },
  'flexiones-pica': {
    direction: 'decrease',
    startMinAngle: 145,
    startMaxAngle: 180,
    activationAngle: 130,
    endMinAngle: 70,
    endMaxAngle: 110,
    endLabel: 'codo entre 70–110°',
  },
  'press-militar': {
    direction: 'decrease',
    startMinAngle: 145,
    startMaxAngle: 180,
    activationAngle: 130,
    endMinAngle: MILITARY_PRESS_VALID_MIN_ANGLE,
    endMaxAngle: MILITARY_PRESS_VALID_MAX_ANGLE,
    endLabel: `codo entre ${MILITARY_PRESS_VALID_MIN_ANGLE}–${MILITARY_PRESS_VALID_MAX_ANGLE}°`,
  },
  'triceps-polea-alta': {
    direction: 'increase',
    startMinAngle: 70,
    startMaxAngle: 120,
    activationAngle: 135,
    endMinAngle: 145,
    endMaxAngle: 180,
    endLabel: 'extensión entre 145–180°',
  },
  'extension-horizontal-barra': {
    direction: 'decrease',
    startMinAngle: 150,
    startMaxAngle: 180,
    activationAngle: 135,
    endMinAngle: 70,
    endMaxAngle: 105,
    endLabel: 'flexión de codo entre 70–105°',
  },
  'curl-biceps': {
    direction: 'decrease',
    startMinAngle: 85,
    startMaxAngle: 135,
    activationAngle: 70,
    endMinAngle: 30,
    endMaxAngle: 60,
    endLabel: 'flexión entre 30–60°',
  },
  zancadas: {
    direction: 'decrease',
    startMinAngle: 145,
    startMaxAngle: 180,
    activationAngle: 130,
    endMinAngle: 80,
    endMaxAngle: 100,
    endLabel: 'rodilla entre 80–100°',
  },
  'zancada-banco': {
    direction: 'decrease',
    startMinAngle: 145,
    startMaxAngle: 180,
    activationAngle: 130,
    endMinAngle: 80,
    endMaxAngle: 100,
    endLabel: 'rodilla entre 80–100°',
  },
};

function createExerciseRepTracker(): ExerciseRepTracker {
  return {
    phase: 'esperando inicio',
    repetitions: 0,
    goodRepetitions: 0,
    endpointAngle: null,
    samples: [],
    event: null,
  };
}

function isWithinAngle(angle: number, min: number, max: number) {
  return angle >= min && angle <= max;
}

function advanceExerciseRepTracker(
  tracker: ExerciseRepTracker,
  rawAngle: number,
  config: ExerciseRepConfig,
): ExerciseRepTrackerUpdate {
  const samples = [...tracker.samples, rawAngle].slice(-SQUAT_SMOOTHING_SAMPLES);
  const smoothedAngle = median(samples) ?? rawAngle;
  const nextTracker: ExerciseRepTracker = {
    ...tracker,
    samples,
    event: null,
  };
  const isAtStart = isWithinAngle(
    smoothedAngle,
    config.startMinAngle,
    config.startMaxAngle,
  );
  const hasActivated = config.direction === 'decrease'
    ? smoothedAngle < config.activationAngle
    : smoothedAngle > config.activationAngle;
  const isAtEnd = isWithinAngle(
    smoothedAngle,
    config.endMinAngle,
    config.endMaxAngle,
  );
  let completedEndpointAngle: number | null = null;

  if (nextTracker.phase === 'esperando inicio') {
    if (isAtStart) {
      nextTracker.phase = 'inicio';
      nextTracker.endpointAngle = null;
    }
  } else if (nextTracker.phase === 'inicio') {
    if (hasActivated) {
      nextTracker.phase = 'en movimiento';
      nextTracker.endpointAngle = smoothedAngle;
    } else if (!isAtStart) {
      nextTracker.phase = 'esperando inicio';
    }
  } else if (nextTracker.phase === 'en movimiento') {
    nextTracker.endpointAngle = config.direction === 'decrease'
      ? Math.min(nextTracker.endpointAngle ?? smoothedAngle, smoothedAngle)
      : Math.max(nextTracker.endpointAngle ?? smoothedAngle, smoothedAngle);

    if (isAtEnd) {
      nextTracker.phase = 'final';
      nextTracker.event = 'valid';
      nextTracker.repetitions += 1;
      nextTracker.goodRepetitions += 1;
      completedEndpointAngle = nextTracker.endpointAngle;
    } else if (isAtStart) {
      nextTracker.phase = 'inicio';
      nextTracker.endpointAngle = null;
    }
  } else if (nextTracker.phase === 'final') {
    if (config.countOnReturn) {
      const hasReturnedFromEnd = config.direction === 'decrease'
        ? smoothedAngle > config.endMaxAngle
        : smoothedAngle < config.endMinAngle;

      if (hasReturnedFromEnd) {
        nextTracker.phase = isAtStart ? 'inicio' : 'final';
        nextTracker.event = 'valid';
        nextTracker.repetitions += 1;
        nextTracker.goodRepetitions += 1;
        completedEndpointAngle = nextTracker.endpointAngle;
      }
    } else if (isAtStart) {
      nextTracker.phase = 'inicio';
    }
  }

  return { tracker: nextTracker, smoothedAngle, completedEndpointAngle };
}

function getRepetitionConfig(exercise: ExerciseId | null) {
  return exercise ? repetitionConfigs[exercise] ?? null : null;
}

function getExerciseConditionRows(exercise: ExerciseId | null): string[] {
  if (!exercise) return ['Esperando ejercicio'];

  switch (exercise) {
    case 'sentadillas':
      return [
        `Inicio arriba: ≥${SQUAT_TOP_THRESHOLD}°`,
        `Profundidad válida: ${SQUAT_VALID_MIN_ANGLE}–${SQUAT_VALID_MAX_ANGLE}°`,
        `Regreso arriba: >${SQUAT_RISE_THRESHOLD}°`,
      ];
    case 'dominadas':
    case 'dominadas-supinas':
      return [
        `Inicio / regreso: codo ${PULLUP_BOTTOM_MIN_ANGLE}–${PULLUP_BOTTOM_MAX_ANGLE}°`,
        `Activación: codo <${PULLUP_NO_LOCKOUT_ANGLE}°`,
        'Parte alta: cabeza por encima de las muñecas',
      ];
    case 'muscle-up':
      return [
        'Codos, rodillas y tobillos: rango pendiente',
        'Recorrido: registrar inicio y final',
        'No se marca el balanceo hasta calibrar la referencia',
      ];
    case 'fondos':
      return [
        `Inicio / regreso: codo 150–180°`,
        `Profundidad: codo ${DIP_VALID_MIN_ANGLE}–${DIP_VALID_MAX_ANGLE}°`,
        `Torso durante el recorrido: ${DIP_TORSO_MIN_ANGLE}–${DIP_TORSO_MAX_ANGLE}°`,
      ];
    case 'jalon':
      return [
        'Inicio / regreso: ángulo de recorrido 150–180°',
        `Final: recorrido ${PULLDOWN_ANGLE_MIN}–${PULLDOWN_ANGLE_MAX}°`,
        `Torso ${PULLDOWN_TORSO_MIN_ANGLE}–${PULLDOWN_TORSO_MAX_ANGLE}° · codo ${PULLDOWN_ELBOW_MIN_ANGLE}–${PULLDOWN_ELBOW_MAX_ANGLE}°`,
      ];
    case 'remo-barra':
      return [
        'Inicio / regreso: codo 145–180°',
        'Final: flexión de codo 70–115°',
        `Torso ${ROW_TORSO_MIN_ANGLE}–${ROW_TORSO_MAX_ANGLE}° · rodilla ${ROW_KNEE_MIN_ANGLE}–${ROW_KNEE_MAX_ANGLE}°`,
        `Elevación de codos ${ROW_ELBOW_TORSO_MIN_ANGLE}–${ROW_ELBOW_TORSO_MAX_ANGLE}°`,
      ];
    case 'flexiones':
      return [
        'Inicio / regreso: codo 150–180°',
        'Final: codo 70–105°',
        `Codo / torso ${PUSHUP_ELBOW_TORSO_MIN_ANGLE}–${PUSHUP_ELBOW_TORSO_MAX_ANGLE + PUSHUP_ELBOW_TORSO_TOLERANCE}° · cuerpo ${PUSHUP_BODY_LINE_MIN_ANGLE}–${PUSHUP_BODY_LINE_MAX_ANGLE}°`,
      ];
    case 'flexiones-declinadas':
      return [
        'Inicio / regreso: codo 150–180°',
        'Final: codo 70–105°',
        `Codo / torso 30–60° · cuerpo ${PUSHUP_BODY_LINE_MIN_ANGLE}–${PUSHUP_BODY_LINE_MAX_ANGLE}°`,
      ];
    case 'flexiones-pica':
      return [
        'Inicio / regreso: codo 145–180°',
        'Final: codo 70–110°',
        `Codo / cuerpo ${PIKE_ELBOW_BODY_MIN_ANGLE}–${PIKE_ELBOW_BODY_MAX_ANGLE}° · muñeca / hombro ${PIKE_WRIST_SHOULDER_MIN_ANGLE}–${PIKE_WRIST_SHOULDER_MAX_ANGLE}°`,
      ];
    case 'press-militar':
      return [
        'Inicio / regreso: codo 145–180°',
        `Final: codo ${MILITARY_PRESS_VALID_MIN_ANGLE}–${MILITARY_PRESS_VALID_MAX_ANGLE}°`,
        'Codos aproximadamente 45° respecto al torso',
      ];
    case 'triceps-polea-alta':
      return [
        'Inicio: codo 70–120°',
        'Activación: extensión >135°',
        'Final / extensión: codo 145–180°',
      ];
    case 'extension-horizontal-barra':
      return [
        'Inicio / regreso: codo 150–180°',
        'Activación: flexión <135°',
        'Final: codo 70–105° cerca de la frente',
      ];
    case 'curl-biceps':
      return [
        'Inicio / regreso: codo 85–135°',
        'Activación: flexión <70°',
        'Final: codo 30–60°',
      ];
    case 'zancadas':
      return [
        'Inicio / regreso: rodilla 145–180°',
        'Activación: rodilla <130°',
        `Final: rodilla ${LUNGE_KNEE_MIN_ANGLE}–${LUNGE_KNEE_MAX_ANGLE}° · cadera ${LUNGE_HIP_MIN_ANGLE}–${LUNGE_HIP_MAX_ANGLE}°`,
      ];
    case 'zancada-banco':
      return [
        'Inicio / regreso: rodilla 145–180°',
        'Activación: rodilla <130°',
        `Final: rodilla ${BENCH_LUNGE_KNEE_MIN_ANGLE}–${BENCH_LUNGE_KNEE_MAX_ANGLE}° · torso ${BENCH_LUNGE_TORSO_MIN_LEAN}–${BENCH_LUNGE_TORSO_MAX_LEAN}°`,
      ];
    case 'plancha':
      return [
        `Sostener: codo ${PLANK_ELBOW_MIN_ANGLE}–${PLANK_ELBOW_MAX_ANGLE}°`,
        `Brazo respecto al suelo: ${PLANK_ARM_FLOOR_MIN_ANGLE}–${PLANK_ARM_FLOOR_MAX_ANGLE}°`,
        `Línea corporal: ${PLANK_MIN_BODY_LINE_ANGLE}–180°`,
      ];
    default: {
      const config = getRepetitionConfig(exercise);
      return config
        ? [
            `Inicio: ${config.startMinAngle}–${config.startMaxAngle}°`,
            `Activación: ${config.direction === 'decrease' ? '<' : '>'}${config.activationAngle}°`,
            `Final: ${config.endMinAngle}–${config.endMaxAngle}°`,
          ]
        : ['Rangos técnicos visibles en el panel'];
    }
  }
}

function createSquatTracker(): SquatTracker {
  return {
    phase: 'esperando arriba',
    repetitions: 0,
    goodRepetitions: 0,
    minimumAngle: null,
    descentStartAngle: null,
    hasMeaningfulDescent: false,
    samples: [],
    event: null,
    currentRepCounted: false,
  };
}

function createPullupTracker(): PullupTracker {
  return {
    phase: 'esperando abajo',
    repetitions: 0,
    goodRepetitions: 0,
    minimumAngle: null,
    samples: [],
    event: null,
    lastAngle: null,
    topFrames: 0,
  };
}

function median(values: number[]) {
  const sorted = [...values].sort((first, second) => first - second);
  return sorted[Math.floor(sorted.length / 2)] ?? null;
}

function smoothAngleReading(
  value: number | null,
  samplesRef: { current: number[] },
) {
  if (value === null) {
    samplesRef.current = [];
    return null;
  }

  samplesRef.current = [
    ...samplesRef.current,
    value,
  ].slice(-ANGLE_DISPLAY_SAMPLES);
  return median(samplesRef.current) ?? value;
}

type SquatTrackerUpdate = {
  tracker: SquatTracker;
  smoothedAngle: number;
  completedMinimumAngle: number | null;
};

function advanceSquatTracker(tracker: SquatTracker, rawAngle: number): SquatTrackerUpdate {
  const samples = [...tracker.samples, rawAngle].slice(-SQUAT_SMOOTHING_SAMPLES);
  const smoothedAngle = median(samples);
  if (smoothedAngle === null) {
    return { tracker, smoothedAngle: rawAngle, completedMinimumAngle: null };
  }

  const nextTracker: SquatTracker = {
    ...tracker,
    samples,
    event: null,
  };
  let completedMinimumAngle: number | null = null;

  if (nextTracker.phase === 'esperando arriba') {
    if (smoothedAngle >= SQUAT_TOP_THRESHOLD) {
      nextTracker.phase = 'arriba';
      nextTracker.minimumAngle = null;
    }
    return { tracker: nextTracker, smoothedAngle, completedMinimumAngle };
  }

  if (nextTracker.phase === 'arriba' && smoothedAngle < SQUAT_TOP_THRESHOLD) {
    nextTracker.phase = 'bajando';
    nextTracker.minimumAngle = smoothedAngle;
    nextTracker.descentStartAngle = smoothedAngle;
    nextTracker.hasMeaningfulDescent = false;
    nextTracker.currentRepCounted = false;
  } else if (nextTracker.phase === 'bajando') {
    nextTracker.minimumAngle = nextTracker.minimumAngle === null
      ? rawAngle
      : Math.min(nextTracker.minimumAngle, rawAngle);
    if (nextTracker.descentStartAngle !== null
      && nextTracker.descentStartAngle - smoothedAngle >= SQUAT_MEANINGFUL_DESCENT) {
      nextTracker.hasMeaningfulDescent = true;
    }
    if (rawAngle <= SQUAT_VALID_MAX_ANGLE || smoothedAngle <= SQUAT_VALID_MAX_ANGLE) {
      nextTracker.phase = 'abajo';
      nextTracker.currentRepCounted = true;
      completedMinimumAngle = nextTracker.minimumAngle;
      if (rawAngle < SQUAT_VALID_MIN_ANGLE) {
        nextTracker.event = 'too-deep';
      } else {
        nextTracker.event = 'valid';
        nextTracker.goodRepetitions += 1;
      }
      nextTracker.repetitions += 1;
    } else if (nextTracker.hasMeaningfulDescent && smoothedAngle > SQUAT_RISE_THRESHOLD) {
      completedMinimumAngle = nextTracker.minimumAngle;
      nextTracker.phase = 'arriba';
      nextTracker.currentRepCounted = true;
      nextTracker.event = 'too-shallow';
      nextTracker.repetitions += 1;
    }
  } else if (nextTracker.phase === 'abajo') {
    nextTracker.minimumAngle = nextTracker.minimumAngle === null
      ? rawAngle
      : Math.min(nextTracker.minimumAngle, rawAngle);

    if (smoothedAngle > SQUAT_RISE_THRESHOLD) {
      nextTracker.phase = 'arriba';
      nextTracker.currentRepCounted = true;
      nextTracker.descentStartAngle = null;
      nextTracker.hasMeaningfulDescent = false;
    }
  }

  return { tracker: nextTracker, smoothedAngle, completedMinimumAngle };
}

type PullupTrackerUpdate = {
  tracker: PullupTracker;
  smoothedAngle: number;
  completedMinimumAngle: number | null;
};

type PullupTrackerConfig = {
  topMinAngle: number;
  topMaxAngle: number;
};

const STANDARD_PULLUP_TRACKER_CONFIG: PullupTrackerConfig = {
  topMinAngle: 0,
  topMaxAngle: 180,
};

const SUPINE_PULLUP_TRACKER_CONFIG: PullupTrackerConfig = {
  topMinAngle: 0,
  topMaxAngle: 180,
};

function advancePullupTracker(
  tracker: PullupTracker,
  rawAngle: number,
  headOverWrists: boolean,
  config: PullupTrackerConfig = STANDARD_PULLUP_TRACKER_CONFIG,
): PullupTrackerUpdate {
  const samples = [...tracker.samples, rawAngle].slice(-PULLUP_SMOOTHING_SAMPLES);
  const smoothedAngle = median(samples);
  if (smoothedAngle === null) {
    return { tracker, smoothedAngle: rawAngle, completedMinimumAngle: null };
  }

  const nextTracker: PullupTracker = {
    ...tracker,
    samples,
    event: null,
    lastAngle: smoothedAngle,
  };
  const isAtBottom = smoothedAngle >= PULLUP_BOTTOM_MIN_ANGLE
    && smoothedAngle <= PULLUP_BOTTOM_MAX_ANGLE;
  const hasStartedPull = smoothedAngle < PULLUP_NO_LOCKOUT_ANGLE;
  const hasReachedTopByAngle = smoothedAngle >= config.topMinAngle
    && smoothedAngle <= config.topMaxAngle
  const hasReachedTop = hasReachedTopByAngle && headOverWrists;
  const isRising = tracker.lastAngle !== null && smoothedAngle < tracker.lastAngle - 3;
  let completedMinimumAngle: number | null = null;

  if (nextTracker.phase === 'esperando abajo') {
    if (isAtBottom) nextTracker.phase = 'abajo';
  } else if (nextTracker.phase === 'abajo') {
    if (hasStartedPull) {
      nextTracker.phase = 'subiendo';
      nextTracker.minimumAngle = smoothedAngle;
    }
  } else if (nextTracker.phase === 'subiendo') {
    nextTracker.minimumAngle = nextTracker.minimumAngle === null
      ? smoothedAngle
      : Math.min(nextTracker.minimumAngle, smoothedAngle);

    nextTracker.topFrames = hasReachedTop ? nextTracker.topFrames + 1 : 0;
    if (nextTracker.topFrames >= 2) {
      nextTracker.phase = 'arriba';
      nextTracker.topFrames = 0;
    } else if (isAtBottom) {
      nextTracker.phase = 'abajo';
      nextTracker.event = 'no-top';
      nextTracker.repetitions += 1;
      completedMinimumAngle = nextTracker.minimumAngle;
    }
  } else if (nextTracker.phase === 'arriba') {
    nextTracker.topFrames = 0;
    if (isAtBottom) {
      nextTracker.phase = 'abajo';
      nextTracker.event = 'valid';
      nextTracker.repetitions += 1;
      nextTracker.goodRepetitions += 1;
      completedMinimumAngle = nextTracker.minimumAngle;
    } else if (smoothedAngle > config.topMaxAngle) {
      nextTracker.phase = 'bajando';
    }
  } else if (nextTracker.phase === 'bajando') {
    nextTracker.topFrames = 0;
    nextTracker.minimumAngle = nextTracker.minimumAngle === null
      ? smoothedAngle
      : Math.min(nextTracker.minimumAngle, smoothedAngle);

    if (isAtBottom) {
      nextTracker.phase = 'abajo';
      nextTracker.event = 'valid';
      nextTracker.repetitions += 1;
      nextTracker.goodRepetitions += 1;
      completedMinimumAngle = nextTracker.minimumAngle;
    } else if (isRising && smoothedAngle < PULLUP_NO_LOCKOUT_ANGLE) {
      nextTracker.phase = 'esperando abajo';
      nextTracker.event = 'no-lockout';
      nextTracker.repetitions += 1;
      completedMinimumAngle = nextTracker.minimumAngle;
    }
  }

  return { tracker: nextTracker, smoothedAngle, completedMinimumAngle };
}

function drawSkeleton(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  pose?: Pose,
  mirror = true,
) {
  const width = video.videoWidth;
  const height = video.videoHeight;
  if (!width || !height) return;
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;

  const context = canvas.getContext('2d');
  const keypoints = pose?.keypoints ?? [];
  if (!context) return;
  context.clearRect(0, 0, width, height);
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.strokeStyle = GREEN;
  context.lineWidth = Math.max(3, width / 240);
  context.shadowColor = 'rgba(57, 255, 106, 0.7)';
  context.shadowBlur = Math.max(5, width / 130);

  skeletonConnections.forEach(([start, end]) => {
    const first = keypoints[start];
    const second = keypoints[end];
    if (!first || !second || (first.score ?? 0) < 0.3 || (second.score ?? 0) < 0.3) return;
    const firstX = mirror ? width - first.x : first.x;
    const secondX = mirror ? width - second.x : second.x;
    context.beginPath();
    context.moveTo(firstX, first.y);
    context.lineTo(secondX, second.y);
    context.stroke();
  });

  context.shadowBlur = Math.max(3, width / 200);
  keypoints.forEach((point) => {
    if ((point.score ?? 0) < 0.3) return;
    const pointX = mirror ? width - point.x : point.x;
    context.beginPath();
    context.arc(pointX, point.y, Math.max(4, width / 115), 0, Math.PI * 2);
    context.fillStyle = GREEN;
    context.fill();
  });
  context.shadowBlur = 0;
}

function selectMostConfident(
  keypoints: PosePoint[] | undefined,
  label: string,
  leftIndex: number,
  rightIndex: number,
): DiagnosticPoint {
  const left = keypoints?.[leftIndex];
  const right = keypoints?.[rightIndex];
  const leftScore = left?.score ?? 0;
  const rightScore = right?.score ?? 0;

  if (!left && !right) return { label, score: null, side: '—' };
  if (rightScore > leftScore) return { label, score: right?.score ?? null, side: 'der.' };
  return { label, score: left?.score ?? null, side: 'izq.' };
}

const sideKeypoints: Record<PoseSide, Record<'shoulder' | 'elbow' | 'wrist' | 'hip' | 'knee' | 'ankle', number>> = {
  left: { shoulder: 11, elbow: 13, wrist: 15, hip: 23, knee: 25, ankle: 27 },
  right: { shoulder: 12, elbow: 14, wrist: 16, hip: 24, knee: 26, ankle: 28 },
};
const WRIST_TIP_INDEX: Record<PoseSide, number> = {
  left: 19,
  right: 20,
};

function getPoseCandidate(
  pose: Pose,
  videoWidth: number,
  videoHeight: number,
): PoseCandidate | null {
  const visiblePoints = (pose.keypoints ?? []).filter((point) => (point.score ?? 0) >= 0.3);
  if (visiblePoints.length < 4) return null;

  const minX = Math.min(...visiblePoints.map((point) => point.x));
  const maxX = Math.max(...visiblePoints.map((point) => point.x));
  const minY = Math.min(...visiblePoints.map((point) => point.y));
  const maxY = Math.max(...visiblePoints.map((point) => point.y));
  const frameArea = Math.max(1, videoWidth * videoHeight);
  const area = Math.max(0, (maxX - minX) * (maxY - minY)) / frameArea;
  const averageConfidence = visiblePoints.reduce(
    (sum, point) => sum + (point.score ?? 0),
    0,
  ) / visiblePoints.length;
  const visibilityRatio = visiblePoints.length / Math.max(POSE_LANDMARK_COUNT, pose.keypoints?.length ?? 0);

  return {
    pose,
    centerX: ((minX + maxX) / 2) / Math.max(1, videoWidth),
    centerY: ((minY + maxY) / 2) / Math.max(1, videoHeight),
    area,
    prominence: Math.min(1, area / 0.22) * 0.55
      + averageConfidence * 0.3
      + visibilityRatio * 0.15,
  };
}

function getPoseContinuityBonus(candidate: PoseCandidate, previousTrack: PoseTrack | null) {
  if (!previousTrack) return 0;

  const distance = Math.hypot(
    candidate.centerX - previousTrack.centerX,
    candidate.centerY - previousTrack.centerY,
  );
  if (distance > 0.28) return 0;

  const largerArea = Math.max(candidate.area, previousTrack.area, 0.001);
  const areaSimilarity = Math.min(candidate.area, previousTrack.area) / largerArea;
  return (1 - distance / 0.28) * areaSimilarity * 0.2;
}

function isPoseContinuous(candidate: PoseCandidate, previousTrack: PoseTrack) {
  return isPoseTrackContinuous(candidate, previousTrack);
}

function isPoseTrackContinuous(
  candidate: Pick<PoseTrack, 'centerX' | 'centerY' | 'area'>,
  previousTrack: PoseTrack,
) {
  const distance = Math.hypot(
    candidate.centerX - previousTrack.centerX,
    candidate.centerY - previousTrack.centerY,
  );
  const largerArea = Math.max(candidate.area, previousTrack.area, 0.001);
  const areaRatio = Math.min(candidate.area, previousTrack.area) / largerArea;

  return distance <= POSE_LOCK_MAX_CENTER_DISTANCE
    && areaRatio >= POSE_LOCK_MIN_AREA_RATIO;
}

function selectPrimaryPose(
  poses: Pose[],
  videoWidth: number,
  videoHeight: number,
  previousTrack: PoseTrack | null,
  lockToPrevious: boolean,
) {
  const candidates = poses
    .map((pose) => getPoseCandidate(pose, videoWidth, videoHeight))
    .filter((candidate): candidate is PoseCandidate => candidate !== null);
  if (!candidates.length) return null;

  const eligibleCandidates = lockToPrevious && previousTrack
    ? candidates.filter((candidate) => isPoseContinuous(candidate, previousTrack))
    : candidates;
  if (!eligibleCandidates.length) return null;

  const best = eligibleCandidates
    .map((candidate) => ({
      candidate,
      score: candidate.prominence + getPoseContinuityBonus(candidate, previousTrack),
    }))
    .sort((first, second) => second.score - first.score)[0].candidate;

  return {
    pose: best.pose,
    track: {
      centerX: best.centerX,
      centerY: best.centerY,
      area: best.area,
      lostFrames: 0,
    },
  };
}

function getDominantSide(
  keypoints: PosePoint[] | undefined,
  previousSide: PoseSide | null = null,
): DominantSideResult | null {
  if (!keypoints) return null;
  const sides: PoseSide[] = ['left', 'right'];
  const scores = sides.map((side) => {
    const indexes = Object.values(sideKeypoints[side]);
    const visible = indexes
      .map((index) => keypoints[index]?.score)
      .filter((score): score is number => typeof score === 'number');
    return {
      side,
      average: visible.length ? visible.reduce((sum, score) => sum + score, 0) / visible.length : 0,
      count: visible.length,
    };
  });
  const strongest = [...scores].sort((first, second) => second.average - first.average)[0];
  if (!strongest?.count) return null;

  const previous = previousSide
    ? scores.find((candidate) => candidate.side === previousSide)
    : null;
  const shouldKeepPreviousSide = Boolean(
    previous
    && previous.count >= 3
    && previous.average >= 0.3
    && strongest.side !== previous.side
    && strongest.average - previous.average < 0.18,
  );
  const selected = shouldKeepPreviousSide && previous ? previous : strongest;

  return { side: selected.side, average: selected.average };
}

function getBarbellRowDominantSide(
  keypoints: PosePoint[] | undefined,
  previousSide: PoseSide | null,
): DominantSideResult | null {
  if (!keypoints) return null;

  const sides: PoseSide[] = ['left', 'right'];
  const supportJoints: Array<keyof typeof sideKeypoints.left> = [
    'shoulder',
    'hip',
    'knee',
    'ankle',
  ];
  const armJoints: Array<keyof typeof sideKeypoints.left> = ['elbow', 'wrist'];
  const scores = sides.map((side) => {
    const indexes = sideKeypoints[side];
    const supportScores = supportJoints
      .map((joint) => keypoints[indexes[joint]]?.score ?? 0);
    const armScores = armJoints
      .map((joint) => keypoints[indexes[joint]]?.score ?? 0);
    const supportAverage = supportScores.reduce((sum, score) => sum + score, 0)
      / supportScores.length;
    const armAverage = armScores.reduce((sum, score) => sum + score, 0) / armScores.length;
    const supportCount = supportScores.filter((score) => score >= CAMERA_POINT_MIN_SCORE).length;

    return {
      side,
      average: supportAverage * 0.78 + armAverage * 0.22,
      supportAverage,
      supportCount,
    };
  });

  const strongest = scores.sort((first, second) => second.average - first.average)[0];
  if (!strongest) return null;
  const previous = previousSide
    ? scores.find((candidate) => candidate.side === previousSide)
    : null;
  const shouldKeepPreviousSide = Boolean(
    previous
    && strongest.side !== previous.side
    && previous.supportCount >= 3
    && previous.supportAverage >= 0.35
    && strongest.average - previous.average < 0.18,
  );
  const selected = shouldKeepPreviousSide && previous ? previous : strongest;

  return selected.supportCount || selected.average > 0
    ? { side: selected.side, average: selected.average }
    : null;
}

function stabilizePosePoints(
  keypoints: PosePoint[] | undefined,
  memory: PosePointMemoryMap,
) {
  const stabilized = [...(keypoints ?? [])];
  Array.from({ length: POSE_LANDMARK_COUNT }, (_, index) => index).forEach((index) => {
    const current = keypoints?.[index];
    const previous = memory[index];
    if (current && (current.score ?? 0) >= 0.2) {
      const world = current.world && previous?.point.world
        ? {
            x: current.world.x * 0.72 + previous.point.world.x * 0.28,
            y: current.world.y * 0.72 + previous.point.world.y * 0.28,
            z: current.world.z * 0.72 + previous.point.world.z * 0.28,
          }
        : current.world;
      const point = previous
        ? {
            ...current,
            x: current.x * 0.72 + previous.point.x * 0.28,
            y: current.y * 0.72 + previous.point.y * 0.28,
            world,
          }
        : current;
      stabilized[index] = point;
      memory[index] = { point, missingFrames: 0 };
      return;
    }

    if (previous && previous.missingFrames < POSE_STALE_POINT_FRAMES) {
      const point = {
        ...previous.point,
        score: Math.max(0.2, (previous.point.score ?? 0.3) * 0.86),
      };
      stabilized[index] = point;
      memory[index] = {
        point,
        missingFrames: previous.missingFrames + 1,
      };
      return;
    }

    delete memory[index];
  });

  return stabilized;
}

function hasFaceDetected(keypoints: PosePoint[] | undefined) {
  return [0, 1, 2, 3, 4].some((index) => (
    (keypoints?.[index]?.score ?? 0) >= FACE_POINT_MIN_SCORE
  ));
}

function getTrackedPointsForExercise(
  exercise: ExerciseId,
  keypoints: PosePoint[] | undefined,
  dominantSide: PoseSide | null,
) {
  const definition = getExercise(exercise);
  if (!definition || !keypoints) return [];

  const sides: PoseSide[] = definition.trackBothSides
    ? ['left', 'right']
    : dominantSide
      ? [dominantSide]
      : [];

  return sides.flatMap((side) => definition.trackedJoints.map(({ joint, label }) => {
    const index = joint === 'foot'
      ? MUSCLE_UP_FOOT_INDEX[side]
      : sideKeypoints[side][joint];
    return {
      label: definition.trackBothSides
        ? `${label} (${side === 'left' ? 'izq.' : 'der.'})`
        : label,
      point: keypoints[index],
    };
  }));
}

function getCameraGuidance(
  exercise: ExerciseId,
  keypoints: PosePoint[] | undefined,
  side: PoseSide | null,
  videoWidth: number,
  videoHeight: number,
): CameraGuidance {
  if (!keypoints || !side) {
    return {
      tone: 'checking',
      message: 'Ajustando la cámara',
      detail: exercise === 'press-militar'
        ? 'Ponte de frente o en 3/4 y muestra hombros, codos, muñecas y cadera.'
        : exercise === 'muscle-up'
          ? 'Ponte en semiperfil, unos 30°–45° respecto a la cámara; no uses un perfil totalmente lateral. Deja separados y visibles ambos codos, ambas rodillas y ambos tobillos, además de las manos y la barra.'
        : exercise === 'dominadas' || exercise === 'dominadas-supinas'
          ? 'Ponte de espaldas a la cámara y deja visibles ambos brazos, las manos, la cabeza y todo el cuerpo.'
        : exercise === 'fondos'
          ? 'Ponte de lado; la cámara puede estar en el suelo o inclinada. Muestra hombro, codo, muñeca y cadera.'
        : 'Ponte de lado y deja visibles las articulaciones necesarias. La cámara puede estar baja o inclinada.',
    };
  }

  const requiredPoints = getTrackedPointsForExercise(exercise, keypoints, side);
  const missingLabels = requiredPoints
    .filter(({ label, point }) => {
      const minimumScore = exercise === 'remo-barra'
        && (label.startsWith('codo') || label.startsWith('muñeca'))
        ? ROW_ARM_POINT_MIN_SCORE
        : CAMERA_POINT_MIN_SCORE;
      return (point?.score ?? 0) < minimumScore;
    })
    .map(({ label }) => label);

  if (missingLabels.length) {
    const visibleLabels = missingLabels.length === 1
      ? missingLabels[0]
      : `${missingLabels.slice(0, -1).join(', ')} y ${missingLabels[missingLabels.length - 1]}`;
    return {
      tone: 'warning',
      message: 'No veo todos los puntos necesarios',
      detail: `Deja visibles ${visibleLabels}. Puedes mover o inclinar el móvil como quieras, pero no tapes esas articulaciones.`,
    };
  }

  const framePoints = requiredPoints.map(({ point }) => point).filter(
    (point): point is PosePoint => Boolean(point),
  );
  const hasValidFrame = videoWidth > 0 && videoHeight > 0;
  const outsideFrame = hasValidFrame && framePoints.some((point) => (
    point.x < videoWidth * CAMERA_FRAME_MARGIN
    || point.x > videoWidth * (1 - CAMERA_FRAME_MARGIN)
    || point.y < videoHeight * CAMERA_FRAME_MARGIN
    || point.y > videoHeight * (1 - CAMERA_FRAME_MARGIN)
  ));

  if (outsideFrame) {
    return {
      tone: 'warning',
      message: 'Deja más espacio alrededor de tu cuerpo',
      detail: exercise === 'press-militar'
        ? 'Las muñecas pueden salir del encuadre al subir. Aleja el móvil y deja margen sobre la cabeza.'
        : 'Solo una articulación está demasiado cerca del borde. Ajusta un poco el encuadre sin necesidad de nivelar la cámara.',
    };
  }

  const leftShoulder = keypoints[sideKeypoints.left.shoulder];
  const rightShoulder = keypoints[sideKeypoints.right.shoulder];
  const leftHip = keypoints[sideKeypoints.left.hip];
  const rightHip = keypoints[sideKeypoints.right.hip];
  const shouldersAreVisible = [leftShoulder, rightShoulder, leftHip, rightHip]
    .every((point) => (point?.score ?? 0) >= CAMERA_POINT_MIN_SCORE);

  if (shouldersAreVisible) {
    const shoulderWidth = Math.hypot(
      rightShoulder.x - leftShoulder.x,
      rightShoulder.y - leftShoulder.y,
    );
    const torsoLength = Math.max(
      Math.hypot(leftShoulder.x - leftHip.x, leftShoulder.y - leftHip.y),
      Math.hypot(rightShoulder.x - rightHip.x, rightShoulder.y - rightHip.y),
    );
    const cameraRoll = Math.atan2(
      Math.abs(rightShoulder.y - leftShoulder.y),
      Math.abs(rightShoulder.x - leftShoulder.x),
    ) * (180 / Math.PI);

    if (cameraRoll > MAX_CAMERA_ROLL_DEGREES) {
      return {
        tone: 'warning',
        message: 'Endereza un poco el móvil',
        detail: 'La inclinación actual es demasiado extrema para separar el movimiento de la cámara. Una inclinación moderada sí funciona.',
      };
    }

    if (
      exercise !== 'press-militar'
      && exercise !== 'dominadas'
      && exercise !== 'dominadas-supinas'
      && torsoLength > 0
      && shoulderWidth / torsoLength > MAX_FRONT_VIEW_RATIO
    ) {
      return {
        tone: 'warning',
        message: 'Ponte principalmente de lado',
        detail: 'Este ejercicio necesita una vista lateral para distinguir el recorrido. Deja visibles las articulaciones sin quedar completamente de frente.',
      };
    }
  }

  return {
    tone: 'ready',
    message: 'Encuadre válido',
    detail: exercise === 'muscle-up'
      ? 'Lecturas listas. Mantén la barra y todo el cuerpo visibles en semiperfil; todavía no se juzga el balanceo.'
      : exercise === 'press-militar'
      ? 'Usa una vista frontal o en 3/4, móvil a la altura del pecho y brazos completos visibles.'
      : 'Los puntos necesarios están visibles. Puedes iniciar aunque el móvil esté bajo o inclinado.',
  };
}

function getMeasurementCoordinates(point: PosePoint): { x: number; y: number; z: number } {
  return point.world ?? { x: point.x, y: point.y, z: point.z ?? 0 };
}

function distanceBetweenPoints(first: PosePoint | undefined, second: PosePoint | undefined) {
  if (!first || !second) return null;
  const firstCoordinates = getMeasurementCoordinates(first);
  const secondCoordinates = getMeasurementCoordinates(second);
  return Math.hypot(
    firstCoordinates.x - secondCoordinates.x,
    firstCoordinates.y - secondCoordinates.y,
    firstCoordinates.z - secondCoordinates.z,
  );
}

function calculateAngle(
  first: PosePoint | undefined,
  vertex: PosePoint | undefined,
  last: PosePoint | undefined,
) {
  if (!first || !vertex || !last) return null;
  if ((first.score ?? 0) < 0.2 || (vertex.score ?? 0) < 0.2 || (last.score ?? 0) < 0.2) return null;

  const firstCoordinates = getMeasurementCoordinates(first);
  const vertexCoordinates = getMeasurementCoordinates(vertex);
  const lastCoordinates = getMeasurementCoordinates(last);
  const firstVector = {
    x: firstCoordinates.x - vertexCoordinates.x,
    y: firstCoordinates.y - vertexCoordinates.y,
    z: firstCoordinates.z - vertexCoordinates.z,
  };
  const lastVector = {
    x: lastCoordinates.x - vertexCoordinates.x,
    y: lastCoordinates.y - vertexCoordinates.y,
    z: lastCoordinates.z - vertexCoordinates.z,
  };
  const firstLength = Math.hypot(firstVector.x, firstVector.y, firstVector.z);
  const lastLength = Math.hypot(lastVector.x, lastVector.y, lastVector.z);
  if (!firstLength || !lastLength) return null;

  const cosine = Math.max(
    -1,
    Math.min(
      1,
      (
        firstVector.x * lastVector.x
        + firstVector.y * lastVector.y
        + firstVector.z * lastVector.z
      ) / (firstLength * lastLength),
    ),
  );
  return Math.round(Math.acos(cosine) * (180 / Math.PI));
}

const defaultTechniqueFeedback: TechniqueFeedback = {
  tone: 'checking',
  message: 'Colócate de lado',
  detail: 'Necesitamos ver tu hombro, codo, muñeca, cadera y tobillo.',
};

const defaultSquatFeedback: TechniqueFeedback = {
  tone: 'checking',
  message: 'Ángulo normalizado',
  detail: 'La inclinación, escala y altura de la cámara no cambian la medición.',
};

const muscleUpReferenceFeedback: TechniqueFeedback = {
  tone: 'checking',
  message: 'Lecturas de referencia activas',
  detail: 'Observa codos, rodillas y tobillos. Definiremos los rangos después de revisar tu ejecución correcta.',
};

function calculatePushupTechniqueAngles(
  keypoints: PosePoint[] | undefined,
  side: PoseSide | null,
) {
  if (!keypoints || !side) {
    return {
      elbowTorsoAngle: null,
      bodyLineAngle: null,
    };
  }

  const indexes = sideKeypoints[side];
  return {
    elbowTorsoAngle: calculateAngle(
      keypoints[indexes.hip],
      keypoints[indexes.shoulder],
      keypoints[indexes.elbow],
    ),
    bodyLineAngle: calculateAngle(
      keypoints[indexes.shoulder],
      keypoints[indexes.hip],
      keypoints[indexes.ankle],
    ),
  };
}

function isPushupTechniqueValid(
  keypoints: PosePoint[] | undefined,
  side: PoseSide | null,
  variant: 'regular' | 'declined' = 'regular',
) {
  const { elbowTorsoAngle, bodyLineAngle } = calculatePushupTechniqueAngles(keypoints, side);
  const elbowMin = variant === 'declined' ? 30 : PUSHUP_ELBOW_TORSO_MIN_ANGLE;
  const elbowMax = variant === 'declined'
    ? 60
    : PUSHUP_ELBOW_TORSO_MAX_ANGLE + PUSHUP_ELBOW_TORSO_TOLERANCE;
  return elbowTorsoAngle !== null
    && bodyLineAngle !== null
    && isWithinAngle(
      elbowTorsoAngle,
      elbowMin,
      elbowMax,
    )
    && isWithinAngle(
      bodyLineAngle,
      PUSHUP_BODY_LINE_MIN_ANGLE,
      PUSHUP_BODY_LINE_MAX_ANGLE,
    );
}

function getPushupTechniqueFeedback(
  keypoints: PosePoint[] | undefined,
  side: PoseSide | null,
  variant: 'regular' | 'declined' = 'regular',
): TechniqueFeedback {
  if (!keypoints || !side) return defaultTechniqueFeedback;

  const indexes = sideKeypoints[side];
  const nose = keypoints[0];
  const shoulder = keypoints[indexes.shoulder];
  const elbow = keypoints[indexes.elbow];
  const wrist = keypoints[indexes.wrist];
  const hip = keypoints[indexes.hip];
  const ankle = keypoints[indexes.ankle];
  const { elbowTorsoAngle, bodyLineAngle } = calculatePushupTechniqueAngles(keypoints, side);
  const neckAngle = calculateAngle(nose, shoulder, hip);

  if (
    elbowTorsoAngle === null
    || bodyLineAngle === null
    || neckAngle === null
    || !shoulder
    || !wrist
    || !hip
  ) {
    return defaultTechniqueFeedback;
  }

  const torsoLength = distanceBetweenPoints(shoulder, hip) ?? 0;
  const shoulderCoordinates = getMeasurementCoordinates(shoulder);
  const wristCoordinates = getMeasurementCoordinates(wrist);
  const wristOffset = torsoLength > 0
    ? Math.hypot(
        wristCoordinates.x - shoulderCoordinates.x,
        wristCoordinates.z - shoulderCoordinates.z,
      ) / torsoLength
    : 1;
  const bodyLineDeviation = Math.abs(180 - bodyLineAngle);
  const elbowMinAngle = variant === 'declined' ? 30 : PUSHUP_ELBOW_TORSO_MIN_ANGLE;
  const elbowMaxAngle = variant === 'declined'
    ? 60
    : PUSHUP_ELBOW_TORSO_MAX_ANGLE + PUSHUP_ELBOW_TORSO_TOLERANCE;

  if (elbowTorsoAngle > elbowMaxAngle) {
    return {
      tone: 'warning',
      message: 'Acerca los codos al torso',
       detail: `Están a ${elbowTorsoAngle}°. Busca ${PUSHUP_ELBOW_TORSO_MIN_ANGLE}°–${PUSHUP_ELBOW_TORSO_MAX_ANGLE}° y desciende con control.`,
    };
  }
  if (elbowTorsoAngle < elbowMinAngle) {
    return {
      tone: 'danger',
      message: 'No cierres demasiado los codos',
       detail: `Están a ${elbowTorsoAngle}°. Sepáralos suavemente hasta formar ${PUSHUP_ELBOW_TORSO_MIN_ANGLE}°–${PUSHUP_ELBOW_TORSO_MAX_ANGLE}° con el torso.`,
    };
  }
  if (wristOffset > 0.38) {
    return {
      tone: 'warning',
      message: 'Alinea las muñecas debajo de los hombros',
      detail: 'Ajusta la posición de las manos antes de continuar.',
    };
  }
  if (bodyLineDeviation > 18) {
    return {
      tone: 'danger',
      message: 'Mantén una línea recta',
      detail: 'Contrae abdomen y glúteos; evita arquear la espalda baja o elevar la cadera.',
    };
  }
  if (neckAngle < 155) {
    return {
      tone: 'warning',
      message: 'Mantén el cuello neutro',
      detail: 'Mira hacia el suelo sin estirar el cuello.',
    };
  }

  return {
    tone: 'success',
    message: variant === 'declined' ? 'Flexión declinada correcta' : 'Postura correcta',
    detail: variant === 'declined'
      ? `Codos a ${elbowTorsoAngle}° · cuerpo ${bodyLineAngle}°. Baja el pecho con control y mantén los pies firmes en el apoyo.`
      : `Codos a ${elbowTorsoAngle}°. Baja el pecho de forma controlada y extiende sin bloquear bruscamente.`,
  };
}

function getPikePushupTechniqueFeedback(
  keypoints: PosePoint[] | undefined,
  side: PoseSide | null,
): TechniqueFeedback {
  if (!keypoints || !side) return defaultTechniqueFeedback;

  const indexes = sideKeypoints[side];
  const shoulder = keypoints[indexes.shoulder];
  const elbow = keypoints[indexes.elbow];
  const wrist = keypoints[indexes.wrist];
  const hip = keypoints[indexes.hip];
  const ankle = keypoints[indexes.ankle];
  const elbowBodyAngle = calculateAngle(hip, shoulder, elbow);
  const wristShoulderAngle = calculateAngleToFloor(shoulder, wrist);
  const bodyFoldAngle = calculateAngle(shoulder, hip, ankle);

  if (
    elbowBodyAngle === null
    || wristShoulderAngle === null
    || bodyFoldAngle === null
    || !shoulder
    || !hip
    || !wrist
  ) {
    return defaultTechniqueFeedback;
  }

  const torsoLength = distanceBetweenPoints(shoulder, hip) ?? 0;
  const shoulderCoordinates = getMeasurementCoordinates(shoulder);
  const hipCoordinates = getMeasurementCoordinates(hip);
  const wristCoordinates = getMeasurementCoordinates(wrist);
  const hipLiftRatio = torsoLength > 0
    ? (shoulderCoordinates.y - hipCoordinates.y) / torsoLength
    : 0;
  const wristOffset = torsoLength > 0
    ? Math.hypot(
        wristCoordinates.x - shoulderCoordinates.x,
        wristCoordinates.z - shoulderCoordinates.z,
      ) / torsoLength
    : 1;

  if (hipLiftRatio < PIKE_MIN_HIP_LIFT_RATIO) {
    return {
      tone: 'warning',
      message: 'Eleva la cadera',
      detail: 'Forma una V invertida: lleva la cadera hacia arriba antes de bajar la cabeza.',
    };
  }
  if (bodyFoldAngle < PIKE_MIN_BODY_FOLD_ANGLE) {
    return {
      tone: 'warning',
      message: 'Cierra un poco más la pica',
      detail: `La cadera está a ${bodyFoldAngle}°. Eleva más la cadera sin perder el control.`,
    };
  }
  if (bodyFoldAngle > PIKE_MAX_BODY_FOLD_ANGLE) {
    return {
      tone: 'warning',
      message: 'No pierdas la forma de V',
      detail: `La cadera está a ${bodyFoldAngle}°. Empuja el suelo y mantén la pica activa.`,
    };
  }
  if (wristOffset > 0.55) {
    return {
      tone: 'warning',
      message: 'Coloca las manos debajo de los hombros',
      detail: `Hombro y muñeca deben formar aproximadamente 90° con el suelo; ahora la separación es demasiado grande.`,
    };
  }
  if (wristShoulderAngle < PIKE_WRIST_SHOULDER_MIN_ANGLE
    || wristShoulderAngle > PIKE_WRIST_SHOULDER_MAX_ANGLE) {
    return {
      tone: 'warning',
      message: 'Alinea muñecas y hombros',
      detail: `La línea hombro-muñeca está a ${wristShoulderAngle}°. Busca aproximadamente 90° respecto al suelo.`,
    };
  }
  if (elbowBodyAngle > PIKE_ELBOW_BODY_MAX_ANGLE) {
    return {
      tone: 'checking',
      message: 'Acerca los codos al cuerpo',
      detail: `El ángulo codo-cuerpo es de ${elbowBodyAngle}°. Busca un rango entre 45° y 60°.`,
    };
  }
  if (elbowBodyAngle < PIKE_ELBOW_BODY_MIN_ANGLE) {
    return {
      tone: 'danger',
      message: 'No cierres demasiado los codos',
      detail: `El ángulo codo-cuerpo es de ${elbowBodyAngle}°. Sepáralos suavemente hasta 45°–60°.`,
    };
  }

  return {
    tone: 'success',
    message: 'Pica correcta',
    detail: `Codos a ${elbowBodyAngle}° · hombro-muñeca ${wristShoulderAngle}°. Mantén el cuerpo firme durante el movimiento.`,
  };
}

function getMilitaryPressTechniqueFeedback(
  keypoints: PosePoint[] | undefined,
  side: PoseSide | null,
): TechniqueFeedback {
  if (!keypoints || !side) {
    return {
      tone: 'checking',
      message: 'Ajustando la cámara',
      detail: 'Ponte de frente o en 3/4 y muestra hombros, codos, muñecas y cadera.',
    };
  }

  const indexes = sideKeypoints[side];
  const shoulder = keypoints[indexes.shoulder];
  const elbow = keypoints[indexes.elbow];
  const hip = keypoints[indexes.hip];
  const elbowTorsoAngle = calculateAngle(hip, shoulder, elbow);

  if (elbowTorsoAngle === null) return defaultTechniqueFeedback;

  if (elbowTorsoAngle > 60) {
    return {
      tone: 'warning',
      message: 'Acerca los codos al plano escapular',
      detail: `Tus codos están a ${elbowTorsoAngle}° respecto al torso. Llévalos hacia delante hasta aproximadamente 45°; evita abrirlos a 90°.`,
    };
  }
  if (elbowTorsoAngle < 30) {
    return {
      tone: 'warning',
      message: 'No cierres demasiado los codos',
      detail: `Tus codos están a ${elbowTorsoAngle}° respecto al torso. Sepáralos suavemente hasta el objetivo de 45°.`,
    };
  }

  return {
    tone: 'success',
    message: 'Press militar controlado',
    detail: `Codos a ${elbowTorsoAngle}° · plano escapular correcto. Empuja con control y evita abrirlos demasiado.`,
  };
}

function getTricepsPushdownTechniqueFeedback(
  keypoints: PosePoint[] | undefined,
  side: PoseSide | null,
): TechniqueFeedback {
  if (!keypoints || !side) return defaultTechniqueFeedback;

  const indexes = sideKeypoints[side];
  const shoulder = keypoints[indexes.shoulder];
  const elbow = keypoints[indexes.elbow];
  const wrist = keypoints[indexes.wrist];
  const hip = keypoints[indexes.hip];
  const ankle = keypoints[indexes.ankle];
  const elbowAngle = calculateAngle(shoulder, elbow, wrist);
  const bodyLineAngle = calculateAngle(shoulder, hip, ankle);

  if (elbowAngle === null || bodyLineAngle === null) return defaultTechniqueFeedback;

  if (bodyLineAngle < 160) {
    return {
      tone: 'warning',
      message: 'Mantén el torso estable',
      detail: `Tu cuerpo está a ${bodyLineAngle}°. Reduce la inclinación y deja que el movimiento salga del codo.`,
    };
  }
  if (elbowAngle < 70) {
    return {
      tone: 'warning',
      message: 'No cierres demasiado el codo',
      detail: `El codo está a ${elbowAngle}°. Sube un poco la barra y conserva el control sin comprimir la articulación.`,
    };
  }

  return {
    tone: 'success',
    message: 'Extensión de tríceps controlada',
    detail: `Codo ${elbowAngle}° · torso estable. Mantén los brazos cerca del cuerpo y extiende sin balancearte.`,
  };
}

function getHorizontalBarExtensionTechniqueFeedback(
  keypoints: PosePoint[] | undefined,
  side: PoseSide | null,
): TechniqueFeedback {
  if (!keypoints || !side) return defaultTechniqueFeedback;

  const indexes = sideKeypoints[side];
  const elbowAngle = calculateAngle(
    keypoints[indexes.shoulder],
    keypoints[indexes.elbow],
    keypoints[indexes.wrist],
  );

  if (elbowAngle === null) return defaultTechniqueFeedback;

  if (elbowAngle < 65) {
    return {
      tone: 'warning',
      message: 'No cierres demasiado el codo',
      detail: `El codo está a ${elbowAngle}°. Acerca la barra a la frente sin comprimir demasiado la articulación.`,
    };
  }

  return {
    tone: 'success',
    message: 'Extensión horizontal controlada',
    detail: `Codo ${elbowAngle}° · mantén los brazos estables y extiende la barra sin mover los hombros.`,
  };
}

function getBicepsCurlTechniqueFeedback(
  keypoints: PosePoint[] | undefined,
  side: PoseSide | null,
): TechniqueFeedback {
  if (!keypoints || !side) return defaultTechniqueFeedback;

  const indexes = sideKeypoints[side];
  const shoulder = keypoints[indexes.shoulder];
  const elbow = keypoints[indexes.elbow];
  const wrist = keypoints[indexes.wrist];
  const elbowAngle = calculateAngle(shoulder, elbow, wrist);
  if (elbowAngle === null) return defaultTechniqueFeedback;

  if (elbowAngle < 25) {
    return {
      tone: 'warning',
      message: 'No cierres demasiado el codo',
      detail: `El codo está a ${elbowAngle}°. Detén la subida cerca del pecho y conserva el control.`,
    };
  }
  if (elbowAngle > 60) {
    return {
      tone: 'warning',
      message: 'Sube un poco más',
      detail: `El codo está a ${elbowAngle}°. Lleva las manos casi hasta el pecho antes de bajar.`,
    };
  }

  return {
    tone: 'success',
    message: 'Curl controlado',
    detail: `Codo ${elbowAngle}° · rango correcto. Baja solo hasta mantener la tensión, sin extender por completo.`,
  };
}

function getLungeTechniqueFeedback(
  keypoints: PosePoint[] | undefined,
  side: PoseSide | null,
): TechniqueFeedback {
  if (!keypoints || !side) return defaultTechniqueFeedback;

  const frontIndexes = sideKeypoints[side];
  const rearSide: PoseSide = side === 'left' ? 'right' : 'left';
  const rearIndexes = sideKeypoints[rearSide];
  const frontShoulder = keypoints[frontIndexes.shoulder];
  const frontHip = keypoints[frontIndexes.hip];
  const frontKnee = keypoints[frontIndexes.knee];
  const frontAnkle = keypoints[frontIndexes.ankle];
  const rearHip = keypoints[rearIndexes.hip];
  const rearKnee = keypoints[rearIndexes.knee];
  const rearAnkle = keypoints[rearIndexes.ankle];
  const frontKneeAngle = calculateAngle(frontHip, frontKnee, frontAnkle);
  const rearKneeAngle = calculateAngle(rearHip, rearKnee, rearAnkle);
  const frontHipAngle = calculateAngle(frontShoulder, frontHip, frontKnee);
  const torsoAngle = calculateAngleToFloor(frontShoulder, frontHip);

  if (
    frontKneeAngle === null
    || rearKneeAngle === null
    || frontHipAngle === null
    || torsoAngle === null
    || !frontKnee
    || !frontAnkle
  ) {
    return defaultTechniqueFeedback;
  }

  const shinLength = distanceBetweenPoints(frontKnee, frontAnkle) ?? 0;
  const kneeCoordinates = getMeasurementCoordinates(frontKnee);
  const ankleCoordinates = getMeasurementCoordinates(frontAnkle);
  const kneeAnkleOffset = shinLength > 0
    ? Math.hypot(
        kneeCoordinates.x - ankleCoordinates.x,
        kneeCoordinates.z - ankleCoordinates.z,
      ) / shinLength
    : 1;

  if (frontKneeAngle > LUNGE_KNEE_MAX_ANGLE) {
    return {
      tone: 'warning',
      message: 'Baja más la rodilla delantera',
      detail: `La rodilla delantera está a ${frontKneeAngle}°. Busca aproximadamente 90° en la parte más baja.`,
    };
  }
  if (frontKneeAngle < LUNGE_KNEE_MIN_ANGLE) {
    return {
      tone: 'danger',
      message: 'No cierres demasiado la rodilla delantera',
      detail: `La rodilla delantera está a ${frontKneeAngle}°. Sube un poco para proteger la articulación.`,
    };
  }
  if (rearKneeAngle > LUNGE_KNEE_MAX_ANGLE) {
    return {
      tone: 'warning',
      message: 'Acerca la rodilla trasera al suelo',
      detail: `La rodilla trasera está a ${rearKneeAngle}°. Busca aproximadamente 90° sin golpear el suelo.`,
    };
  }
  if (rearKneeAngle < LUNGE_KNEE_MIN_ANGLE) {
    return {
      tone: 'danger',
      message: 'Controla la rodilla trasera',
      detail: `La rodilla trasera está a ${rearKneeAngle}°. Evita cerrarla demasiado al descender.`,
    };
  }
  if (frontHipAngle > LUNGE_HIP_MAX_ANGLE || frontHipAngle < LUNGE_HIP_MIN_ANGLE) {
    return {
      tone: 'warning',
      message: 'Ajusta la cadera delantera',
      detail: `La cadera delantera está a ${frontHipAngle}°. Busca 90° y deja el muslo paralelo al suelo.`,
    };
  }
  if (torsoAngle < LUNGE_TORSO_MIN_ANGLE || torsoAngle > LUNGE_TORSO_MAX_ANGLE) {
    return {
      tone: 'warning',
      message: 'Ajusta la inclinación del torso',
      detail: `Tu torso está a ${torsoAngle}° respecto al suelo. Mantén una inclinación de 75°–80°.`,
    };
  }
  if (kneeAnkleOffset > LUNGE_KNEE_ANKLE_MAX_OFFSET) {
    return {
      tone: 'warning',
      message: 'Alinea la rodilla con el tobillo',
      detail: 'Evita que la rodilla delantera se desplace demasiado respecto a la punta del pie.',
    };
  }

  return {
    tone: 'success',
    message: 'Zancada correcta',
    detail: `Rodilla delantera ${frontKneeAngle}° · trasera ${rearKneeAngle}° · cadera ${frontHipAngle}°.`,
  };
}

function getBenchLungeTechniqueFeedback(
  keypoints: PosePoint[] | undefined,
  side: PoseSide | null,
): TechniqueFeedback {
  if (!keypoints || !side) return defaultTechniqueFeedback;

  const indexes = sideKeypoints[side];
  const frontShoulder = keypoints[indexes.shoulder];
  const frontHip = keypoints[indexes.hip];
  const frontKnee = keypoints[indexes.knee];
  const frontAnkle = keypoints[indexes.ankle];
  const kneeAngle = calculateAngle(frontHip, frontKnee, frontAnkle);
  const torsoLean = calculateForwardLeanAngle(frontShoulder, frontHip);

  if (kneeAngle === null || torsoLean === null) return defaultTechniqueFeedback;

  if (kneeAngle > BENCH_LUNGE_KNEE_MAX_ANGLE) {
    return {
      tone: 'warning',
      message: 'Baja un poco más',
      detail: `La rodilla delantera está a ${kneeAngle}°. Busca entre 80° y 100°, idealmente cerca de 90°.`,
    };
  }
  if (kneeAngle < BENCH_LUNGE_KNEE_MIN_ANGLE) {
    return {
      tone: 'danger',
      message: 'No cierres demasiado la rodilla',
      detail: `La rodilla delantera está a ${kneeAngle}°. Sube un poco para evitar una flexión excesiva.`,
    };
  }
  if (torsoLean < BENCH_LUNGE_TORSO_MIN_LEAN) {
    return {
      tone: 'warning',
      message: 'Inclina ligeramente el torso',
      detail: `La inclinación es de ${torsoLean}°. Inclínate hacia delante entre 15° y 20° con la espalda recta.`,
    };
  }
  if (torsoLean > BENCH_LUNGE_TORSO_MAX_LEAN) {
    return {
      tone: 'warning',
      message: 'No inclines demasiado el torso',
      detail: `La inclinación es de ${torsoLean}°. Reduce el movimiento hasta un rango de 15°–20°.`,
    };
  }

  return {
    tone: 'success',
    message: 'Zancada en banco correcta',
    detail: `Rodilla ${kneeAngle}° · torso ${torsoLean}°. Sube con la pierna elevada y extiende con control sin bloquear la rodilla.`,
  };
}

function calculateForwardLeanAngle(
  shoulder: PosePoint | undefined,
  hip: PosePoint | undefined,
) {
  if (!shoulder || !hip) return null;
  if ((shoulder.score ?? 0) < 0.2 || (hip.score ?? 0) < 0.2) return null;

  const shoulderCoordinates = getMeasurementCoordinates(shoulder);
  const hipCoordinates = getMeasurementCoordinates(hip);
  const horizontalDistance = Math.hypot(
    shoulderCoordinates.x - hipCoordinates.x,
    shoulderCoordinates.z - hipCoordinates.z,
  );
  const verticalDistance = Math.abs(shoulderCoordinates.y - hipCoordinates.y);
  if (!horizontalDistance && !verticalDistance) return null;

  return Math.round(Math.atan2(horizontalDistance, verticalDistance) * (180 / Math.PI));
}

function isHeadOverWrists(
  keypoints: PosePoint[] | undefined,
  side: PoseSide | null,
) {
  if (!keypoints || !side) return false;
  const nose = keypoints[0];
  const wrist = keypoints[sideKeypoints[side].wrist];
  if (!nose || !wrist) return false;
  if ((nose.score ?? 0) < 0.2 || (wrist.score ?? 0) < 0.2) return false;
  // Para decidir si la cabeza pasó las manos importa la posición vertical
  // que ve la cámara. Las coordenadas 3D pueden variar con la profundidad
  // y hacían que el cierre de la repetición fallara en algunas vistas.
  return nose.y < wrist.y;
}

function getDipTechniqueFeedback(
  keypoints: PosePoint[] | undefined,
  side: PoseSide | null,
): TechniqueFeedback {
  if (!keypoints || !side) return defaultTechniqueFeedback;

  const indexes = sideKeypoints[side];
  const shoulder = keypoints[indexes.shoulder];
  const elbow = keypoints[indexes.elbow];
  const wrist = keypoints[indexes.wrist];
  const elbowAngle = calculateAngle(shoulder, elbow, wrist);
  const torsoLean = calculateForwardLeanAngle(shoulder, keypoints[indexes.hip]);

  if (elbowAngle === null || torsoLean === null) {
    return defaultTechniqueFeedback;
  }

  if (torsoLean < DIP_TORSO_MIN_ANGLE) {
    return {
      tone: 'warning',
      message: 'Inclina más el torso hacia delante',
      detail: `La inclinación es de ${torsoLean}°. Para trabajar el pecho, mantén el torso entre ${DIP_TORSO_MIN_ANGLE}° y ${DIP_TORSO_MAX_ANGLE}°.`,
    };
  }
  if (torsoLean > DIP_TORSO_MAX_ANGLE) {
    return {
      tone: 'warning',
      message: 'Reduce la inclinación del torso',
      detail: `La inclinación es de ${torsoLean}°. Mantén el torso entre ${DIP_TORSO_MIN_ANGLE}° y ${DIP_TORSO_MAX_ANGLE}°.`,
    };
  }
  if (elbowAngle > DIP_VALID_MAX_ANGLE) {
    return {
      tone: 'warning',
      message: 'Desciende hasta 90°',
      detail: `Tu codo está a ${elbowAngle}°. Baja de forma controlada hasta el rango ${DIP_VALID_MIN_ANGLE}–${DIP_VALID_MAX_ANGLE}°.`,
    };
  }
  if (elbowAngle < DIP_VALID_MIN_ANGLE) {
    return {
      tone: 'danger',
      message: 'No bajes demasiado',
      detail: `Tu codo está a ${elbowAngle}°. Sube un poco; el objetivo es ${DIP_VALID_MIN_ANGLE}–${DIP_VALID_MAX_ANGLE}°.`,
    };
  }

  return {
    tone: 'success',
    message: 'Fondo correcto',
    detail: `Torso ${torsoLean}° · codo ${elbowAngle}°. Mantén la inclinación y sube con control.`,
  };
}

function isDipTechniqueValid(
  keypoints: PosePoint[] | undefined,
  side: PoseSide | null,
) {
  if (!keypoints || !side) return false;

  const indexes = sideKeypoints[side];
  const requiredPoints = [
    keypoints[indexes.shoulder],
    keypoints[indexes.elbow],
    keypoints[indexes.wrist],
    keypoints[indexes.hip],
  ];
  if (requiredPoints.some((point) => (point?.score ?? 0) < CAMERA_POINT_MIN_SCORE)) {
    return false;
  }

  const torsoLean = calculateForwardLeanAngle(
    keypoints[indexes.shoulder],
    keypoints[indexes.hip],
  );
  const elbowAngle = calculateAngle(
    keypoints[indexes.shoulder],
    keypoints[indexes.elbow],
    keypoints[indexes.wrist],
  );

  return torsoLean !== null
    && elbowAngle !== null
    && isWithinAngle(torsoLean, DIP_TORSO_MIN_ANGLE, DIP_TORSO_MAX_ANGLE);
}

function getPullupTechniqueFeedback(
  keypoints: PosePoint[] | undefined,
  side: PoseSide | null,
): TechniqueFeedback {
  if (!keypoints || !side) return defaultTechniqueFeedback;

  const indexes = sideKeypoints[side];
  const shoulder = keypoints[indexes.shoulder];
  const elbow = keypoints[indexes.elbow];
  const wrist = keypoints[indexes.wrist];
  const elbowAngle = calculateAngle(shoulder, elbow, wrist);

  if (elbowAngle === null || !shoulder || !wrist) {
    return defaultTechniqueFeedback;
  }

  const headOverWrists = isHeadOverWrists(keypoints, side);

  if (elbowAngle >= PULLUP_BOTTOM_MIN_ANGLE) {
    return {
      tone: 'checking',
      message: 'Extiende bien los codos',
      detail: `Codo a ${elbowAngle}°. Desde esta extensión inicia la subida.`,
    };
  }
  if (!headOverWrists) {
    return {
      tone: 'warning',
      message: 'Sube un poco más',
      detail: 'La cabeza todavía no ha pasado por encima de las muñecas.',
    };
  }

  return {
    tone: 'success',
    message: 'Dominada válida',
    detail: `Codo a ${elbowAngle}° · extensión inicial/final ${PULLUP_BOTTOM_MIN_ANGLE}–${PULLUP_BOTTOM_MAX_ANGLE}° · cabeza por encima de las muñecas.`,
  };
}

function getSupinePullupTechniqueFeedback(
  keypoints: PosePoint[] | undefined,
  side: PoseSide | null,
): TechniqueFeedback {
  if (!keypoints || !side) return defaultTechniqueFeedback;

  const indexes = sideKeypoints[side];
  const shoulder = keypoints[indexes.shoulder];
  const elbow = keypoints[indexes.elbow];
  const wrist = keypoints[indexes.wrist];
  const elbowAngle = calculateAngle(shoulder, elbow, wrist);

  if (elbowAngle === null || !shoulder || !wrist) {
    return defaultTechniqueFeedback;
  }

  const headOverWrists = isHeadOverWrists(keypoints, side);

  if (elbowAngle >= PULLUP_BOTTOM_MIN_ANGLE) {
    return {
      tone: 'checking',
      message: 'Extiende bien los codos',
      detail: `Codo a ${elbowAngle}°. Desde esta extensión inicia la subida con agarre supino.`,
    };
  }
  if (!headOverWrists) {
    return {
      tone: 'warning',
      message: 'Sube un poco más',
      detail: 'La cabeza todavía no ha pasado por encima de las muñecas.',
    };
  }

  return {
    tone: 'success',
    message: 'Dominada supina válida',
    detail: `Codo a ${elbowAngle}° · extensión inicial/final ${PULLUP_BOTTOM_MIN_ANGLE}–${PULLUP_BOTTOM_MAX_ANGLE}° · cabeza por encima de las muñecas.`,
  };
}

function getLatPulldownTechniqueFeedback(
  keypoints: PosePoint[] | undefined,
  side: PoseSide | null,
): TechniqueFeedback {
  if (!keypoints || !side) return defaultTechniqueFeedback;

  const indexes = sideKeypoints[side];
  const hip = keypoints[indexes.hip];
  const shoulder = keypoints[indexes.shoulder];
  const elbow = keypoints[indexes.elbow];
  const wrist = keypoints[indexes.wrist];
  const pulldownAngle = calculateAngle(hip, shoulder, elbow);
  const elbowAngle = calculateAngle(shoulder, elbow, wrist);
  const torsoLean = calculateForwardLeanAngle(shoulder, hip);

  if (pulldownAngle === null || elbowAngle === null || torsoLean === null) {
    return defaultTechniqueFeedback;
  }

  if (torsoLean < PULLDOWN_TORSO_MIN_ANGLE) {
    return {
      tone: 'warning',
      message: 'Inclina un poco el torso',
      detail: `El torso está a ${torsoLean}°. Para el jalón, mantén una inclinación erguida de ${PULLDOWN_TORSO_MIN_ANGLE}°–${PULLDOWN_TORSO_MAX_ANGLE}° respecto a la vertical.`,
    };
  }
  if (torsoLean > PULLDOWN_TORSO_MAX_ANGLE) {
    return {
      tone: 'danger',
      message: 'Endereza el torso',
      detail: `El torso está a ${torsoLean}°. No te balancees; vuelve al rango erguido de ${PULLDOWN_TORSO_MIN_ANGLE}°–${PULLDOWN_TORSO_MAX_ANGLE}°.`,
    };
  }

  if (pulldownAngle > PULLDOWN_ANGLE_MAX) {
    return {
      tone: 'warning',
      message: 'Baja más el ángulo',
      detail: `El ángulo cadera–hombro–codo está a ${pulldownAngle}°. Debe entrar entre 25° y 60°.`,
    };
  }
  if (pulldownAngle < PULLDOWN_ANGLE_MIN) {
    return {
      tone: 'danger',
      message: 'No cierres demasiado el ángulo',
      detail: `El ángulo cadera–hombro–codo está a ${pulldownAngle}°. Debe mantenerse entre 25° y 60°.`,
    };
  }
  if (elbowAngle < PULLDOWN_ELBOW_MIN_ANGLE) {
    return {
      tone: 'danger',
      message: 'No cierres demasiado los codos',
      detail: `El codo está a ${elbowAngle}°. En la parte baja del jalón busca aproximadamente ${PULLDOWN_ELBOW_MIN_ANGLE}°–${PULLDOWN_ELBOW_MAX_ANGLE}°.`,
    };
  }
  if (elbowAngle > PULLDOWN_ELBOW_MAX_ANGLE) {
    return {
      tone: 'warning',
      message: 'Baja un poco más los codos',
      detail: `El codo está a ${elbowAngle}°. Lleva la barra hacia el pecho y busca ${PULLDOWN_ELBOW_MIN_ANGLE}°–${PULLDOWN_ELBOW_MAX_ANGLE}°.`,
    };
  }

  return {
    tone: 'success',
    message: 'Rango correcto',
    detail: `Torso ${torsoLean}° · codo ${elbowAngle}° · tirón ${pulldownAngle}°. Vuelve a subir para contar la repetición.`,
  };
}

function isLatPulldownTechniqueValid(
  keypoints: PosePoint[] | undefined,
  side: PoseSide | null,
) {
  if (!keypoints || !side) return false;

  const indexes = sideKeypoints[side];
  const requiredPoints = [
    keypoints[indexes.hip],
    keypoints[indexes.shoulder],
    keypoints[indexes.elbow],
    keypoints[indexes.wrist],
  ];
  if (requiredPoints.some((point) => (point?.score ?? 0) < CAMERA_POINT_MIN_SCORE)) {
    return false;
  }

  const torsoLean = calculateForwardLeanAngle(
    keypoints[indexes.shoulder],
    keypoints[indexes.hip],
  );
  return torsoLean !== null
    && isWithinAngle(torsoLean, PULLDOWN_TORSO_MIN_ANGLE, PULLDOWN_TORSO_MAX_ANGLE);
}

function getBarbellRowTechniqueFeedback(
  keypoints: PosePoint[] | undefined,
  side: PoseSide | null,
): TechniqueFeedback {
  if (!keypoints || !side) return defaultTechniqueFeedback;

  const indexes = sideKeypoints[side];
  const shoulder = keypoints[indexes.shoulder];
  const elbow = keypoints[indexes.elbow];
  const wrist = keypoints[indexes.wrist];
  const hip = keypoints[indexes.hip];
  const knee = keypoints[indexes.knee];
  const ankle = keypoints[indexes.ankle];
  const elbowAngle = calculateAngle(shoulder, elbow, wrist);
  const elbowTorsoAngle = calculateAngle(hip, shoulder, elbow);
  const torsoLean = calculateForwardLeanAngle(shoulder, hip);
  const kneeAngle = calculateAngle(hip, knee, ankle);

  if (
    elbowAngle === null
    || elbowTorsoAngle === null
    || torsoLean === null
    || kneeAngle === null
    || !ankle
  ) {
    return defaultTechniqueFeedback;
  }

  if (torsoLean < ROW_TORSO_MIN_ANGLE) {
    return {
      tone: 'warning',
      message: 'Inclina más el torso',
      detail: `Tu torso está a ${torsoLean}°. Busca una inclinación de ${ROW_TORSO_MIN_ANGLE}°–${ROW_TORSO_MAX_ANGLE}° respecto a la vertical.`,
    };
  }
  if (torsoLean > ROW_TORSO_MAX_ANGLE) {
    return {
      tone: 'danger',
      message: 'Sube un poco el torso',
      detail: `Tu torso está a ${torsoLean}°. Mantén la espalda neutra dentro del rango ${ROW_TORSO_MIN_ANGLE}°–${ROW_TORSO_MAX_ANGLE}°.`,
    };
  }
  if (kneeAngle !== null && kneeAngle < ROW_KNEE_MIN_ANGLE) {
    return {
      tone: 'warning',
      message: 'Reduce la flexión de las rodillas',
      detail: `La rodilla está a ${kneeAngle}°. Mantén una flexión ligera, aproximadamente entre 150° y 180°.`,
    };
  }
  if (kneeAngle !== null && kneeAngle > ROW_KNEE_MAX_ANGLE) {
    return {
      tone: 'checking',
      message: 'Flexiona ligeramente las rodillas',
      detail: 'Desbloquea las rodillas para proteger la articulación y estabilizar la cadera.',
    };
  }
  if (elbowTorsoAngle > ROW_ELBOW_TORSO_MAX_ANGLE) {
    return {
      tone: 'warning',
      message: 'Baja un poco los codos',
      detail: `La elevación del codo está a ${elbowTorsoAngle}°. Mantén los codos entre ${ROW_ELBOW_TORSO_MIN_ANGLE}° y ${ROW_ELBOW_TORSO_MAX_ANGLE}° respecto al torso.`,
    };
  }
  if (elbowTorsoAngle < ROW_ELBOW_TORSO_MIN_ANGLE) {
    return {
      tone: 'warning',
      message: 'Sube un poco los codos',
      detail: `La elevación del codo está a ${elbowTorsoAngle}°. Llévalos suavemente al rango ${ROW_ELBOW_TORSO_MIN_ANGLE}°–${ROW_ELBOW_TORSO_MAX_ANGLE}° respecto al torso.`,
    };
  }

  return {
    tone: 'success',
    message: 'Remo con barra correcto',
    detail: `Torso ${torsoLean}° · codos ${elbowTorsoAngle}° · flexión del codo ${elbowAngle}°. Mantén la espalda neutra y lleva la barra hacia el cuerpo.`,
  };
}

function isBarbellRowTechniqueValid(
  keypoints: PosePoint[] | undefined,
  side: PoseSide | null,
) {
  if (!keypoints || !side) return false;

  const indexes = sideKeypoints[side];
  const bodyPoints = [
    keypoints[indexes.shoulder],
    keypoints[indexes.hip],
    keypoints[indexes.knee],
    keypoints[indexes.ankle],
  ];
  const armPoints = [
    keypoints[indexes.elbow],
    keypoints[indexes.wrist],
  ];
  if (
    bodyPoints.some((point) => (point?.score ?? 0) < CAMERA_POINT_MIN_SCORE)
    || armPoints.some((point) => (point?.score ?? 0) < ROW_ARM_POINT_MIN_SCORE)
  ) {
    return false;
  }

  const torsoLean = calculateForwardLeanAngle(
    keypoints[indexes.shoulder],
    keypoints[indexes.hip],
  );
  const kneeAngle = calculateAngle(
    keypoints[indexes.hip],
    keypoints[indexes.knee],
    keypoints[indexes.ankle],
  );
  const elbowTorsoAngle = calculateAngle(
    keypoints[indexes.hip],
    keypoints[indexes.shoulder],
    keypoints[indexes.elbow],
  );

  return torsoLean !== null
    && kneeAngle !== null
    && elbowTorsoAngle !== null
    && isWithinAngle(torsoLean, ROW_TORSO_MIN_ANGLE, ROW_TORSO_MAX_ANGLE)
    && isWithinAngle(kneeAngle, ROW_KNEE_MIN_ANGLE, ROW_KNEE_MAX_ANGLE)
    && isWithinAngle(
      elbowTorsoAngle,
      ROW_ELBOW_TORSO_MIN_ANGLE,
      ROW_ELBOW_TORSO_MAX_ANGLE,
    );
}

function calculateHipSagRatio(
  shoulder: PosePoint | undefined,
  hip: PosePoint | undefined,
  ankle: PosePoint | undefined,
) {
  if (!shoulder || !hip || !ankle) return null;
  if (
    (shoulder.score ?? 0) < 0.2
    || (hip.score ?? 0) < 0.2
    || (ankle.score ?? 0) < 0.2
  ) {
    return null;
  }

  const shoulderCoordinates = getMeasurementCoordinates(shoulder);
  const hipCoordinates = getMeasurementCoordinates(hip);
  const ankleCoordinates = getMeasurementCoordinates(ankle);
  const bodyVector = {
    x: ankleCoordinates.x - shoulderCoordinates.x,
    y: ankleCoordinates.y - shoulderCoordinates.y,
    z: ankleCoordinates.z - shoulderCoordinates.z,
  };
  const bodyLengthSquared = bodyVector.x ** 2 + bodyVector.y ** 2 + bodyVector.z ** 2;
  if (!bodyLengthSquared) return null;

  const hipVector = {
    x: hipCoordinates.x - shoulderCoordinates.x,
    y: hipCoordinates.y - shoulderCoordinates.y,
    z: hipCoordinates.z - shoulderCoordinates.z,
  };
  const projection = (
    (
      hipVector.x * bodyVector.x
      + hipVector.y * bodyVector.y
      + hipVector.z * bodyVector.z
    ) / bodyLengthSquared
  );
  const expectedHipY = shoulderCoordinates.y + projection * bodyVector.y;
  const expectedHipX = shoulderCoordinates.x + projection * bodyVector.x;
  const expectedHipZ = shoulderCoordinates.z + projection * bodyVector.z;
  return Math.hypot(
    hipCoordinates.x - expectedHipX,
    hipCoordinates.y - expectedHipY,
    hipCoordinates.z - expectedHipZ,
  ) / Math.sqrt(bodyLengthSquared) * (hipCoordinates.y - expectedHipY < 0 ? -1 : 1);
}

function calculateAngleToFloor(
  first: PosePoint | undefined,
  second: PosePoint | undefined,
) {
  if (!first || !second) return null;
  if ((first.score ?? 0) < 0.2 || (second.score ?? 0) < 0.2) return null;

  const firstCoordinates = getMeasurementCoordinates(first);
  const secondCoordinates = getMeasurementCoordinates(second);
  const horizontalDistance = Math.hypot(
    firstCoordinates.x - secondCoordinates.x,
    firstCoordinates.z - secondCoordinates.z,
  );
  const verticalDistance = Math.abs(firstCoordinates.y - secondCoordinates.y);
  if (!horizontalDistance && !verticalDistance) return null;

  return Math.round(Math.atan2(verticalDistance, horizontalDistance) * (180 / Math.PI));
}

function getPlankTechniqueFeedback(
  keypoints: PosePoint[] | undefined,
  side: PoseSide | null,
): TechniqueFeedback {
  if (!keypoints || !side) return defaultTechniqueFeedback;

  const indexes = sideKeypoints[side];
  const shoulder = keypoints[indexes.shoulder];
  const elbow = keypoints[indexes.elbow];
  const wrist = keypoints[indexes.wrist];
  const hip = keypoints[indexes.hip];
  const ankle = keypoints[indexes.ankle];
  const bodyLineAngle = calculateAngle(shoulder, hip, ankle);
  const elbowAngle = calculateAngle(shoulder, elbow, wrist);
  const armFloorAngle = calculateAngleToFloor(shoulder, elbow);
  const hipSagRatio = calculateHipSagRatio(shoulder, hip, ankle);

  if (
    bodyLineAngle === null
    || elbowAngle === null
    || armFloorAngle === null
    || hipSagRatio === null
  ) {
    return defaultTechniqueFeedback;
  }

  if (
    armFloorAngle < PLANK_ARM_FLOOR_MIN_ANGLE
    || armFloorAngle > PLANK_ARM_FLOOR_MAX_ANGLE
  ) {
    return {
      tone: 'warning',
      message: 'Alinea el hombro sobre el codo',
      detail: `El brazo está a ${armFloorAngle}° respecto al suelo. Busca 90° para apoyar el peso correctamente.`,
    };
  }
  if (elbowAngle > PLANK_ELBOW_MAX_ANGLE) {
    return {
      tone: 'warning',
      message: 'Flexiona el codo hasta 90°',
      detail: `La flexión del codo está a ${elbowAngle}°. Baja el cuerpo hasta el rango 80–100°.`,
    };
  }
  if (elbowAngle < PLANK_ELBOW_MIN_ANGLE) {
    return {
      tone: 'danger',
      message: 'No cierres demasiado el codo',
      detail: `La flexión del codo está a ${elbowAngle}°. Sube un poco para volver a 90°.`,
    };
  }
  if (hipSagRatio > PLANK_MAX_HIP_SAG_RATIO) {
    return {
      tone: 'danger',
      message: 'Eleva la cadera',
      detail: 'La cadera está bajando demasiado. Contrae el abdomen y mantén hombros, cadera y tobillos en línea.',
    };
  }
  if (hipSagRatio < -PLANK_MAX_HIP_RAISE_RATIO) {
    return {
      tone: 'warning',
      message: 'Baja un poco la cadera',
      detail: 'Evita elevar demasiado la cadera; busca una línea recta desde los hombros hasta los tobillos.',
    };
  }
  if (bodyLineAngle < PLANK_MIN_BODY_LINE_ANGLE) {
    return {
      tone: 'warning',
      message: 'Alinea todo el cuerpo',
      detail: `El ángulo corporal es de ${bodyLineAngle}°. Busca aproximadamente 180° sin doblarte desde la cadera.`,
    };
  }

  return {
    tone: 'success',
    message: 'Plancha alineada',
    detail: `Brazo al suelo ${armFloorAngle}° · codo ${elbowAngle}° · cadera estable.`,
  };
}

function calculateExerciseAngle(
  exercise: ExerciseId,
  keypoints: PosePoint[] | undefined,
  side: PoseSide | null,
) {
  if (!keypoints || !side) return null;
  const indexes = sideKeypoints[side];
  if (
    exercise === 'fondos'
    || exercise === 'dominadas'
    || exercise === 'dominadas-supinas'
    || exercise === 'jalon'
    || exercise === 'remo-barra'
    || exercise === 'flexiones'
    || exercise === 'flexiones-declinadas'
    || exercise === 'flexiones-pica'
    || exercise === 'press-militar'
    || exercise === 'triceps-polea-alta'
    || exercise === 'extension-horizontal-barra'
    || exercise === 'curl-biceps'
    || exercise === 'zancadas'
    || exercise === 'zancada-banco'
  ) {
    if (exercise === 'flexiones' || exercise === 'flexiones-declinadas') {
      return calculateAngle(keypoints[indexes.hip], keypoints[indexes.shoulder], keypoints[indexes.elbow]);
    }
    if (exercise === 'flexiones-pica') {
      return calculateAngle(keypoints[indexes.hip], keypoints[indexes.shoulder], keypoints[indexes.elbow]);
    }
    if (exercise === 'press-militar') {
      return calculateAngle(
        keypoints[indexes.shoulder],
        keypoints[indexes.elbow],
        keypoints[indexes.wrist],
      );
    }
    if (exercise === 'zancadas' || exercise === 'zancada-banco') {
      return calculateAngle(keypoints[indexes.hip], keypoints[indexes.knee], keypoints[indexes.ankle]);
    }
    if (exercise === 'jalon') {
      return calculateAngle(keypoints[indexes.hip], keypoints[indexes.shoulder], keypoints[indexes.elbow]);
    }
    return calculateAngle(keypoints[indexes.shoulder], keypoints[indexes.elbow], keypoints[indexes.wrist]);
  }
  if (exercise === 'sentadillas') {
    return calculateAngle(keypoints[indexes.hip], keypoints[indexes.knee], keypoints[indexes.ankle]);
  }
  return calculateAngle(keypoints[indexes.shoulder], keypoints[indexes.elbow], keypoints[indexes.wrist]);
}

function calculateRepetitionAngle(
  exercise: ExerciseId,
  keypoints: PosePoint[] | undefined,
  side: PoseSide | null,
) {
  if (!keypoints || !side) return null;
  const indexes = sideKeypoints[side];

  if (exercise === 'zancadas' || exercise === 'zancada-banco') {
    return calculateAngle(
      keypoints[indexes.hip],
      keypoints[indexes.knee],
      keypoints[indexes.ankle],
    );
  }

  if (exercise === 'plancha') return null;

  if (exercise === 'jalon') {
    return calculateAngle(
      keypoints[indexes.hip],
      keypoints[indexes.shoulder],
      keypoints[indexes.elbow],
    );
  }

  return calculateAngle(
    keypoints[indexes.shoulder],
    keypoints[indexes.elbow],
    keypoints[indexes.wrist],
  );
}

function calculateSquatAngle(keypoints: PosePoint[] | undefined) {
  if (!keypoints) return null;

  const candidates = (['left', 'right'] as PoseSide[])
    .map((side) => {
      const indexes = sideKeypoints[side];
      const angle = calculateAngle(
        keypoints[indexes.hip],
        keypoints[indexes.knee],
        keypoints[indexes.ankle],
      );
      const confidencePoints = [indexes.hip, indexes.knee, indexes.ankle]
        .map((index) => keypoints[index]?.score ?? 0);
      const confidence = confidencePoints.reduce((sum, score) => sum + score, 0) / confidencePoints.length;
      return { angle, confidence };
    })
    .filter((candidate): candidate is { angle: number; confidence: number } => (
      candidate.angle !== null && candidate.confidence >= 0.45
    ))
    .sort((first, second) => second.confidence - first.confidence);

  if (!candidates.length) return null;
  const strongest = candidates[0];
  const second = candidates[1];
  if (second && strongest.confidence >= 0.45 && second.confidence >= 0.45
    && Math.abs(strongest.angle - second.angle) <= 24) {
    return Math.round((strongest.angle + second.angle) / 2);
  }
  return strongest.angle;
}

function getAngleDiagnosticPoints(
  exercise: ExerciseId,
  keypoints: PosePoint[] | undefined,
  side: PoseSide | null,
): AngleDiagnosticPoint[] {
  const labels: Record<ExerciseId, Array<{ label: string; joint: keyof typeof sideKeypoints.left }>> = {
    fondos: [
      { label: 'Cadera', joint: 'hip' },
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
      { label: 'Muñeca', joint: 'wrist' },
    ],
    dominadas: [
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
      { label: 'Muñeca', joint: 'wrist' },
    ],
    'dominadas-supinas': [
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
      { label: 'Muñeca', joint: 'wrist' },
    ],
    'muscle-up': [
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
      { label: 'Muñeca', joint: 'wrist' },
      { label: 'Cadera', joint: 'hip' },
      { label: 'Rodilla', joint: 'knee' },
      { label: 'Tobillo', joint: 'ankle' },
    ],
    jalon: [
      { label: 'Cadera', joint: 'hip' },
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
      { label: 'Muñeca', joint: 'wrist' },
    ],
    'remo-barra': [
      { label: 'Cadera', joint: 'hip' },
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
      { label: 'Muñeca', joint: 'wrist' },
      { label: 'Rodilla', joint: 'knee' },
      { label: 'Tobillo', joint: 'ankle' },
    ],
    flexiones: [
      { label: 'Cadera', joint: 'hip' },
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
    ],
    'flexiones-declinadas': [
      { label: 'Cadera', joint: 'hip' },
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
    ],
    'flexiones-pica': [
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
      { label: 'Muñeca', joint: 'wrist' },
    ],
    'press-militar': [
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
      { label: 'Muñeca', joint: 'wrist' },
    ],
    'triceps-polea-alta': [
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
      { label: 'Muñeca', joint: 'wrist' },
    ],
    'extension-horizontal-barra': [
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
      { label: 'Muñeca', joint: 'wrist' },
    ],
    'curl-biceps': [
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
      { label: 'Muñeca', joint: 'wrist' },
    ],
    sentadillas: [
      { label: 'Cadera', joint: 'hip' },
      { label: 'Rodilla', joint: 'knee' },
      { label: 'Tobillo', joint: 'ankle' },
    ],
    zancadas: [
      { label: 'Cadera', joint: 'hip' },
      { label: 'Rodilla', joint: 'knee' },
      { label: 'Tobillo', joint: 'ankle' },
    ],
    'zancada-banco': [
      { label: 'Cadera', joint: 'hip' },
      { label: 'Rodilla', joint: 'knee' },
      { label: 'Tobillo', joint: 'ankle' },
    ],
    plancha: [
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
      { label: 'Muñeca', joint: 'wrist' },
    ],
  };
  const indexes = side ? sideKeypoints[side] : null;
  const diagnosticJoints: TrackedJointDefinition[] = getExercise(exercise)?.trackedJoints
    ?? labels[exercise];

  return diagnosticJoints.map(({ label, joint }) => {
    const pointIndex = joint === 'foot'
      ? side ? MUSCLE_UP_FOOT_INDEX[side] : undefined
      : indexes?.[joint];
    const point = pointIndex === undefined ? undefined : keypoints?.[pointIndex];
    return {
      label: label.charAt(0).toUpperCase() + label.slice(1),
      x: point?.x ?? null,
      y: point?.y ?? null,
      z: point?.world?.z ?? point?.z ?? null,
    };
  });
}

function createLiveAngleReading(
  label: string,
  value: number | null,
  target: string,
  min?: number,
  max?: number,
): LiveAngleReading {
  return { label, value, target, min, max };
}

function calculateDipJointReadings(
  keypoints: PosePoint[] | undefined,
  side: PoseSide | null,
): DipJointReading[] {
  const empty = (label: string): DipJointReading => ({ label, value: null });
  if (!keypoints || !side) {
    return ['Cadera', 'Hombro', 'Codo', 'Muñeca'].map(empty);
  }

  const indexes = sideKeypoints[side];
  return [
    {
      label: 'Cadera',
      // Para fondos, la cadera se expresa como la inclinación del torso
      // respecto a la vertical, que es la referencia técnica del ejercicio.
      value: calculateForwardLeanAngle(
        keypoints[indexes.shoulder],
        keypoints[indexes.hip],
      ),
    },
    {
      label: 'Hombro',
      value: calculateAngle(
        keypoints[indexes.hip],
        keypoints[indexes.shoulder],
        keypoints[indexes.elbow],
      ),
    },
    {
      label: 'Codo',
      value: calculateAngle(
        keypoints[indexes.shoulder],
        keypoints[indexes.elbow],
        keypoints[indexes.wrist],
      ),
    },
    {
      label: 'Muñeca',
      value: calculateAngle(
        keypoints[indexes.elbow],
        keypoints[indexes.wrist],
        keypoints[WRIST_TIP_INDEX[side]],
      ),
    },
  ];
}

function isHeadOverBothWrists(
  keypoints: PosePoint[] | undefined,
): boolean | null {
  const nose = keypoints?.[0];
  const wrists = [sideKeypoints.left.wrist, sideKeypoints.right.wrist]
    .map((index) => keypoints?.[index])
    .filter((point): point is PosePoint => (point?.score ?? 0) >= 0.2);

  if (!nose || (nose.score ?? 0) < 0.2 || !wrists.length) return null;

  const averageWristY = wrists.reduce((sum, wrist) => sum + wrist.y, 0) / wrists.length;
  return nose.y < averageWristY;
}

function calculatePullupJointReadings(
  keypoints: PosePoint[] | undefined,
): DipJointReading[] {
  if (!keypoints) {
    return [
      { label: 'Hombro izq.', value: null },
      { label: 'Hombro der.', value: null },
      { label: 'Codo izq.', value: null },
      { label: 'Codo der.', value: null },
      { label: 'Muñeca izq.', value: null },
      { label: 'Muñeca der.', value: null },
      { label: 'Cabeza', value: null },
    ];
  }

  const readings = (side: PoseSide, shortSide: string): DipJointReading[] => {
    const indexes = sideKeypoints[side];
    return [
      {
        label: `Hombro ${shortSide}`,
        value: calculateAngle(
          keypoints[indexes.hip],
          keypoints[indexes.shoulder],
          keypoints[indexes.elbow],
        ),
      },
      {
        label: `Codo ${shortSide}`,
        value: calculateAngle(
          keypoints[indexes.shoulder],
          keypoints[indexes.elbow],
          keypoints[indexes.wrist],
        ),
      },
      {
        label: `Muñeca ${shortSide}`,
        value: calculateAngle(
          keypoints[indexes.elbow],
          keypoints[indexes.wrist],
          keypoints[WRIST_TIP_INDEX[side]],
        ),
      },
    ];
  };

  const headOverWrists = isHeadOverBothWrists(keypoints);
  return [
    ...readings('left', 'izq.'),
    ...readings('right', 'der.'),
    {
      label: 'Cabeza',
      value: null,
      status: headOverWrists === null
        ? '—'
        : headOverWrists
          ? 'SOBRE'
          : 'BAJO',
    },
  ];
}

function calculateLiveAngleReadings(
  exercise: ExerciseId | null,
  keypoints: PosePoint[] | undefined,
  side: PoseSide | null,
): LiveAngleReading[] {
  const empty = (label: string, target: string) => createLiveAngleReading(label, null, target);
  if (!exercise) return [empty('Esperando', 'Selecciona un ejercicio')];

  const indexes = side ? sideKeypoints[side] : null;
  const value = (calculator: () => number | null, label: string, target: string, min?: number, max?: number) => (
    createLiveAngleReading(label, calculator(), target, min, max)
  );

  if (!keypoints || !indexes) {
    switch (exercise) {
      case 'fondos':
        return [
          empty('Codo', 'Inicio 150–180° · activa <135° · final 85–95°'),
          empty('Torso', '30–40°'),
        ];
      case 'dominadas':
      case 'dominadas-supinas':
        return [
          empty('Codo', 'Inicio / regreso 160–180°'),
          empty('Codo / activación', '<155° · arriba: cabeza sobre muñecas'),
        ];
      case 'muscle-up':
        return [
          empty('Codo izq.', 'Calibración'),
          empty('Codo der.', 'Calibración'),
          empty('Rodilla izq.', 'Calibración'),
          empty('Rodilla der.', 'Calibración'),
          empty('Tobillo izq.', 'Calibración'),
          empty('Tobillo der.', 'Calibración'),
        ];
      case 'jalon':
        return [
          empty('Torso', '10–30°'),
          empty('Codo', '80–120°'),
          empty('Tirón', 'Inicio 150–180° · activa <135° · final 25–60°'),
        ];
      case 'remo-barra':
        return [
          empty('Torso', '30–45°'),
          empty('Rodilla', '150–180°'),
          empty('Codos', '15–30°'),
          empty('Flexión', 'Inicio 145–180° · activa <130° · final 70–115°'),
        ];
      case 'flexiones':
      case 'flexiones-declinadas':
        return [
          empty('Codo / torso', exercise === 'flexiones' ? '45–100°' : '30–60°'),
          empty('Alineación', '162–180°'),
          empty('Flexión', 'Inicio 150–180° · activa <135° · final 70–105°'),
        ];
      case 'flexiones-pica':
        return [
          empty('Codo', 'Inicio 145–180° · activa <130° · final 70–110°'),
          empty('Codo / cuerpo', '45–60°'),
          empty('Muñeca / hombro', '75–105°'),
          empty('Cadera', '45–125°'),
        ];
      case 'press-militar':
        return [
          empty('Codo', 'Inicio 145–180° · activa <130° · final 85–110°'),
          empty('Codo / torso', '30–60°'),
        ];
      case 'triceps-polea-alta':
        return [
          empty('Codo', 'Inicio 70–120° · activa >135° · final 145–180°'),
          empty('Torso', '160–180°'),
        ];
      case 'extension-horizontal-barra':
        return [empty('Codo', 'Inicio 150–180° · activa <135° · final 70–105°')];
      case 'curl-biceps':
        return [empty('Codo', 'Inicio 85–135° · activa <70° · final 30–60°')];
      case 'sentadillas':
        return [empty('Rodilla', 'Inicio ≥140° · regreso >115° · fondo 83–90°')];
      case 'zancadas':
        return [
          empty('Rodilla delantera', 'Inicio 145–180° · activa <130° · final 80–100°'),
          empty('Rodilla trasera', '80–100°'),
          empty('Cadera', '80–100°'),
          empty('Torso', '75–80°'),
        ];
      case 'zancada-banco':
        return [
          empty('Rodilla', 'Inicio 145–180° · activa <130° · final 80–100°'),
          empty('Torso', '15–20°'),
        ];
      case 'plancha':
        return [empty('Codo', '80–100°'), empty('Brazo / suelo', '80–100°'), empty('Cuerpo', '162–180°')];
      default:
        return [empty('Ángulo principal', getExercise(exercise)?.angleLabel ?? 'Esperando puntos')];
    }
  }

  const elbow = () => calculateAngle(
    keypoints[indexes.shoulder],
    keypoints[indexes.elbow],
    keypoints[indexes.wrist],
  );
  const torso = () => calculateForwardLeanAngle(
    keypoints[indexes.shoulder],
    keypoints[indexes.hip],
  );
  const bodyLine = () => calculateAngle(
    keypoints[indexes.shoulder],
    keypoints[indexes.hip],
    keypoints[indexes.ankle],
  );
  const knee = () => calculateAngle(
    keypoints[indexes.hip],
    keypoints[indexes.knee],
    keypoints[indexes.ankle],
  );

  switch (exercise) {
    case 'fondos':
      return [
        value(
          elbow,
          'Codo',
          'Inicio 150–180° · activa <135° · final 85–95°',
          DIP_VALID_MIN_ANGLE,
          DIP_VALID_MAX_ANGLE,
        ),
        value(torso, 'Torso', '30–40°', DIP_TORSO_MIN_ANGLE, DIP_TORSO_MAX_ANGLE),
      ];
    case 'dominadas':
    case 'dominadas-supinas':
      return [
        value(
          elbow,
          'Codo',
          'Inicio / regreso 160–180°',
          PULLUP_BOTTOM_MIN_ANGLE,
          PULLUP_BOTTOM_MAX_ANGLE,
        ),
        value(
          () => calculateAngle(keypoints[indexes.hip], keypoints[indexes.shoulder], keypoints[indexes.elbow]),
          'Codo / activación',
          '<155° · arriba: cabeza sobre muñecas',
        ),
      ];
    case 'muscle-up': {
      const left = sideKeypoints.left;
      const right = sideKeypoints.right;
      return [
        value(() => calculateAngle(keypoints[left.shoulder], keypoints[left.elbow], keypoints[left.wrist]), 'Codo izq.', 'Calibración'),
        value(() => calculateAngle(keypoints[right.shoulder], keypoints[right.elbow], keypoints[right.wrist]), 'Codo der.', 'Calibración'),
        value(() => calculateAngle(keypoints[left.hip], keypoints[left.knee], keypoints[left.ankle]), 'Rodilla izq.', 'Calibración'),
        value(() => calculateAngle(keypoints[right.hip], keypoints[right.knee], keypoints[right.ankle]), 'Rodilla der.', 'Calibración'),
        value(() => calculateAngle(keypoints[left.knee], keypoints[left.ankle], keypoints[MUSCLE_UP_FOOT_INDEX.left]), 'Tobillo izq.', 'Calibración'),
        value(() => calculateAngle(keypoints[right.knee], keypoints[right.ankle], keypoints[MUSCLE_UP_FOOT_INDEX.right]), 'Tobillo der.', 'Calibración'),
      ];
    }
    case 'jalon':
      return [
        value(torso, 'Torso', '10–30°', PULLDOWN_TORSO_MIN_ANGLE, PULLDOWN_TORSO_MAX_ANGLE),
        value(elbow, 'Codo', '80–120°', PULLDOWN_ELBOW_MIN_ANGLE, PULLDOWN_ELBOW_MAX_ANGLE),
        value(
          () => calculateAngle(keypoints[indexes.hip], keypoints[indexes.shoulder], keypoints[indexes.elbow]),
          'Tirón',
          'Inicio 150–180° · activa <135° · final 25–60°',
          PULLDOWN_ANGLE_MIN,
          PULLDOWN_ANGLE_MAX,
        ),
      ];
    case 'remo-barra':
      return [
        value(torso, 'Torso', '30–45°', ROW_TORSO_MIN_ANGLE, ROW_TORSO_MAX_ANGLE),
        value(knee, 'Rodilla', '150–180°', ROW_KNEE_MIN_ANGLE, ROW_KNEE_MAX_ANGLE),
        value(
          () => calculateAngle(keypoints[indexes.hip], keypoints[indexes.shoulder], keypoints[indexes.elbow]),
          'Codos',
          '15–30°',
          ROW_ELBOW_TORSO_MIN_ANGLE,
          ROW_ELBOW_TORSO_MAX_ANGLE,
        ),
        value(elbow, 'Flexión', 'Inicio 145–180° · activa <130° · final 70–115°', 70, 115),
      ];
    case 'flexiones':
    case 'flexiones-declinadas': {
      const pushupAngles = calculatePushupTechniqueAngles(keypoints, side);
      const elbowMin = exercise === 'flexiones' ? PUSHUP_ELBOW_TORSO_MIN_ANGLE : 30;
      const elbowMax = exercise === 'flexiones'
        ? PUSHUP_ELBOW_TORSO_MAX_ANGLE + PUSHUP_ELBOW_TORSO_TOLERANCE
        : 60;
      return [
        createLiveAngleReading('Codo / torso', pushupAngles.elbowTorsoAngle, `${elbowMin}–${elbowMax}°`, elbowMin, elbowMax),
        createLiveAngleReading('Alineación', pushupAngles.bodyLineAngle, '162–180°', PUSHUP_BODY_LINE_MIN_ANGLE, PUSHUP_BODY_LINE_MAX_ANGLE),
        value(elbow, 'Flexión', 'Inicio 150–180° · activa <135° · final 70–105°', 70, 105),
      ];
    }
    case 'flexiones-pica':
      return [
        value(elbow, 'Codo', 'Inicio 145–180° · activa <130° · final 70–110°', 70, 110),
        value(
          () => calculateAngle(keypoints[indexes.hip], keypoints[indexes.shoulder], keypoints[indexes.elbow]),
          'Codo / cuerpo',
          '45–60°',
          PIKE_ELBOW_BODY_MIN_ANGLE,
          PIKE_ELBOW_BODY_MAX_ANGLE,
        ),
        value(() => calculateAngleToFloor(keypoints[indexes.shoulder], keypoints[indexes.wrist]), 'Muñeca / hombro', '75–105°', PIKE_WRIST_SHOULDER_MIN_ANGLE, PIKE_WRIST_SHOULDER_MAX_ANGLE),
        value(() => calculateAngle(keypoints[indexes.shoulder], keypoints[indexes.hip], keypoints[indexes.ankle]), 'Cadera', '45–125°', PIKE_MIN_BODY_FOLD_ANGLE, PIKE_MAX_BODY_FOLD_ANGLE),
      ];
    case 'press-militar':
      return [
        value(
          elbow,
          'Codo',
          'Inicio 145–180° · activa <130° · final 85–110°',
          MILITARY_PRESS_VALID_MIN_ANGLE,
          MILITARY_PRESS_VALID_MAX_ANGLE,
        ),
        value(
          () => calculateAngle(keypoints[indexes.hip], keypoints[indexes.shoulder], keypoints[indexes.elbow]),
          'Codo / torso',
          '30–60°',
          30,
          60,
        ),
      ];
    case 'triceps-polea-alta':
      return [
        value(elbow, 'Codo', 'Inicio 70–120° · activa >135° · final 145–180°', 145, 180),
        value(bodyLine, 'Torso', '160–180°', 160, 180),
      ];
    case 'extension-horizontal-barra':
      return [value(elbow, 'Codo', 'Inicio 150–180° · activa <135° · final 70–105°', 70, 105)];
    case 'curl-biceps':
      return [value(elbow, 'Codo', 'Inicio 85–135° · activa <70° · final 30–60°', 30, 60)];
    case 'sentadillas':
      return [createLiveAngleReading(
        'Rodilla',
        calculateSquatAngle(keypoints),
        'Inicio ≥140° · regreso >115° · fondo 83–90°',
        SQUAT_VALID_MIN_ANGLE,
        SQUAT_VALID_MAX_ANGLE,
      )];
    case 'zancadas': {
      const rearSide = side === 'left' ? 'right' : 'left';
      const rear = sideKeypoints[rearSide];
      return [
        value(
          knee,
          'Rodilla delantera',
          'Inicio 145–180° · activa <130° · final 80–100°',
          LUNGE_KNEE_MIN_ANGLE,
          LUNGE_KNEE_MAX_ANGLE,
        ),
        createLiveAngleReading('Rodilla trasera', calculateAngle(keypoints[rear.hip], keypoints[rear.knee], keypoints[rear.ankle]), '80–100°', LUNGE_KNEE_MIN_ANGLE, LUNGE_KNEE_MAX_ANGLE),
        createLiveAngleReading('Cadera', calculateAngle(keypoints[indexes.shoulder], keypoints[indexes.hip], keypoints[indexes.knee]), '80–100°', LUNGE_HIP_MIN_ANGLE, LUNGE_HIP_MAX_ANGLE),
        value(() => calculateAngleToFloor(keypoints[indexes.shoulder], keypoints[indexes.hip]), 'Torso', '75–80°', LUNGE_TORSO_MIN_ANGLE, LUNGE_TORSO_MAX_ANGLE),
      ];
    }
    case 'zancada-banco':
      return [
        value(
          knee,
          'Rodilla',
          'Inicio 145–180° · activa <130° · final 80–100°',
          BENCH_LUNGE_KNEE_MIN_ANGLE,
          BENCH_LUNGE_KNEE_MAX_ANGLE,
        ),
        value(() => calculateForwardLeanAngle(keypoints[indexes.shoulder], keypoints[indexes.hip]), 'Torso', '15–20°', BENCH_LUNGE_TORSO_MIN_LEAN, BENCH_LUNGE_TORSO_MAX_LEAN),
      ];
    case 'plancha':
      return [
        value(elbow, 'Codo', '80–100°', PLANK_ELBOW_MIN_ANGLE, PLANK_ELBOW_MAX_ANGLE),
        value(() => calculateAngleToFloor(keypoints[indexes.shoulder], keypoints[indexes.elbow]), 'Brazo / suelo', '80–100°', PLANK_ARM_FLOOR_MIN_ANGLE, PLANK_ARM_FLOOR_MAX_ANGLE),
        value(bodyLine, 'Cuerpo', '162–180°', PLANK_MIN_BODY_LINE_ANGLE, 180),
      ];
    default:
      return [value(elbow, 'Ángulo principal', getExercise(exercise)?.angleLabel ?? 'Rango técnico')];
  }
}

function getExercise(exerciseId: ExerciseId | null) {
  return exercises.find((exercise) => exercise.id === exerciseId) ?? null;
}

function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<PoseDetector | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const activeRef = useRef(false);
  const busyRef = useRef(false);
  const cameraFacingModeRef = useRef<CameraFacingMode>('user');
  const [phase, setPhase] = useState<SessionPhase>('exercise-select');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseId | null>(null);
  const selectedExerciseRef = useRef<ExerciseId | null>(null);
  const [cameraFacingMode, setCameraFacingMode] = useState<CameraFacingMode>('user');
  const exerciseStartedRef = useRef(false);
  const [exerciseStarted, setExerciseStarted] = useState(false);
  const [poseDetected, setPoseDetected] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [detectionStable, setDetectionStable] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraGuidance, setCameraGuidance] = useState<CameraGuidance>({
    tone: 'checking',
    message: 'Ajustando la cámara',
    detail: 'Mantente dentro del encuadre para validar tu posición.',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [videoRatio, setVideoRatio] = useState('3 / 4');
  const [modelStatus, setModelStatus] = useState('Modelo sin iniciar');
  const [videoResolution, setVideoResolution] = useState<VideoResolution>({ width: 0, height: 0 });
  const [fps, setFps] = useState(0);
  const [confidencePoints, setConfidencePoints] = useState<DiagnosticPoint[]>([
    { label: 'Hombro', score: null, side: '—' },
    { label: 'Cadera', score: null, side: '—' },
    { label: 'Rodilla', score: null, side: '—' },
  ]);
  const [errorCount, setErrorCount] = useState(0);
  const [angle, setAngle] = useState<number | null>(null);
  const [dipElbowAngle, setDipElbowAngle] = useState<number | null>(null);
  const [dipTorsoAngle, setDipTorsoAngle] = useState<number | null>(null);
  const [pulldownTorsoAngle, setPulldownTorsoAngle] = useState<number | null>(null);
  const [pulldownElbowAngle, setPulldownElbowAngle] = useState<number | null>(null);
  const [rowTorsoAngle, setRowTorsoAngle] = useState<number | null>(null);
  const [rowElbowRiseAngle, setRowElbowRiseAngle] = useState<number | null>(null);
  const [pushupElbowTorsoAngle, setPushupElbowTorsoAngle] = useState<number | null>(null);
  const [pushupBodyLineAngle, setPushupBodyLineAngle] = useState<number | null>(null);
  const [muscleUpAngles, setMuscleUpAngles] = useState<MuscleUpAngles>(createMuscleUpAngles);
  const [dominantSide, setDominantSide] = useState<PoseSide | null>(null);
  const [sideConfidence, setSideConfidence] = useState<number | null>(null);
  const [sideSwitches, setSideSwitches] = useState(0);
  const [sideChangeNotice, setSideChangeNotice] = useState('Sin cambios');
  const [anglePoints, setAnglePoints] = useState<AngleDiagnosticPoint[]>([]);
  const [angleHistory, setAngleHistory] = useState<number[]>([]);
  const [liveAngleReadings, setLiveAngleReadings] = useState<LiveAngleReading[]>([]);
  const [dipJointReadings, setDipJointReadings] = useState<DipJointReading[]>([]);
  const [pullupJointReadings, setPullupJointReadings] = useState<DipJointReading[]>([]);
  const [techniqueFeedback, setTechniqueFeedback] = useState<TechniqueFeedback>(defaultTechniqueFeedback);
  const [squatRepetitions, setSquatRepetitions] = useState(0);
  const [squatGoodRepetitions, setSquatGoodRepetitions] = useState(0);
  const [squatPhase, setSquatPhase] = useState<SquatPhase>('esperando arriba');
  const [squatMinimumAngle, setSquatMinimumAngle] = useState<number | null>(null);
  const [squatFeedback, setSquatFeedback] = useState<TechniqueFeedback>(defaultSquatFeedback);
  const [pullupRepetitions, setPullupRepetitions] = useState(0);
  const [pullupGoodRepetitions, setPullupGoodRepetitions] = useState(0);
  const [pullupPhase, setPullupPhase] = useState<PullupPhase>('esperando abajo');
  const [pullupMinimumAngle, setPullupMinimumAngle] = useState<number | null>(null);
  const [pullupFeedback, setPullupFeedback] = useState<TechniqueFeedback>(defaultTechniqueFeedback);
  const [exerciseRepetitions, setExerciseRepetitions] = useState(0);
  const [exerciseGoodRepetitions, setExerciseGoodRepetitions] = useState(0);
  const [exerciseRepPhase, setExerciseRepPhase] = useState<ExerciseRepPhase>('esperando inicio');
  const [exerciseMinimumAngle, setExerciseMinimumAngle] = useState<number | null>(null);
  const [referenceRecording, setReferenceRecording] = useState(false);
  const [referenceSampleCount, setReferenceSampleCount] = useState(0);
  const [referenceMessage, setReferenceMessage] = useState('Graba una ejecución correcta para calibrar este ejercicio.');
  const [referenceSummary, setReferenceSummary] = useState<CalibrationSummary | null>(null);
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);
  const [previewExercise, setPreviewExercise] = useState<ExerciseDefinition | null>(null);
  const errorCountRef = useRef(0);
  const fpsFramesRef = useRef(0);
  const stabilityFramesRef = useRef(0);
  const previousSideRef = useRef<PoseSide | null>(null);
  const referenceRecordingRef = useRef(false);
  const referenceStartedAtRef = useRef<number | null>(null);
  const referenceLastSampleAtRef = useRef(0);
  const referenceSamplesRef = useRef<ReferenceSample[]>([]);
  const sideSwitchesRef = useRef(0);
  const primaryPoseTrackRef = useRef<PoseTrack | null>(null);
  const posePointMemoryRef = useRef<PosePointMemoryMap>({});
  const angleDisplaySamplesRef = useRef<number[]>([]);
  const angleDisplayRef = useRef<number | null>(null);
  const lastAngleDisplayAtRef = useRef(0);
  const pulldownTorsoSamplesRef = useRef<number[]>([]);
  const pulldownElbowSamplesRef = useRef<number[]>([]);
  const rowTorsoSamplesRef = useRef<number[]>([]);
  const rowElbowRiseSamplesRef = useRef<number[]>([]);
  const pushupElbowTorsoSamplesRef = useRef<number[]>([]);
  const pushupBodyLineSamplesRef = useRef<number[]>([]);
  const muscleUpAngleSamplesRef = useRef<Record<MuscleUpAngleKey, number[]>>({
    leftElbow: [],
    rightElbow: [],
    leftKnee: [],
    rightKnee: [],
    leftAnkle: [],
    rightAnkle: [],
  });
  const squatTrackerRef = useRef<SquatTracker>(createSquatTracker());
  const pullupTrackerRef = useRef<PullupTracker>(createPullupTracker());
  const exerciseRepTrackerRef = useRef<ExerciseRepTracker>(createExerciseRepTracker());

  const incrementErrorCount = useCallback(() => {
    errorCountRef.current += 1;
    setErrorCount(errorCountRef.current);
  }, []);

  useEffect(() => {
    const handleWindowError = () => incrementErrorCount();
    const handleUnhandledRejection = () => incrementErrorCount();
    const originalConsoleError = console.error.bind(console);

    console.error = (...args: unknown[]) => {
      incrementErrorCount();
      originalConsoleError(...args);
    };
    window.addEventListener('error', handleWindowError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      console.error = originalConsoleError;
      window.removeEventListener('error', handleWindowError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [incrementErrorCount]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setFps(fpsFramesRef.current);
      fpsFramesRef.current = 0;
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!previewExercise) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPreviewExercise(null);
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [previewExercise]);

  const stopResources = useCallback(() => {
    activeRef.current = false;
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    detectorRef.current?.close();
    detectorRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    if (canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      context?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    referenceRecordingRef.current = false;
    referenceStartedAtRef.current = null;
    referenceLastSampleAtRef.current = 0;
    posePointMemoryRef.current = {};
    stabilityFramesRef.current = 0;
    setDetectionStable(false);
    setReferenceRecording(false);
  }, []);

  const syncVideoSize = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth || !video.videoHeight) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    setVideoRatio(`${video.videoWidth} / ${video.videoHeight}`);
    setVideoResolution({ width: video.videoWidth, height: video.videoHeight });
  }, []);

  const processFrame = useCallback(async () => {
    const video = videoRef.current;
    const detector = detectorRef.current;
    if (!activeRef.current || !video || !detector) return;
    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      animationFrameRef.current = requestAnimationFrame(() => void processFrame());
      return;
    }

    try {
      const detectedResult = detector.detectForVideo(video, performance.now());
      const poses = detectedResult ? [detectedResult] : [];
      const selectedExerciseForFrame = selectedExerciseRef.current ?? 'fondos';
      const previousPoseTrack = primaryPoseTrackRef.current;
      const primaryPose = selectPrimaryPose(
        poses,
        video.videoWidth,
        video.videoHeight,
        primaryPoseTrackRef.current,
        exerciseStartedRef.current,
      );
      const detectedPose = primaryPose?.pose;
      if (primaryPose) {
        if (
          previousPoseTrack
          && !exerciseStartedRef.current
          && !isPoseTrackContinuous(primaryPose.track, previousPoseTrack)
        ) {
          posePointMemoryRef.current = {};
        }
        primaryPoseTrackRef.current = primaryPose.track;
      } else if (primaryPoseTrackRef.current) {
        const nextLostFrames = primaryPoseTrackRef.current.lostFrames + 1;
        primaryPoseTrackRef.current = nextLostFrames >= 8 && !exerciseStartedRef.current
          ? null
          : { ...primaryPoseTrackRef.current, lostFrames: nextLostFrames };
      }
      const stabilizedKeypoints = stabilizePosePoints(
        detectedPose?.keypoints,
        posePointMemoryRef.current,
      );
      const pose: Pose | undefined = detectedPose && stabilizedKeypoints.length
        ? {
            ...detectedPose,
            keypoints: stabilizedKeypoints,
          }
        : undefined;
      const hasFreshPose = Boolean(detectedPose);
      const nextDominantSideResult = selectedExerciseForFrame === 'remo-barra'
        ? getBarbellRowDominantSide(pose?.keypoints, previousSideRef.current)
        : getDominantSide(pose?.keypoints, previousSideRef.current);
      const nextDominantSide = nextDominantSideResult?.side ?? null;
      const visiblePoints = pose?.keypoints?.filter((point) => (point.score ?? 0) >= 0.3).length ?? 0;
      const nextFaceDetected = hasFaceDetected(pose?.keypoints);
      const nextCameraGuidance = getCameraGuidance(
        selectedExerciseForFrame,
        pose?.keypoints,
        nextDominantSide,
        video.videoWidth,
        video.videoHeight,
      );
      const frameCameraReady = nextCameraGuidance.tone === 'ready';
      const rawAngle = selectedExerciseForFrame === 'sentadillas'
        ? calculateSquatAngle(pose?.keypoints)
        : calculateExerciseAngle(
          selectedExerciseForFrame,
          pose?.keypoints,
          nextDominantSide,
        );
      const frameCanMeasure = Boolean(
        frameCameraReady
        && hasFreshPose
        && rawAngle !== null
        && visiblePoints >= 5,
      );
      stabilityFramesRef.current = frameCanMeasure
        ? Math.min(8, stabilityFramesRef.current + 1)
        : 0;
      const frameDetectionStable = stabilityFramesRef.current >= 4;
      setDetectionStable(frameDetectionStable);
      const repetitionConfig = getRepetitionConfig(selectedExerciseForFrame);
      const repetitionAngle = repetitionConfig
        ? calculateRepetitionAngle(
          selectedExerciseForFrame,
          pose?.keypoints,
          nextDominantSide,
        )
        : null;
      const dipTorsoAngleForFrame = selectedExerciseForFrame === 'fondos' && nextDominantSide
        ? calculateForwardLeanAngle(
            pose?.keypoints?.[sideKeypoints[nextDominantSide].shoulder],
            pose?.keypoints?.[sideKeypoints[nextDominantSide].hip],
          )
        : null;
      const pulldownTorsoAngleForFrame = selectedExerciseForFrame === 'jalon' && nextDominantSide
        ? calculateForwardLeanAngle(
            pose?.keypoints?.[sideKeypoints[nextDominantSide].shoulder],
            pose?.keypoints?.[sideKeypoints[nextDominantSide].hip],
          )
        : null;
      const pulldownElbowAngleForFrame = selectedExerciseForFrame === 'jalon' && nextDominantSide
        ? calculateAngle(
            pose?.keypoints?.[sideKeypoints[nextDominantSide].shoulder],
            pose?.keypoints?.[sideKeypoints[nextDominantSide].elbow],
            pose?.keypoints?.[sideKeypoints[nextDominantSide].wrist],
          )
        : null;
      const rowTorsoAngleForFrame = selectedExerciseForFrame === 'remo-barra' && nextDominantSide
        ? calculateForwardLeanAngle(
            pose?.keypoints?.[sideKeypoints[nextDominantSide].shoulder],
            pose?.keypoints?.[sideKeypoints[nextDominantSide].hip],
          )
        : null;
      const rowElbowRiseAngleForFrame = selectedExerciseForFrame === 'remo-barra' && nextDominantSide
        ? calculateAngle(
            pose?.keypoints?.[sideKeypoints[nextDominantSide].hip],
            pose?.keypoints?.[sideKeypoints[nextDominantSide].shoulder],
            pose?.keypoints?.[sideKeypoints[nextDominantSide].elbow],
          )
        : null;
      const pushupTechniqueAnglesForFrame = (
        selectedExerciseForFrame === 'flexiones'
        || selectedExerciseForFrame === 'flexiones-declinadas'
      )
        ? calculatePushupTechniqueAngles(pose?.keypoints, nextDominantSide)
        : { elbowTorsoAngle: null, bodyLineAngle: null };
      const muscleUpAnglesForFrame = selectedExerciseForFrame === 'muscle-up'
        ? calculateMuscleUpAngles(pose?.keypoints)
        : createMuscleUpAngles();
      const displayMuscleUpAngles = MUSCLE_UP_ANGLE_KEYS.reduce<MuscleUpAngles>(
        (readings, key) => {
          const samplesRef = { current: muscleUpAngleSamplesRef.current[key] };
          const value = smoothAngleReading(muscleUpAnglesForFrame[key], samplesRef);
          muscleUpAngleSamplesRef.current[key] = samplesRef.current;
          return { ...readings, [key]: value };
        },
        createMuscleUpAngles(),
      );
      const displayPulldownTorsoAngle = smoothAngleReading(
        pulldownTorsoAngleForFrame,
        pulldownTorsoSamplesRef,
      );
      const displayPulldownElbowAngle = smoothAngleReading(
        pulldownElbowAngleForFrame,
        pulldownElbowSamplesRef,
      );
      const displayRowTorsoAngle = smoothAngleReading(
        rowTorsoAngleForFrame,
        rowTorsoSamplesRef,
      );
      const displayRowElbowRiseAngle = smoothAngleReading(
        rowElbowRiseAngleForFrame,
        rowElbowRiseSamplesRef,
      );
      const displayPushupElbowTorsoAngle = smoothAngleReading(
        pushupTechniqueAnglesForFrame.elbowTorsoAngle,
        pushupElbowTorsoSamplesRef,
      );
      const displayPushupBodyLineAngle = smoothAngleReading(
        pushupTechniqueAnglesForFrame.bodyLineAngle,
        pushupBodyLineSamplesRef,
      );
      setDipElbowAngle(selectedExerciseForFrame === 'fondos' ? repetitionAngle : null);
      setDipTorsoAngle(dipTorsoAngleForFrame);
      setPulldownTorsoAngle(displayPulldownTorsoAngle);
      setPulldownElbowAngle(displayPulldownElbowAngle);
      setRowTorsoAngle(displayRowTorsoAngle);
      setRowElbowRiseAngle(displayRowElbowRiseAngle);
      setPushupElbowTorsoAngle(displayPushupElbowTorsoAngle);
      setPushupBodyLineAngle(displayPushupBodyLineAngle);
      setMuscleUpAngles(displayMuscleUpAngles);
      let nextAngle = rawAngle;
      if (
        exerciseStartedRef.current
        && hasFreshPose
        && frameCameraReady
        && frameDetectionStable
        && selectedExerciseRef.current === 'sentadillas'
        && rawAngle !== null
      ) {
        const squatUpdate = advanceSquatTracker(squatTrackerRef.current, rawAngle);
        squatTrackerRef.current = squatUpdate.tracker;
        nextAngle = squatUpdate.smoothedAngle;
        setSquatRepetitions(squatUpdate.tracker.repetitions);
        setSquatGoodRepetitions(squatUpdate.tracker.goodRepetitions);
        setSquatPhase(squatUpdate.tracker.phase);
        setSquatMinimumAngle(squatUpdate.tracker.minimumAngle ?? squatUpdate.completedMinimumAngle);
        if (squatUpdate.tracker.event === 'valid') {
          setSquatFeedback({
            tone: 'success',
            message: `Repetición ${squatUpdate.tracker.repetitions}: BIEN ✓`,
            detail: `Ángulo mínimo ${squatUpdate.completedMinimumAngle}° dentro del rango 83–90°.`,
          });
        } else if (squatUpdate.tracker.event === 'too-deep') {
          setSquatFeedback({
            tone: 'warning',
            message: `Repetición ${squatUpdate.tracker.repetitions}: MAL · muy abajo`,
            detail: `Ángulo mínimo ${squatUpdate.completedMinimumAngle}°. El rango válido es 83–90°.`,
          });
        } else if (squatUpdate.tracker.event === 'too-shallow') {
          setSquatFeedback({
            tone: 'warning',
            message: `Repetición ${squatUpdate.tracker.repetitions}: MAL · muy arriba`,
            detail: `Solo llegó a ${squatUpdate.completedMinimumAngle}°. Baja hasta 83–90°.`,
          });
        } else if (squatUpdate.smoothedAngle >= SQUAT_VALID_MIN_ANGLE
          && squatUpdate.smoothedAngle <= SQUAT_VALID_MAX_ANGLE) {
          setSquatFeedback({
            tone: 'success',
            message: 'Rango válido',
            detail: 'Mantén el control y vuelve a subir para completar la repetición.',
          });
        }
      }
      if (
        (selectedExerciseRef.current === 'dominadas'
          || selectedExerciseRef.current === 'dominadas-supinas')
        && exerciseStartedRef.current
        && hasFreshPose
        && frameCameraReady
        && frameDetectionStable
        && rawAngle !== null
      ) {
        const isSupinePullup = selectedExerciseRef.current === 'dominadas-supinas';
        const pullupUpdate = advancePullupTracker(
          pullupTrackerRef.current,
          rawAngle,
          isHeadOverWrists(pose?.keypoints, nextDominantSide),
          isSupinePullup
            ? SUPINE_PULLUP_TRACKER_CONFIG
            : STANDARD_PULLUP_TRACKER_CONFIG,
        );
        pullupTrackerRef.current = pullupUpdate.tracker;
        nextAngle = pullupUpdate.smoothedAngle;
        setPullupRepetitions(pullupUpdate.tracker.repetitions);
        setPullupGoodRepetitions(pullupUpdate.tracker.goodRepetitions);
        setPullupPhase(pullupUpdate.tracker.phase);
        setPullupMinimumAngle(
          pullupUpdate.tracker.minimumAngle ?? pullupUpdate.completedMinimumAngle,
        );

        if (pullupUpdate.tracker.event === 'valid') {
          setPullupFeedback({
            tone: 'success',
            message: `Repetición ${pullupUpdate.tracker.repetitions}: BIEN ✓`,
            detail: isSupinePullup
              ? `Extensión de codos entre ${PULLUP_BOTTOM_MIN_ANGLE}–${PULLUP_BOTTOM_MAX_ANGLE}° · cabeza por encima de las muñecas · agarre supino.`
              : `Extensión de codos entre ${PULLUP_BOTTOM_MIN_ANGLE}–${PULLUP_BOTTOM_MAX_ANGLE}° · cabeza por encima de las muñecas.`,
          });
        } else if (pullupUpdate.tracker.event === 'no-top') {
          setPullupFeedback({
            tone: 'warning',
            message: 'No rep · subida incompleta',
            detail: isSupinePullup
              ? 'Sube hasta pasar la cabeza por encima de las muñecas.'
              : 'Sube hasta pasar la cabeza por encima de las muñecas.',
          });
        } else if (pullupUpdate.tracker.event === 'no-lockout') {
          setPullupFeedback({
            tone: 'warning',
            message: 'No rep · falta extensión',
            detail: `Volviste a subir con ${pullupUpdate.smoothedAngle}°. Extiende primero los brazos entre ${PULLUP_BOTTOM_MIN_ANGLE}–${PULLUP_BOTTOM_MAX_ANGLE}°.`,
          });
        } else {
          setPullupFeedback(
            isSupinePullup
              ? getSupinePullupTechniqueFeedback(pose?.keypoints, nextDominantSide)
              : getPullupTechniqueFeedback(pose?.keypoints, nextDominantSide),
          );
        }
      }
      const rowTechniqueReady = selectedExerciseForFrame !== 'remo-barra'
        || isBarbellRowTechniqueValid(pose?.keypoints, nextDominantSide);
      const dipTechniqueReady = selectedExerciseForFrame !== 'fondos'
        || isDipTechniqueValid(pose?.keypoints, nextDominantSide);
      const pulldownTechniqueReady = selectedExerciseForFrame !== 'jalon'
        || isLatPulldownTechniqueValid(pose?.keypoints, nextDominantSide);
      const pushupTechniqueReady = selectedExerciseForFrame !== 'flexiones'
        && selectedExerciseForFrame !== 'flexiones-declinadas'
        ? true
        : isPushupTechniqueValid(
          pose?.keypoints,
          nextDominantSide,
          selectedExerciseForFrame === 'flexiones-declinadas' ? 'declined' : 'regular',
        );
      if (
        exerciseStartedRef.current
        && hasFreshPose
        && frameCameraReady
        && frameDetectionStable
        && repetitionConfig
        && repetitionAngle !== null
        && rowTechniqueReady
        && dipTechniqueReady
        && pulldownTechniqueReady
        && pushupTechniqueReady
      ) {
        const exerciseRepUpdate = advanceExerciseRepTracker(
          exerciseRepTrackerRef.current,
          repetitionAngle,
          repetitionConfig,
        );
        exerciseRepTrackerRef.current = exerciseRepUpdate.tracker;
        setExerciseRepetitions(exerciseRepUpdate.tracker.repetitions);
        setExerciseGoodRepetitions(exerciseRepUpdate.tracker.goodRepetitions);
        setExerciseRepPhase(exerciseRepUpdate.tracker.phase);
        setExerciseMinimumAngle(
          exerciseRepUpdate.tracker.endpointAngle ?? exerciseRepUpdate.completedEndpointAngle,
        );
      } else if (
        (selectedExerciseForFrame === 'remo-barra'
          || selectedExerciseForFrame === 'fondos'
          || selectedExerciseForFrame === 'jalon')
        && exerciseStartedRef.current
        && (
          !hasFreshPose
          || !frameCameraReady
          || !rowTechniqueReady
          || !dipTechniqueReady
          || !pulldownTechniqueReady
          || !pushupTechniqueReady
        )
      ) {
        const resetTracker = createExerciseRepTracker();
        exerciseRepTrackerRef.current = resetTracker;
        setExerciseRepetitions(resetTracker.repetitions);
        setExerciseGoodRepetitions(resetTracker.goodRepetitions);
        setExerciseRepPhase(resetTracker.phase);
        setExerciseMinimumAngle(resetTracker.endpointAngle);
      }
      let displayAngle = frameDetectionStable ? nextAngle : null;
      if (nextAngle === null) {
        angleDisplaySamplesRef.current = [];
        angleDisplayRef.current = null;
        lastAngleDisplayAtRef.current = 0;
      } else {
        angleDisplaySamplesRef.current = [
          ...angleDisplaySamplesRef.current,
          nextAngle,
        ].slice(-ANGLE_DISPLAY_SAMPLES);
        const stableAngle = median(angleDisplaySamplesRef.current) ?? nextAngle;
        const now = performance.now();
        if (
          angleDisplayRef.current === null
          || now - lastAngleDisplayAtRef.current >= ANGLE_DISPLAY_INTERVAL_MS
        ) {
          angleDisplayRef.current = stableAngle;
          lastAngleDisplayAtRef.current = now;
        }
        displayAngle = angleDisplayRef.current;
      }

      fpsFramesRef.current += 1;
      setPoseDetected(visiblePoints >= 5);
      setFaceDetected(nextFaceDetected);
      setCameraReady(frameCameraReady);
      setCameraGuidance(nextCameraGuidance);
      setDominantSide(nextDominantSide);
      setSideConfidence(nextDominantSideResult?.average ?? null);
      setAngle(displayAngle);
      const nextLiveAngleReadings = calculateLiveAngleReadings(
        selectedExerciseForFrame,
        pose?.keypoints,
        nextDominantSide,
      );
      setLiveAngleReadings(nextLiveAngleReadings);
      setDipJointReadings(
        selectedExerciseForFrame === 'fondos'
          ? calculateDipJointReadings(pose?.keypoints, nextDominantSide)
          : [],
      );
      setPullupJointReadings(
        selectedExerciseForFrame === 'dominadas' || selectedExerciseForFrame === 'dominadas-supinas'
          ? calculatePullupJointReadings(pose?.keypoints)
          : [],
      );
      if (
        referenceRecordingRef.current
        && frameCameraReady
        && frameDetectionStable
        && performance.now() - referenceLastSampleAtRef.current >= REFERENCE_SAMPLE_INTERVAL_MS
      ) {
        const readings = nextLiveAngleReadings
          .filter((reading): reading is LiveAngleReading & { value: number } => reading.value !== null)
          .map(({ label, value, target }) => ({ label, value, target }));
        if (readings.length > 0) {
          const now = performance.now();
          referenceSamplesRef.current.push({
            elapsedMs: Math.round(now - (referenceStartedAtRef.current ?? now)),
            readings,
          });
          referenceLastSampleAtRef.current = now;
          setReferenceSampleCount(referenceSamplesRef.current.length);
        }
      }
      setAnglePoints(getAngleDiagnosticPoints(
        selectedExerciseRef.current ?? 'fondos',
        pose?.keypoints,
        nextDominantSide,
      ));
      setTechniqueFeedback(
        selectedExerciseRef.current === 'flexiones'
          ? getPushupTechniqueFeedback(pose?.keypoints, nextDominantSide)
          : selectedExerciseRef.current === 'flexiones-declinadas'
            ? getPushupTechniqueFeedback(pose?.keypoints, nextDominantSide, 'declined')
          : selectedExerciseRef.current === 'flexiones-pica'
            ? getPikePushupTechniqueFeedback(pose?.keypoints, nextDominantSide)
          : selectedExerciseRef.current === 'press-militar'
            ? getMilitaryPressTechniqueFeedback(pose?.keypoints, nextDominantSide)
          : selectedExerciseRef.current === 'triceps-polea-alta'
            ? getTricepsPushdownTechniqueFeedback(pose?.keypoints, nextDominantSide)
           : selectedExerciseRef.current === 'extension-horizontal-barra'
             ? getHorizontalBarExtensionTechniqueFeedback(pose?.keypoints, nextDominantSide)
          : selectedExerciseRef.current === 'curl-biceps'
            ? getBicepsCurlTechniqueFeedback(pose?.keypoints, nextDominantSide)
          : selectedExerciseRef.current === 'fondos'
            ? getDipTechniqueFeedback(pose?.keypoints, nextDominantSide)
             : selectedExerciseRef.current === 'dominadas'
               ? getPullupTechniqueFeedback(pose?.keypoints, nextDominantSide)
               : selectedExerciseRef.current === 'dominadas-supinas'
                 ? getSupinePullupTechniqueFeedback(pose?.keypoints, nextDominantSide)
              : selectedExerciseRef.current === 'jalon'
                ? getLatPulldownTechniqueFeedback(pose?.keypoints, nextDominantSide)
              : selectedExerciseRef.current === 'remo-barra'
                ? getBarbellRowTechniqueFeedback(pose?.keypoints, nextDominantSide)
              : selectedExerciseRef.current === 'zancadas'
                ? getLungeTechniqueFeedback(pose?.keypoints, nextDominantSide)
              : selectedExerciseRef.current === 'zancada-banco'
                 ? getBenchLungeTechniqueFeedback(pose?.keypoints, nextDominantSide)
              : selectedExerciseRef.current === 'plancha'
                ? getPlankTechniqueFeedback(pose?.keypoints, nextDominantSide)
            : defaultTechniqueFeedback,
      );
      if (displayAngle !== null) {
        setAngleHistory((history) => (
          history[history.length - 1] === displayAngle
            ? history
            : [...history, displayAngle].slice(-5)
        ));
      }
      if (nextDominantSide && previousSideRef.current && nextDominantSide !== previousSideRef.current) {
        sideSwitchesRef.current += 1;
        setSideSwitches(sideSwitchesRef.current);
        setSideChangeNotice(
          `${previousSideRef.current === 'left' ? 'Izquierdo' : 'Derecho'} → ${nextDominantSide === 'left' ? 'izquierdo' : 'derecho'}`,
        );
      }
      previousSideRef.current = nextDominantSide;
      setConfidencePoints([
        selectMostConfident(pose?.keypoints, 'Hombro', 11, 12),
        selectMostConfident(pose?.keypoints, 'Cadera', 23, 24),
        selectMostConfident(pose?.keypoints, 'Rodilla', 25, 26),
      ]);
      if (canvasRef.current) {
        drawSkeleton(
          canvasRef.current,
          video,
          pose,
          cameraFacingModeRef.current === 'user',
        );
      }
    } catch {
      if (activeRef.current) {
        incrementErrorCount();
        setPoseDetected(false);
        setDetectionStable(false);
      }
    }

    if (activeRef.current) {
      animationFrameRef.current = requestAnimationFrame(() => void processFrame());
    }
  }, [incrementErrorCount]);

  const loadDetector = useCallback(async () => createPoseDetector(), []);

  const startCamera = useCallback(async (
    exerciseId?: ExerciseId,
    preserveExerciseStarted = false,
  ) => {
    if (busyRef.current) return;
    busyRef.current = true;
    const activeExercise = exerciseId ?? selectedExerciseRef.current;
    if (!activeExercise) {
      busyRef.current = false;
      return;
    }
    selectedExerciseRef.current = activeExercise;
    setSelectedExercise(activeExercise);
    exerciseStartedRef.current = preserveExerciseStarted;
    setExerciseStarted(preserveExerciseStarted);
    referenceRecordingRef.current = false;
    referenceStartedAtRef.current = null;
    referenceLastSampleAtRef.current = 0;
    referenceSamplesRef.current = [];
    setReferenceRecording(false);
    setReferenceSampleCount(0);
    setReferenceSummary(null);
    setReferenceMessage('Graba una ejecución correcta para calibrar este ejercicio.');
    stopResources();
    setPoseDetected(false);
    setFaceDetected(false);
    setDetectionStable(false);
    setCameraReady(false);
    setCameraGuidance({
      tone: 'checking',
      message: 'Ajustando la cámara',
      detail: 'Mantente dentro del encuadre para validar tu posición.',
    });
    setErrorMessage('');
    setModelStatus('Cargando modelo...');
    setVideoResolution({ width: 0, height: 0 });
    setFps(0);
    fpsFramesRef.current = 0;
    stabilityFramesRef.current = 0;
    setConfidencePoints([
      { label: 'Hombro', score: null, side: '—' },
      { label: 'Cadera', score: null, side: '—' },
      { label: 'Rodilla', score: null, side: '—' },
    ]);
    errorCountRef.current = 0;
    setErrorCount(0);
    setAngle(null);
    setLiveAngleReadings([]);
    setDipJointReadings([]);
    setPullupJointReadings([]);
    setDipElbowAngle(null);
    setDipTorsoAngle(null);
    setPulldownTorsoAngle(null);
    setPulldownElbowAngle(null);
    setRowTorsoAngle(null);
    setRowElbowRiseAngle(null);
    setPushupElbowTorsoAngle(null);
    setPushupBodyLineAngle(null);
    setMuscleUpAngles(createMuscleUpAngles());
    pulldownTorsoSamplesRef.current = [];
    pulldownElbowSamplesRef.current = [];
    rowTorsoSamplesRef.current = [];
    rowElbowRiseSamplesRef.current = [];
    pushupElbowTorsoSamplesRef.current = [];
    pushupBodyLineSamplesRef.current = [];
    MUSCLE_UP_ANGLE_KEYS.forEach((key) => {
      muscleUpAngleSamplesRef.current[key] = [];
    });
    angleDisplaySamplesRef.current = [];
    angleDisplayRef.current = null;
    lastAngleDisplayAtRef.current = 0;
    setDominantSide(null);
    setSideConfidence(null);
    setSideSwitches(0);
    setSideChangeNotice('Sin cambios');
    primaryPoseTrackRef.current = null;
    setAnglePoints([]);
    setAngleHistory([]);
    setTechniqueFeedback(defaultTechniqueFeedback);
    squatTrackerRef.current = createSquatTracker();
    setSquatRepetitions(0);
    setSquatGoodRepetitions(0);
    setSquatPhase('esperando arriba');
    setSquatMinimumAngle(null);
    setSquatFeedback(defaultSquatFeedback);
    pullupTrackerRef.current = createPullupTracker();
    setPullupRepetitions(0);
    setPullupGoodRepetitions(0);
    setPullupPhase('esperando abajo');
    setPullupMinimumAngle(null);
    setPullupFeedback(defaultTechniqueFeedback);
    exerciseRepTrackerRef.current = createExerciseRepTracker();
    setExerciseRepetitions(0);
    setExerciseGoodRepetitions(0);
    setExerciseRepPhase('esperando inicio');
    setExerciseMinimumAngle(null);
    previousSideRef.current = null;
    sideSwitchesRef.current = 0;
    setPhase('requesting');

    try {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('La cámara necesita una conexión segura y compatible con el navegador.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: cameraFacingModeRef.current,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = stream;
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const video = videoRef.current;
      if (!video) throw new Error('No se pudo preparar la vista de cámara.');
      video.srcObject = stream;
      await video.play();
      syncVideoSize();
      setPhase('loading-model');
      const detector = await loadDetector();
      detectorRef.current = detector;
      setModelStatus(`${POSE_MODEL_NAME} cargado ✓`);
      activeRef.current = true;
      setPhase('tracking');
      animationFrameRef.current = requestAnimationFrame(() => void processFrame());
    } catch (error) {
      stopResources();
      const name = error instanceof DOMException ? error.name : '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setErrorMessage('El acceso fue bloqueado. Permite la cámara en los ajustes del navegador para continuar.');
      } else if (name === 'NotFoundError') {
        setErrorMessage('No encontramos una cámara disponible en este dispositivo.');
      } else if (error instanceof Error && error.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('No pudimos activar la cámara. Comprueba los permisos e inténtalo de nuevo.');
      }
      if (error instanceof Error && error.message) setModelStatus(error.message);
      setPhase('error');
    } finally {
      busyRef.current = false;
    }
  }, [loadDetector, processFrame, stopResources, syncVideoSize]);

  const toggleCamera = useCallback(() => {
    if (busyRef.current || !selectedExerciseRef.current) return;
    const nextFacingMode: CameraFacingMode = cameraFacingModeRef.current === 'user'
      ? 'environment'
      : 'user';
    cameraFacingModeRef.current = nextFacingMode;
    setCameraFacingMode(nextFacingMode);
    void startCamera(selectedExerciseRef.current, exerciseStartedRef.current);
  }, [startCamera]);

  const toggleExercise = useCallback(() => {
    if (phase !== 'tracking') return;

    if (exerciseStartedRef.current) {
      exerciseStartedRef.current = false;
      setExerciseStarted(false);
      setSquatFeedback(defaultSquatFeedback);
      setPullupFeedback(defaultTechniqueFeedback);
      setTechniqueFeedback(defaultTechniqueFeedback);
      return;
    }

    if (!faceDetected && !poseDetected) return;
    exerciseStartedRef.current = true;
    setExerciseStarted(true);
    setSquatFeedback(defaultSquatFeedback);
    setPullupFeedback(defaultTechniqueFeedback);
    setTechniqueFeedback(defaultTechniqueFeedback);
  }, [faceDetected, phase, poseDetected]);

  const returnToWelcome = useCallback(() => {
    stopResources();
    selectedExerciseRef.current = null;
    setSelectedExercise(null);
    exerciseStartedRef.current = false;
    setExerciseStarted(false);
    setPoseDetected(false);
    setFaceDetected(false);
    setCameraReady(false);
    setCameraGuidance({
      tone: 'checking',
      message: 'Ajustando la cámara',
      detail: 'Mantente dentro del encuadre para validar tu posición.',
    });
    setErrorMessage('');
    setAngle(null);
    setLiveAngleReadings([]);
    setDipJointReadings([]);
    setPullupJointReadings([]);
    setDipElbowAngle(null);
    setDipTorsoAngle(null);
    setPulldownTorsoAngle(null);
    setPulldownElbowAngle(null);
    setRowTorsoAngle(null);
    setRowElbowRiseAngle(null);
    setPushupElbowTorsoAngle(null);
    setPushupBodyLineAngle(null);
    setMuscleUpAngles(createMuscleUpAngles());
    pulldownTorsoSamplesRef.current = [];
    pulldownElbowSamplesRef.current = [];
    rowTorsoSamplesRef.current = [];
    rowElbowRiseSamplesRef.current = [];
    pushupElbowTorsoSamplesRef.current = [];
    pushupBodyLineSamplesRef.current = [];
    MUSCLE_UP_ANGLE_KEYS.forEach((key) => {
      muscleUpAngleSamplesRef.current[key] = [];
    });
    angleDisplaySamplesRef.current = [];
    angleDisplayRef.current = null;
    lastAngleDisplayAtRef.current = 0;
    setDominantSide(null);
    setSideConfidence(null);
    setSideSwitches(0);
    setSideChangeNotice('Sin cambios');
    setAnglePoints([]);
    setAngleHistory([]);
    setTechniqueFeedback(defaultTechniqueFeedback);
    squatTrackerRef.current = createSquatTracker();
    setSquatRepetitions(0);
    setSquatGoodRepetitions(0);
    setSquatPhase('esperando arriba');
    setSquatMinimumAngle(null);
    setSquatFeedback(defaultSquatFeedback);
    pullupTrackerRef.current = createPullupTracker();
    setPullupRepetitions(0);
    setPullupGoodRepetitions(0);
    setPullupPhase('esperando abajo');
    setPullupMinimumAngle(null);
    setPullupFeedback(defaultTechniqueFeedback);
    exerciseRepTrackerRef.current = createExerciseRepTracker();
    setExerciseRepetitions(0);
    setExerciseGoodRepetitions(0);
    setExerciseRepPhase('esperando inicio');
    setExerciseMinimumAngle(null);
    previousSideRef.current = null;
    sideSwitchesRef.current = 0;
    setPhase('exercise-select');
  }, [stopResources]);

  useEffect(() => () => stopResources(), [stopResources]);

  const isActive = phase === 'requesting' || phase === 'loading-model' || phase === 'tracking';
  const activeExercise = getExercise(selectedExercise);
  const startReferenceCapture = useCallback(() => {
    if (!activeExercise || phase !== 'tracking' || !cameraReady || referenceRecordingRef.current) return;
    referenceSamplesRef.current = [];
    referenceStartedAtRef.current = performance.now();
    referenceLastSampleAtRef.current = 0;
    referenceRecordingRef.current = true;
    setReferenceRecording(true);
    setReferenceSampleCount(0);
    setReferenceSummary(null);
    setReferenceMessage('Referencia activa: ejecuta el movimiento completo y correctamente.');
  }, [activeExercise, cameraReady, phase]);
  const finishReferenceCapture = useCallback(() => {
    if (!activeExercise || !referenceRecordingRef.current) return;
    referenceRecordingRef.current = false;
    setReferenceRecording(false);

    const samples = referenceSamplesRef.current;
    const durationMs = performance.now() - (referenceStartedAtRef.current ?? performance.now());
    const summary = buildCalibrationSummary(activeExercise, samples, durationMs);
    if (!summary || samples.length < 5) {
      setReferenceSummary(null);
      setReferenceMessage('Se necesitan al menos 5 muestras estables. Repite la referencia con todo el cuerpo visible.');
      return;
    }

    setReferenceSummary(summary);
    setReferenceMessage('Referencia lista. Descarga el paquete y envíalo a la IA para revisar la tolerancia.');
    localStorage.setItem(
      `posture-coach-reference-${activeExercise.id}`,
      JSON.stringify({ summary, samples }),
    );
  }, [activeExercise]);
  const downloadReferencePacket = useCallback(() => {
    if (!activeExercise || !referenceSummary) return;
    const samples = referenceSamplesRef.current;
    const prompt = createCalibrationPrompt(activeExercise, referenceSummary, samples);
    const packet = {
      prompt,
      exercise: activeExercise,
      summary: referenceSummary,
      samples,
    };
    const blob = new Blob([JSON.stringify(packet, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `referencia-${activeExercise.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [activeExercise, referenceSummary]);
  const copyCalibrationPrompt = useCallback(async () => {
    if (!activeExercise || !referenceSummary) return;
    const prompt = createCalibrationPrompt(activeExercise, referenceSummary, referenceSamplesRef.current);
    try {
      await navigator.clipboard.writeText(prompt);
      setReferenceMessage('Prompt copiado. Puedes pegarlo junto al archivo JSON en la IA.');
    } catch {
      setReferenceMessage('No se pudo copiar automáticamente. Descarga el paquete JSON para compartirlo.');
    }
  }, [activeExercise, referenceSummary]);
  const personDetected = poseDetected || faceDetected;
  const statusMessage = phase !== 'tracking'
    ? 'Preparando el análisis...'
    : !exerciseStarted
      ? personDetected
        ? cameraReady
          ? 'Colócate en posición y pulsa Iniciar ejercicio'
          : poseDetected
            ? 'Cuerpo detectado ✓ · puedes iniciar'
            : 'Rostro detectado ✓ · puedes iniciar'
        : 'Buscando tu cuerpo...'
      : poseDetected
        ? cameraReady
          ? detectionStable
            ? 'Encuadre válido · análisis 3D estable ✓'
            : 'Mejorando detección'
          : cameraGuidance.message
        : 'Buscando tu cuerpo...';
  const modelStatusClass = modelStatus.includes('✓')
    ? 'diagnostic-value diagnostic-value--success'
    : modelStatus === 'Cargando modelo...'
      ? 'diagnostic-value diagnostic-value--loading'
      : 'diagnostic-value diagnostic-value--error';
  const resolutionLabel = videoResolution.width && videoResolution.height
    ? `${videoResolution.width} × ${videoResolution.height}`
    : '— × —';
  const formatScore = (score: number | null) => score === null ? '—' : score.toFixed(2);
  const sideLabel = dominantSide === 'left' ? 'Izquierdo' : dominantSide === 'right' ? 'Derecho' : '—';
  const sideLabelWithScore = dominantSide && sideConfidence !== null
    ? `${sideLabel} · ${sideConfidence.toFixed(2)}`
    : `${sideLabel} · —`;
  const angleLabel = angle === null ? '—' : `${angle}°`;
  const dipElbowLabel = dipElbowAngle === null ? '—' : `${dipElbowAngle}°`;
  const dipTorsoLabel = dipTorsoAngle === null ? '—' : `${dipTorsoAngle}°`;
  const pulldownTorsoLabel = pulldownTorsoAngle === null ? '—' : `${pulldownTorsoAngle}°`;
  const pulldownElbowLabel = pulldownElbowAngle === null ? '—' : `${pulldownElbowAngle}°`;
  const rowTorsoLabel = rowTorsoAngle === null ? '—' : `${rowTorsoAngle}°`;
  const rowElbowRiseLabel = rowElbowRiseAngle === null ? '—' : `${rowElbowRiseAngle}°`;
  const pushupElbowTorsoLabel = pushupElbowTorsoAngle === null ? '—' : `${pushupElbowTorsoAngle}°`;
  const pushupBodyLineLabel = pushupBodyLineAngle === null ? '—' : `${pushupBodyLineAngle}°`;
  const muscleUpAngleLabel = (key: MuscleUpAngleKey) => {
    const value = muscleUpAngles[key];
    return value === null ? '—' : `${value}°`;
  };
  const dipElbowIsValid = dipElbowAngle !== null
    && isWithinAngle(dipElbowAngle, DIP_VALID_MIN_ANGLE, DIP_VALID_MAX_ANGLE);
  const dipTorsoIsValid = dipTorsoAngle !== null
    && isWithinAngle(dipTorsoAngle, DIP_TORSO_MIN_ANGLE, DIP_TORSO_MAX_ANGLE);
  const pulldownTorsoIsValid = pulldownTorsoAngle !== null
    && isWithinAngle(
      pulldownTorsoAngle,
      PULLDOWN_TORSO_MIN_ANGLE,
      PULLDOWN_TORSO_MAX_ANGLE,
    );
  const pulldownElbowIsValid = angle !== null
    && angle <= PULLDOWN_ANGLE_MAX
    && pulldownElbowAngle !== null
    && isWithinAngle(
      pulldownElbowAngle,
      PULLDOWN_ELBOW_MIN_ANGLE,
      PULLDOWN_ELBOW_MAX_ANGLE,
    );
  const rowTorsoIsValid = rowTorsoAngle !== null
    && isWithinAngle(rowTorsoAngle, ROW_TORSO_MIN_ANGLE, ROW_TORSO_MAX_ANGLE);
  const rowElbowRiseIsValid = rowElbowRiseAngle !== null
    && isWithinAngle(
      rowElbowRiseAngle,
      ROW_ELBOW_TORSO_MIN_ANGLE,
      ROW_ELBOW_TORSO_MAX_ANGLE,
    );
  const rowElbowIsValid = angle !== null
    && isWithinAngle(angle, 70, 115);
  const pushupElbowTorsoIsValid = pushupElbowTorsoAngle !== null
    && isWithinAngle(
      pushupElbowTorsoAngle,
      PUSHUP_ELBOW_TORSO_MIN_ANGLE,
      PUSHUP_ELBOW_TORSO_MAX_ANGLE + PUSHUP_ELBOW_TORSO_TOLERANCE,
    );
  const pushupBodyLineIsValid = pushupBodyLineAngle !== null
    && isWithinAngle(
      pushupBodyLineAngle,
      PUSHUP_BODY_LINE_MIN_ANGLE,
      PUSHUP_BODY_LINE_MAX_ANGLE,
    );
  const pullupElbowIsExtended = angle !== null
    && isWithinAngle(angle, PULLUP_BOTTOM_MIN_ANGLE, PULLUP_BOTTOM_MAX_ANGLE);
  const pullupHasStarted = angle !== null && angle < PULLUP_NO_LOCKOUT_ANGLE;
  const angleHistoryLabel = angleHistory.length
    ? angleHistory.map((value) => `${value}°`).join(' · ')
    : '—';
  const angleFeedback = selectedExercise === 'sentadillas'
    ? squatFeedback
    : selectedExercise === 'dominadas' || selectedExercise === 'dominadas-supinas'
      ? pullupFeedback
      : selectedExercise === 'muscle-up'
        ? muscleUpReferenceFeedback
      : techniqueFeedback;
  const angleIsGood = exerciseStarted && cameraReady && angleFeedback.tone === 'success';
  const diagnosisTone = cameraReady
    ? angleFeedback.tone
    : cameraGuidance.tone === 'warning'
      ? 'warning'
      : 'checking';
  const diagnosisStatus = phase !== 'tracking'
    ? 'ESPERANDO'
    : !cameraReady
      ? 'AJUSTAR CÁMARA'
      : !exerciseStarted
        ? 'LISTO PARA INICIAR'
        : selectedExercise === 'muscle-up'
          ? 'CALIBRACIÓN PENDIENTE'
        : angle === null
      ? 'ESPERANDO'
      : angleFeedback.tone === 'success'
        ? 'BIEN'
        : angleFeedback.tone === 'checking'
          ? 'EN PROCESO'
        : 'AJUSTAR';
  const formatCoordinate = (value: number | null) => value === null ? '—' : value.toFixed(1);
  const squatPhaseLabel = squatPhase === 'esperando arriba'
    ? 'Colócate arriba'
    : squatPhase === 'arriba'
      ? 'Arriba'
      : squatPhase === 'bajando'
        ? 'Bajando'
        : 'Abajo';
  const pullupPhaseLabel = pullupPhase === 'esperando abajo'
    ? 'Esperando extensión'
    : pullupPhase === 'abajo'
      ? 'Abajo'
      : pullupPhase === 'subiendo'
        ? 'Subiendo'
        : pullupPhase === 'arriba'
          ? 'Arriba'
          : 'Bajando';
  const exerciseRepPhaseLabel = exerciseRepPhase === 'esperando inicio'
    ? 'Colócate en la posición inicial'
    : exerciseRepPhase === 'inicio'
      ? 'Listo'
      : exerciseRepPhase === 'en movimiento'
        ? 'En movimiento'
        : 'Repetición válida';
  const conditionRows = getExerciseConditionRows(selectedExercise);
  const hasEvaluationCounter = selectedExercise === 'sentadillas'
    || selectedExercise === 'dominadas'
    || selectedExercise === 'dominadas-supinas'
    || Boolean(getRepetitionConfig(selectedExercise));
  const evaluatedRepetitions = selectedExercise === 'sentadillas'
    ? squatRepetitions
    : selectedExercise === 'dominadas' || selectedExercise === 'dominadas-supinas'
      ? pullupRepetitions
      : exerciseRepetitions;
  const correctRepetitions = selectedExercise === 'sentadillas'
    ? squatGoodRepetitions
    : selectedExercise === 'dominadas' || selectedExercise === 'dominadas-supinas'
      ? pullupGoodRepetitions
      : exerciseGoodRepetitions;
  const evaluationPhase = selectedExercise === 'sentadillas'
    ? squatPhaseLabel
    : selectedExercise === 'dominadas' || selectedExercise === 'dominadas-supinas'
      ? pullupPhaseLabel
      : exerciseRepPhaseLabel;
  const evaluationLabel = selectedExercise === 'muscle-up'
    ? 'Pendiente de calibración'
    : selectedExercise === 'plancha'
      ? 'Sostener posición'
      : hasEvaluationCounter
        ? `${correctRepetitions} / ${evaluatedRepetitions}`
        : 'Pendiente';

  return (
    <div className="posture-app">
      <div className="ambient-orb ambient-orb--top" aria-hidden="true" />
      <div className="ambient-orb ambient-orb--bottom" aria-hidden="true" />
      <main className="coach-layout">
        <header className="topbar">
          {isActive ? (
            <button
              type="button"
              className="topbar-back"
              data-testid="button-stop-camera-top"
              onClick={returnToWelcome}
            >
              <ArrowLeft size={15} strokeWidth={2} aria-hidden="true" />
              <span>Elegir otro ejercicio</span>
            </button>
          ) : (
            <div className="wordmark">
               <img className="wordmark-logo" src={brandLogoImage} alt="" aria-hidden="true" />
              <span>COACH / POSTURA</span>
            </div>
          )}
          <div className="topbar-actions">
            <div className="privacy-chip">
              <ShieldCheck size={13} strokeWidth={1.8} aria-hidden="true" />
              <span>Privado</span>
            </div>
            {/* El botón de cerrar sesión queda conservado en UserMenu para
                cuando se reactive AUTH_AND_BILLING_ENABLED. */}
          </div>
        </header>

        <div className="coach-stage">
          {phase === 'exercise-select' && (
            <section className="glass-panel exercise-panel" aria-labelledby="exercise-title">
              <div className="panel-kicker">
                <span className="kicker-line" aria-hidden="true" />
                <span>Tu espacio de alineación</span>
                <span className="kicker-line" aria-hidden="true" />
              </div>
              <h1 id="exercise-title" className="welcome-title">Elige tu ejercicio</h1>
              <p className="welcome-subtitle">
                Selecciona un movimiento para empezar a observar tu técnica en tiempo real.
              </p>
              <div className="exercise-list">
                {exercises.map((exercise) => {
                  const ExerciseIcon = exercise.id === 'fondos'
                    || exercise.id === 'dominadas'
                    || exercise.id === 'dominadas-supinas'
                    || exercise.id === 'muscle-up'
                    || exercise.id === 'jalon'
                    || exercise.id === 'remo-barra'
                    || exercise.id === 'flexiones'
                    || exercise.id === 'flexiones-declinadas'
                    || exercise.id === 'flexiones-pica'
                    || exercise.id === 'press-militar'
                    || exercise.id === 'triceps-polea-alta'
                    || exercise.id === 'extension-horizontal-barra'
                    || exercise.id === 'curl-biceps'
                    ? Activity
                    : exercise.id === 'sentadillas'
                      || exercise.id === 'zancadas'
                      || exercise.id === 'zancada-banco'
                      ? ArrowDown
                      : Square;
                  return (
                    <div
                      key={exercise.id}
                      className="exercise-card"
                      data-testid={`exercise-${exercise.id}`}
                    >
                      <button
                        type="button"
                        className="exercise-card-icon"
                        aria-label={`Ampliar imagen de ${exercise.name}`}
                        onClick={() => setPreviewExercise(exercise)}
                      >
                        <img className="exercise-card-image" src={exerciseImages[exercise.id]} alt="" />
                        <span className="exercise-card-zoom-hint" aria-hidden="true">
                          <Maximize2 size={12} strokeWidth={2} />
                        </span>
                      </button>
                      <button
                        type="button"
                        className="exercise-card-action"
                        onClick={() => void startCamera(exercise.id)}
                      >
                        <span className="exercise-card-copy">
                          <strong>{exercise.name}</strong>
                          <small>{exercise.description}</small>
                          {exercise.cameraNote && (
                            <small className="exercise-card-note">{exercise.cameraNote}</small>
                          )}
                        </span>
                        <ArrowRight className="exercise-card-arrow" size={17} strokeWidth={1.8} aria-hidden="true" />
                      </button>
                    </div>
                  );
                })}
              </div>
              <p className="privacy-note">
                <ShieldCheck size={14} strokeWidth={1.8} aria-hidden="true" />
                <span>La imagen se procesa solo en tu dispositivo; no se almacena.</span>
              </p>
            </section>
          )}

          {isActive && (
            <section className="glass-panel active-panel" aria-labelledby="active-title">
              <div className="active-header">
                <div>
                  <h1 id="active-title" className="active-title">{activeExercise?.name ?? 'Alineación en directo'}</h1>
                  <div className="active-meta">
                    <span className="active-meta-dot" aria-hidden="true" />
                    <span>
                      {activeExercise?.cameraNote && `${activeExercise.cameraNote} · `}
                      {dominantSide === 'left' ? 'lado izquierdo' : dominantSide === 'right' ? 'lado derecho' : 'buscando lado'}
                    </span>
                  </div>
                </div>
                <div className="active-header-actions">
                  <button
                    type="button"
                    className="camera-switch-button"
                    disabled={phase !== 'tracking'}
                    aria-label={`Cambiar a cámara ${cameraFacingMode === 'user' ? 'trasera' : 'delantera'}`}
                    onClick={toggleCamera}
                  >
                    <Camera size={15} strokeWidth={1.9} aria-hidden="true" />
                    <span>{cameraFacingMode === 'user' ? 'Delantera' : 'Trasera'}</span>
                  </button>
                  <ShieldCheck size={18} color={GREEN} strokeWidth={1.8} aria-label="Procesamiento privado" />
                </div>
              </div>
              {activeExercise && (
                <details className="tracking-contract">
                  <summary>
                    <span>
                      <Activity size={13} strokeWidth={1.9} aria-hidden="true" />
                      Qué está siguiendo la cámara
                    </span>
                    <strong>{activeExercise.trackBothSides ? 'Ambos lados' : 'Lado más visible'}</strong>
                  </summary>
                  <div className="tracking-contract-body">
                    <div className="tracking-contract-group">
                      <span className="tracking-contract-label">Puntos necesarios</span>
                      <div className="tracking-chip-list">
                        {activeExercise.trackedJoints.map(({ joint, label }) => (
                          <span className="tracking-chip" key={joint}>
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="tracking-contract-group">
                      <span className="tracking-contract-label">Ángulos que cuentan</span>
                      <ul className="tracking-angle-list">
                        {activeExercise.trackedAngleLabels.map((trackedAngle) => (
                          <li key={trackedAngle}>{trackedAngle}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </details>
              )}
              <div className={`exercise-start-bar ${exerciseStarted ? 'is-started' : ''}`}>
                <div className="exercise-start-copy">
                  <strong>
                    {exerciseStarted
                      ? !cameraReady
                        ? 'Ajusta la cámara para continuar'
                        : !detectionStable
                          ? 'Mejorando detección'
                          : 'Ejercicio iniciado'
                      : personDetected
                        ? cameraReady
                          ? '¿Ya estás listo?'
                          : poseDetected
                            ? 'Cuerpo detectado ✓'
                            : 'Rostro detectado ✓'
                        : 'Buscando tu cuerpo...'}
                  </strong>
                  <span>
                    {exerciseStarted
                      ? !cameraReady
                        ? cameraGuidance.detail
                        : !detectionStable
                          ? 'Mantén las articulaciones visibles; no se contará hasta estabilizar la pose 3D.'
                          : 'El contador está activo. Detén el curso cuando hayas terminado.'
                      : personDetected
                        ? cameraReady
                          ? 'Colócate en posición y comienza cuando quieras.'
                          : 'Puedes iniciar; ajusta la cámara para que el contador reconozca el ejercicio.'
                        : 'Aléjate lo suficiente para que se vea tu cuerpo completo y mantén las articulaciones visibles.'}
                  </span>
                </div>
                <button
                  type="button"
                  className="exercise-start-button"
                  disabled={phase !== 'tracking' || (!personDetected && !exerciseStarted)}
                  aria-pressed={exerciseStarted}
                  onClick={toggleExercise}
                >
                  {exerciseStarted
                    ? 'Detener curso'
                      : personDetected
                        ? 'Iniciar ejercicio'
                        : 'Buscando cuerpo'}
                </button>
              </div>
              <section className={`reference-calibration ${referenceRecording ? 'is-recording' : ''}`} aria-labelledby="reference-title">
                <div className="reference-calibration-heading">
                  <div>
                    <span className="reference-eyebrow">Calibración por referencia</span>
                    <h2 id="reference-title">Graba una ejecución correcta</h2>
                  </div>
                  <span className="reference-state">
                    {referenceRecording ? 'REC' : referenceSummary ? 'LISTA' : '—'}
                  </span>
                </div>
                <p>{referenceMessage}</p>
                <div className="reference-actions">
                  {!referenceRecording ? (
                    <button
                      type="button"
                      className="reference-primary-button"
                      disabled={phase !== 'tracking' || !cameraReady}
                      onClick={startReferenceCapture}
                    >
                      <Activity size={14} strokeWidth={2} aria-hidden="true" />
                      Iniciar referencia
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="reference-primary-button reference-primary-button--stop"
                      onClick={finishReferenceCapture}
                    >
                      <Square size={13} fill="currentColor" strokeWidth={2} aria-hidden="true" />
                      Finalizar y analizar
                    </button>
                  )}
                  {referenceSummary && (
                    <>
                      <button
                        type="button"
                        className="reference-secondary-button"
                        onClick={downloadReferencePacket}
                      >
                        Descargar paquete IA
                      </button>
                      <button
                        type="button"
                        className="reference-secondary-button"
                        onClick={() => void copyCalibrationPrompt()}
                      >
                        Copiar prompt
                      </button>
                    </>
                  )}
                </div>
                {referenceRecording && (
                  <div className="reference-progress" role="status" aria-live="polite">
                    <span className="reference-recording-dot" aria-hidden="true" />
                    <span>{referenceSampleCount} muestras estables guardadas</span>
                    <small>Haz una repetición completa, desde el inicio hasta el final.</small>
                  </div>
                )}
                {referenceSummary && (
                  <div className="reference-results">
                    <div className="reference-results-header">
                      <strong>Rangos observados</strong>
                      <span>{referenceSummary.sampleCount} muestras · {Math.round(referenceSummary.durationMs / 1000)} s</span>
                    </div>
                    <div className="reference-metric-grid">
                      {referenceSummary.metrics.map((metric) => (
                        <div className="reference-metric" key={metric.label}>
                          <span>{metric.label}</span>
                          <strong>{metric.observedMin}°–{metric.observedMax}°</strong>
                          <small>Sugerido para revisar: {metric.recommendedMin}°–{metric.recommendedMax}°</small>
                        </div>
                      ))}
                    </div>
                    <small className="reference-disclaimer">
                      La propuesta añade un margen inicial para ruido de cámara; la IA debe validar las fases del movimiento antes de convertirla en regla.
                    </small>
                  </div>
                )}
              </section>
              {angleIsGood && angle !== null && (
                <div className="exercise-good-message" role="status" aria-live="polite">
                  <span aria-hidden="true">✓</span>
                  <strong>¡Bien hecho!</strong>
                  <span>El movimiento está dentro del rango.</span>
                </div>
              )}
              {selectedExercise === 'sentadillas' && (
                <div className="squat-summary" aria-label="Resumen de sentadillas">
                  <div className="squat-summary-stat">
                    <span>Correctas</span>
                    <strong>{squatGoodRepetitions}</strong>
                  </div>
                  <div className="squat-summary-stat">
                    <span>Total evaluadas</span>
                    <strong>{squatRepetitions}</strong>
                  </div>
                  <p>Rango objetivo 83–90° · ángulo compensado para la posición de la cámara.</p>
                </div>
              )}
              {(selectedExercise === 'dominadas' || selectedExercise === 'dominadas-supinas') && (
                <div className="squat-summary" aria-label={`Resumen de ${selectedExercise === 'dominadas-supinas' ? 'dominadas supinas' : 'dominadas'}`}>
                  <div className="squat-summary-stat">
                    <span>Correctas</span>
                    <strong>{pullupGoodRepetitions}</strong>
                  </div>
                  <div className="squat-summary-stat">
                    <span>Total evaluadas</span>
                    <strong>{pullupRepetitions}</strong>
                  </div>
                  <p>
                     {selectedExercise === 'dominadas-supinas'
                       ? `Extensión de codos ${PULLUP_BOTTOM_MIN_ANGLE}–${PULLUP_BOTTOM_MAX_ANGLE}° · cabeza por encima de las muñecas · agarre supino.`
                        : `Extensión de codos ${PULLUP_BOTTOM_MIN_ANGLE}–${PULLUP_BOTTOM_MAX_ANGLE}° · cabeza por encima de las muñecas.`}
                  </p>
                </div>
              )}
              {selectedExercise === 'dominadas' && (
                <details className="pulldown-instructions">
                  <summary>Qué debe cumplir tu dominada</summary>
                  <ul>
                    <li><b>Extensión:</b> inicia y termina con los codos entre {PULLUP_BOTTOM_MIN_ANGLE}° y {PULLUP_BOTTOM_MAX_ANGLE}°.</li>
                    <li><b>Altura:</b> sube hasta que la cabeza pase por encima de las muñecas.</li>
                  </ul>
                </details>
              )}
              {selectedExercise === 'dominadas-supinas' && (
                <details className="pulldown-instructions">
                  <summary>Qué debe cumplir tu dominada supina</summary>
                  <ul>
                    <li><b>Agarre:</b> usa el agarre supino que muestra la imagen.</li>
                    <li><b>Recorrido:</b> extiende bien los codos, sube hasta que la cabeza pase por encima de las muñecas y vuelve a extender los brazos.</li>
                  </ul>
                </details>
              )}
              {selectedExercise === 'muscle-up' && (
                <details className="pulldown-instructions" open>
                  <summary>Lecturas de referencia del muscle-up</summary>
                  <ul>
                    <li><b>Encuadre:</b> usa una vista lateral y deja dentro de la imagen la barra, las manos, la cabeza y todo el cuerpo.</li>
                    <li><b>Medición:</b> se muestran los ángulos de ambos codos, rodillas y tobillos mientras te mueves.</li>
                    <li><b>Balanceo:</b> por ahora solo registramos los valores; no marcamos un rango correcto hasta calibrarlo con tu ejecución de referencia.</li>
                    <li><b>Seguridad:</b> si estás empezando, practica con asistencia y prioriza un recorrido controlado, sin forzar hombros, codos o muñecas.</li>
                  </ul>
                </details>
              )}
              {getRepetitionConfig(selectedExercise) && (
                <div className="squat-summary" aria-label={`Contador de ${activeExercise?.name ?? 'ejercicio'}`}>
                  <div className="squat-summary-stat">
                    <span>Correctas</span>
                    <strong>{exerciseGoodRepetitions}</strong>
                  </div>
                  <div className="squat-summary-stat">
                    <span>Total válidas</span>
                    <strong>{exerciseRepetitions}</strong>
                  </div>
                  <p>
                    {selectedExercise === 'jalon'
                      ? `Solo cuenta si mantienes el torso entre ${PULLDOWN_TORSO_MIN_ANGLE}° y ${PULLDOWN_TORSO_MAX_ANGLE}° y el ángulo cadera–hombro–codo entra entre ${PULLDOWN_ANGLE_MIN}° y ${PULLDOWN_ANGLE_MAX}° antes de volver a subir.`
                      : selectedExercise === 'fondos'
                        ? `Solo cuenta si mantienes el torso entre ${DIP_TORSO_MIN_ANGLE}° y ${DIP_TORSO_MAX_ANGLE}° y llegas con el codo entre ${DIP_VALID_MIN_ANGLE}° y ${DIP_VALID_MAX_ANGLE}°.`
                      : selectedExercise === 'remo-barra'
                        ? `Solo cuenta si mantienes el torso entre ${ROW_TORSO_MIN_ANGLE}° y ${ROW_TORSO_MAX_ANGLE}°, elevas los codos entre ${ROW_ELBOW_TORSO_MIN_ANGLE}° y ${ROW_ELBOW_TORSO_MAX_ANGLE}° y completas el recorrido del codo.`
                      : selectedExercise === 'flexiones'
                        ? `Solo cuenta si mantienes el codo respecto al torso entre ${PUSHUP_ELBOW_TORSO_MIN_ANGLE}° y ${PUSHUP_ELBOW_TORSO_MAX_ANGLE + PUSHUP_ELBOW_TORSO_TOLERANCE}° y el cuerpo alineado entre ${PUSHUP_BODY_LINE_MIN_ANGLE}° y ${PUSHUP_BODY_LINE_MAX_ANGLE}°, además de completar el recorrido del codo.`
                      : `Solo cuenta cuando completas el recorrido y llegas al rango de ${getRepetitionConfig(selectedExercise)?.endLabel}.`}
                  </p>
                </div>
              )}
              {selectedExercise === 'fondos' && (
                <details className="pulldown-instructions">
                  <summary>Condiciones para una repetición correcta</summary>
                  <ul>
                    <li><b>Encuadre:</b> colócate de lado y deja visibles hombro, codo, muñeca y cadera.</li>
                    <li><b>Torso:</b> inclínalo hacia delante entre 30° y 40° para enfatizar el pecho; mantén esa posición durante el recorrido.</li>
                    <li><b>Profundidad:</b> baja hasta que el ángulo del codo esté entre 85° y 95°.</li>
                    <li><b>Recorrido:</b> inicia con los brazos extendidos entre 150° y 180° y vuelve a subir con control.</li>
                    <li><b>Repetición:</b> si pierdes la inclinación del torso o el encuadre, el contador reinicia la repetición en curso.</li>
                  </ul>
                </details>
              )}
              {selectedExercise === 'jalon' && (
                <details className="pulldown-instructions">
                  <summary>Cómo hacerlo</summary>
                  <ul>
                    <li><b>Movimiento:</b> tira de la barra hacia el pecho.</li>
                    <li><b>Torso:</b> mantenlo erguido, con una inclinación de {PULLDOWN_TORSO_MIN_ANGLE}°–{PULLDOWN_TORSO_MAX_ANGLE}° respecto a la vertical; evita balancearte.</li>
                    <li><b>Codos:</b> al llevar la barra al pecho, busca aproximadamente {PULLDOWN_ELBOW_MIN_ANGLE}°–{PULLDOWN_ELBOW_MAX_ANGLE}°; mantenlos dirigidos hacia abajo.</li>
                    <li><b>Rango:</b> el ángulo cadera–hombro–codo debe bajar y entrar entre {PULLDOWN_ANGLE_MIN}° y {PULLDOWN_ANGLE_MAX}°.</li>
                    <li><b>Repetición:</b> solo cuenta cuando cumples el rango del torso, el ángulo entra en el objetivo y vuelves a subir.</li>
                  </ul>
                </details>
              )}
              {selectedExercise === 'remo-barra' && (
                <details className="pulldown-instructions">
                  <summary>Condiciones para una repetición correcta</summary>
                  <ul>
                    <li><b>Encuadre:</b> colócate de lado y deja visibles hombro, codo, muñeca, cadera, rodilla y tobillo durante toda la serie.</li>
                    <li><b>Posición:</b> lleva la cadera atrás, inclina el torso {ROW_TORSO_MIN_ANGLE}°–{ROW_TORSO_MAX_ANGLE}° respecto a la vertical y mantén la espalda neutra; no redondees ni balancees el cuerpo.</li>
                    <li><b>Rodillas:</b> mantenlas desbloqueadas, aproximadamente entre 150° y 180°, con los pies firmes en el suelo.</li>
                    <li><b>Tirón:</b> eleva los codos entre {ROW_ELBOW_TORSO_MIN_ANGLE}° y {ROW_ELBOW_TORSO_MAX_ANGLE}° respecto al torso y dirige la barra hacia el abdomen o las costillas bajas.</li>
                    <li><b>Recorrido:</b> empieza con los brazos extendidos entre 145° y 180°, tira hasta que el codo llegue a 70°–115° y regresa lentamente al inicio.</li>
                    <li><b>Repetición:</b> el contador se reinicia si pierdes la inclinación, cambias la posición de las rodillas o la elevación de los codos sale del rango.</li>
                  </ul>
                </details>
              )}
              {selectedExercise === 'flexiones-pica' && (
                <details className="pulldown-instructions">
                  <summary>Cómo hacerlo</summary>
                  <ul>
                    <li><b>Codos:</b> mantenlos entre 45° y 60° respecto al cuerpo; evita abrirlos formando una “T”.</li>
                    <li><b>Muñecas y hombros:</b> coloca las manos debajo de los hombros, formando aproximadamente 90° con el suelo.</li>
                    <li><b>Cuerpo:</b> mantén cabeza, espalda, cadera y talones en una línea firme durante todo el movimiento.</li>
                  </ul>
                </details>
              )}
              {selectedExercise === 'flexiones-declinadas' && (
                <details className="pulldown-instructions">
                  <summary>Cómo hacerlo</summary>
                  <ul>
                    <li><b>Apoyo:</b> coloca los pies sobre un banco o soporte estable y mantén el cuerpo en una línea firme.</li>
                    <li><b>Manos:</b> apóyalas debajo de los hombros, con los dedos abiertos y el abdomen activo.</li>
                    <li><b>Codos:</b> llévalos entre 30° y 60° respecto al torso; busca aproximadamente 45° y evita abrirlos en forma de “T”.</li>
                    <li><b>Cuerpo:</b> mantén hombros, cadera y tobillos alineados entre 162° y 180°; no dejes caer la cadera.</li>
                    <li><b>Movimiento:</b> baja el pecho de forma controlada y sube sin bloquear bruscamente los codos.</li>
                  </ul>
                </details>
              )}
              {selectedExercise === 'press-militar' && (
                <details className="pulldown-instructions">
                  <summary>Cómo hacerlo</summary>
                  <ul>
                    <li><b>Posición inicial:</b> coloca las mancuernas a la altura de los hombros antes de iniciar el empuje.</li>
                    <li><b>Codos:</b> mantenlos aproximadamente a 45° respecto al torso, en el plano de la escápula. No los abras a 90° formando una “T” con los hombros.</li>
                    <li><b>Trayectoria:</b> dirige las mancuernas hacia arriba y ligeramente hacia dentro, formando una “V” invertida vista desde arriba.</li>
                    <li><b>Control:</b> empuja sin encoger los hombros y baja las mancuernas lentamente hasta la altura de los hombros.</li>
                  </ul>
                </details>
              )}
              {selectedExercise === 'triceps-polea-alta' && (
                <details className="pulldown-instructions">
                  <summary>Cómo hacerlo</summary>
                  <ul>
                    <li><b>Posición:</b> colócate frente a la polea alta con los pies al ancho de los hombros y una ligera inclinación del torso, sin encorvarte.</li>
                    <li><b>Codos:</b> mantenlos pegados a los costados y fijos; no los lleves hacia delante ni los abras durante la serie.</li>
                    <li><b>Muñecas:</b> conserva una posición neutra y sujeta la barra o cuerda sin doblarlas hacia atrás.</li>
                    <li><b>Movimiento:</b> extiende los codos hacia abajo hasta acercarte a la extensión completa, sin bloquearlos bruscamente.</li>
                    <li><b>Regreso:</b> sube lentamente hasta un ángulo cómodo de 80–100° y repite sin balancear el torso.</li>
                  </ul>
                </details>
              )}
              {selectedExercise === 'extension-horizontal-barra' && (
                <details className="pulldown-instructions">
                  <summary>Cómo hacerlo</summary>
                  <ul>
                    <li><b>Posición:</b> túmbate en un banco estable y sujeta la barra sobre el pecho con los brazos extendidos.</li>
                    <li><b>Codos:</b> mantenlos apuntando hacia arriba y cerca de la línea de los hombros; evita abrirlos hacia los lados.</li>
                    <li><b>Bajada:</b> flexiona solo los codos y lleva la barra hacia la frente con control, hasta unos 70°–105°.</li>
                    <li><b>Subida:</b> extiende los codos sin mover los hombros ni bloquearlos bruscamente.</li>
                    <li><b>Encuadre:</b> usa una vista lateral y deja visibles hombro, codo y muñeca durante todo el movimiento.</li>
                  </ul>
                </details>
              )}
              {selectedExercise === 'curl-biceps' && (
                <details className="pulldown-instructions">
                  <summary>Cómo hacerlo</summary>
                  <ul>
                    <li><b>Vista:</b> grábate de lado para que se vea claramente el ángulo del codo.</li>
                    <li><b>Subida:</b> flexiona el codo y lleva las manos casi hasta el pecho, llegando aproximadamente a 30°–60°.</li>
                    <li><b>Bajada:</b> desciende con control, pero detente entre 85° y 135°; no extiendas por completo el brazo para mantener la tensión.</li>
                    <li><b>Control:</b> evita los rebotes y mantén un movimiento continuo, sin necesidad de cumplir otras condiciones posturales.</li>
                  </ul>
                </details>
              )}
              {selectedExercise === 'dominadas-supinas' && (
                <details className="pulldown-instructions">
                  <summary>Cómo hacerlo</summary>
                  <ul>
                    <li><b>Codo:</b> termina la subida cerca de 90° y desciende hasta extender los brazos entre {PULLUP_BOTTOM_MIN_ANGLE}° y {PULLUP_BOTTOM_MAX_ANGLE}°.</li>
                    <li><b>Hombro:</b> mantén los codos entre 30° y 45° de abducción respecto al torso.</li>
                    <li><b>Control:</b> pasa la barbilla sobre la barra sin balancearte y baja lentamente.</li>
                  </ul>
                </details>
              )}
              {selectedExercise === 'zancadas' && (
                <details className="pulldown-instructions">
                  <summary>Cómo hacerlo</summary>
                  <ul>
                    <li><b>Rodilla delantera:</b> llega aproximadamente a 90° y mantenla alineada verticalmente con el tobillo.</li>
                    <li><b>Cadera y rodilla trasera:</b> busca 90° en ambas, dejando la rodilla trasera cerca del suelo sin golpearlo.</li>
                    <li><b>Torso:</b> mantén una inclinación leve de 75°–80° respecto al suelo y controla cada transición.</li>
                  </ul>
                </details>
              )}
              {selectedExercise === 'zancada-banco' && (
                <details className="pulldown-instructions">
                  <summary>Cómo hacerlo</summary>
                  <ul>
                    <li><b>Altura del banco:</b> debe quedar al nivel de tu rodilla o ligeramente por debajo cuando estés de pie junto a él.</li>
                    <li><b>Pie trasero:</b> apoya todo el pie activo sobre el banco, incluido el talón; evita dejarlo suspendido.</li>
                    <li><b>Rodilla delantera:</b> busca entre 80° y 100°, idealmente cerca de 90°. Evita que la rodilla se cierre demasiado.</li>
                    <li><b>Torso:</b> inclínalo entre 15° y 20° hacia delante manteniendo la espalda recta.</li>
                    <li><b>Movimiento:</b> sube usando la pierna que está arriba y baja lentamente; extiende cadera y rodilla con control, sin bloquearlas de golpe.</li>
                  </ul>
                </details>
              )}
              <div
                className={`video-stage ${
                  selectedExercise === 'fondos' ? 'video-stage--dip' : ''
                }${
                  selectedExercise === 'dominadas' || selectedExercise === 'dominadas-supinas'
                    ? ' video-stage--pullup'
                    : ''
                }`}
                style={{ aspectRatio: videoRatio }}
              >
                <video
                  ref={videoRef}
                  muted
                  autoPlay
                  playsInline
                  style={{ transform: cameraFacingMode === 'user' ? 'scaleX(-1)' : 'none' }}
                  onLoadedMetadata={syncVideoSize}
                  data-testid="video-camera-preview"
                  aria-label={`Vista previa de la cámara ${
                    selectedExercise === 'flexiones'
                      || selectedExercise === 'flexiones-declinadas'
                      || selectedExercise === 'flexiones-pica'
                      || selectedExercise === 'press-militar'
                      || selectedExercise === 'triceps-polea-alta'
                      || selectedExercise === 'extension-horizontal-barra'
                      || selectedExercise === 'curl-biceps'
                      || selectedExercise === 'fondos'
                       || selectedExercise === 'dominadas'
                       || selectedExercise === 'dominadas-supinas'
                      || selectedExercise === 'muscle-up'
                      || selectedExercise === 'zancadas'
                      || selectedExercise === 'zancada-banco'
                      || selectedExercise === 'jalon'
                      || selectedExercise === 'remo-barra'
                      || selectedExercise === 'plancha'
                       ? selectedExercise === 'dominadas' || selectedExercise === 'dominadas-supinas'
                         ? 'trasera'
                         : 'lateral'
                      : 'frontal'
                  }`}
                />
                <canvas ref={canvasRef} aria-hidden="true" />
                <div className="video-vignette" aria-hidden="true" />
                <span className="stage-corner stage-corner--tl" aria-hidden="true" />
                <span className="stage-corner stage-corner--tr" aria-hidden="true" />
                <span className="stage-corner stage-corner--bl" aria-hidden="true" />
                <span className="stage-corner stage-corner--br" aria-hidden="true" />
                  <div
                    className={`live-angle-hud live-angle-hud--${liveAngleReadings.length > 3 ? 'wide' : 'compact'}`}
                    aria-label={`Ángulos medidos en tiempo real de ${activeExercise?.name ?? 'este ejercicio'}`}
                    aria-live="polite"
                  >
                    <div className="live-angle-hud-heading">
                      <span>Medición en vivo</span>
                      <strong>{cameraReady ? 'ACTIVA' : 'ESPERANDO CÁMARA'}</strong>
                    </div>
                    <div className="live-angle-grid">
                      {liveAngleReadings.map((reading) => {
                        const isValid = reading.value !== null
                          && reading.min !== undefined
                          && reading.max !== undefined
                          && isWithinAngle(reading.value, reading.min, reading.max);
                        return (
                          <div
                            key={`${reading.label}-${reading.target}`}
                            className={`live-angle-reading ${isValid ? 'is-valid' : ''}`}
                          >
                            <span className="live-angle-label">{reading.label}</span>
                            <strong>{reading.value === null ? '—' : `${reading.value}°`}</strong>
                            <small>Objetivo {reading.target}</small>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {selectedExercise === 'fondos' && (
                    <div
                      className="dip-joints-hud"
                      aria-label={`Puntos seguidos para fondos en barra${
                        dominantSide ? `, lado ${sideLabel.toLowerCase()}` : ''
                      }`}
                    >
                      <div className="dip-joints-hud-heading">
                        <span>Puntos seguidos</span>
                        <strong>{dominantSide ? sideLabel : 'ESPERANDO'}</strong>
                      </div>
                      <div className="dip-joints-grid">
                        {dipJointReadings.map(({ label, value }) => (
                          <div className="dip-joint-chip" key={label}>
                            <i aria-hidden="true" />
                            <span>{label}</span>
                            <strong>{value === null ? '—' : `${value}°`}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {(selectedExercise === 'dominadas' || selectedExercise === 'dominadas-supinas') && (
                    <div
                      className="dip-joints-hud pullup-joints-hud"
                      aria-label="Medición en vivo de ambos hombros, codos, muñecas y posición de la cabeza"
                    >
                      <div className="dip-joints-hud-heading">
                        <span>Articulaciones en vivo</span>
                        <strong>IZQ. + DER.</strong>
                      </div>
                      <div className="dip-joints-grid pullup-joints-grid">
                        {pullupJointReadings.map(({ label, value, status }) => (
                          <div className="dip-joint-chip" key={label}>
                            <i aria-hidden="true" />
                            <span>{label}</span>
                            <strong>
                              {value === null ? (status ?? '—') : `${value}°`}
                            </strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                {phase !== 'tracking' && (
                  <div className="camera-loading" role="status" aria-live="polite">
                    <div className="loading-copy">
                      <span className="loading-mark" aria-hidden="true" />
                      <span>{phase === 'requesting' ? 'Solicitando acceso...' : 'Preparando tu vista...'}</span>
                    </div>
                  </div>
                )}
              </div>
              <div
                className={`status-surface ${faceDetected || poseDetected ? 'is-detected' : 'is-searching'}`}
                role="status"
                aria-live="polite"
                aria-atomic="true"
                data-testid="status-posture"
              >
                <div className="status-reading">
                  <span className="status-dot" aria-hidden="true" />
                  <span>{statusMessage}</span>
                </div>
              </div>
              <div
                className={`camera-guidance camera-guidance--${cameraGuidance.tone}`}
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                <Camera size={16} strokeWidth={1.9} aria-hidden="true" />
                <div>
                  <strong>{cameraGuidance.message}</strong>
                  <small>{cameraGuidance.detail}</small>
                </div>
              </div>
              <div
                className={`simple-diagnosis simple-diagnosis--${diagnosisTone}`}
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                <div className="simple-diagnosis-reading">
                  <span>Grados realizados</span>
                  <strong>{angleLabel}</strong>
                </div>
                <div className="simple-diagnosis-result">
                  <span>Resultado</span>
                  <strong>{diagnosisStatus}</strong>
                </div>
                {diagnosisStatus === 'AJUSTAR CÁMARA' ? (
                  <p>{cameraGuidance.detail}</p>
                ) : diagnosisStatus === 'CALIBRACIÓN PENDIENTE' ? (
                  <p>Los valores se muestran como referencia. Aún no se marca el balanceo como correcto o incorrecto.</p>
                ) : diagnosisStatus === 'AJUSTAR' && angle !== null ? (
                  <p>{angleFeedback.message}</p>
                ) : null}
              </div>
              <div className="diagnostic-dock">
                <button
                  type="button"
                  className="diagnostic-toggle"
                  aria-expanded={diagnosticOpen}
                  aria-controls="diagnostic-panel"
                  onClick={() => setDiagnosticOpen((isOpen) => !isOpen)}
                >
                  <Activity size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{diagnosticOpen ? 'Ocultar diagnóstico' : 'Mostrar diagnóstico'}</span>
                </button>
                {diagnosticOpen && (
                  <aside id="diagnostic-panel" className="diagnostic-panel" aria-label="Panel de diagnóstico temporal">
                    <div className="diagnostic-heading">
                      <span>Diagnóstico</span>
                      <span className="diagnostic-temporary">Temporal</span>
                    </div>
                    <dl className="diagnostic-list">
                  <div className="diagnostic-row">
                    <dt>Modelo</dt>
                    <dd className={modelStatusClass}>{modelStatus}</dd>
                  </div>
                  <div className="diagnostic-row">
                    <dt>Ejercicio</dt>
                    <dd className="diagnostic-value">{activeExercise?.name ?? '—'}</dd>
                  </div>
                  {selectedExercise === 'sentadillas' && (
                    <>
                      <div className="diagnostic-row">
                        <dt>Correctas</dt>
                        <dd className="diagnostic-value diagnostic-value--success">{squatGoodRepetitions}</dd>
                      </div>
                      <div className="diagnostic-row">
                        <dt>Total evaluadas</dt>
                        <dd className="diagnostic-value diagnostic-value--accent">{squatRepetitions}</dd>
                      </div>
                      <div className="diagnostic-row">
                        <dt>Incorrectas</dt>
                        <dd className="diagnostic-value diagnostic-value--warning">
                          {Math.max(0, squatRepetitions - squatGoodRepetitions)}
                        </dd>
                      </div>
                      <div className="diagnostic-row">
                        <dt>Evaluación</dt>
                        <dd className={`diagnostic-value ${squatFeedback.tone === 'success' ? 'diagnostic-value--success' : squatFeedback.tone === 'warning' ? 'diagnostic-value--warning' : ''}`}>
                          {squatFeedback.message}
                        </dd>
                      </div>
                    </>
                  )}
                  {(selectedExercise === 'dominadas' || selectedExercise === 'dominadas-supinas') && (
                    <>
                      <div className="diagnostic-row">
                        <dt>Correctas</dt>
                        <dd className="diagnostic-value diagnostic-value--success">{pullupGoodRepetitions}</dd>
                      </div>
                      <div className="diagnostic-row">
                        <dt>Total evaluadas</dt>
                        <dd className="diagnostic-value diagnostic-value--accent">{pullupRepetitions}</dd>
                      </div>
                      <div className="diagnostic-row">
                        <dt>Incorrectas</dt>
                        <dd className="diagnostic-value diagnostic-value--warning">
                          {Math.max(0, pullupRepetitions - pullupGoodRepetitions)}
                        </dd>
                      </div>
                      <div className="diagnostic-row">
                        <dt>Evaluación</dt>
                        <dd className={`diagnostic-value ${pullupFeedback.tone === 'success' ? 'diagnostic-value--success' : pullupFeedback.tone === 'warning' ? 'diagnostic-value--warning' : ''}`}>
                          {pullupFeedback.message}
                        </dd>
                      </div>
                    </>
                  )}
                  {getRepetitionConfig(selectedExercise) && (
                    <>
                      <div className="diagnostic-row">
                        <dt>Correctas</dt>
                        <dd className="diagnostic-value diagnostic-value--success">{exerciseGoodRepetitions}</dd>
                      </div>
                      <div className="diagnostic-row">
                        <dt>Total válidas</dt>
                        <dd className="diagnostic-value diagnostic-value--accent">{exerciseRepetitions}</dd>
                      </div>
                    </>
                  )}
                  <div className="diagnostic-row">
                    <dt>Lado / score</dt>
                    <dd className={`diagnostic-value ${sideSwitches > 0 ? 'diagnostic-value--warning' : ''}`}>
                      {sideLabelWithScore}
                    </dd>
                  </div>
                  <div className="diagnostic-row">
                    <dt>Cambio de lado</dt>
                    <dd className={`diagnostic-value ${sideSwitches > 0 ? 'diagnostic-value--warning' : ''}`}>
                      {sideChangeNotice}{sideSwitches > 0 ? ` (${sideSwitches})` : ''}
                    </dd>
                  </div>
                  <div className="diagnostic-row diagnostic-row--points">
                     <dt>Puntos ángulo 3D</dt>
                    <dd className="diagnostic-angle-points">
                      {anglePoints.length
                        ? anglePoints.map((point) => (
                          <span key={point.label}>
                             {point.label} ({formatCoordinate(point.x)}, {formatCoordinate(point.y)}, {formatCoordinate(point.z)})
                          </span>
                        ))
                        : '—'}
                    </dd>
                  </div>
                  <div className="diagnostic-row">
                    <dt>Ángulo actual</dt>
                    <dd className="diagnostic-value diagnostic-value--accent">{angleLabel}</dd>
                  </div>
                  <div className="diagnostic-row diagnostic-row--history">
                    <dt>Historial (5)</dt>
                    <dd className="diagnostic-angle-history">{angleHistoryLabel}</dd>
                  </div>
                  <div className="diagnostic-row">
                    <dt>Video</dt>
                    <dd className="diagnostic-value">{resolutionLabel}</dd>
                  </div>
                  <div className="diagnostic-row">
                    <dt>FPS detección</dt>
                    <dd className="diagnostic-value">{fps}</dd>
                  </div>
                  <div className="diagnostic-row">
                    <dt>Persona</dt>
                    <dd className={`diagnostic-value ${faceDetected ? 'diagnostic-value--success' : ''}`}>
                      {poseDetected
                        ? detectionStable
                          ? 'Pose 3D estable ✓'
                          : 'Mejorando detección'
                        : faceDetected
                          ? 'Rostro detectado ✓'
                          : 'Sin detección'}
                    </dd>
                  </div>
                  <div className="diagnostic-row diagnostic-row--confidence">
                    <dt>Confianza</dt>
                    <dd className="diagnostic-confidence">
                      {confidencePoints.map((point) => (
                        <span key={point.label}>
                          {point.label} {formatScore(point.score)} <small>{point.side}</small>
                        </span>
                      ))}
                    </dd>
                  </div>
                  <div className="diagnostic-row">
                    <dt>Errores JS</dt>
                    <dd className={`diagnostic-value ${errorCount > 0 ? 'diagnostic-value--error' : ''}`}>
                      {errorCount}
                    </dd>
                  </div>
                    </dl>
                  </aside>
                )}
              </div>
            </section>
          )}

          {phase === 'error' && (
            <section className="glass-panel error-panel" aria-labelledby="error-title" role="alert">
              <div className="error-mark" aria-hidden="true">
                <AlertTriangle size={22} strokeWidth={1.7} />
              </div>
              <h1 id="error-title" className="error-title">No pudimos activar la cámara</h1>
              <p className="error-copy">{errorMessage}</p>
              <div className="error-actions">
                <button
                  type="button"
                  className="secondary-action"
                  data-testid="button-retry-camera"
                  onClick={() => void startCamera(selectedExerciseRef.current ?? undefined)}
                >
                  <Camera size={16} strokeWidth={2} aria-hidden="true" />
                  <span>Intentar de nuevo</span>
                </button>
                <button
                  type="button"
                  className="stop-action"
                  data-testid="button-return-welcome"
                  onClick={returnToWelcome}
                >
                  <ArrowLeft size={14} strokeWidth={2} aria-hidden="true" />
                  <span>Volver al inicio</span>
                </button>
              </div>
            </section>
          )}
        </div>

        {previewExercise && (
          <div
            className="exercise-image-modal"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setPreviewExercise(null);
            }}
          >
            <div
              className="exercise-image-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="exercise-image-title"
            >
              <div className="exercise-image-dialog-header">
                <h2 id="exercise-image-title">{previewExercise.name}</h2>
                <button
                  type="button"
                  className="exercise-image-close"
                  aria-label="Cerrar imagen ampliada"
                  onClick={() => setPreviewExercise(null)}
                >
                  ×
                </button>
              </div>
              <img
                className="exercise-image-expanded"
                src={exerciseImages[previewExercise.id]}
                alt={`Ilustración de ${previewExercise.name}`}
              />
              <p>Toca fuera de la imagen o presiona Esc para cerrar.</p>
            </div>
          </div>
        )}

        <p className="app-footer">Sin grabaciones · Sin cuentas · Solo tú y tu movimiento</p>
      </main>
    </div>
  );
}

function PublicWelcome() {
  const [, setLocation] = useLocation();

  return (
    <div className="posture-app">
      <div className="ambient-orb ambient-orb--top" aria-hidden="true" />
      <div className="ambient-orb ambient-orb--bottom" aria-hidden="true" />
      <main className="coach-layout">
        <header className="topbar">
          <div className="wordmark">
            <img className="wordmark-logo" src={brandLogoImage} alt="" aria-hidden="true" />
            <span>COACH / POSTURA</span>
          </div>
          <div className="privacy-chip">
            <ShieldCheck size={13} strokeWidth={1.8} aria-hidden="true" />
            <span>Privado</span>
          </div>
        </header>
        <div className="coach-stage">
          <section className="glass-panel welcome-panel account-panel" aria-labelledby="account-title">
            <div className="panel-kicker">
              <span className="kicker-line" aria-hidden="true" />
              <span>Tu espacio de alineación</span>
              <span className="kicker-line" aria-hidden="true" />
            </div>
            <div className="account-mark" aria-hidden="true">
              <Activity size={22} strokeWidth={1.8} />
            </div>
            <h1 id="account-title" className="welcome-title">Entrena con precisión.</h1>
            <p className="welcome-subtitle">
              Regístrate con Google y activa tu acceso anual para recibir correcciones de técnica
              en tiempo real, directamente desde tu cámara.
            </p>
            <div className="account-actions">
              <button
                type="button"
                className="primary-action"
                onClick={() => setLocation('/sign-up')}
              >
                Crear cuenta con Google
                <ArrowRight size={17} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="secondary-action"
                onClick={() => setLocation('/sign-in')}
              >
                Ya tengo una cuenta
              </button>
            </div>
            <p className="privacy-note">
              <ShieldCheck size={14} strokeWidth={1.8} aria-hidden="true" />
              <span>Tu cámara se procesa en tu dispositivo</span>
            </p>
          </section>
        </div>
        <p className="app-footer">Acceso protegido · Lemon Squeezy · Clerk</p>
      </main>
    </div>
  );
}

function SubscriptionRequired() {
  const { user } = useUser();
  const checkout = useCreateBillingCheckout();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const openCheckout = useCallback(async () => {
    setCheckoutError(null);
    try {
      const result = await checkout.mutateAsync();
      window.location.assign(result.checkoutUrl);
    } catch (error) {
      const apiError = error as { error?: string };
      setCheckoutError(
        apiError.error ||
          'No pudimos abrir el checkout. Inténtalo de nuevo en unos segundos.',
      );
    }
  }, [checkout]);

  return (
    <div className="posture-app">
      <div className="ambient-orb ambient-orb--top" aria-hidden="true" />
      <div className="ambient-orb ambient-orb--bottom" aria-hidden="true" />
      <main className="coach-layout">
        <header className="topbar">
          <div className="wordmark">
            <img className="wordmark-logo" src={brandLogoImage} alt="" aria-hidden="true" />
            <span>COACH / POSTURA</span>
          </div>
          <UserMenu />
        </header>
        <div className="coach-stage">
          <section className="glass-panel welcome-panel account-panel" aria-labelledby="plan-title">
            <div className="panel-kicker">
              <span className="kicker-line" aria-hidden="true" />
              <span>Acceso anual</span>
              <span className="kicker-line" aria-hidden="true" />
            </div>
            <div className="account-mark account-mark--paid" aria-hidden="true">
              <CheckCircle2 size={22} strokeWidth={1.8} />
            </div>
            <h1 id="plan-title" className="welcome-title">Activa tu coach.</h1>
            <p className="welcome-subtitle">
              Hola{user?.firstName ? `, ${user.firstName}` : ''}. Tu cuenta ya está lista.
              Activa el plan anual por <strong>US$2</strong> para abrir las sesiones de postura.
            </p>
            <button
              type="button"
              className="primary-action"
              onClick={() => void openCheckout()}
              disabled={checkout.isPending}
            >
              {checkout.isPending ? 'Abriendo checkout…' : 'Activar plan anual · US$2'}
              {!checkout.isPending && <ArrowRight size={17} aria-hidden="true" />}
            </button>
            {checkoutError && <p className="billing-error" role="alert">{checkoutError}</p>}
            <p className="privacy-note">
              <ShieldCheck size={14} strokeWidth={1.8} aria-hidden="true" />
              <span>Pago seguro procesado por Lemon Squeezy</span>
            </p>
          </section>
        </div>
        <p className="app-footer">Tu acceso se activa cuando Lemon Squeezy confirma el pago</p>
      </main>
    </div>
  );
}

function PaymentReturnPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const [, setLocation] = useLocation();
  const [timedOut, setTimedOut] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const billing = useGetBillingStatus({
    query: {
      enabled: isLoaded && Boolean(isSignedIn),
      queryKey: getGetBillingStatusQueryKey(),
      refetchInterval: timedOut ? false : 2_000,
      retry: false,
    },
  });

  useEffect(() => {
    if (billing.data?.isActive) {
      setConfirmed(true);
    }
  }, [billing.data?.isActive]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setTimedOut(true), 30_000);
    return () => window.clearTimeout(timeout);
  }, []);

  if (!isLoaded) {
    return <AuthLoadingState label="Preparando tu cuenta…" />;
  }

  if (!isSignedIn) {
    return <PublicWelcome />;
  }

  if (confirmed && billing.data?.isActive) {
    return (
      <div className="posture-app">
        <div className="ambient-orb ambient-orb--top" aria-hidden="true" />
        <div className="ambient-orb ambient-orb--bottom" aria-hidden="true" />
        <main className="coach-layout">
          <header className="topbar">
            <div className="wordmark">
              <img className="wordmark-logo" src={brandLogoImage} alt="" aria-hidden="true" />
              <span>COACH / POSTURA</span>
            </div>
            <UserMenu />
          </header>
          <div className="coach-stage">
            <section className="glass-panel welcome-panel payment-return-panel" aria-labelledby="payment-confirmed-title">
              <div className="account-mark account-mark--paid" aria-hidden="true">
                <CheckCircle2 size={22} strokeWidth={1.8} />
              </div>
              <h1 id="payment-confirmed-title" className="welcome-title">Pago confirmado.</h1>
              <p className="welcome-subtitle">
                Tu plan está activo para esta cuenta de Clerk. Ya puedes abrir tu coach de postura.
              </p>
              <div className="account-actions">
                <button
                  type="button"
                  className="primary-action"
                  onClick={() => setLocation('/')}
                >
                  Entrar al coach
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
                {billing.data.receiptUrl && (
                  <a
                    className="secondary-action"
                    href={billing.data.receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver comprobante
                  </a>
                )}
              </div>
              <p className="privacy-note">
                <ShieldCheck size={14} strokeWidth={1.8} aria-hidden="true" />
                <span>La confirmación fue validada por Lemon Squeezy</span>
              </p>
            </section>
          </div>
          <p className="app-footer">Acceso protegido · Lemon Squeezy · Clerk</p>
        </main>
      </div>
    );
  }

  return (
    <div className="posture-app">
      <div className="ambient-orb ambient-orb--top" aria-hidden="true" />
      <div className="ambient-orb ambient-orb--bottom" aria-hidden="true" />
      <main className="coach-layout">
        <header className="topbar">
          <div className="wordmark">
              <img className="wordmark-logo" src={brandLogoImage} alt="" aria-hidden="true" />
            <span>COACH / POSTURA</span>
          </div>
          <UserMenu />
        </header>
        <div className="coach-stage">
          <section className="glass-panel welcome-panel payment-return-panel" aria-labelledby="payment-return-title">
            <div className="account-mark account-mark--paid" aria-hidden="true">
              <CheckCircle2 size={22} strokeWidth={1.8} />
            </div>
            <h1 id="payment-return-title" className="welcome-title">
              {timedOut ? 'Estamos tardando un poco más.' : 'Confirmando tu pago.'}
            </h1>
            <p className="welcome-subtitle">
              {timedOut
                ? 'El pago puede estar confirmado, pero todavía no recibimos el aviso de Lemon Squeezy.'
                : 'Lemon Squeezy está confirmando tu pago. Tu coach se abrirá automáticamente en cuanto recibamos la confirmación.'}
            </p>
            {!timedOut && (
              <div className="payment-checking" role="status" aria-live="polite">
                <span className="loading-mark" aria-hidden="true" />
                <span>Esperando confirmación segura…</span>
              </div>
            )}
            {timedOut && (
              <div className="account-actions">
                <button
                  type="button"
                  className="primary-action"
                  onClick={() => {
                    setTimedOut(false);
                    void billing.refetch();
                  }}
                >
                  Comprobar de nuevo
                </button>
                <button
                  type="button"
                  className="secondary-action"
                  onClick={() => setLocation('/')}
                >
                  Volver al plan
                </button>
              </div>
            )}
            <p className="privacy-note">
              <ShieldCheck size={14} strokeWidth={1.8} aria-hidden="true" />
              <span>No cierres esta ventana mientras confirmamos el acceso</span>
            </p>
          </section>
        </div>
        <p className="app-footer">Acceso protegido · Lemon Squeezy · Clerk</p>
      </main>
    </div>
  );
}

function UserMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [, setLocation] = useLocation();

  return (
    <div className="user-menu">
      <span>{user?.firstName || user?.primaryEmailAddress?.emailAddress || 'Cuenta'}</span>
      <button
        type="button"
        className="topbar-back"
        onClick={() => {
          void signOut().then(() => setLocation('/'));
        }}
      >
        Salir
      </button>
    </div>
  );
}

function BillingGate() {
  // Login y validación de suscripción se mantienen aquí para reactivarlos
  // después. En el modo temporal, Router renderiza Home directamente.
  const { isLoaded, isSignedIn } = useAuth();
  const billing = useGetBillingStatus({
    query: {
      enabled: isLoaded && Boolean(isSignedIn),
      queryKey: getGetBillingStatusQueryKey(),
      refetchInterval: 30_000,
      retry: false,
    },
  });

  if (!isLoaded) {
    return <AuthLoadingState label="Preparando tu cuenta…" />;
  }
  if (!isSignedIn) {
    return <PublicWelcome />;
  }
  if (billing.isLoading) {
    return <AuthLoadingState label="Comprobando tu plan…" />;
  }
  if (billing.data?.isActive) {
    return <Home />;
  }
  return <SubscriptionRequired />;
}

function AuthLoadingState({ label }: { label: string }) {
  return (
    <div className="posture-app">
      <main className="coach-layout">
        <div className="coach-stage">
          <section className="glass-panel welcome-panel auth-loading" role="status">
            <span className="loading-mark" aria-hidden="true" />
            <p>{label}</p>
          </section>
        </div>
      </main>
    </div>
  );
}

function SignInPage() {
  return (
    <div className="auth-page">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="auth-page">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
      />
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const previousUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (previousUserId.current !== undefined && previousUserId.current !== userId) {
        queryClient.clear();
      }
      previousUserId.current = userId;
    });
    return unsubscribe;
  }, [addListener]);

  return null;
}

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || '/'
    : path;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: 'Bienvenido de nuevo',
            subtitle: 'Entra para continuar con tu coach',
          },
        },
        signUp: {
          start: {
            title: 'Crea tu cuenta',
            subtitle: 'Activa tu espacio de postura',
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <ClerkQueryClientCacheInvalidator />
      <Switch>
        <Route path="/payment/success" component={PaymentReturnPage} />
        <Route path="/" component={BillingGate} />
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
        <Route component={NotFound} />
      </Switch>
    </ClerkProvider>
  );
}

function Router() {
  // Acceso temporal directo al coach: no elimina Clerk ni Lemon Squeezy.
  if (!AUTH_AND_BILLING_ENABLED) {
    return <Home />;
  }

  return (
    <RoutedErrorBoundary>
      <ClerkProviderWithRoutes />
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;