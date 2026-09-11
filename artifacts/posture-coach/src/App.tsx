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
import barbellRowImage from '@assets/ChatGPT_Image_10_sept_2026,_00_03_57_1789016813023.png';
import bicepsCurlImage from '@assets/ChatGPT_Image_10_sept_2026,_00_22_49_1789017858109.png';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
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
const SCRIPT_URLS = {
  tensorflow: 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js',
  poseDetection:
    'https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.1.3/dist/pose-detection.min.js',
};

const skeletonConnections: Array<[number, number]> = [
  [0, 1], [0, 2], [1, 3], [2, 4],
  [5, 6], [5, 7], [7, 9], [6, 8], [8, 10],
  [5, 11], [6, 12], [11, 12],
  [11, 13], [13, 15], [12, 14], [14, 16],
];

type ExerciseId = 'fondos' | 'dominadas' | 'dominadas-supinas' | 'jalon' | 'remo-barra' | 'flexiones' | 'flexiones-declinadas' | 'flexiones-pica' | 'press-militar' | 'triceps-polea-alta' | 'curl-biceps' | 'sentadillas' | 'zancadas' | 'zancada-banco' | 'plancha';
type ExerciseDefinition = {
  id: ExerciseId;
  name: string;
  description: string;
  angleLabel: string;
};
const exerciseImages: Record<ExerciseId, string> = {
  fondos: dipImage,
  dominadas: pullupImage,
  'dominadas-supinas': supinePullupImage,
  jalon: pulldownImage,
  flexiones: pushupImage,
  'flexiones-declinadas': declinePushupImage,
  'flexiones-pica': pikePushupImage,
  'press-militar': militaryPressImage,
  'triceps-polea-alta': tricepsPushdownImage,
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
type PosePoint = { x: number; y: number; score?: number };
type Pose = { keypoints?: PosePoint[] };
type PoseDetector = {
  estimatePoses: (video: HTMLVideoElement, options?: { flipHorizontal?: boolean }) => Promise<Pose[]>;
  dispose?: () => void;
};
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
};
type DominantSideResult = {
  side: PoseSide;
  average: number;
};
type VideoResolution = {
  width: number;
  height: number;
};

const exercises: ExerciseDefinition[] = [
  {
    id: 'fondos',
    name: 'Fondos en barra',
    description: 'Inclina el cuerpo y desciende hasta 90° de codo.',
    angleLabel: 'Codo · objetivo 90°',
  },
  {
    id: 'dominadas',
    name: 'Dominadas en barra',
    description: 'Lleva los codos hacia abajo y evita balancear el cuerpo.',
    angleLabel: 'Codo · tracción vertical',
  },
  {
    id: 'dominadas-supinas',
    name: 'Dominadas supinas',
    description: 'Sube con control, codos cerca del torso y hombros estables.',
    angleLabel: 'Codo · objetivo 90° · hombro 30–45°',
  },
  {
    id: 'jalon',
    name: 'Jalón al pecho en polea',
    description: 'Inclina el torso 15–20° y lleva los codos hacia abajo y adelante.',
    angleLabel: 'Torso 15–20° · codo 80–100°',
  },
  {
    id: 'remo-barra',
    name: 'Remo con barra',
    description: 'Inclina el torso 45–75° y lleva la barra hacia el cuerpo sin encorvarte.',
    angleLabel: 'Torso 45–75° · codo 70–115°',
  },
  {
    id: 'flexiones',
    name: 'Flexiones de pecho',
    description: 'Mantén los codos cerca del torso y el cuerpo en línea.',
    angleLabel: 'Codo · torso · objetivo 45°',
  },
  {
    id: 'flexiones-declinadas',
    name: 'Flexiones declinadas',
    description: 'Eleva los pies y mantén el cuerpo firme mientras bajas con control.',
    angleLabel: 'Codo 30–60° · cuerpo 162–180°',
  },
  {
    id: 'flexiones-pica',
    name: 'Flexiones en pica',
    description: 'Eleva la cadera y lleva la cabeza hacia el suelo con control.',
    angleLabel: 'Codo respecto al cuerpo · objetivo 45–60°',
  },
  {
    id: 'press-militar',
    name: 'Press militar con mancuernas',
    description: 'Usa un banco a 75–80° y empuja las mancuernas con codos a 45°.',
    angleLabel: 'Banco 75–80° · codos 45°',
  },
  {
    id: 'triceps-polea-alta',
    name: 'Extensiones de tríceps en polea alta',
    description: 'Mantén los codos fijos y extiende los brazos con control.',
    angleLabel: 'Codo · extensión controlada',
  },
  {
    id: 'curl-biceps',
    name: 'Curl de bíceps',
    description: 'Flexiona los codos sin mover los brazos ni balancear el torso.',
    angleLabel: 'Codo · objetivo 30–45°',
  },
  {
    id: 'sentadillas',
    name: 'Sentadillas',
    description: 'Mide la profundidad y el control de tus piernas.',
    angleLabel: 'Cadera · rodilla · tobillo',
  },
  {
    id: 'zancadas',
    name: 'Zancadas dinámicas',
    description: 'Baja con control hasta formar 90° en las piernas.',
    angleLabel: 'Rodilla delantera · objetivo 90°',
  },
  {
    id: 'zancada-banco',
    name: 'Zancada en banco',
    description: 'Eleva el pie trasero y controla la rodilla delantera.',
    angleLabel: 'Rodilla 80–100° · torso 15–20°',
  },
  {
    id: 'plancha',
    name: 'Plancha',
    description: 'Mantén la cadera alineada y el cuerpo recto.',
    angleLabel: 'Codo · objetivo 90°',
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
const PULLUP_BOTTOM_MIN_ANGLE = 165;
const PULLUP_BOTTOM_MAX_ANGLE = 180;
const PULLUP_NO_LOCKOUT_ANGLE = 160;
const PULLUP_SMOOTHING_SAMPLES = 5;
const SUPINE_PULLUP_TOP_MIN_ANGLE = 75;
const SUPINE_PULLUP_TOP_MAX_ANGLE = 105;
const SUPINE_PULLUP_SHOULDER_MIN_ANGLE = 30;
const SUPINE_PULLUP_SHOULDER_MAX_ANGLE = 45;
const DIP_VALID_MIN_ANGLE = 80;
const DIP_VALID_MAX_ANGLE = 100;
// La inclinación y la alineación corporal de fondos quedan desactivadas
// temporalmente: para este ejercicio basta con validar el ángulo del codo.
// const DIP_MIN_FORWARD_LEAN = 8;
const PLANK_MAX_HIP_SAG_RATIO = 0.08;
const PLANK_MAX_HIP_RAISE_RATIO = 0.08;
const PLANK_MIN_BODY_LINE_ANGLE = 162;
const PLANK_ARM_FLOOR_MIN_ANGLE = 80;
const PLANK_ARM_FLOOR_MAX_ANGLE = 100;
const PLANK_ELBOW_MIN_ANGLE = 80;
const PLANK_ELBOW_MAX_ANGLE = 100;
const PULLDOWN_TORSO_MIN_ANGLE = 15;
const PULLDOWN_TORSO_MAX_ANGLE = 20;
const PULLDOWN_TORSO_TOO_FAR_ANGLE = 30;
const PULLDOWN_ELBOW_MIN_ANGLE = 80;
const PULLDOWN_ELBOW_MAX_ANGLE = 100;
const ROW_TORSO_MIN_ANGLE = 45;
const ROW_TORSO_MAX_ANGLE = 75;
const ROW_KNEE_MIN_ANGLE = 150;
const ROW_KNEE_MAX_ANGLE = 180;
const ROW_ELBOW_TORSO_MIN_ANGLE = 20;
const ROW_ELBOW_TORSO_MAX_ANGLE = 60;
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

const repetitionConfigs: Partial<Record<ExerciseId, ExerciseRepConfig>> = {
  fondos: {
    direction: 'decrease',
    startMinAngle: 150,
    startMaxAngle: 180,
    activationAngle: 135,
    endMinAngle: 80,
    endMaxAngle: 100,
    endLabel: 'codo entre 80–100°',
  },
  jalon: {
    direction: 'decrease',
    startMinAngle: 150,
    startMaxAngle: 180,
    activationAngle: 135,
    endMinAngle: 80,
    endMaxAngle: 100,
    endLabel: 'codo entre 80–100°',
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
    endMinAngle: 70,
    endMaxAngle: 110,
    endLabel: 'codo entre 70–110°',
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
  'curl-biceps': {
    direction: 'decrease',
    startMinAngle: 145,
    startMaxAngle: 180,
    activationAngle: 135,
    endMinAngle: 30,
    endMaxAngle: 45,
    endLabel: 'flexión entre 30–45°',
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
    if (isAtStart) {
      nextTracker.phase = 'inicio';
    }
  }

  return { tracker: nextTracker, smoothedAngle, completedEndpointAngle };
}

function getRepetitionConfig(exercise: ExerciseId | null) {
  return exercise ? repetitionConfigs[exercise] ?? null : null;
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
  };
}

function median(values: number[]) {
  const sorted = [...values].sort((first, second) => first - second);
  return sorted[Math.floor(sorted.length / 2)] ?? null;
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
  topMinAngle: SUPINE_PULLUP_TOP_MIN_ANGLE,
  topMaxAngle: SUPINE_PULLUP_TOP_MAX_ANGLE,
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
  const hasReachedTop = smoothedAngle >= config.topMinAngle
    && smoothedAngle <= config.topMaxAngle
    && headOverWrists;
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

    if (hasReachedTop) {
      nextTracker.phase = 'arriba';
    } else if (isAtBottom) {
      nextTracker.phase = 'abajo';
      nextTracker.event = 'no-top';
      nextTracker.repetitions += 1;
      completedMinimumAngle = nextTracker.minimumAngle;
    }
  } else if (nextTracker.phase === 'arriba') {
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

type BrowserGlobals = Window & {
  poseDetection?: {
    SupportedModels: { MoveNet: unknown };
    movenet: { modelType: { SINGLEPOSE_LIGHTNING: unknown } };
    createDetector: (
      model: unknown,
      config: { modelType: unknown },
    ) => Promise<PoseDetector>;
  };
};

function loadScript(url: string, id: string) {
  const existing = document.getElementById(id) as HTMLScriptElement | null;
  if (existing?.dataset.loaded === 'true') return Promise.resolve();
  if (existing) existing.remove();

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.id = id;
    script.src = url;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = () => reject(new Error('No se pudo cargar el análisis de postura.'));
    document.head.appendChild(script);
  });
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
  left: { shoulder: 5, elbow: 7, wrist: 9, hip: 11, knee: 13, ankle: 15 },
  right: { shoulder: 6, elbow: 8, wrist: 10, hip: 12, knee: 14, ankle: 16 },
};

function getDominantSide(keypoints: PosePoint[] | undefined): DominantSideResult | null {
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
  const best = scores.sort((first, second) => second.average - first.average)[0];
  return best.count ? { side: best.side, average: best.average } : null;
}

function calculateAngle(
  first: PosePoint | undefined,
  vertex: PosePoint | undefined,
  last: PosePoint | undefined,
) {
  if (!first || !vertex || !last) return null;
  if ((first.score ?? 0) < 0.2 || (vertex.score ?? 0) < 0.2 || (last.score ?? 0) < 0.2) return null;

  const firstVector = {
    x: first.x - vertex.x,
    y: first.y - vertex.y,
  };
  const lastVector = {
    x: last.x - vertex.x,
    y: last.y - vertex.y,
  };
  const firstLength = Math.hypot(firstVector.x, firstVector.y);
  const lastLength = Math.hypot(lastVector.x, lastVector.y);
  if (!firstLength || !lastLength) return null;

  const cosine = Math.max(
    -1,
    Math.min(
      1,
      (firstVector.x * lastVector.x + firstVector.y * lastVector.y) / (firstLength * lastLength),
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
  const elbowTorsoAngle = calculateAngle(hip, shoulder, elbow);
  const bodyLineAngle = calculateAngle(shoulder, hip, ankle);
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

  const torsoLength = Math.hypot(shoulder.x - hip.x, shoulder.y - hip.y);
  const wristOffset = torsoLength > 0
    ? Math.abs(wrist.x - shoulder.x) / torsoLength
    : 1;
  const bodyLineDeviation = Math.abs(180 - bodyLineAngle);
  const elbowMinAngle = variant === 'declined' ? 30 : 25;
  const elbowMaxAngle = variant === 'declined' ? 60 : 65;

  if (elbowTorsoAngle > elbowMaxAngle) {
    return {
      tone: 'warning',
      message: 'Acerca los codos al torso',
      detail: `Están a ${elbowTorsoAngle}°. Busca aproximadamente 45° y desciende con control.`,
    };
  }
  if (elbowTorsoAngle < elbowMinAngle) {
    return {
      tone: 'danger',
      message: 'No cierres demasiado los codos',
      detail: `Están a ${elbowTorsoAngle}°. Sepáralos suavemente hasta formar unos 45° con el torso.`,
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

  const torsoLength = Math.hypot(shoulder.x - hip.x, shoulder.y - hip.y);
  const hipLiftRatio = torsoLength > 0 ? (shoulder.y - hip.y) / torsoLength : 0;
  const wristOffset = torsoLength > 0
    ? Math.abs(wrist.x - shoulder.x) / torsoLength
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
  if (!keypoints || !side) return defaultTechniqueFeedback;

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
    detail: `Codos a ${elbowTorsoAngle}° · plano escapular correcto. Mantén el banco entre 75° y 80° y empuja con control.`,
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

function getBicepsCurlTechniqueFeedback(
  keypoints: PosePoint[] | undefined,
  side: PoseSide | null,
): TechniqueFeedback {
  if (!keypoints || !side) return defaultTechniqueFeedback;

  const indexes = sideKeypoints[side];
  const shoulder = keypoints[indexes.shoulder];
  const elbow = keypoints[indexes.elbow];
  const wrist = keypoints[indexes.wrist];
  const hip = keypoints[indexes.hip];
  const elbowAngle = calculateAngle(shoulder, elbow, wrist);
  const upperArmFloorAngle = calculateAngleToFloor(shoulder, elbow);
  const torsoFloorAngle = calculateAngleToFloor(shoulder, hip);

  if (
    elbowAngle === null
    || upperArmFloorAngle === null
    || torsoFloorAngle === null
  ) {
    return defaultTechniqueFeedback;
  }

  if (torsoFloorAngle < 75 || torsoFloorAngle > 105) {
    return {
      tone: 'warning',
      message: 'Mantén el torso erguido',
      detail: `Tu torso está a ${torsoFloorAngle}° respecto al suelo. Evita inclinarte o balancearte para subir la mancuerna.`,
    };
  }
  if (upperArmFloorAngle < 70 || upperArmFloorAngle > 110) {
    return {
      tone: 'warning',
      message: 'Mantén el brazo quieto',
      detail: `La parte superior del brazo está a ${upperArmFloorAngle}° respecto al suelo. Deja el codo cerca del torso y mueve solo el antebrazo.`,
    };
  }
  if (elbowAngle < 25) {
    return {
      tone: 'danger',
      message: 'No cierres demasiado el codo',
      detail: `El codo está a ${elbowAngle}°. Detén la subida entre 30° y 45° para mantener la tensión del bíceps.`,
    };
  }

  return {
    tone: 'success',
    message: 'Curl controlado',
    detail: `Codo ${elbowAngle}° · brazos estables. Sube hasta 30–45° y baja lentamente hasta extender sin bloquear.`,
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

  const shinLength = Math.hypot(frontKnee.x - frontAnkle.x, frontKnee.y - frontAnkle.y);
  const kneeAnkleOffset = shinLength > 0
    ? Math.abs(frontKnee.x - frontAnkle.x) / shinLength
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

  const horizontalDistance = Math.abs(shoulder.x - hip.x);
  const verticalDistance = Math.abs(shoulder.y - hip.y);
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

  if (elbowAngle === null) {
    return defaultTechniqueFeedback;
  }

  if (elbowAngle > DIP_VALID_MAX_ANGLE) {
    return {
      tone: 'warning',
      message: 'Desciende hasta 90°',
      detail: `Tu codo está a ${elbowAngle}°. Baja de forma controlada hasta el rango 80–100°.`,
    };
  }
  if (elbowAngle < DIP_VALID_MIN_ANGLE) {
    return {
      tone: 'danger',
      message: 'No bajes demasiado',
      detail: `Tu codo está a ${elbowAngle}°. Sube un poco; el objetivo es aproximadamente 90°.`,
    };
  }

  return {
    tone: 'success',
    message: 'Fondo correcto',
    detail: `Codo a ${elbowAngle}°. La profundidad está dentro del rango correcto.`,
  };
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
    detail: `Codo a ${elbowAngle}° y cabeza por encima de las muñecas.`,
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
  const hip = keypoints[indexes.hip];
  const ankle = keypoints[indexes.ankle];
  const elbowAngle = calculateAngle(shoulder, elbow, wrist);
  const shoulderAbductionAngle = calculateAngle(hip, shoulder, elbow);
  const bodyLineAngle = calculateAngle(shoulder, hip, ankle);

  if (
    elbowAngle === null
    || shoulderAbductionAngle === null
    || bodyLineAngle === null
    || !shoulder
    || !wrist
  ) {
    return defaultTechniqueFeedback;
  }

  const bodyLineDeviation = Math.abs(180 - bodyLineAngle);
  const wristsAboveShoulders = wrist.y < shoulder.y;

  if (!wristsAboveShoulders) {
    return {
      tone: 'warning',
      message: 'Mantén las manos sobre la cabeza',
      detail: 'Colócate debajo de la barra y conserva las muñecas por encima de los hombros.',
    };
  }
  if (bodyLineDeviation > 25) {
    return {
      tone: 'warning',
      message: 'Evita balancearte',
      detail: 'Contrae el abdomen y mantén cabeza, espalda, cadera y piernas controladas.',
    };
  }
  if (shoulderAbductionAngle > SUPINE_PULLUP_SHOULDER_MAX_ANGLE) {
    return {
      tone: 'warning',
      message: 'Acerca los codos al torso',
      detail: `La abducción del hombro es de ${shoulderAbductionAngle}°. Busca entre 30° y 45° respecto al torso.`,
    };
  }
  if (shoulderAbductionAngle < SUPINE_PULLUP_SHOULDER_MIN_ANGLE) {
    return {
      tone: 'warning',
      message: 'No cierres demasiado los codos',
      detail: `La abducción del hombro es de ${shoulderAbductionAngle}°. Abre ligeramente hasta 30°–45°.`,
    };
  }
  if (elbowAngle > SUPINE_PULLUP_TOP_MAX_ANGLE) {
    return {
      tone: 'checking',
      message: 'Sigue subiendo',
      detail: `Tu codo está a ${elbowAngle}°. Acércate a 90° al final de la subida.`,
    };
  }
  if (elbowAngle < SUPINE_PULLUP_TOP_MIN_ANGLE) {
    return {
      tone: 'warning',
      message: 'No cierres demasiado el codo',
      detail: `Tu codo está a ${elbowAngle}°. El objetivo al final de la subida es aproximadamente 90°.`,
    };
  }

  return {
    tone: 'success',
    message: 'Dominada supina correcta',
    detail: `Codo a ${elbowAngle}° · hombro ${shoulderAbductionAngle}°. Desciende con control y sin balancearte.`,
  };
}

function getLatPulldownTechniqueFeedback(
  keypoints: PosePoint[] | undefined,
  side: PoseSide | null,
): TechniqueFeedback {
  if (!keypoints || !side) return defaultTechniqueFeedback;

  const indexes = sideKeypoints[side];
  const shoulder = keypoints[indexes.shoulder];
  const elbow = keypoints[indexes.elbow];
  const wrist = keypoints[indexes.wrist];
  const hip = keypoints[indexes.hip];
  const elbowAngle = calculateAngle(shoulder, elbow, wrist);
  const torsoLean = calculateForwardLeanAngle(shoulder, hip);

  if (elbowAngle === null || torsoLean === null) return defaultTechniqueFeedback;

  if (torsoLean > PULLDOWN_TORSO_TOO_FAR_ANGLE) {
    return {
      tone: 'danger',
      message: 'No te inclines demasiado',
      detail: `Tu torso está a ${torsoLean}°. No superes 30° hacia atrás para evitar convertir el jalón en un remo.`,
    };
  }
  if (torsoLean < PULLDOWN_TORSO_MIN_ANGLE) {
    return {
      tone: 'warning',
      message: 'Inclina un poco el torso hacia atrás',
      detail: `La inclinación es de ${torsoLean}°. Busca entre 15° y 20° respecto a la vertical.`,
    };
  }
  if (torsoLean > PULLDOWN_TORSO_MAX_ANGLE) {
    return {
      tone: 'warning',
      message: 'Reduce un poco la inclinación',
      detail: `La inclinación es de ${torsoLean}°. Mantente entre 15° y 20° hacia atrás.`,
    };
  }
  if (elbowAngle > PULLDOWN_ELBOW_MAX_ANGLE) {
    return {
      tone: 'checking',
      message: 'Lleva los codos hacia abajo y adelante',
      detail: `Tu codo está a ${elbowAngle}°. Busca una flexión cercana a 90° y una trayectoria de 30–45° hacia delante.`,
    };
  }
  if (elbowAngle < PULLDOWN_ELBOW_MIN_ANGLE) {
    return {
      tone: 'warning',
      message: 'No cierres demasiado los codos',
      detail: `Tu codo está a ${elbowAngle}°. El final debe quedar cerca de 90°; lleva los codos hacia los bolsillos.`,
    };
  }

  return {
    tone: 'success',
    message: 'Jalón correcto',
    detail: `Torso ${torsoLean}° · codo ${elbowAngle}°. Pecho abierto, codos 30–45° hacia delante y regreso lento.`,
  };
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

  if (elbowAngle === null || elbowTorsoAngle === null || torsoLean === null) {
    return defaultTechniqueFeedback;
  }

  if (torsoLean < ROW_TORSO_MIN_ANGLE) {
    return {
      tone: 'warning',
      message: 'Inclina más el torso',
      detail: `Tu torso está a ${torsoLean}°. Busca una inclinación de 45°–75° respecto a la vertical.`,
    };
  }
  if (torsoLean > ROW_TORSO_MAX_ANGLE) {
    return {
      tone: 'danger',
      message: 'No bajes tanto el torso',
      detail: `Tu torso está a ${torsoLean}°. Mantén la espalda neutra y no te acerques a la horizontal.`,
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
      message: 'Acerca los codos al cuerpo',
      detail: `El codo está a ${elbowTorsoAngle}° respecto al torso. Llévalo cerca del cuerpo, entre 20° y 60°.`,
    };
  }
  if (elbowTorsoAngle < ROW_ELBOW_TORSO_MIN_ANGLE) {
    return {
      tone: 'warning',
      message: 'No cierres demasiado los codos',
      detail: `El codo está a ${elbowTorsoAngle}° respecto al torso. Sepáralo suavemente hasta 20°–60°.`,
    };
  }

  return {
    tone: 'success',
    message: 'Remo con barra correcto',
    detail: `Torso ${torsoLean}° · codo ${elbowAngle}°. Mantén la espalda neutra y lleva la barra hacia el cuerpo.`,
  };
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

  const bodyVector = {
    x: ankle.x - shoulder.x,
    y: ankle.y - shoulder.y,
  };
  const bodyLengthSquared = bodyVector.x ** 2 + bodyVector.y ** 2;
  if (!bodyLengthSquared) return null;

  const hipVector = {
    x: hip.x - shoulder.x,
    y: hip.y - shoulder.y,
  };
  const projection = (
    (hipVector.x * bodyVector.x + hipVector.y * bodyVector.y) / bodyLengthSquared
  );
  const expectedHipY = shoulder.y + projection * bodyVector.y;
  return (hip.y - expectedHipY) / Math.sqrt(bodyLengthSquared);
}

function calculateAngleToFloor(
  first: PosePoint | undefined,
  second: PosePoint | undefined,
) {
  if (!first || !second) return null;
  if ((first.score ?? 0) < 0.2 || (second.score ?? 0) < 0.2) return null;

  const horizontalDistance = Math.abs(first.x - second.x);
  const verticalDistance = Math.abs(first.y - second.y);
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
      return calculateAngle(keypoints[indexes.hip], keypoints[indexes.shoulder], keypoints[indexes.elbow]);
    }
    if (exercise === 'zancadas' || exercise === 'zancada-banco') {
      return calculateAngle(keypoints[indexes.hip], keypoints[indexes.knee], keypoints[indexes.ankle]);
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
    jalon: [
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
      { label: 'Muñeca', joint: 'wrist' },
    ],
    'remo-barra': [
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
      { label: 'Muñeca', joint: 'wrist' },
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

  return labels[exercise].map(({ label, joint }) => {
    const point = indexes && keypoints?.[indexes[joint]];
    return {
      label,
      x: point?.x ?? null,
      y: point?.y ?? null,
    };
  });
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
  const [dominantSide, setDominantSide] = useState<PoseSide | null>(null);
  const [sideConfidence, setSideConfidence] = useState<number | null>(null);
  const [sideSwitches, setSideSwitches] = useState(0);
  const [sideChangeNotice, setSideChangeNotice] = useState('Sin cambios');
  const [anglePoints, setAnglePoints] = useState<AngleDiagnosticPoint[]>([]);
  const [angleHistory, setAngleHistory] = useState<number[]>([]);
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
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);
  const [previewExercise, setPreviewExercise] = useState<ExerciseDefinition | null>(null);
  const errorCountRef = useRef(0);
  const fpsFramesRef = useRef(0);
  const previousSideRef = useRef<PoseSide | null>(null);
  const sideSwitchesRef = useRef(0);
  const angleDisplaySamplesRef = useRef<number[]>([]);
  const angleDisplayRef = useRef<number | null>(null);
  const lastAngleDisplayAtRef = useRef(0);
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
    if (detectorRef.current?.dispose) detectorRef.current.dispose();
    detectorRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    if (canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      context?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
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
      const poses = await detector.estimatePoses(video, { flipHorizontal: false });
      const pose = poses[0];
      const visiblePoints = pose?.keypoints?.filter((point) => (point.score ?? 0) >= 0.3).length ?? 0;
      const nextDominantSideResult = getDominantSide(pose?.keypoints);
      const nextDominantSide = nextDominantSideResult?.side ?? null;
      const selectedExerciseForFrame = selectedExerciseRef.current ?? 'fondos';
      const rawAngle = selectedExerciseForFrame === 'sentadillas'
        ? calculateSquatAngle(pose?.keypoints)
        : calculateExerciseAngle(
          selectedExerciseForFrame,
          pose?.keypoints,
          nextDominantSide,
        );
      const repetitionConfig = getRepetitionConfig(selectedExerciseForFrame);
      const repetitionAngle = repetitionConfig
        ? calculateRepetitionAngle(
          selectedExerciseForFrame,
          pose?.keypoints,
          nextDominantSide,
        )
        : null;
      let nextAngle = rawAngle;
      if (
        exerciseStartedRef.current
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
              ? `Codo final ${pullupUpdate.completedMinimumAngle}° dentro de 75–105° · extensión inicial entre 165–180° · barbilla sobre la barra.`
              : `Extensión de codos entre 165–180° · cabeza por encima de las muñecas.`,
          });
        } else if (pullupUpdate.tracker.event === 'no-top') {
          setPullupFeedback({
            tone: 'warning',
            message: 'No rep · subida incompleta',
            detail: isSupinePullup
              ? `Solo llegaste a ${pullupUpdate.completedMinimumAngle}°. Sube hasta 75–105° y pasa la barbilla sobre la barra.`
              : 'Sube hasta pasar la cabeza por encima de las muñecas.',
          });
        } else if (pullupUpdate.tracker.event === 'no-lockout') {
          setPullupFeedback({
            tone: 'warning',
            message: 'No rep · falta extensión',
            detail: `Volviste a subir con ${pullupUpdate.smoothedAngle}°. Extiende primero los brazos entre 165–180°.`,
          });
        } else {
          setPullupFeedback(
            isSupinePullup
              ? getSupinePullupTechniqueFeedback(pose?.keypoints, nextDominantSide)
              : getPullupTechniqueFeedback(pose?.keypoints, nextDominantSide),
          );
        }
      }
      if (exerciseStartedRef.current && repetitionConfig && repetitionAngle !== null) {
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
      }
      let displayAngle = nextAngle;
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
      setDominantSide(nextDominantSide);
      setSideConfidence(nextDominantSideResult?.average ?? null);
      setAngle(displayAngle);
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
        selectMostConfident(pose?.keypoints, 'Hombro', 5, 6),
        selectMostConfident(pose?.keypoints, 'Cadera', 11, 12),
        selectMostConfident(pose?.keypoints, 'Rodilla', 13, 14),
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
      }
    }

    if (activeRef.current) {
      animationFrameRef.current = requestAnimationFrame(() => void processFrame());
    }
  }, [incrementErrorCount]);

  const loadDetector = useCallback(async () => {
    await loadScript(SCRIPT_URLS.tensorflow, 'posture-tfjs');
    await loadScript(SCRIPT_URLS.poseDetection, 'posture-pose-detection');
    const browser = window as BrowserGlobals;
    if (!browser.poseDetection) throw new Error('El análisis no está disponible.');
    return browser.poseDetection.createDetector(
      browser.poseDetection.SupportedModels.MoveNet,
      { modelType: browser.poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING },
    );
  }, []);

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
    stopResources();
    setPoseDetected(false);
    setErrorMessage('');
    setModelStatus('Cargando modelo...');
    setVideoResolution({ width: 0, height: 0 });
    setFps(0);
    fpsFramesRef.current = 0;
    setConfidencePoints([
      { label: 'Hombro', score: null, side: '—' },
      { label: 'Cadera', score: null, side: '—' },
      { label: 'Rodilla', score: null, side: '—' },
    ]);
    errorCountRef.current = 0;
    setErrorCount(0);
    setAngle(null);
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
    setPhase('requesting');

    try {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('La cámara necesita una conexión segura y compatible con el navegador.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: cameraFacingModeRef.current,
          width: { ideal: 1280 },
          height: { ideal: 1280 },
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
      setModelStatus('Modelo cargado ✓');
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

  const beginExercise = useCallback(() => {
    if (phase !== 'tracking' || exerciseStartedRef.current) return;
    exerciseStartedRef.current = true;
    setExerciseStarted(true);
    setSquatFeedback(defaultSquatFeedback);
    setPullupFeedback(defaultTechniqueFeedback);
    setTechniqueFeedback(defaultTechniqueFeedback);
  }, [phase]);

  const returnToWelcome = useCallback(() => {
    stopResources();
    selectedExerciseRef.current = null;
    setSelectedExercise(null);
    exerciseStartedRef.current = false;
    setExerciseStarted(false);
    setPoseDetected(false);
    setErrorMessage('');
    setAngle(null);
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
  const statusMessage = phase !== 'tracking'
    ? 'Preparando el análisis...'
    : !exerciseStarted
      ? 'Colócate en posición y pulsa Iniciar ejercicio'
      : poseDetected
        ? 'Cuerpo detectado ✓'
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
  const angleHistoryLabel = angleHistory.length
    ? angleHistory.map((value) => `${value}°`).join(' · ')
    : '—';
  const angleFeedback = selectedExercise === 'sentadillas'
    ? squatFeedback
    : selectedExercise === 'dominadas' || selectedExercise === 'dominadas-supinas'
      ? pullupFeedback
      : techniqueFeedback;
  const angleIsGood = exerciseStarted && angleFeedback.tone === 'success';
  const diagnosisStatus = !exerciseStarted
    ? 'LISTO PARA INICIAR'
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
              <span className="wordmark-mark" aria-hidden="true" />
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
                    || exercise.id === 'jalon'
                    || exercise.id === 'remo-barra'
                    || exercise.id === 'flexiones'
                    || exercise.id === 'flexiones-declinadas'
                    || exercise.id === 'flexiones-pica'
                    || exercise.id === 'press-militar'
                    || exercise.id === 'triceps-polea-alta'
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
                        </span>
                        <ArrowRight className="exercise-card-arrow" size={17} strokeWidth={1.8} aria-hidden="true" />
                      </button>
                    </div>
                  );
                })}
              </div>
              <p className="privacy-note">
                <ShieldCheck size={14} strokeWidth={1.8} aria-hidden="true" />
                <span>La imagen se procesa solo en tu dispositivo.</span>
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
                      {selectedExercise === 'flexiones'
                        || selectedExercise === 'flexiones-declinadas'
                        || selectedExercise === 'flexiones-pica'
                        || selectedExercise === 'press-militar'
                        || selectedExercise === 'triceps-polea-alta'
                        || selectedExercise === 'curl-biceps'
                        || selectedExercise === 'fondos'
                        || selectedExercise === 'dominadas'
                        || selectedExercise === 'dominadas-supinas'
                        || selectedExercise === 'jalon'
                        || selectedExercise === 'remo-barra'
                        || selectedExercise === 'zancadas'
                        || selectedExercise === 'zancada-banco'
                        || selectedExercise === 'plancha'
                        ? 'Vista lateral recomendada'
                        : 'Vista frontal'}
                      {' · '}
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
              <div className={`exercise-start-bar ${exerciseStarted ? 'is-started' : ''}`}>
                <div className="exercise-start-copy">
                  <strong>
                    {exerciseStarted
                      ? 'Ejercicio iniciado'
                      : poseDetected
                        ? '¿Ya estás listo?'
                        : 'Buscando tu cuerpo...'}
                  </strong>
                  <span>
                    {exerciseStarted
                      ? 'El contador está activo y evaluando tus repeticiones.'
                      : poseDetected
                        ? 'Colócate en posición y comienza cuando quieras.'
                        : 'Mantente dentro del encuadre para habilitar el inicio.'}
                  </span>
                </div>
                <button
                  type="button"
                  className="exercise-start-button"
                  disabled={phase !== 'tracking' || !poseDetected || exerciseStarted}
                  onClick={beginExercise}
                >
                  {exerciseStarted ? 'En curso' : poseDetected ? 'Iniciar ejercicio' : 'Esperando detección'}
                </button>
              </div>
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
                  <div className="squat-summary-stat">
                    <span>Fase</span>
                    <strong>{squatPhaseLabel}</strong>
                  </div>
                  <div className="squat-summary-stat">
                    <span>Último mínimo</span>
                    <strong>{squatMinimumAngle === null ? '—' : `${squatMinimumAngle}°`}</strong>
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
                  <div className="squat-summary-stat">
                    <span>Fase</span>
                    <strong>{pullupPhaseLabel}</strong>
                  </div>
                  <div className="squat-summary-stat">
                    <span>Ángulo mínimo</span>
                    <strong>{pullupMinimumAngle === null ? '—' : `${pullupMinimumAngle}°`}</strong>
                  </div>
                  <p>
                    {selectedExercise === 'dominadas-supinas'
                      ? 'Inicio 165–180° · final 75–105° (objetivo 90°) · hombro 30–45° · barbilla sobre la barra.'
                       : 'Extensión de codos 165–180° · cabeza por encima de las muñecas.'}
                  </p>
                </div>
              )}
              {selectedExercise === 'dominadas' && (
                <details className="pulldown-instructions">
                  <summary>Qué debe cumplir tu dominada</summary>
                  <ul>
                    <li><b>Extensión:</b> inicia y termina con los codos bien extendidos, entre 165° y 180°.</li>
                    <li><b>Altura:</b> sube hasta que la cabeza pase por encima de las muñecas.</li>
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
                  <div className="squat-summary-stat">
                    <span>Fase</span>
                    <strong>{exerciseRepPhaseLabel}</strong>
                  </div>
                  <div className="squat-summary-stat">
                    <span>Ángulo final</span>
                    <strong>{exerciseMinimumAngle === null ? '—' : `${exerciseMinimumAngle}°`}</strong>
                  </div>
                  <p>
                    Solo cuenta cuando completas el recorrido y llegas al rango de {getRepetitionConfig(selectedExercise)?.endLabel}.
                  </p>
                </div>
              )}
              {selectedExercise === 'jalon' && (
                <details className="pulldown-instructions">
                  <summary>Cómo hacerlo</summary>
                  <ul>
                    <li><b>Torso:</b> inclínalo hacia atrás entre 15° y 20°; no superes 30°.</li>
                    <li><b>Agarre:</b> brazos a 75°–80° respecto al torso y manos a aproximadamente 1,5 veces el ancho de tus hombros.</li>
                    <li><b>Codos:</b> bájalos 30°–45° hacia delante y termina cerca de 90°, como si quisieras llevarlos hacia los bolsillos.</li>
                  </ul>
                </details>
              )}
              {selectedExercise === 'remo-barra' && (
                <details className="pulldown-instructions">
                  <summary>Cómo hacerlo</summary>
                  <ul>
                    <li><b>Torso:</b> inclínalo hacia delante entre 45° y 75° respecto a la vertical, con la espalda neutra y la cadera atrás.</li>
                    <li><b>Rodillas:</b> mantenlas ligeramente flexionadas, aproximadamente entre 150° y 180°; no las bloquees.</li>
                    <li><b>Codos:</b> llévalos cerca del cuerpo, entre 20° y 60° respecto al torso, sin abrirlos formando una “T”.</li>
                    <li><b>Movimiento:</b> lleva la barra hacia el cuerpo con control y regresa lentamente sin perder la postura.</li>
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
                    <li><b>Inclinación del banco:</b> ajústalo entre 75° y 80°. Evita dejarlo completamente vertical a 90°; una ligera inclinación ayuda a mantener la curvatura natural de la columna y reduce la presión lumbar.</li>
                    <li><b>Posición inicial:</b> apoya la espalda en el banco y coloca las mancuernas a la altura de los hombros antes de iniciar el empuje.</li>
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
              {selectedExercise === 'curl-biceps' && (
                <details className="pulldown-instructions">
                  <summary>Cómo hacerlo</summary>
                  <ul>
                    <li><b>Posición inicial:</b> ponte de pie con la espalda recta, los pies al ancho de los hombros y las rodillas ligeramente flexionadas.</li>
                    <li><b>Brazos:</b> mantén los brazos junto al torso, con los codos debajo de los hombros y los antebrazos apuntando hacia el suelo al comenzar.</li>
                    <li><b>Agarre:</b> sujeta las mancuernas con agarre neutro y conserva las palmas enfrentadas durante todo el recorrido.</li>
                    <li><b>Subida:</b> flexiona los codos sin llevarlos hacia delante ni hacia atrás; llega a un ángulo de 30°–45° sin tocar los hombros.</li>
                    <li><b>Bajada:</b> desciende lentamente hasta extender los brazos entre 145° y 180°, sin bloquear bruscamente los codos ni balancear el torso.</li>
                  </ul>
                </details>
              )}
              {selectedExercise === 'dominadas-supinas' && (
                <details className="pulldown-instructions">
                  <summary>Cómo hacerlo</summary>
                  <ul>
                    <li><b>Codo:</b> termina la subida cerca de 90° y desciende hasta extender los brazos entre 165° y 180°.</li>
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
              <div className="video-stage" style={{ aspectRatio: videoRatio }}>
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
                      || selectedExercise === 'curl-biceps'
                      || selectedExercise === 'fondos'
                      || selectedExercise === 'dominadas'
                      || selectedExercise === 'dominadas-supinas'
                      || selectedExercise === 'zancadas'
                      || selectedExercise === 'zancada-banco'
                      || selectedExercise === 'jalon'
                      || selectedExercise === 'remo-barra'
                      || selectedExercise === 'plancha'
                      ? 'lateral'
                      : 'frontal'
                  }`}
                />
                <canvas ref={canvasRef} aria-hidden="true" />
                <div className="video-vignette" aria-hidden="true" />
                <span className="stage-corner stage-corner--tl" aria-hidden="true" />
                <span className="stage-corner stage-corner--tr" aria-hidden="true" />
                <span className="stage-corner stage-corner--bl" aria-hidden="true" />
                <span className="stage-corner stage-corner--br" aria-hidden="true" />
                  <div className="angle-hud" aria-live="polite">
                    <span className="angle-hud-label">Ángulo</span>
                    <strong>{angle === null ? '—' : `${angle}°`}</strong>
                    <small>{activeExercise?.angleLabel ?? 'Esperando puntos'}</small>
                    {angleIsGood && angle !== null && (
                      <span className="angle-hud-status">¡Lo estás haciendo bien!</span>
                    )}
                  </div>
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
                className={`status-surface ${poseDetected ? 'is-detected' : 'is-searching'}`}
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
                className={`simple-diagnosis simple-diagnosis--${angleFeedback.tone}`}
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
                {diagnosisStatus === 'AJUSTAR' && angle !== null && (
                  <p>{angleFeedback.message}</p>
                )}
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
                      <div className="diagnostic-row">
                        <dt>Ángulo final</dt>
                        <dd className="diagnostic-value">
                          {exerciseMinimumAngle === null ? '—' : `${exerciseMinimumAngle}°`}
                        </dd>
                      </div>
                      <div className="diagnostic-row">
                        <dt>Fase</dt>
                        <dd className="diagnostic-value">{exerciseRepPhaseLabel}</dd>
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
                    <dt>Puntos ángulo</dt>
                    <dd className="diagnostic-angle-points">
                      {anglePoints.length
                        ? anglePoints.map((point) => (
                          <span key={point.label}>
                            {point.label} ({formatCoordinate(point.x)}, {formatCoordinate(point.y)})
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
                    <dd className={`diagnostic-value ${poseDetected ? 'diagnostic-value--success' : ''}`}>
                      {poseDetected ? 'Cuerpo detectado ✓' : 'Sin detección'}
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
            <span className="wordmark-mark" aria-hidden="true" />
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
            <span className="wordmark-mark" aria-hidden="true" />
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
              <span className="wordmark-mark" aria-hidden="true" />
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
            <span className="wordmark-mark" aria-hidden="true" />
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