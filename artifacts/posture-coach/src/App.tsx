import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
import squatImage from '@assets/ChatGPT_Image_8_sept_2026__23_03_29-removebg-preview_1788926641237.png';
import lungeImage from '@assets/ChatGPT_Image_9_sept_2026,_12_28_52_a.m._1788931785734.png';
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

type ExerciseId = 'fondos' | 'dominadas' | 'dominadas-supinas' | 'jalon' | 'flexiones' | 'flexiones-pica' | 'sentadillas' | 'zancadas' | 'plancha';
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
  'flexiones-pica': pikePushupImage,
  sentadillas: squatImage,
  zancadas: lungeImage,
  plancha: plankImage,
};
type PoseSide = 'left' | 'right';
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
type SquatPhase = 'arriba' | 'bajando' | 'abajo';
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
    id: 'flexiones',
    name: 'Flexiones de pecho',
    description: 'Mantén los codos cerca del torso y el cuerpo en línea.',
    angleLabel: 'Codo · torso · objetivo 45°',
  },
  {
    id: 'flexiones-pica',
    name: 'Flexiones en pica',
    description: 'Eleva la cadera y lleva la cabeza hacia el suelo con control.',
    angleLabel: 'Codo respecto al cuerpo · objetivo 45–60°',
  },
  {
    id: 'sentadillas',
    name: 'Sentadillas',
    description: 'Mide la profundidad y el control de tus piernas.',
    angleLabel: 'Cadera · rodilla · tobillo',
  },
  {
    id: 'zancadas',
    name: 'Zancadas dinámicas o búlgaras',
    description: 'Trabaja cada pierna con control, equilibrio y estabilidad.',
    angleLabel: 'Rodilla · cadera · tobillo',
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
const SQUAT_MEANINGFUL_DESCENT = 22;
const SQUAT_SMOOTHING_SAMPLES = 5;
const ANGLE_DISPLAY_SAMPLES = 7;
const ANGLE_DISPLAY_INTERVAL_MS = 220;
const PULLUP_BOTTOM_MIN_ANGLE = 175;
const PULLUP_BOTTOM_MAX_ANGLE = 180;
const PULLUP_NO_LOCKOUT_ANGLE = 170;
const PULLUP_TOP_MAX_ANGLE = 60;
const PULLUP_SMOOTHING_SAMPLES = 5;
const SUPINE_PULLUP_TOP_MIN_ANGLE = 75;
const SUPINE_PULLUP_TOP_MAX_ANGLE = 105;
const SUPINE_PULLUP_SHOULDER_MIN_ANGLE = 30;
const SUPINE_PULLUP_SHOULDER_MAX_ANGLE = 45;
const DIP_VALID_MIN_ANGLE = 80;
const DIP_VALID_MAX_ANGLE = 100;
const DIP_MIN_FORWARD_LEAN = 8;
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
const PIKE_ELBOW_BODY_MIN_ANGLE = 45;
const PIKE_ELBOW_BODY_MAX_ANGLE = 60;
const PIKE_WRIST_SHOULDER_MIN_ANGLE = 75;
const PIKE_WRIST_SHOULDER_MAX_ANGLE = 105;
const PIKE_MIN_HIP_LIFT_RATIO = 0.12;
const PIKE_MIN_BODY_FOLD_ANGLE = 45;
const PIKE_MAX_BODY_FOLD_ANGLE = 125;

function createSquatTracker(): SquatTracker {
  return {
    phase: 'arriba',
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
  topMaxAngle: PULLUP_TOP_MAX_ANGLE,
};

const SUPINE_PULLUP_TRACKER_CONFIG: PullupTrackerConfig = {
  topMinAngle: SUPINE_PULLUP_TOP_MIN_ANGLE,
  topMaxAngle: SUPINE_PULLUP_TOP_MAX_ANGLE,
};

function advancePullupTracker(
  tracker: PullupTracker,
  rawAngle: number,
  chinOverBar: boolean,
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
    && chinOverBar;
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

function drawSkeleton(canvas: HTMLCanvasElement, video: HTMLVideoElement, pose?: Pose) {
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
    context.beginPath();
    context.moveTo(width - first.x, first.y);
    context.lineTo(width - second.x, second.y);
    context.stroke();
  });

  context.shadowBlur = Math.max(3, width / 200);
  keypoints.forEach((point) => {
    if ((point.score ?? 0) < 0.3) return;
    context.beginPath();
    context.arc(width - point.x, point.y, Math.max(4, width / 115), 0, Math.PI * 2);
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

  if (elbowTorsoAngle > 65) {
    return {
      tone: 'warning',
      message: 'Acerca los codos al torso',
      detail: `Están a ${elbowTorsoAngle}°. Busca aproximadamente 45° y desciende con control.`,
    };
  }
  if (elbowTorsoAngle < 25) {
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
    message: 'Postura correcta',
    detail: `Codos a ${elbowTorsoAngle}°. Baja el pecho de forma controlada y extiende sin bloquear bruscamente.`,
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

function isChinOverBar(
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
  const hip = keypoints[indexes.hip];
  const ankle = keypoints[indexes.ankle];
  const elbowAngle = calculateAngle(shoulder, elbow, wrist);
  const bodyLineAngle = calculateAngle(shoulder, hip, ankle);
  const chinOverBar = isChinOverBar(keypoints, side);
  const forwardLeanAngle = calculateForwardLeanAngle(shoulder, hip);

  if (elbowAngle === null || bodyLineAngle === null || forwardLeanAngle === null) {
    return defaultTechniqueFeedback;
  }

  const bodyLineDeviation = Math.abs(180 - bodyLineAngle);

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
  if (forwardLeanAngle < DIP_MIN_FORWARD_LEAN) {
    return {
      tone: 'warning',
      message: 'Inclina el cuerpo hacia adelante',
      detail: `La inclinación detectada es de ${forwardLeanAngle}°. Lleva ligeramente el pecho hacia adelante.`,
    };
  }
  if (bodyLineDeviation > 18) {
    return {
      tone: 'danger',
      message: 'Mantén el cuerpo alineado',
      detail: 'Inclínate desde todo el cuerpo; evita arquear la espalda o doblarte desde la cadera.',
    };
  }

  return {
    tone: 'success',
    message: 'Fondo correcto',
    detail: `Codo a ${elbowAngle}° · inclinación ${forwardLeanAngle}°. Sube con control sin bloquear bruscamente.`,
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
  const hip = keypoints[indexes.hip];
  const ankle = keypoints[indexes.ankle];
  const elbowAngle = calculateAngle(shoulder, elbow, wrist);
  const bodyLineAngle = calculateAngle(shoulder, hip, ankle);

  if (elbowAngle === null || bodyLineAngle === null || !shoulder || !wrist) {
    return defaultTechniqueFeedback;
  }

  const bodyLineDeviation = Math.abs(180 - bodyLineAngle);
  const wristsAboveShoulders = wrist.y < shoulder.y;
  const chinOverBar = isChinOverBar(keypoints, side);

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
      detail: 'Contrae el abdomen y mantén el cuerpo controlado mientras subes y bajas.',
    };
  }
  if (elbowAngle >= PULLUP_BOTTOM_MIN_ANGLE) {
    return {
      tone: 'checking',
      message: 'Inicio válido',
      detail: `Brazo a ${elbowAngle}°. Desde aquí inicia la subida manteniendo el cuerpo controlado.`,
    };
  }
  if (elbowAngle > 100) {
    return {
      tone: 'checking',
      message: 'Lleva los codos hacia abajo',
      detail: `Tu codo está a ${elbowAngle}°. Tira de la barra con control y acerca el pecho.`,
    };
  }
  if (elbowAngle >= PULLUP_TOP_MAX_ANGLE) {
    return {
      tone: 'checking',
      message: 'Sigue subiendo',
      detail: `Tu codo está a ${elbowAngle}°. Busca menos de 60° y lleva la barbilla por encima de la barra.`,
    };
  }
  if (!chinOverBar) {
    return {
      tone: 'warning',
      message: 'Pasa la barbilla sobre la barra',
      detail: 'El ángulo ya es menor de 60°, pero la barbilla todavía no supera la altura de la barra.',
    };
  }

  return {
    tone: 'success',
    message: 'Dominada controlada',
    detail: `Codo a ${elbowAngle}°. Mantén el abdomen firme y desciende sin soltarte de golpe.`,
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
    || exercise === 'flexiones'
    || exercise === 'flexiones-pica'
    || exercise === 'zancadas'
  ) {
    if (exercise === 'flexiones') {
      return calculateAngle(keypoints[indexes.hip], keypoints[indexes.shoulder], keypoints[indexes.elbow]);
    }
    if (exercise === 'flexiones-pica') {
      return calculateAngle(keypoints[indexes.hip], keypoints[indexes.shoulder], keypoints[indexes.elbow]);
    }
    if (exercise === 'zancadas') {
      return calculateAngle(keypoints[indexes.hip], keypoints[indexes.knee], keypoints[indexes.ankle]);
    }
    return calculateAngle(keypoints[indexes.shoulder], keypoints[indexes.elbow], keypoints[indexes.wrist]);
  }
  if (exercise === 'sentadillas') {
    return calculateAngle(keypoints[indexes.hip], keypoints[indexes.knee], keypoints[indexes.ankle]);
  }
  return calculateAngle(keypoints[indexes.shoulder], keypoints[indexes.elbow], keypoints[indexes.wrist]);
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
    flexiones: [
      { label: 'Cadera', joint: 'hip' },
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
    ],
    'flexiones-pica': [
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
  const [phase, setPhase] = useState<SessionPhase>('exercise-select');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseId | null>(null);
  const selectedExerciseRef = useRef<ExerciseId | null>(null);
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
  const [squatPhase, setSquatPhase] = useState<SquatPhase>('arriba');
  const [squatMinimumAngle, setSquatMinimumAngle] = useState<number | null>(null);
  const [squatFeedback, setSquatFeedback] = useState<TechniqueFeedback>(defaultSquatFeedback);
  const [pullupRepetitions, setPullupRepetitions] = useState(0);
  const [pullupGoodRepetitions, setPullupGoodRepetitions] = useState(0);
  const [pullupPhase, setPullupPhase] = useState<PullupPhase>('esperando abajo');
  const [pullupMinimumAngle, setPullupMinimumAngle] = useState<number | null>(null);
  const [pullupFeedback, setPullupFeedback] = useState<TechniqueFeedback>(defaultTechniqueFeedback);
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
      let nextAngle = rawAngle;
      if (selectedExerciseRef.current === 'sentadillas' && rawAngle !== null) {
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
        && rawAngle !== null
      ) {
        const isSupinePullup = selectedExerciseRef.current === 'dominadas-supinas';
        const pullupUpdate = advancePullupTracker(
          pullupTrackerRef.current,
          rawAngle,
          isChinOverBar(pose?.keypoints, nextDominantSide),
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
              ? `Codo final ${pullupUpdate.completedMinimumAngle}° dentro de 75–105° · extensión inicial entre 175–180° · barbilla sobre la barra.`
              : `Ángulo mínimo ${pullupUpdate.completedMinimumAngle}° · extensión final entre 175–180° · barbilla sobre la barra.`,
          });
        } else if (pullupUpdate.tracker.event === 'no-top') {
          setPullupFeedback({
            tone: 'warning',
            message: 'No rep · subida incompleta',
            detail: isSupinePullup
              ? `Solo llegaste a ${pullupUpdate.completedMinimumAngle}°. Sube hasta 75–105° y pasa la barbilla sobre la barra.`
              : `Solo llegaste a ${pullupUpdate.completedMinimumAngle}°. Sube hasta menos de 60° y pasa la barbilla sobre la barra.`,
          });
        } else if (pullupUpdate.tracker.event === 'no-lockout') {
          setPullupFeedback({
            tone: 'warning',
            message: 'No rep · falta extensión',
            detail: `Volviste a subir con ${pullupUpdate.smoothedAngle}°. Extiende primero los brazos entre 175–180°.`,
          });
        } else {
          setPullupFeedback(
            isSupinePullup
              ? getSupinePullupTechniqueFeedback(pose?.keypoints, nextDominantSide)
              : getPullupTechniqueFeedback(pose?.keypoints, nextDominantSide),
          );
        }
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
          : selectedExerciseRef.current === 'flexiones-pica'
            ? getPikePushupTechniqueFeedback(pose?.keypoints, nextDominantSide)
          : selectedExerciseRef.current === 'fondos'
            ? getDipTechniqueFeedback(pose?.keypoints, nextDominantSide)
             : selectedExerciseRef.current === 'dominadas'
               ? getPullupTechniqueFeedback(pose?.keypoints, nextDominantSide)
               : selectedExerciseRef.current === 'dominadas-supinas'
                 ? getSupinePullupTechniqueFeedback(pose?.keypoints, nextDominantSide)
              : selectedExerciseRef.current === 'jalon'
                ? getLatPulldownTechniqueFeedback(pose?.keypoints, nextDominantSide)
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
      if (canvasRef.current) drawSkeleton(canvasRef.current, video, pose);
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

  const startCamera = useCallback(async (exerciseId?: ExerciseId) => {
    if (busyRef.current) return;
    busyRef.current = true;
    const activeExercise = exerciseId ?? selectedExerciseRef.current;
    if (!activeExercise) {
      busyRef.current = false;
      return;
    }
    selectedExerciseRef.current = activeExercise;
    setSelectedExercise(activeExercise);
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
    setSquatPhase('arriba');
    setSquatMinimumAngle(null);
    setSquatFeedback(defaultSquatFeedback);
    pullupTrackerRef.current = createPullupTracker();
    setPullupRepetitions(0);
    setPullupGoodRepetitions(0);
    setPullupPhase('esperando abajo');
    setPullupMinimumAngle(null);
    setPullupFeedback(defaultTechniqueFeedback);
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
          facingMode: 'user',
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

  const returnToWelcome = useCallback(() => {
    stopResources();
    selectedExerciseRef.current = null;
    setSelectedExercise(null);
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
    setSquatPhase('arriba');
    setSquatMinimumAngle(null);
    setSquatFeedback(defaultSquatFeedback);
    pullupTrackerRef.current = createPullupTracker();
    setPullupRepetitions(0);
    setPullupGoodRepetitions(0);
    setPullupPhase('esperando abajo');
    setPullupMinimumAngle(null);
    setPullupFeedback(defaultTechniqueFeedback);
    previousSideRef.current = null;
    sideSwitchesRef.current = 0;
    setPhase('exercise-select');
  }, [stopResources]);

  useEffect(() => () => stopResources(), [stopResources]);

  const isActive = phase === 'requesting' || phase === 'loading-model' || phase === 'tracking';
  const activeExercise = getExercise(selectedExercise);
  const statusMessage = poseDetected ? 'Cuerpo detectado ✓' : 'Buscando tu cuerpo...';
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
  const angleIsGood = angleFeedback.tone === 'success';
  const diagnosisStatus = angle === null
    ? 'ESPERANDO'
    : angleFeedback.tone === 'success'
      ? 'BIEN'
      : angleFeedback.tone === 'checking'
        ? 'EN PROCESO'
        : 'AJUSTAR';
  const formatCoordinate = (value: number | null) => value === null ? '—' : value.toFixed(1);
  const squatPhaseLabel = squatPhase === 'arriba'
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
          <div className="privacy-chip">
            <ShieldCheck size={13} strokeWidth={1.8} aria-hidden="true" />
            <span>Privado</span>
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
                    || exercise.id === 'flexiones'
                    || exercise.id === 'flexiones-pica'
                    ? Activity
                    : exercise.id === 'sentadillas' || exercise.id === 'zancadas'
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
                        || selectedExercise === 'flexiones-pica'
                        || selectedExercise === 'fondos'
                          || selectedExercise === 'dominadas'
                        || selectedExercise === 'dominadas-supinas'
                        || selectedExercise === 'jalon'
                        || selectedExercise === 'zancadas'
                        || selectedExercise === 'plancha'
                        ? 'Vista lateral recomendada'
                        : 'Vista frontal'}
                      {' · '}
                      {dominantSide === 'left' ? 'lado izquierdo' : dominantSide === 'right' ? 'lado derecho' : 'buscando lado'}
                    </span>
                  </div>
                </div>
                <ShieldCheck size={18} color={GREEN} strokeWidth={1.8} aria-label="Procesamiento privado" />
              </div>
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
                      ? 'Inicio 175–180° · final 75–105° (objetivo 90°) · hombro 30–45° · barbilla sobre la barra.'
                      : 'Inicio y final 175–180° · subida menor de 60° · barbilla sobre la barra.'}
                  </p>
                </div>
              )}
              {selectedExercise === 'jalon' && (
                <div className="pulldown-instructions" aria-label="Indicaciones del jalón al pecho">
                  <strong>Cómo hacerlo</strong>
                  <ul>
                    <li><b>Torso:</b> inclínalo hacia atrás entre 15° y 20°; no superes 30°.</li>
                    <li><b>Agarre:</b> brazos a 75°–80° respecto al torso y manos a aproximadamente 1,5 veces el ancho de tus hombros.</li>
                    <li><b>Codos:</b> bájalos 30°–45° hacia delante y termina cerca de 90°, como si quisieras llevarlos hacia los bolsillos.</li>
                  </ul>
                </div>
              )}
              {selectedExercise === 'flexiones-pica' && (
                <div className="pulldown-instructions" aria-label="Indicaciones de las flexiones en pica">
                  <strong>Cómo hacerlo</strong>
                  <ul>
                    <li><b>Codos:</b> mantenlos entre 45° y 60° respecto al cuerpo; evita abrirlos formando una “T”.</li>
                    <li><b>Muñecas y hombros:</b> coloca las manos debajo de los hombros, formando aproximadamente 90° con el suelo.</li>
                    <li><b>Cuerpo:</b> mantén cabeza, espalda, cadera y talones en una línea firme durante todo el movimiento.</li>
                  </ul>
                </div>
              )}
              {selectedExercise === 'dominadas-supinas' && (
                <div className="pulldown-instructions" aria-label="Indicaciones de las dominadas supinas">
                  <strong>Cómo hacerlo</strong>
                  <ul>
                    <li><b>Codo:</b> termina la subida cerca de 90° y desciende hasta extender los brazos entre 175° y 180°.</li>
                    <li><b>Hombro:</b> mantén los codos entre 30° y 45° de abducción respecto al torso.</li>
                    <li><b>Control:</b> pasa la barbilla sobre la barra sin balancearte y baja lentamente.</li>
                  </ul>
                </div>
              )}
              <div className="video-stage" style={{ aspectRatio: videoRatio }}>
                <video
                  ref={videoRef}
                  muted
                  autoPlay
                  playsInline
                  onLoadedMetadata={syncVideoSize}
                  data-testid="video-camera-preview"
                   aria-label={`Vista previa de la cámara ${
                       selectedExercise === 'flexiones'
                        || selectedExercise === 'flexiones-pica'
                       || selectedExercise === 'fondos'
                        || selectedExercise === 'dominadas'
                        || selectedExercise === 'dominadas-supinas'
                        || selectedExercise === 'zancadas'
                        || selectedExercise === 'jalon'
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

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
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