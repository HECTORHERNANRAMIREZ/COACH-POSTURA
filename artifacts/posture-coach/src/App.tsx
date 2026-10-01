import { type ChangeEvent, type ReactNode, type SyntheticEvent, useCallback, useEffect, useRef, useState } from 'react';
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
  ChevronDown,
  Copy,
  Download,
  Maximize2,
  ShieldCheck,
  Square,
  Upload,
} from 'lucide-react';
import dipImage from '@assets/ChatGPT_Image_8_sept_2026__23_00_34-removebg-preview_1788926457927.png';
import pullupImage from '@assets/ChatGPT_Image_8_sept_2026,_23_22_04_1788928280842.png';
import supinePullupImage from '@assets/ChatGPT_Image_9_sept_2026,_12_18_29_a.m._1788931453217.png';
import commandoPullupImage from '@assets/ChatGPT_Image_19_sept_2026,_00_11_59_1789794729985.png';
import muscleUpImage from '@assets/ChatGPT_Image_14_sept_2026,_13_48_26_1789411716868.png';
import pulldownImage from '@assets/ChatGPT_Image_8_sept_2026,_23_45_23_1788929140639.png';
import pullOverImage from '@assets/ChatGPT_Image_18_sept_2026,_23_33_58_1789792689595.png';
import plankImage from '@assets/ChatGPT_Image_8_sept_2026__23_06_57-removebg-preview_1788926983717.png';
import pushupImage from '@assets/Captura_de_pantalla_2026-09-08_225611-removebg-preview_1788926239892.png';
import pikePushupImage from '@assets/ChatGPT_Image_9_sept_2026,_00_01_49_1788930345371.png';
import declinePushupImage from '@assets/ChatGPT_Image_9_sept_2026,_02_57_19_p.m._1788984656423.png';
import hangingLegRaiseImage from '@assets/ChatGPT_Image_19_sept_2026,_05_40_50_p.m._1789857664163.png';
import squatImage from '@assets/ChatGPT_Image_8_sept_2026__23_03_29-removebg-preview_1788926641237.png';
import shoulderMachinePressImage from '@assets/ChatGPT_Image_18_sept_2026,_12_36_30_1789752998784.png';
import legPressImage from '@assets/ChatGPT_Image_17_sept_2026,_14_32_47_1789673578570.png';
import machineExtensionImage from '@assets/ChatGPT_Image_17_sept_2026,_14_46_27_1789674404855.png';
import lungeImage from '@assets/ChatGPT_Image_9_sept_2026,_12_28_52_a.m._1788931785734.png';
import benchLungeImage from '@assets/ChatGPT_Image_9_sept_2026,_12_39_15_a.m._1788983914611.png';
import reverseCrunchImage from '@assets/ChatGPT_Image_18_sept_2026,_21_17_57_1789784284541.png';
import abWheelImage from '@assets/ChatGPT_Image_18_sept_2026,_21_29_51_1789785046006.png';
import floorLegRaiseImage from '@assets/ChatGPT_Image_19_sept_2026,_05_53_59_p.m._1789858489259.png';
import barraRelojImage from '@assets/ChatGPT_Image_19_sept_2026,_06_12_46_p.m._1789859575950.png';
import pullupScrollFrame01 from '@assets/frame_01_1789864033453.png';
import pullupScrollFrame02 from '@assets/frame_02_1789864033454.png';
import pullupScrollFrame03 from '@assets/frame_03_1789864033454.png';
import pullupScrollFrame04 from '@assets/frame_04_1789864033455.png';
import pullupScrollFrame05 from '@assets/frame_05_1789864033455.png';
import pullupScrollFrame06 from '@assets/frame_06_1789864033456.png';
import pullupScrollFrame07 from '@assets/frame_07_1789864033456.png';
import pullupScrollFrame08 from '@assets/frame_08_1789864033457.png';
import pullupScrollFrame09 from '@assets/frame_09_1789864033457.png';
import pullupScrollFrame10 from '@assets/frame_10_1789864033458.png';
import pullupScrollFrame11 from '@assets/frame_11_1789864033458.png';
import pallofPressImage from '@assets/ChatGPT_Image_18_sept_2026,_21_47_36_1789786072344.png';
import russianTwistImage from '@assets/ChatGPT_Image_18_sept_2026,_21_56_46_1789786639535.png';
import militaryPressImage from '@assets/ChatGPT_Image_9_sept_2026,_03_26_39_p.m._1788985622495.png';
import lateralRaiseImage from '@assets/ChatGPT_Image_18_sept_2026,_09_25_46_a.m._1789741994699.png';
import lowCableLateralRaiseImage from '@assets/ChatGPT_Image_18_sept_2026,_11_52_57_1789750471669.png';
import rearDeltFlyImage from '@assets/ChatGPT_Image_18_sept_2026,_12_00_17_1789751148309.png';
import facePullImage from '@assets/ChatGPT_Image_18_sept_2026,_12_10_35_1789751458880.png';
import reverseMachineFlyImage from '@assets/ChatGPT_Image_18_sept_2026,_12_23_41_1789752227304.png';
import lowToHighCableCrossoverImage from '@assets/ChatGPT_Image_18_sept_2026,_12_58_09_1789754327739.png';
import benchPressImage from '@assets/ChatGPT_Image_16_sept_2026,_22_36_13_1789621905499.png';
import closeGripBenchPressImage from '@assets/ChatGPT_Image_18_sept_2026,_23_10_43_1789791055423.png';
import inclineBenchPressImage from '@assets/ChatGPT_Image_18_sept_2026,_12_52_44_1789753996627.png';
import dumbbellFlatPressImage from '@assets/ChatGPT_Image_18_sept_2026,_13_04_03_1789754734704.png';
import inclineDumbbellPressImage from '@assets/ChatGPT_Image_18_sept_2026,_13_06_02_1789754793034.png';
import tricepsPushdownImage from '@assets/ChatGPT_Image_9_sept_2026,_23_52_11_1789015949955.png';
import overheadTricepsExtensionImage from '@assets/ChatGPT_Image_18_sept_2026,_22_16_00_1789787891725.png';
import dumbbellOverheadTricepsImage from '@assets/ChatGPT_Image_18_sept_2026,_22_44_59_1789789522794.png';
import horizontalBarExtensionImage from '@assets/ChatGPT_Image_15_sept_2026,_02_35_29_a.m._1789457735768.png';
import barbellRowImage from '@assets/ChatGPT_Image_10_sept_2026,_00_03_57_1789016813023.png';
import seatedCableRowImage from '@assets/ChatGPT_Image_18_sept_2026,_23_44_28_1789793094889.png';
import oneArmDumbbellRowImage from '@assets/ChatGPT_Image_18_sept_2026,_23_50_29_1789793435423.png';
import elevatedAustralianRowImage from '@assets/ChatGPT_Image_19_sept_2026,_13_58_44_1789844332280.png';
import romanianDeadliftImage from '@assets/ChatGPT_Image_17_sept_2026,_03_03_39_p.m._1789675440943.png';
import stiffLegDeadliftImage from '@assets/ChatGPT_Image_20_sept_2026,_13_15_05_1789928277400.png';
import bicepsCurlImage from '@assets/ChatGPT_Image_10_sept_2026,_00_22_49_1789017858109.png';
import inclineDumbbellCurlImage from '@assets/ChatGPT_Image_19_sept_2026,_15_05_16_1789848409357.png';
import preacherCurlImage from '@assets/ChatGPT_Image_19_sept_2026,_15_11_16_1789848685122.png';
import spiderCurlImage from '@assets/ChatGPT_Image_19_sept_2026,_15_15_53_1789848964476.png';
import hammerCurlImage from '@assets/ChatGPT_Image_19_sept_2026,_15_44_32_1789850688324.png';
import reverseBarbellCurlImage from '@assets/ChatGPT_Image_19_sept_2026,_14_34_07_1789846459015.png';
import seatedWristCurlImage from '@assets/ChatGPT_Image_19_sept_2026,_14_39_55_1789846843665.png';
import wristRollerImage from '@assets/ChatGPT_Image_19_sept_2026,_14_54_13_1789847660575.png';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  POSE_LANDMARK_COUNT,
  POSE_MODEL_NAME,
  createPoseDetector,
  footConnections,
  skeletonConnections,
  type Pose,
  type PoseDetector,
  type PosePoint,
  type PoseVideoSource,
} from '@/pose3d';
import { createPoseWorkerDetector } from '@/pose3d-worker-client';
import {
  createBoneConstraintFilter,
  setDebugBoneConstraintsEnabled,
} from '@/bone-constraints';
import { createPoseFilter, MAX_HELD_FRAMES } from '@/pose-filters';
import {
  createSideConsistencyFilter,
  getSideSwapConfirmFrames,
  setDebugSideConsistencyEnabled,
} from '@/side-consistency';
import {
  DEBUG_BONE_HELD_COLOR,
  DEBUG_LIMB_INDICES,
  DEBUG_SWAPPED_OUTLINE_COLOR,
  LimbDebugSession,
  createEmptyDebugPanelSnapshot,
  drawLimbDebugOverlay,
  isLimbDebugTrackingEnabled,
  type DebugPanelSnapshot,
} from '@/debug-overlay';
import {
  VIEW_TOLERANCE_DEFAULT_DEG,
  VIEW_SEMIPROFILE_TOLERANCE_DEG,
  VIEW_BACK_ESTABLISH_SECONDS,
  VIEW_UI_UPDATE_MS,
  ViewAlignmentGuard,
  ViewEstimator,
  assessExerciseView,
  createInitialViewAlignment,
  createUnknownViewEstimate,
  getFrontBackDiagnostics,
  type CameraFacingMode,
  type ExerciseView,
  type ViewAlignmentState,
} from '@/view-estimation';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';
import type { ExerciseDiagnosticSnapshot } from '@/pullup-diagnostics';
import {
  drawVideoRecordingHud,
  EMPTY_VIDEO_RECORDING_HUD,
  type VideoRecordingHudState,
} from '@/video-recording-overlay';

const queryClient = new QueryClient();
const TOTAL_FRAMES = 11;
const REPETICIONES = 4;
const SCROLL_LERP = 0.15;
// El detector no debe intentar procesar cada cuadro del video subido: una
// inferencia síncrona por cuadro bloquea el hilo principal y ralentiza el
// elemento <video>. Este ritmo conserva suficientes lecturas para contar
// repeticiones normales sin convertir la reproducción en cámara lenta.
const UPLOADED_VIDEO_ANALYSIS_FPS = 12;
const UPLOADED_VIDEO_ANALYSIS_INTERVAL_SECONDS = 1 / UPLOADED_VIDEO_ANALYSIS_FPS;
const UPLOADED_PUSHUP_ANALYSIS_FPS = 20;
const UPLOADED_PUSHUP_OFFLINE_PREPASS = false;
const UPLOADED_VIDEO_RECORDING_ENABLED = true;
const DETECTOR_MAX_FRAME_WIDTH = 1280;
const DETECTOR_MAX_FRAME_HEIGHT = 720;
const RECORDED_VIDEO_MAX_WIDTH = 1920;
const RECORDED_VIDEO_MAX_HEIGHT = 1080;
// Número de frames usados para calcular la media móvil del FPS real del detector.
const FPS_WINDOW_FRAMES = 45;
// FPS medio mínimo que debe mantener el modelo heavy antes de degradar.
const MIN_FPS = 15;
// Segundos consecutivos bajo MIN_FPS necesarios para cambiar a full.
const FPS_LOW_SECONDS = 4;
type UploadedPushupLiveTimingKey =
  | 'detectorMs'
  | 'processFrameMs'
  | 'skeletonDrawMs'
  | 'captureMs';
type UploadedPushupLiveMetrics = {
  active: boolean;
  lastReportSourceTime: number;
  analyzedSamples: number;
  detectorMs: number;
  processFrameMs: number;
  skeletonDrawMs: number;
  captureMs: number;
  captureCount: number;
  busySkipped: number;
  longTaskCount: number;
  longTaskMs: number;
  observer: PerformanceObserver | null;
};
let uploadedPushupLiveMetrics: UploadedPushupLiveMetrics | null = null;
let lastUploadedPushupHudLogAtMs = Number.NEGATIVE_INFINITY;

function recordUploadedPushupLiveDuration(
  key: UploadedPushupLiveTimingKey,
  durationMs: number,
) {
  if (uploadedPushupLiveMetrics?.active) {
    uploadedPushupLiveMetrics[key] += durationMs;
  }
}

function startUploadedPushupLiveMetrics(sourceTime: number) {
  const metrics: UploadedPushupLiveMetrics = {
    active: true,
    lastReportSourceTime: sourceTime,
    analyzedSamples: 0,
    detectorMs: 0,
    processFrameMs: 0,
    skeletonDrawMs: 0,
    captureMs: 0,
    captureCount: 0,
    busySkipped: 0,
    longTaskCount: 0,
    longTaskMs: 0,
    observer: null,
  };
  uploadedPushupLiveMetrics = metrics;
  if (
    typeof PerformanceObserver === 'undefined'
    || !PerformanceObserver.supportedEntryTypes?.includes('longtask')
  ) {
    return;
  }
  try {
    metrics.observer = new PerformanceObserver((list) => {
      if (!metrics.active || uploadedPushupLiveMetrics !== metrics) return;
      list.getEntries().forEach((entry) => {
        metrics.longTaskCount += 1;
        metrics.longTaskMs += entry.duration;
      });
    });
    metrics.observer.observe({ type: 'longtask', buffered: false });
  } catch {
    metrics.observer?.disconnect();
    metrics.observer = null;
  }
}

function stopUploadedPushupLiveMetrics() {
  if (!uploadedPushupLiveMetrics) return;
  uploadedPushupLiveMetrics.active = false;
  uploadedPushupLiveMetrics.observer?.disconnect();
  uploadedPushupLiveMetrics.observer = null;
}

function instrumentUploadedPushupDetector(detector: PoseDetector) {
  const asyncDetect = detector.detectForVideoAsync;
  if (asyncDetect) {
    detector.detectForVideoAsync = async (...args) => {
      const metrics = uploadedPushupLiveMetrics;
      if (!metrics?.active) return asyncDetect.call(detector, ...args);
      const startedAt = performance.now();
      try {
        return await asyncDetect.call(detector, ...args);
      } finally {
        if (metrics.active && uploadedPushupLiveMetrics === metrics) {
          metrics.analyzedSamples += 1;
          metrics.detectorMs += performance.now() - startedAt;
        }
      }
    };
  }
  const syncDetect = detector.detectForVideo;
  if (syncDetect) {
    detector.detectForVideo = (...args) => {
      const metrics = uploadedPushupLiveMetrics;
      if (!metrics?.active) return syncDetect.call(detector, ...args);
      const startedAt = performance.now();
      try {
        return syncDetect.call(detector, ...args);
      } finally {
        if (metrics.active && uploadedPushupLiveMetrics === metrics) {
          metrics.analyzedSamples += 1;
          metrics.detectorMs += performance.now() - startedAt;
        }
      }
    };
  }
}

const pullupScrollFrames = [
  pullupScrollFrame01,
  pullupScrollFrame02,
  pullupScrollFrame03,
  pullupScrollFrame04,
  pullupScrollFrame05,
  pullupScrollFrame06,
  pullupScrollFrame07,
  pullupScrollFrame08,
  pullupScrollFrame09,
  pullupScrollFrame10,
  pullupScrollFrame11,
];

// MODO TEMPORAL DE DESARROLLO:
// Se conserva todo el código de Clerk y Lemon Squeezy, pero NetPosture abre
// directamente mientras agregamos y ajustamos ejercicios.
// Para reactivar login y pagos, cambiar este valor a true.
const AUTH_AND_BILLING_ENABLED = false;
const PULLUP_DIAGNOSTIC_BUFFER_LIMIT = 200;
const DIAGNOSTIC_BUFFER_LIMIT = 200;
const PULLUP_DIAGNOSTIC_EXPORT_ENABLED = import.meta.env.DEV;

type ViewDiagnosticSnapshot = {
  timestamp: number;
  exercise: ExerciseId;
  shoulderYawDeg: number | null;
  hipYawDeg: number | null;
  yawDeg: number | null;
  leftShoulderX: number | null;
  rightShoulderX: number | null;
  faceScore: number | null;
  earScore: number | null;
  cameraFacingMode: CameraFacingMode;
  estimatedView: ViewAlignmentState['estimatedView'];
  recommendedView: ViewAlignmentState['recommendedView'];
  status: ViewAlignmentState['status'];
  atBottom: boolean;
  atTop: boolean;
};

type DiagnosticLandmarkSample = {
  x: number;
  y: number;
  score: number | null;
  held: boolean;
  heldFrames: number;
  heldReason: string | null;
} | null;

type ExtremityDiagnosticSample = {
  rawModel: DiagnosticLandmarkSample;
  afterSideAssignment: DiagnosticLandmarkSample;
  afterBoneConstraints: DiagnosticLandmarkSample;
  filtered: DiagnosticLandmarkSample;
};

type FrameDiagnosticSnapshot = {
  timestamp: number;
  videoTimeSeconds: number | null;
  exercise: ExerciseId;
  exerciseStarted: boolean;
  cameraReady: boolean;
  poseDetected: boolean;
  frameStable: boolean;
  stabilityFrames: number;
  requiredStabilityFrames: number;
  measurementBlocked: boolean;
  measurementBlockingReasons: string[];
  repetitionFrameReady: boolean;
  repetitionBlockingReasons: string[];
  heldMeasurementPoints: string[];
  visiblePoints: number;
  dominantSide: PoseSide | null;
  sideConfidence: number | null;
  modelInfo: {
    model: string | null;
    delegate: string | null;
  };
  measurements: {
    rawAngle: number | null;
    repetitionAngle: number | null;
    displayAngle: number | null;
    pullupAngle: number | null;
    repetitions: number;
    goodRepetitions: number;
    phase: string;
    minimumAngle: number | null;
    event: string | null;
  };
  pushup: {
    elbowTorsoAngle: number | null;
    bodyLineAngle: number | null;
    techniqueReady: boolean;
  } | null;
  view: {
    shoulderYawDeg: number | null;
    hipYawDeg: number | null;
    yawDeg: number | null;
    cameraFacingMode: CameraFacingMode;
    estimatedView: ViewAlignmentState['estimatedView'];
    recommendedView: ViewAlignmentState['recommendedView'];
    status: ViewAlignmentState['status'];
  };
  extremityPoints: Record<PoseSide, {
    wrist: ExtremityDiagnosticSample;
    ankle: ExtremityDiagnosticSample;
  }> | null;
  pose: {
    keypoints: PosePoint[];
    worldLandmarks: PosePoint[];
  } | null;
};

function toDiagnosticLandmarkSample(
  point: PosePoint | undefined,
): DiagnosticLandmarkSample {
  if (!point) return null;
  return {
    x: point.x,
    y: point.y,
    score: point.score ?? null,
    held: Boolean(point.held),
    heldFrames: point.heldFrames ?? 0,
    heldReason: point.heldReason ?? null,
  };
}

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
const GREEN = '#39ff6a';

type ExerciseId = 'fondos' | 'dominadas' | 'dominadas-supinas' | 'dominadas-comando' | 'muscle-up' | 'jalon' | 'pull-over-polea-alta' | 'remo-barra' | 'remos-australianos-elevados' | 'remo-sentado-polea-agarre-cerrado' | 'remo-mancuerna-una-mano' | 'peso-muerto-rumano' | 'peso-muerto-piernas-rigidas' | 'flexiones' | 'flexiones-declinadas' | 'flexiones-pica' | 'press-militar' | 'press-hombros-maquina' | 'elevaciones-laterales' | 'elevaciones-laterales-polea-baja' | 'pajaros-mancuernas' | 'face-pulls-polea-alta' | 'aperturas-inversas-maquina' | 'cruces-polea-baja-alta' | 'press-banca' | 'press-banca-agarre-cerrado' | 'press-banca-inclinado' | 'press-plano-mancuernas' | 'press-plano-inclinado' | 'triceps-polea-alta' | 'triceps-tras-nuca-polea-alta' | 'copa-mancuernas' | 'extension-horizontal-barra' | 'curl-biceps' | 'curl-inclinado-mancuernas' | 'curl-predicador' | 'curl-arana' | 'curl-martillo' | 'curl-inverso-barra' | 'curl-muneca-sentado' | 'rodillo-muneca' | 'sentadillas' | 'prensa-piernas' | 'extensiones-maquina' | 'curl-femoral' | 'elevacion-talones-pie' | 'maquina-aductores' | 'hip-thrust-barra' | 'zancadas' | 'zancada-banco' | 'plancha' | 'crunch-invertido' | 'rueda-abdominal' | 'elevaciones-piernas-barra' | 'barra-reloj' | 'elevaciones-piernas-suelo' | 'press-pallof-polea-banda' | 'giros-rusos';
type TrackedJoint = 'head' | 'shoulder' | 'elbow' | 'wrist' | 'hip' | 'knee' | 'ankle' | 'foot';
type TrackedJointDefinition = {
  joint: TrackedJoint;
  label: string;
};
type MuscleGroup = 'pecho' | 'espalda' | 'hombros' | 'pierna' | 'triceps' | 'abdomen' | 'biceps' | 'antebrazo';
type ExerciseDefinition = {
  id: ExerciseId;
  name: string;
  muscleGroup?: MuscleGroup;
  description: string;
  angleLabel: string;
  cameraNote?: string;
  recommendedView?: ExerciseView;
  viewToleranceDeg?: number;
  uprightTorso?: boolean;
  trackedJoints: TrackedJointDefinition[];
  trackBothSides?: boolean;
  trackedAngleLabels: string[];
};
const exerciseImages: Record<ExerciseId, string> = {
  fondos: dipImage,
  dominadas: pullupImage,
  'dominadas-supinas': supinePullupImage,
  'dominadas-comando': commandoPullupImage,
  'muscle-up': muscleUpImage,
  jalon: pulldownImage,
  'pull-over-polea-alta': pullOverImage,
  flexiones: pushupImage,
  'flexiones-declinadas': declinePushupImage,
  'flexiones-pica': pikePushupImage,
  'press-militar': militaryPressImage,
  'press-hombros-maquina': shoulderMachinePressImage,
  'elevaciones-laterales': lateralRaiseImage,
  'elevaciones-laterales-polea-baja': lowCableLateralRaiseImage,
  'pajaros-mancuernas': rearDeltFlyImage,
  'face-pulls-polea-alta': facePullImage,
  'aperturas-inversas-maquina': reverseMachineFlyImage,
  'cruces-polea-baja-alta': lowToHighCableCrossoverImage,
  'press-banca': benchPressImage,
  'press-banca-agarre-cerrado': closeGripBenchPressImage,
  'press-banca-inclinado': inclineBenchPressImage,
  'press-plano-mancuernas': dumbbellFlatPressImage,
  'press-plano-inclinado': inclineDumbbellPressImage,
  'triceps-polea-alta': tricepsPushdownImage,
  'triceps-tras-nuca-polea-alta': overheadTricepsExtensionImage,
  'copa-mancuernas': dumbbellOverheadTricepsImage,
  'extension-horizontal-barra': horizontalBarExtensionImage,
  'remo-barra': barbellRowImage,
  'remos-australianos-elevados': elevatedAustralianRowImage,
  'remo-sentado-polea-agarre-cerrado': seatedCableRowImage,
  'remo-mancuerna-una-mano': oneArmDumbbellRowImage,
  'peso-muerto-rumano': romanianDeadliftImage,
  'peso-muerto-piernas-rigidas': stiffLegDeadliftImage,
  'curl-biceps': bicepsCurlImage,
  'curl-inclinado-mancuernas': inclineDumbbellCurlImage,
  'curl-predicador': preacherCurlImage,
  'curl-arana': spiderCurlImage,
  'curl-martillo': hammerCurlImage,
  'curl-inverso-barra': reverseBarbellCurlImage,
  'curl-muneca-sentado': seatedWristCurlImage,
  'rodillo-muneca': wristRollerImage,
  sentadillas: squatImage,
  'prensa-piernas': legPressImage,
  'extensiones-maquina': machineExtensionImage,
  'curl-femoral': `${basePath}/hamstring-curl-seated.png`,
  'elevacion-talones-pie': `${basePath}/standing-calf-raise.png`,
  'maquina-aductores': `${basePath}/adductor-machine-reference.png`,
  'hip-thrust-barra': `${basePath}/hip-thrust-barbell.png`,
  zancadas: lungeImage,
  'zancada-banco': benchLungeImage,
  plancha: plankImage,
  'crunch-invertido': reverseCrunchImage,
  'rueda-abdominal': abWheelImage,
  'elevaciones-piernas-barra': hangingLegRaiseImage,
  'barra-reloj': barraRelojImage,
  'elevaciones-piernas-suelo': floorLegRaiseImage,
  'press-pallof-polea-banda': pallofPressImage,
  'giros-rusos': russianTwistImage,
};

function escapeSvgText(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getExerciseImageFallback(exercise: ExerciseDefinition) {
  const name = escapeSvgText(exercise.name);
  const angleLabel = escapeSvgText(exercise.angleLabel);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="720" height="480" viewBox="0 0 720 480">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#10263a"/>
          <stop offset="100%" stop-color="#071411"/>
        </linearGradient>
      </defs>
      <rect width="720" height="480" rx="32" fill="url(#bg)"/>
      <circle cx="360" cy="142" r="38" fill="none" stroke="#8bffa5" stroke-width="10"/>
      <path d="M360 185v105m0-80-92 76m92-76 92 76m-92 0-62 118m62-118 62 118" fill="none" stroke="#39ff6a" stroke-linecap="round" stroke-linejoin="round" stroke-width="14"/>
      <text x="360" y="54" fill="#8bffa5" font-family="Arial, sans-serif" font-size="18" font-weight="700" letter-spacing="4" text-anchor="middle">NETPOSTURE</text>
      <text x="360" y="390" fill="#f0f5fb" font-family="Arial, sans-serif" font-size="30" font-weight="700" text-anchor="middle">${name}</text>
      <text x="360" y="426" fill="#b9c9d8" font-family="Arial, sans-serif" font-size="18" text-anchor="middle">${angleLabel}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function handleExerciseImageError(
  event: SyntheticEvent<HTMLImageElement>,
  exercise: ExerciseDefinition,
) {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied === 'true') return;
  image.dataset.fallbackApplied = 'true';
  image.src = getExerciseImageFallback(exercise);
}

type PoseSide = 'left' | 'right';
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
type PullupRepEvent = 'valid' | 'invalid' | 'no-top' | 'no-lockout' | null;
type PullupPreparationStage = 'body-detection' | 'bar-preparation' | 'active';
type PushupPreparationStage = 'body-detection' | 'pushup-preparation' | 'active';
type PullupTracker = {
  phase: PullupPhase;
  repetitions: number;
  goodRepetitions: number;
  minimumAngle: number | null;
  samples: number[];
  event: PullupRepEvent;
  lastAngle: number | null;
  topFrames: number;
  currentRepCorrect: boolean;
  bottomReadyFrames: number;
  isArmed: boolean;
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
  countOnlyWhenCorrect?: boolean;
  techniqueStartsOnActivation?: boolean;
  countReturnWithoutEndAsIncorrect?: boolean;
  requireReturnPastActivation?: boolean;
  rawAngleCanReachEnd?: boolean;
  smoothingSamples?: number;
  techniqueMustHoldThroughout?: boolean;
};
type ExerciseRepTracker = {
  phase: ExerciseRepPhase;
  repetitions: number;
  goodRepetitions: number;
  endpointAngle: number | null;
  samples: number[];
  event: 'valid' | null;
  currentRepCorrect: boolean;
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
  unit?: '°' | '';
};
type UploadedPushupExportSample = {
  timeSeconds: number;
  pose: Pick<Pose, 'keypoints'> | null;
  hud: VideoRecordingHudState;
  qualityReady: boolean;
};
type DipJointReading = {
  label: string;
  value: number | null;
  status?: string;
};
const exercises: ExerciseDefinition[] = [
  {
    id: 'fondos',
    name: 'Fondos en barra',
    muscleGroup: 'pecho',
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
    muscleGroup: 'espalda',
    description: 'Lleva los codos hacia abajo y evita balancear el cuerpo.',
    angleLabel: 'Codo · tracción vertical',
    cameraNote: 'Nota: vista trasera recomendada; la frontal también es válida si dejas visibles ambos brazos, las manos y todo el cuerpo.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombros' },
      { joint: 'elbow', label: 'codos' },
      { joint: 'wrist', label: 'muñecas' },
      { joint: 'hip', label: 'caderas' },
    ],
    trackBothSides: true,
    trackedAngleLabels: ['Codo: inicio/regreso 145–180° · tolerancia ±5°', 'Parte alta: cabeza sobre ambas muñecas'],
  },
  {
    id: 'dominadas-supinas',
    name: 'Dominadas supinas',
    muscleGroup: 'espalda',
    description: 'Mismo recorrido que la dominada, con agarre supino.',
    angleLabel: 'Extensión completa · cabeza sobre muñecas',
    cameraNote: 'Nota: vista trasera recomendada; la frontal también es válida si dejas visibles ambos brazos, las manos, la cabeza y todo el cuerpo.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombros' },
      { joint: 'elbow', label: 'codos' },
      { joint: 'wrist', label: 'muñecas' },
    ],
    trackBothSides: true,
    trackedAngleLabels: ['Codo: inicio/regreso 145–180° · tolerancia ±5°', 'Parte alta: cabeza sobre ambas muñecas'],
  },
  {
    id: 'dominadas-comando',
    name: 'Dominadas comando',
    muscleGroup: 'espalda',
    description: 'Alterna el agarre sobre la barra y sube con control, manteniendo hombros, codos, muñecas y cabeza visibles.',
    angleLabel: 'Hombros · codos · muñecas · cabeza',
    cameraNote: 'Nota: vista trasera o en 3/4; deja visibles ambos hombros, codos, muñecas y la cabeza durante todo el recorrido.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombros' },
      { joint: 'elbow', label: 'codos' },
      { joint: 'wrist', label: 'muñecas' },
      { joint: 'head', label: 'cabeza' },
    ],
    trackBothSides: true,
    trackedAngleLabels: [
      'Hombros: lectura izquierda y derecha',
      'Codos: lectura izquierda y derecha',
      'Muñecas: lectura izquierda y derecha',
      'Cabeza: posición respecto a las muñecas',
      'Calibración del recorrido: pendiente',
    ],
  },
  {
    id: 'muscle-up',
    name: 'Muscle-up',
    muscleGroup: 'espalda',
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
    muscleGroup: 'espalda',
    description: 'Mantén el torso erguido entre 10° y 25° mientras llevas la barra al pecho.',
    angleLabel: 'Torso 10°–30° · cadera–hombro–codo 60°–90°',
    cameraNote: 'Nota: vista lateral; la cámara puede estar baja o inclinada.',
    trackedJoints: [
      { joint: 'hip', label: 'cadera' },
      { joint: 'shoulder', label: 'hombro' },
      { joint: 'elbow', label: 'codo' },
      { joint: 'wrist', label: 'muñeca' },
    ],
    trackedAngleLabels: ['Torso: 10–25°', 'Codo: final 85–110°', 'Tirón cadera–hombro–codo: inicio 130–155° · final 60–90°'],
  },
  {
    id: 'pull-over-polea-alta',
    name: 'Pull-over en polea alta con brazos extendidos',
    muscleGroup: 'espalda',
    description: 'Lleva la barra desde arriba hacia la cadera con los brazos extendidos, manteniendo estable el torso.',
    angleLabel: 'Hombros · codos · cadera · muñecas',
    cameraNote: 'Nota: vista lateral; deja visibles ambos hombros, codos, caderas y muñecas junto a la polea.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombros' },
      { joint: 'elbow', label: 'codos' },
      { joint: 'hip', label: 'caderas' },
      { joint: 'wrist', label: 'muñecas' },
    ],
    trackBothSides: true,
    trackedAngleLabels: [
      'Hombros: lectura izquierda y derecha',
      'Codos: lectura izquierda y derecha',
      'Caderas: lectura izquierda y derecha',
      'Muñecas: lectura izquierda y derecha',
      'Recorrido: hombro desde arriba hacia la cadera con codos extendidos',
    ],
  },
  {
    id: 'remo-barra',
    name: 'Remo con barra',
    muscleGroup: 'espalda',
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
    id: 'remos-australianos-elevados',
    name: 'Remos australianos elevados',
    muscleGroup: 'espalda',
    description: 'Tira del pecho hacia el apoyo con el cuerpo firme y los codos cerca del torso.',
    angleLabel: 'Codos · línea corporal · caderas · rodillas',
    cameraNote: 'Nota: vista lateral o en 3/4; deja visibles ambos hombros, codos, muñecas, caderas y rodillas. No necesitas mostrar la cabeza ni los tobillos.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombros' },
      { joint: 'elbow', label: 'codos' },
      { joint: 'wrist', label: 'muñecas' },
      { joint: 'hip', label: 'caderas' },
      { joint: 'knee', label: 'rodillas' },
    ],
    trackBothSides: true,
    trackedAngleLabels: [
      'Hombros, codos y muñecas: lectura izquierda y derecha',
      'Caderas y rodillas: lectura izquierda y derecha',
      'Línea corporal: hombro–cadera–rodilla',
      'Recorrido: flexión y extensión de codos',
    ],
  },
  {
    id: 'remo-sentado-polea-agarre-cerrado',
    name: 'Remo sentado en polea con agarre cerrado (Gironde)',
    muscleGroup: 'espalda',
    description: 'Tira del agarre hacia el abdomen con el torso estable y mantén hombros, codos y muñecas alineados.',
    angleLabel: 'Hombros · codos · muñecas',
    cameraNote: 'Nota: vista lateral o en 3/4; deja visibles ambos hombros, codos y muñecas junto a la polea.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombros' },
      { joint: 'elbow', label: 'codos' },
      { joint: 'wrist', label: 'muñecas' },
    ],
    trackBothSides: true,
    trackedAngleLabels: [
      'Hombros: lectura izquierda y derecha',
      'Codos: lectura izquierda y derecha',
      'Muñecas: lectura izquierda y derecha',
      'Recorrido: agarre cerrado hacia el abdomen con el torso estable',
      'Calibración del recorrido: pendiente',
    ],
  },
  {
    id: 'remo-mancuerna-una-mano',
    name: 'Remo con mancuerna a una mano',
    muscleGroup: 'espalda',
    description: 'Apoya una mano en el banco, lleva la mancuerna hacia la cadera y mantén el torso estable.',
    angleLabel: 'Hombro · codo · cadera · muñeca',
    cameraNote: 'Nota: vista lateral; deja visibles el hombro, codo, cadera y muñeca del lado que trabaja, junto al banco.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombro' },
      { joint: 'elbow', label: 'codo' },
      { joint: 'hip', label: 'cadera' },
      { joint: 'wrist', label: 'muñeca' },
    ],
    trackedAngleLabels: [
      'Hombro: posición estable durante el tirón',
      'Codo: recorrido hacia atrás y hacia la cadera',
      'Cadera: torso estable sobre el banco',
      'Muñeca: alineada con el antebrazo',
      'Calibración del recorrido: pendiente',
    ],
  },
  {
    id: 'peso-muerto-rumano',
    name: 'Peso muerto rumano con mancuernas o barra',
    muscleGroup: 'pierna',
    description: 'Haz una bisagra de cadera con mancuernas o barra, mantén el control y alinea todas las extremidades.',
    angleLabel: 'Hombros · codos · muñecas · caderas · rodillas · tobillos',
    cameraNote: 'Nota: vista lateral o en 3/4; deja visibles ambos brazos y ambas piernas durante todo el recorrido.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombros' },
      { joint: 'elbow', label: 'codos' },
      { joint: 'wrist', label: 'muñecas' },
      { joint: 'hip', label: 'caderas' },
      { joint: 'knee', label: 'rodillas' },
      { joint: 'ankle', label: 'tobillos' },
    ],
    trackBothSides: true,
    trackedAngleLabels: [
      'Hombros, codos y muñecas: lectura izquierda y derecha',
      'Caderas, rodillas y tobillos: lectura izquierda y derecha',
      'Calibración del recorrido: pendiente',
    ],
  },
  {
    id: 'peso-muerto-piernas-rigidas',
    name: 'Peso muerto con piernas rígidas',
    muscleGroup: 'pierna',
    description: 'Haz una bisagra de cadera con las piernas más rígidas y mantén alineadas todas las extremidades.',
    angleLabel: 'Hombros · codos · muñecas · caderas · rodillas · tobillos',
    cameraNote: 'Nota: vista lateral; deja visible el costado que presentes durante todo el recorrido. El lado opuesto no se usa para validar la repetición.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombros' },
      { joint: 'elbow', label: 'codos' },
      { joint: 'wrist', label: 'muñecas' },
      { joint: 'hip', label: 'caderas' },
      { joint: 'knee', label: 'rodillas' },
      { joint: 'ankle', label: 'tobillos' },
    ],
    trackBothSides: false,
    trackedAngleLabels: [
      'Hombros, codos y muñecas: lado predominante',
      'Caderas, rodillas y tobillos: lado predominante',
      'Calibración de la ejecución y del recorrido: pendiente',
    ],
  },
  {
    id: 'flexiones',
    name: 'Flexiones de pecho',
    muscleGroup: 'pecho',
    description: 'Mantén los codos cerca del torso y el cuerpo en línea.',
    angleLabel: 'Codo respecto al torso 45–90° · alineación 162–180°',
    cameraNote: 'Nota: vista lateral; la cámara puede estar baja o inclinada.',
    trackedJoints: [
      { joint: 'hip', label: 'cadera' },
      { joint: 'shoulder', label: 'hombro' },
      { joint: 'elbow', label: 'codo' },
      { joint: 'wrist', label: 'muñeca' },
      { joint: 'knee', label: 'rodilla' },
      { joint: 'ankle', label: 'tobillo' },
    ],
    trackedAngleLabels: ['Codo respecto al torso: 0–55°', 'Línea hombro–cadera–tobillo: 162–180°', 'Flexión del codo: final 70–105°'],
  },
  {
    id: 'flexiones-declinadas',
    name: 'Flexiones declinadas',
    muscleGroup: 'pecho',
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
    muscleGroup: 'pecho',
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
    muscleGroup: 'hombros',
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
    id: 'press-hombros-maquina',
    name: 'Press de hombros en máquina',
    muscleGroup: 'hombros',
    description: 'Empuja los agarres hacia arriba con control, manteniendo los hombros estables y las muñecas alineadas.',
    angleLabel: 'Hombros · codos · muñecas',
    cameraNote: 'Nota: vista frontal o en 3/4; deja visibles ambos hombros, codos y muñecas junto a la máquina durante todo el recorrido.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombros' },
      { joint: 'elbow', label: 'codos' },
      { joint: 'wrist', label: 'muñecas' },
    ],
    trackBothSides: true,
    trackedAngleLabels: [
      'Hombros: lectura izquierda y derecha',
      'Codos: lectura izquierda y derecha',
      'Muñecas: lectura izquierda y derecha',
      'Recorrido: empuje vertical con muñecas alineadas',
    ],
  },
  {
    id: 'elevaciones-laterales',
    name: 'Elevaciones laterales',
    muscleGroup: 'hombros',
    description: 'Eleva los brazos hasta la línea de los hombros sin encogerlos ni balancearte.',
    angleLabel: 'Hombros · codos · muñecas',
    cameraNote: 'Nota: vista frontal o en 3/4; deja visibles ambos brazos y las manos durante todo el recorrido.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombros' },
      { joint: 'elbow', label: 'codos' },
      { joint: 'wrist', label: 'muñecas' },
    ],
    trackBothSides: true,
    trackedAngleLabels: [
      'Hombros: lectura izquierda y derecha',
      'Codos: lectura izquierda y derecha',
      'Muñecas: lectura izquierda y derecha',
      'Recorrido: subida hasta la línea de los hombros',
    ],
  },
  {
    id: 'elevaciones-laterales-polea-baja',
    name: 'Elevaciones laterales polea baja',
    muscleGroup: 'hombros',
    description: 'Eleva el brazo desde la polea baja hasta la línea del hombro sin girar el torso ni perder el control.',
    angleLabel: 'Hombros · codos · muñecas',
    cameraNote: 'Nota: vista frontal o en 3/4; deja visibles ambos hombros, codos y muñecas junto a la polea.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombros' },
      { joint: 'elbow', label: 'codos' },
      { joint: 'wrist', label: 'muñecas' },
    ],
    trackBothSides: true,
    trackedAngleLabels: [
      'Hombros: lectura izquierda y derecha',
      'Codos: lectura izquierda y derecha',
      'Muñecas: lectura izquierda y derecha',
      'Recorrido: subida hasta la línea de los hombros',
    ],
  },
  {
    id: 'pajaros-mancuernas',
    name: 'Pájaros con mancuernas',
    muscleGroup: 'hombros',
    description: 'Inclina el torso y abre los brazos hasta la línea de los hombros sin balancearte.',
    angleLabel: 'Hombros · codos · muñecas · cadera',
    cameraNote: 'Nota: vista frontal o en 3/4; deja visibles ambos brazos, las manos y la cadera durante todo el recorrido.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombros' },
      { joint: 'elbow', label: 'codos' },
      { joint: 'wrist', label: 'muñecas' },
      { joint: 'hip', label: 'cadera' },
    ],
    trackBothSides: true,
    trackedAngleLabels: [
      'Hombros: lectura izquierda y derecha',
      'Codos: lectura izquierda y derecha',
      'Muñecas: lectura izquierda y derecha',
      'Recorrido: apertura de brazos hasta la línea de los hombros',
    ],
  },
  {
    id: 'face-pulls-polea-alta',
    name: 'Face Pulls en polea alta',
    muscleGroup: 'hombros',
    description: 'Tira de la cuerda hacia la cara manteniendo hombros estables y codos abiertos.',
    angleLabel: 'Hombros · codos · muñecas',
    cameraNote: 'Nota: vista frontal o en 3/4; deja visibles ambos hombros, codos y muñecas durante todo el recorrido.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombros' },
      { joint: 'elbow', label: 'codos' },
      { joint: 'wrist', label: 'muñecas' },
    ],
    trackBothSides: true,
    trackedAngleLabels: [
      'Hombros: lectura izquierda y derecha',
      'Codos: lectura izquierda y derecha',
      'Muñecas: lectura izquierda y derecha',
      'Recorrido: manos hacia la cara con codos abiertos',
    ],
  },
  {
    id: 'aperturas-inversas-maquina',
    name: 'Aperturas inversas en máquina',
    muscleGroup: 'hombros',
    description: 'Abre los brazos hacia atrás con control, manteniendo el pecho apoyado y los hombros estables.',
    angleLabel: 'Hombros · codos · muñecas',
    cameraNote: 'Nota: vista frontal o en 3/4; deja visibles ambos hombros, codos, muñecas y la máquina durante todo el recorrido.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombros' },
      { joint: 'elbow', label: 'codos' },
      { joint: 'wrist', label: 'muñecas' },
    ],
    trackBothSides: true,
    trackedAngleLabels: [
      'Hombros: lectura izquierda y derecha',
      'Codos: lectura izquierda y derecha',
      'Muñecas: lectura izquierda y derecha',
      'Recorrido: apertura hacia atrás con el pecho apoyado',
    ],
  },
  {
    id: 'cruces-polea-baja-alta',
    name: 'Cruces de polea baja, media y alta',
    muscleGroup: 'pecho',
    description: 'Lleva las manos desde la polea baja, media o alta hacia delante del pecho con control, manteniendo hombros, codos y muñecas alineados.',
    angleLabel: 'Hombros · codos · muñecas',
    cameraNote: 'Nota: vista frontal o en 3/4; deja visibles ambos hombros, codos y muñecas junto a las poleas.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombros' },
      { joint: 'elbow', label: 'codos' },
      { joint: 'wrist', label: 'muñecas' },
    ],
    trackBothSides: true,
    trackedAngleLabels: [
      'Hombros: lectura izquierda y derecha',
      'Codos: lectura izquierda y derecha',
      'Muñecas: lectura izquierda y derecha',
      'Recorrido: manos desde la polea baja, media o alta hacia el centro del pecho',
    ],
  },
  {
    id: 'press-banca',
    name: 'Press de banca',
    muscleGroup: 'pecho',
    description: 'Empuja la barra desde el pecho manteniendo hombros, codos, muñecas y cadera visibles.',
    angleLabel: 'Hombros · codos · muñecas · cadera',
    cameraNote: 'Nota: vista lateral o en 3/4; deja visibles ambos brazos, las muñecas y la cadera durante todo el recorrido.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombros' },
      { joint: 'elbow', label: 'codos' },
      { joint: 'wrist', label: 'muñecas' },
      { joint: 'hip', label: 'caderas' },
    ],
    trackBothSides: true,
    trackedAngleLabels: [
      'Hombros: lectura izquierda y derecha',
      'Codos: lectura izquierda y derecha',
      'Muñecas: lectura izquierda y derecha',
      'Cadera: lectura izquierda y derecha',
      'Calibración del recorrido: pendiente',
    ],
  },
  {
    id: 'press-banca-agarre-cerrado',
    name: 'Press de banca con agarre cerrado',
    muscleGroup: 'triceps',
    description: 'Empuja la barra con las manos más juntas, manteniendo hombros, codos y muñecas alineados.',
    angleLabel: 'Hombros · codos · muñecas',
    cameraNote: 'Nota: vista lateral o en 3/4; deja visibles ambos hombros, codos y muñecas durante todo el recorrido.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombros' },
      { joint: 'elbow', label: 'codos' },
      { joint: 'wrist', label: 'muñecas' },
    ],
    trackBothSides: true,
    trackedAngleLabels: [
      'Hombros: lectura izquierda y derecha',
      'Codos: lectura izquierda y derecha',
      'Muñecas: lectura izquierda y derecha',
      'Recorrido: empuje con agarre cerrado',
    ],
  },
  {
    id: 'press-banca-inclinado',
    name: 'Press de banca inclinado',
    muscleGroup: 'pecho',
    description: 'Empuja la barra desde la parte alta del pecho manteniendo hombros, codos y muñecas alineados.',
    angleLabel: 'Hombros · codos · muñecas',
    cameraNote: 'Nota: vista lateral o en 3/4; deja visibles ambos hombros, codos y muñecas durante todo el recorrido.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombros' },
      { joint: 'elbow', label: 'codos' },
      { joint: 'wrist', label: 'muñecas' },
    ],
    trackBothSides: true,
    trackedAngleLabels: [
      'Hombros: lectura izquierda y derecha',
      'Codos: lectura izquierda y derecha',
      'Muñecas: lectura izquierda y derecha',
      'Recorrido: empuje desde la parte alta del pecho',
      'Calibración del recorrido: pendiente',
    ],
  },
  {
    id: 'press-plano-mancuernas',
    name: 'Press plano con mancuernas',
    muscleGroup: 'pecho',
    description: 'Empuja las mancuernas desde el pecho manteniendo hombros, codos y muñecas alineados.',
    angleLabel: 'Hombros · codos · muñecas',
    cameraNote: 'Nota: vista lateral o en 3/4; deja visibles ambos hombros, codos y muñecas durante todo el recorrido.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombros' },
      { joint: 'elbow', label: 'codos' },
      { joint: 'wrist', label: 'muñecas' },
    ],
    trackBothSides: true,
    trackedAngleLabels: [
      'Hombros: lectura izquierda y derecha',
      'Codos: lectura izquierda y derecha',
      'Muñecas: lectura izquierda y derecha',
      'Recorrido: empuje vertical desde el pecho',
      'Calibración del recorrido: pendiente',
    ],
  },
  {
    id: 'press-plano-inclinado',
    name: 'Press plano inclinado',
    muscleGroup: 'pecho',
    description: 'Empuja las mancuernas desde el pecho manteniendo hombros, codos y muñecas alineados sobre el banco inclinado.',
    angleLabel: 'Hombros · codos · muñecas',
    cameraNote: 'Nota: vista lateral o en 3/4; deja visibles ambos hombros, codos y muñecas durante todo el recorrido.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombros' },
      { joint: 'elbow', label: 'codos' },
      { joint: 'wrist', label: 'muñecas' },
    ],
    trackBothSides: true,
    trackedAngleLabels: [
      'Hombros: lectura izquierda y derecha',
      'Codos: lectura izquierda y derecha',
      'Muñecas: lectura izquierda y derecha',
      'Recorrido: empuje desde el pecho sobre el banco inclinado',
      'Calibración del recorrido: pendiente',
    ],
  },
  {
    id: 'triceps-polea-alta',
    name: 'Extensiones de tríceps en polea alta',
    muscleGroup: 'triceps',
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
    id: 'triceps-tras-nuca-polea-alta',
    name: 'Extensión de tríceps tras nuca con polea alta',
    muscleGroup: 'triceps',
    description: 'Extiende los codos por encima de la cabeza sin mover los hombros ni doblar las muñecas.',
    angleLabel: 'Hombro · codo · muñeca',
    cameraNote: 'Nota: vista lateral o en 3/4; deja visibles hombro, codo y muñeca junto a la polea.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombro' },
      { joint: 'elbow', label: 'codo' },
      { joint: 'wrist', label: 'muñeca' },
    ],
    trackedAngleLabels: [
      'Hombro: brazo elevado 145–180°',
      'Codo: inicio 70–120° · extensión final 145–180°',
      'Muñeca: alineada con el antebrazo',
    ],
  },
  {
    id: 'copa-mancuernas',
    name: 'Copa con mancuernas',
    muscleGroup: 'triceps',
    description: 'Sujeta la mancuerna por encima de la cabeza y extiende los codos sin mover los hombros ni doblar las muñecas.',
    angleLabel: 'Hombros · codos · muñecas',
    cameraNote: 'Nota: vista lateral o en 3/4; deja visibles ambos hombros, codos y muñecas durante todo el recorrido.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombros' },
      { joint: 'elbow', label: 'codos' },
      { joint: 'wrist', label: 'muñecas' },
    ],
    trackBothSides: true,
    trackedAngleLabels: [
      'Hombros: lectura izquierda y derecha',
      'Codos: lectura izquierda y derecha',
      'Muñecas: lectura izquierda y derecha',
      'Recorrido: flexión y extensión de codos por encima de la cabeza',
    ],
  },
  {
    id: 'extension-horizontal-barra',
    name: 'Extensión horizontal con barra',
    muscleGroup: 'triceps',
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
    muscleGroup: 'biceps',
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
    id: 'curl-inclinado-mancuernas',
    name: 'Curl en banco inclinado con mancuernas',
    muscleGroup: 'biceps',
    description: 'Flexiona los codos con los brazos atrás, apoyado en un banco inclinado, sin despegar los hombros.',
    angleLabel: 'Hombros · codos · muñecas',
    cameraNote: 'Nota: vista lateral o en 3/4; deja visibles ambos hombros, codos y muñecas junto al banco durante todo el recorrido.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombros' },
      { joint: 'elbow', label: 'codos' },
      { joint: 'wrist', label: 'muñecas' },
    ],
    trackBothSides: true,
    trackedAngleLabels: [
      'Hombros: lectura izquierda y derecha',
      'Codos: inicio 85–135°, activación <70°, final 30–60°',
      'Muñecas: lectura izquierda y derecha',
      'Posición: hombros y espalda apoyados en el banco inclinado',
    ],
  },
  {
    id: 'curl-predicador',
    name: 'Curl predicador',
    muscleGroup: 'biceps',
    description: 'Apoya los brazos en el banco predicador y flexiona los codos con control, sin despegar los hombros del respaldo.',
    angleLabel: 'Hombros · codos · muñecas',
    cameraNote: 'Nota: vista frontal o en 3/4; deja visibles ambos hombros, codos y muñecas junto al banco predicador durante todo el recorrido.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombros' },
      { joint: 'elbow', label: 'codos' },
      { joint: 'wrist', label: 'muñecas' },
    ],
    trackBothSides: true,
    trackedAngleLabels: [
      'Hombros: lectura izquierda y derecha',
      'Codos: inicio 85–135°, activación <70°, final 30–60°',
      'Muñecas: lectura izquierda y derecha',
      'Posición: brazos apoyados en el banco predicador',
    ],
  },
  {
    id: 'curl-arana',
    name: 'Curl de araña',
    muscleGroup: 'biceps',
    description: 'Apoya el pecho en un banco inclinado y flexiona los codos con los brazos colgando, sin balancear los hombros.',
    angleLabel: 'Hombros · codos · muñecas',
    cameraNote: 'Nota: vista frontal o en 3/4 frente al banco inclinado; deja visibles ambos hombros, codos y muñecas durante todo el recorrido.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombros' },
      { joint: 'elbow', label: 'codos' },
      { joint: 'wrist', label: 'muñecas' },
    ],
    trackBothSides: true,
    trackedAngleLabels: [
      'Hombros: lectura izquierda y derecha',
      'Codos: inicio 85–135°, activación <70°, final 30–60°',
      'Muñecas: lectura izquierda y derecha',
      'Posición: pecho apoyado y brazos colgando del banco inclinado',
    ],
  },
  {
    id: 'curl-martillo',
    name: 'Curl Martillo (Hammer Curl)',
    muscleGroup: 'biceps',
    description: 'Flexiona ambos codos con agarre neutro, manteniendo los hombros estables y las muñecas alineadas.',
    angleLabel: 'Hombros · codos · muñecas',
    cameraNote: 'Nota: vista frontal o en 3/4; deja visibles ambos hombros, codos y muñecas durante todo el recorrido.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombros' },
      { joint: 'elbow', label: 'codos' },
      { joint: 'wrist', label: 'muñecas' },
    ],
    trackBothSides: true,
    trackedAngleLabels: [
      'Hombros: lectura izquierda y derecha',
      'Codos: inicio 85–135°, activación <70°, final 30–60°',
      'Muñecas: lectura izquierda y derecha',
      'Agarre neutro y muñecas alineadas durante el recorrido',
    ],
  },
  {
    id: 'curl-inverso-barra',
    name: 'Curl inverso con barra',
    muscleGroup: 'antebrazo',
    description: 'Sujeta la barra con agarre prono y flexiona los codos sin despegar los brazos del cuerpo.',
    angleLabel: 'Hombros · codos · muñecas',
    cameraNote: 'Nota: vista frontal o en 3/4; deja visibles ambos hombros, codos y muñecas durante todo el recorrido.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombros' },
      { joint: 'elbow', label: 'codos' },
      { joint: 'wrist', label: 'muñecas' },
    ],
    trackBothSides: true,
    trackedAngleLabels: [
      'Hombros: lectura izquierda y derecha',
      'Codos: inicio 85–135°, activación <70°, final 30–60°',
      'Muñecas: lectura izquierda y derecha',
      'Agarre prono y brazos estables durante el recorrido',
    ],
  },
  {
    id: 'curl-muneca-sentado',
    name: 'Curl de muñeca sentado con barra o mancuerna',
    muscleGroup: 'antebrazo',
    description: 'Apoya los antebrazos sobre los muslos y mueve las muñecas con control, usando barra o mancuernas.',
    angleLabel: 'Hombros · codos · muñecas',
    cameraNote: 'Nota: vista lateral; deja visibles hombro, codo y muñeca del lado que trabaja junto al banco.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombros' },
      { joint: 'elbow', label: 'codos' },
      { joint: 'wrist', label: 'muñecas' },
    ],
    trackBothSides: true,
    trackedAngleLabels: [
      'Hombros: lectura izquierda y derecha',
      'Codos: lectura izquierda y derecha',
      'Muñecas: flexión y extensión izquierda y derecha',
      'Antebrazos apoyados y codos estables',
    ],
  },
  {
    id: 'rodillo-muneca',
    name: 'El rodillo de muñeca',
    muscleGroup: 'antebrazo',
    description: 'Gira el rodillo con control para elevar y descender la carga, manteniendo estables los brazos.',
    angleLabel: 'Hombros · codos · muñecas',
    cameraNote: 'Nota: vista lateral; deja visibles hombro, codo y muñeca del lado que trabaja junto al rodillo.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombros' },
      { joint: 'elbow', label: 'codos' },
      { joint: 'wrist', label: 'muñecas' },
    ],
    trackBothSides: true,
    trackedAngleLabels: [
      'Hombros: lectura izquierda y derecha',
      'Codos: lectura izquierda y derecha',
      'Muñecas: flexión y extensión izquierda y derecha',
      'Brazos estables mientras sube y baja la carga',
    ],
  },
  {
    id: 'sentadillas',
    name: 'Sentadillas',
    muscleGroup: 'pierna',
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
    id: 'prensa-piernas',
    name: 'Prensa de piernas',
    muscleGroup: 'pierna',
    description: 'Empuja la plataforma con control y mantén alineadas las rodillas y los tobillos.',
    angleLabel: 'Rodillas · tobillos',
    cameraNote: 'Nota: vista lateral; deja visibles ambas rodillas y ambos tobillos durante todo el recorrido.',
    trackedJoints: [
      { joint: 'knee', label: 'rodillas' },
      { joint: 'ankle', label: 'tobillos' },
    ],
    trackBothSides: true,
    trackedAngleLabels: [
      'Rodillas: lectura izquierda y derecha',
      'Tobillos: lectura izquierda y derecha',
      'Calibración del recorrido: pendiente',
    ],
  },
  {
    id: 'extensiones-maquina',
    name: 'Extensiones en máquina',
    muscleGroup: 'pierna',
    description: 'Extiende las piernas con control y mantén alineadas las rodillas y los tobillos.',
    angleLabel: 'Rodillas · tobillos',
    cameraNote: 'Nota: vista lateral; deja visibles ambas rodillas y ambos tobillos durante todo el recorrido.',
    trackedJoints: [
      { joint: 'knee', label: 'rodillas' },
      { joint: 'ankle', label: 'tobillos' },
    ],
    trackBothSides: true,
    trackedAngleLabels: [
      'Rodillas: lectura izquierda y derecha',
      'Tobillos: lectura izquierda y derecha',
      'Calibración del recorrido: pendiente',
    ],
  },
  {
    id: 'curl-femoral',
    name: 'Curl de femoral (Sentado o Tumbado)',
    muscleGroup: 'pierna',
    description: 'Flexiona las rodillas con control y mantén las caderas estables durante todo el recorrido.',
    angleLabel: 'Rodillas · tobillos',
    cameraNote: 'Nota: vista lateral; deja visibles ambas rodillas y ambos tobillos, tanto sentado como tumbado.',
    trackedJoints: [
      { joint: 'knee', label: 'rodillas' },
      { joint: 'ankle', label: 'tobillos' },
    ],
    trackBothSides: true,
    trackedAngleLabels: [
      'Rodillas: lectura izquierda y derecha',
      'Tobillos: lectura izquierda y derecha',
      'Recorrido inicial: rodilla 120–180° abajo · 30–90° arriba',
    ],
  },
  {
    id: 'elevacion-talones-pie',
    name: 'Elevación de talones de pie',
    muscleGroup: 'pierna',
    description: 'Eleva los talones con control sin perder la alineación del torso ni bloquear las rodillas.',
    angleLabel: 'Tobillos · rodillas · torso',
    cameraNote: 'Nota: vista lateral; deja visibles hombro, cadera, rodilla, tobillo y pie durante todo el movimiento.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombro' },
      { joint: 'hip', label: 'cadera' },
      { joint: 'knee', label: 'rodilla' },
      { joint: 'ankle', label: 'tobillo' },
      { joint: 'foot', label: 'pie' },
    ],
    trackedAngleLabels: [
      'Torso: alineación respecto a la vertical',
      'Rodilla: estabilidad durante la elevación',
      'Tobillo: elevación del talón',
      'Altura del talón: WORLD 3D normalizada · ≥0.25 arriba · ≤0.10 apoyado',
    ],
  },
  {
    id: 'maquina-aductores',
    name: 'Máquina de aductores',
    muscleGroup: 'pierna',
    description: 'Controla el movimiento de las piernas y mantén los tobillos visibles durante todo el recorrido.',
    angleLabel: 'Tobillos',
    cameraNote: 'Nota: vista frontal; deja visibles ambos tobillos y la máquina durante todo el ejercicio.',
    trackedJoints: [
      { joint: 'ankle', label: 'tobillos' },
    ],
    trackBothSides: true,
    trackedAngleLabels: [
      'Tobillos: lectura izquierda y derecha',
    ],
  },
  {
    id: 'hip-thrust-barra',
    name: 'Hip Thrust con barra',
    muscleGroup: 'pierna',
    description: 'Eleva la cadera con control, mantén los pies firmes y bloquea arriba sin hiperextender la espalda.',
    angleLabel: 'Cadera · rodillas · tobillos · brazos',
    cameraNote: 'Nota: vista lateral o en 3/4; deja visibles ambos brazos, ambas piernas, el banco y la barra.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombros' },
      { joint: 'elbow', label: 'codos' },
      { joint: 'wrist', label: 'muñecas' },
      { joint: 'hip', label: 'caderas' },
      { joint: 'knee', label: 'rodillas' },
      { joint: 'ankle', label: 'tobillos' },
    ],
    trackBothSides: true,
    trackedAngleLabels: [
      'Hombros, codos y muñecas: lectura izquierda y derecha',
      'Caderas, rodillas y tobillos: lectura izquierda y derecha',
      'Cadera: abajo 70–115° · arriba 150–180°',
    ],
  },
  {
    id: 'zancadas',
    name: 'Zancadas dinámicas',
    muscleGroup: 'pierna',
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
    muscleGroup: 'pierna',
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
    muscleGroup: 'abdomen',
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
  {
    id: 'crunch-invertido',
    name: 'Crunch invertido',
    muscleGroup: 'abdomen',
    description: 'Eleva la pelvis llevando las rodillas hacia el pecho con control, sin impulsarte ni despegar los hombros.',
    angleLabel: 'Cadera · rodillas · tobillos',
    cameraNote: 'Nota: vista lateral; deja visibles ambos tobillos, rodillas y cadera durante todo el recorrido.',
    trackedJoints: [
      { joint: 'hip', label: 'cadera' },
      { joint: 'knee', label: 'rodillas' },
      { joint: 'ankle', label: 'tobillos' },
    ],
    trackBothSides: true,
    trackedAngleLabels: [
      'Cadera: lectura izquierda y derecha',
      'Rodillas: lectura izquierda y derecha',
      'Tobillos: lectura izquierda y derecha',
      'Recorrido: elevación controlada de la pelvis',
    ],
  },
  {
    id: 'rueda-abdominal',
    name: 'Rueda abdominal',
    muscleGroup: 'abdomen',
    description: 'Desliza la rueda hacia delante con control y vuelve sin perder la alineación de la cabeza, los hombros y la cadera.',
    angleLabel: 'Cabeza · hombros · codos · muñecas · cadera · rodillas · tobillos',
    cameraNote: 'Nota: vista lateral o en 3/4; deja visibles la cabeza, ambos hombros, codos, muñecas, cadera, rodillas y tobillos durante todo el recorrido.',
    trackedJoints: [
      { joint: 'head', label: 'cabeza' },
      { joint: 'shoulder', label: 'hombros' },
      { joint: 'elbow', label: 'codos' },
      { joint: 'wrist', label: 'muñecas' },
      { joint: 'hip', label: 'cadera' },
      { joint: 'knee', label: 'rodillas' },
      { joint: 'ankle', label: 'tobillos' },
    ],
    trackBothSides: true,
    trackedAngleLabels: [
      'Cabeza: punto facial visible',
      'Hombros: lectura izquierda y derecha',
      'Codos: lectura izquierda y derecha',
      'Muñecas: lectura izquierda y derecha',
      'Cadera: lectura izquierda y derecha',
      'Rodillas: lectura izquierda y derecha',
      'Tobillos: lectura izquierda y derecha',
      'Recorrido: extensión y regreso con cadera alineada',
    ],
  },
  {
    id: 'elevaciones-piernas-barra',
    name: 'Elevaciones de piernas en barra',
    muscleGroup: 'abdomen',
    description: 'Eleva las piernas extendidas hasta la altura de la cadera sin balancearte y desciende con control.',
    angleLabel: 'Cadera · rodillas · tobillos · brazos',
    cameraNote: 'Nota: vista lateral o en 3/4; deja visibles la barra, todo el cuerpo y las extremidades completas. No hace falta mostrar la cara.',
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
    trackedAngleLabels: [
      'Hombros, codos y muñecas: lectura izquierda y derecha',
      'Caderas, rodillas y tobillos: lectura izquierda y derecha',
      'Pies: ambos dentro del encuadre',
      'Recorrido: piernas abajo hasta quedar paralelas al suelo',
      'Cara: no necesaria para iniciar ni contar',
    ],
  },
  {
    id: 'barra-reloj',
    name: 'Barra reloj',
    muscleGroup: 'abdomen',
    description: 'Cuelga de la barra y mueve las piernas con control siguiendo el recorrido del reloj, sin balancear el cuerpo.',
    angleLabel: 'Hombros · codos · muñecas · caderas · rodillas · tobillos · pies',
    cameraNote: 'Nota: vista lateral o en 3/4; deja visibles la barra, todo el cuerpo y las extremidades completas. No hace falta mostrar la cabeza.',
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
    trackedAngleLabels: [
      'Hombros, codos y muñecas: lectura izquierda y derecha',
      'Caderas, rodillas y tobillos: lectura izquierda y derecha',
      'Pies: ambos dentro del encuadre',
      'Recorrido: movimiento de piernas alrededor del eje de la barra',
      'Calibración del recorrido: pendiente',
      'Cabeza: no necesaria para iniciar ni contar',
    ],
  },
  {
    id: 'elevaciones-piernas-suelo',
    name: 'Elevaciones de piernas en suelo',
    muscleGroup: 'abdomen',
    description: 'Eleva las piernas desde el suelo con control, manteniendo las rodillas extendidas y la cadera estable.',
    angleLabel: 'Cadera · rodillas · tobillos',
    cameraNote: 'Nota: vista lateral; deja visibles ambos tobillos, rodillas y caderas durante todo el recorrido. No hace falta mostrar la cara.',
    trackedJoints: [
      { joint: 'hip', label: 'caderas' },
      { joint: 'knee', label: 'rodillas' },
      { joint: 'ankle', label: 'tobillos' },
    ],
    trackBothSides: true,
    trackedAngleLabels: [
      'Caderas: lectura izquierda y derecha',
      'Rodillas: lectura izquierda y derecha',
      'Tobillos: lectura izquierda y derecha',
      'Recorrido: piernas desde el suelo hasta la elevación controlada',
      'Cara: no necesaria para iniciar ni contar',
    ],
  },
  {
    id: 'press-pallof-polea-banda',
    name: 'Press Pallof con polea o banda',
    muscleGroup: 'abdomen',
    description: 'Extiende las manos al frente sin girar el torso y vuelve al pecho con control.',
    angleLabel: 'Hombros · codos · muñecas',
    cameraNote: 'Nota: vista frontal o en 3/4; deja visibles ambos hombros, codos y muñecas durante todo el recorrido.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombros' },
      { joint: 'elbow', label: 'codos' },
      { joint: 'wrist', label: 'muñecas' },
    ],
    trackBothSides: true,
    trackedAngleLabels: [
      'Hombros: lectura izquierda y derecha',
      'Codos: lectura izquierda y derecha',
      'Muñecas: lectura izquierda y derecha',
      'Recorrido: manos desde el pecho hasta la extensión y regreso',
    ],
  },
  {
    id: 'giros-rusos',
    name: 'Giros rusos',
    muscleGroup: 'abdomen',
    description: 'Mantén las piernas elevadas y rota el torso de lado a lado con control, sin perder la posición.',
    angleLabel: 'Hombros · codos · muñecas · caderas · rodillas · tobillos',
    cameraNote: 'Nota: vista lateral; deja visibles ambos brazos y ambas piernas durante todo el movimiento.',
    trackedJoints: [
      { joint: 'shoulder', label: 'hombros' },
      { joint: 'elbow', label: 'codos' },
      { joint: 'wrist', label: 'muñecas' },
      { joint: 'hip', label: 'caderas' },
      { joint: 'knee', label: 'rodillas' },
      { joint: 'ankle', label: 'tobillos' },
    ],
    trackBothSides: true,
    trackedAngleLabels: [
      'Hombros: lectura izquierda y derecha',
      'Codos: lectura izquierda y derecha',
      'Muñecas: lectura izquierda y derecha',
      'Caderas: lectura izquierda y derecha',
      'Rodillas: lectura izquierda y derecha',
      'Tobillos: lectura izquierda y derecha',
      'Recorrido: rotación controlada de lado a lado',
    ],
  },
];

const exerciseViewDefinitions: Record<ExerciseId, {
  recommendedView: ExerciseView;
  viewToleranceDeg?: number;
  uprightTorso?: boolean;
}> = {
  fondos: { recommendedView: 'side' },
  dominadas: { recommendedView: 'back' },
  'dominadas-supinas': { recommendedView: 'back' },
  'dominadas-comando': {
    recommendedView: 'back',
    viewToleranceDeg: VIEW_SEMIPROFILE_TOLERANCE_DEG,
  },
  'muscle-up': {
    recommendedView: 'side',
    viewToleranceDeg: VIEW_SEMIPROFILE_TOLERANCE_DEG,
  },
  jalon: { recommendedView: 'side', uprightTorso: true },
  'pull-over-polea-alta': { recommendedView: 'side' },
  'remo-barra': { recommendedView: 'side' },
  'remos-australianos-elevados': { recommendedView: 'side' },
  'remo-sentado-polea-agarre-cerrado': { recommendedView: 'side' },
  'remo-mancuerna-una-mano': { recommendedView: 'side' },
  'peso-muerto-rumano': { recommendedView: 'side' },
  'peso-muerto-piernas-rigidas': { recommendedView: 'side' },
  flexiones: { recommendedView: 'side' },
  'flexiones-declinadas': { recommendedView: 'side' },
  'flexiones-pica': { recommendedView: 'side' },
  'press-militar': { recommendedView: 'front', uprightTorso: true },
  'press-hombros-maquina': { recommendedView: 'front', uprightTorso: true },
  'elevaciones-laterales': { recommendedView: 'front', uprightTorso: true },
  'elevaciones-laterales-polea-baja': { recommendedView: 'front', uprightTorso: true },
  'pajaros-mancuernas': { recommendedView: 'front' },
  'face-pulls-polea-alta': { recommendedView: 'front', uprightTorso: true },
  'aperturas-inversas-maquina': { recommendedView: 'front' },
  'cruces-polea-baja-alta': { recommendedView: 'front', uprightTorso: true },
  'press-banca': { recommendedView: 'side' },
  'press-banca-agarre-cerrado': { recommendedView: 'side' },
  'press-banca-inclinado': { recommendedView: 'side' },
  'press-plano-mancuernas': { recommendedView: 'side' },
  'press-plano-inclinado': { recommendedView: 'side' },
  'triceps-polea-alta': { recommendedView: 'side', uprightTorso: true },
  'triceps-tras-nuca-polea-alta': { recommendedView: 'side' },
  'copa-mancuernas': { recommendedView: 'side' },
  'extension-horizontal-barra': { recommendedView: 'side' },
  'curl-biceps': { recommendedView: 'side', uprightTorso: true },
  'curl-inclinado-mancuernas': { recommendedView: 'side' },
  'curl-predicador': { recommendedView: 'front' },
  'curl-arana': { recommendedView: 'front' },
  'curl-martillo': { recommendedView: 'front', uprightTorso: true },
  'curl-inverso-barra': { recommendedView: 'front', uprightTorso: true },
  'curl-muneca-sentado': { recommendedView: 'side' },
  'rodillo-muneca': { recommendedView: 'side', uprightTorso: true },
  sentadillas: { recommendedView: 'side' },
  'prensa-piernas': { recommendedView: 'side' },
  'extensiones-maquina': { recommendedView: 'side' },
  'curl-femoral': { recommendedView: 'side' },
  'elevacion-talones-pie': { recommendedView: 'side', uprightTorso: true },
  'maquina-aductores': { recommendedView: 'front', uprightTorso: true },
  'hip-thrust-barra': { recommendedView: 'side' },
  zancadas: { recommendedView: 'side' },
  'zancada-banco': { recommendedView: 'side' },
  plancha: { recommendedView: 'side' },
  'crunch-invertido': { recommendedView: 'side' },
  'rueda-abdominal': { recommendedView: 'side' },
  'elevaciones-piernas-barra': {
    recommendedView: 'side',
    viewToleranceDeg: VIEW_SEMIPROFILE_TOLERANCE_DEG,
  },
  'barra-reloj': {
    recommendedView: 'side',
    viewToleranceDeg: VIEW_SEMIPROFILE_TOLERANCE_DEG,
  },
  'elevaciones-piernas-suelo': { recommendedView: 'side' },
  'press-pallof-polea-banda': { recommendedView: 'front', uprightTorso: true },
  // La nota de cámara dice lateral, pero las instrucciones de detección
  // permiten frontal/3/4; se deja sin restricción hasta validar la vista real.
  'giros-rusos': { recommendedView: 'any' },
};

exercises.forEach((exercise) => {
  Object.assign(exercise, exerciseViewDefinitions[exercise.id]);
});

const exerciseGroups = [
  {
    label: 'Pecho',
    exercises: exercises.filter((exercise) => exercise.muscleGroup === 'pecho'),
  },
  {
    label: 'Espalda',
    exercises: exercises.filter((exercise) => exercise.muscleGroup === 'espalda'),
  },
  {
    label: 'Hombros',
    exercises: exercises.filter((exercise) => exercise.muscleGroup === 'hombros'),
  },
  {
    label: 'Pierna',
    exercises: exercises.filter((exercise) => exercise.muscleGroup === 'pierna'),
  },
  {
    label: 'Tríceps',
    exercises: exercises.filter((exercise) => exercise.muscleGroup === 'triceps'),
  },
  {
    label: 'Abdomen',
    exercises: exercises.filter((exercise) => exercise.muscleGroup === 'abdomen'),
  },
  {
    label: 'Bíceps',
    exercises: exercises.filter((exercise) => exercise.muscleGroup === 'biceps'),
  },
  {
    label: 'Antebrazo',
    exercises: exercises.filter((exercise) => exercise.muscleGroup === 'antebrazo'),
  },
  {
    label: 'Por clasificar',
    exercises: exercises.filter((exercise) => !exercise.muscleGroup),
  },
].filter((group) => group.exercises.length > 0);

const SQUAT_VALID_MIN_ANGLE = 83;
const SQUAT_VALID_MAX_ANGLE = 90;
const SQUAT_TOP_THRESHOLD = 140;
const SQUAT_RISE_THRESHOLD = 115;
const SQUAT_MEANINGFUL_DESCENT = 30;
const SQUAT_SMOOTHING_SAMPLES = 5;
const ANGLE_DISPLAY_SAMPLES = 7;
const ANGLE_DISPLAY_INTERVAL_MS = 220;
const POSE_MODEL_LOAD_TIMEOUT_MS = 30000;
// Calibración de dominadas basada en las lecturas de la ejecución de referencia:
// abajo: codo extendido; arriba: codo flexionado.
// En la vista trasera del video, la extensión real se midió entre 130–180°.
// Se amplía el inicio válido para no convertir una lectura 3D comprimida en
// un falso "sin bloqueo".
const PULLUP_BOTTOM_MIN_ANGLE = 125;
const PULLUP_BOTTOM_MAX_ANGLE = 180;
const PULLUP_PULL_ACTIVATION_ANGLE = 120;
const PULLUP_NO_LOCKOUT_ANGLE = 155;
// La cabeza sobre las muñecas es la señal principal; el rango bilateral de
// codos aporta una confirmación secundaria cuando la cabeza pierde confianza.
const PULLUP_BOTTOM_SHOULDER_MIN_ANGLE = 125;
const PULLUP_TOP_SHOULDER_MIN_ANGLE = 70;
const PULLUP_TOP_SHOULDER_MAX_ANGLE = 125;
// En la ejecución de referencia, la parte alta llegó aproximadamente a
// 57–135° por lado. El rango acepta esa variación 3D sin exigir una postura
// idéntica en ambos brazos.
const PULLUP_TOP_ELBOW_MIN_ANGLE = 45;
const PULLUP_TOP_ELBOW_MAX_ANGLE = 145;
const PULLUP_TOLERANCE_DEG = 5;
const PULLUP_SMOOTHING_SAMPLES = 5;
const PULLUP_BOTTOM_STABLE_FRAMES = 3;
const PULLUP_BAR_DETACH_STABLE_FRAMES = 3;
const PULLUP_BAR_DETACH_SHOULDER_MARGIN_RATIO = 0.18;
const PULLUP_BAR_DETACH_MIN_SHOULDER_MARGIN_PX = 24;
const PULLUP_BODY_DETECTION_HOLD_MS = 5000;
const PULLUP_BAR_PREPARATION_COUNTDOWN_MS = 5000;
const PUSHUP_BODY_DETECTION_HOLD_MS = 5000;
const PUSHUP_PREPARATION_COUNTDOWN_MS = 5000;
const DIP_VALID_MIN_ANGLE = 85;
const DIP_VALID_MAX_ANGLE = 95;
// Calibración derivada del video de referencia del usuario:
// inicio con el codo flexionado y final con el brazo extendido arriba.
const MILITARY_PRESS_START_MIN_ANGLE = 130;
const MILITARY_PRESS_START_MAX_ANGLE = 145;
const MILITARY_PRESS_ACTIVATION_ANGLE = 145;
const MILITARY_PRESS_VALID_MIN_ANGLE = 150;
const MILITARY_PRESS_VALID_MAX_ANGLE = 170;
const MILITARY_PRESS_TOLERANCE = 3;
const MILITARY_PRESS_ACCEPTED_START_MIN_ANGLE =
  MILITARY_PRESS_START_MIN_ANGLE - MILITARY_PRESS_TOLERANCE;
const MILITARY_PRESS_ACCEPTED_START_MAX_ANGLE =
  MILITARY_PRESS_START_MAX_ANGLE + MILITARY_PRESS_TOLERANCE;
const MILITARY_PRESS_ACCEPTED_VALID_MIN_ANGLE =
  MILITARY_PRESS_VALID_MIN_ANGLE - MILITARY_PRESS_TOLERANCE;
const MILITARY_PRESS_ACCEPTED_VALID_MAX_ANGLE =
  MILITARY_PRESS_VALID_MAX_ANGLE + MILITARY_PRESS_TOLERANCE;
// Calibración del press de hombros en máquina a partir del video de referencia:
// hombro abajo: 70–112°; activación sobre 115°; hombro arriba: 125–160°.
const SHOULDER_MACHINE_PRESS_START_MIN_ANGLE = 70;
const SHOULDER_MACHINE_PRESS_START_MAX_ANGLE = 112;
const SHOULDER_MACHINE_PRESS_ACTIVATION_ANGLE = 115;
const SHOULDER_MACHINE_PRESS_END_MIN_ANGLE = 125;
const SHOULDER_MACHINE_PRESS_END_MAX_ANGLE = 160;
const SHOULDER_MACHINE_PRESS_MAX_SIDE_DIFFERENCE = 24;
const SHOULDER_MACHINE_PRESS_WRIST_MIN_ANGLE = 120;
const SHOULDER_MACHINE_PRESS_WRIST_MAX_ANGLE = 180;
const SHOULDER_MACHINE_PRESS_TOLERANCE = 3;
const SHOULDER_MACHINE_PRESS_ACCEPTED_START_MIN_ANGLE =
  SHOULDER_MACHINE_PRESS_START_MIN_ANGLE - SHOULDER_MACHINE_PRESS_TOLERANCE;
const SHOULDER_MACHINE_PRESS_ACCEPTED_START_MAX_ANGLE =
  SHOULDER_MACHINE_PRESS_START_MAX_ANGLE + SHOULDER_MACHINE_PRESS_TOLERANCE;
const SHOULDER_MACHINE_PRESS_ACCEPTED_END_MIN_ANGLE =
  SHOULDER_MACHINE_PRESS_END_MIN_ANGLE - SHOULDER_MACHINE_PRESS_TOLERANCE;
const SHOULDER_MACHINE_PRESS_ACCEPTED_END_MAX_ANGLE =
  SHOULDER_MACHINE_PRESS_END_MAX_ANGLE + SHOULDER_MACHINE_PRESS_TOLERANCE;
const SHOULDER_MACHINE_PRESS_ACCEPTED_MAX_SIDE_DIFFERENCE =
  SHOULDER_MACHINE_PRESS_MAX_SIDE_DIFFERENCE + SHOULDER_MACHINE_PRESS_TOLERANCE;
const SHOULDER_MACHINE_PRESS_ACCEPTED_WRIST_MIN_ANGLE =
  SHOULDER_MACHINE_PRESS_WRIST_MIN_ANGLE - SHOULDER_MACHINE_PRESS_TOLERANCE;
const SHOULDER_MACHINE_PRESS_ACCEPTED_WRIST_MAX_ANGLE =
  SHOULDER_MACHINE_PRESS_WRIST_MAX_ANGLE;
// Calibración base del press plano con mancuernas:
// arriba con ambos codos extendidos, descenso controlado y fondo entre 72–105°.
const DUMBBELL_PRESS_START_MIN_ANGLE = 150;
const DUMBBELL_PRESS_START_MAX_ANGLE = 180;
const DUMBBELL_PRESS_ACTIVATION_ANGLE = 135;
const DUMBBELL_PRESS_END_MIN_ANGLE = 72;
const DUMBBELL_PRESS_END_MAX_ANGLE = 105;
const DUMBBELL_PRESS_MAX_SIDE_DIFFERENCE = 20;
const LATERAL_RAISE_START_MIN_ANGLE = 0;
const LATERAL_RAISE_START_MAX_ANGLE = 40;
const LATERAL_RAISE_ACTIVATION_ANGLE = 55;
const LATERAL_RAISE_END_MIN_ANGLE = 75;
const LATERAL_RAISE_END_MAX_ANGLE = 110;
const DIP_TORSO_MIN_ANGLE = 30;
const DIP_TORSO_MAX_ANGLE = 40;
const PLANK_MAX_HIP_SAG_RATIO = 0.08;
const PLANK_MAX_HIP_RAISE_RATIO = 0.08;
const PLANK_MIN_BODY_LINE_ANGLE = 162;
const PLANK_ARM_FLOOR_MIN_ANGLE = 80;
const PLANK_ARM_FLOOR_MAX_ANGLE = 100;
const PLANK_ELBOW_MIN_ANGLE = 80;
const PLANK_ELBOW_MAX_ANGLE = 100;
// Calibración basada en la secuencia de referencia del usuario:
// inicio 134–148°, activación alrededor de 115° y punto bajo 62–94°.
const PULLDOWN_ANGLE_MIN = 60;
const PULLDOWN_ANGLE_MAX = 90;
const PULLDOWN_TORSO_MIN_ANGLE = 10;
const PULLDOWN_TORSO_MAX_ANGLE = 25;
const PULLDOWN_ELBOW_MIN_ANGLE = 85;
const PULLDOWN_ELBOW_MAX_ANGLE = 110;
// Este ángulo se calcula en el hombro (cadera–hombro–codo). En las sesiones
// laterales correctas observadas, la lectura puede quedar entre 68–77° aunque
// la línea corporal sea válida; mantenemos margen hasta 80° para no marcar
// como incorrecta una flexión bien ejecutada por la perspectiva 3D.
const PUSHUP_ELBOW_TORSO_MIN_ANGLE = 0;
const PUSHUP_ELBOW_TORSO_MAX_ANGLE = 70;
const PUSHUP_ELBOW_TORSO_TOLERANCE = 10;
const PUSHUP_BODY_LINE_MIN_ANGLE = 162;
const PUSHUP_BODY_LINE_MAX_ANGLE = 180;
const PUSHUP_PERSISTENT_HOLD_MAX_FRAMES = 2;
const PUSHUP_COUNT_STABLE_FRAMES = 2;
// Calibración del recorrido de flexiones a partir de la ejecución de referencia:
// se acepta el inicio observado con el codo parcialmente extendido, se activa
// al pasar de 120° y se considera fondo dentro de 70–105°.
const PUSHUP_REP_START_MIN_ANGLE = 110;
const PUSHUP_REP_START_MAX_ANGLE = 180;
const PUSHUP_REP_ACTIVATION_ANGLE = 120;
const PUSHUP_REP_END_MIN_ANGLE = 70;
const PUSHUP_REP_END_MAX_ANGLE = 105;
const PUSHUP_SMOOTHING_SAMPLES = 3;
const ROW_TORSO_MIN_ANGLE = 30;
const ROW_TORSO_MAX_ANGLE = 45;
const ROW_KNEE_MIN_ANGLE = 150;
const ROW_KNEE_MAX_ANGLE = 180;
const ROW_ELBOW_TORSO_MIN_ANGLE = 15;
const ROW_ELBOW_TORSO_MAX_ANGLE = 30;
const AUSTRALIAN_ROW_BODY_LINE_MIN_ANGLE = 160;
const AUSTRALIAN_ROW_BODY_LINE_MAX_ANGLE = 180;
const AUSTRALIAN_ROW_ELBOW_TORSO_MIN_ANGLE = 25;
const AUSTRALIAN_ROW_ELBOW_TORSO_MAX_ANGLE = 115;
const AUSTRALIAN_ROW_TORSO_MIN_LEAN = 65;
const AUSTRALIAN_ROW_TORSO_MAX_LEAN = 110;
const AUSTRALIAN_ROW_END_MIN_ANGLE = 70;
const AUSTRALIAN_ROW_END_MAX_ANGLE = 115;
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
const HIP_THRUST_BOTTOM_MIN_ANGLE = 70;
const HIP_THRUST_BOTTOM_MAX_ANGLE = 115;
const HIP_THRUST_ACTIVATION_ANGLE = 125;
const HIP_THRUST_TOP_MIN_ANGLE = 150;
const HIP_THRUST_TOP_MAX_ANGLE = 180;
const STIFF_LEG_DEADLIFT_START_MIN_ANGLE = 150;
const STIFF_LEG_DEADLIFT_START_MAX_ANGLE = 180;
const STIFF_LEG_DEADLIFT_ACTIVATION_ANGLE = 145;
const STIFF_LEG_DEADLIFT_END_MIN_ANGLE = 64;
const STIFF_LEG_DEADLIFT_END_MAX_ANGLE = 113;
const HAMSTRING_CURL_START_MIN_ANGLE = 120;
const HAMSTRING_CURL_START_MAX_ANGLE = 180;
const HAMSTRING_CURL_ACTIVATION_ANGLE = 110;
const HAMSTRING_CURL_END_MIN_ANGLE = 30;
const HAMSTRING_CURL_END_MAX_ANGLE = 90;
const WRIST_CURL_START_MIN_ANGLE = 135;
const WRIST_CURL_START_MAX_ANGLE = 180;
const WRIST_CURL_ACTIVATION_ANGLE = 125;
const WRIST_CURL_END_MIN_ANGLE = 70;
const WRIST_CURL_END_MAX_ANGLE = 115;
const PALLOF_START_MIN_ANGLE = 75;
const PALLOF_START_MAX_ANGLE = 125;
const PALLOF_ACTIVATION_ANGLE = 135;
const PALLOF_END_MIN_ANGLE = 150;
const PALLOF_END_MAX_ANGLE = 180;
const PALLOF_WRIST_MIN_ANGLE = 135;
const OVERHEAD_TRICEPS_SHOULDER_MIN_ANGLE = 145;
const OVERHEAD_TRICEPS_SHOULDER_MAX_ANGLE = 180;
const OVERHEAD_TRICEPS_WRIST_MIN_ANGLE = 135;
const HANGING_LEG_RAISE_START_MIN_ANGLE = 145;
const HANGING_LEG_RAISE_START_MAX_ANGLE = 180;
const HANGING_LEG_RAISE_ACTIVATION_ANGLE = 125;
const HANGING_LEG_RAISE_END_MIN_ANGLE = 70;
const HANGING_LEG_RAISE_END_MAX_ANGLE = 110;
const FLOOR_LEG_RAISE_START_MIN_ANGLE = 145;
const FLOOR_LEG_RAISE_START_MAX_ANGLE = 180;
const FLOOR_LEG_RAISE_ACTIVATION_ANGLE = 125;
const FLOOR_LEG_RAISE_END_MIN_ANGLE = 70;
const FLOOR_LEG_RAISE_END_MAX_ANGLE = 110;
const FACE_POINT_MIN_SCORE = 0.22;
const CAMERA_POINT_MIN_SCORE = 0.38;
// Umbral de confianza para usar talón y punta en lecturas derivadas.
const FOOT_POINT_MIN_SCORE = CAMERA_POINT_MIN_SCORE;
// Elevación normalizada talón-punta usada como histéresis de la elevación de talones.
const HEEL_RAISE_UP_RATIO = 0.25;
const HEEL_RAISE_DOWN_RATIO = 0.10;
// Solo se advierte por talón levantado durante un descenso si supera este ratio.
const HEEL_LIFT_WARN_RATIO = 0.20;
const SIDE_VIEW_MIN_CONFIDENCE_GAP = 0.16;
const SIDE_VIEW_MIN_VISIBLE_POINTS = 4;
const SIDE_VIEW_STABLE_FRAMES = 6;
const ROW_ARM_POINT_MIN_SCORE = 0.24;
const POSE_LOCK_MAX_CENTER_DISTANCE = 0.36;
const POSE_LOCK_MIN_AREA_RATIO = 0.1;
const MAX_FRONT_VIEW_RATIO = 0.95;
// Color de los landmarks retenidos para diferenciarlos de las mediciones frescas.
const HELD_POINT_COLOR = '#ffd166';
// Opacidad de los landmarks retenidos y de las líneas que dependen de ellos.
const HELD_POINT_ALPHA = 0.5;
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
const FOOT_HEEL_INDEX: Record<PoseSide, number> = {
  left: 29,
  right: 30,
};
const FOOT_OVERLAY_EXERCISES: ReadonlySet<ExerciseId> = new Set([
  'sentadillas',
  'prensa-piernas',
  'zancadas',
  'zancada-banco',
  'elevacion-talones-pie',
  'hip-thrust-barra',
]);
const FOOT_REFINEMENT_EXERCISES: ReadonlySet<ExerciseId> = new Set([
  'sentadillas',
  'prensa-piernas',
  'extensiones-maquina',
  'curl-femoral',
  'elevacion-talones-pie',
  'maquina-aductores',
  'zancadas',
  'zancada-banco',
  'peso-muerto-rumano',
  'peso-muerto-piernas-rigidas',
]);
const DEBUG_LIMB_TRACKING_ACTIVE = isLimbDebugTrackingEnabled();

type FootMeasurement = {
  ankleAngle: number | null;
  heelLiftRatio: number;
};

function isReliableFootPoint(point: PosePoint | undefined) {
  return Boolean(
    point
    && !isHeldPoint(point)
    && (point.score ?? 0) >= FOOT_POINT_MIN_SCORE
    && hasWorldCoordinates(point),
  );
}

function calculateFootMeasurement(
  keypoints: PosePoint[] | undefined,
  side: PoseSide,
): FootMeasurement | null {
  if (!keypoints) return null;
  const indexes = sideKeypoints[side];
  const ankle = keypoints[indexes.ankle];
  const knee = keypoints[indexes.knee];
  const heel = keypoints[FOOT_HEEL_INDEX[side]];
  const toe = keypoints[MUSCLE_UP_FOOT_INDEX[side]];
  if (
    !isReliableFootPoint(knee)
    || !isReliableFootPoint(ankle)
    || !isReliableFootPoint(heel)
    || !isReliableFootPoint(toe)
  ) {
    return null;
  }

  const heelCoordinates = getAngleMeasurementCoordinates(heel);
  const toeCoordinates = getAngleMeasurementCoordinates(toe);
  if (!heelCoordinates || !toeCoordinates) return null;
  const footLength = Math.hypot(
    heelCoordinates.x - toeCoordinates.x,
    heelCoordinates.y - toeCoordinates.y,
    heelCoordinates.z - toeCoordinates.z,
  );
  if (footLength < 0.01) return null;

  return {
    ankleAngle: calculateAngle(knee, ankle, toe),
    // En WORLD, Y crece hacia abajo: un talón más alto que la punta da un ratio positivo.
    heelLiftRatio: (toeCoordinates.y - heelCoordinates.y) / footLength,
  };
}

function getReliableFootMeasurements(
  keypoints: PosePoint[] | undefined,
  sides: PoseSide[],
) {
  return sides
    .map((side) => ({
      side,
      measurement: calculateFootMeasurement(keypoints, side),
    }))
    .filter((reading): reading is { side: PoseSide; measurement: FootMeasurement } => (
      reading.measurement !== null
    ));
}

function getHeelLiftWarning(
  exercise: ExerciseId,
  keypoints: PosePoint[] | undefined,
  dominantSide: PoseSide | null,
  squatPhase: SquatPhase,
  repetitionPhase: ExerciseRepPhase,
  previousAngle: number | null,
  currentAngle: number | null,
): TechniqueFeedback | null {
  if (
    exercise !== 'sentadillas'
    && exercise !== 'prensa-piernas'
    && exercise !== 'zancadas'
    && exercise !== 'zancada-banco'
  ) {
    return null;
  }

  const isAngleDescending = previousAngle !== null
    && currentAngle !== null
    && currentAngle < previousAngle - 0.75;
  const isDescending = exercise === 'sentadillas'
    ? squatPhase === 'bajando' || squatPhase === 'abajo'
    : exercise === 'zancadas' || exercise === 'zancada-banco'
      ? repetitionPhase === 'en movimiento'
      : isAngleDescending;
  if (!isDescending) return null;

  const sides = exercise === 'sentadillas' || exercise === 'prensa-piernas'
    ? (['left', 'right'] as PoseSide[])
    : dominantSide
      ? [dominantSide]
      : [];
  const readings = getReliableFootMeasurements(keypoints, sides);
  const lifted = readings
    .map(({ measurement }) => measurement.heelLiftRatio)
    .filter((ratio) => ratio > HEEL_LIFT_WARN_RATIO);
  if (!lifted.length) return null;

  const highestRatio = Math.max(...lifted);
  return {
    tone: 'warning',
    message: 'Mantén el talón apoyado',
    detail: `El talón se elevó ${Math.round(highestRatio * 100)}% durante el descenso. Apoya todo el pie antes de seguir bajando.`,
  };
}

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
    startMinAngle: 130,
    startMaxAngle: 155,
    activationAngle: 115,
    endMinAngle: PULLDOWN_ANGLE_MIN,
    endMaxAngle: PULLDOWN_ANGLE_MAX,
    endLabel: `ángulo cadera–hombro–codo entre ${PULLDOWN_ANGLE_MIN}–${PULLDOWN_ANGLE_MAX}°`,
    countOnReturn: true,
  },
  'pull-over-polea-alta': {
    direction: 'decrease',
    startMinAngle: 130,
    startMaxAngle: 180,
    activationAngle: 110,
    endMinAngle: 20,
    endMaxAngle: 80,
    endLabel: 'hombro entre 20–80° hacia la cadera',
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
  'remos-australianos-elevados': {
    direction: 'decrease',
    startMinAngle: 145,
    startMaxAngle: 180,
    activationAngle: 130,
    endMinAngle: AUSTRALIAN_ROW_END_MIN_ANGLE,
    endMaxAngle: AUSTRALIAN_ROW_END_MAX_ANGLE,
    endLabel: `codo entre ${AUSTRALIAN_ROW_END_MIN_ANGLE}–${AUSTRALIAN_ROW_END_MAX_ANGLE}°`,
  },
  flexiones: {
    direction: 'decrease',
    startMinAngle: PUSHUP_REP_START_MIN_ANGLE,
    startMaxAngle: PUSHUP_REP_START_MAX_ANGLE,
    activationAngle: PUSHUP_REP_ACTIVATION_ANGLE,
    endMinAngle: PUSHUP_REP_END_MIN_ANGLE,
    endMaxAngle: PUSHUP_REP_END_MAX_ANGLE,
    endLabel: `codo entre ${PUSHUP_REP_END_MIN_ANGLE}–${PUSHUP_REP_END_MAX_ANGLE}°`,
    countOnReturn: true,
    countOnlyWhenCorrect: false,
    techniqueStartsOnActivation: true,
    countReturnWithoutEndAsIncorrect: false,
    requireReturnPastActivation: true,
    rawAngleCanReachEnd: true,
    smoothingSamples: PUSHUP_SMOOTHING_SAMPLES,
    techniqueMustHoldThroughout: false,
  },
  'flexiones-declinadas': {
    direction: 'decrease',
    startMinAngle: PUSHUP_REP_START_MIN_ANGLE,
    startMaxAngle: PUSHUP_REP_START_MAX_ANGLE,
    activationAngle: PUSHUP_REP_ACTIVATION_ANGLE,
    endMinAngle: PUSHUP_REP_END_MIN_ANGLE,
    endMaxAngle: PUSHUP_REP_END_MAX_ANGLE,
    endLabel: `codo entre ${PUSHUP_REP_END_MIN_ANGLE}–${PUSHUP_REP_END_MAX_ANGLE}°`,
    countOnlyWhenCorrect: true,
  },
  'flexiones-pica': {
    direction: 'decrease',
    startMinAngle: 145,
    startMaxAngle: 180,
    activationAngle: 130,
    endMinAngle: 70,
    endMaxAngle: 110,
    endLabel: 'codo entre 70–110°',
    countOnlyWhenCorrect: true,
  },
  'press-militar': {
    direction: 'increase',
    startMinAngle: MILITARY_PRESS_ACCEPTED_START_MIN_ANGLE,
    startMaxAngle: MILITARY_PRESS_ACCEPTED_START_MAX_ANGLE,
    activationAngle: MILITARY_PRESS_ACTIVATION_ANGLE,
    endMinAngle: MILITARY_PRESS_ACCEPTED_VALID_MIN_ANGLE,
    endMaxAngle: MILITARY_PRESS_ACCEPTED_VALID_MAX_ANGLE,
    endLabel: `codo entre ${MILITARY_PRESS_ACCEPTED_VALID_MIN_ANGLE}–${MILITARY_PRESS_ACCEPTED_VALID_MAX_ANGLE}°`,
  },
  'press-hombros-maquina': {
    direction: 'increase',
    startMinAngle: SHOULDER_MACHINE_PRESS_ACCEPTED_START_MIN_ANGLE,
    startMaxAngle: SHOULDER_MACHINE_PRESS_ACCEPTED_START_MAX_ANGLE,
    activationAngle: SHOULDER_MACHINE_PRESS_ACTIVATION_ANGLE,
    endMinAngle: SHOULDER_MACHINE_PRESS_ACCEPTED_END_MIN_ANGLE,
    endMaxAngle: SHOULDER_MACHINE_PRESS_ACCEPTED_END_MAX_ANGLE,
    endLabel: `hombro entre ${SHOULDER_MACHINE_PRESS_ACCEPTED_END_MIN_ANGLE}–${SHOULDER_MACHINE_PRESS_ACCEPTED_END_MAX_ANGLE}°`,
  },
  'press-plano-mancuernas': {
    direction: 'decrease',
    startMinAngle: DUMBBELL_PRESS_START_MIN_ANGLE,
    startMaxAngle: DUMBBELL_PRESS_START_MAX_ANGLE,
    activationAngle: DUMBBELL_PRESS_ACTIVATION_ANGLE,
    endMinAngle: DUMBBELL_PRESS_END_MIN_ANGLE,
    endMaxAngle: DUMBBELL_PRESS_END_MAX_ANGLE,
    endLabel: `ambos codos entre ${DUMBBELL_PRESS_END_MIN_ANGLE}–${DUMBBELL_PRESS_END_MAX_ANGLE}°`,
  },
  'elevaciones-laterales': {
    direction: 'increase',
    startMinAngle: LATERAL_RAISE_START_MIN_ANGLE,
    startMaxAngle: LATERAL_RAISE_START_MAX_ANGLE,
    activationAngle: LATERAL_RAISE_ACTIVATION_ANGLE,
    endMinAngle: LATERAL_RAISE_END_MIN_ANGLE,
    endMaxAngle: LATERAL_RAISE_END_MAX_ANGLE,
    endLabel: `hombro entre ${LATERAL_RAISE_END_MIN_ANGLE}–${LATERAL_RAISE_END_MAX_ANGLE}°`,
  },
  'elevaciones-laterales-polea-baja': {
    direction: 'increase',
    startMinAngle: LATERAL_RAISE_START_MIN_ANGLE,
    startMaxAngle: LATERAL_RAISE_START_MAX_ANGLE,
    activationAngle: LATERAL_RAISE_ACTIVATION_ANGLE,
    endMinAngle: LATERAL_RAISE_END_MIN_ANGLE,
    endMaxAngle: LATERAL_RAISE_END_MAX_ANGLE,
    endLabel: `hombro entre ${LATERAL_RAISE_END_MIN_ANGLE}–${LATERAL_RAISE_END_MAX_ANGLE}°`,
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
  'triceps-tras-nuca-polea-alta': {
    direction: 'increase',
    startMinAngle: 70,
    startMaxAngle: 120,
    activationAngle: 135,
    endMinAngle: 145,
    endMaxAngle: 180,
    endLabel: 'extensión entre 145–180°',
  },
  'copa-mancuernas': {
    direction: 'decrease',
    startMinAngle: 145,
    startMaxAngle: 180,
    activationAngle: 135,
    endMinAngle: 70,
    endMaxAngle: 120,
    endLabel: 'flexión de codo entre 70–120°',
  },
  'press-banca-agarre-cerrado': {
    direction: 'decrease',
    startMinAngle: 150,
    startMaxAngle: 180,
    activationAngle: 135,
    endMinAngle: 70,
    endMaxAngle: 105,
    endLabel: 'flexión de codo entre 70–105°',
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
  'curl-inclinado-mancuernas': {
    direction: 'decrease',
    startMinAngle: 85,
    startMaxAngle: 135,
    activationAngle: 70,
    endMinAngle: 30,
    endMaxAngle: 60,
    endLabel: 'flexión entre 30–60°',
  },
  'curl-predicador': {
    direction: 'decrease',
    startMinAngle: 85,
    startMaxAngle: 135,
    activationAngle: 70,
    endMinAngle: 30,
    endMaxAngle: 60,
    endLabel: 'flexión entre 30–60°',
  },
  'curl-arana': {
    direction: 'decrease',
    startMinAngle: 85,
    startMaxAngle: 135,
    activationAngle: 70,
    endMinAngle: 30,
    endMaxAngle: 60,
    endLabel: 'flexión entre 30–60°',
  },
  'curl-martillo': {
    direction: 'decrease',
    startMinAngle: 85,
    startMaxAngle: 135,
    activationAngle: 70,
    endMinAngle: 30,
    endMaxAngle: 60,
    endLabel: 'flexión entre 30–60°',
  },
  'curl-inverso-barra': {
    direction: 'decrease',
    startMinAngle: 85,
    startMaxAngle: 135,
    activationAngle: 70,
    endMinAngle: 30,
    endMaxAngle: 60,
    endLabel: 'flexión de codo entre 30–60°',
  },
  'curl-muneca-sentado': {
    direction: 'decrease',
    startMinAngle: WRIST_CURL_START_MIN_ANGLE,
    startMaxAngle: WRIST_CURL_START_MAX_ANGLE,
    activationAngle: WRIST_CURL_ACTIVATION_ANGLE,
    endMinAngle: WRIST_CURL_END_MIN_ANGLE,
    endMaxAngle: WRIST_CURL_END_MAX_ANGLE,
    endLabel: `flexión de muñeca entre ${WRIST_CURL_END_MIN_ANGLE}–${WRIST_CURL_END_MAX_ANGLE}°`,
  },
  'rodillo-muneca': {
    direction: 'decrease',
    startMinAngle: WRIST_CURL_START_MIN_ANGLE,
    startMaxAngle: WRIST_CURL_START_MAX_ANGLE,
    activationAngle: WRIST_CURL_ACTIVATION_ANGLE,
    endMinAngle: WRIST_CURL_END_MIN_ANGLE,
    endMaxAngle: WRIST_CURL_END_MAX_ANGLE,
    endLabel: `flexión de muñeca entre ${WRIST_CURL_END_MIN_ANGLE}–${WRIST_CURL_END_MAX_ANGLE}°`,
  },
  'hip-thrust-barra': {
    direction: 'increase',
    startMinAngle: HIP_THRUST_BOTTOM_MIN_ANGLE,
    startMaxAngle: HIP_THRUST_BOTTOM_MAX_ANGLE,
    activationAngle: HIP_THRUST_ACTIVATION_ANGLE,
    endMinAngle: HIP_THRUST_TOP_MIN_ANGLE,
    endMaxAngle: HIP_THRUST_TOP_MAX_ANGLE,
    endLabel: `cadera entre ${HIP_THRUST_TOP_MIN_ANGLE}–${HIP_THRUST_TOP_MAX_ANGLE}°`,
  },
  'peso-muerto-piernas-rigidas': {
    direction: 'decrease',
    startMinAngle: STIFF_LEG_DEADLIFT_START_MIN_ANGLE,
    startMaxAngle: STIFF_LEG_DEADLIFT_START_MAX_ANGLE,
    activationAngle: STIFF_LEG_DEADLIFT_ACTIVATION_ANGLE,
    endMinAngle: STIFF_LEG_DEADLIFT_END_MIN_ANGLE,
    endMaxAngle: STIFF_LEG_DEADLIFT_END_MAX_ANGLE,
    endLabel: `cadera entre ${STIFF_LEG_DEADLIFT_END_MIN_ANGLE}–${STIFF_LEG_DEADLIFT_END_MAX_ANGLE}°`,
  },
  'curl-femoral': {
    direction: 'decrease',
    startMinAngle: HAMSTRING_CURL_START_MIN_ANGLE,
    startMaxAngle: HAMSTRING_CURL_START_MAX_ANGLE,
    activationAngle: HAMSTRING_CURL_ACTIVATION_ANGLE,
    endMinAngle: HAMSTRING_CURL_END_MIN_ANGLE,
    endMaxAngle: HAMSTRING_CURL_END_MAX_ANGLE,
    endLabel: `rodilla entre ${HAMSTRING_CURL_END_MIN_ANGLE}–${HAMSTRING_CURL_END_MAX_ANGLE}°`,
  },
  'press-pallof-polea-banda': {
    direction: 'increase',
    startMinAngle: PALLOF_START_MIN_ANGLE,
    startMaxAngle: PALLOF_START_MAX_ANGLE,
    activationAngle: PALLOF_ACTIVATION_ANGLE,
    endMinAngle: PALLOF_END_MIN_ANGLE,
    endMaxAngle: PALLOF_END_MAX_ANGLE,
    endLabel: `codo extendido entre ${PALLOF_END_MIN_ANGLE}–${PALLOF_END_MAX_ANGLE}°`,
    countOnReturn: true,
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
  'elevaciones-piernas-barra': {
    direction: 'decrease',
    startMinAngle: HANGING_LEG_RAISE_START_MIN_ANGLE,
    startMaxAngle: HANGING_LEG_RAISE_START_MAX_ANGLE,
    activationAngle: HANGING_LEG_RAISE_ACTIVATION_ANGLE,
    endMinAngle: HANGING_LEG_RAISE_END_MIN_ANGLE,
    endMaxAngle: HANGING_LEG_RAISE_END_MAX_ANGLE,
    endLabel: `cadera entre ${HANGING_LEG_RAISE_END_MIN_ANGLE}–${HANGING_LEG_RAISE_END_MAX_ANGLE}°`,
  },
  'elevaciones-piernas-suelo': {
    direction: 'decrease',
    startMinAngle: FLOOR_LEG_RAISE_START_MIN_ANGLE,
    startMaxAngle: FLOOR_LEG_RAISE_START_MAX_ANGLE,
    activationAngle: FLOOR_LEG_RAISE_ACTIVATION_ANGLE,
    endMinAngle: FLOOR_LEG_RAISE_END_MIN_ANGLE,
    endMaxAngle: FLOOR_LEG_RAISE_END_MAX_ANGLE,
    endLabel: `cadera entre ${FLOOR_LEG_RAISE_END_MIN_ANGLE}–${FLOOR_LEG_RAISE_END_MAX_ANGLE}°`,
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
    currentRepCorrect: false,
  };
}

function isWithinAngle(angle: number, min: number, max: number) {
  return angle >= min && angle <= max;
}

function isWithinPullupAngle(angle: number, min: number, max: number) {
  return isWithinAngle(
    angle,
    Math.max(0, min - PULLUP_TOLERANCE_DEG),
    Math.min(180, max + PULLUP_TOLERANCE_DEG),
  );
}

function advanceExerciseRepTracker(
  tracker: ExerciseRepTracker,
  rawAngle: number,
  config: ExerciseRepConfig,
  techniqueValid = true,
): ExerciseRepTrackerUpdate {
  const samples = [...tracker.samples, rawAngle].slice(
    -(config.smoothingSamples ?? SQUAT_SMOOTHING_SAMPLES),
  );
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
  const smoothedHasActivated = config.direction === 'decrease'
    ? smoothedAngle < config.activationAngle
    : smoothedAngle > config.activationAngle;
  const rawHasActivated = config.rawAngleCanReachEnd && (
    config.direction === 'decrease'
      ? rawAngle < config.activationAngle
      : rawAngle > config.activationAngle
  );
  const rawIsAtEnd = config.rawAngleCanReachEnd && isWithinAngle(
    rawAngle,
    config.endMinAngle,
    config.endMaxAngle,
  );
  const hasActivated = smoothedHasActivated || rawHasActivated;
  const isAtEnd = config.rawAngleCanReachEnd
    ? rawIsAtEnd
    : isWithinAngle(
        smoothedAngle,
        config.endMinAngle,
        config.endMaxAngle,
      );
  let completedEndpointAngle: number | null = null;

  if (nextTracker.phase === 'esperando inicio') {
    if (isAtStart) {
      nextTracker.phase = 'inicio';
      nextTracker.endpointAngle = null;
      nextTracker.currentRepCorrect = config.techniqueStartsOnActivation
        ? true
        : techniqueValid;
    }
  } else if (nextTracker.phase === 'inicio') {
    if (hasActivated) {
      nextTracker.phase = rawIsAtEnd ? 'final' : 'en movimiento';
      nextTracker.endpointAngle = rawIsAtEnd ? rawAngle : smoothedAngle;
      nextTracker.currentRepCorrect = config.techniqueStartsOnActivation
        ? techniqueValid
        : nextTracker.currentRepCorrect && techniqueValid;
      if (rawIsAtEnd) {
        completedEndpointAngle = rawAngle;
      }
    } else if (!isAtStart) {
      nextTracker.phase = 'esperando inicio';
      nextTracker.currentRepCorrect = false;
    }
  } else if (nextTracker.phase === 'en movimiento') {
    if (config.techniqueMustHoldThroughout !== false) {
      nextTracker.currentRepCorrect = nextTracker.currentRepCorrect && techniqueValid;
    }
    const endpointReading = config.rawAngleCanReachEnd ? rawAngle : smoothedAngle;
    nextTracker.endpointAngle = config.direction === 'decrease'
      ? Math.min(nextTracker.endpointAngle ?? endpointReading, endpointReading)
      : Math.max(nextTracker.endpointAngle ?? endpointReading, endpointReading);

    if (isAtEnd) {
      nextTracker.phase = 'final';
      // Una lectura intermedia aislada puede perder un punto mientras el
      // cuerpo sigue visible. Para flexiones de video se evalúa la técnica en
      // el fondo y al regresar, no se invalida toda la repetición por ese
      // único frame.
      nextTracker.currentRepCorrect = nextTracker.currentRepCorrect
        && (config.techniqueMustHoldThroughout === false || techniqueValid);
      completedEndpointAngle = nextTracker.endpointAngle;
      if (!config.countOnReturn) {
        if (config.countOnlyWhenCorrect !== true || nextTracker.currentRepCorrect) {
          nextTracker.event = 'valid';
          nextTracker.repetitions += 1;
          if (nextTracker.currentRepCorrect) {
            nextTracker.goodRepetitions += 1;
          }
        }
      }
    } else if (isAtStart) {
      const lastObservedEndpointAngle = nextTracker.endpointAngle;
      nextTracker.phase = 'inicio';
      nextTracker.endpointAngle = null;
      nextTracker.currentRepCorrect = config.techniqueStartsOnActivation
        ? true
        : techniqueValid;
      if (config.countReturnWithoutEndAsIncorrect) {
        nextTracker.event = 'valid';
        nextTracker.repetitions += 1;
        completedEndpointAngle = lastObservedEndpointAngle;
      }
    }
  } else if (nextTracker.phase === 'final') {
    if (config.countOnReturn) {
      if (
        config.techniqueStartsOnActivation
        && config.techniqueMustHoldThroughout !== false
      ) {
        nextTracker.currentRepCorrect = nextTracker.currentRepCorrect && techniqueValid;
      }
      const hasReturnedFromEnd = config.direction === 'decrease'
        ? smoothedAngle > config.endMaxAngle
        : smoothedAngle < config.endMinAngle;
      const hasReturnedPastActivation = config.direction === 'decrease'
        ? smoothedAngle >= config.activationAngle
        : smoothedAngle <= config.activationAngle;
      const requiresReturnPastActivation = config.requireReturnPastActivation === true
        || config.countReturnWithoutEndAsIncorrect === true;

      if (
        hasReturnedFromEnd
        && isAtStart
        && (
          !requiresReturnPastActivation
          || hasReturnedPastActivation
        )
      ) {
        const repetitionWasCorrect = nextTracker.currentRepCorrect && techniqueValid;
        nextTracker.phase = 'inicio';
        if (config.countOnlyWhenCorrect === true && !repetitionWasCorrect) {
          nextTracker.currentRepCorrect = techniqueValid;
          nextTracker.endpointAngle = null;
          completedEndpointAngle = null;
        } else {
          nextTracker.event = 'valid';
          nextTracker.repetitions += 1;
          if (repetitionWasCorrect) {
            nextTracker.goodRepetitions += 1;
          }
            nextTracker.currentRepCorrect = config.techniqueStartsOnActivation
              ? true
              : techniqueValid;
          completedEndpointAngle = nextTracker.endpointAngle;
        }
      }
    } else if (isAtStart) {
      nextTracker.phase = 'inicio';
      if (config.techniqueStartsOnActivation) {
        nextTracker.currentRepCorrect = true;
      }
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
    case 'prensa-piernas':
      return [
        'Lecturas en vivo: rodillas y tobillos',
        'Se muestran ambos lados para comparar el movimiento',
        'Calibración del recorrido: pendiente',
      ];
    case 'extensiones-maquina':
      return [
        'Lecturas en vivo: rodillas y tobillos',
        'Se muestran ambos lados para comparar el movimiento',
        'Calibración del recorrido: pendiente',
      ];
    case 'curl-femoral':
      return [
        'Lecturas en vivo: rodillas y tobillos',
        'Se muestran ambos lados para comparar el movimiento',
        `Recorrido inicial: rodilla ${HAMSTRING_CURL_START_MIN_ANGLE}–${HAMSTRING_CURL_START_MAX_ANGLE}° abajo y ${HAMSTRING_CURL_END_MIN_ANGLE}–${HAMSTRING_CURL_END_MAX_ANGLE}° arriba`,
      ];
    case 'elevacion-talones-pie':
      return [
        'Lecturas en vivo: tobillo, rodilla y torso',
        'Vista lateral para seguir la elevación del talón',
        'Mantén las rodillas estables y el torso alineado durante todo el movimiento',
      ];
    case 'maquina-aductores':
      return [
        'Lecturas en vivo: tobillos izquierdo y derecho',
        'Vista frontal para mantener ambos tobillos visibles',
        'No se muestran lecturas de caderas, rodillas ni torso',
      ];
    case 'hip-thrust-barra':
      return [
        'Lecturas en vivo: hombros, codos, muñecas, caderas, rodillas y tobillos',
        'Se muestran ambos lados para revisar todas las extremidades',
        `Recorrido: cadera ${HIP_THRUST_BOTTOM_MIN_ANGLE}–${HIP_THRUST_BOTTOM_MAX_ANGLE}° abajo y ${HIP_THRUST_TOP_MIN_ANGLE}–${HIP_THRUST_TOP_MAX_ANGLE}° arriba`,
      ];
    case 'peso-muerto-rumano':
      return [
        'Lecturas en vivo: hombros, codos, muñecas, caderas, rodillas y tobillos',
        'Se muestran ambos lados para revisar la simetría',
        'Calibración del recorrido: pendiente',
      ];
    case 'peso-muerto-piernas-rigidas':
      return [
        'Lecturas en vivo: hombros, codos, muñecas, caderas, rodillas y tobillos',
        'Se muestran ambos lados para revisar la simetría',
        `Inicio / regreso: cadera ${STIFF_LEG_DEADLIFT_START_MIN_ANGLE}–${STIFF_LEG_DEADLIFT_START_MAX_ANGLE}° · final ${STIFF_LEG_DEADLIFT_END_MIN_ANGLE}–${STIFF_LEG_DEADLIFT_END_MAX_ANGLE}°`,
      ];
    case 'dominadas':
    case 'dominadas-supinas':
      return [
        `Inicio / regreso: codo ${PULLUP_BOTTOM_MIN_ANGLE}–${PULLUP_BOTTOM_MAX_ANGLE}° · tolerancia ±${PULLUP_TOLERANCE_DEG}°`,
        `Activación: codo ≤${PULLUP_PULL_ACTIVATION_ANGLE}°`,
        'Parte alta: cabeza sobre ambas muñecas',
      ];
    case 'dominadas-comando':
      return [
        'Lecturas en vivo: hombros, codos y muñecas izquierda y derecha',
        'Cabeza: posición respecto a las muñecas',
        'Agarre comando y recorrido: pendiente de calibración',
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
    case 'remos-australianos-elevados':
      return [
        `Inicio / regreso: codo ${repetitionConfigs['remos-australianos-elevados']?.startMinAngle}–${repetitionConfigs['remos-australianos-elevados']?.startMaxAngle}°`,
        `Final: flexión de codo ${AUSTRALIAN_ROW_END_MIN_ANGLE}–${AUSTRALIAN_ROW_END_MAX_ANGLE}°`,
        `Línea corporal ${AUSTRALIAN_ROW_BODY_LINE_MIN_ANGLE}–${AUSTRALIAN_ROW_BODY_LINE_MAX_ANGLE}°`,
        `Codos respecto al torso ${AUSTRALIAN_ROW_ELBOW_TORSO_MIN_ANGLE}–${AUSTRALIAN_ROW_ELBOW_TORSO_MAX_ANGLE}°`,
      ];
    case 'remo-sentado-polea-agarre-cerrado':
      return [
        'Lecturas en vivo: hombros, codos y muñecas',
        'Se muestran ambos lados para revisar la simetría',
        'Torso estable y agarre cerrado hacia el abdomen',
        'Calibración del recorrido: pendiente',
      ];
    case 'remo-mancuerna-una-mano':
      return [
        'Lecturas en vivo: hombro, codo, cadera y muñeca',
        'Se sigue el lado más visible que trabaja',
        'Torso estable con apoyo en el banco',
        'Calibración del recorrido: pendiente',
      ];
    case 'flexiones':
      return [
        `Inicio / regreso: codo ${PUSHUP_REP_START_MIN_ANGLE}–${PUSHUP_REP_START_MAX_ANGLE}°`,
        `Final: codo ${PUSHUP_REP_END_MIN_ANGLE}–${PUSHUP_REP_END_MAX_ANGLE}°`,
        `Codo / torso ${PUSHUP_ELBOW_TORSO_MIN_ANGLE}–${PUSHUP_ELBOW_TORSO_MAX_ANGLE + PUSHUP_ELBOW_TORSO_TOLERANCE}° · cuerpo ${PUSHUP_BODY_LINE_MIN_ANGLE}–${PUSHUP_BODY_LINE_MAX_ANGLE}°`,
      ];
    case 'flexiones-declinadas':
      return [
        `Inicio / regreso: codo ${PUSHUP_REP_START_MIN_ANGLE}–${PUSHUP_REP_START_MAX_ANGLE}°`,
        `Final: codo ${PUSHUP_REP_END_MIN_ANGLE}–${PUSHUP_REP_END_MAX_ANGLE}°`,
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
        `Inicio / regreso: codo ${MILITARY_PRESS_ACCEPTED_START_MIN_ANGLE}–${MILITARY_PRESS_ACCEPTED_START_MAX_ANGLE}° (±${MILITARY_PRESS_TOLERANCE}°)`,
        `Activación: codo >${MILITARY_PRESS_ACTIVATION_ANGLE}°`,
        `Final: codo ${MILITARY_PRESS_ACCEPTED_VALID_MIN_ANGLE}–${MILITARY_PRESS_ACCEPTED_VALID_MAX_ANGLE}° (±${MILITARY_PRESS_TOLERANCE}°)`,
        'Codos aproximadamente 45° respecto al torso',
      ];
    case 'press-hombros-maquina':
      return [
        `Inicio / regreso: hombro ${SHOULDER_MACHINE_PRESS_ACCEPTED_START_MIN_ANGLE}–${SHOULDER_MACHINE_PRESS_ACCEPTED_START_MAX_ANGLE}° (±${SHOULDER_MACHINE_PRESS_TOLERANCE}°)`,
        `Activación: hombro >${SHOULDER_MACHINE_PRESS_ACTIVATION_ANGLE}°`,
        `Final: hombro ${SHOULDER_MACHINE_PRESS_ACCEPTED_END_MIN_ANGLE}–${SHOULDER_MACHINE_PRESS_ACCEPTED_END_MAX_ANGLE}° (±${SHOULDER_MACHINE_PRESS_TOLERANCE}°)`,
        `Simetría: diferencia máxima de ${SHOULDER_MACHINE_PRESS_ACCEPTED_MAX_SIDE_DIFFERENCE}° entre lados`,
        'Lecturas prioritarias: hombros, codos y muñecas de ambos lados',
        `Muñecas alineadas: ${SHOULDER_MACHINE_PRESS_ACCEPTED_WRIST_MIN_ANGLE}–${SHOULDER_MACHINE_PRESS_ACCEPTED_WRIST_MAX_ANGLE}° (±${SHOULDER_MACHINE_PRESS_TOLERANCE}°)`,
      ];
    case 'press-plano-mancuernas':
      return [
        `Inicio / regreso: ambos codos ${DUMBBELL_PRESS_START_MIN_ANGLE}–${DUMBBELL_PRESS_START_MAX_ANGLE}°`,
        `Activación: promedio de codos <${DUMBBELL_PRESS_ACTIVATION_ANGLE}°`,
        `Final: ambos codos ${DUMBBELL_PRESS_END_MIN_ANGLE}–${DUMBBELL_PRESS_END_MAX_ANGLE}°`,
        `Simetría: diferencia máxima de ${DUMBBELL_PRESS_MAX_SIDE_DIFFERENCE}° entre lados`,
      ];
    case 'press-pallof-polea-banda':
      return [
        `Inicio / regreso: codos ${PALLOF_START_MIN_ANGLE}–${PALLOF_START_MAX_ANGLE}°`,
        `Extensión: codos ${PALLOF_END_MIN_ANGLE}–${PALLOF_END_MAX_ANGLE}°`,
        'Lecturas bilaterales: hombros, codos y muñecas',
      ];
    case 'elevaciones-laterales':
    case 'elevaciones-laterales-polea-baja':
      return [
        `Inicio / regreso: hombro ${LATERAL_RAISE_START_MIN_ANGLE}–${LATERAL_RAISE_START_MAX_ANGLE}°`,
        `Activación: hombro >${LATERAL_RAISE_ACTIVATION_ANGLE}°`,
        `Final: hombro ${LATERAL_RAISE_END_MIN_ANGLE}–${LATERAL_RAISE_END_MAX_ANGLE}°`,
        'Lecturas bilaterales: hombros, codos y muñecas',
      ];
    case 'cruces-polea-baja-alta':
      return [
        'Lecturas en vivo: hombros, codos y muñecas',
        'Se muestran ambos lados para comparar el movimiento',
        'Calibración del recorrido: pendiente',
      ];
    case 'press-banca':
      return [
        'Lecturas en vivo: hombros, codos, muñecas y caderas',
        'Se muestran ambos lados para comparar el movimiento',
        'Calibración del recorrido: pendiente',
      ];
    case 'press-banca-agarre-cerrado':
      return [
        'Lecturas en vivo: hombros, codos y muñecas',
        'Se muestran ambos lados para comparar el movimiento',
        'Inicio / regreso: codo 150–180°',
        'Final: codo 70–105° con agarre cerrado',
      ];
    case 'pull-over-polea-alta':
      return [
        'Lecturas en vivo: hombros, codos, caderas y muñecas',
        'Se muestran ambos lados para comparar el movimiento',
        'Inicio: hombro 130–180° con brazos elevados',
        'Final: hombro 20–80° llevando la barra hacia la cadera',
        'Codos extendidos y muñecas alineadas',
      ];
    case 'press-banca-inclinado':
      return [
        'Lecturas en vivo: hombros, codos y muñecas',
        'Se muestran ambos lados para comparar el movimiento',
        'Calibración del recorrido: pendiente',
      ];
    case 'press-plano-inclinado':
      return [
        'Lecturas en vivo: hombros, codos y muñecas',
        'Se muestran ambos lados para comparar el movimiento',
        'Calibración del recorrido: pendiente',
      ];
    case 'triceps-polea-alta':
      return [
        'Inicio: codo 70–120°',
        'Activación: extensión >135°',
        'Final / extensión: codo 145–180°',
      ];
    case 'triceps-tras-nuca-polea-alta':
      return [
        `Hombro elevado: ${OVERHEAD_TRICEPS_SHOULDER_MIN_ANGLE}–${OVERHEAD_TRICEPS_SHOULDER_MAX_ANGLE}°`,
        'Inicio: codo 70–120°',
        'Final / extensión: codo 145–180°',
        'Muñeca alineada con el antebrazo',
      ];
    case 'copa-mancuernas':
      return [
        'Hombros: brazos elevados por encima de la cabeza',
        'Inicio / regreso: codo 145–180°',
        'Activación: flexión <135°',
        'Final: codo 70–120°',
        'Muñecas alineadas con los antebrazos',
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
    case 'curl-inclinado-mancuernas':
      return [
        'Lecturas en vivo: hombros, codos y muñecas izquierda y derecha',
        'Inicio / regreso: codos 85–135°',
        'Activación: flexión <70°',
        'Final: codos 30–60°',
        'Hombros y espalda apoyados en el banco inclinado',
      ];
    case 'curl-predicador':
      return [
        'Lecturas en vivo: hombros, codos y muñecas izquierda y derecha',
        'Inicio / regreso: codos 85–135°',
        'Activación: flexión <70°',
        'Final: codos 30–60°',
        'Brazos apoyados en el banco predicador',
      ];
    case 'curl-arana':
      return [
        'Lecturas en vivo: hombros, codos y muñecas izquierda y derecha',
        'Inicio / regreso: codos 85–135°',
        'Activación: flexión <70°',
        'Final: codos 30–60°',
        'Pecho apoyado y brazos colgando del banco inclinado',
      ];
    case 'curl-martillo':
      return [
        'Lecturas en vivo: hombros, codos y muñecas izquierda y derecha',
        'Inicio / regreso: codos 85–135°',
        'Activación: flexión <70°',
        'Final: codos 30–60°',
        'Agarre neutro y muñecas alineadas',
      ];
    case 'curl-inverso-barra':
      return [
        'Inicio / regreso: codos 85–135°',
        'Activación: flexión <70°',
        'Final: codos 30–60°',
        'Hombros estables y muñecas alineadas con los antebrazos',
      ];
    case 'curl-muneca-sentado':
      return [
        `Inicio / regreso: muñecas ${WRIST_CURL_START_MIN_ANGLE}–${WRIST_CURL_START_MAX_ANGLE}°`,
        `Activación: flexión <${WRIST_CURL_ACTIVATION_ANGLE}°`,
        `Final: muñecas ${WRIST_CURL_END_MIN_ANGLE}–${WRIST_CURL_END_MAX_ANGLE}°`,
        'Hombros y codos estables con los antebrazos apoyados',
      ];
    case 'rodillo-muneca':
      return [
        `Inicio / regreso: muñecas ${WRIST_CURL_START_MIN_ANGLE}–${WRIST_CURL_START_MAX_ANGLE}°`,
        `Activación: flexión <${WRIST_CURL_ACTIVATION_ANGLE}°`,
        `Final: muñecas ${WRIST_CURL_END_MIN_ANGLE}–${WRIST_CURL_END_MAX_ANGLE}°`,
        'Hombros y codos estables mientras sube y baja la carga',
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
    case 'crunch-invertido':
      return [
        'Lecturas en vivo: cadera, rodillas y tobillos',
        'Se muestran ambos lados para comparar el movimiento',
        'Calibración del recorrido: pendiente',
      ];
    case 'rueda-abdominal':
      return [
        'Lecturas en vivo: cadera, rodillas y tobillos',
        'Se muestran ambos lados para comparar el movimiento',
        'Calibración del recorrido: pendiente',
      ];
    case 'elevaciones-piernas-barra':
      return [
        `Inicio / regreso: cadera ${HANGING_LEG_RAISE_START_MIN_ANGLE}–${HANGING_LEG_RAISE_START_MAX_ANGLE}°`,
        `Activación: cadera <${HANGING_LEG_RAISE_ACTIVATION_ANGLE}°`,
        `Final: cadera ${HANGING_LEG_RAISE_END_MIN_ANGLE}–${HANGING_LEG_RAISE_END_MAX_ANGLE}°`,
        'Cuerpo completo y extremidades visibles; la cara no es necesaria',
      ];
    case 'barra-reloj':
      return [
        'Lecturas en vivo: hombros, codos, muñecas, caderas, rodillas y tobillos de ambos lados',
        'Pies completos dentro del encuadre',
        'Cuerpo completo y extremidades visibles; la cabeza no interviene',
        'Calibración del recorrido del reloj: pendiente',
      ];
    case 'elevaciones-piernas-suelo':
      return [
        `Inicio / regreso: cadera ${FLOOR_LEG_RAISE_START_MIN_ANGLE}–${FLOOR_LEG_RAISE_START_MAX_ANGLE}°`,
        `Activación: cadera <${FLOOR_LEG_RAISE_ACTIVATION_ANGLE}°`,
        `Final: cadera ${FLOOR_LEG_RAISE_END_MIN_ANGLE}–${FLOOR_LEG_RAISE_END_MAX_ANGLE}°`,
        'Lecturas en vivo: cadera, rodillas y tobillos de ambos lados',
        'La cara no es necesaria para iniciar ni contar',
      ];
    case 'giros-rusos':
      return [
        'Lecturas en vivo: hombros, codos, muñecas, caderas, rodillas y tobillos',
        'Se muestran ambos lados para comprobar todas las extremidades',
        'Calibración del recorrido de rotación: pendiente',
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
    currentRepCorrect: false,
    bottomReadyFrames: 0,
    isArmed: false,
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
  isAtBottom: boolean;
  hasReachedTop: boolean;
};

type PullupExtremityValidation = {
  atBottom: boolean;
  atTop: boolean;
};

type PullupExtremityReadings = {
  left: {
    shoulder: number | null;
    elbow: number | null;
  };
  right: {
    shoulder: number | null;
    elbow: number | null;
  };
};

function getPullupExtremityReadings(
  keypoints: PosePoint[] | undefined,
): PullupExtremityReadings {
  if (!keypoints) {
    return {
      left: { shoulder: null, elbow: null },
      right: { shoulder: null, elbow: null },
    };
  }

  const sideReadings = (side: PoseSide) => {
    const indexes = sideKeypoints[side];
    return {
      shoulder: calculateAngle(
        keypoints[indexes.hip],
        keypoints[indexes.shoulder],
        keypoints[indexes.elbow],
      ),
      elbow: calculateAngle(
        keypoints[indexes.shoulder],
        keypoints[indexes.elbow],
        keypoints[indexes.wrist],
      ),
    };
  };

  const [left, right] = (['left', 'right'] as PoseSide[]).map(sideReadings);
  return { left, right };
}

function getPullupExtremityValidation(
  keypoints: PosePoint[] | undefined,
  extremityReadings = getPullupExtremityReadings(keypoints),
): PullupExtremityValidation {
  const allElbowsInRange = (min: number, max: number) => (
    [extremityReadings.left, extremityReadings.right].every((reading) => {
      const value = reading.elbow;
      return value !== null && isWithinPullupAngle(value, min, max);
    })
  );

  return {
    atBottom: allElbowsInRange(PULLUP_BOTTOM_MIN_ANGLE, PULLUP_BOTTOM_MAX_ANGLE),
    atTop: allElbowsInRange(PULLUP_TOP_ELBOW_MIN_ANGLE, PULLUP_TOP_ELBOW_MAX_ANGLE),
  };
}

function advancePullupTracker(
  tracker: PullupTracker,
  rawAngle: number,
  topReached: boolean,
  extremities: PullupExtremityValidation,
): PullupTrackerUpdate {
  const samples = [...tracker.samples, rawAngle].slice(-PULLUP_SMOOTHING_SAMPLES);
  const smoothedAngle = median(samples);
  if (smoothedAngle === null) {
    return {
      tracker,
      smoothedAngle: rawAngle,
      completedMinimumAngle: null,
      isAtBottom: false,
      hasReachedTop: false,
    };
  }

  const nextTracker: PullupTracker = {
    ...tracker,
    samples,
    event: null,
    lastAngle: smoothedAngle,
  };
  const isAtBottom = extremities.atBottom
    && isWithinPullupAngle(smoothedAngle, PULLUP_BOTTOM_MIN_ANGLE, PULLUP_BOTTOM_MAX_ANGLE);
  const isAtBottomByAngle = isWithinPullupAngle(
    smoothedAngle,
    PULLUP_BOTTOM_MIN_ANGLE,
    PULLUP_BOTTOM_MAX_ANGLE,
  );
  const hasStartedPull = smoothedAngle <= PULLUP_PULL_ACTIVATION_ANGLE;
  const hasReachedTop = topReached;
  const isRising = tracker.lastAngle !== null && smoothedAngle < tracker.lastAngle - 3;
  let completedMinimumAngle: number | null = null;

  if (!nextTracker.isArmed) {
    nextTracker.bottomReadyFrames = isAtBottom
      ? tracker.bottomReadyFrames + 1
      : 0;
    if (nextTracker.bottomReadyFrames >= PULLUP_BOTTOM_STABLE_FRAMES) {
      nextTracker.isArmed = true;
      nextTracker.bottomReadyFrames = 0;
      nextTracker.phase = 'abajo';
      nextTracker.currentRepCorrect = true;
      nextTracker.minimumAngle = null;
    }
    return {
      tracker: nextTracker,
      smoothedAngle,
      completedMinimumAngle,
      isAtBottom,
      hasReachedTop,
    };
  }

  if (nextTracker.phase === 'esperando abajo') {
    if (isAtBottom) {
      nextTracker.phase = 'abajo';
      nextTracker.currentRepCorrect = true;
    }
  } else if (nextTracker.phase === 'abajo') {
    // Una articulación retenida durante una pérdida breve no debe desarmar
    // una repetición que ya estaba en la fase inferior. El ángulo promedio
    // todavía permite identificar el inicio de la subida; si vuelve al fondo
    // sin completar la parte superior, la rama de `subiendo` emitirá `no-top`.
    if (isAtBottom) {
      nextTracker.currentRepCorrect = true;
    }
    if (hasStartedPull && isRising) {
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
      nextTracker.currentRepCorrect = nextTracker.currentRepCorrect
        && hasReachedTop
        && topReached;
      nextTracker.repetitions += 1;
      nextTracker.event = nextTracker.currentRepCorrect ? 'valid' : 'invalid';
      if (nextTracker.currentRepCorrect) {
        nextTracker.goodRepetitions += 1;
      }
      completedMinimumAngle = nextTracker.minimumAngle;
    } else if (isAtBottomByAngle) {
      nextTracker.phase = 'abajo';
      nextTracker.event = 'no-top';
      nextTracker.repetitions += 1;
      nextTracker.currentRepCorrect = isAtBottom;
      completedMinimumAngle = nextTracker.minimumAngle;
    }
  } else if (nextTracker.phase === 'arriba') {
    nextTracker.topFrames = 0;
    if (isAtBottomByAngle) {
      nextTracker.phase = 'abajo';
      nextTracker.currentRepCorrect = isAtBottom;
      completedMinimumAngle = nextTracker.minimumAngle;
    } else if (!topReached) {
      nextTracker.phase = 'bajando';
    }
  } else if (nextTracker.phase === 'bajando') {
    nextTracker.topFrames = 0;
    nextTracker.minimumAngle = nextTracker.minimumAngle === null
      ? smoothedAngle
      : Math.min(nextTracker.minimumAngle, smoothedAngle);

    if (isAtBottomByAngle) {
      nextTracker.phase = 'abajo';
      nextTracker.currentRepCorrect = isAtBottom;
      completedMinimumAngle = nextTracker.minimumAngle;
    } else if (isRising && smoothedAngle < PULLUP_NO_LOCKOUT_ANGLE) {
      nextTracker.phase = 'esperando abajo';
      nextTracker.event = 'no-lockout';
      nextTracker.repetitions += 1;
      nextTracker.currentRepCorrect = false;
      completedMinimumAngle = nextTracker.minimumAngle;
    }
  }

  return {
    tracker: nextTracker,
    smoothedAngle,
    completedMinimumAngle,
    isAtBottom,
    hasReachedTop,
  };
}

const HAND_DETAIL_LANDMARKS = new Set([17, 18, 19, 20, 21, 22]);

function drawSkeletonImpl(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  pose?: Pick<Pose, 'keypoints'>,
  mirror = true,
  showFoot = false,
  debugVisuals = false,
  clearCanvas = true,
) {
  const width = video.videoWidth;
  const height = video.videoHeight;
  if (!width || !height) return;
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;

  const context = canvas.getContext('2d');
  const keypoints = pose?.keypoints ?? [];
  if (!context) return;
  if (clearCanvas) context.clearRect(0, 0, width, height);
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.strokeStyle = GREEN;
  context.lineWidth = Math.max(3, width / 240);
  context.shadowColor = 'rgba(57, 255, 106, 0.7)';
  context.shadowBlur = Math.max(5, width / 130);

  const drawConnections = (connections: Array<[number, number]>) => {
    connections.forEach(([start, end]) => {
      if (HAND_DETAIL_LANDMARKS.has(start) || HAND_DETAIL_LANDMARKS.has(end)) return;
      const first = keypoints[start];
      const second = keypoints[end];
      if (!first || !second || (first.score ?? 0) < 0.3 || (second.score ?? 0) < 0.3) return;
      const firstX = mirror ? width - first.x : first.x;
      const secondX = mirror ? width - second.x : second.x;
      const connectionHeld = isHeldPoint(first) || isHeldPoint(second);
      context.beginPath();
      context.moveTo(firstX, first.y);
      context.lineTo(secondX, second.y);
      const connectionHasBoneHeld = first.heldReason === 'bone-length'
        || second.heldReason === 'bone-length';
      context.strokeStyle = connectionHeld
        ? debugVisuals && connectionHasBoneHeld
          ? DEBUG_BONE_HELD_COLOR
          : HELD_POINT_COLOR
        : GREEN;
      context.globalAlpha = connectionHeld ? HELD_POINT_ALPHA : 1;
      context.stroke();
    });
  };

  const footConnectionKeys = new Set(
    footConnections.map(([start, end]) => `${start}:${end}`),
  );
  drawConnections(
    skeletonConnections.filter(([start, end]) => !footConnectionKeys.has(`${start}:${end}`)),
  );
  if (showFoot) drawConnections(footConnections);

  context.shadowBlur = Math.max(3, width / 200);
  keypoints.forEach((point, index) => {
    if (HAND_DETAIL_LANDMARKS.has(index)) return;
    if (
      !showFoot
      && footConnections.some(([start, end]) => start === index || end === index)
    ) {
      return;
    }
    if ((point.score ?? 0) < 0.3) return;
    const pointX = mirror ? width - point.x : point.x;
    context.beginPath();
    context.arc(pointX, point.y, Math.max(4, width / 115), 0, Math.PI * 2);
    context.fillStyle = isHeldPoint(point)
      ? debugVisuals && point.heldReason === 'bone-length'
        ? DEBUG_BONE_HELD_COLOR
        : HELD_POINT_COLOR
      : GREEN;
    context.globalAlpha = isHeldPoint(point) ? HELD_POINT_ALPHA : 1;
    context.fill();
    if (
      debugVisuals
      && point.swapped
      && DEBUG_LIMB_INDICES.some((limbIndex) => limbIndex === index)
    ) {
      context.beginPath();
      context.arc(pointX, point.y, Math.max(6, width / 92), 0, Math.PI * 2);
      context.strokeStyle = DEBUG_SWAPPED_OUTLINE_COLOR;
      context.globalAlpha = 1;
      context.lineWidth = Math.max(2, width / 360);
      context.stroke();
      context.lineWidth = Math.max(3, width / 240);
    }
  });
  context.globalAlpha = 1;
  context.strokeStyle = GREEN;
  context.shadowBlur = 0;
}

function drawSkeleton(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  pose?: Pick<Pose, 'keypoints'>,
  mirror = true,
  showFoot = false,
  debugVisuals = false,
  clearCanvas = true,
) {
  if (!uploadedPushupLiveMetrics?.active) {
    drawSkeletonImpl(canvas, video, pose, mirror, showFoot, debugVisuals, clearCanvas);
    return;
  }
  const startedAt = performance.now();
  try {
    drawSkeletonImpl(canvas, video, pose, mirror, showFoot, debugVisuals, clearCanvas);
  } finally {
    recordUploadedPushupLiveDuration(
      'skeletonDrawMs',
      performance.now() - startedAt,
    );
  }
}

function getContainedVideoSize(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
) {
  const scale = Math.min(1, maxWidth / width, maxHeight / height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

type RecordedAngle = {
  label: string;
  value: number | null;
  unit?: string;
};

function drawRecordedVideoHud(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  details: {
    exerciseName: string;
    correctRepetitions: number;
    incorrectRepetitions: number;
    showCounter: boolean;
    angles: RecordedAngle[];
  },
) {
  const scale = Math.max(0.72, Math.min(1.5, width / 900));
  const margin = Math.max(12, width * 0.022);
  const panelRadius = 9 * scale;
  const font = (size: number, weight = 700) => `${weight} ${size * scale}px Inter, Arial, sans-serif`;

  const panel = (x: number, y: number, panelWidth: number, panelHeight: number) => {
    context.save();
    context.fillStyle = 'rgba(7, 17, 30, 0.82)';
    context.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    context.lineWidth = Math.max(1, scale);
    context.beginPath();
    context.roundRect(x, y, panelWidth, panelHeight, panelRadius);
    context.fill();
    context.stroke();
    context.restore();
  };

  context.save();
  context.textBaseline = 'middle';
  context.shadowColor = 'rgba(0, 0, 0, 0.42)';
  context.shadowBlur = 8 * scale;

  const title = details.exerciseName.toLocaleUpperCase('es');
  context.font = font(10, 800);
  const titleWidth = Math.min(width * 0.52, Math.max(118 * scale, context.measureText(title).width + 24 * scale));
  panel((width - titleWidth) / 2, margin, titleWidth, 27 * scale);
  context.fillStyle = '#eaf3f7';
  context.textAlign = 'center';
  context.fillText(title, width / 2, margin + 13.5 * scale, titleWidth - 14 * scale);

  if (details.showCounter) {
    const cardWidth = 78 * scale;
    const cardHeight = 45 * scale;
    const cardGap = 6 * scale;
    const counterY = margin + 36 * scale;
    [
      { label: 'CORRECTAS', value: details.correctRepetitions, color: '#8bffa5' },
      { label: 'INCORRECTAS', value: details.incorrectRepetitions, color: '#ff9b93' },
    ].forEach((item, index) => {
      const x = margin + index * (cardWidth + cardGap);
      panel(x, counterY, cardWidth, cardHeight);
      context.textAlign = 'left';
      context.font = font(7, 800);
      context.fillStyle = 'rgba(225, 237, 244, 0.76)';
      context.fillText(item.label, x + 8 * scale, counterY + 13 * scale);
      context.font = font(20, 800);
      context.fillStyle = item.color;
      context.fillText(String(item.value), x + 8 * scale, counterY + 32 * scale);
    });
  }

  const angleItems = details.angles
    .filter((reading) => reading.value !== null && Number.isFinite(reading.value))
    .slice(0, 6);
  if (angleItems.length) {
    const columns = angleItems.length > 2 ? 2 : 1;
    const rows = Math.ceil(angleItems.length / columns);
    const cardWidth = 72 * scale;
    const cardHeight = 36 * scale;
    const gap = 5 * scale;
    const panelWidth = columns * cardWidth + (columns - 1) * gap + 14 * scale;
    const panelHeight = rows * cardHeight + (rows - 1) * gap + 28 * scale;
    const panelX = width - panelWidth - margin;
    const panelY = height - panelHeight - margin;
    panel(panelX, panelY, panelWidth, panelHeight);
    context.textAlign = 'left';
    context.font = font(6.5, 800);
    context.fillStyle = 'rgba(225, 237, 244, 0.7)';
    context.fillText('ÁNGULOS EN VIVO', panelX + 7 * scale, panelY + 10 * scale);

    angleItems.forEach((reading, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const x = panelX + 7 * scale + column * (cardWidth + gap);
      const y = panelY + 18 * scale + row * (cardHeight + gap);
      context.fillStyle = 'rgba(255, 255, 255, 0.075)';
      context.beginPath();
      context.roundRect(x, y, cardWidth, cardHeight, 5 * scale);
      context.fill();
      context.font = font(6.5, 700);
      context.fillStyle = 'rgba(225, 237, 244, 0.72)';
      context.fillText(reading.label.toLocaleUpperCase('es').slice(0, 13), x + 5 * scale, y + 10 * scale);
      context.font = font(13, 800);
      context.fillStyle = '#8bffa5';
      context.fillText(`${Math.round(reading.value!)}${reading.unit ?? '°'}`, x + 5 * scale, y + 25 * scale);
    });
  }

  context.restore();
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
const HEAD_LANDMARK_INDICES = [0, 7, 8] as const;
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

function getSideViewCandidate(keypoints: PosePoint[] | undefined): PoseSide | null {
  if (!keypoints) return null;

  const scores = (['left', 'right'] as PoseSide[]).map((side) => {
    const pointScores = Object.values(sideKeypoints[side]).map(
      (index) => keypoints[index]?.score ?? 0,
    );
    return {
      side,
      average: pointScores.reduce((sum, score) => sum + score, 0) / pointScores.length,
      visiblePoints: pointScores.filter((score) => score >= CAMERA_POINT_MIN_SCORE).length,
    };
  });
  const strongest = [...scores].sort((first, second) => second.average - first.average)[0];
  if (!strongest) return null;
  const other = scores.find((candidate) => candidate.side !== strongest.side);

  if (
    !other
    || strongest.visiblePoints < SIDE_VIEW_MIN_VISIBLE_POINTS
    || strongest.average - other.average < SIDE_VIEW_MIN_CONFIDENCE_GAP
  ) {
    return null;
  }

  return strongest.side;
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

function getElevatedAustralianRowDominantSide(
  keypoints: PosePoint[] | undefined,
  previousSide: PoseSide | null,
): DominantSideResult | null {
  if (!keypoints) return null;

  const sides: PoseSide[] = ['left', 'right'];
  const bodyJoints: Array<keyof typeof sideKeypoints.left> = ['shoulder', 'hip', 'knee'];
  const armJoints: Array<keyof typeof sideKeypoints.left> = ['elbow', 'wrist'];
  const scores = sides.map((side) => {
    const indexes = sideKeypoints[side];
    const bodyScores = bodyJoints.map((joint) => keypoints[indexes[joint]]?.score ?? 0);
    const armScores = armJoints.map((joint) => keypoints[indexes[joint]]?.score ?? 0);
    const bodyAverage = bodyScores.reduce((sum, score) => sum + score, 0) / bodyScores.length;
    const armAverage = armScores.reduce((sum, score) => sum + score, 0) / armScores.length;
    const bodyCount = bodyScores.filter((score) => score >= CAMERA_POINT_MIN_SCORE).length;
    return {
      side,
      average: bodyAverage * 0.7 + armAverage * 0.3,
      bodyAverage,
      bodyCount,
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
    && previous.bodyCount >= 2
    && previous.bodyAverage >= 0.35
    && strongest.average - previous.average < 0.18,
  );
  const selected = shouldKeepPreviousSide && previous ? previous : strongest;

  return selected.bodyCount || selected.average > 0
    ? { side: selected.side, average: selected.average }
    : null;
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

  return sides.flatMap((side, sideIndex) => definition.trackedJoints
    .filter(({ joint }) => joint !== 'head' || sideIndex === 0)
    .flatMap(({ joint, label }) => {
      const sideLabel = definition.trackBothSides && joint !== 'head'
        ? ` (${side === 'left' ? 'izq.' : 'der.'})`
        : '';
      if (joint === 'foot' && exercise === 'elevacion-talones-pie') {
        return [
          {
            label: `Punta${sideLabel}`,
            point: keypoints[MUSCLE_UP_FOOT_INDEX[side]],
          },
          {
            label: `Talón${sideLabel}`,
            point: keypoints[FOOT_HEEL_INDEX[side]],
          },
        ];
      }

      const index = joint === 'head'
        ? 0
        : joint === 'foot'
          ? MUSCLE_UP_FOOT_INDEX[side]
          : sideKeypoints[side][joint];
      return [{
        label: `${label}${sideLabel}`,
        point: keypoints[index],
      }];
    }));
}

type PullupCalibrationStatus = 'pending' | 'calibrating' | 'ready';

function getPullupCalibrationPoints(keypoints: PosePoint[] | undefined) {
  if (!keypoints) return [];

  const headPoints = HEAD_LANDMARK_INDICES.map((index, pointIndex) => ({
    label: `cabeza ${pointIndex + 1}`,
    point: keypoints[index],
  }));
  const bodyPoints = (['left', 'right'] as PoseSide[]).flatMap((side) => {
    const indexes = sideKeypoints[side];
    const sideLabel = side === 'left' ? 'izquierda' : 'derecha';
    return [
      { label: `hombro ${sideLabel}`, point: keypoints[indexes.shoulder] },
      { label: `codo ${sideLabel}`, point: keypoints[indexes.elbow] },
      { label: `muñeca ${sideLabel}`, point: keypoints[indexes.wrist] },
      { label: `cadera ${sideLabel}`, point: keypoints[indexes.hip] },
      { label: `rodilla ${sideLabel}`, point: keypoints[indexes.knee] },
      { label: `tobillo ${sideLabel}`, point: keypoints[indexes.ankle] },
    ];
  });
  return [...headPoints, ...bodyPoints];
}

function isFreshPullupCalibrationPoint(point: PosePoint | undefined) {
  return Boolean(
    point
    && !isHeldPoint(point)
    && (point.score ?? 0) >= CAMERA_POINT_MIN_SCORE
    && hasWorldCoordinates(point),
  );
}

function isHeldPoint(point: PosePoint | undefined) {
  return Boolean(
    point?.held
    && (point.heldFrames ?? MAX_HELD_FRAMES + 1) > 0
    && (point.heldFrames ?? MAX_HELD_FRAMES + 1) <= MAX_HELD_FRAMES,
  );
}

function isFreshPullupMeasurementPoint(point: PosePoint | undefined) {
  return Boolean(
    point
    && !isHeldPoint(point)
    && (point.score ?? 0) >= CAMERA_POINT_MIN_SCORE,
  );
}

function hasFreshPullupMeasurement(keypoints: PosePoint[] | undefined) {
  if (!keypoints) return false;

  const armPoints = (['left', 'right'] as PoseSide[]).flatMap((side) => {
    const indexes = sideKeypoints[side];
    return [indexes.shoulder, indexes.elbow, indexes.wrist];
  });
  const freshHeadPoints = HEAD_LANDMARK_INDICES.filter((index) => (
    isFreshPullupMeasurementPoint(keypoints[index])
  )).length;

  return armPoints.every((index) => isFreshPullupMeasurementPoint(keypoints[index]))
    && freshHeadPoints >= 2;
}

function hasFreshPushupMeasurement(
  keypoints: PosePoint[] | undefined,
  side: PoseSide | null,
) {
  if (!keypoints || !side) return false;

  const indexes = sideKeypoints[side];
  return [
    indexes.shoulder,
    indexes.elbow,
    indexes.wrist,
    indexes.hip,
    indexes.ankle,
  ].every((index) => isFreshPullupMeasurementPoint(keypoints[index]));
}

function getPushupCalibrationPoints(
  keypoints: PosePoint[] | undefined,
  side: PoseSide | null,
) {
  if (!keypoints || !side) return [];

  const indexes = sideKeypoints[side];
  return [
    { label: 'hombro', point: keypoints[indexes.shoulder] },
    { label: 'codo', point: keypoints[indexes.elbow] },
    { label: 'muñeca', point: keypoints[indexes.wrist] },
    { label: 'cadera', point: keypoints[indexes.hip] },
    { label: 'tobillo', point: keypoints[indexes.ankle] },
  ];
}

function isFreshPushupCalibrationPoint(point: PosePoint | undefined) {
  return Boolean(
    point
    && !isHeldPoint(point)
    && (point.score ?? 0) >= CAMERA_POINT_MIN_SCORE,
  );
}

function isVisibleCameraPoint(point: PosePoint | undefined, minimumScore: number) {
  if (!point) return false;
  if (isHeldPoint(point)) return true;
  return (point.score ?? 0) >= minimumScore;
}

function hasHeldPointForExercise(
  exercise: ExerciseId,
  keypoints: PosePoint[] | undefined,
  dominantSide: PoseSide | null,
) {
  if (!keypoints) return false;

  if (exercise === 'sentadillas') {
    return (['left', 'right'] as PoseSide[]).some((side) => {
      const indexes = sideKeypoints[side];
      return [indexes.hip, indexes.knee, indexes.ankle]
        .some((index) => isHeldPoint(keypoints[index]));
    });
  }

  return getTrackedPointsForExercise(exercise, keypoints, dominantSide)
    .some(({ point }) => isHeldPoint(point));
}

function getCameraGuidance(
  exercise: ExerciseId,
  keypoints: PosePoint[] | undefined,
  side: PoseSide | null,
  videoWidth: number,
  videoHeight: number,
  lateralSide: PoseSide | null = null,
): CameraGuidance {
  if (!keypoints || !side) {
    return {
      tone: 'checking',
      message: 'Ajustando la cámara',
      detail: exercise === 'press-militar'
        ? 'Ponte de frente o en 3/4 y muestra hombros, codos, muñecas y cadera.'
        : exercise === 'press-hombros-maquina'
          ? 'Ponte de frente o en 3/4 a la máquina y deja visibles ambos hombros, codos y muñecas durante todo el recorrido.'
        : exercise === 'elevaciones-laterales' || exercise === 'elevaciones-laterales-polea-baja'
          ? exercise === 'elevaciones-laterales-polea-baja'
            ? 'Ponte de frente o en 3/4 y deja visibles ambos hombros, codos y muñecas junto a la polea.'
            : 'Ponte de frente o en 3/4 y deja visibles ambos hombros, codos y muñecas durante todo el recorrido.'
        : exercise === 'pajaros-mancuernas'
          ? 'Ponte de frente o en 3/4, inclina el torso y deja visibles ambos hombros, codos, muñecas y cadera durante todo el recorrido.'
        : exercise === 'face-pulls-polea-alta'
          ? 'Ponte de frente o en 3/4 frente a la polea y deja visibles ambos hombros, codos y muñecas durante todo el recorrido.'
        : exercise === 'aperturas-inversas-maquina'
          ? 'Ponte de frente o en 3/4 a la máquina y deja visibles ambos hombros, codos y muñecas junto al respaldo durante todo el recorrido.'
        : exercise === 'cruces-polea-baja-alta'
          ? 'Ponte de frente o en 3/4 frente a las poleas y deja visibles ambos hombros, codos y muñecas durante todo el recorrido.'
        : exercise === 'press-pallof-polea-banda'
          ? 'Ponte de frente o en 3/4 y deja visibles ambos hombros, codos y muñecas durante todo el recorrido.'
        : exercise === 'giros-rusos'
          ? 'Ponte de lado y deja visibles ambos hombros, codos, muñecas, caderas, rodillas y tobillos durante todo el recorrido.'
        : exercise === 'muscle-up'
          ? 'Ponte en semiperfil, unos 30°–45° respecto a la cámara; no uses un perfil totalmente lateral. Deja separados y visibles ambos codos, ambas rodillas y ambos tobillos, además de las manos y la barra.'
        : exercise === 'dominadas' || exercise === 'dominadas-supinas' || exercise === 'dominadas-comando'
          ? 'Ponte de espaldas a la cámara y deja visibles ambos brazos, las manos, la cabeza y todo el cuerpo.'
        : exercise === 'fondos'
          ? 'Ponte de lado; la cámara puede estar en el suelo o inclinada. Muestra hombro, codo, muñeca y cadera.'
        : exercise === 'pull-over-polea-alta'
          ? 'Ponte de lado frente a la polea alta y deja visibles ambos hombros, codos, caderas y muñecas durante todo el recorrido.'
         : exercise === 'remos-australianos-elevados'
           ? 'Ponte de lado o en 3/4 junto al apoyo y deja visibles ambos hombros, codos, muñecas, caderas y rodillas. No necesitas mostrar la cabeza ni los tobillos.'
         : exercise === 'remo-sentado-polea-agarre-cerrado'
           ? 'Ponte de lado o en 3/4 frente a la polea baja y deja visibles ambos hombros, codos y muñecas durante todo el recorrido.'
         : exercise === 'remo-mancuerna-una-mano'
           ? 'Ponte de lado junto al banco y deja visibles el hombro, codo, cadera y muñeca del brazo que trabaja.'
        : exercise === 'press-banca'
          ? 'Ponte de lado o en 3/4 y deja visibles ambos hombros, codos, muñecas y caderas.'
          : exercise === 'press-banca-agarre-cerrado'
            ? 'Ponte de lado o en 3/4 y deja visibles ambos hombros, codos y muñecas junto al banco.'
          : exercise === 'press-banca-inclinado'
            ? 'Ponte de lado o en 3/4 y deja visibles ambos hombros, codos y muñecas.'
          : exercise === 'press-plano-mancuernas'
            ? 'Ponte de lado o en 3/4 y deja visibles ambos hombros, codos y muñecas.'
          : exercise === 'press-plano-inclinado'
            ? 'Ponte de lado o en 3/4 y deja visibles ambos hombros, codos y muñecas.'
          : exercise === 'triceps-tras-nuca-polea-alta'
            ? 'Ponte de lado o en 3/4 frente a la polea alta y deja visibles el hombro, el codo y la muñeca durante todo el recorrido.'
          : exercise === 'copa-mancuernas'
            ? 'Ponte de lado o en 3/4 y deja visibles ambos hombros, codos y muñecas durante todo el recorrido.'
          : exercise === 'curl-inverso-barra'
            ? 'Ponte de frente o en 3/4 y deja visibles ambos hombros, codos y muñecas durante todo el recorrido.'
          : exercise === 'curl-inclinado-mancuernas'
            ? 'Ponte de lado o en 3/4 junto al banco y deja visibles ambos hombros, codos y muñecas durante todo el recorrido.'
          : exercise === 'curl-predicador'
            ? 'Ponte de frente o en 3/4 frente al banco predicador y deja visibles ambos hombros, codos y muñecas durante todo el recorrido.'
          : exercise === 'curl-arana'
            ? 'Ponte de frente o en 3/4 frente al banco inclinado y deja visibles ambos hombros, codos y muñecas durante todo el recorrido.'
          : exercise === 'curl-martillo'
            ? 'Ponte de frente o en 3/4 y deja visibles ambos hombros, codos y muñecas durante todo el recorrido.'
          : exercise === 'curl-muneca-sentado'
            ? 'Ponte de lado junto al banco y deja visibles el hombro, codo y muñeca del lado que trabaja durante todo el recorrido.'
          : exercise === 'rodillo-muneca'
            ? 'Ponte de lado frente al rodillo y deja visibles el hombro, codo y muñeca del lado que trabaja durante todo el recorrido.'
          : exercise === 'prensa-piernas' || exercise === 'extensiones-maquina'
           ? 'Ponte de lado y deja visibles ambas rodillas y ambos tobillos durante todo el recorrido.'
           : exercise === 'curl-femoral'
             ? 'Ponte de lado; deja visibles ambas rodillas y ambos tobillos, y coloca la cámara a la altura de la máquina tanto sentado como tumbado.'
           : exercise === 'elevacion-talones-pie'
             ? 'Ponte de lado y deja visibles hombro, cadera, rodilla, tobillo y pie durante toda la elevación.'
           : exercise === 'maquina-aductores'
             ? 'Ponte de frente a la máquina y deja visibles ambos tobillos durante todo el recorrido.'
          : exercise === 'peso-muerto-rumano' || exercise === 'peso-muerto-piernas-rigidas'
            ? 'Ponte de lado o en 3/4 y deja visibles ambos hombros, codos, muñecas, caderas, rodillas y tobillos.'
         : exercise === 'hip-thrust-barra'
           ? 'Ponte de lado o en 3/4, con el banco y la barra visibles; deja dentro del encuadre ambos hombros, codos, muñecas, caderas, rodillas y tobillos.'
         : exercise === 'crunch-invertido'
           ? 'Ponte de lado y deja visibles ambos tobillos, rodillas y cadera durante todo el recorrido.'
         : exercise === 'rueda-abdominal'
           ? 'Ponte de lado o en 3/4 y deja visibles la cabeza, ambos hombros, codos, muñecas, cadera, rodillas y tobillos durante todo el recorrido.'
        : exercise === 'elevaciones-piernas-barra' || exercise === 'barra-reloj'
             ? 'Ponte de lado o en 3/4 frente a la barra y deja visibles la barra, ambos brazos, ambas piernas y los pies completos. No hace falta mostrar la cabeza.'
          : exercise === 'elevaciones-piernas-suelo'
            ? 'Ponte de lado y deja visibles ambos tobillos, rodillas y caderas durante todo el recorrido. No hace falta mostrar la cara.'
        : 'Ponte de lado y deja visibles las articulaciones necesarias. La cámara puede estar baja o inclinada.',
    };
  }

  const requiredPoints = getTrackedPointsForExercise(exercise, keypoints, side);
  const missingLabels = requiredPoints
    .filter(({ label, point }) => {
      const minimumScore = (exercise === 'remo-barra'
        || exercise === 'remos-australianos-elevados')
        && (label.startsWith('codo') || label.startsWith('muñeca'))
        ? ROW_ARM_POINT_MIN_SCORE
        : CAMERA_POINT_MIN_SCORE;
      return !isVisibleCameraPoint(point, minimumScore);
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

  const missingWorldLabels = requiredPoints
    .filter(({ point }) => Boolean(point) && !hasWorldCoordinates(point))
    .map(({ label }) => label);

  if (missingWorldLabels.length) {
    return {
      tone: 'checking',
      message: 'Calibrando medición 3D',
      detail: 'No mostraré grados ni contaré repeticiones hasta tener coordenadas 3D confiables. La altura o inclinación del móvil no cambia el ángulo.',
    };
  }

  if (exercise === 'peso-muerto-piernas-rigidas' && !lateralSide) {
    return {
      tone: 'warning',
      message: 'Necesito una vista lateral',
      detail: 'Gira el móvil hasta que se vea claramente un solo costado. Te indicaré si detecto el lado izquierdo o el derecho.',
    };
  }

  const leftShoulder = keypoints[sideKeypoints.left.shoulder];
  const rightShoulder = keypoints[sideKeypoints.right.shoulder];
  const leftHip = keypoints[sideKeypoints.left.hip];
  const rightHip = keypoints[sideKeypoints.right.hip];
  const shouldersAreVisible = [leftShoulder, rightShoulder, leftHip, rightHip]
    .every((point) => isVisibleCameraPoint(point, CAMERA_POINT_MIN_SCORE));

  if (shouldersAreVisible) {
    const shoulderWidth = Math.hypot(
      rightShoulder.x - leftShoulder.x,
      rightShoulder.y - leftShoulder.y,
    );
    const torsoLength = Math.max(
      Math.hypot(leftShoulder.x - leftHip.x, leftShoulder.y - leftHip.y),
      Math.hypot(rightShoulder.x - rightHip.x, rightShoulder.y - rightHip.y),
    );
    if (
      exercise !== 'press-militar'
      && exercise !== 'press-hombros-maquina'
      && exercise !== 'elevaciones-laterales'
      && exercise !== 'elevaciones-laterales-polea-baja'
      && exercise !== 'pajaros-mancuernas'
      && exercise !== 'face-pulls-polea-alta'
      && exercise !== 'aperturas-inversas-maquina'
      && exercise !== 'cruces-polea-baja-alta'
       && exercise !== 'press-pallof-polea-banda'
      && exercise !== 'dominadas'
      && exercise !== 'dominadas-supinas'
      && exercise !== 'dominadas-comando'
      && exercise !== 'pull-over-polea-alta'
       && exercise !== 'elevaciones-piernas-barra'
       && exercise !== 'elevaciones-piernas-suelo'
      && exercise !== 'press-banca-agarre-cerrado'
      && exercise !== 'press-banca-inclinado'
      && exercise !== 'press-plano-mancuernas'
      && exercise !== 'press-plano-inclinado'
      && exercise !== 'curl-inclinado-mancuernas'
      && exercise !== 'curl-predicador'
      && exercise !== 'curl-arana'
      && exercise !== 'curl-martillo'
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
      : exercise === 'press-hombros-maquina'
        ? 'Usa una vista frontal o en 3/4, con ambos brazos completos y la máquina dentro del encuadre.'
      : exercise === 'elevaciones-laterales' || exercise === 'elevaciones-laterales-polea-baja'
        ? exercise === 'elevaciones-laterales-polea-baja'
          ? 'Usa una vista frontal o en 3/4, con ambos brazos y la polea dentro del encuadre.'
           : 'Usa una vista frontal o en 3/4, con ambos brazos completos dentro del encuadre.'
      : exercise === 'pajaros-mancuernas'
        ? 'Usa una vista frontal o en 3/4, inclina el torso y mantén ambos brazos completos dentro del encuadre.'
      : exercise === 'face-pulls-polea-alta'
        ? 'Usa una vista frontal o en 3/4, con ambos brazos completos y la cuerda dentro del encuadre.'
      : exercise === 'aperturas-inversas-maquina'
        ? 'Usa una vista frontal o en 3/4, con ambos brazos completos y la máquina dentro del encuadre.'
      : exercise === 'cruces-polea-baja-alta'
        ? 'Usa una vista frontal o en 3/4, con ambos brazos completos y las dos poleas dentro del encuadre.'
      : exercise === 'press-pallof-polea-banda'
        ? 'Usa una vista frontal o en 3/4, con ambos brazos completos y la polea o banda dentro del encuadre.'
      : exercise === 'giros-rusos'
        ? 'Usa una vista lateral y deja ambos brazos y ambas piernas completas dentro del encuadre.'
      : exercise === 'pull-over-polea-alta'
        ? 'Usa una vista lateral, con ambos brazos completos, las caderas y la polea dentro del encuadre.'
           : exercise === 'elevaciones-piernas-barra' || exercise === 'barra-reloj'
             ? 'Usa una vista lateral o en 3/4, con la barra, ambos brazos, ambas piernas y los pies completos dentro del encuadre. La cabeza no interviene.'
      : exercise === 'elevaciones-piernas-suelo'
        ? 'Usa una vista lateral, con ambos tobillos, rodillas y caderas completos dentro del encuadre. La cara no interviene.'
      : exercise === 'dominadas-comando'
        ? 'Usa una vista trasera o en 3/4, con la barra, ambos brazos y la cabeza dentro del encuadre.'
      : exercise === 'remo-sentado-polea-agarre-cerrado'
        ? 'Usa una vista lateral o en 3/4, con ambos brazos completos y la polea baja dentro del encuadre.'
      : exercise === 'remo-mancuerna-una-mano'
        ? 'Usa una vista lateral, con el banco y el brazo que trabaja completos dentro del encuadre.'
      : exercise === 'press-banca-inclinado'
        ? 'Usa una vista lateral o en 3/4, con ambos brazos completos y el banco dentro del encuadre.'
      : exercise === 'press-banca-agarre-cerrado'
        ? 'Usa una vista lateral o en 3/4, con ambos brazos completos y el banco dentro del encuadre.'
      : exercise === 'press-plano-mancuernas'
        ? 'Usa una vista lateral o en 3/4, con ambos brazos completos y el banco dentro del encuadre.'
      : exercise === 'press-plano-inclinado'
        ? 'Usa una vista lateral o en 3/4, con ambos brazos completos y el banco inclinado dentro del encuadre.'
      : exercise === 'peso-muerto-piernas-rigidas'
        ? `Vista lateral detectada: lado ${lateralSide === 'left' ? 'izquierdo' : 'derecho'}. Mantén ese costado visible durante todo el recorrido.`
      : 'Medición 3D lista. Puedes iniciar aunque el móvil esté bajo, alto o inclinado; esas posiciones no cambian los grados.',
  };
}

function getMeasurementCoordinates(point: PosePoint): { x: number; y: number; z: number } {
  return point.world ?? { x: point.x, y: point.y, z: point.z ?? 0 };
}

function hasWorldCoordinates(point: PosePoint | undefined): point is PosePoint & {
  world: { x: number; y: number; z: number };
} {
  return Boolean(
    point?.world
    && Number.isFinite(point.world.x)
    && Number.isFinite(point.world.y)
    && Number.isFinite(point.world.z),
  );
}

function getAngleMeasurementCoordinates(
  point: PosePoint | undefined,
): { x: number; y: number; z: number } | null {
  return hasWorldCoordinates(point) ? point.world : null;
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

  const firstCoordinates = getAngleMeasurementCoordinates(first);
  const vertexCoordinates = getAngleMeasurementCoordinates(vertex);
  const lastCoordinates = getAngleMeasurementCoordinates(last);
  if (!firstCoordinates || !vertexCoordinates || !lastCoordinates) return null;
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

function calculateDumbbellPressElbowAngles(keypoints: PosePoint[] | undefined) {
  if (!keypoints) return { left: null, right: null };

  return {
    left: calculateAngle(
      keypoints[sideKeypoints.left.shoulder],
      keypoints[sideKeypoints.left.elbow],
      keypoints[sideKeypoints.left.wrist],
    ),
    right: calculateAngle(
      keypoints[sideKeypoints.right.shoulder],
      keypoints[sideKeypoints.right.elbow],
      keypoints[sideKeypoints.right.wrist],
    ),
  };
}

function calculateDumbbellPressAverageAngle(keypoints: PosePoint[] | undefined) {
  const { left, right } = calculateDumbbellPressElbowAngles(keypoints);
  if (left === null || right === null) return null;
  return Math.round((left + right) / 2);
}

function calculateShoulderMachinePressAngles(keypoints: PosePoint[] | undefined) {
  if (!keypoints) {
    return {
      leftShoulder: null,
      rightShoulder: null,
      leftElbow: null,
      rightElbow: null,
      leftWrist: null,
      rightWrist: null,
    };
  }

  return {
    leftShoulder: calculateAngle(
      keypoints[sideKeypoints.left.hip],
      keypoints[sideKeypoints.left.shoulder],
      keypoints[sideKeypoints.left.elbow],
    ),
    rightShoulder: calculateAngle(
      keypoints[sideKeypoints.right.hip],
      keypoints[sideKeypoints.right.shoulder],
      keypoints[sideKeypoints.right.elbow],
    ),
    leftElbow: calculateAngle(
      keypoints[sideKeypoints.left.shoulder],
      keypoints[sideKeypoints.left.elbow],
      keypoints[sideKeypoints.left.wrist],
    ),
    rightElbow: calculateAngle(
      keypoints[sideKeypoints.right.shoulder],
      keypoints[sideKeypoints.right.elbow],
      keypoints[sideKeypoints.right.wrist],
    ),
    leftWrist: calculateAngle(
      keypoints[sideKeypoints.left.elbow],
      keypoints[sideKeypoints.left.wrist],
      keypoints[WRIST_TIP_INDEX.left],
    ),
    rightWrist: calculateAngle(
      keypoints[sideKeypoints.right.elbow],
      keypoints[sideKeypoints.right.wrist],
      keypoints[WRIST_TIP_INDEX.right],
    ),
  };
}

function calculateShoulderMachinePressAverageAngle(keypoints: PosePoint[] | undefined) {
  const { leftShoulder, rightShoulder } = calculateShoulderMachinePressAngles(keypoints);
  if (leftShoulder === null || rightShoulder === null) return null;
  return Math.round((leftShoulder + rightShoulder) / 2);
}

function isShoulderMachinePressTechniqueValid(
  keypoints: PosePoint[] | undefined,
  averageShoulderAngle: number | null,
) {
  const {
    leftShoulder,
    rightShoulder,
    leftElbow,
    rightElbow,
    leftWrist,
    rightWrist,
  } = calculateShoulderMachinePressAngles(keypoints);
  if (
    leftShoulder === null
    || rightShoulder === null
    || leftElbow === null
    || rightElbow === null
    || leftWrist === null
    || rightWrist === null
    || averageShoulderAngle === null
  ) {
    return false;
  }

  return Math.abs(leftShoulder - rightShoulder) <= SHOULDER_MACHINE_PRESS_ACCEPTED_MAX_SIDE_DIFFERENCE
    && Math.abs(leftElbow - rightElbow) <= SHOULDER_MACHINE_PRESS_ACCEPTED_MAX_SIDE_DIFFERENCE
    && isWithinAngle(leftWrist, SHOULDER_MACHINE_PRESS_ACCEPTED_WRIST_MIN_ANGLE, SHOULDER_MACHINE_PRESS_ACCEPTED_WRIST_MAX_ANGLE)
    && isWithinAngle(rightWrist, SHOULDER_MACHINE_PRESS_ACCEPTED_WRIST_MIN_ANGLE, SHOULDER_MACHINE_PRESS_ACCEPTED_WRIST_MAX_ANGLE);
}

function isDumbbellPressTechniqueValid(
  keypoints: PosePoint[] | undefined,
  phase: ExerciseRepPhase,
  averageAngle: number | null,
) {
  const { left, right } = calculateDumbbellPressElbowAngles(keypoints);
  if (left === null || right === null || averageAngle === null) return false;
  if (Math.abs(left - right) > DUMBBELL_PRESS_MAX_SIDE_DIFFERENCE) return false;

  const averageIsAtStart = isWithinAngle(
    averageAngle,
    DUMBBELL_PRESS_START_MIN_ANGLE,
    DUMBBELL_PRESS_START_MAX_ANGLE,
  );
  const averageIsAtEnd = isWithinAngle(
    averageAngle,
    DUMBBELL_PRESS_END_MIN_ANGLE,
    DUMBBELL_PRESS_END_MAX_ANGLE,
  );

  if (averageIsAtStart) {
    return isWithinAngle(left, DUMBBELL_PRESS_START_MIN_ANGLE, DUMBBELL_PRESS_START_MAX_ANGLE)
      && isWithinAngle(right, DUMBBELL_PRESS_START_MIN_ANGLE, DUMBBELL_PRESS_START_MAX_ANGLE);
  }
  if (phase === 'en movimiento' && averageIsAtEnd) {
    return isWithinAngle(left, DUMBBELL_PRESS_END_MIN_ANGLE, DUMBBELL_PRESS_END_MAX_ANGLE)
      && isWithinAngle(right, DUMBBELL_PRESS_END_MIN_ANGLE, DUMBBELL_PRESS_END_MAX_ANGLE);
  }

  return true;
}

const defaultTechniqueFeedback: TechniqueFeedback = {
  tone: 'checking',
  message: 'Colócate de lado',
  detail: 'Necesitamos ver tu hombro, codo, muñeca, cadera y tobillo.',
};

const defaultSquatFeedback: TechniqueFeedback = {
  tone: 'checking',
  message: 'Ángulo normalizado',
  detail: 'El ángulo se calcula con coordenadas 3D; la inclinación, escala y altura de la cámara no cambian la medición.',
};

const lowConfidenceFeedback: TechniqueFeedback = {
  tone: 'checking',
  message: 'Comprobando puntos visibles',
  detail: 'Una articulación se está manteniendo temporalmente con su última posición fiable. No contaré ni evaluaré una fase hasta verla de nuevo.',
};

const muscleUpReferenceFeedback: TechniqueFeedback = {
  tone: 'checking',
  message: 'Lecturas de referencia activas',
  detail: 'Observa codos, rodillas y tobillos. Definiremos los rangos después de revisar tu ejecución correcta.',
};

const commandoPullupReferenceFeedback: TechniqueFeedback = {
  tone: 'checking',
  message: 'Lecturas de referencia activas',
  detail: 'Observa hombros, codos, muñecas y cabeza. Definiremos el recorrido de la dominada comando después de revisar una ejecución correcta.',
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
      detail: `Están a ${elbowTorsoAngle}°. Busca ${PUSHUP_ELBOW_TORSO_MIN_ANGLE}°–${PUSHUP_ELBOW_TORSO_MAX_ANGLE + PUSHUP_ELBOW_TORSO_TOLERANCE}° y desciende con control.`,
    };
  }
  if (elbowTorsoAngle < elbowMinAngle) {
    return {
      tone: 'danger',
      message: 'No cierres demasiado los codos',
      detail: `Están a ${elbowTorsoAngle}°. Sepáralos suavemente hasta formar ${PUSHUP_ELBOW_TORSO_MIN_ANGLE}°–${PUSHUP_ELBOW_TORSO_MAX_ANGLE + PUSHUP_ELBOW_TORSO_TOLERANCE}° con el torso.`,
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

function getLateralRaiseTechniqueFeedback(
  keypoints: PosePoint[] | undefined,
): TechniqueFeedback {
  if (!keypoints) {
    return {
      tone: 'checking',
      message: 'Ajustando la cámara',
      detail: 'Ponte de frente o en 3/4 y muestra ambos hombros, codos y muñecas.',
    };
  }

  const readings = (['left', 'right'] as PoseSide[]).map((side) => {
    const indexes = sideKeypoints[side];
    return {
      shoulder: calculateAngle(
        keypoints[indexes.hip],
        keypoints[indexes.shoulder],
        keypoints[indexes.elbow],
      ),
      elbow: calculateAngle(
        keypoints[indexes.shoulder],
        keypoints[indexes.elbow],
        keypoints[indexes.wrist],
      ),
    };
  });

  if (readings.some(({ shoulder, elbow }) => shoulder === null || elbow === null)) {
    return {
      tone: 'checking',
      message: 'Muestra ambos brazos',
      detail: 'Necesitamos ver hombros, codos y muñecas de los dos lados para comparar la elevación.',
    };
  }

  const shoulderAngles = readings.map(({ shoulder }) => shoulder as number);
  const elbowAngles = readings.map(({ elbow }) => elbow as number);
  const averageShoulderAngle = shoulderAngles.reduce((sum, value) => sum + value, 0) / shoulderAngles.length;
  const shoulderDifference = Math.abs(shoulderAngles[0] - shoulderAngles[1]);
  const minimumElbowAngle = Math.min(...elbowAngles);

  if (shoulderDifference > 22) {
    return {
      tone: 'warning',
      message: 'Eleva ambos brazos al mismo nivel',
      detail: `Hay ${shoulderDifference}° de diferencia entre los hombros. Sube el brazo más bajo sin inclinar el torso.`,
    };
  }
  if (averageShoulderAngle > LATERAL_RAISE_END_MAX_ANGLE + 8) {
    return {
      tone: 'warning',
      message: 'No subas por encima de los hombros',
      detail: `La elevación media es de ${Math.round(averageShoulderAngle)}°. Detén las mancuernas a la altura de los hombros.`,
    };
  }
  if (minimumElbowAngle < 135) {
    return {
      tone: 'warning',
      message: 'Mantén los codos ligeramente flexionados',
      detail: `Un codo está a ${minimumElbowAngle}°. Conserva una flexión suave sin cerrar demasiado los brazos.`,
    };
  }

  return {
    tone: 'success',
    message: 'Elevación lateral controlada',
    detail: `Hombros a ${Math.round(averageShoulderAngle)}° de media. Mantén las muñecas alineadas y baja con control.`,
  };
}

function getPallofTechniqueFeedback(
  keypoints: PosePoint[] | undefined,
): TechniqueFeedback {
  if (!keypoints) {
    return {
      tone: 'checking',
      message: 'Ajustando la cámara',
      detail: 'Ponte de frente o en 3/4 y muestra ambos hombros, codos y muñecas.',
    };
  }

  const readings = (['left', 'right'] as PoseSide[]).map((side) => {
    const indexes = sideKeypoints[side];
    return {
      shoulderVisible: (keypoints[indexes.shoulder]?.score ?? 0) >= CAMERA_POINT_MIN_SCORE,
      elbow: calculateAngle(
        keypoints[indexes.shoulder],
        keypoints[indexes.elbow],
        keypoints[indexes.wrist],
      ),
      wrist: calculateAngle(
        keypoints[indexes.elbow],
        keypoints[indexes.wrist],
        keypoints[WRIST_TIP_INDEX[side]],
      ),
    };
  });

  if (readings.some(({ shoulderVisible, elbow, wrist }) => (
    !shoulderVisible || elbow === null || wrist === null
  ))) {
    return {
      tone: 'checking',
      message: 'Muestra ambos brazos',
      detail: 'Necesitamos ver hombros, codos y muñecas de los dos lados para comparar la extensión.',
    };
  }

  const elbowAngles = readings.map(({ elbow }) => elbow as number);
  const wristAngles = readings.map(({ wrist }) => wrist as number);
  const elbowDifference = Math.abs(elbowAngles[0] - elbowAngles[1]);
  const minimumWristAngle = Math.min(...wristAngles);

  if (elbowDifference > 30) {
    return {
      tone: 'warning',
      message: 'Extiende ambos brazos al mismo nivel',
      detail: 'Evita que un codo se adelante o se eleve más que el otro; mantén las manos juntas y el torso estable.',
    };
  }
  if (minimumWristAngle < PALLOF_WRIST_MIN_ANGLE) {
    return {
      tone: 'warning',
      message: 'Mantén las muñecas neutras',
      detail: `Una muñeca está a ${minimumWristAngle}°. Alinea las manos con los antebrazos y no las dobles contra la resistencia.`,
    };
  }

  return {
    tone: 'success',
    message: 'Press Pallof controlado',
    detail: `Hombros equilibrados · diferencia de codos ${elbowDifference}°. Presiona al frente sin girar el torso y regresa lentamente.`,
  };
}

function isPallofTechniqueValid(keypoints: PosePoint[] | undefined) {
  if (!keypoints) return false;

  const readings = (['left', 'right'] as PoseSide[]).map((side) => {
    const indexes = sideKeypoints[side];
    const points = [
      keypoints[indexes.shoulder],
      keypoints[indexes.elbow],
      keypoints[indexes.wrist],
      keypoints[WRIST_TIP_INDEX[side]],
    ];
    return {
      points,
    };
  });

  if (readings.some(({ points }) => (
    points.some((point) => (point?.score ?? 0) < CAMERA_POINT_MIN_SCORE)
  ))) {
    return false;
  }

  return true;
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

function getOverheadTricepsTechniqueFeedback(
  keypoints: PosePoint[] | undefined,
  side: PoseSide | null,
  movementLabel = 'tras nuca',
): TechniqueFeedback {
  if (!keypoints || !side) return defaultTechniqueFeedback;

  const indexes = sideKeypoints[side];
  const shoulder = keypoints[indexes.shoulder];
  const elbow = keypoints[indexes.elbow];
  const wrist = keypoints[indexes.wrist];
  const wristTip = keypoints[WRIST_TIP_INDEX[side]];
  const shoulderAngle = calculateAngle(
    keypoints[indexes.hip],
    shoulder,
    elbow,
  );
  const elbowAngle = calculateAngle(shoulder, elbow, wrist);
  const wristAngle = calculateAngle(elbow, wrist, wristTip);

  if (shoulderAngle === null || elbowAngle === null || wristAngle === null) {
    return defaultTechniqueFeedback;
  }

  if (shoulderAngle < OVERHEAD_TRICEPS_SHOULDER_MIN_ANGLE) {
    return {
      tone: 'warning',
      message: 'Eleva los brazos sin mover el torso',
      detail: `El hombro está a ${shoulderAngle}°. Mantén el brazo por encima de la cabeza, entre ${OVERHEAD_TRICEPS_SHOULDER_MIN_ANGLE}° y ${OVERHEAD_TRICEPS_SHOULDER_MAX_ANGLE}°.`,
    };
  }
  if (wristAngle < OVERHEAD_TRICEPS_WRIST_MIN_ANGLE) {
    return {
      tone: 'warning',
      message: 'Mantén las muñecas neutras',
      detail: `La muñeca está a ${wristAngle}°. Alinea la mano con el antebrazo y evita doblarla al tirar de la cuerda.`,
    };
  }
  if (elbowAngle < 65) {
    return {
      tone: 'warning',
      message: 'No cierres demasiado el codo',
      detail: `El codo está a ${elbowAngle}°. Regresa un poco la cuerda y mantén un rango cómodo tras la cabeza.`,
    };
  }

  return {
    tone: 'success',
    message: `Extensión ${movementLabel} controlada`,
    detail: `Hombro ${shoulderAngle}° · codo ${elbowAngle}° · muñeca ${wristAngle}°. Mantén los codos apuntando al frente y extiende sin balancearte.`,
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

function getSeatedWristCurlTechniqueFeedback(
  keypoints: PosePoint[] | undefined,
  side: PoseSide | null,
  movementLabel = 'Curl de muñeca',
): TechniqueFeedback {
  if (!keypoints || !side) return defaultTechniqueFeedback;

  const indexes = sideKeypoints[side];
  const shoulder = keypoints[indexes.shoulder];
  const elbow = keypoints[indexes.elbow];
  const wrist = keypoints[indexes.wrist];
  const wristTip = keypoints[WRIST_TIP_INDEX[side]];
  const shoulderAngle = calculateAngle(
    keypoints[indexes.hip],
    shoulder,
    elbow,
  );
  const elbowAngle = calculateAngle(shoulder, elbow, wrist);
  const wristAngle = calculateAngle(elbow, wrist, wristTip);

  if (shoulderAngle === null || elbowAngle === null || wristAngle === null) {
    return defaultTechniqueFeedback;
  }

  if (wristAngle < WRIST_CURL_END_MIN_ANGLE - 15) {
    return {
      tone: 'warning',
      message: 'No fuerces la muñeca',
      detail: `La muñeca está a ${wristAngle}°. Reduce un poco la flexión y mantén el movimiento controlado.`,
    };
  }
  if (wristAngle > WRIST_CURL_END_MAX_ANGLE) {
    return {
      tone: 'warning',
      message: 'Completa la flexión de muñeca',
      detail: `La muñeca está a ${wristAngle}°. Flexiona un poco más sin despegar los antebrazos ni mover los codos.`,
    };
  }

  return {
    tone: 'success',
    message: `${movementLabel} controlado`,
    detail: `Hombro ${shoulderAngle}° · codo ${elbowAngle}° · muñeca ${wristAngle}°. Mantén los antebrazos apoyados y los codos estables.`,
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

  const shoulderCoordinates = getAngleMeasurementCoordinates(shoulder);
  const hipCoordinates = getAngleMeasurementCoordinates(hip);
  if (!shoulderCoordinates || !hipCoordinates) return null;
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

  if (elbowAngle < PULLUP_BOTTOM_MIN_ANGLE - PULLUP_TOLERANCE_DEG) {
    return {
      tone: 'checking',
      message: 'Extiende bien los codos',
      detail: `Codo a ${elbowAngle}°. Desde ${PULLUP_BOTTOM_MIN_ANGLE - PULLUP_TOLERANCE_DEG}° inicia la subida.`,
    };
  }
  if (
    isHeadOverBothWrists(keypoints) !== true
    && !getPullupExtremityValidation(keypoints).atTop
  ) {
    return {
      tone: 'warning',
      message: 'Sube hasta pasar la cabeza',
      detail: 'La referencia de cabeza debe quedar por encima de ambas muñecas.',
    };
  }
  return {
    tone: 'success',
    message: 'Dominada válida',
    detail: `Cabeza sobre ambas muñecas · codo a ${elbowAngle}° · inicia y regresa con los codos entre ${PULLUP_BOTTOM_MIN_ANGLE}–${PULLUP_BOTTOM_MAX_ANGLE}°.`,
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

  if (elbowAngle < PULLUP_BOTTOM_MIN_ANGLE - PULLUP_TOLERANCE_DEG) {
    return {
      tone: 'checking',
      message: 'Extiende bien los codos',
      detail: `Codo a ${elbowAngle}°. Desde ${PULLUP_BOTTOM_MIN_ANGLE - PULLUP_TOLERANCE_DEG}° inicia la subida con agarre supino.`,
    };
  }
  if (
    isHeadOverBothWrists(keypoints) !== true
    && !getPullupExtremityValidation(keypoints).atTop
  ) {
    return {
      tone: 'warning',
      message: 'Sube hasta pasar la cabeza',
      detail: 'La referencia de cabeza debe quedar por encima de ambas muñecas.',
    };
  }
  return {
    tone: 'success',
    message: 'Dominada supina válida',
    detail: `Cabeza sobre ambas muñecas · codo a ${elbowAngle}° · inicia y regresa con los codos entre ${PULLUP_BOTTOM_MIN_ANGLE}–${PULLUP_BOTTOM_MAX_ANGLE}° con agarre supino.`,
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
      detail: `El ángulo cadera–hombro–codo está a ${pulldownAngle}°. Debe entrar entre ${PULLDOWN_ANGLE_MIN}° y ${PULLDOWN_ANGLE_MAX}°.`,
    };
  }
  if (pulldownAngle < PULLDOWN_ANGLE_MIN) {
    return {
      tone: 'danger',
      message: 'No cierres demasiado el ángulo',
      detail: `El ángulo cadera–hombro–codo está a ${pulldownAngle}°. Debe mantenerse entre ${PULLDOWN_ANGLE_MIN}° y ${PULLDOWN_ANGLE_MAX}°.`,
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
  const pulldownAngle = calculateAngle(
    keypoints[indexes.hip],
    keypoints[indexes.shoulder],
    keypoints[indexes.elbow],
  );
  const elbowAngle = calculateAngle(
    keypoints[indexes.shoulder],
    keypoints[indexes.elbow],
    keypoints[indexes.wrist],
  );
  if (
    torsoLean === null
    || pulldownAngle === null
    || elbowAngle === null
    || !isWithinAngle(torsoLean, PULLDOWN_TORSO_MIN_ANGLE, PULLDOWN_TORSO_MAX_ANGLE)
    || !isWithinAngle(pulldownAngle, PULLDOWN_ANGLE_MIN, repetitionConfigs.jalon?.startMaxAngle ?? 155)
  ) {
    return false;
  }

  const isAtEnd = isWithinAngle(pulldownAngle, PULLDOWN_ANGLE_MIN, PULLDOWN_ANGLE_MAX);
  return !isAtEnd
    || isWithinAngle(elbowAngle, PULLDOWN_ELBOW_MIN_ANGLE, PULLDOWN_ELBOW_MAX_ANGLE);
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

function getElevatedAustralianRowTechniqueFeedback(
  keypoints: PosePoint[] | undefined,
  side: PoseSide | null,
): TechniqueFeedback {
  if (!keypoints || !side) {
    return {
      tone: 'checking',
      message: 'Ajustando la cámara',
      detail: 'Ponte de lado o en 3/4 y muestra hombros, codos, muñecas, caderas y rodillas. No necesitas mostrar la cabeza ni los tobillos.',
    };
  }

  const indexes = sideKeypoints[side];
  const shoulder = keypoints[indexes.shoulder];
  const elbow = keypoints[indexes.elbow];
  const wrist = keypoints[indexes.wrist];
  const hip = keypoints[indexes.hip];
  const knee = keypoints[indexes.knee];
  const elbowAngle = calculateAngle(shoulder, elbow, wrist);
  const elbowTorsoAngle = calculateAngle(hip, shoulder, elbow);
  const bodyLineAngle = calculateAngle(shoulder, hip, knee);
  const torsoLean = calculateForwardLeanAngle(shoulder, hip);

  if (
    elbowAngle === null
    || elbowTorsoAngle === null
    || bodyLineAngle === null
    || torsoLean === null
  ) {
    return {
      tone: 'checking',
      message: 'Mantén visibles las articulaciones',
      detail: 'Necesitamos hombro, codo, muñeca, cadera y rodilla para medir el remo sin usar cabeza ni tobillos.',
    };
  }

  if (
    bodyLineAngle < AUSTRALIAN_ROW_BODY_LINE_MIN_ANGLE
    || bodyLineAngle > AUSTRALIAN_ROW_BODY_LINE_MAX_ANGLE
  ) {
    return {
      tone: 'warning',
      message: 'Mantén el cuerpo en línea',
      detail: `La línea hombro–cadera–rodilla está a ${bodyLineAngle}°. Evita que la cadera se hunda o se eleve.`,
    };
  }
  if (
    torsoLean < AUSTRALIAN_ROW_TORSO_MIN_LEAN
    || torsoLean > AUSTRALIAN_ROW_TORSO_MAX_LEAN
  ) {
    return {
      tone: 'warning',
      message: 'Coloca el cuerpo más paralelo al suelo',
      detail: `La inclinación del torso está a ${torsoLean}°. Ajusta el apoyo para formar una línea firme y horizontal.`,
    };
  }
  if (elbowTorsoAngle > AUSTRALIAN_ROW_ELBOW_TORSO_MAX_ANGLE) {
    return {
      tone: 'warning',
      message: 'Acerca los codos al torso',
      detail: `La separación del codo está a ${elbowTorsoAngle}°. Tira manteniendo los codos entre ${AUSTRALIAN_ROW_ELBOW_TORSO_MIN_ANGLE}° y ${AUSTRALIAN_ROW_ELBOW_TORSO_MAX_ANGLE}°.`,
    };
  }
  if (elbowTorsoAngle < AUSTRALIAN_ROW_ELBOW_TORSO_MIN_ANGLE) {
    return {
      tone: 'warning',
      message: 'No cierres demasiado los codos',
      detail: `La separación del codo está a ${elbowTorsoAngle}°. Deja que los brazos sigan una trayectoria natural junto al torso.`,
    };
  }

  return {
    tone: 'success',
    message: 'Remo australiano elevado correcto',
    detail: `Cuerpo ${bodyLineAngle}° · codos ${elbowTorsoAngle}° · flexión ${elbowAngle}°. Acerca el pecho al apoyo y regresa con control.`,
  };
}

function isElevatedAustralianRowTechniqueValid(
  keypoints: PosePoint[] | undefined,
  side: PoseSide | null,
) {
  if (!keypoints || !side) return false;

  const indexes = sideKeypoints[side];
  const bodyPoints = [
    keypoints[indexes.shoulder],
    keypoints[indexes.hip],
    keypoints[indexes.knee],
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

  const bodyLineAngle = calculateAngle(
    keypoints[indexes.shoulder],
    keypoints[indexes.hip],
    keypoints[indexes.knee],
  );
  const torsoLean = calculateForwardLeanAngle(
    keypoints[indexes.shoulder],
    keypoints[indexes.hip],
  );
  const elbowTorsoAngle = calculateAngle(
    keypoints[indexes.hip],
    keypoints[indexes.shoulder],
    keypoints[indexes.elbow],
  );

  return bodyLineAngle !== null
    && torsoLean !== null
    && elbowTorsoAngle !== null
    && isWithinAngle(bodyLineAngle, AUSTRALIAN_ROW_BODY_LINE_MIN_ANGLE, AUSTRALIAN_ROW_BODY_LINE_MAX_ANGLE)
    && isWithinAngle(torsoLean, AUSTRALIAN_ROW_TORSO_MIN_LEAN, AUSTRALIAN_ROW_TORSO_MAX_LEAN)
    && isWithinAngle(
      elbowTorsoAngle,
      AUSTRALIAN_ROW_ELBOW_TORSO_MIN_ANGLE,
      AUSTRALIAN_ROW_ELBOW_TORSO_MAX_ANGLE,
    );
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

  const shoulderCoordinates = getAngleMeasurementCoordinates(shoulder);
  const hipCoordinates = getAngleMeasurementCoordinates(hip);
  const ankleCoordinates = getAngleMeasurementCoordinates(ankle);
  if (!shoulderCoordinates || !hipCoordinates || !ankleCoordinates) return null;
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

  const firstCoordinates = getAngleMeasurementCoordinates(first);
  const secondCoordinates = getAngleMeasurementCoordinates(second);
  if (!firstCoordinates || !secondCoordinates) return null;
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
    exercise === 'prensa-piernas'
    || exercise === 'extensiones-maquina'
    || exercise === 'curl-femoral'
    || exercise === 'crunch-invertido'
    || exercise === 'rueda-abdominal'
  ) {
    return calculateAngle(
      keypoints[indexes.hip],
      keypoints[indexes.knee],
      keypoints[indexes.ankle],
    );
  }
  if (exercise === 'elevacion-talones-pie' || exercise === 'maquina-aductores') {
    return calculateAngle(
      keypoints[indexes.knee],
      keypoints[indexes.ankle],
      keypoints[MUSCLE_UP_FOOT_INDEX[side]],
    );
  }
  if (exercise === 'peso-muerto-rumano' || exercise === 'peso-muerto-piernas-rigidas') {
    return calculateAngle(
      keypoints[indexes.shoulder],
      keypoints[indexes.hip],
      keypoints[indexes.knee],
    );
  }
  if (exercise === 'hip-thrust-barra') {
    return calculateAngle(
      keypoints[indexes.shoulder],
      keypoints[indexes.hip],
      keypoints[indexes.knee],
    );
  }
  if (exercise === 'elevaciones-piernas-barra' || exercise === 'barra-reloj') {
    return calculateAngle(
      keypoints[indexes.shoulder],
      keypoints[indexes.hip],
      keypoints[indexes.knee],
    );
  }
  if (exercise === 'elevaciones-piernas-suelo') {
    return calculateAngle(
      keypoints[indexes.shoulder],
      keypoints[indexes.hip],
      keypoints[indexes.knee],
    );
  }
  if (
    exercise === 'elevaciones-laterales'
    || exercise === 'elevaciones-laterales-polea-baja'
    || exercise === 'cruces-polea-baja-alta'
  ) {
    return calculateAngle(
      keypoints[indexes.hip],
      keypoints[indexes.shoulder],
      keypoints[indexes.elbow],
    );
  }
  if (exercise === 'press-hombros-maquina') {
    return calculateAngle(
      keypoints[indexes.hip],
      keypoints[indexes.shoulder],
      keypoints[indexes.elbow],
    );
  }
  if (exercise === 'press-plano-mancuernas') {
    return calculateDumbbellPressAverageAngle(keypoints);
  }
  if (exercise === 'pull-over-polea-alta') {
    return calculateAngle(
      keypoints[indexes.hip],
      keypoints[indexes.shoulder],
      keypoints[indexes.elbow],
    );
  }
  if (
    exercise === 'fondos'
    || exercise === 'dominadas'
    || exercise === 'dominadas-supinas'
    || exercise === 'dominadas-comando'
    || exercise === 'jalon'
    || exercise === 'remo-barra'
    || exercise === 'remos-australianos-elevados'
    || exercise === 'flexiones'
    || exercise === 'flexiones-declinadas'
    || exercise === 'flexiones-pica'
    || exercise === 'press-militar'
    || exercise === 'triceps-polea-alta'
    || exercise === 'triceps-tras-nuca-polea-alta'
    || exercise === 'copa-mancuernas'
    || exercise === 'extension-horizontal-barra'
    || exercise === 'curl-biceps'
    || exercise === 'curl-inverso-barra'
    || exercise === 'curl-muneca-sentado'
    || exercise === 'rodillo-muneca'
    || exercise === 'zancadas'
    || exercise === 'zancada-banco'
  ) {
    if (
      exercise === 'flexiones'
      || exercise === 'flexiones-declinadas'
      || exercise === 'flexiones-pica'
    ) {
      return calculateAngle(
        keypoints[indexes.shoulder],
        keypoints[indexes.elbow],
        keypoints[indexes.wrist],
      );
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
    if (exercise === 'curl-muneca-sentado' || exercise === 'rodillo-muneca') {
      return calculateAngle(
        keypoints[indexes.elbow],
        keypoints[indexes.wrist],
        keypoints[WRIST_TIP_INDEX[side]],
      );
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

  if (exercise === 'press-plano-mancuernas') {
    return calculateDumbbellPressAverageAngle(keypoints);
  }

  if (exercise === 'press-hombros-maquina') {
    return calculateShoulderMachinePressAverageAngle(keypoints);
  }

  if (exercise === 'zancadas' || exercise === 'zancada-banco') {
    return calculateAngle(
      keypoints[indexes.hip],
      keypoints[indexes.knee],
      keypoints[indexes.ankle],
    );
  }

  if (exercise === 'plancha') return null;

  if (exercise === 'curl-muneca-sentado' || exercise === 'rodillo-muneca') {
    return calculateAngle(
      keypoints[indexes.elbow],
      keypoints[indexes.wrist],
      keypoints[WRIST_TIP_INDEX[side]],
    );
  }

  if (exercise === 'curl-femoral') {
    return calculateAngle(
      keypoints[indexes.hip],
      keypoints[indexes.knee],
      keypoints[indexes.ankle],
    );
  }

  if (exercise === 'crunch-invertido') {
    return calculateAngle(
      keypoints[indexes.hip],
      keypoints[indexes.knee],
      keypoints[indexes.ankle],
    );
  }

  if (exercise === 'rueda-abdominal') {
    return calculateAngle(
      keypoints[indexes.hip],
      keypoints[indexes.knee],
      keypoints[indexes.ankle],
    );
  }
  if (exercise === 'elevaciones-piernas-barra' || exercise === 'barra-reloj') {
    return calculateAngle(
      keypoints[indexes.shoulder],
      keypoints[indexes.hip],
      keypoints[indexes.knee],
    );
  }
  if (exercise === 'elevaciones-piernas-suelo') {
    return calculateAngle(
      keypoints[indexes.shoulder],
      keypoints[indexes.hip],
      keypoints[indexes.knee],
    );
  }
  if (exercise === 'peso-muerto-rumano' || exercise === 'peso-muerto-piernas-rigidas') {
    return calculateAngle(
      keypoints[indexes.shoulder],
      keypoints[indexes.hip],
      keypoints[indexes.knee],
    );
  }

  if (exercise === 'hip-thrust-barra') {
    return calculateAngle(
      keypoints[indexes.shoulder],
      keypoints[indexes.hip],
      keypoints[indexes.knee],
    );
  }

  if (exercise === 'elevaciones-laterales' || exercise === 'elevaciones-laterales-polea-baja') {
    return calculateAngle(
      keypoints[indexes.hip],
      keypoints[indexes.shoulder],
      keypoints[indexes.elbow],
    );
  }

  if (exercise === 'jalon') {
    return calculateAngle(
      keypoints[indexes.hip],
      keypoints[indexes.shoulder],
      keypoints[indexes.elbow],
    );
  }
  if (exercise === 'pull-over-polea-alta') {
    return calculateAngle(
      keypoints[indexes.hip],
      keypoints[indexes.shoulder],
      keypoints[indexes.elbow],
    );
  }

  if (
    exercise === 'flexiones'
    || exercise === 'flexiones-declinadas'
    || exercise === 'flexiones-pica'
  ) {
    return calculateAngle(
      keypoints[indexes.shoulder],
      keypoints[indexes.elbow],
      keypoints[indexes.wrist],
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
  const labels: Record<ExerciseId, Array<{ label: string; joint: TrackedJoint }>> = {
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
    'dominadas-comando': [
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
      { label: 'Muñeca', joint: 'wrist' },
      { label: 'Cabeza', joint: 'head' },
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
    'pull-over-polea-alta': [
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
      { label: 'Cadera', joint: 'hip' },
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
    'remos-australianos-elevados': [
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
      { label: 'Muñeca', joint: 'wrist' },
      { label: 'Cadera', joint: 'hip' },
      { label: 'Rodilla', joint: 'knee' },
    ],
    'remo-sentado-polea-agarre-cerrado': [
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
      { label: 'Muñeca', joint: 'wrist' },
    ],
    'remo-mancuerna-una-mano': [
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
      { label: 'Cadera', joint: 'hip' },
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
    'elevaciones-laterales': [
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
      { label: 'Muñeca', joint: 'wrist' },
    ],
    'elevaciones-laterales-polea-baja': [
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
      { label: 'Muñeca', joint: 'wrist' },
    ],
    'pajaros-mancuernas': [
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
      { label: 'Muñeca', joint: 'wrist' },
      { label: 'Cadera', joint: 'hip' },
    ],
    'press-hombros-maquina': [
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
      { label: 'Muñeca', joint: 'wrist' },
    ],
    'face-pulls-polea-alta': [
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
      { label: 'Muñeca', joint: 'wrist' },
    ],
    'aperturas-inversas-maquina': [
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
      { label: 'Muñeca', joint: 'wrist' },
    ],
    'cruces-polea-baja-alta': [
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
      { label: 'Muñeca', joint: 'wrist' },
    ],
    'press-banca': [
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
      { label: 'Muñeca', joint: 'wrist' },
      { label: 'Cadera', joint: 'hip' },
    ],
    'press-banca-agarre-cerrado': [
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
      { label: 'Muñeca', joint: 'wrist' },
    ],
    'press-banca-inclinado': [
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
      { label: 'Muñeca', joint: 'wrist' },
    ],
    'press-plano-mancuernas': [
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
      { label: 'Muñeca', joint: 'wrist' },
    ],
    'press-plano-inclinado': [
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
      { label: 'Muñeca', joint: 'wrist' },
    ],
    'press-pallof-polea-banda': [
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
      { label: 'Muñeca', joint: 'wrist' },
    ],
    'triceps-polea-alta': [
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
      { label: 'Muñeca', joint: 'wrist' },
    ],
    'triceps-tras-nuca-polea-alta': [
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
      { label: 'Muñeca', joint: 'wrist' },
    ],
    'copa-mancuernas': [
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
    'curl-inclinado-mancuernas': [
      { label: 'Hombros', joint: 'shoulder' },
      { label: 'Codos', joint: 'elbow' },
      { label: 'Muñecas', joint: 'wrist' },
    ],
    'curl-predicador': [
      { label: 'Hombros', joint: 'shoulder' },
      { label: 'Codos', joint: 'elbow' },
      { label: 'Muñecas', joint: 'wrist' },
    ],
    'curl-arana': [
      { label: 'Hombros', joint: 'shoulder' },
      { label: 'Codos', joint: 'elbow' },
      { label: 'Muñecas', joint: 'wrist' },
    ],
    'curl-martillo': [
      { label: 'Hombros', joint: 'shoulder' },
      { label: 'Codos', joint: 'elbow' },
      { label: 'Muñecas', joint: 'wrist' },
    ],
    'curl-inverso-barra': [
      { label: 'Hombros', joint: 'shoulder' },
      { label: 'Codos', joint: 'elbow' },
      { label: 'Muñecas', joint: 'wrist' },
    ],
    'curl-muneca-sentado': [
      { label: 'Hombros', joint: 'shoulder' },
      { label: 'Codos', joint: 'elbow' },
      { label: 'Muñecas', joint: 'wrist' },
    ],
    'rodillo-muneca': [
      { label: 'Hombros', joint: 'shoulder' },
      { label: 'Codos', joint: 'elbow' },
      { label: 'Muñecas', joint: 'wrist' },
    ],
    sentadillas: [
      { label: 'Cadera', joint: 'hip' },
      { label: 'Rodilla', joint: 'knee' },
      { label: 'Tobillo', joint: 'ankle' },
    ],
    'prensa-piernas': [
      { label: 'Rodilla', joint: 'knee' },
      { label: 'Tobillo', joint: 'ankle' },
    ],
    'extensiones-maquina': [
      { label: 'Rodilla', joint: 'knee' },
      { label: 'Tobillo', joint: 'ankle' },
    ],
    'curl-femoral': [
      { label: 'Rodilla', joint: 'knee' },
      { label: 'Tobillo', joint: 'ankle' },
    ],
    'elevacion-talones-pie': [
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Cadera', joint: 'hip' },
      { label: 'Rodilla', joint: 'knee' },
      { label: 'Tobillo', joint: 'ankle' },
      { label: 'Pie', joint: 'foot' },
    ],
    'maquina-aductores': [
      { label: 'Tobillo', joint: 'ankle' },
    ],
    'hip-thrust-barra': [
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
      { label: 'Muñeca', joint: 'wrist' },
      { label: 'Cadera', joint: 'hip' },
      { label: 'Rodilla', joint: 'knee' },
      { label: 'Tobillo', joint: 'ankle' },
    ],
    'peso-muerto-rumano': [
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
      { label: 'Muñeca', joint: 'wrist' },
      { label: 'Cadera', joint: 'hip' },
      { label: 'Rodilla', joint: 'knee' },
      { label: 'Tobillo', joint: 'ankle' },
    ],
    'peso-muerto-piernas-rigidas': [
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
      { label: 'Muñeca', joint: 'wrist' },
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
    'crunch-invertido': [
      { label: 'Cadera', joint: 'hip' },
      { label: 'Rodilla', joint: 'knee' },
      { label: 'Tobillo', joint: 'ankle' },
    ],
    'rueda-abdominal': [
      { label: 'Cabeza', joint: 'head' },
      { label: 'Hombros', joint: 'shoulder' },
      { label: 'Codos', joint: 'elbow' },
      { label: 'Muñecas', joint: 'wrist' },
      { label: 'Cadera', joint: 'hip' },
      { label: 'Rodilla', joint: 'knee' },
      { label: 'Tobillo', joint: 'ankle' },
    ],
    'elevaciones-piernas-barra': [
      { label: 'Hombros', joint: 'shoulder' },
      { label: 'Codos', joint: 'elbow' },
      { label: 'Muñecas', joint: 'wrist' },
      { label: 'Caderas', joint: 'hip' },
      { label: 'Rodillas', joint: 'knee' },
      { label: 'Tobillos', joint: 'ankle' },
      { label: 'Pies', joint: 'foot' },
    ],
    'barra-reloj': [
      { label: 'Hombros', joint: 'shoulder' },
      { label: 'Codos', joint: 'elbow' },
      { label: 'Muñecas', joint: 'wrist' },
      { label: 'Caderas', joint: 'hip' },
      { label: 'Rodillas', joint: 'knee' },
      { label: 'Tobillos', joint: 'ankle' },
      { label: 'Pies', joint: 'foot' },
    ],
    'elevaciones-piernas-suelo': [
      { label: 'Cadera', joint: 'hip' },
      { label: 'Rodilla', joint: 'knee' },
      { label: 'Tobillo', joint: 'ankle' },
    ],
    'giros-rusos': [
      { label: 'Hombros', joint: 'shoulder' },
      { label: 'Codos', joint: 'elbow' },
      { label: 'Muñecas', joint: 'wrist' },
      { label: 'Caderas', joint: 'hip' },
      { label: 'Rodillas', joint: 'knee' },
      { label: 'Tobillos', joint: 'ankle' },
    ],
  };
  const indexes = side ? sideKeypoints[side] : null;
  const diagnosticJoints: TrackedJointDefinition[] = getExercise(exercise)?.trackedJoints
    ?? labels[exercise];

  return diagnosticJoints.map(({ label, joint }) => {
    const pointIndex = joint === 'head'
      ? 0
      : joint === 'foot'
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
  unit: '°' | '' = '°',
): LiveAngleReading {
  return { label, value, target, min, max, unit };
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
  const headPoints = HEAD_LANDMARK_INDICES
    .map((index) => keypoints?.[index])
    .filter((point): point is PosePoint => (point?.score ?? 0) >= 0.2);
  const wrists = [sideKeypoints.left.wrist, sideKeypoints.right.wrist]
    .map((index) => keypoints?.[index]);

  if (
    headPoints.length < 2
    || wrists.some((wrist) => (wrist?.score ?? 0) < 0.2)
  ) {
    return null;
  }

  const headCenterY = headPoints.reduce((sum, point) => sum + point.y, 0) / headPoints.length;
  const averageWristY = wrists.reduce((sum, wrist) => sum + (wrist?.y ?? 0), 0) / wrists.length;
  return headCenterY < averageWristY;
}

function isPullupBarDetached(keypoints: PosePoint[] | undefined) {
  if (!keypoints) return false;

  const nose = keypoints[0];
  const leftWrist = keypoints[sideKeypoints.left.wrist];
  const rightWrist = keypoints[sideKeypoints.right.wrist];
  const leftShoulder = keypoints[sideKeypoints.left.shoulder];
  const rightShoulder = keypoints[sideKeypoints.right.shoulder];
  const requiredPoints = [nose, leftWrist, rightWrist, leftShoulder, rightShoulder];

  if (requiredPoints.some((point) => (point?.score ?? 0) < 0.2)) {
    return false;
  }

  const shoulderSpan = Math.abs(leftShoulder.x - rightShoulder.x);
  const shoulderDropMargin = Math.max(
    PULLUP_BAR_DETACH_MIN_SHOULDER_MARGIN_PX,
    shoulderSpan * PULLUP_BAR_DETACH_SHOULDER_MARGIN_RATIO,
  );

  // Mientras el usuario está suspendido, ambas muñecas deben permanecer
  // cerca o por encima de los hombros. Al soltar la barra, los brazos caen
  // y las dos muñecas pasan claramente debajo de los hombros y de la cabeza.
  const bothWristsBelowShoulders = (
    leftWrist.y > leftShoulder.y + shoulderDropMargin
    && rightWrist.y > rightShoulder.y + shoulderDropMargin
  );
  const bothWristsBelowHead = leftWrist.y > nose.y && rightWrist.y > nose.y;

  return bothWristsBelowShoulders && bothWristsBelowHead;
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

function calculatePullupBilateralElbowAngle(
  keypoints: PosePoint[] | undefined,
) {
  return calculatePullupElbowAngles(keypoints).averagedRawAngle;
}

function calculatePullupElbowAngles(keypoints: PosePoint[] | undefined) {
  if (!keypoints) {
    return { left: null, right: null, averagedRawAngle: null };
  }

  const left = calculateAngle(
    keypoints[sideKeypoints.left.shoulder],
    keypoints[sideKeypoints.left.elbow],
    keypoints[sideKeypoints.left.wrist],
  );
  const right = calculateAngle(
    keypoints[sideKeypoints.right.shoulder],
    keypoints[sideKeypoints.right.elbow],
    keypoints[sideKeypoints.right.wrist],
  );

  return {
    left,
    right,
    averagedRawAngle: left === null || right === null
      ? null
      : Math.round((left + right) / 2),
  };
}

function getPullupDiagnosticBlockingReasons(
  keypoints: PosePoint[] | undefined,
  exerciseStarted: boolean,
  frameDetectionStable: boolean,
  viewBlocksFrame: boolean,
  visiblePoints: number,
  averagedRawAngle: number | null,
  allowPersistentAnchoredPoints = false,
) {
  const reasons: string[] = [];
  const trackedPoints = [
    {
      label: 'muñeca izquierda',
      point: keypoints?.[sideKeypoints.left.wrist],
      minimumScore: 0.2,
      lowConfidenceReason: null,
    },
    {
      label: 'muñeca derecha',
      point: keypoints?.[sideKeypoints.right.wrist],
      minimumScore: 0.2,
      lowConfidenceReason: null,
    },
    {
      label: 'codo izquierdo',
      point: keypoints?.[sideKeypoints.left.elbow],
      minimumScore: CAMERA_POINT_MIN_SCORE,
      lowConfidenceReason: 'codo izquierdo con confianza baja',
    },
    {
      label: 'codo derecho',
      point: keypoints?.[sideKeypoints.right.elbow],
      minimumScore: CAMERA_POINT_MIN_SCORE,
      lowConfidenceReason: 'codo derecho con confianza baja',
    },
    {
      label: 'hombro izquierdo',
      point: keypoints?.[sideKeypoints.left.shoulder],
      minimumScore: CAMERA_POINT_MIN_SCORE,
      lowConfidenceReason: 'hombro izquierdo con confianza baja',
    },
    {
      label: 'hombro derecho',
      point: keypoints?.[sideKeypoints.right.shoulder],
      minimumScore: CAMERA_POINT_MIN_SCORE,
      lowConfidenceReason: 'hombro derecho con confianza baja',
    },
  ];

  trackedPoints.forEach(({ label, point, minimumScore, lowConfidenceReason }) => {
    if (!point) {
      reasons.push(`${label} no visible`);
      return;
    }
    if (isHeldPoint(point)) {
      if (allowPersistentAnchoredPoints && point.heldReason === 'persistent') return;
      const heldReason = point.heldReason ? ` (${point.heldReason})` : '';
      reasons.push(
        `punto retenido por filtro: ${label}${heldReason}`,
      );
      return;
    }
    if ((point.score ?? 0) < minimumScore) {
      if (lowConfidenceReason) reasons.push(lowConfidenceReason);
      else reasons.push(`${label} no visible`);
    }
  });

  const visibleHeadLandmarks = HEAD_LANDMARK_INDICES.filter((index) => (
    (keypoints?.[index]?.score ?? 0) >= 0.2
  ));
  if (visibleHeadLandmarks.length < 2) {
    reasons.push('cabeza no visible');
  }

  [
    {
      label: 'cadera izquierda',
      point: keypoints?.[sideKeypoints.left.hip],
    },
    {
      label: 'cadera derecha',
      point: keypoints?.[sideKeypoints.right.hip],
    },
  ].forEach(({ label, point }) => {
    if (
      !point
      || (point.score ?? 0) < 0.2
      || getAngleMeasurementCoordinates(point) === null
    ) {
      reasons.push(`${label} no visible`);
    }
  });

  if (viewBlocksFrame) reasons.push('vista incorrecta');
  if (!frameDetectionStable) reasons.push('pose inestable');
  if (visiblePoints < 5) reasons.push('pocos puntos visibles');
  if (averagedRawAngle === null) reasons.push('ángulo no calculable');
  if (!exerciseStarted) reasons.push('ejercicio no iniciado');

  return [...new Set(reasons)];
}

function getPushupDiagnosticBlockingReasons(
  keypoints: PosePoint[] | undefined,
  side: PoseSide | null,
  exerciseStarted: boolean,
  hasFreshPose: boolean,
  frameDetectionStable: boolean,
  frameCameraReady: boolean,
  visiblePoints: number,
  rawAngle: number | null,
  measurementBlocked: boolean,
  cameraMessage: string,
) {
  const reasons: string[] = [];
  const trackedPoints = side
    ? [
        { label: 'hombro', point: keypoints?.[sideKeypoints[side].shoulder] },
        { label: 'codo', point: keypoints?.[sideKeypoints[side].elbow] },
        { label: 'muñeca', point: keypoints?.[sideKeypoints[side].wrist] },
        { label: 'cadera', point: keypoints?.[sideKeypoints[side].hip] },
        { label: 'tobillo', point: keypoints?.[sideKeypoints[side].ankle] },
      ]
    : [];

  if (!hasFreshPose) reasons.push('detección nueva ausente');
  if (!side) reasons.push('lado de medición no fijado');

  trackedPoints.forEach(({ label, point }) => {
    if (!point) {
      reasons.push(`${label} no visible`);
      return;
    }
    if (isHeldPoint(point)) {
      reasons.push(
        `punto retenido por filtro: ${label} (${point.heldReason ?? 'retenido'})`,
      );
      return;
    }
    if ((point.score ?? 0) < CAMERA_POINT_MIN_SCORE) {
      reasons.push(`${label} con confianza baja`);
    }
  });

  if (!frameCameraReady) {
    reasons.push(`cámara no lista${cameraMessage ? `: ${cameraMessage}` : ''}`);
  }
  if (!frameDetectionStable) reasons.push('pose inestable');
  if (visiblePoints < 5) reasons.push('pocos puntos visibles');
  if (rawAngle === null) reasons.push('ángulo no calculable');
  if (!exerciseStarted) reasons.push('ejercicio no iniciado');
  if (measurementBlocked && reasons.length === 0) {
    reasons.push('bloqueo de medición activo');
  }

  return [...new Set(reasons)];
}

function getPushupHeldMeasurementPoints(
  keypoints: PosePoint[] | undefined,
  side: PoseSide | null,
) {
  if (!keypoints || !side) return [];

  const indexes = sideKeypoints[side];
  return [
    { label: 'hombro', point: keypoints[indexes.shoulder] },
    { label: 'codo', point: keypoints[indexes.elbow] },
    { label: 'muñeca', point: keypoints[indexes.wrist] },
    { label: 'cadera', point: keypoints[indexes.hip] },
    { label: 'tobillo', point: keypoints[indexes.ankle] },
  ]
    .filter(({ point }) => isHeldPoint(point))
    .map(({ label }) => label);
}

function calculateExtremityAngleReadings(
  exercise: ExerciseId | null,
  keypoints: PosePoint[] | undefined,
  dominantSide: PoseSide | null,
): LiveAngleReading[] {
  const definition = getExercise(exercise);
  if (!definition) return [];

  if (exercise === 'elevacion-talones-pie') {
    const emptyReading = (label: string): LiveAngleReading => (
      createLiveAngleReading(label, null, 'Seguimiento de elevación')
    );
    if (!keypoints || !dominantSide) {
      return ['Torso', 'Rodilla', 'Tobillo'].map(emptyReading);
    }

    const indexes = sideKeypoints[dominantSide];
    const footMeasurement = calculateFootMeasurement(keypoints, dominantSide);
    return [
      createLiveAngleReading(
        'Torso',
        calculateForwardLeanAngle(
          keypoints[indexes.shoulder],
          keypoints[indexes.hip],
        ),
        'Alineación respecto a la vertical',
      ),
      createLiveAngleReading(
        'Rodilla',
        calculateAngle(
          keypoints[indexes.hip],
          keypoints[indexes.knee],
          keypoints[indexes.ankle],
        ),
        'Estable durante la elevación',
      ),
      createLiveAngleReading(
        'Tobillo',
        footMeasurement?.ankleAngle ?? calculateAngle(
            keypoints[indexes.knee],
            keypoints[indexes.ankle],
            keypoints[MUSCLE_UP_FOOT_INDEX[dominantSide]],
          ),
        'Elevación del talón',
      ),
      createLiveAngleReading(
        'Altura talón',
        footMeasurement ? Math.round(footMeasurement.heelLiftRatio * 100) / 100 : null,
        'WORLD 3D · 0 suelo · ≥0.25 arriba',
        undefined,
        undefined,
        '',
      ),
    ];
  }

  const sides: PoseSide[] = definition.trackBothSides
    ? ['left', 'right']
    : dominantSide
      ? [dominantSide]
      : [];
  const joints = definition.trackedJoints.filter(({ joint }) => (
    joint !== 'foot' || exercise === 'barra-reloj'
  ));
  const shortSide = (side: PoseSide) => side === 'left' ? 'izq.' : 'der.';
  const singularLabel = (label: string) => label.endsWith('s')
    ? label.slice(0, -1)
    : label;
  const emptyReading = (label: string): LiveAngleReading => (
    createLiveAngleReading(label, null, 'Ángulo articular')
  );

  if (!keypoints || !sides.length) {
    return joints.flatMap(({ label }) => (
      definition.trackBothSides
        ? [emptyReading(`${singularLabel(label)} izq.`), emptyReading(`${singularLabel(label)} der.`)]
        : [emptyReading(singularLabel(label))]
    ));
  }

  return sides.flatMap((side) => {
    const indexes = sideKeypoints[side];
    const pointFor = (joint: TrackedJoint) => {
      switch (joint) {
        case 'hip':
          return [
            keypoints[indexes.shoulder],
            keypoints[indexes.hip],
            keypoints[indexes.knee],
          ] as const;
        case 'shoulder':
          return [
            keypoints[indexes.hip],
            keypoints[indexes.shoulder],
            keypoints[indexes.elbow],
          ] as const;
        case 'elbow':
          return [
            keypoints[indexes.shoulder],
            keypoints[indexes.elbow],
            keypoints[indexes.wrist],
          ] as const;
        case 'wrist':
          return [
            keypoints[indexes.elbow],
            keypoints[indexes.wrist],
            keypoints[WRIST_TIP_INDEX[side]],
          ] as const;
        case 'knee':
          return [
            keypoints[indexes.hip],
            keypoints[indexes.knee],
            keypoints[indexes.ankle],
          ] as const;
        case 'ankle':
          return [
            keypoints[indexes.knee],
            keypoints[indexes.ankle],
            keypoints[MUSCLE_UP_FOOT_INDEX[side]],
          ] as const;
        case 'foot':
          return [
            keypoints[indexes.ankle],
            keypoints[MUSCLE_UP_FOOT_INDEX[side]],
            keypoints[FOOT_HEEL_INDEX[side]],
          ] as const;
        default:
          return [undefined, undefined, undefined] as const;
      }
    };

    return joints.map(({ joint, label }) => {
      const [first, center, last] = pointFor(joint);
      const sideLabel = definition.trackBothSides ? ` ${shortSide(side)}` : '';
      const target = exercise === 'press-plano-mancuernas' && joint === 'elbow'
        ? `Inicio ${DUMBBELL_PRESS_START_MIN_ANGLE}–${DUMBBELL_PRESS_START_MAX_ANGLE}° · final ${DUMBBELL_PRESS_END_MIN_ANGLE}–${DUMBBELL_PRESS_END_MAX_ANGLE}°`
        : exercise === 'press-hombros-maquina' && joint === 'shoulder'
          ? `Inicio ${SHOULDER_MACHINE_PRESS_ACCEPTED_START_MIN_ANGLE}–${SHOULDER_MACHINE_PRESS_ACCEPTED_START_MAX_ANGLE}° · final ${SHOULDER_MACHINE_PRESS_ACCEPTED_END_MIN_ANGLE}–${SHOULDER_MACHINE_PRESS_ACCEPTED_END_MAX_ANGLE}° · tolerancia ±${SHOULDER_MACHINE_PRESS_TOLERANCE}°`
          : exercise === 'press-hombros-maquina' && joint === 'wrist'
            ? `Alineación ${SHOULDER_MACHINE_PRESS_ACCEPTED_WRIST_MIN_ANGLE}–${SHOULDER_MACHINE_PRESS_ACCEPTED_WRIST_MAX_ANGLE}°`
        : 'Ángulo articular';
      const value = joint === 'ankle'
        && exercise !== null
        && FOOT_REFINEMENT_EXERCISES.has(exercise)
        ? calculateFootMeasurement(keypoints, side)?.ankleAngle ?? calculateAngle(first, center, last)
        : calculateAngle(first, center, last);
      return createLiveAngleReading(
        `${singularLabel(label)}${sideLabel}`,
        value,
        target,
      );
    });
  });
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
          empty('Torso', `${PULLDOWN_TORSO_MIN_ANGLE}–${PULLDOWN_TORSO_MAX_ANGLE}°`),
          empty('Codo', `${PULLDOWN_ELBOW_MIN_ANGLE}–${PULLDOWN_ELBOW_MAX_ANGLE}°`),
          empty('Tirón', `Inicio 130–155° · activa <115° · final ${PULLDOWN_ANGLE_MIN}–${PULLDOWN_ANGLE_MAX}°`),
        ];
      case 'remo-barra':
        return [
          empty('Torso', '30–45°'),
          empty('Rodilla', '150–180°'),
          empty('Codos', '15–30°'),
          empty('Flexión', 'Inicio 145–180° · activa <130° · final 70–115°'),
        ];
      case 'remos-australianos-elevados':
        return [
          empty('Línea corporal', `${AUSTRALIAN_ROW_BODY_LINE_MIN_ANGLE}–${AUSTRALIAN_ROW_BODY_LINE_MAX_ANGLE}°`),
          empty('Torso', `${AUSTRALIAN_ROW_TORSO_MIN_LEAN}–${AUSTRALIAN_ROW_TORSO_MAX_LEAN}° respecto a la vertical`),
          empty('Codos / torso', `${AUSTRALIAN_ROW_ELBOW_TORSO_MIN_ANGLE}–${AUSTRALIAN_ROW_ELBOW_TORSO_MAX_ANGLE}°`),
          empty('Flexión', `Inicio 145–180° · activa <130° · final ${AUSTRALIAN_ROW_END_MIN_ANGLE}–${AUSTRALIAN_ROW_END_MAX_ANGLE}°`),
        ];
      case 'remo-sentado-polea-agarre-cerrado':
        return [
          empty('Hombro izq.', 'Ángulo articular'),
          empty('Hombro der.', 'Ángulo articular'),
          empty('Codo izq.', 'Ángulo articular'),
          empty('Codo der.', 'Ángulo articular'),
          empty('Muñeca izq.', 'Ángulo articular'),
          empty('Muñeca der.', 'Ángulo articular'),
        ];
      case 'remo-mancuerna-una-mano':
        return [
          empty('Hombro', 'Ángulo articular'),
          empty('Codo', 'Ángulo articular'),
          empty('Cadera', 'Ángulo articular'),
          empty('Muñeca', 'Ángulo articular'),
        ];
      case 'flexiones':
      case 'flexiones-declinadas':
        return [
          empty(
            'Codo / torso',
            exercise === 'flexiones'
              ? `${PUSHUP_ELBOW_TORSO_MIN_ANGLE}–${PUSHUP_ELBOW_TORSO_MAX_ANGLE + PUSHUP_ELBOW_TORSO_TOLERANCE}°`
              : '30–60°',
          ),
          empty('Alineación', '162–180°'),
          empty(
            'Flexión',
            `Inicio ${PUSHUP_REP_START_MIN_ANGLE}–${PUSHUP_REP_START_MAX_ANGLE}° · activa <${PUSHUP_REP_ACTIVATION_ANGLE}° · final ${PUSHUP_REP_END_MIN_ANGLE}–${PUSHUP_REP_END_MAX_ANGLE}°`,
          ),
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
          empty(
            'Codo',
            `Inicio ${MILITARY_PRESS_ACCEPTED_START_MIN_ANGLE}–${MILITARY_PRESS_ACCEPTED_START_MAX_ANGLE}° · activa >${MILITARY_PRESS_ACTIVATION_ANGLE}° · final ${MILITARY_PRESS_ACCEPTED_VALID_MIN_ANGLE}–${MILITARY_PRESS_ACCEPTED_VALID_MAX_ANGLE}°`,
          ),
          empty('Codo / torso', '30–60°'),
        ];
      case 'triceps-polea-alta':
        return [
          empty('Codo', 'Inicio 70–120° · activa >135° · final 145–180°'),
          empty('Torso', '160–180°'),
        ];
      case 'triceps-tras-nuca-polea-alta':
        return [
          empty('Hombro', `${OVERHEAD_TRICEPS_SHOULDER_MIN_ANGLE}–${OVERHEAD_TRICEPS_SHOULDER_MAX_ANGLE}° · brazo elevado`),
          empty('Codo', 'Inicio 70–120° · activa >135° · final 145–180°'),
          empty('Muñeca', `Alineada · mínimo ${OVERHEAD_TRICEPS_WRIST_MIN_ANGLE}°`),
        ];
      case 'copa-mancuernas':
        return [
          empty('Hombros', 'Brazos elevados por encima de la cabeza'),
          empty('Codos', 'Inicio / regreso 145–180° · final 70–120°'),
          empty('Muñecas', 'Alineadas con los antebrazos'),
        ];
      case 'extension-horizontal-barra':
        return [empty('Codo', 'Inicio 150–180° · activa <135° · final 70–105°')];
      case 'curl-biceps':
        return [empty('Codo', 'Inicio 85–135° · activa <70° · final 30–60°')];
      case 'curl-inclinado-mancuernas':
        return [
          empty('Hombro izq.', 'Ángulo articular'),
          empty('Hombro der.', 'Ángulo articular'),
          empty('Codo izq.', 'Inicio 85–135° · activa <70° · final 30–60°'),
          empty('Codo der.', 'Inicio 85–135° · activa <70° · final 30–60°'),
          empty('Muñeca izq.', 'Ángulo articular'),
          empty('Muñeca der.', 'Ángulo articular'),
        ];
      case 'curl-predicador':
        return [
          empty('Hombro izq.', 'Ángulo articular'),
          empty('Hombro der.', 'Ángulo articular'),
          empty('Codo izq.', 'Inicio 85–135° · activa <70° · final 30–60°'),
          empty('Codo der.', 'Inicio 85–135° · activa <70° · final 30–60°'),
          empty('Muñeca izq.', 'Ángulo articular'),
          empty('Muñeca der.', 'Ángulo articular'),
        ];
      case 'curl-arana':
        return [
          empty('Hombro izq.', 'Ángulo articular'),
          empty('Hombro der.', 'Ángulo articular'),
          empty('Codo izq.', 'Inicio 85–135° · activa <70° · final 30–60°'),
          empty('Codo der.', 'Inicio 85–135° · activa <70° · final 30–60°'),
          empty('Muñeca izq.', 'Ángulo articular'),
          empty('Muñeca der.', 'Ángulo articular'),
        ];
      case 'curl-martillo':
        return [
          empty('Hombro izq.', 'Ángulo articular'),
          empty('Hombro der.', 'Ángulo articular'),
          empty('Codo izq.', 'Inicio 85–135° · activa <70° · final 30–60°'),
          empty('Codo der.', 'Inicio 85–135° · activa <70° · final 30–60°'),
          empty('Muñeca izq.', 'Ángulo articular'),
          empty('Muñeca der.', 'Ángulo articular'),
        ];
      case 'curl-inverso-barra':
        return [
          empty('Hombro izq.', 'Ángulo articular'),
          empty('Hombro der.', 'Ángulo articular'),
          empty('Codo izq.', 'Inicio 85–135° · activa <70° · final 30–60°'),
          empty('Codo der.', 'Inicio 85–135° · activa <70° · final 30–60°'),
          empty('Muñeca izq.', 'Ángulo articular'),
          empty('Muñeca der.', 'Ángulo articular'),
        ];
      case 'curl-muneca-sentado':
        return [
          empty('Hombro izq.', 'Ángulo articular'),
          empty('Hombro der.', 'Ángulo articular'),
          empty('Codo izq.', 'Ángulo articular'),
          empty('Codo der.', 'Ángulo articular'),
          empty('Muñeca izq.', `Inicio ${WRIST_CURL_START_MIN_ANGLE}–${WRIST_CURL_START_MAX_ANGLE}° · final ${WRIST_CURL_END_MIN_ANGLE}–${WRIST_CURL_END_MAX_ANGLE}°`),
          empty('Muñeca der.', `Inicio ${WRIST_CURL_START_MIN_ANGLE}–${WRIST_CURL_START_MAX_ANGLE}° · final ${WRIST_CURL_END_MIN_ANGLE}–${WRIST_CURL_END_MAX_ANGLE}°`),
        ];
      case 'rodillo-muneca':
        return [
          empty('Hombro izq.', 'Ángulo articular'),
          empty('Hombro der.', 'Ángulo articular'),
          empty('Codo izq.', 'Ángulo articular'),
          empty('Codo der.', 'Ángulo articular'),
          empty('Muñeca izq.', `Inicio ${WRIST_CURL_START_MIN_ANGLE}–${WRIST_CURL_START_MAX_ANGLE}° · final ${WRIST_CURL_END_MIN_ANGLE}–${WRIST_CURL_END_MAX_ANGLE}°`),
          empty('Muñeca der.', `Inicio ${WRIST_CURL_START_MIN_ANGLE}–${WRIST_CURL_START_MAX_ANGLE}° · final ${WRIST_CURL_END_MIN_ANGLE}–${WRIST_CURL_END_MAX_ANGLE}°`),
        ];
      case 'sentadillas':
        return [empty('Rodilla', 'Inicio ≥140° · regreso >115° · fondo 83–90°')];
      case 'prensa-piernas':
      case 'extensiones-maquina':
      case 'curl-femoral':
        return [
          empty('Rodilla izq.', 'Ángulo articular'),
          empty('Rodilla der.', 'Ángulo articular'),
          empty('Tobillo izq.', 'Ángulo articular'),
          empty('Tobillo der.', 'Ángulo articular'),
        ];
      case 'hip-thrust-barra':
        return [
          empty('Hombro izq.', 'Ángulo articular'),
          empty('Hombro der.', 'Ángulo articular'),
          empty('Codo izq.', 'Ángulo articular'),
          empty('Codo der.', 'Ángulo articular'),
          empty('Muñeca izq.', 'Ángulo articular'),
          empty('Muñeca der.', 'Ángulo articular'),
          empty('Cadera izq.', '70–115° abajo · 150–180° arriba'),
          empty('Cadera der.', '70–115° abajo · 150–180° arriba'),
          empty('Rodilla izq.', 'Ángulo articular'),
          empty('Rodilla der.', 'Ángulo articular'),
          empty('Tobillo izq.', 'Ángulo articular'),
          empty('Tobillo der.', 'Ángulo articular'),
        ];
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
  const shoulder = () => calculateAngle(
    keypoints[indexes.hip],
    keypoints[indexes.shoulder],
    keypoints[indexes.elbow],
  );
  const wrist = () => calculateAngle(
    keypoints[indexes.elbow],
    keypoints[indexes.wrist],
    keypoints[WRIST_TIP_INDEX[side ?? 'left']],
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
  const ankle = () => calculateAngle(
    keypoints[indexes.knee],
    keypoints[indexes.ankle],
    keypoints[MUSCLE_UP_FOOT_INDEX[side ?? 'left']],
  );
  const hip = () => calculateAngle(
    keypoints[indexes.shoulder],
    keypoints[indexes.hip],
    keypoints[indexes.knee],
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
        value(
          torso,
          'Torso',
          `${PULLDOWN_TORSO_MIN_ANGLE}–${PULLDOWN_TORSO_MAX_ANGLE}°`,
          PULLDOWN_TORSO_MIN_ANGLE,
          PULLDOWN_TORSO_MAX_ANGLE,
        ),
        value(
          elbow,
          'Codo',
          `${PULLDOWN_ELBOW_MIN_ANGLE}–${PULLDOWN_ELBOW_MAX_ANGLE}°`,
          PULLDOWN_ELBOW_MIN_ANGLE,
          PULLDOWN_ELBOW_MAX_ANGLE,
        ),
        value(
          () => calculateAngle(keypoints[indexes.hip], keypoints[indexes.shoulder], keypoints[indexes.elbow]),
          'Tirón',
          `Inicio ${repetitionConfigs.jalon?.startMinAngle}–${repetitionConfigs.jalon?.startMaxAngle}° · activa <${repetitionConfigs.jalon?.activationAngle}° · final ${PULLDOWN_ANGLE_MIN}–${PULLDOWN_ANGLE_MAX}°`,
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
    case 'remos-australianos-elevados':
      return [
        value(
          () => calculateAngle(keypoints[indexes.shoulder], keypoints[indexes.hip], keypoints[indexes.knee]),
          'Línea corporal',
          `${AUSTRALIAN_ROW_BODY_LINE_MIN_ANGLE}–${AUSTRALIAN_ROW_BODY_LINE_MAX_ANGLE}°`,
          AUSTRALIAN_ROW_BODY_LINE_MIN_ANGLE,
          AUSTRALIAN_ROW_BODY_LINE_MAX_ANGLE,
        ),
        value(
          torso,
          'Torso',
          `${AUSTRALIAN_ROW_TORSO_MIN_LEAN}–${AUSTRALIAN_ROW_TORSO_MAX_LEAN}° respecto a la vertical`,
          AUSTRALIAN_ROW_TORSO_MIN_LEAN,
          AUSTRALIAN_ROW_TORSO_MAX_LEAN,
        ),
        value(
          () => calculateAngle(keypoints[indexes.hip], keypoints[indexes.shoulder], keypoints[indexes.elbow]),
          'Codos / torso',
          `${AUSTRALIAN_ROW_ELBOW_TORSO_MIN_ANGLE}–${AUSTRALIAN_ROW_ELBOW_TORSO_MAX_ANGLE}°`,
          AUSTRALIAN_ROW_ELBOW_TORSO_MIN_ANGLE,
          AUSTRALIAN_ROW_ELBOW_TORSO_MAX_ANGLE,
        ),
        value(
          elbow,
          'Flexión',
          `Inicio 145–180° · activa <130° · final ${AUSTRALIAN_ROW_END_MIN_ANGLE}–${AUSTRALIAN_ROW_END_MAX_ANGLE}°`,
          AUSTRALIAN_ROW_END_MIN_ANGLE,
          AUSTRALIAN_ROW_END_MAX_ANGLE,
        ),
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
        value(
          elbow,
          'Flexión',
          `Inicio ${PUSHUP_REP_START_MIN_ANGLE}–${PUSHUP_REP_START_MAX_ANGLE}° · activa <${PUSHUP_REP_ACTIVATION_ANGLE}° · final ${PUSHUP_REP_END_MIN_ANGLE}–${PUSHUP_REP_END_MAX_ANGLE}°`,
          PUSHUP_REP_END_MIN_ANGLE,
          PUSHUP_REP_END_MAX_ANGLE,
        ),
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
          `Inicio ${MILITARY_PRESS_ACCEPTED_START_MIN_ANGLE}–${MILITARY_PRESS_ACCEPTED_START_MAX_ANGLE}° · activa >${MILITARY_PRESS_ACTIVATION_ANGLE}° · final ${MILITARY_PRESS_ACCEPTED_VALID_MIN_ANGLE}–${MILITARY_PRESS_ACCEPTED_VALID_MAX_ANGLE}°`,
          MILITARY_PRESS_ACCEPTED_VALID_MIN_ANGLE,
          MILITARY_PRESS_ACCEPTED_VALID_MAX_ANGLE,
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
    case 'triceps-tras-nuca-polea-alta':
      return [
        value(
          shoulder,
          'Hombro',
          `Brazo elevado · ${OVERHEAD_TRICEPS_SHOULDER_MIN_ANGLE}–${OVERHEAD_TRICEPS_SHOULDER_MAX_ANGLE}°`,
          OVERHEAD_TRICEPS_SHOULDER_MIN_ANGLE,
          OVERHEAD_TRICEPS_SHOULDER_MAX_ANGLE,
        ),
        value(elbow, 'Codo', 'Inicio 70–120° · activa >135° · final 145–180°', 145, 180),
        value(wrist, 'Muñeca', `Alineada · mínimo ${OVERHEAD_TRICEPS_WRIST_MIN_ANGLE}°`, OVERHEAD_TRICEPS_WRIST_MIN_ANGLE, 180),
      ];
    case 'copa-mancuernas':
      return [
        value(
          shoulder,
          'Hombro',
          `Brazo elevado · ${OVERHEAD_TRICEPS_SHOULDER_MIN_ANGLE}–${OVERHEAD_TRICEPS_SHOULDER_MAX_ANGLE}°`,
          OVERHEAD_TRICEPS_SHOULDER_MIN_ANGLE,
          OVERHEAD_TRICEPS_SHOULDER_MAX_ANGLE,
        ),
        value(elbow, 'Codo', 'Inicio / regreso 145–180° · activa <135° · final 70–120°', 70, 120),
        value(wrist, 'Muñeca', `Alineada · mínimo ${OVERHEAD_TRICEPS_WRIST_MIN_ANGLE}°`, OVERHEAD_TRICEPS_WRIST_MIN_ANGLE, 180),
      ];
    case 'extension-horizontal-barra':
      return [value(elbow, 'Codo', 'Inicio 150–180° · activa <135° · final 70–105°', 70, 105)];
    case 'curl-biceps':
      return [value(elbow, 'Codo', 'Inicio 85–135° · activa <70° · final 30–60°', 30, 60)];
    case 'curl-inclinado-mancuernas':
      return [
        value(shoulder, 'Hombro', 'Hombros apoyados y estables'),
        value(elbow, 'Codo', 'Inicio 85–135° · activa <70° · final 30–60°', 30, 60),
        value(wrist, 'Muñeca', 'Alineada con el antebrazo'),
      ];
    case 'curl-predicador':
      return [
        value(shoulder, 'Hombro', 'Hombros estables junto al banco'),
        value(elbow, 'Codo', 'Inicio 85–135° · activa <70° · final 30–60°', 30, 60),
        value(wrist, 'Muñeca', 'Alineada con el antebrazo'),
      ];
    case 'curl-arana':
      return [
        value(shoulder, 'Hombro', 'Hombros estables sobre el banco'),
        value(elbow, 'Codo', 'Inicio 85–135° · activa <70° · final 30–60°', 30, 60),
        value(wrist, 'Muñeca', 'Alineada con el antebrazo'),
      ];
    case 'curl-martillo':
      return [
        value(shoulder, 'Hombro', 'Hombros estables'),
        value(elbow, 'Codo', 'Inicio 85–135° · activa <70° · final 30–60°', 30, 60),
        value(wrist, 'Muñeca', 'Agarre neutro y muñeca alineada'),
      ];
    case 'curl-inverso-barra':
      return [
        value(shoulder, 'Hombro', 'Ángulo articular'),
        value(elbow, 'Codo', 'Inicio 85–135° · activa <70° · final 30–60°', 30, 60),
        value(wrist, 'Muñeca', 'Alineada con el antebrazo'),
      ];
    case 'curl-muneca-sentado':
      return [
        value(shoulder, 'Hombro', 'Ángulo articular'),
        value(elbow, 'Codo', 'Estable · antebrazo apoyado'),
        value(
          wrist,
          'Muñeca',
          `Inicio ${WRIST_CURL_START_MIN_ANGLE}–${WRIST_CURL_START_MAX_ANGLE}° · final ${WRIST_CURL_END_MIN_ANGLE}–${WRIST_CURL_END_MAX_ANGLE}°`,
          WRIST_CURL_END_MIN_ANGLE,
          WRIST_CURL_END_MAX_ANGLE,
        ),
      ];
    case 'rodillo-muneca':
      return [
        value(shoulder, 'Hombro', 'Ángulo articular'),
        value(elbow, 'Codo', 'Estable durante el recorrido'),
        value(
          wrist,
          'Muñeca',
          `Inicio ${WRIST_CURL_START_MIN_ANGLE}–${WRIST_CURL_START_MAX_ANGLE}° · final ${WRIST_CURL_END_MIN_ANGLE}–${WRIST_CURL_END_MAX_ANGLE}°`,
          WRIST_CURL_END_MIN_ANGLE,
          WRIST_CURL_END_MAX_ANGLE,
        ),
      ];
    case 'sentadillas':
      return [createLiveAngleReading(
        'Rodilla',
        calculateSquatAngle(keypoints),
        'Inicio ≥140° · regreso >115° · fondo 83–90°',
        SQUAT_VALID_MIN_ANGLE,
        SQUAT_VALID_MAX_ANGLE,
      )];
    case 'curl-femoral':
      return [
        value(
          knee,
          'Rodilla',
          `Inicio ${HAMSTRING_CURL_START_MIN_ANGLE}–${HAMSTRING_CURL_START_MAX_ANGLE}° · activa <${HAMSTRING_CURL_ACTIVATION_ANGLE}° · final ${HAMSTRING_CURL_END_MIN_ANGLE}–${HAMSTRING_CURL_END_MAX_ANGLE}°`,
          HAMSTRING_CURL_END_MIN_ANGLE,
          HAMSTRING_CURL_END_MAX_ANGLE,
        ),
        value(ankle, 'Tobillo', 'Ángulo articular'),
      ];
    case 'hip-thrust-barra':
      return [
        value(hip, 'Cadera', 'Abajo 70–115° · activa >125° · arriba 150–180°', HIP_THRUST_TOP_MIN_ANGLE, HIP_THRUST_TOP_MAX_ANGLE),
        value(knee, 'Rodilla', 'Ángulo articular'),
      ];
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
  const recordedCanvasRef = useRef<HTMLCanvasElement>(null);
  const recordingHudStateRef = useRef<VideoRecordingHudState>(
    EMPTY_VIDEO_RECORDING_HUD,
  );
  const detectorFrameCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoUploadInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const uploadedVideoUrlRef = useRef<string | null>(null);
  const uploadedPushupExportSamplesRef = useRef<UploadedPushupExportSample[]>([]);
  const uploadedPushupAnalysisStartingRef = useRef(false);
  const uploadedPushupOfflineAnalysisRef = useRef(false);
  const uploadedPushupExportPlaybackRef = useRef(false);
  const uploadedPushupAnalysisGenerationRef = useRef(0);
  // TEMP: temporización del inicio de reproducción de flexiones subidas.
  const uploadedPushupPlayDiagnosticsRef = useRef<{
    startedAt: number | null;
    handleVideoPlayCalls: number;
    playingListenerAttached: boolean;
  }>({
    startedAt: null,
    handleVideoPlayCalls: 0,
    playingListenerAttached: false,
  });
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recorderStreamRef = useRef<MediaStream | null>(null);
  const recorderCanvasTrackRef = useRef<{
    requestFrame?: () => void;
  } | null>(null);
  const recorderChunksRef = useRef<Blob[]>([]);
  const recorderGenerationRef = useRef(0);
  const detectorRef = useRef<PoseDetector | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const videoFrameCallbackRef = useRef<number | null>(null);
  const processingFrameRef = useRef(false);
  const videoPipelineDiagnosticsRef = useRef({
    sourceFrames: 0,
    lastSourceTime: 0,
    canvasFrames: 0,
    lastCanvasTime: 0,
    captureRequests: 0,
    recorderChunks: 0,
    recorderBytes: 0,
  });
  const activeRef = useRef(false);
  const busyRef = useRef(false);
  const detectorTransitionRef = useRef<Promise<void> | null>(null);
  const cameraFacingModeRef = useRef<CameraFacingMode>('user');
  const [phase, setPhase] = useState<SessionPhase>('exercise-select');
  const [inputMode, setInputMode] = useState<'camera' | 'video'>('camera');
  const inputModeRef = useRef<'camera' | 'video'>('camera');
  const uploadedPushupPreflightRef = useRef(false);
  const [uploadedVideoName, setUploadedVideoName] = useState('');
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
  const processedVideoUrlRef = useRef<string | null>(null);
  const [processedVideoExtension, setProcessedVideoExtension] = useState<'mp4' | 'webm'>('webm');
  const [videoExportStatus, setVideoExportStatus] = useState('');
  const [uploadedAnalysisProgress, setUploadedAnalysisProgress] = useState<number | null>(null);
  const [showUploadedPushupCalibrationNotice, setShowUploadedPushupCalibrationNotice] = useState(false);
  const [uploadedPushupCalibrationHintTimedOut, setUploadedPushupCalibrationHintTimedOut] = useState(false);
  const uploadedPushupCalibrationHintTimerRef = useRef<number | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseId | null>(null);
  const selectedExerciseRef = useRef<ExerciseId | null>(null);
  const [cameraFacingMode, setCameraFacingMode] = useState<CameraFacingMode>('user');
  const exerciseStartedRef = useRef(false);
  const [exerciseStarted, setExerciseStarted] = useState(false);
  const [pullupCalibrationStatus, setPullupCalibrationStatus] = useState<PullupCalibrationStatus>('pending');
  const [poseDetected, setPoseDetected] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [detectionStable, setDetectionStable] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraGuidance, setCameraGuidance] = useState<CameraGuidance>({
    tone: 'checking',
    message: 'Ajustando la cámara',
    detail: 'Mantente dentro del encuadre para validar tu posición.',
  });
  const [pullupPreparationStage, setPullupPreparationStage] = useState<PullupPreparationStage>('body-detection');
  const [pullupPreparationCountdown, setPullupPreparationCountdown] = useState<number | null>(null);
  const [pushupCalibrationStatus, setPushupCalibrationStatus] = useState<PullupCalibrationStatus>('pending');
  const [pushupPreparationStage, setPushupPreparationStage] = useState<PushupPreparationStage>('body-detection');
  const [pushupPreparationCountdown, setPushupPreparationCountdown] = useState<number | null>(null);
  const [videoTimeSeconds, setVideoTimeSeconds] = useState(0);
  const [videoDurationSeconds, setVideoDurationSeconds] = useState(0);
  const [pushupBlockingReasons, setPushupBlockingReasons] = useState<string[]>([]);
  const [pushupRepetitionFrameReady, setPushupRepetitionFrameReady] = useState(false);
  const [pushupStabilityFrames, setPushupStabilityFrames] = useState(0);
  const [pushupHeldMeasurementPoints, setPushupHeldMeasurementPoints] = useState<string[]>([]);
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
  const [debugPanel, setDebugPanel] = useState<DebugPanelSnapshot>(
    createEmptyDebugPanelSnapshot,
  );
  const [viewAlignment, setViewAlignment] = useState<ViewAlignmentState>(
    createInitialViewAlignment,
  );
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
  const [pullupSessionFinished, setPullupSessionFinished] = useState(false);
  const [exerciseRepetitions, setExerciseRepetitions] = useState(0);
  const [exerciseGoodRepetitions, setExerciseGoodRepetitions] = useState(0);
  const [exerciseRepPhase, setExerciseRepPhase] = useState<ExerciseRepPhase>('esperando inicio');
  const [exerciseMinimumAngle, setExerciseMinimumAngle] = useState<number | null>(null);
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);
  const [diagnosticCopyMessage, setDiagnosticCopyMessage] = useState<string | null>(null);
  const [previewExercise, setPreviewExercise] = useState<ExerciseDefinition | null>(null);
  const [expandedMuscleGroups, setExpandedMuscleGroups] = useState<Record<string, boolean>>({});
  const errorCountRef = useRef(0);
  const fpsFramesRef = useRef(0);
  const detectionFrameTimesRef = useRef<number[]>([]);
  const lowFpsSinceRef = useRef<number | null>(null);
  const modelDegradedRef = useRef(false);
  const lastDetectorTimestampRef = useRef(Number.NEGATIVE_INFINITY);
  const lastVideoAnalysisSourceTimeRef = useRef(Number.NEGATIVE_INFINITY);
  const videoSizeRef = useRef({ width: 0, height: 0 });
  const stabilityFramesRef = useRef(0);
  const previousSideRef = useRef<PoseSide | null>(null);
  const sideViewCandidateRef = useRef<PoseSide | null>(null);
  const sideViewStableFramesRef = useRef(0);
  const sideSwitchesRef = useRef(0);
  const primaryPoseTrackRef = useRef<PoseTrack | null>(null);
  const sideConsistencyRef = useRef(createSideConsistencyFilter());
  const boneConstraintRef = useRef(createBoneConstraintFilter());
  const poseFilterRef = useRef(createPoseFilter());
  const debugSessionRef = useRef<LimbDebugSession | null>(
    DEBUG_LIMB_TRACKING_ACTIVE ? new LimbDebugSession() : null,
  );
  const rawPoseForDebugRef = useRef<Pose | undefined>(undefined);
  const viewEstimatorRef = useRef(new ViewEstimator());
  const viewAlignmentGuardRef = useRef(new ViewAlignmentGuard());
  const viewAlignmentRef = useRef<ViewAlignmentState>(createInitialViewAlignment());
  const backViewStableSinceRef = useRef<number | null>(null);
  const reinforceBackToFrontRef = useRef(false);
  const lastViewUiUpdateRef = useRef(0);
  const diagnosticBufferRef = useRef<FrameDiagnosticSnapshot[]>([]);
  const lastPullupDiagnosticLogAtRef = useRef(0);
  const lastVideoTimeUiUpdateRef = useRef(0);
  const pullupDiagnosticBufferRef = useRef<ExerciseDiagnosticSnapshot[]>([]);
  const viewDiagnosticBufferRef = useRef<ViewDiagnosticSnapshot[]>([]);
  const diagnosticCopyMessageTimeoutRef = useRef<number | null>(null);
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
  const pullupSessionFinishedRef = useRef(false);
  const pullupDetachFramesRef = useRef(0);
  const exerciseRepTrackerRef = useRef<ExerciseRepTracker>(createExerciseRepTracker());
  const pullupCalibrationStatusRef = useRef<PullupCalibrationStatus>('pending');
  const pullupCalibrationReadySinceRef = useRef<number | null>(null);
  const pullupCalibrationSuccessfulRef = useRef(false);
  const pullupPreparationStageRef = useRef<PullupPreparationStage>('body-detection');
  const pullupPreparationStartedAtRef = useRef<number | null>(null);
  const pullupPreparationCountdownRef = useRef<number | null>(null);
  const pushupCalibrationStatusRef = useRef<PullupCalibrationStatus>('pending');
  const pushupCalibrationReadySinceRef = useRef<number | null>(null);
  const pushupCalibrationSuccessfulRef = useRef(false);
  const uploadedPushupStartsAtBottomRef = useRef(false);
  const pushupLockedMeasurementSideRef = useRef<PoseSide | null>(null);
  const pushupPreparationStageRef = useRef<PushupPreparationStage>('body-detection');
  const pushupPreparationStartedAtRef = useRef<number | null>(null);
  const pushupPreparationCountdownRef = useRef<number | null>(null);
  const previousFootExerciseRef = useRef<ExerciseId | null>(null);
  const previousFootRatioRef = useRef<number | null>(null);
  const heelRaiseFootPhaseRef = useRef<'up' | 'down' | null>(null);
  const previousLegAngleRef = useRef<number | null>(null);

  const updatePullupCalibrationStatus = useCallback((status: PullupCalibrationStatus) => {
    if (pullupCalibrationStatusRef.current === status) return;
    pullupCalibrationStatusRef.current = status;
    setPullupCalibrationStatus(status);
  }, []);

  const updatePullupPreparationStage = useCallback((stage: PullupPreparationStage) => {
    if (pullupPreparationStageRef.current === stage) return;
    pullupPreparationStageRef.current = stage;
    setPullupPreparationStage(stage);
  }, []);

  const updatePullupPreparationCountdown = useCallback((seconds: number | null) => {
    if (pullupPreparationCountdownRef.current === seconds) return;
    pullupPreparationCountdownRef.current = seconds;
    setPullupPreparationCountdown(seconds);
  }, []);

  const updatePushupCalibrationStatus = useCallback((status: PullupCalibrationStatus) => {
    if (pushupCalibrationStatusRef.current === status) return;
    pushupCalibrationStatusRef.current = status;
    setPushupCalibrationStatus(status);
  }, []);

  const updatePushupPreparationStage = useCallback((stage: PushupPreparationStage) => {
    if (pushupPreparationStageRef.current === stage) return;
    pushupPreparationStageRef.current = stage;
    setPushupPreparationStage(stage);
  }, []);

  const updatePushupPreparationCountdown = useCallback((seconds: number | null) => {
    if (pushupPreparationCountdownRef.current === seconds) return;
    pushupPreparationCountdownRef.current = seconds;
    setPushupPreparationCountdown(seconds);
  }, []);

  const incrementErrorCount = useCallback(() => {
    errorCountRef.current += 1;
    setErrorCount(errorCountRef.current);
  }, []);

  const copyPullupDiagnostics = useCallback(async () => {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API no disponible');
      }
      await navigator.clipboard.writeText(
        JSON.stringify(pullupDiagnosticBufferRef.current, null, 2),
      );
      setDiagnosticCopyMessage('Copiado');
    } catch {
      setDiagnosticCopyMessage('No se pudo copiar');
    }

    if (diagnosticCopyMessageTimeoutRef.current !== null) {
      window.clearTimeout(diagnosticCopyMessageTimeoutRef.current);
    }
    diagnosticCopyMessageTimeoutRef.current = window.setTimeout(() => {
      setDiagnosticCopyMessage(null);
      diagnosticCopyMessageTimeoutRef.current = null;
    }, 1800);
  }, []);

  const copyCombinedDiagnostics = useCallback(async () => {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API no disponible');
      }
      await navigator.clipboard.writeText(
        JSON.stringify(
          {
            format: 'netposture-diagnostic-v3',
            buffers: {
              frames: diagnosticBufferRef.current,
              pullup: pullupDiagnosticBufferRef.current,
              view: viewDiagnosticBufferRef.current,
            },
          },
          null,
          2,
        ),
      );
      setDiagnosticCopyMessage('Copiado');
    } catch {
      setDiagnosticCopyMessage('No se pudo copiar');
    }

    if (diagnosticCopyMessageTimeoutRef.current !== null) {
      window.clearTimeout(diagnosticCopyMessageTimeoutRef.current);
    }
    diagnosticCopyMessageTimeoutRef.current = window.setTimeout(() => {
      setDiagnosticCopyMessage(null);
      diagnosticCopyMessageTimeoutRef.current = null;
    }, 1800);
  }, []);

  const copyViewDiagnostics = useCallback(async () => {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API no disponible');
      }
      await navigator.clipboard.writeText(
        JSON.stringify(viewDiagnosticBufferRef.current, null, 2),
      );
      setDiagnosticCopyMessage('Copiado');
    } catch {
      setDiagnosticCopyMessage('No se pudo copiar');
    }

    if (diagnosticCopyMessageTimeoutRef.current !== null) {
      window.clearTimeout(diagnosticCopyMessageTimeoutRef.current);
    }
    diagnosticCopyMessageTimeoutRef.current = window.setTimeout(() => {
      setDiagnosticCopyMessage(null);
      diagnosticCopyMessageTimeoutRef.current = null;
    }, 1800);
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
    setDebugBoneConstraintsEnabled(DEBUG_LIMB_TRACKING_ACTIVE);
    setDebugSideConsistencyEnabled(DEBUG_LIMB_TRACKING_ACTIVE);
    return () => {
      setDebugBoneConstraintsEnabled(false);
      setDebugSideConsistencyEnabled(false);
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setFps(fpsFramesRef.current);
      fpsFramesRef.current = 0;
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (exerciseStarted) {
      setShowUploadedPushupCalibrationNotice(false);
    }
  }, [exerciseStarted]);

  useEffect(() => () => {
    if (uploadedPushupCalibrationHintTimerRef.current !== null) {
      window.clearTimeout(uploadedPushupCalibrationHintTimerRef.current);
    }
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
    stopUploadedPushupLiveMetrics();
    uploadedPushupAnalysisGenerationRef.current += 1;
    uploadedPushupAnalysisStartingRef.current = false;
    uploadedPushupOfflineAnalysisRef.current = false;
    uploadedPushupExportPlaybackRef.current = false;
    uploadedPushupExportSamplesRef.current = [];
    uploadedPushupPreflightRef.current = false;
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    const video = videoRef.current;
    if (videoFrameCallbackRef.current !== null && video?.cancelVideoFrameCallback) {
      video.cancelVideoFrameCallback(videoFrameCallbackRef.current);
      videoFrameCallbackRef.current = null;
    }
    processingFrameRef.current = false;
    recorderGenerationRef.current += 1;
    const recorder = recorderRef.current;
    recorderRef.current = null;
    if (recorder) {
      recorder.ondataavailable = null;
      recorder.onstop = null;
      recorder.onerror = null;
      if (recorder.state !== 'inactive') recorder.stop();
    }
    recorderStreamRef.current?.getTracks().forEach((track) => track.stop());
    recorderStreamRef.current = null;
    recorderCanvasTrackRef.current = null;
    recorderChunksRef.current = [];
    videoPipelineDiagnosticsRef.current = {
      sourceFrames: 0,
      lastSourceTime: 0,
      canvasFrames: 0,
      lastCanvasTime: 0,
      captureRequests: 0,
      recorderChunks: 0,
      recorderBytes: 0,
    };
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    detectorTransitionRef.current = null;
    detectorRef.current?.close();
    detectorRef.current = null;
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
      videoRef.current.removeAttribute('src');
      videoRef.current.load();
    }
    if (uploadedVideoUrlRef.current) {
      URL.revokeObjectURL(uploadedVideoUrlRef.current);
      uploadedVideoUrlRef.current = null;
    }
    if (processedVideoUrlRef.current) {
      URL.revokeObjectURL(processedVideoUrlRef.current);
      processedVideoUrlRef.current = null;
      setProcessedVideoUrl(null);
    }
    setProcessedVideoExtension('webm');
    setUploadedVideoName('');
    setVideoExportStatus('');
    setUploadedAnalysisProgress(null);
    if (canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      context?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    if (recordedCanvasRef.current) {
      const context = recordedCanvasRef.current.getContext('2d');
      context?.clearRect(0, 0, recordedCanvasRef.current.width, recordedCanvasRef.current.height);
    }
    sideConsistencyRef.current.reset();
    boneConstraintRef.current.reset();
    poseFilterRef.current.reset();
    poseFilterRef.current.setPersistentHold(false);
    poseFilterRef.current.setTemporalJumpGuard(false);
    viewEstimatorRef.current.reset();
    viewAlignmentGuardRef.current.reset();
    viewAlignmentRef.current = createInitialViewAlignment();
    backViewStableSinceRef.current = null;
    reinforceBackToFrontRef.current = false;
    lastViewUiUpdateRef.current = 0;
    setViewAlignment(viewAlignmentRef.current);
    rawPoseForDebugRef.current = undefined;
    debugSessionRef.current?.reset();
    if (DEBUG_LIMB_TRACKING_ACTIVE) {
      setDebugPanel(createEmptyDebugPanelSnapshot());
    }
    detectionFrameTimesRef.current = [];
    lowFpsSinceRef.current = null;
    modelDegradedRef.current = false;
    lastDetectorTimestampRef.current = Number.NEGATIVE_INFINITY;
    lastVideoAnalysisSourceTimeRef.current = Number.NEGATIVE_INFINITY;
    videoSizeRef.current = { width: 0, height: 0 };
    stabilityFramesRef.current = 0;
    lastVideoTimeUiUpdateRef.current = 0;
    previousFootExerciseRef.current = null;
    previousFootRatioRef.current = null;
    heelRaiseFootPhaseRef.current = null;
    previousLegAngleRef.current = null;
    setVideoTimeSeconds(0);
    setVideoDurationSeconds(0);
    setPushupBlockingReasons([]);
    setPushupRepetitionFrameReady(false);
    setPushupStabilityFrames(0);
    setPushupHeldMeasurementPoints([]);
    setDetectionStable(false);
  }, []);

  const syncVideoSize = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth || !video.videoHeight) return;
    if (
      videoSizeRef.current.width === video.videoWidth
      && videoSizeRef.current.height === video.videoHeight
    ) {
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    if (recordedCanvasRef.current) {
      const isUploadedPushupVideo = inputModeRef.current === 'video'
        && selectedExerciseRef.current === 'flexiones';
      const recordedSize = isUploadedPushupVideo
        ? getContainedVideoSize(
            video.videoWidth,
            video.videoHeight,
            1280,
            720,
          )
        : selectedExerciseRef.current === 'flexiones'
          ? { width: video.videoWidth, height: video.videoHeight }
        : getContainedVideoSize(
            video.videoWidth,
            video.videoHeight,
            RECORDED_VIDEO_MAX_WIDTH,
            RECORDED_VIDEO_MAX_HEIGHT,
          );
      recordedCanvasRef.current.width = recordedSize.width;
      recordedCanvasRef.current.height = recordedSize.height;
    }
    videoSizeRef.current = {
      width: video.videoWidth,
      height: video.videoHeight,
    };
    setVideoRatio(`${video.videoWidth} / ${video.videoHeight}`);
    setVideoResolution({ width: video.videoWidth, height: video.videoHeight });
  }, []);

  const prepareDetectorFrame = useCallback((video: HTMLVideoElement): PoseVideoSource => {
    const detectorCanvas = detectorFrameCanvasRef.current
      ?? document.createElement('canvas');
    detectorFrameCanvasRef.current = detectorCanvas;
    const detectorSize = getContainedVideoSize(
      video.videoWidth,
      video.videoHeight,
      DETECTOR_MAX_FRAME_WIDTH,
      DETECTOR_MAX_FRAME_HEIGHT,
    );
    if (
      detectorCanvas.width !== detectorSize.width
      || detectorCanvas.height !== detectorSize.height
    ) {
      detectorCanvas.width = detectorSize.width;
      detectorCanvas.height = detectorSize.height;
    }
    const context = detectorCanvas.getContext('2d');
    if (!context) return video;
    context.drawImage(video, 0, 0, detectorSize.width, detectorSize.height);
    return detectorCanvas;
  }, []);

  const beginVideoRecording = useCallback((video: HTMLVideoElement) => {
    const canvas = recordedCanvasRef.current;
    if (
      !canvas
      || typeof canvas.captureStream !== 'function'
      || typeof MediaRecorder === 'undefined'
    ) {
      setVideoExportStatus('Este navegador permite analizar el video, pero no generar la descarga.');
      return;
    }

    const candidates = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
      'video/mp4;codecs=avc1.42E01E',
      'video/mp4',
    ];
    const mimeType = candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate));
    const manualStream = canvas.captureStream(0);
    const manualTrack = manualStream.getVideoTracks()[0] as (
      MediaStreamTrack & { requestFrame?: () => void }
    ) | undefined;
    const hasManualCapture = typeof manualTrack?.requestFrame === 'function';
    const recordedStream = hasManualCapture ? manualStream : canvas.captureStream(30);
    if (!hasManualCapture) manualStream.getTracks().forEach((track) => track.stop());
    const canvasTrack = recordedStream.getVideoTracks()[0] as (
      MediaStreamTrack & { requestFrame?: () => void }
    ) | undefined;
    recorderCanvasTrackRef.current = canvasTrack ?? null;
    videoPipelineDiagnosticsRef.current = {
      sourceFrames: 0,
      lastSourceTime: video.currentTime,
      canvasFrames: 0,
      lastCanvasTime: video.currentTime,
      captureRequests: 0,
      recorderChunks: 0,
      recorderBytes: 0,
    };
    const videoWithCapture = video as HTMLVideoElement & {
      captureStream?: () => MediaStream;
      mozCaptureStream?: () => MediaStream;
    };
    const sourceStream = videoWithCapture.captureStream?.()
      ?? videoWithCapture.mozCaptureStream?.();
    sourceStream?.getAudioTracks().forEach((track) => recordedStream.addTrack(track));

    try {
      const preservesPushupSourceQuality = selectedExerciseRef.current === 'flexiones';
      const isUploadedPushupVideo = inputModeRef.current === 'video'
        && preservesPushupSourceQuality;
      const pixelCount = canvas.width * canvas.height;
      const recorderOptions: MediaRecorderOptions | undefined = preservesPushupSourceQuality
        ? {
            ...(mimeType ? { mimeType } : {}),
            videoBitsPerSecond: isUploadedPushupVideo
              ? Math.min(
                  5_000_000,
                  Math.max(4_000_000, Math.round(pixelCount * 6.5)),
                )
              : Math.max(
                  4_000_000,
                  Math.min(50_000_000, Math.round(pixelCount * 6.5)),
                ),
            audioBitsPerSecond: 192_000,
          }
        : mimeType
          ? { mimeType }
          : undefined;
      const recorder = new MediaRecorder(
        recordedStream,
        recorderOptions,
      );
      const generation = ++recorderGenerationRef.current;
      recorderRef.current = recorder;
      recorderStreamRef.current = recordedStream;
      recorderChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recorderChunksRef.current.push(event.data);
          videoPipelineDiagnosticsRef.current.recorderChunks += 1;
          videoPipelineDiagnosticsRef.current.recorderBytes += event.data.size;
        }
      };
      recorder.onstop = () => {
        recorderStreamRef.current?.getTracks().forEach((track) => track.stop());
        recorderStreamRef.current = null;
        recorderCanvasTrackRef.current = null;
        if (recorderRef.current === recorder) recorderRef.current = null;
        if (generation !== recorderGenerationRef.current) return;
        const chunks = recorderChunksRef.current;
        recorderChunksRef.current = [];
        if (!chunks.length) {
          if (preservesPushupSourceQuality) {
            uploadedPushupPreflightRef.current = true;
            uploadedPushupExportPlaybackRef.current = false;
            activeRef.current = false;
            exerciseStartedRef.current = false;
            setExerciseStarted(false);
            if (videoRef.current) videoRef.current.controls = true;
          }
          setVideoExportStatus('No se generó el video. Vuelve a reproducirlo para intentarlo de nuevo.');
          return;
        }
        const recordedMimeType = recorder.mimeType || 'video/webm';
        const blob = new Blob(chunks, { type: recordedMimeType });
        const nextUrl = URL.createObjectURL(blob);
        if (processedVideoUrlRef.current) URL.revokeObjectURL(processedVideoUrlRef.current);
        processedVideoUrlRef.current = nextUrl;
        setProcessedVideoExtension(recordedMimeType.includes('mp4') ? 'mp4' : 'webm');
        setProcessedVideoUrl(nextUrl);
        const diagnostics = videoPipelineDiagnosticsRef.current;
        setVideoExportStatus(
          `${preservesPushupSourceQuality
            ? `Video listo para descargar en ${canvas.width} × ${canvas.height} px. `
              + 'La compresión final depende del navegador. '
            : 'Video procesado y listo para descargar. '}`
          + `${diagnostics.sourceFrames} cuadros fuente, `
          + `${diagnostics.canvasFrames} repintados y ${chunks.length} fragmentos grabados.`,
        );
      };
      recorder.onerror = () => {
        if (generation === recorderGenerationRef.current) {
          if (preservesPushupSourceQuality) {
            recorder.ondataavailable = null;
            recorder.onstop = null;
            recorderGenerationRef.current += 1;
            if (recorder.state !== 'inactive') recorder.stop();
            recorderStreamRef.current?.getTracks().forEach((track) => track.stop());
            recorderRef.current = null;
            recorderStreamRef.current = null;
            recorderCanvasTrackRef.current = null;
            recorderChunksRef.current = [];
            uploadedPushupPreflightRef.current = true;
            uploadedPushupExportPlaybackRef.current = false;
            activeRef.current = false;
            exerciseStartedRef.current = false;
            setExerciseStarted(false);
            if (videoRef.current) videoRef.current.controls = true;
          }
          setVideoExportStatus('No se pudo generar la descarga del video.');
        }
      };
      recorder.start(250);
      setVideoExportStatus('Grabando el video ya analizado a su velocidad original…');
    } catch {
      recordedStream.getTracks().forEach((track) => track.stop());
      setVideoExportStatus('No se pudo iniciar la descarga del video en este navegador.');
    }
  }, []);

  const captureUploadedVideoFrame = useCallback(() => {
    const video = videoRef.current;
    const recordedCanvas = recordedCanvasRef.current;
    if (
      inputModeRef.current !== 'video'
      || !video
      || !recordedCanvas
      || !video.videoWidth
      || !video.videoHeight
    ) {
      return;
    }
    syncVideoSize();
    const recordedContext = recordedCanvas.getContext('2d');
    if (!recordedContext) return;
    recordedContext.clearRect(0, 0, recordedCanvas.width, recordedCanvas.height);
    recordedContext.drawImage(video, 0, 0, recordedCanvas.width, recordedCanvas.height);
    if (
      selectedExerciseRef.current === 'flexiones'
      && uploadedPushupExportPlaybackRef.current
    ) {
      const samples = uploadedPushupExportSamplesRef.current;
      let low = 0;
      let high = samples.length - 1;
      let sampleIndex = -1;
      while (low <= high) {
        const middle = Math.floor((low + high) / 2);
        if (samples[middle].timeSeconds <= video.currentTime) {
          sampleIndex = middle;
          low = middle + 1;
        } else {
          high = middle - 1;
        }
      }
      const sample = sampleIndex >= 0 ? samples[sampleIndex] : null;
      const sampleIsRecent = sample
        && video.currentTime - sample.timeSeconds <= 2 / UPLOADED_PUSHUP_ANALYSIS_FPS;
      if (sampleIsRecent && sample.pose) {
        drawSkeleton(
          recordedCanvas,
          video,
          sample.pose,
          false,
          false,
          false,
          false,
        );
      }
      drawVideoRecordingHud(
        recordedContext,
        recordedCanvas.width,
        recordedCanvas.height,
        sampleIsRecent ? sample.hud : EMPTY_VIDEO_RECORDING_HUD,
      );
    } else {
      if (canvasRef.current) {
        recordedContext.drawImage(
          canvasRef.current,
          0,
          0,
          recordedCanvas.width,
          recordedCanvas.height,
        );
      }
      if (selectedExerciseRef.current === 'flexiones') {
        const hudState = recordingHudStateRef.current;
        const readings = hudState?.liveAngleReadings ?? [];
        const jointReadings = [
          'cadera',
          'hombro',
          'codo',
          'muñeca',
          'rodilla',
          'tobillo',
        ].map((joint) => {
          const values = readings
            .filter((reading) => reading.label.toLocaleLowerCase('es').includes(joint))
            .map((reading) => reading.value === null
              ? '—'
              : `${reading.value}${reading.unit ?? '°'}`);
          return `${joint}: ${values.length ? values.join('/') : '—'}`;
        }).join(' | ');
        const hudStateIsEmpty = !hudState || (
          !hudState.exercise
          && !hudState.hasEvaluationCounter
          && hudState.correctRepetitions === 0
          && hudState.incorrectRepetitions === 0
          && readings.length === 0
          && (hudState.dipJointReadings?.length ?? 0) === 0
          && (hudState.pullupJointReadings?.length ?? 0) === 0
        );
        const now = performance.now();
        if (now - lastUploadedPushupHudLogAtMs >= 1000) {
          lastUploadedPushupHudLogAtMs = now;
          console.log(
            `[hud] hasEvaluationCounter=${hudState?.hasEvaluationCounter ?? 'null'}`
            + ` | correctas=${hudState?.correctRepetitions ?? 'null'}`
            + ` | incorrectas=${hudState?.incorrectRepetitions ?? 'null'}`
            + ` | lecturas=${jointReadings}`
            + ` | canvas=${recordedCanvas.width}x${recordedCanvas.height}`
            + ` | ref nulo=${hudState == null}`
            + ` | ref vacío=${hudStateIsEmpty}`,
          );
        }
      }
      drawVideoRecordingHud(
        recordedContext,
        recordedCanvas.width,
        recordedCanvas.height,
        recordingHudStateRef.current,
      );
    }
    const diagnostics = videoPipelineDiagnosticsRef.current;
    diagnostics.canvasFrames += 1;
    diagnostics.lastCanvasTime = video.currentTime;
    const captureTrack = recorderCanvasTrackRef.current;
    if (captureTrack?.requestFrame) {
      captureTrack.requestFrame();
      diagnostics.captureRequests += 1;
    }
  }, [syncVideoSize]);

  const processFrame = useCallback(async (scheduledTimestamp?: number) => {
    const video = videoRef.current;
    const detector = detectorRef.current;
    if (!activeRef.current || !video || !detector) return;
    const detectorTransition = detectorTransitionRef.current;
    if (detectorTransition) {
      await detectorTransition;
      return;
    }
    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      return;
    }
    const canInspectPausedPushupVideo = inputModeRef.current === 'video'
      && uploadedPushupPreflightRef.current
      && !pushupCalibrationSuccessfulRef.current;
    if (
      inputModeRef.current === 'video'
      && video.paused
      && !video.ended
      && !canInspectPausedPushupVideo
      && !uploadedPushupOfflineAnalysisRef.current
    ) {
      return;
    }
    syncVideoSize();

    try {
      const now = performance.now();
      const frameTimestamp = Math.max(
        scheduledTimestamp ?? now,
        lastDetectorTimestampRef.current + 0.001,
      );
      lastDetectorTimestampRef.current = frameTimestamp;
      const detectorSource = prepareDetectorFrame(video);
      const outputSize = { width: video.videoWidth, height: video.videoHeight };
      const detectedResult = detector.detectForVideoAsync
        ? await detector.detectForVideoAsync(
            detectorSource,
            frameTimestamp,
            outputSize,
          )
        : detector.detectForVideo?.(
            detectorSource,
            frameTimestamp,
            outputSize,
          );
      if (detectedResult === undefined) {
        throw new Error('El detector de pose no tiene un método de análisis disponible.');
      }
      detectionFrameTimesRef.current = [
        ...detectionFrameTimesRef.current,
        now,
      ].slice(-FPS_WINDOW_FRAMES);
      const poses = detectedResult ? [detectedResult] : [];
      const selectedExerciseForFrame = selectedExerciseRef.current ?? 'fondos';
      const pullupSessionActive = selectedExerciseForFrame === 'dominadas'
        && exerciseStartedRef.current
        && pullupCalibrationSuccessfulRef.current;
      const pushupTrackingLocked = selectedExerciseForFrame === 'flexiones'
        && pushupCalibrationSuccessfulRef.current;
      poseFilterRef.current.setPersistentHold(
        pullupSessionActive || pushupTrackingLocked,
        selectedExerciseForFrame === 'flexiones'
          ? PUSHUP_PERSISTENT_HOLD_MAX_FRAMES
          : MAX_HELD_FRAMES,
      );
      poseFilterRef.current.setTemporalJumpGuard(pushupTrackingLocked);
      const previousPoseTrack = primaryPoseTrackRef.current;
      const primaryPose = selectPrimaryPose(
        poses,
        video.videoWidth,
        video.videoHeight,
        primaryPoseTrackRef.current,
        exerciseStartedRef.current || pushupTrackingLocked,
      );
      const detectedPose = primaryPose?.pose;
      if (DEBUG_LIMB_TRACKING_ACTIVE) {
        rawPoseForDebugRef.current = detectedPose;
      }
      if (primaryPose) {
        if (
          previousPoseTrack
          && !exerciseStartedRef.current
          && !pushupTrackingLocked
          && !isPoseTrackContinuous(primaryPose.track, previousPoseTrack)
        ) {
          sideConsistencyRef.current.reset();
          boneConstraintRef.current.reset();
          poseFilterRef.current.reset();
        }
        primaryPoseTrackRef.current = primaryPose.track;
      } else if (primaryPoseTrackRef.current) {
        const nextLostFrames = primaryPoseTrackRef.current.lostFrames + 1;
        primaryPoseTrackRef.current = nextLostFrames >= 8
          && !exerciseStartedRef.current
          && !pushupTrackingLocked
          ? null
          : { ...primaryPoseTrackRef.current, lostFrames: nextLostFrames };
      }
      const activeExerciseDefinition = getExercise(selectedExerciseForFrame);
      const allowsFrontView = selectedExerciseForFrame === 'dominadas'
        || selectedExerciseForFrame === 'dominadas-supinas';
      const sideConsistentPose = detectedPose
        ? sideConsistencyRef.current.filter(
            detectedPose,
            getSideSwapConfirmFrames(
              selectedExerciseForFrame,
              activeExerciseDefinition?.trackBothSides,
            ),
          )
        : undefined;
      const confirmedSideSwaps = sideConsistentPose
        ? sideConsistencyRef.current.getLastConfirmedSwaps()
        : [];
      if (confirmedSideSwaps.length) {
        confirmedSideSwaps.forEach(({ left, right }) => {
          poseFilterRef.current.swapLandmarkStates(left, right);
        });
        boneConstraintRef.current.reassignForSideSwaps(confirmedSideSwaps);
      }
      const constrainedPose = sideConsistentPose
        ? boneConstraintRef.current.filter(sideConsistentPose)
        : undefined;
      const pose: Pose | undefined = constrainedPose
        ? poseFilterRef.current.filter(constrainedPose, frameTimestamp)
        : pullupSessionActive || pushupTrackingLocked
          ? poseFilterRef.current.getPersistentPose(video.videoWidth, video.videoHeight)
          : undefined;
      const recommendedView = activeExerciseDefinition?.recommendedView ?? 'any';
      const viewToleranceDeg = activeExerciseDefinition?.viewToleranceDeg
        ?? VIEW_TOLERANCE_DEFAULT_DEG;
      const viewEstimate = pose
        ? viewEstimatorRef.current.update(
            pose,
            cameraFacingModeRef.current,
            {
              reinforceBackToFront: reinforceBackToFrontRef.current
                && !allowsFrontView,
            },
          )
        : createUnknownViewEstimate();
      if (!pose) {
        viewEstimatorRef.current.markPoseMissing();
        viewAlignmentGuardRef.current.markPoseMissing();
      }
      const nextViewAlignment = pose
        ? viewAlignmentGuardRef.current.update(
            assessExerciseView(
              recommendedView,
              viewEstimate,
              viewToleranceDeg,
              { allowFrontForBack: allowsFrontView },
            ),
            now,
          )
        : {
            ...viewAlignmentRef.current,
            yawDeg: null,
            pitchDeg: null,
            estimatedView: 'unknown' as const,
            status: 'unknown' as const,
            known: false,
            deviationDeg: null,
            recommendedView,
            toleranceDeg: viewToleranceDeg,
            blocking: false,
            alertVisible: false,
            suggestionVisible: false,
          };
      const previousViewAlignment = viewAlignmentRef.current;
      viewAlignmentRef.current = nextViewAlignment;
      if (allowsFrontView) {
        backViewStableSinceRef.current = null;
        reinforceBackToFrontRef.current = false;
      } else if (!reinforceBackToFrontRef.current) {
        const validBackView = (
          recommendedView === 'back'
          && nextViewAlignment.estimatedView === 'back'
          && (
            nextViewAlignment.status === 'good'
            || nextViewAlignment.status === 'acceptable'
          )
        );
        if (validBackView) {
          backViewStableSinceRef.current ??= now;
          if (
            now - backViewStableSinceRef.current
            >= VIEW_BACK_ESTABLISH_SECONDS * 1000
          ) {
            reinforceBackToFrontRef.current = true;
          }
        } else {
          backViewStableSinceRef.current = null;
        }
      }
      if (
        nextViewAlignment.status !== previousViewAlignment.status
        || nextViewAlignment.blocking !== previousViewAlignment.blocking
        || now - lastViewUiUpdateRef.current >= VIEW_UI_UPDATE_MS
      ) {
        lastViewUiUpdateRef.current = now;
        setViewAlignment(nextViewAlignment);
      }
      const viewBlocksFrame = nextViewAlignment.blocking;
      if (DEBUG_LIMB_TRACKING_ACTIVE) {
        const nextDebugPanel = debugSessionRef.current?.recordFrame({
          rawPose: rawPoseForDebugRef.current,
          filteredPose: pose,
          frameTimes: detectionFrameTimesRef.current,
          activeModel: detector.activeModel,
          activeDelegate: detector.activeDelegate,
          boneDebugInfo: boneConstraintRef.current.getDebugInfo(),
          confirmedSwapCount: confirmedSideSwaps.length,
          width: video.videoWidth,
          height: video.videoHeight,
          now,
          yaw: viewEstimate.yawDeg,
          estimatedView: viewEstimate.view,
          recommendedView,
          viewStatus: nextViewAlignment.status,
          pitch: activeExerciseDefinition?.uprightTorso
            ? viewEstimate.pitchDeg
            : null,
        });
        if (nextDebugPanel) setDebugPanel(nextDebugPanel);
      }
      if (!detectedPose) {
        sideConsistencyRef.current.markPoseMissing();
        boneConstraintRef.current.markPoseMissing();
        poseFilterRef.current.markPoseMissing();
      }
      const hasFreshPose = Boolean(detectedPose);
      const detectedDominantSideResult = selectedExerciseForFrame === 'remo-barra'
        ? getBarbellRowDominantSide(pose?.keypoints, previousSideRef.current)
        : selectedExerciseForFrame === 'remos-australianos-elevados'
          ? getElevatedAustralianRowDominantSide(pose?.keypoints, previousSideRef.current)
        : getDominantSide(pose?.keypoints, previousSideRef.current);
      const lockedPushupSide = selectedExerciseForFrame === 'flexiones'
        ? pushupLockedMeasurementSideRef.current
        : null;
      const lockedPushupSideScores = lockedPushupSide && pose?.keypoints
        ? Object.values(sideKeypoints[lockedPushupSide]).map(
            (index) => pose.keypoints[index]?.score ?? 0,
          )
        : [];
      const nextDominantSideResult = lockedPushupSide
        ? {
            side: lockedPushupSide,
            average: lockedPushupSideScores.length
              ? lockedPushupSideScores.reduce((sum, score) => sum + score, 0)
                / lockedPushupSideScores.length
              : 0,
          }
        : detectedDominantSideResult;
      const nextDominantSide = nextDominantSideResult?.side ?? null;
      const nextSideViewCandidate = selectedExerciseForFrame === 'peso-muerto-piernas-rigidas'
        ? getSideViewCandidate(pose?.keypoints)
        : null;
      if (!nextSideViewCandidate) {
        sideViewCandidateRef.current = null;
        sideViewStableFramesRef.current = 0;
      } else if (sideViewCandidateRef.current === nextSideViewCandidate) {
        sideViewStableFramesRef.current = Math.min(
          SIDE_VIEW_STABLE_FRAMES,
          sideViewStableFramesRef.current + 1,
        );
      } else {
        sideViewCandidateRef.current = nextSideViewCandidate;
        sideViewStableFramesRef.current = 1;
      }
      const stableLateralSide = sideViewStableFramesRef.current >= SIDE_VIEW_STABLE_FRAMES
        ? sideViewCandidateRef.current
        : null;
      const measurementSide = selectedExerciseForFrame === 'peso-muerto-piernas-rigidas'
        && stableLateralSide
        ? stableLateralSide
        : nextDominantSide;
      const isPullupExercise = selectedExerciseForFrame === 'dominadas'
        || selectedExerciseForFrame === 'dominadas-supinas'
        || selectedExerciseForFrame === 'dominadas-comando';
      const isPushupExercise = selectedExerciseForFrame === 'flexiones'
        || selectedExerciseForFrame === 'flexiones-declinadas'
        || selectedExerciseForFrame === 'flexiones-pica';
      const pullupTrackingIsAnchored = selectedExerciseForFrame === 'dominadas'
        && exerciseStartedRef.current
        && pullupCalibrationSuccessfulRef.current
        && !pullupSessionFinishedRef.current;
      const pushupTrackingIsAnchored = selectedExerciseForFrame === 'flexiones'
        && exerciseStartedRef.current
        && pushupCalibrationSuccessfulRef.current;
      const detectedFrameLowConfidence = hasHeldPointForExercise(
        selectedExerciseForFrame,
        pose?.keypoints,
        measurementSide,
      );
      const frameLowConfidence = pullupTrackingIsAnchored
        ? false
        : detectedFrameLowConfidence;
      const effectiveViewBlocksFrame = pullupTrackingIsAnchored || pushupTrackingIsAnchored
        ? false
        : viewBlocksFrame;
      const rawCameraGuidance = getCameraGuidance(
        selectedExerciseForFrame,
        pose?.keypoints,
        measurementSide,
        video.videoWidth,
        video.videoHeight,
        stableLateralSide,
      );
      const frameCameraReady = rawCameraGuidance.tone === 'ready';
      const pullupMeasurementBlocked = isPullupExercise
        && !pullupTrackingIsAnchored
        && !hasFreshPullupMeasurement(pose?.keypoints);
      // El anclaje conserva la última pose para que el overlay no desaparezca
      // ante un frame perdido, pero nunca convierte esos puntos retenidos en
      // una lectura válida para contar o evaluar una flexión.
      const pushupMeasurementBlocked = isPushupExercise
        && (
          !hasFreshPushupMeasurement(pose?.keypoints, measurementSide)
          || !frameCameraReady
        );
      const frameMeasurementBlocked = frameLowConfidence
        || effectiveViewBlocksFrame
        || pullupMeasurementBlocked
        || pushupMeasurementBlocked;
      const visiblePoints = pose?.keypoints?.filter((point) => (
        isVisibleCameraPoint(point, 0.3)
      )).length ?? 0;
      const nextFaceDetected = hasFaceDetected(pose?.keypoints);
      const pullupCalibrationLocked = selectedExerciseForFrame === 'dominadas'
        && pullupCalibrationSuccessfulRef.current;
      const pushupCalibrationLocked = selectedExerciseForFrame === 'flexiones'
        && pushupCalibrationSuccessfulRef.current;
      const currentPullupPreparationStage = pullupPreparationStageRef.current;
      const currentPullupPreparationCountdown = pullupPreparationCountdownRef.current;
      const currentPushupPreparationStage = pushupPreparationStageRef.current;
      const currentPushupPreparationCountdown = pushupPreparationCountdownRef.current;
      const nextCameraGuidance = pullupSessionFinishedRef.current
        ? {
            tone: 'ready' as const,
            message: 'Ejercicio finalizado · conteo congelado',
            detail: `Se detectó que soltaste la barra. El resultado queda en ${pullupTrackerRef.current.repetitions} repeticiones.`,
          }
        : pullupCalibrationLocked || pullupTrackingIsAnchored
        ? {
            tone: 'ready' as const,
            message: pullupMeasurementBlocked
              ? 'Seguimiento pausado · recuperando extremidades'
              : pullupTrackingIsAnchored
                ? 'Sesión activa · seguimiento anclado'
              : currentPullupPreparationStage === 'bar-preparation'
                ? `Cuerpo registrado ✓ · cuélgate en la barra${
                  currentPullupPreparationCountdown === null
                    ? ''
                    : ` · ${currentPullupPreparationCountdown}`
                }`
                : 'Calibración exitosa',
            detail: pullupMeasurementBlocked
              ? 'Hay una muñeca, codo, hombro o punto de la cabeza retenido. No se contará ni evaluará este instante.'
              : pullupTrackingIsAnchored
                ? 'Los puntos confirmados permanecen anclados. Los ángulos siguen actualizándose con tu movimiento real.'
              : currentPullupPreparationStage === 'bar-preparation'
                ? 'Organízate en la barra. El análisis comenzará automáticamente al terminar la cuenta regresiva.'
                : 'La detección inicial terminó. Prepárate para continuar.',
          }
        : pushupCalibrationLocked || pushupTrackingIsAnchored
        ? {
            tone: 'ready' as const,
            message: pushupMeasurementBlocked
              ? 'Seguimiento pausado · recuperando extremidades'
              : pushupTrackingIsAnchored
                ? 'Sesión activa · seguimiento fijado'
                : currentPushupPreparationStage === 'pushup-preparation'
                  ? `Cuerpo registrado ✓ · acomódate para empezar${
                    currentPushupPreparationCountdown === null
                      ? ''
                      : ` · ${currentPushupPreparationCountdown}`
                  }`
                  : 'Calibración exitosa',
            detail: pushupMeasurementBlocked
              ? 'Mantén hombro, codo, muñeca, cadera y tobillo visibles. No se contará ni evaluará este instante.'
              : pushupTrackingIsAnchored
                ? 'La identificación de cada extremidad permanece fijada; las coordenadas y los ángulos siguen tu movimiento real.'
                : currentPushupPreparationStage === 'pushup-preparation'
                  ? 'Las extremidades ya están identificadas. Acomódate en la posición inicial; sus coordenadas seguirán tu movimiento.'
                  : 'La detección inicial terminó. Prepárate para continuar.',
          }
        : rawCameraGuidance;
      const pullupElbowAnglesForFrame = isPullupExercise
        && !pullupMeasurementBlocked
        ? calculatePullupElbowAngles(pose?.keypoints)
        : { left: null, right: null, averagedRawAngle: null };
      const pullupAngleForFrame = pullupElbowAnglesForFrame.averagedRawAngle;
      const rawAngle = selectedExerciseForFrame === 'sentadillas'
        ? calculateSquatAngle(pose?.keypoints)
        : pullupAngleForFrame
          ?? calculateExerciseAngle(
            selectedExerciseForFrame,
            pose?.keypoints,
            measurementSide,
          );
      const pullupHeadOverWrists = isPullupExercise
        && !pullupMeasurementBlocked
        ? isHeadOverBothWrists(pose?.keypoints)
        : null;
      if (previousFootExerciseRef.current !== selectedExerciseForFrame) {
        previousFootExerciseRef.current = selectedExerciseForFrame;
        previousFootRatioRef.current = null;
        heelRaiseFootPhaseRef.current = null;
        previousLegAngleRef.current = null;
      }
      const previousLegAngleForFrame = previousLegAngleRef.current;
      const heelRaiseFootMeasurement = selectedExerciseForFrame === 'elevacion-talones-pie'
        && measurementSide
        ? calculateFootMeasurement(pose?.keypoints, measurementSide)
        : null;
      const heelRaiseIsDescending = Boolean(
        heelRaiseFootMeasurement
        && previousFootRatioRef.current !== null
        && heelRaiseFootPhaseRef.current === 'up'
        && heelRaiseFootMeasurement.heelLiftRatio
          < previousFootRatioRef.current - 0.01
        && heelRaiseFootMeasurement.heelLiftRatio > HEEL_LIFT_WARN_RATIO,
      );
      if (heelRaiseFootMeasurement) {
        if (heelRaiseFootMeasurement.heelLiftRatio >= HEEL_RAISE_UP_RATIO) {
          heelRaiseFootPhaseRef.current = 'up';
        } else if (heelRaiseFootMeasurement.heelLiftRatio <= HEEL_RAISE_DOWN_RATIO) {
          heelRaiseFootPhaseRef.current = 'down';
        }
        previousFootRatioRef.current = heelRaiseFootMeasurement.heelLiftRatio;
      } else if (selectedExerciseForFrame !== 'elevacion-talones-pie') {
        previousFootRatioRef.current = null;
        heelRaiseFootPhaseRef.current = null;
      }
      const frameCanMeasure = Boolean(
        frameCameraReady
        && hasFreshPose
        && rawAngle !== null
        && visiblePoints >= 5
        && !frameMeasurementBlocked,
      );
      stabilityFramesRef.current = frameCanMeasure
        ? Math.min(8, stabilityFramesRef.current + 1)
        : 0;
      const frameDetectionStable = stabilityFramesRef.current >= 4;
      const standardPushupFrameStable = selectedExerciseForFrame === 'flexiones'
        && stabilityFramesRef.current >= PUSHUP_COUNT_STABLE_FRAMES;
      const standardPushupCountFrameReady = selectedExerciseForFrame === 'flexiones'
        && hasFreshPose
        && frameCameraReady
        && standardPushupFrameStable
        && hasFreshPushupMeasurement(
          pose?.keypoints,
          pushupLockedMeasurementSideRef.current ?? measurementSide,
        )
        && !frameMeasurementBlocked;
      const pushupBlockingReasonsForFrame = selectedExerciseForFrame === 'flexiones'
        ? getPushupDiagnosticBlockingReasons(
            pose?.keypoints,
            pushupLockedMeasurementSideRef.current ?? measurementSide,
            exerciseStartedRef.current,
            hasFreshPose,
            standardPushupFrameStable,
            frameCameraReady,
            visiblePoints,
            rawAngle,
            frameMeasurementBlocked || !standardPushupCountFrameReady && exerciseStartedRef.current,
            rawCameraGuidance.message,
          )
        : [];
      setDetectionStable(frameDetectionStable || pullupTrackingIsAnchored || pushupTrackingIsAnchored);
      const effectiveFrameDetectionStable = frameDetectionStable
        || pullupTrackingIsAnchored;
      const effectiveFrameCameraReady = frameCameraReady
        || pullupTrackingIsAnchored;
      const countFrameReady = selectedExerciseForFrame === 'flexiones'
        ? standardPushupCountFrameReady
        : isPushupExercise
          ? effectiveFrameCameraReady && effectiveFrameDetectionStable
          : frameCameraReady;
      if (
        selectedExerciseForFrame === 'dominadas'
        && !pullupCalibrationSuccessfulRef.current
        && !exerciseStartedRef.current
      ) {
        const calibrationPoints = getPullupCalibrationPoints(pose?.keypoints);
        const calibrationFrameReady = rawCameraGuidance.tone === 'ready'
          && calibrationPoints.length === 15
          && calibrationPoints.every(({ point }) => isFreshPullupCalibrationPoint(point));

        if (calibrationFrameReady) {
          pullupCalibrationReadySinceRef.current ??= now;
          updatePullupCalibrationStatus('calibrating');
          const calibrationElapsed = now - pullupCalibrationReadySinceRef.current;
          updatePullupPreparationCountdown(
            Math.max(
              1,
              Math.ceil((PULLUP_BODY_DETECTION_HOLD_MS - calibrationElapsed) / 1000),
            ),
          );
          if (
            calibrationElapsed >= PULLUP_BODY_DETECTION_HOLD_MS
          ) {
            pullupCalibrationSuccessfulRef.current = true;
            pullupCalibrationReadySinceRef.current = null;
            updatePullupCalibrationStatus('ready');
            pullupPreparationStartedAtRef.current = now;
            updatePullupPreparationStage('bar-preparation');
            updatePullupPreparationCountdown(
              Math.ceil(PULLUP_BAR_PREPARATION_COUNTDOWN_MS / 1000),
            );
          }
        } else {
          pullupCalibrationReadySinceRef.current = null;
          updatePullupCalibrationStatus('pending');
          if (pullupPreparationStageRef.current === 'body-detection') {
            updatePullupPreparationCountdown(null);
          }
        }
      }
      if (
        selectedExerciseForFrame === 'flexiones'
        && !pushupCalibrationSuccessfulRef.current
        && !exerciseStartedRef.current
      ) {
        const calibrationPoints = getPushupCalibrationPoints(
          pose?.keypoints,
          measurementSide,
        );
        const calibrationFrameReady = rawCameraGuidance.tone === 'ready'
          && calibrationPoints.length === 5
          && calibrationPoints.every(({ point }) => isFreshPushupCalibrationPoint(point));

        if (calibrationFrameReady) {
          pushupCalibrationReadySinceRef.current ??= now;
          updatePushupCalibrationStatus('calibrating');
          const calibrationElapsed = now - pushupCalibrationReadySinceRef.current;
          updatePushupPreparationCountdown(
            Math.max(
              1,
              Math.ceil((PUSHUP_BODY_DETECTION_HOLD_MS - calibrationElapsed) / 1000),
            ),
          );
          if (calibrationElapsed >= PUSHUP_BODY_DETECTION_HOLD_MS) {
            pushupCalibrationSuccessfulRef.current = true;
            pushupCalibrationReadySinceRef.current = null;
            const calibrationRepetitionAngle = calculateRepetitionAngle(
              'flexiones',
              pose?.keypoints,
              measurementSide,
            );
            uploadedPushupStartsAtBottomRef.current =
              uploadedPushupStartsAtBottomRef.current
              || Boolean(
                uploadedPushupPreflightRef.current
                && calibrationRepetitionAngle !== null
                && isWithinAngle(
                  calibrationRepetitionAngle,
                  PUSHUP_REP_END_MIN_ANGLE,
                  PUSHUP_REP_END_MAX_ANGLE,
                ),
              );
            pushupLockedMeasurementSideRef.current = measurementSide;
            sideConsistencyRef.current.lockAssignments();
            boneConstraintRef.current.lockReferences();
            poseFilterRef.current.setPersistentHold(
              true,
              PUSHUP_PERSISTENT_HOLD_MAX_FRAMES,
            );
            poseFilterRef.current.setTemporalJumpGuard(true);
            updatePushupCalibrationStatus('ready');
            pushupPreparationStartedAtRef.current = now;
            updatePushupPreparationStage('pushup-preparation');
            if (uploadedPushupPreflightRef.current) {
              updatePushupPreparationCountdown(null);
              setVideoExportStatus(
                'Cuerpo detectado y fijado. Pulsa Reproducir video para analizar desde el inicio.',
              );
            } else {
              updatePushupPreparationCountdown(
                Math.ceil(PUSHUP_PREPARATION_COUNTDOWN_MS / 1000),
              );
            }
          }
        } else {
          pushupCalibrationReadySinceRef.current = null;
          updatePushupCalibrationStatus('pending');
          if (pushupPreparationStageRef.current === 'body-detection') {
            updatePushupPreparationCountdown(null);
          }
        }
      }
      if (
        selectedExerciseForFrame === 'flexiones'
        && pushupCalibrationSuccessfulRef.current
        && !exerciseStartedRef.current
        && !uploadedPushupPreflightRef.current
        && pushupPreparationStageRef.current === 'pushup-preparation'
      ) {
        const preparationStartedAt = pushupPreparationStartedAtRef.current ?? now;
        pushupPreparationStartedAtRef.current = preparationStartedAt;
        const preparationElapsed = now - preparationStartedAt;
        if (preparationElapsed >= PUSHUP_PREPARATION_COUNTDOWN_MS) {
          exerciseRepTrackerRef.current = createExerciseRepTracker();
          setExerciseRepetitions(0);
          setExerciseGoodRepetitions(0);
          setExerciseRepPhase('esperando inicio');
          setExerciseMinimumAngle(null);
          exerciseStartedRef.current = true;
          setExerciseStarted(true);
          updatePushupPreparationStage('active');
          updatePushupPreparationCountdown(null);
          setTechniqueFeedback(defaultTechniqueFeedback);
        } else {
          updatePushupPreparationCountdown(
            Math.max(
              1,
              Math.ceil((PUSHUP_PREPARATION_COUNTDOWN_MS - preparationElapsed) / 1000),
            ),
          );
        }
      }
      if (
        selectedExerciseForFrame === 'dominadas'
        && pullupCalibrationSuccessfulRef.current
        && !exerciseStartedRef.current
        && pullupPreparationStageRef.current === 'bar-preparation'
      ) {
        const preparationStartedAt = pullupPreparationStartedAtRef.current ?? now;
        pullupPreparationStartedAtRef.current = preparationStartedAt;
        const preparationElapsed = now - preparationStartedAt;
        if (preparationElapsed >= PULLUP_BAR_PREPARATION_COUNTDOWN_MS) {
          pullupTrackerRef.current = createPullupTracker();
          setPullupRepetitions(0);
          setPullupGoodRepetitions(0);
          setPullupPhase('esperando abajo');
          setPullupMinimumAngle(null);
          exerciseStartedRef.current = true;
          setExerciseStarted(true);
          updatePullupPreparationStage('active');
          updatePullupPreparationCountdown(null);
          setPullupFeedback(defaultTechniqueFeedback);
        } else {
          updatePullupPreparationCountdown(
            Math.max(
              1,
              Math.ceil((PULLUP_BAR_PREPARATION_COUNTDOWN_MS - preparationElapsed) / 1000),
            ),
          );
        }
      }
      const repetitionConfig = getRepetitionConfig(selectedExerciseForFrame);
      const repetitionAngle = repetitionConfig
        ? calculateRepetitionAngle(
          selectedExerciseForFrame,
          pose?.keypoints,
          measurementSide,
        )
        : null;
      // El video puede permanecer pausado durante la calibración. Conserva
      // cualquier lectura fresca del fondo para que el primer frame reproducido
      // no dependa de la lectura exacta del instante de cierre de calibración.
      if (
        selectedExerciseForFrame === 'flexiones'
        && uploadedPushupPreflightRef.current
        && !pushupCalibrationSuccessfulRef.current
        && repetitionAngle !== null
        && isWithinAngle(
          repetitionAngle,
          PUSHUP_REP_END_MIN_ANGLE,
          PUSHUP_REP_END_MAX_ANGLE,
        )
      ) {
        uploadedPushupStartsAtBottomRef.current = true;
      }
      const heldPushupMeasurementPoints = selectedExerciseForFrame === 'flexiones'
        ? getPushupHeldMeasurementPoints(
            pose?.keypoints,
            pushupLockedMeasurementSideRef.current ?? measurementSide,
          )
        : [];
      const pushupCountBlockingReasonsForFrame = selectedExerciseForFrame === 'flexiones'
        ? [
            ...pushupBlockingReasonsForFrame,
            ...(exerciseStartedRef.current && repetitionAngle === null
              ? ['ángulo de repetición no calculable']
              : []),
            ...(exerciseStartedRef.current && !repetitionConfig
              ? ['configuración de repetición ausente']
              : []),
          ].filter((reason, index, reasons) => reasons.indexOf(reason) === index)
        : [];
      const repetitionFrameReady = Boolean(
        exerciseStartedRef.current
        && countFrameReady
        && repetitionConfig
        && repetitionAngle !== null
        && !frameMeasurementBlocked,
      );
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
        || selectedExerciseForFrame === 'flexiones-pica'
      )
        && !pushupMeasurementBlocked
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
      let nextAngle = frameMeasurementBlocked ? null : rawAngle;
      const pullupExtremityReadings = isPullupExercise
        && !pullupMeasurementBlocked
        ? getPullupExtremityReadings(pose?.keypoints)
        : {
            left: { shoulder: null, elbow: null },
            right: { shoulder: null, elbow: null },
          };
      const pullupExtremityValidation = isPullupExercise
        ? getPullupExtremityValidation(pose?.keypoints, pullupExtremityReadings)
        : { atBottom: false, atTop: false };
      const pullupTopReached = isPullupExercise
        && !pullupMeasurementBlocked
        && (
          pullupHeadOverWrists === true
          || pullupExtremityValidation.atTop
        );
      const pullupBarDetached = isPullupBarDetached(pose?.keypoints);
      const pullupDetachCandidate = (
        (selectedExerciseForFrame === 'dominadas'
          || selectedExerciseForFrame === 'dominadas-supinas')
        && exerciseStartedRef.current
        && pullupCalibrationSuccessfulRef.current
        && pullupTrackerRef.current.isArmed
        // Antes de agarrar la barra, la postura de pie también deja las
        // muñecas debajo de la cabeza. Solo podemos interpretar esa postura
        // como desmontaje después de haber contado al menos una repetición.
        && pullupTrackerRef.current.repetitions > 0
        && !pullupSessionFinishedRef.current
        // En la parte alta de una dominada los codos flexionados pueden dejar
        // las muñecas debajo de los hombros aunque la persona siga agarrada.
        // Exigir el bloqueo inferior evita congelar el conteo a mitad de la
        // serie por una falsa detección de desmontaje.
        && pullupExtremityValidation.atBottom
        && pullupBarDetached
      );
      if (pullupDetachCandidate) {
        pullupDetachFramesRef.current = Math.min(
          PULLUP_BAR_DETACH_STABLE_FRAMES,
          pullupDetachFramesRef.current + 1,
        );
      } else if (!pullupSessionFinishedRef.current) {
        pullupDetachFramesRef.current = 0;
      }
      const pullupDetachConfirmed = (
        pullupDetachFramesRef.current >= PULLUP_BAR_DETACH_STABLE_FRAMES
      );
      if (pullupDetachConfirmed && !pullupSessionFinishedRef.current) {
        pullupSessionFinishedRef.current = true;
        setPullupSessionFinished(true);
        setPullupFeedback({
          tone: 'success',
          message: 'Ejercicio finalizado',
          detail: `Conteo congelado en ${pullupTrackerRef.current.repetitions} repeticiones. Se detectó que soltaste la barra.`,
        });
      }
      const pullupCountingBlockedByDetach = (
        pullupDetachCandidate || pullupDetachConfirmed
        // Si el tracker está subiendo y ambas muñecas ya cayeron claramente
        // debajo de los hombros, es una salida de la barra, no una nueva
        // repetición. La fase inferior se deja pasar para conservar el cierre
        // automático normal cuando la persona termina de forma controlada.
        || (
          pullupBarDetached
          && pullupTrackerRef.current.phase !== 'abajo'
        )
      );
      let pullupDiagnosticUpdate: PullupTrackerUpdate | null = null;
      if (
        exerciseStartedRef.current
        && !uploadedPushupAnalysisStartingRef.current
        && hasFreshPose
        && frameCameraReady
        && frameDetectionStable
        && selectedExerciseRef.current === 'sentadillas'
        && rawAngle !== null
        && !frameMeasurementBlocked
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
        && effectiveFrameCameraReady
        && effectiveFrameDetectionStable
        && rawAngle !== null
        && !frameMeasurementBlocked
        && !pullupSessionFinishedRef.current
        && !pullupCountingBlockedByDetach
      ) {
        const isSupinePullup = selectedExerciseRef.current === 'dominadas-supinas';
        const pullupUpdate = advancePullupTracker(
          pullupTrackerRef.current,
          rawAngle,
          pullupTopReached,
          pullupExtremityValidation,
        );
        pullupDiagnosticUpdate = pullupUpdate;
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
              ? `Cabeza sobre ambas muñecas · codos completamente extendidos entre ${PULLUP_BOTTOM_MIN_ANGLE}–${PULLUP_BOTTOM_MAX_ANGLE}° · agarre supino.`
              : `Cabeza sobre ambas muñecas · codos completamente extendidos entre ${PULLUP_BOTTOM_MIN_ANGLE}–${PULLUP_BOTTOM_MAX_ANGLE}°.`,
          });
        } else if (pullupUpdate.tracker.event === 'invalid') {
          setPullupFeedback({
            tone: 'warning',
            message: `Repetición ${pullupUpdate.tracker.repetitions}: EVALUADA`,
            detail: 'Completaste el recorrido, pero no se cumplieron todos los rangos calibrados. No suma como correcta.',
          });
        } else if (pullupUpdate.tracker.event === 'no-top') {
          setPullupFeedback({
            tone: 'warning',
            message: `Repetición ${pullupUpdate.tracker.repetitions}: EVALUADA`,
            detail: isSupinePullup
              ? 'Sube hasta que la cabeza quede sobre ambas muñecas y alcanza el rango superior de los codos.'
              : 'Sube hasta que la cabeza quede sobre ambas muñecas y alcanza el rango superior de los codos.',
          });
        } else if (pullupUpdate.tracker.event === 'no-lockout') {
          setPullupFeedback({
            tone: 'warning',
            message: `Repetición ${pullupUpdate.tracker.repetitions}: EVALUADA`,
            detail: `Volviste a subir con ${pullupUpdate.smoothedAngle}°. Extiende primero los brazos en el rango base ${PULLUP_BOTTOM_MIN_ANGLE}–${PULLUP_BOTTOM_MAX_ANGLE}° con tolerancia ±${PULLUP_TOLERANCE_DEG}°.`
          });
        } else {
          setPullupFeedback(
            isSupinePullup
              ? getSupinePullupTechniqueFeedback(pose?.keypoints, nextDominantSide)
              : getPullupTechniqueFeedback(pose?.keypoints, nextDominantSide),
          );
        }
      }
      if (isPullupExercise) {
        const nose = pose?.keypoints?.[0];
        const leftWrist = pose?.keypoints?.[sideKeypoints.left.wrist];
        const rightWrist = pose?.keypoints?.[sideKeypoints.right.wrist];
        const leftShoulder = pose?.keypoints?.[sideKeypoints.left.shoulder];
        const rightShoulder = pose?.keypoints?.[sideKeypoints.right.shoulder];
        const leftHip = pose?.keypoints?.[sideKeypoints.left.hip];
        const rightHip = pose?.keypoints?.[sideKeypoints.right.hip];
        const leftElbow = pose?.keypoints?.[sideKeypoints.left.elbow];
        const rightElbow = pose?.keypoints?.[sideKeypoints.right.elbow];
        const leftHipWorldCoords = getAngleMeasurementCoordinates(leftHip);
        const rightHipWorldCoords = getAngleMeasurementCoordinates(rightHip);
        const relationToNose = (
          wrist: PosePoint | undefined,
        ): ExerciseDiagnosticSnapshot['head']['leftWristRelation'] => {
          if (!wrist || !nose) return 'unknown';
          return wrist.y < nose.y ? 'above' : 'below';
        };
        const leftElbowAngle = pullupElbowAnglesForFrame.left;
        const rightElbowAngle = pullupElbowAnglesForFrame.right;
        const frontBackDiagnostics = pose
          ? getFrontBackDiagnostics(pose)
          : null;
        const unifiedView = {
          shoulderYawDeg: viewEstimate.shoulderYawDeg,
          hipYawDeg: viewEstimate.hipYawDeg,
          yawDeg: nextViewAlignment.yawDeg,
          leftShoulderX: frontBackDiagnostics?.leftShoulderX ?? null,
          rightShoulderX: frontBackDiagnostics?.rightShoulderX ?? null,
          faceScore: frontBackDiagnostics?.faceScore ?? null,
          earScore: frontBackDiagnostics?.earScore ?? null,
          cameraFacingMode: cameraFacingModeRef.current,
          estimatedView: nextViewAlignment.estimatedView,
          status: nextViewAlignment.status,
        };
        const diagnosticSnapshot: ExerciseDiagnosticSnapshot = {
          timestamp: frameTimestamp,
          exercise: selectedExerciseForFrame,
          exerciseStarted: exerciseStartedRef.current,
          phase: pullupTrackerRef.current.phase,
          cameraReady: frameCameraReady,
          poseDetected: visiblePoints >= 5,
          frameStable: frameDetectionStable,
          measurementBlocked: frameMeasurementBlocked,
          modelInfo: {
            model: detector.activeModel ?? null,
            delegate: detector.activeDelegate ?? null,
          },
          head: {
            noseY: nose?.y ?? null,
            leftWristY: leftWrist?.y ?? null,
            rightWristY: rightWrist?.y ?? null,
            noseConfidence: nose?.score ?? null,
            leftWristConfidence: leftWrist?.score ?? null,
            rightWristConfidence: rightWrist?.score ?? null,
            leftWristRelation: relationToNose(leftWrist),
            rightWristRelation: relationToNose(rightWrist),
            overBothWrists: pullupHeadOverWrists,
            underBothWrists: pullupHeadOverWrists === null
              ? null
              : !pullupHeadOverWrists,
          },
          shoulders: {
            left: {
              angle: pullupExtremityReadings.left.shoulder,
              confidence: leftShoulder?.score ?? null,
              valid: pullupExtremityReadings.left.shoulder !== null,
              inBottomRange: pullupExtremityReadings.left.shoulder !== null
                && isWithinPullupAngle(
                  pullupExtremityReadings.left.shoulder,
                  PULLUP_BOTTOM_SHOULDER_MIN_ANGLE,
                  PULLUP_BOTTOM_MAX_ANGLE,
                ),
              inTopRange: pullupExtremityReadings.left.shoulder !== null
                && isWithinPullupAngle(
                  pullupExtremityReadings.left.shoulder,
                  PULLUP_TOP_SHOULDER_MIN_ANGLE,
                  PULLUP_TOP_SHOULDER_MAX_ANGLE,
                ),
            },
            right: {
              angle: pullupExtremityReadings.right.shoulder,
              confidence: rightShoulder?.score ?? null,
              valid: pullupExtremityReadings.right.shoulder !== null,
              inBottomRange: pullupExtremityReadings.right.shoulder !== null
                && isWithinPullupAngle(
                  pullupExtremityReadings.right.shoulder,
                  PULLUP_BOTTOM_SHOULDER_MIN_ANGLE,
                  PULLUP_BOTTOM_MAX_ANGLE,
                ),
              inTopRange: pullupExtremityReadings.right.shoulder !== null
                && isWithinPullupAngle(
                  pullupExtremityReadings.right.shoulder,
                  PULLUP_TOP_SHOULDER_MIN_ANGLE,
                  PULLUP_TOP_SHOULDER_MAX_ANGLE,
                ),
            },
          },
          hips: {
            left: {
              score: leftHip?.score ?? null,
              held: leftHip?.held ?? null,
              heldReason: leftHip?.heldReason ?? null,
              hasWorldCoords: leftHipWorldCoords !== null,
              worldCoords: leftHipWorldCoords,
            },
            right: {
              score: rightHip?.score ?? null,
              held: rightHip?.held ?? null,
              heldReason: rightHip?.heldReason ?? null,
              hasWorldCoords: rightHipWorldCoords !== null,
              worldCoords: rightHipWorldCoords,
            },
          },
          elbows: {
            left: {
              angle: leftElbowAngle,
              confidence: leftElbow?.score ?? null,
              valid: leftElbowAngle !== null,
              inBottomRange: leftElbowAngle !== null
                && isWithinPullupAngle(
                  leftElbowAngle,
                  PULLUP_BOTTOM_MIN_ANGLE,
                  PULLUP_BOTTOM_MAX_ANGLE,
                ),
              inTopRange: leftElbowAngle !== null
                && isWithinPullupAngle(
                  leftElbowAngle,
                  PULLUP_TOP_ELBOW_MIN_ANGLE,
                  PULLUP_TOP_ELBOW_MAX_ANGLE,
                ),
            },
            right: {
              angle: rightElbowAngle,
              confidence: rightElbow?.score ?? null,
              valid: rightElbowAngle !== null,
              inBottomRange: rightElbowAngle !== null
                && isWithinPullupAngle(
                  rightElbowAngle,
                  PULLUP_BOTTOM_MIN_ANGLE,
                  PULLUP_BOTTOM_MAX_ANGLE,
                ),
              inTopRange: rightElbowAngle !== null
                && isWithinPullupAngle(
                  rightElbowAngle,
                  PULLUP_TOP_ELBOW_MIN_ANGLE,
                  PULLUP_TOP_ELBOW_MAX_ANGLE,
                ),
            },
            averagedRawAngle: pullupAngleForFrame,
          },
          ranges: {
            bottomBase: [PULLUP_BOTTOM_MIN_ANGLE, PULLUP_BOTTOM_MAX_ANGLE],
            bottomTolerance: PULLUP_TOLERANCE_DEG,
            bottomEffective: [
              Math.max(0, PULLUP_BOTTOM_MIN_ANGLE - PULLUP_TOLERANCE_DEG),
              Math.min(180, PULLUP_BOTTOM_MAX_ANGLE + PULLUP_TOLERANCE_DEG),
            ],
            topBase: [PULLUP_TOP_ELBOW_MIN_ANGLE, PULLUP_TOP_ELBOW_MAX_ANGLE],
            topTolerance: PULLUP_TOLERANCE_DEG,
            topEffective: [
              Math.max(0, PULLUP_TOP_ELBOW_MIN_ANGLE - PULLUP_TOLERANCE_DEG),
              Math.min(180, PULLUP_TOP_ELBOW_MAX_ANGLE + PULLUP_TOLERANCE_DEG),
            ],
          },
          conditions: {
            atBottom: pullupExtremityValidation.atBottom,
            atTop: pullupTopReached,
            isAtBottom: pullupDiagnosticUpdate?.isAtBottom ?? false,
            hasReachedTop: pullupDiagnosticUpdate?.hasReachedTop ?? false,
          },
          smoothedAngle: pullupDiagnosticUpdate?.smoothedAngle
            ?? pullupTrackerRef.current.lastAngle,
          minimumAngle: pullupTrackerRef.current.minimumAngle,
          topFrames: pullupTrackerRef.current.topFrames,
          repetitions: pullupTrackerRef.current.repetitions,
          goodRepetitions: pullupTrackerRef.current.goodRepetitions,
          event: pullupTrackerRef.current.event,
          barDetached: pullupSessionFinishedRef.current,
          detachmentFrames: pullupDetachFramesRef.current,
          blockingReasons: getPullupDiagnosticBlockingReasons(
            pose?.keypoints,
            exerciseStartedRef.current,
            frameDetectionStable,
            viewBlocksFrame,
            visiblePoints,
            pullupAngleForFrame,
            pullupTrackingIsAnchored,
          ),
          view: unifiedView,
        };
        const viewDiagnosticSnapshot: ViewDiagnosticSnapshot = {
          timestamp: frameTimestamp,
          exercise: selectedExerciseForFrame,
          ...unifiedView,
          recommendedView,
          atBottom: pullupExtremityValidation.atBottom,
          atTop: pullupTopReached,
        };
        viewDiagnosticBufferRef.current.push(viewDiagnosticSnapshot);
        if (viewDiagnosticBufferRef.current.length > PULLUP_DIAGNOSTIC_BUFFER_LIMIT) {
          viewDiagnosticBufferRef.current.splice(
            0,
            viewDiagnosticBufferRef.current.length - PULLUP_DIAGNOSTIC_BUFFER_LIMIT,
          );
        }
        pullupDiagnosticBufferRef.current.push(diagnosticSnapshot);
        if (pullupDiagnosticBufferRef.current.length > PULLUP_DIAGNOSTIC_BUFFER_LIMIT) {
          pullupDiagnosticBufferRef.current.splice(
            0,
            pullupDiagnosticBufferRef.current.length - PULLUP_DIAGNOSTIC_BUFFER_LIMIT,
          );
        }
        if (now - lastPullupDiagnosticLogAtRef.current >= 500) {
          console.log('[view-diagnostics]', viewDiagnosticSnapshot);
          console.log('[pullup-diagnostics]', diagnosticSnapshot);
          lastPullupDiagnosticLogAtRef.current = now;
        }
      }
      const rowTechniqueReady = selectedExerciseForFrame !== 'remo-barra'
        || isBarbellRowTechniqueValid(pose?.keypoints, nextDominantSide);
      const elevatedAustralianRowTechniqueReady = selectedExerciseForFrame !== 'remos-australianos-elevados'
        || isElevatedAustralianRowTechniqueValid(pose?.keypoints, nextDominantSide);
      const dipTechniqueReady = selectedExerciseForFrame !== 'fondos'
        || isDipTechniqueValid(pose?.keypoints, nextDominantSide);
      const pulldownTechniqueReady = selectedExerciseForFrame !== 'jalon'
        || isLatPulldownTechniqueValid(pose?.keypoints, nextDominantSide);
      const pushupTechniqueReady = selectedExerciseForFrame !== 'flexiones'
        && selectedExerciseForFrame !== 'flexiones-declinadas'
        && selectedExerciseForFrame !== 'flexiones-pica'
        ? true
        : !pushupMeasurementBlocked
          && isPushupTechniqueValid(
          pose?.keypoints,
          nextDominantSide,
          selectedExerciseForFrame === 'flexiones-declinadas' ? 'declined' : 'regular',
        );
      const pallofTechniqueReady = selectedExerciseForFrame !== 'press-pallof-polea-banda'
        || isPallofTechniqueValid(pose?.keypoints);
      const dumbbellPressTechniqueReady = selectedExerciseForFrame !== 'press-plano-mancuernas'
        || isDumbbellPressTechniqueValid(
          pose?.keypoints,
          exerciseRepTrackerRef.current.phase,
          repetitionAngle,
        );
      const shoulderMachinePressTechniqueReady = selectedExerciseForFrame !== 'press-hombros-maquina'
        || isShoulderMachinePressTechniqueValid(
          pose?.keypoints,
          repetitionAngle,
        );
      const repetitionTechniqueReady = rowTechniqueReady
        && elevatedAustralianRowTechniqueReady
        && dipTechniqueReady
        && pushupTechniqueReady
        && pallofTechniqueReady
        && dumbbellPressTechniqueReady
        && shoulderMachinePressTechniqueReady;
      if (
        exerciseStartedRef.current
        && !uploadedPushupAnalysisStartingRef.current
        && hasFreshPose
        && countFrameReady
        && repetitionConfig
        && repetitionAngle !== null
        && (isPushupExercise || repetitionTechniqueReady)
        && !frameMeasurementBlocked
      ) {
        const exerciseRepUpdate = advanceExerciseRepTracker(
          exerciseRepTrackerRef.current,
          repetitionAngle,
          repetitionConfig,
          isPushupExercise
            ? pushupTechniqueReady
            : selectedExerciseForFrame === 'jalon'
            ? pulldownTechniqueReady
            : selectedExerciseForFrame === 'press-pallof-polea-banda'
              ? pallofTechniqueReady
              : selectedExerciseForFrame === 'press-plano-mancuernas'
                ? dumbbellPressTechniqueReady
                : selectedExerciseForFrame === 'press-hombros-maquina'
                  ? shoulderMachinePressTechniqueReady
                : true,
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
          || selectedExerciseForFrame === 'remos-australianos-elevados'
          || selectedExerciseForFrame === 'fondos'
          || selectedExerciseForFrame === 'jalon'
           || selectedExerciseForFrame === 'press-pallof-polea-banda'
           || selectedExerciseForFrame === 'press-hombros-maquina')
        && exerciseStartedRef.current
        && !frameMeasurementBlocked
        && (
          !hasFreshPose
          || !frameCameraReady
          || repetitionAngle === null
           || (selectedExerciseForFrame === 'remo-barra' && !rowTechniqueReady)
           || (selectedExerciseForFrame === 'remos-australianos-elevados' && !elevatedAustralianRowTechniqueReady)
          || (selectedExerciseForFrame === 'fondos' && !dipTechniqueReady)
            || (selectedExerciseForFrame === 'press-pallof-polea-banda' && !pallofTechniqueReady)
            || (selectedExerciseForFrame === 'press-hombros-maquina' && !shoulderMachinePressTechniqueReady)
        )
      ) {
        const resetTracker = createExerciseRepTracker();
        exerciseRepTrackerRef.current = resetTracker;
        setExerciseRepetitions(resetTracker.repetitions);
        setExerciseGoodRepetitions(resetTracker.goodRepetitions);
        setExerciseRepPhase(resetTracker.phase);
        setExerciseMinimumAngle(resetTracker.endpointAngle);
      }
      if (
        rawAngle !== null
        && !frameMeasurementBlocked
        && hasFreshPose
        && frameDetectionStable
      ) {
        previousLegAngleRef.current = rawAngle;
      } else if (selectedExerciseForFrame !== 'sentadillas'
        && selectedExerciseForFrame !== 'prensa-piernas'
        && selectedExerciseForFrame !== 'zancadas'
        && selectedExerciseForFrame !== 'zancada-banco') {
        previousLegAngleRef.current = null;
      }
      const heelLiftFeedback = getHeelLiftWarning(
        selectedExerciseForFrame,
        pose?.keypoints,
        measurementSide,
        squatTrackerRef.current.phase,
        exerciseRepTrackerRef.current.phase,
        previousLegAngleForFrame,
        rawAngle,
      );
      const heelRaiseFeedback = heelRaiseIsDescending
        ? {
            tone: 'warning' as const,
            message: 'Baja el talón con control',
            detail: `La elevación sigue en ${Math.round(
              (heelRaiseFootMeasurement?.heelLiftRatio ?? 0) * 100,
            )}% durante el descenso. Llega hasta ≤${HEEL_RAISE_DOWN_RATIO} para apoyar el pie.`,
          }
        : null;
      const footTechniqueFeedback = frameMeasurementBlocked
        ? null
        : heelLiftFeedback ?? heelRaiseFeedback;
      let displayAngle = effectiveFrameDetectionStable ? nextAngle : null;
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
      if (selectedExerciseForFrame === 'flexiones') {
        setPushupBlockingReasons(pushupCountBlockingReasonsForFrame);
        setPushupRepetitionFrameReady(repetitionFrameReady);
        setPushupStabilityFrames(stabilityFramesRef.current);
        setPushupHeldMeasurementPoints(heldPushupMeasurementPoints);
      }
      if (
        inputModeRef.current === 'video'
        && now - lastVideoTimeUiUpdateRef.current >= 100
      ) {
        lastVideoTimeUiUpdateRef.current = now;
        setVideoTimeSeconds(video.currentTime);
      }
      setPoseDetected(pullupTrackingIsAnchored || visiblePoints >= 5);
      setFaceDetected(nextFaceDetected);
      setCameraReady(
        frameCameraReady
        || pullupCalibrationLocked
        || pullupTrackingIsAnchored,
      );
      setCameraGuidance(nextCameraGuidance);
      setDominantSide(measurementSide);
      setSideConfidence(nextDominantSideResult?.average ?? null);
      setAngle(displayAngle);
      const nextLiveAngleReadings = calculateExtremityAngleReadings(
        selectedExerciseForFrame,
        pose?.keypoints,
        measurementSide,
      );
      setLiveAngleReadings(nextLiveAngleReadings);
      setDipJointReadings(
        selectedExerciseForFrame === 'fondos'
          ? calculateDipJointReadings(pose?.keypoints, nextDominantSide)
          : [],
      );
      setPullupJointReadings(
        selectedExerciseForFrame === 'dominadas'
          || selectedExerciseForFrame === 'dominadas-supinas'
          || selectedExerciseForFrame === 'dominadas-comando'
          ? calculatePullupJointReadings(pose?.keypoints)
          : [],
      );
      setAnglePoints(getAngleDiagnosticPoints(
        selectedExerciseRef.current ?? 'fondos',
        pose?.keypoints,
        measurementSide,
      ));
      setTechniqueFeedback(
        frameLowConfidence || pushupMeasurementBlocked
          ? lowConfidenceFeedback
          : effectiveViewBlocksFrame
            ? {
                tone: 'warning',
                message: nextViewAlignment.message,
                detail: nextViewAlignment.detail,
              }
            : footTechniqueFeedback
            ?? (selectedExerciseRef.current === 'flexiones'
          ? getPushupTechniqueFeedback(pose?.keypoints, nextDominantSide)
          : selectedExerciseRef.current === 'flexiones-declinadas'
            ? getPushupTechniqueFeedback(pose?.keypoints, nextDominantSide, 'declined')
          : selectedExerciseRef.current === 'flexiones-pica'
            ? getPikePushupTechniqueFeedback(pose?.keypoints, nextDominantSide)
          : selectedExerciseRef.current === 'press-militar'
            ? getMilitaryPressTechniqueFeedback(pose?.keypoints, nextDominantSide)
          : selectedExerciseRef.current === 'elevaciones-laterales'
            || selectedExerciseRef.current === 'elevaciones-laterales-polea-baja'
            ? getLateralRaiseTechniqueFeedback(pose?.keypoints)
          : selectedExerciseRef.current === 'triceps-polea-alta'
            ? getTricepsPushdownTechniqueFeedback(pose?.keypoints, nextDominantSide)
          : selectedExerciseRef.current === 'triceps-tras-nuca-polea-alta'
            ? getOverheadTricepsTechniqueFeedback(pose?.keypoints, nextDominantSide)
          : selectedExerciseRef.current === 'copa-mancuernas'
            ? getOverheadTricepsTechniqueFeedback(pose?.keypoints, nextDominantSide, 'con mancuerna')
           : selectedExerciseRef.current === 'extension-horizontal-barra'
             ? getHorizontalBarExtensionTechniqueFeedback(pose?.keypoints, nextDominantSide)
          : selectedExerciseRef.current === 'curl-biceps'
            ? getBicepsCurlTechniqueFeedback(pose?.keypoints, nextDominantSide)
            : selectedExerciseRef.current === 'curl-inclinado-mancuernas'
              ? getBicepsCurlTechniqueFeedback(pose?.keypoints, nextDominantSide)
            : selectedExerciseRef.current === 'curl-predicador'
              ? getBicepsCurlTechniqueFeedback(pose?.keypoints, nextDominantSide)
            : selectedExerciseRef.current === 'curl-arana'
              ? getBicepsCurlTechniqueFeedback(pose?.keypoints, nextDominantSide)
            : selectedExerciseRef.current === 'curl-martillo'
              ? getBicepsCurlTechniqueFeedback(pose?.keypoints, nextDominantSide)
           : selectedExerciseRef.current === 'curl-inverso-barra'
             ? getBicepsCurlTechniqueFeedback(pose?.keypoints, nextDominantSide)
           : selectedExerciseRef.current === 'curl-muneca-sentado'
             ? getSeatedWristCurlTechniqueFeedback(pose?.keypoints, nextDominantSide)
           : selectedExerciseRef.current === 'rodillo-muneca'
             ? getSeatedWristCurlTechniqueFeedback(pose?.keypoints, nextDominantSide, 'Rodillo de muñeca')
          : selectedExerciseRef.current === 'press-pallof-polea-banda'
            ? getPallofTechniqueFeedback(pose?.keypoints)
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
               : selectedExerciseRef.current === 'remos-australianos-elevados'
                 ? getElevatedAustralianRowTechniqueFeedback(pose?.keypoints, nextDominantSide)
              : selectedExerciseRef.current === 'zancadas'
                ? getLungeTechniqueFeedback(pose?.keypoints, nextDominantSide)
              : selectedExerciseRef.current === 'zancada-banco'
                 ? getBenchLungeTechniqueFeedback(pose?.keypoints, nextDominantSide)
              : selectedExerciseRef.current === 'plancha'
                ? getPlankTechniqueFeedback(pose?.keypoints, nextDominantSide)
             : defaultTechniqueFeedback),
      );
      if (
        !frameLowConfidence
        && selectedExerciseRef.current === 'sentadillas'
        && heelLiftFeedback
      ) {
        setSquatFeedback(heelLiftFeedback);
      }
      if (effectiveViewBlocksFrame) {
        const viewFeedback: TechniqueFeedback = {
          tone: 'warning',
          message: nextViewAlignment.message,
          detail: nextViewAlignment.detail,
        };
        if (selectedExerciseRef.current === 'sentadillas') {
          setSquatFeedback(viewFeedback);
        }
        if (
          selectedExerciseRef.current === 'dominadas'
          || selectedExerciseRef.current === 'dominadas-supinas'
        ) {
          setPullupFeedback(viewFeedback);
        }
      } else if (frameLowConfidence) {
        if (selectedExerciseRef.current === 'sentadillas') {
          setSquatFeedback(lowConfidenceFeedback);
        }
        if (
          selectedExerciseRef.current === 'dominadas'
          || selectedExerciseRef.current === 'dominadas-supinas'
        ) {
          setPullupFeedback(lowConfidenceFeedback);
        }
      }
      if (displayAngle !== null) {
        setAngleHistory((history) => (
          history[history.length - 1] === displayAngle
            ? history
            : [...history, displayAngle].slice(-5)
        ));
      }
      if (measurementSide && previousSideRef.current && measurementSide !== previousSideRef.current) {
        sideSwitchesRef.current += 1;
        setSideSwitches(sideSwitchesRef.current);
        setSideChangeNotice(
          `${previousSideRef.current === 'left' ? 'Izquierdo' : 'Derecho'} → ${measurementSide === 'left' ? 'izquierdo' : 'derecho'}`,
        );
      }
      previousSideRef.current = measurementSide;
      const genericTracker = isPullupExercise
        ? pullupTrackerRef.current
        : exerciseRepTrackerRef.current;
      const getExtremityDiagnosticSample = (
        side: PoseSide,
        landmark: 'wrist' | 'ankle',
      ): ExtremityDiagnosticSample => {
        const landmarkIndex = sideKeypoints[side][landmark];
        return {
          rawModel: toDiagnosticLandmarkSample(
            detectedPose?.keypoints[landmarkIndex],
          ),
          afterSideAssignment: toDiagnosticLandmarkSample(
            sideConsistentPose?.keypoints[landmarkIndex],
          ),
          afterBoneConstraints: toDiagnosticLandmarkSample(
            constrainedPose?.keypoints[landmarkIndex],
          ),
          filtered: toDiagnosticLandmarkSample(
            pose?.keypoints[landmarkIndex],
          ),
        };
      };
      const frameDiagnosticSnapshot: FrameDiagnosticSnapshot = {
        timestamp: frameTimestamp,
        videoTimeSeconds: inputModeRef.current === 'video' ? video.currentTime : null,
        exercise: selectedExerciseForFrame,
        exerciseStarted: exerciseStartedRef.current,
        cameraReady: frameCameraReady,
        poseDetected: visiblePoints >= 5,
        frameStable: frameDetectionStable,
        stabilityFrames: stabilityFramesRef.current,
        requiredStabilityFrames: selectedExerciseForFrame === 'flexiones'
          ? PUSHUP_COUNT_STABLE_FRAMES
          : 4,
        measurementBlocked: frameMeasurementBlocked,
        measurementBlockingReasons: pushupBlockingReasonsForFrame,
        repetitionFrameReady,
        repetitionBlockingReasons: pushupCountBlockingReasonsForFrame,
        heldMeasurementPoints: heldPushupMeasurementPoints,
        visiblePoints,
        dominantSide: measurementSide,
        sideConfidence: nextDominantSideResult?.average ?? null,
        modelInfo: {
          model: detector.activeModel ?? null,
          delegate: detector.activeDelegate ?? null,
        },
        measurements: {
          rawAngle: frameMeasurementBlocked ? null : rawAngle,
          repetitionAngle: frameMeasurementBlocked ? null : repetitionAngle,
          displayAngle,
          pullupAngle: frameMeasurementBlocked ? null : pullupAngleForFrame,
          repetitions: genericTracker.repetitions,
          goodRepetitions: genericTracker.goodRepetitions,
          phase: genericTracker.phase,
          minimumAngle: isPullupExercise
            ? pullupTrackerRef.current.minimumAngle
            : exerciseRepTrackerRef.current.endpointAngle,
          // Un evento pertenece al frame que lo generó. No lo repitas durante
          // frames retenidos, poses ausentes o después de detener la sesión.
          event: exerciseStartedRef.current
            && hasFreshPose
            && !frameMeasurementBlocked
            ? genericTracker.event
            : null,
        },
        pushup: isPushupExercise
          ? {
              elbowTorsoAngle: pushupTechniqueAnglesForFrame.elbowTorsoAngle,
              bodyLineAngle: pushupTechniqueAnglesForFrame.bodyLineAngle,
              techniqueReady: pushupTechniqueReady,
            }
          : null,
        view: {
          shoulderYawDeg: viewEstimate.shoulderYawDeg,
          hipYawDeg: viewEstimate.hipYawDeg,
          yawDeg: nextViewAlignment.yawDeg,
          cameraFacingMode: cameraFacingModeRef.current,
          estimatedView: nextViewAlignment.estimatedView,
          recommendedView,
          status: nextViewAlignment.status,
        },
        extremityPoints: isPushupExercise
          ? {
              left: {
                wrist: getExtremityDiagnosticSample('left', 'wrist'),
                ankle: getExtremityDiagnosticSample('left', 'ankle'),
              },
              right: {
                wrist: getExtremityDiagnosticSample('right', 'wrist'),
                ankle: getExtremityDiagnosticSample('right', 'ankle'),
              },
            }
          : null,
        pose: pose
          ? {
              keypoints: pose.keypoints.map((point) => point ? { ...point } : { x: 0, y: 0, score: 0 }),
              worldLandmarks: pose.worldLandmarks.map((point) => point ? { ...point } : { x: 0, y: 0, score: 0 }),
            }
          : null,
      };
      diagnosticBufferRef.current.push(frameDiagnosticSnapshot);
      if (diagnosticBufferRef.current.length > DIAGNOSTIC_BUFFER_LIMIT) {
        diagnosticBufferRef.current.splice(
          0,
          diagnosticBufferRef.current.length - DIAGNOSTIC_BUFFER_LIMIT,
        );
      }
      if (uploadedPushupOfflineAnalysisRef.current) {
        const tracker = exerciseRepTrackerRef.current;
        const exportPose = hasFreshPose && pose
          ? {
              keypoints: pose.keypoints.map(({
                x,
                y,
                z,
                score,
                held,
                heldFrames,
                heldReason,
                swapped,
              }) => ({
                x,
                y,
                z,
                score,
                held,
                heldFrames,
                heldReason,
                swapped,
              })),
            }
          : null;
        const exportReadings = exportPose
          ? nextLiveAngleReadings.map(({ label, value, target, unit }) => ({
              label,
              value,
              target,
              unit,
            }))
          : [];
        uploadedPushupExportSamplesRef.current.push({
          timeSeconds: video.currentTime,
          pose: exportPose,
          qualityReady: hasFreshPose
            && repetitionFrameReady
            && !frameMeasurementBlocked,
          hud: {
            exercise: 'flexiones',
            hasEvaluationCounter: true,
            correctRepetitions: tracker.goodRepetitions,
            incorrectRepetitions: Math.max(
              0,
              tracker.repetitions - tracker.goodRepetitions,
            ),
            liveAngleReadings: exportReadings,
            dipJointReadings: [],
            pullupJointReadings: [],
          },
        });
      }
      setConfidencePoints([
        selectMostConfident(pose?.keypoints, 'Hombro', 11, 12),
        selectMostConfident(pose?.keypoints, 'Cadera', 23, 24),
        selectMostConfident(pose?.keypoints, 'Rodilla', 25, 26),
      ]);
      if (canvasRef.current && !uploadedPushupOfflineAnalysisRef.current) {
        drawSkeleton(
          canvasRef.current,
          video,
          pose,
          inputModeRef.current === 'camera' && cameraFacingModeRef.current === 'user',
          FOOT_OVERLAY_EXERCISES.has(selectedExerciseForFrame),
          DEBUG_LIMB_TRACKING_ACTIVE,
        );
        if (DEBUG_LIMB_TRACKING_ACTIVE) {
          drawLimbDebugOverlay(
            canvasRef.current,
            video,
            rawPoseForDebugRef.current,
            pose,
            inputModeRef.current === 'camera' && cameraFacingModeRef.current === 'user',
          );
        }
      }
      if (
        inputModeRef.current === 'video'
        && video.paused
        && !uploadedPushupOfflineAnalysisRef.current
      ) {
        // En la calibración pausada no hay cuadros de reproducción que capturen
        // el overlay; durante la reproducción, scheduleNextFrame ya captura
        // cada cuadro fuente y evita repetir el costoso repintado a 1080p aquí.
        captureUploadedVideoFrame();
      }

      if (
        detector.activeModel === 'heavy'
        && !modelDegradedRef.current
        && detectionFrameTimesRef.current.length >= 2
      ) {
        const frameTimes = detectionFrameTimesRef.current;
        const elapsed = frameTimes[frameTimes.length - 1] - frameTimes[0];
        const measuredFps = elapsed > 0
          ? ((frameTimes.length - 1) * 1000) / elapsed
          : Number.POSITIVE_INFINITY;
        if (measuredFps < MIN_FPS) {
          lowFpsSinceRef.current ??= now;
          if (
            now - lowFpsSinceRef.current >= FPS_LOW_SECONDS * 1000
            && !detectorTransitionRef.current
          ) {
            detectorTransitionRef.current = (async () => {
              const currentDetector = detectorRef.current;
              if (!currentDetector || currentDetector.activeModel !== 'heavy') return;
              const nextDetector = await createPoseDetector({
                model: 'full',
                delegate: currentDetector.activeDelegate ?? 'GPU',
              });
              if (!activeRef.current) {
                nextDetector.close();
                return;
              }
              currentDetector.close();
              detectorRef.current = nextDetector;
              modelDegradedRef.current = true;
              detectionFrameTimesRef.current = [];
              lowFpsSinceRef.current = null;
              sideConsistencyRef.current.reset();
              boneConstraintRef.current.reset();
              poseFilterRef.current.reset();
              primaryPoseTrackRef.current = null;
              stabilityFramesRef.current = 0;
              setDetectionStable(false);
              console.warn(
                `[pose3d] FPS medio inferior a ${MIN_FPS} durante ${FPS_LOW_SECONDS}s; `
                + `cambiando de heavy a full con ${nextDetector.activeDelegate ?? 'GPU'}.`,
              );
            })().catch((error) => {
              lowFpsSinceRef.current = null;
              console.warn('[pose3d] No se pudo degradar a full:', error);
            }).finally(() => {
              detectorTransitionRef.current = null;
            });
          }
        } else {
          lowFpsSinceRef.current = null;
        }
      }
    } catch {
      if (activeRef.current) {
        incrementErrorCount();
        setPoseDetected(false);
        setDetectionStable(false);
      }
    }

  }, [
    incrementErrorCount,
    captureUploadedVideoFrame,
    prepareDetectorFrame,
    updatePullupPreparationCountdown,
    updatePullupCalibrationStatus,
    updatePullupPreparationStage,
    updatePushupPreparationCountdown,
    updatePushupCalibrationStatus,
    updatePushupPreparationStage,
  ]);

  const logUploadedPushupLiveMetrics = useCallback((sourceTime: number) => {
    const metrics = uploadedPushupLiveMetrics;
    if (!metrics?.active) return;
    if (sourceTime < metrics.lastReportSourceTime) {
      metrics.lastReportSourceTime = sourceTime;
      metrics.analyzedSamples = 0;
      metrics.detectorMs = 0;
      metrics.processFrameMs = 0;
      metrics.skeletonDrawMs = 0;
      metrics.captureMs = 0;
      metrics.captureCount = 0;
      metrics.busySkipped = 0;
      metrics.longTaskCount = 0;
      metrics.longTaskMs = 0;
      return;
    }
    const elapsedVideoSeconds = sourceTime - metrics.lastReportSourceTime;
    if (elapsedVideoSeconds < 2) return;
    const samples = metrics.analyzedSamples;
    const average = (totalMs: number, count = samples) => (
      count > 0 ? (totalMs / count).toFixed(1) : '0.0'
    );
    const processFrameRestMs = Math.max(
      0,
      metrics.processFrameMs - metrics.detectorMs - metrics.skeletonDrawMs,
    );
    const recorder = recorderRef.current;
    const recordingActive = UPLOADED_VIDEO_RECORDING_ENABLED
      && Boolean(recorder && recorder.state !== 'inactive');
    console.log(
      `[fps] ${(samples / elapsedVideoSeconds).toFixed(1)} muestras analizadas por segundo de video`
      + ` | ${metrics.busySkipped} cuadros omitidos por detector ocupado`
      + ` | ms medios: detección ${average(metrics.detectorMs)}, `
      + `resto de processFrame ${average(processFrameRestMs)}, `
      + `dibujo del esqueleto ${average(metrics.skeletonDrawMs)}, `
      + `captureUploadedVideoFrame ${average(metrics.captureMs, metrics.captureCount)}`
      + ` | tareas largas del hilo principal: ${metrics.longTaskCount} `
      + `(${metrics.longTaskMs.toFixed(1)} ms total)`
      + ` | grabación: ${recordingActive ? 'activada' : 'no'}`,
    );
    metrics.lastReportSourceTime = sourceTime;
    metrics.analyzedSamples = 0;
    metrics.detectorMs = 0;
    metrics.processFrameMs = 0;
    metrics.skeletonDrawMs = 0;
    metrics.captureMs = 0;
    metrics.captureCount = 0;
    metrics.busySkipped = 0;
    metrics.longTaskCount = 0;
    metrics.longTaskMs = 0;
  }, []);

  const scheduleNextFrame = useCallback(() => {
    const video = videoRef.current;
    const canInspectPausedPushupVideo = Boolean(
      video?.paused
      && inputModeRef.current === 'video'
      && uploadedPushupPreflightRef.current
      && !pushupCalibrationSuccessfulRef.current,
    );
    if (
      !activeRef.current
      || !detectorRef.current
      || !video
      || (video.paused && !canInspectPausedPushupVideo)
      || video.ended
      || animationFrameRef.current !== null
      || videoFrameCallbackRef.current !== null
    ) {
      return;
    }

    const runFrame = (timestamp: number, sourceTime: number) => {
      if (!activeRef.current) return;
      const diagnostics = videoPipelineDiagnosticsRef.current;
      diagnostics.sourceFrames += 1;
      diagnostics.lastSourceTime = sourceTime;
      const isUploadedPushup = selectedExerciseRef.current === 'flexiones';
      if (
        inputModeRef.current === 'video'
        && !video.paused
        && !video.ended
        && (!isUploadedPushup || UPLOADED_VIDEO_RECORDING_ENABLED)
      ) {
        const shouldMeasureCapture = isUploadedPushup
          && uploadedPushupLiveMetrics?.active;
        const captureStartedAt = shouldMeasureCapture ? performance.now() : 0;
        captureUploadedVideoFrame();
        if (shouldMeasureCapture) {
          recordUploadedPushupLiveDuration(
            'captureMs',
            performance.now() - captureStartedAt,
          );
          if (uploadedPushupLiveMetrics?.active) {
            uploadedPushupLiveMetrics.captureCount += 1;
          }
        }
      }
      const shouldAnalyzeVideoFrame = !uploadedPushupExportPlaybackRef.current
        && (
          canInspectPausedPushupVideo
            ? timestamp - lastDetectorTimestampRef.current
              >= UPLOADED_VIDEO_ANALYSIS_INTERVAL_SECONDS * 1000
            : inputModeRef.current !== 'video'
              || sourceTime - lastVideoAnalysisSourceTimeRef.current
                >= UPLOADED_VIDEO_ANALYSIS_INTERVAL_SECONDS
              || lastVideoAnalysisSourceTimeRef.current === Number.NEGATIVE_INFINITY
        );
      if (!shouldAnalyzeVideoFrame) {
        logUploadedPushupLiveMetrics(sourceTime);
        if (activeRef.current) scheduleNextFrame();
        return;
      }
      if (processingFrameRef.current) {
        if (uploadedPushupLiveMetrics?.active) {
          uploadedPushupLiveMetrics.busySkipped += 1;
        }
        logUploadedPushupLiveMetrics(sourceTime);
        if (activeRef.current) scheduleNextFrame();
        return;
      }
      if (inputModeRef.current === 'video') {
        lastVideoAnalysisSourceTimeRef.current = sourceTime;
      }
      processingFrameRef.current = true;
      const processFrameStartedAt = performance.now();
      void processFrame(timestamp).finally(() => {
        recordUploadedPushupLiveDuration(
          'processFrameMs',
          performance.now() - processFrameStartedAt,
        );
        processingFrameRef.current = false;
      });
      logUploadedPushupLiveMetrics(sourceTime);
      if (activeRef.current) scheduleNextFrame();
    };

    if (!canInspectPausedPushupVideo && typeof video.requestVideoFrameCallback === 'function') {
      videoFrameCallbackRef.current = video.requestVideoFrameCallback(
        (timestamp, metadata) => {
          videoFrameCallbackRef.current = null;
          runFrame(timestamp, metadata.mediaTime);
        },
      );
      return;
    }

    animationFrameRef.current = requestAnimationFrame((timestamp) => {
      animationFrameRef.current = null;
      runFrame(timestamp, video.currentTime);
    });
  }, [captureUploadedVideoFrame, logUploadedPushupLiveMetrics, processFrame]);

  useEffect(() => {
    const logUploadedPushupRepDiagnostics = () => {
      const video = videoRef.current;
      if (
        inputModeRef.current !== 'video'
        || selectedExerciseRef.current !== 'flexiones'
        || !video
        || video.paused
        || video.ended
      ) {
        return;
      }

      const now = performance.now();
      const recentFrames = diagnosticBufferRef.current.filter((frame) => (
        frame.exercise === 'flexiones'
        && frame.videoTimeSeconds !== null
        && frame.timestamp <= now
        && now - frame.timestamp <= 1000
      ));
      const currentFrame = recentFrames[recentFrames.length - 1];
      const rawAngles = recentFrames
        .map((frame) => frame.measurements.repetitionAngle)
        .filter((angle): angle is number => angle !== null);
      const trackerInputAngles = diagnosticBufferRef.current
        .filter((frame) => (
          frame.exercise === 'flexiones'
          && frame.repetitionFrameReady
          && frame.measurements.repetitionAngle !== null
        ))
        .slice(-3)
        .map((frame) => frame.measurements.repetitionAngle)
        .filter((angle): angle is number => angle !== null);
      const tracker = exerciseRepTrackerRef.current;
      const readyCount = recentFrames.filter((frame) => frame.repetitionFrameReady).length;
      const blockingReasonCounts = new Map<string, number>();
      recentFrames
        .filter((frame) => !frame.repetitionFrameReady)
        .forEach((frame) => {
          const reasons = frame.repetitionBlockingReasons.length
            ? frame.repetitionBlockingReasons
            : ['sin razón detallada'];
          reasons.forEach((reason) => {
            blockingReasonCounts.set(reason, (blockingReasonCounts.get(reason) ?? 0) + 1);
          });
        });
      const blockingReasons = [...blockingReasonCounts.entries()]
        .sort(([firstReason, firstCount], [secondReason, secondCount]) => (
          secondCount - firstCount || firstReason.localeCompare(secondReason)
        ))
        .map(([reason, count]) => `${reason}=${count}`)
        .join(', ') || 'ninguna';
      const formatAngle = (angle: number | null) => (
        angle === null ? '—' : `${angle}°`
      );

      console.log(
        `[rep] fase=${tracker.phase}`
        + ` | total=${tracker.repetitions}`
        + ` | correctas=${tracker.goodRepetitions}`
        + ` | incorrectas=${Math.max(0, tracker.repetitions - tracker.goodRepetitions)}`
        + ` | codo suavizado=${formatAngle(median(trackerInputAngles))}`
        + ` | codo bruto actual=${formatAngle(currentFrame?.measurements.repetitionAngle ?? null)}`
        + ` | codo bruto min/max 1s=${formatAngle(rawAngles.length ? Math.min(...rawAngles) : null)}`
        + `/${formatAngle(rawAngles.length ? Math.max(...rawAngles) : null)}`
        + ` | repetitionFrameReady=${readyCount} true/${recentFrames.length - readyCount} false`
        + ` | bloqueos 1s=${blockingReasons}`
        + ` | muestras/s=${recentFrames.length}`,
      );
    };

    const intervalId = window.setInterval(logUploadedPushupRepDiagnostics, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  // TEMP: todos los tiempos se expresan desde el primer clic/play detectado.
  const logUploadedPushupPlay = useCallback((message: string) => {
    const startedAt = uploadedPushupPlayDiagnosticsRef.current.startedAt;
    const elapsedMs = startedAt === null ? 0 : performance.now() - startedAt;
    console.log(`[play] +${elapsedMs.toFixed(1)}ms ${message}`);
  }, []);

  const startUploadedPushupPlayback = useCallback(async () => {
    const playDiagnostics = uploadedPushupPlayDiagnosticsRef.current;
    playDiagnostics.startedAt ??= performance.now();
    logUploadedPushupPlay('entrada a startUploadedPushupPlayback');
    const video = videoRef.current;
    if (
      !video
      || inputModeRef.current !== 'video'
      || !uploadedPushupPreflightRef.current
      || !pushupCalibrationSuccessfulRef.current
      || exerciseStartedRef.current
      || uploadedPushupAnalysisStartingRef.current
    ) {
      return;
    }

    video.pause();
    video.controls = UPLOADED_PUSHUP_OFFLINE_PREPASS ? false : true;
    uploadedPushupAnalysisStartingRef.current = true;
    exerciseStartedRef.current = true;
    setExerciseStarted(true);
    const generation = ++uploadedPushupAnalysisGenerationRef.current;
    activeRef.current = false;
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (videoFrameCallbackRef.current !== null && video.cancelVideoFrameCallback) {
      video.cancelVideoFrameCallback(videoFrameCallbackRef.current);
      videoFrameCallbackRef.current = null;
    }

    try {
      const processingWaitStartedAt = performance.now();
      let processingWaitFrames = 0;
      logUploadedPushupPlay(
        `inicio de espera de processingFrameRef | ocupado=${processingFrameRef.current}`,
      );
      while (processingFrameRef.current) {
        processingWaitFrames += 1;
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        if (generation !== uploadedPushupAnalysisGenerationRef.current) {
          logUploadedPushupPlay(
            `fin de la espera de processingFrameRef | cancelada tras `
            + `${(performance.now() - processingWaitStartedAt).toFixed(1)} ms`,
          );
          return;
        }
      }
      logUploadedPushupPlay(
        `fin de la espera de processingFrameRef | `
        + `${(performance.now() - processingWaitStartedAt).toFixed(1)} ms, `
        + `${processingWaitFrames} esperas RAF`,
      );

      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      if (duration <= 0) {
        throw new Error('El video no tiene una duración válida para analizar.');
      }

      // El diagnóstico empieza desde el primer cuadro, después de la calibración
      // pausada. El video no se graba mientras el detector evalúa las muestras.
      diagnosticBufferRef.current = [];
      lastVideoAnalysisSourceTimeRef.current = Number.NEGATIVE_INFINITY;
      const initialTracker = createExerciseRepTracker();
      if (uploadedPushupStartsAtBottomRef.current) {
        initialTracker.phase = 'final';
        initialTracker.endpointAngle = PUSHUP_REP_END_MIN_ANGLE;
        initialTracker.currentRepCorrect = true;
      }
      exerciseRepTrackerRef.current = initialTracker;
      setExerciseRepetitions(0);
      setExerciseGoodRepetitions(0);
      setExerciseRepPhase('esperando inicio');
      setExerciseMinimumAngle(null);
      uploadedPushupPreflightRef.current = false;
      uploadedPushupOfflineAnalysisRef.current = UPLOADED_PUSHUP_OFFLINE_PREPASS;
      uploadedPushupAnalysisStartingRef.current = false;
      uploadedPushupExportPlaybackRef.current = false;
      uploadedPushupExportSamplesRef.current = [];
      updatePushupPreparationStage('active');
      updatePushupPreparationCountdown(null);
      setTechniqueFeedback(defaultTechniqueFeedback);
      if (UPLOADED_PUSHUP_OFFLINE_PREPASS) {
        setVideoExportStatus('Analizando el video pausado para no alterar su velocidad: 0%…');
        const overlayCanvas = canvasRef.current;
        overlayCanvas?.getContext('2d')?.clearRect(
          0,
          0,
          overlayCanvas.width,
          overlayCanvas.height,
        );
      }
      activeRef.current = true;
      video.playbackRate = 1;

      if (!UPLOADED_PUSHUP_OFFLINE_PREPASS) {
        uploadedPushupOfflineAnalysisRef.current = false;
        uploadedPushupExportPlaybackRef.current = false;
        uploadedPushupExportSamplesRef.current = [];
        video.controls = true;
        const seekStartedAt = performance.now();
        const playbackStartTime = Math.min(
          0.001,
          Math.max(0, Number.isFinite(video.duration) ? video.duration - 0.001 : 0),
        );
        let seekResult = 'ya estaba al inicio';
        if (video.seeking || Math.abs(video.currentTime - playbackStartTime) > 0.01) {
          seekResult = 'esperó el evento seeked o el límite de 1500 ms';
          await new Promise<void>((resolve) => {
            let timeoutId = 0;
            const finishSeeking = () => {
              window.clearTimeout(timeoutId);
              video.removeEventListener('seeked', finishSeeking);
              resolve();
            };
            video.addEventListener('seeked', finishSeeking, { once: true });
            timeoutId = window.setTimeout(finishSeeking, 1500);
            video.currentTime = playbackStartTime;
          });
        } else if (video.currentTime !== playbackStartTime) {
          seekResult = 'ajuste inmediato, sin esperar seeked';
          video.currentTime = playbackStartTime;
        }
        logUploadedPushupPlay(
          `fin del seek | ${seekResult}; currentTime=${video.currentTime.toFixed(3)} s; `
          + `${(performance.now() - seekStartedAt).toFixed(1)} ms`,
        );
        if (generation !== uploadedPushupAnalysisGenerationRef.current) return;
        uploadedPushupAnalysisStartingRef.current = false;
        startUploadedPushupLiveMetrics(video.currentTime);
        if (UPLOADED_VIDEO_RECORDING_ENABLED) {
          const recordingStartedAt = performance.now();
          beginVideoRecording(video);
          logUploadedPushupPlay(
            `fin de beginVideoRecording | `
            + `${(performance.now() - recordingStartedAt).toFixed(1)} ms; `
            + `recorder=${recorderRef.current?.state ?? 'no iniciado'}`,
          );
        }
        const videoPlayStartedAt = performance.now();
        logUploadedPushupPlay('llamada a video.play() iniciada');
        await video.play();
        logUploadedPushupPlay(
          `video.play() resuelto | `
          + `${(performance.now() - videoPlayStartedAt).toFixed(1)} ms; `
          + `paused=${video.paused}; currentTime=${video.currentTime.toFixed(3)} s`,
        );
        if (
          generation === uploadedPushupAnalysisGenerationRef.current
          && activeRef.current
        ) {
          scheduleNextFrame();
        }
        return;
      }

      const seekAndWait = async (timeSeconds: number) => {
        let seekMs = 0;
        let firstRafMs = 0;
        let secondRafMs = 0;
        if (Math.abs(video.currentTime - timeSeconds) > 0.01) {
          await new Promise<void>((resolve, reject) => {
            let settled = false;
            const seekStartedAt = performance.now();
            const cleanup = () => {
              window.clearTimeout(timeoutId);
              video.removeEventListener('seeked', finish);
            };
            const finish = () => {
              if (settled) return;
              settled = true;
              seekMs = performance.now() - seekStartedAt;
              cleanup();
              resolve();
            };
            const timeoutId = window.setTimeout(() => {
              if (settled) return;
              settled = true;
              cleanup();
              reject(new Error('No se pudo leer un cuadro del video durante el análisis.'));
            }, 8000);
            video.addEventListener('seeked', finish, { once: true });
            try {
              video.currentTime = timeSeconds;
              if (!video.seeking && Math.abs(video.currentTime - timeSeconds) <= 0.01) {
                finish();
              }
            } catch (error) {
              cleanup();
              reject(error instanceof Error ? error : new Error(String(error)));
            }
          });
        }
        await new Promise<void>((resolve) => {
          const firstRafStartedAt = performance.now();
          requestAnimationFrame(() => {
            firstRafMs = performance.now() - firstRafStartedAt;
            const secondRafStartedAt = performance.now();
            requestAnimationFrame(() => {
              secondRafMs = performance.now() - secondRafStartedAt;
              resolve();
            });
          });
        });
        return { seekMs, firstRafMs, secondRafMs };
      };

      const sampleCount = Math.ceil(duration * UPLOADED_PUSHUP_ANALYSIS_FPS) + 1;
      console.log(
        `[analisis] inicio | duración video: ${duration.toFixed(2)} s`
        + ` | resolución: ${video.videoWidth} x ${video.videoHeight}`
        + ` | muestras totales: ${sampleCount}`,
      );
      let lastProgress = -1;
      let timingSampleCount = 0;
      let seekMsInBatch = 0;
      let firstRafMsInBatch = 0;
      let secondRafMsInBatch = 0;
      let processFrameMsInBatch = 0;
      for (let index = 0; index < sampleCount; index += 1) {
        if (
          generation !== uploadedPushupAnalysisGenerationRef.current
          || !exerciseStartedRef.current
        ) {
          return;
        }
        const targetTime = Math.min(
          Math.max(0, duration - 0.001),
          index / UPLOADED_PUSHUP_ANALYSIS_FPS,
        );
        const seekTimings = await seekAndWait(targetTime);
        if (generation !== uploadedPushupAnalysisGenerationRef.current) return;
        processingFrameRef.current = true;
        let processFrameMs = 0;
        try {
          const analysisTimestamp = Number.isFinite(lastDetectorTimestampRef.current)
            ? lastDetectorTimestampRef.current + 1000 / UPLOADED_PUSHUP_ANALYSIS_FPS
            : performance.now();
          const processFrameStartedAt = performance.now();
          await processFrame(analysisTimestamp);
          processFrameMs = performance.now() - processFrameStartedAt;
        } finally {
          processingFrameRef.current = false;
        }
        timingSampleCount += 1;
        seekMsInBatch += seekTimings.seekMs;
        firstRafMsInBatch += seekTimings.firstRafMs;
        secondRafMsInBatch += seekTimings.secondRafMs;
        processFrameMsInBatch += processFrameMs;
        if (timingSampleCount === 10) {
          const detector = detectorRef.current;
          const detectorThread = detector?.detectForVideoAsync
            ? 'worker'
            : 'hilo principal';
          const average = (totalMs: number) => (totalMs / timingSampleCount).toFixed(1);
          console.log(
            `[analisis] muestras: ${index + 1}/${sampleCount}`
            + ` | seek ms: ${average(seekMsInBatch)}`
            + ` | rAF ms: ${average(firstRafMsInBatch + secondRafMsInBatch)}`
            + ` (1: ${average(firstRafMsInBatch)}, 2: ${average(secondRafMsInBatch)})`
            + ` | processFrame ms: ${average(processFrameMsInBatch)}`
            + ` | detector: ${detectorThread}, modelo ${detector?.activeModel ?? 'desconocido'}`
            + `, delegate ${detector?.activeDelegate ?? 'desconocido'}`
            + ` | document.visibilityState: ${document.visibilityState}`,
          );
          timingSampleCount = 0;
          seekMsInBatch = 0;
          firstRafMsInBatch = 0;
          secondRafMsInBatch = 0;
          processFrameMsInBatch = 0;
        }
        const progress = Math.min(100, Math.floor(((index + 1) / sampleCount) * 100));
        if (progress !== lastProgress) {
          lastProgress = progress;
          setVideoExportStatus(
            `Analizando el video pausado para no alterar su velocidad: ${progress}%…`,
          );
          setUploadedAnalysisProgress(progress);
        }
      }

      if (generation !== uploadedPushupAnalysisGenerationRef.current) return;
      uploadedPushupOfflineAnalysisRef.current = false;
      setUploadedAnalysisProgress(null);
      video.controls = true;
      const samples = uploadedPushupExportSamplesRef.current;
      const validSamples = samples.filter((sample) => sample.qualityReady).length;
      const requiredValidSamples = Math.max(3, Math.ceil(samples.length * 0.3));
      if (samples.length < 3 || validSamples < requiredValidSamples) {
        uploadedPushupPreflightRef.current = true;
        activeRef.current = false;
        exerciseStartedRef.current = false;
        setExerciseStarted(false);
        updatePushupPreparationStage('pushup-preparation');
        setVideoExportStatus(
          'No se habilitó la descarga: no se detectaron suficientes articulaciones estables. '
          + 'Usa una vista lateral, buena luz y deja el cuerpo completo visible.',
        );
        return;
      }

      setVideoExportStatus(
        'Análisis completo. Preparando el video con sus lecturas a velocidad normal…',
      );
      await seekAndWait(Math.min(0.001, Math.max(0, duration - 0.001)));
      if (generation !== uploadedPushupAnalysisGenerationRef.current) return;
      setVideoTimeSeconds(video.currentTime);
      video.controls = false;
      uploadedPushupExportPlaybackRef.current = true;
      activeRef.current = true;
      captureUploadedVideoFrame();
      beginVideoRecording(video);
      if (!recorderRef.current) {
        uploadedPushupExportPlaybackRef.current = false;
        activeRef.current = false;
        exerciseStartedRef.current = false;
        setExerciseStarted(false);
        uploadedPushupPreflightRef.current = true;
        return;
      }
      await video.play();
    } catch {
      if (generation === uploadedPushupAnalysisGenerationRef.current) {
        stopUploadedPushupLiveMetrics();
        setUploadedAnalysisProgress(null);
        const recorder = recorderRef.current;
        if (recorder) {
          recorder.ondataavailable = null;
          recorder.onstop = null;
          recorder.onerror = null;
          recorderGenerationRef.current += 1;
          if (recorder.state !== 'inactive') recorder.stop();
          recorderRef.current = null;
          recorderStreamRef.current?.getTracks().forEach((track) => track.stop());
          recorderStreamRef.current = null;
          recorderCanvasTrackRef.current = null;
          recorderChunksRef.current = [];
        }
        uploadedPushupOfflineAnalysisRef.current = false;
        uploadedPushupAnalysisStartingRef.current = false;
        uploadedPushupExportPlaybackRef.current = false;
        activeRef.current = false;
        exerciseStartedRef.current = false;
        setExerciseStarted(false);
        uploadedPushupPreflightRef.current = true;
        video.controls = true;
        setVideoExportStatus('No se pudo completar el análisis del video. Revisa el archivo e inténtalo otra vez.');
      }
    } finally {
      if (generation === uploadedPushupAnalysisGenerationRef.current) {
        uploadedPushupAnalysisStartingRef.current = false;
      }
    }
    if (
      generation === uploadedPushupAnalysisGenerationRef.current
      && activeRef.current
    ) {
      scheduleNextFrame();
    }
  }, [
    beginVideoRecording,
    captureUploadedVideoFrame,
    processFrame,
    scheduleNextFrame,
    updatePushupPreparationStage,
    updatePushupPreparationCountdown,
    logUploadedPushupPlay,
  ]);
  const handleVideoPlay = useCallback(() => {
    const isUploadedPushupVideo = inputModeRef.current === 'video'
      && selectedExerciseRef.current === 'flexiones';
    const playDiagnostics = uploadedPushupPlayDiagnosticsRef.current;
    let playCallNumber = 0;
    if (isUploadedPushupVideo) {
      playDiagnostics.startedAt ??= performance.now();
      playCallNumber = ++playDiagnostics.handleVideoPlayCalls;
    }
    const logHandleVideoPlayBranch = (branch: string, extraCallGuard: string) => {
      if (!isUploadedPushupVideo) return;
      logUploadedPushupPlay(
        `onPlay disparado | rama tomada en handleVideoPlay: ${branch}`,
      );
      if (playCallNumber > 1) {
        logUploadedPushupPlay(
          `llamada extra a handleVideoPlay #${playCallNumber} | guarda/resultado: `
          + extraCallGuard,
        );
      }
    };
    if (inputModeRef.current !== 'video') return;
    const video = videoRef.current;
    if (
      isUploadedPushupVideo
      && video
      && !playDiagnostics.playingListenerAttached
    ) {
      playDiagnostics.playingListenerAttached = true;
      video.addEventListener('playing', () => {
        playDiagnostics.playingListenerAttached = false;
        logUploadedPushupPlay("evento 'playing' recibido");
      }, { once: true });
    }
    if (
      selectedExerciseRef.current === 'flexiones'
      && uploadedPushupOfflineAnalysisRef.current
    ) {
      logHandleVideoPlayBranch(
        'prepass offline: pausa y retorno',
        'uploadedPushupOfflineAnalysisRef=true; video.pause()',
      );
      video?.pause();
      return;
    }
    if (
      selectedExerciseRef.current === 'flexiones'
      && uploadedPushupPreflightRef.current
      && !exerciseStartedRef.current
    ) {
      video?.pause();
      if (!pushupCalibrationSuccessfulRef.current) {
        logHandleVideoPlayBranch(
          'calibración pendiente: pausa y retorno',
          'pushupCalibrationSuccessfulRef=false; video.pause()',
        );
        setVideoExportStatus(
          'Espera a que termine la calibración antes de reproducir el video.',
        );
        return;
      }
      logHandleVideoPlayBranch(
        'calibración lista: iniciar startUploadedPushupPlayback',
        'se permite entrar en startUploadedPushupPlayback',
      );
      void startUploadedPushupPlayback();
      return;
    }
    if (!activeRef.current) {
      logHandleVideoPlayBranch(
        'activeRef=false: retorno sin pausar el video',
        'activeRef.current=false solo retorna; no llama a video.pause()',
      );
      return;
    }
    logHandleVideoPlayBranch(
      'activeRef=true: programar siguiente cuadro',
      'sin guarda de bloqueo; llama a scheduleNextFrame()',
    );
    scheduleNextFrame();
  }, [logUploadedPushupPlay, scheduleNextFrame, startUploadedPushupPlayback]);

  const loadDetector = useCallback(async (preferFastVideoModel = false) => {
    let timeoutId: number | null = null;
    try {
      const detectorPromise = preferFastVideoModel
        ? createPoseWorkerDetector({ model: 'full', delegate: 'GPU' })
          .catch((workerError) => {
            console.warn(
              '[pose3d] No se pudo iniciar el análisis en segundo plano; '
              + 'se intentará cargar el modelo en el hilo principal.',
              workerError,
            );
            return createPoseDetector({ model: 'full', delegate: 'GPU' });
          })
        : createPoseDetector({ model: 'heavy', delegate: 'GPU' });
      return await Promise.race([
        detectorPromise,
        new Promise<never>((_, reject) => {
          timeoutId = window.setTimeout(() => {
            reject(new Error('El modelo de análisis tardó demasiado en cargar. Comprueba tu conexión e inténtalo de nuevo.'));
          }, POSE_MODEL_LOAD_TIMEOUT_MS);
        }),
      ]);
    } finally {
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    }
  }, []);

  const startCamera = useCallback(async (
    exerciseId?: ExerciseId,
    preserveExerciseStarted = false,
    videoFile?: File,
  ) => {
    if (busyRef.current) return;
    busyRef.current = true;
    const activeExercise = exerciseId ?? selectedExerciseRef.current;
    if (!activeExercise) {
      busyRef.current = false;
      return;
    }
    const isUploadedPushupVideo = Boolean(videoFile && activeExercise === 'flexiones');
    selectedExerciseRef.current = activeExercise;
    setSelectedExercise(activeExercise);
    // Los videos subidos ya contienen la ejecución; no deben esperar la
    // preparación de cámara en vivo. Las flexiones conservan su calibración.
    const shouldStartUploadedExercise = Boolean(videoFile) && activeExercise !== 'flexiones';
    const shouldStartExercise = videoFile
      ? shouldStartUploadedExercise
      : preserveExerciseStarted;
    exerciseStartedRef.current = shouldStartExercise;
    setExerciseStarted(shouldStartExercise);
    if (videoFile) {
      cameraFacingModeRef.current = 'environment';
      setCameraFacingMode('environment');
    }
    pullupSessionFinishedRef.current = false;
    pullupDetachFramesRef.current = 0;
    setPullupSessionFinished(false);
    if (!(activeExercise === 'dominadas' && preserveExerciseStarted)) {
      pullupCalibrationSuccessfulRef.current = false;
      pullupCalibrationReadySinceRef.current = null;
      updatePullupCalibrationStatus('pending');
    }
    if (!(activeExercise === 'flexiones' && preserveExerciseStarted)) {
      pushupCalibrationSuccessfulRef.current = false;
      pushupCalibrationReadySinceRef.current = null;
      uploadedPushupStartsAtBottomRef.current = false;
      pushupLockedMeasurementSideRef.current = null;
      updatePushupCalibrationStatus('pending');
    }
    pullupPreparationStageRef.current = 'body-detection';
    pullupPreparationStartedAtRef.current = null;
    pullupPreparationCountdownRef.current = null;
    setPullupPreparationStage('body-detection');
    setPullupPreparationCountdown(null);
    pushupPreparationStageRef.current = 'body-detection';
    pushupPreparationStartedAtRef.current = null;
    pushupPreparationCountdownRef.current = null;
    setPushupPreparationStage('body-detection');
    setPushupPreparationCountdown(null);
    stopResources();
    uploadedPushupPreflightRef.current = isUploadedPushupVideo;
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
    sideConsistencyRef.current.reset();
    boneConstraintRef.current.reset();
    poseFilterRef.current.reset();
    if (
      activeExercise === 'flexiones'
      && preserveExerciseStarted
      && pushupCalibrationSuccessfulRef.current
    ) {
      sideConsistencyRef.current.lockAssignments();
      boneConstraintRef.current.lockReferences();
    }
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
    pullupSessionFinishedRef.current = false;
    pullupDetachFramesRef.current = 0;
    setPullupSessionFinished(false);
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
    diagnosticBufferRef.current = [];
    pullupDiagnosticBufferRef.current = [];
    viewDiagnosticBufferRef.current = [];
    setDiagnosticCopyMessage(null);
    if (diagnosticCopyMessageTimeoutRef.current !== null) {
      window.clearTimeout(diagnosticCopyMessageTimeoutRef.current);
      diagnosticCopyMessageTimeoutRef.current = null;
    }
    previousSideRef.current = null;
     sideViewCandidateRef.current = null;
     sideViewStableFramesRef.current = 0;
    sideSwitchesRef.current = 0;
    setPhase('requesting');

    try {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const video = videoRef.current;
      if (!video) throw new Error('No se pudo preparar el video de análisis.');
      inputModeRef.current = videoFile ? 'video' : 'camera';
      setInputMode(inputModeRef.current);
      if (videoFile) {
        setUploadedVideoName(videoFile.name);
        setVideoExportStatus('Cargando el video en este dispositivo…');
        const sourceUrl = URL.createObjectURL(videoFile);
        uploadedVideoUrlRef.current = sourceUrl;
        video.pause();
        video.srcObject = null;
        video.controls = selectedExerciseRef.current !== 'flexiones';
        video.muted = false;
        const metadataLoaded = new Promise<void>((resolve, reject) => {
          const timeout = window.setTimeout(() => {
            cleanup();
            reject(new Error('El video tardó demasiado en abrirse. Prueba con otro archivo.'));
          }, 15_000);
          const cleanup = () => {
            window.clearTimeout(timeout);
            video.removeEventListener('loadedmetadata', handleLoaded);
            video.removeEventListener('error', handleError);
          };
          const handleLoaded = () => {
            cleanup();
            resolve();
          };
          const handleError = () => {
            cleanup();
            reject(new Error('No se pudo abrir este video. Prueba con un archivo MP4 o WebM.'));
          };
          video.addEventListener('loadedmetadata', handleLoaded, { once: true });
          video.addEventListener('error', handleError, { once: true });
        });
        video.src = sourceUrl;
        video.load();
        await metadataLoaded;
        setVideoDurationSeconds(Number.isFinite(video.duration) ? video.duration : 0);
        video.pause();
        const firstMillisecond = Math.min(
          0.001,
          Math.max(0, Number.isFinite(video.duration) ? video.duration - 0.001 : 0),
        );
        await new Promise<void>((resolve) => {
          let timeoutId = 0;
          const finishSeeking = () => {
            window.clearTimeout(timeoutId);
            video.removeEventListener('seeked', finishSeeking);
            resolve();
          };
          video.addEventListener('seeked', finishSeeking, { once: true });
          timeoutId = window.setTimeout(finishSeeking, 1500);
          video.currentTime = firstMillisecond;
        });
        setVideoTimeSeconds(firstMillisecond);
      } else {
        if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
          throw new Error('La cámara necesita una conexión segura y compatible con el navegador.');
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: cameraFacingModeRef.current,
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 },
          },
        });
        streamRef.current = stream;
        video.controls = false;
        video.muted = true;
        video.srcObject = stream;
        await video.play();
      }
      syncVideoSize();
      setPhase('loading-model');
      const detector = await loadDetector(Boolean(videoFile));
      if (isUploadedPushupVideo) instrumentUploadedPushupDetector(detector);
      detectorRef.current = detector;
      setModelStatus(`${POSE_MODEL_NAME} cargado ✓`);
      if (videoFile) {
        video.muted = true;
        if (isUploadedPushupVideo) {
          video.pause();
          setVideoExportStatus(
            'Video pausado. Detectando el cuerpo; si no aparece completo, avanza a un fotograma claro.',
          );
        } else {
          try {
            await video.play();
          } catch {
            setVideoExportStatus((current) => current.includes('descarga')
              ? current
              : 'Pulsa reproducir en el video para iniciar el análisis.');
          }
          beginVideoRecording(video);
        }
        captureUploadedVideoFrame();
      }
      activeRef.current = true;
      setPhase('tracking');
      scheduleNextFrame();
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
  }, [
    beginVideoRecording,
    captureUploadedVideoFrame,
    loadDetector,
    scheduleNextFrame,
    stopResources,
    syncVideoSize,
  ]);

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
      if (inputModeRef.current === 'video') {
        const pushupExportWasRunning = selectedExerciseRef.current === 'flexiones'
          && (
            uploadedPushupAnalysisStartingRef.current
            || uploadedPushupOfflineAnalysisRef.current
            || uploadedPushupExportPlaybackRef.current
          );
        if (pushupExportWasRunning) {
          uploadedPushupAnalysisGenerationRef.current += 1;
          uploadedPushupAnalysisStartingRef.current = false;
          uploadedPushupOfflineAnalysisRef.current = false;
          uploadedPushupExportPlaybackRef.current = false;
          uploadedPushupExportSamplesRef.current = [];
          setVideoExportStatus(
            'Proceso detenido antes de terminar; no se creó una descarga incompleta.',
          );
          setUploadedAnalysisProgress(null);
        }
        const video = videoRef.current;
        video?.pause();
        if (video) video.controls = true;
        activeRef.current = false;
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        if (videoFrameCallbackRef.current !== null && video?.cancelVideoFrameCallback) {
          video.cancelVideoFrameCallback(videoFrameCallbackRef.current);
          videoFrameCallbackRef.current = null;
        }
        const recorder = recorderRef.current;
        if (recorder && recorder.state !== 'inactive') {
          if (pushupExportWasRunning) {
            recorder.ondataavailable = null;
            recorder.onstop = null;
            recorder.onerror = null;
            recorderGenerationRef.current += 1;
            recorder.stop();
            recorderStreamRef.current?.getTracks().forEach((track) => track.stop());
            recorderRef.current = null;
            recorderStreamRef.current = null;
            recorderCanvasTrackRef.current = null;
            recorderChunksRef.current = [];
          } else {
            recorder.stop();
          }
        }
      }
      pullupSessionFinishedRef.current = false;
      pullupDetachFramesRef.current = 0;
      setPullupSessionFinished(false);
      poseFilterRef.current.setPersistentHold(false);
      if (selectedExerciseRef.current === 'dominadas') {
        poseFilterRef.current.reset();
        pullupCalibrationSuccessfulRef.current = false;
        pullupCalibrationReadySinceRef.current = null;
        updatePullupCalibrationStatus('pending');
        pullupPreparationStageRef.current = 'body-detection';
        pullupPreparationStartedAtRef.current = null;
        pullupPreparationCountdownRef.current = null;
        setPullupPreparationStage('body-detection');
        setPullupPreparationCountdown(null);
      } else if (selectedExerciseRef.current === 'flexiones') {
        poseFilterRef.current.reset();
        sideConsistencyRef.current.reset();
        boneConstraintRef.current.reset();
        poseFilterRef.current.setTemporalJumpGuard(false);
        pushupCalibrationSuccessfulRef.current = false;
        pushupCalibrationReadySinceRef.current = null;
        uploadedPushupStartsAtBottomRef.current = false;
        pushupLockedMeasurementSideRef.current = null;
        updatePushupCalibrationStatus('pending');
        pushupPreparationStageRef.current = 'body-detection';
        pushupPreparationStartedAtRef.current = null;
        pushupPreparationCountdownRef.current = null;
        setPushupPreparationStage('body-detection');
        setPushupPreparationCountdown(null);
      }
      setSquatFeedback(defaultSquatFeedback);
      setPullupFeedback(defaultTechniqueFeedback);
      setTechniqueFeedback(defaultTechniqueFeedback);
      return;
    }

    if (inputModeRef.current === 'video') {
      const video = videoRef.current;
      if (!video) return;

      // En flexiones subidas, espera a que la calibración termine antes
      // de iniciar el análisis completo desde el principio.
      if (
        selectedExerciseRef.current === 'flexiones'
        && uploadedPushupPreflightRef.current
      ) {
        if (!pushupCalibrationSuccessfulRef.current) {
          setVideoExportStatus(
            'Espera a que termine la calibración antes de reproducir el video.',
          );
          return;
        }
        void startUploadedPushupPlayback();
        return;
      }

      exerciseStartedRef.current = true;
      setExerciseStarted(true);
      void video.play().catch(() => {
        setVideoExportStatus('Pulsa Reproducir video para iniciar el análisis.');
      });
      activeRef.current = true;
      scheduleNextFrame();
      setSquatFeedback(defaultSquatFeedback);
      setPullupFeedback(defaultTechniqueFeedback);
      setTechniqueFeedback(defaultTechniqueFeedback);
      return;
    }

    if (
      selectedExerciseRef.current === 'dominadas'
      || selectedExerciseRef.current === 'flexiones'
    ) return;

    if (!faceDetected && !poseDetected) return;
    exerciseStartedRef.current = true;
    setExerciseStarted(true);
    setSquatFeedback(defaultSquatFeedback);
    setPullupFeedback(defaultTechniqueFeedback);
    setTechniqueFeedback(defaultTechniqueFeedback);
  }, [
    faceDetected,
    phase,
    poseDetected,
    scheduleNextFrame,
    startUploadedPushupPlayback,
    updatePullupCalibrationStatus,
    updatePushupCalibrationStatus,
  ]);

  const handleVideoUpload = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    const exercise = selectedExerciseRef.current;
    if (!file || !exercise) return;
    if (!file.type.startsWith('video/')) {
      setVideoExportStatus('Elige un archivo de video compatible.');
      return;
    }
    setUploadedAnalysisProgress(null);
    if (uploadedPushupCalibrationHintTimerRef.current !== null) {
      window.clearTimeout(uploadedPushupCalibrationHintTimerRef.current);
      uploadedPushupCalibrationHintTimerRef.current = null;
    }
    setUploadedPushupCalibrationHintTimedOut(false);
    const showPushupCalibrationNotice = exercise === 'flexiones';
    setShowUploadedPushupCalibrationNotice(showPushupCalibrationNotice);
    if (showPushupCalibrationNotice) {
      uploadedPushupCalibrationHintTimerRef.current = window.setTimeout(() => {
        uploadedPushupCalibrationHintTimerRef.current = null;
        setUploadedPushupCalibrationHintTimedOut(true);
      }, 15_000);
    }
    void startCamera(exercise, false, file);
  }, [startCamera]);

  const handleUploadedVideoEnded = useCallback(() => {
    stopUploadedPushupLiveMetrics();
    if (
      selectedExerciseRef.current !== 'flexiones'
      || UPLOADED_VIDEO_RECORDING_ENABLED
    ) {
      captureUploadedVideoFrame();
    }
    uploadedPushupExportPlaybackRef.current = false;
    uploadedPushupOfflineAnalysisRef.current = false;
    if (videoRef.current) videoRef.current.controls = true;
    activeRef.current = false;
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    const video = videoRef.current;
    if (videoFrameCallbackRef.current !== null && video?.cancelVideoFrameCallback) {
      video.cancelVideoFrameCallback(videoFrameCallbackRef.current);
      videoFrameCallbackRef.current = null;
    }
    exerciseStartedRef.current = false;
    setExerciseStarted(false);
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') recorder.stop();
    if (!recorder) setVideoExportStatus('El análisis del video terminó.');
  }, [captureUploadedVideoFrame]);

  const returnToWelcome = useCallback(() => {
    stopResources();
    inputModeRef.current = 'camera';
    setInputMode('camera');
    selectedExerciseRef.current = null;
    setSelectedExercise(null);
    exerciseStartedRef.current = false;
    setExerciseStarted(false);
    pullupSessionFinishedRef.current = false;
    pullupDetachFramesRef.current = 0;
    setPullupSessionFinished(false);
    pullupCalibrationSuccessfulRef.current = false;
    pullupCalibrationReadySinceRef.current = null;
    updatePullupCalibrationStatus('pending');
    pullupPreparationStageRef.current = 'body-detection';
    pullupPreparationStartedAtRef.current = null;
    pullupPreparationCountdownRef.current = null;
    setPullupPreparationStage('body-detection');
    setPullupPreparationCountdown(null);
    pushupCalibrationSuccessfulRef.current = false;
    pushupCalibrationReadySinceRef.current = null;
    pushupLockedMeasurementSideRef.current = null;
    updatePushupCalibrationStatus('pending');
    pushupPreparationStageRef.current = 'body-detection';
    pushupPreparationStartedAtRef.current = null;
    pushupPreparationCountdownRef.current = null;
    setPushupPreparationStage('body-detection');
    setPushupPreparationCountdown(null);
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
     sideViewCandidateRef.current = null;
     sideViewStableFramesRef.current = 0;
    sideSwitchesRef.current = 0;
    setPhase('exercise-select');
  }, [
    stopResources,
    updatePullupCalibrationStatus,
    updatePushupCalibrationStatus,
  ]);

  useEffect(() => () => stopResources(), [stopResources]);
  useEffect(() => () => {
    if (diagnosticCopyMessageTimeoutRef.current !== null) {
      window.clearTimeout(diagnosticCopyMessageTimeoutRef.current);
    }
  }, []);

  const isActive = phase === 'requesting' || phase === 'loading-model' || phase === 'tracking';
  const activeExercise = getExercise(selectedExercise);
  const isPullupExerciseSelected = selectedExercise === 'dominadas'
    || selectedExercise === 'dominadas-supinas'
    || selectedExercise === 'dominadas-comando';
  const canExportDiagnostics = PULLUP_DIAGNOSTIC_EXPORT_ENABLED && phase === 'tracking';
  const canExportPullupDiagnostics = canExportDiagnostics && isPullupExerciseSelected;
  const isStandardPullupSelected = selectedExercise === 'dominadas';
  const isStandardPushupSelected = selectedExercise === 'flexiones';
  const personDetected = poseDetected || faceDetected;
  const statusMessage = phase !== 'tracking'
    ? 'Preparando el análisis...'
    : pullupSessionFinished
      ? 'Ejercicio finalizado · conteo congelado'
    : !exerciseStarted
      ? isStandardPullupSelected && pullupPreparationStage === 'body-detection'
        ? inputMode === 'video'
          ? pullupCalibrationStatus === 'calibrating'
            ? 'Mantén todo tu cuerpo visible'
            : 'Buscando y registrando tu cuerpo...'
          : pullupPreparationCountdown !== null
            ? `Registrando tu cuerpo · ${pullupPreparationCountdown}`
            : pullupCalibrationStatus === 'calibrating'
              ? 'Mantén todo tu cuerpo visible'
              : 'Buscando y registrando tu cuerpo...'
        : isStandardPullupSelected && pullupPreparationStage === 'bar-preparation'
          ? inputMode === 'video'
            ? 'Cuerpo registrado ✓ · cuélgate en la barra'
            : pullupPreparationCountdown !== null
              ? `Prepárate en la barra · ${pullupPreparationCountdown}`
              : 'Cuerpo registrado ✓ · cuélgate en la barra'
        : isStandardPushupSelected && pushupPreparationStage === 'body-detection'
          ? inputMode === 'video'
            ? pushupPreparationCountdown !== null
              ? `Calibrando postura · ${pushupPreparationCountdown}s`
              : 'Detectando el cuerpo en el video...'
            : pushupPreparationCountdown !== null
              ? `Registrando tu cuerpo · ${pushupPreparationCountdown}`
              : pushupCalibrationStatus === 'calibrating'
                ? 'Mantén hombro, codo, muñeca, cadera y tobillo visibles'
                : 'Buscando y registrando tu cuerpo...'
        : isStandardPushupSelected && pushupPreparationStage === 'pushup-preparation'
                        ? inputMode === 'video'
                          ? 'Cuerpo detectado ✓ · pulsa reproducir'
                          : pushupPreparationCountdown !== null
            ? `Acomódate para empezar · ${pushupPreparationCountdown}`
            : 'Cuerpo registrado ✓ · acomódate para empezar'
        : personDetected
          ? cameraReady
            ? viewAlignment.status === 'bad' || viewAlignment.status === 'unknown'
              ? viewAlignment.message
              : 'Colócate en posición y pulsa Iniciar ejercicio'
            : poseDetected
              ? 'Cuerpo detectado ✓ · puedes iniciar'
              : 'Rostro detectado ✓ · puedes iniciar'
          : 'Buscando tu cuerpo...'
      : poseDetected
        ? cameraReady
          ? viewAlignment.blocking
            ? viewAlignment.message
            : detectionStable
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
  const formatVideoTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return '—';
    const wholeSeconds = Math.floor(seconds);
    const minutes = Math.floor(wholeSeconds / 60);
    const remainingSeconds = wholeSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  const pushupVideoTimeLabel = inputMode === 'video'
    ? `${formatVideoTime(videoTimeSeconds)} / ${formatVideoTime(videoDurationSeconds)}`
    : '—';
  const pushupBlockingReasonLabel = pushupBlockingReasons.length
    ? pushupBlockingReasons.join(' · ')
    : 'Sin bloqueo';
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
    && isWithinPullupAngle(angle, PULLUP_BOTTOM_MIN_ANGLE, PULLUP_BOTTOM_MAX_ANGLE);
  const pullupHasStarted = angle !== null && angle <= PULLUP_PULL_ACTIVATION_ANGLE;
  const angleHistoryLabel = angleHistory.length
    ? angleHistory.map((value) => `${value}°`).join(' · ')
    : '—';
  const angleFeedback = selectedExercise === 'sentadillas'
    ? squatFeedback
    : selectedExercise === 'dominadas' || selectedExercise === 'dominadas-supinas'
      ? pullupFeedback
      : selectedExercise === 'dominadas-comando'
        ? commandoPullupReferenceFeedback
      : selectedExercise === 'muscle-up'
        ? muscleUpReferenceFeedback
      : techniqueFeedback;
  const viewFeedback: TechniqueFeedback = {
    tone: 'warning',
    message: viewAlignment.message,
    detail: viewAlignment.detail,
  };
  const displayedAngleFeedback = viewAlignment.blocking
    ? viewFeedback
    : angleFeedback;
  const angleIsGood = exerciseStarted
    && cameraReady
    && !viewAlignment.blocking
    && angleFeedback.tone === 'success';
  const diagnosisTone = cameraReady
    ? displayedAngleFeedback.tone
    : cameraGuidance.tone === 'warning'
      ? 'warning'
      : 'checking';
  const diagnosisStatus = phase !== 'tracking'
    ? 'ESPERANDO'
    : !cameraReady
      ? 'AJUSTAR CÁMARA'
      : viewAlignment.blocking
        ? 'AJUSTAR VISTA'
      : !exerciseStarted
        ? 'LISTO PARA INICIAR'
        : selectedExercise === 'muscle-up' || selectedExercise === 'dominadas-comando'
          ? 'CALIBRACIÓN PENDIENTE'
        : angle === null
      ? 'ESPERANDO'
      : displayedAngleFeedback.tone === 'success'
        ? 'BIEN'
        : displayedAngleFeedback.tone === 'checking'
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
  const incorrectRepetitions = Math.max(0, evaluatedRepetitions - correctRepetitions);
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
  recordingHudStateRef.current = {
    exercise: selectedExercise,
    hasEvaluationCounter,
    correctRepetitions,
    incorrectRepetitions,
    liveAngleReadings,
    dipJointReadings,
    pullupJointReadings,
  };

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
              <span>NetPosture</span>
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
            <div className="exercise-select-content">
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
                {exerciseGroups.map((group) => (
                  <div className="exercise-group" key={group.label}>
                    {(() => {
                      const groupId = `exercise-group-${group.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
                      const isExpanded = expandedMuscleGroups[group.label] ?? group.label === 'Por clasificar';
                      return (
                        <>
                          <button
                            type="button"
                            className="exercise-group-toggle"
                            aria-expanded={isExpanded}
                            aria-controls={groupId}
                            data-testid={`exercise-group-${group.label.toLowerCase()}`}
                            onClick={() => setExpandedMuscleGroups((current) => ({
                              ...current,
                              [group.label]: !isExpanded,
                            }))}
                          >
                            <h2 className="exercise-group-title">{group.label}</h2>
                            <ChevronDown
                              className={`exercise-group-chevron${isExpanded ? ' is-expanded' : ''}`}
                              size={18}
                              strokeWidth={1.8}
                              aria-hidden="true"
                            />
                          </button>
                          {isExpanded && (
                            <div className="exercise-group-list" id={groupId}>
                              {group.exercises.map((exercise) => {
                      const ExerciseIcon = exercise.id === 'fondos'
                    || exercise.id === 'dominadas'
                    || exercise.id === 'dominadas-supinas'
                    || exercise.id === 'dominadas-comando'
                    || exercise.id === 'muscle-up'
                    || exercise.id === 'jalon'
                    || exercise.id === 'pull-over-polea-alta'
                    || exercise.id === 'remo-barra'
                     || exercise.id === 'remos-australianos-elevados'
                    || exercise.id === 'remo-sentado-polea-agarre-cerrado'
                    || exercise.id === 'remo-mancuerna-una-mano'
                    || exercise.id === 'flexiones'
                    || exercise.id === 'flexiones-declinadas'
                    || exercise.id === 'flexiones-pica'
                    || exercise.id === 'press-militar'
                    || exercise.id === 'press-hombros-maquina'
                     || exercise.id === 'elevaciones-laterales'
                     || exercise.id === 'elevaciones-laterales-polea-baja'
                    || exercise.id === 'pajaros-mancuernas'
                    || exercise.id === 'face-pulls-polea-alta'
                    || exercise.id === 'aperturas-inversas-maquina'
                     || exercise.id === 'cruces-polea-baja-alta'
                    || exercise.id === 'press-banca'
                     || exercise.id === 'press-banca-agarre-cerrado'
                     || exercise.id === 'press-banca-inclinado'
                     || exercise.id === 'press-plano-mancuernas'
                     || exercise.id === 'press-plano-inclinado'
                    || exercise.id === 'triceps-polea-alta'
                     || exercise.id === 'triceps-tras-nuca-polea-alta'
                     || exercise.id === 'copa-mancuernas'
                    || exercise.id === 'extension-horizontal-barra'
                     || exercise.id === 'peso-muerto-rumano'
                     || exercise.id === 'peso-muerto-piernas-rigidas'
                     || exercise.id === 'hip-thrust-barra'
                     || exercise.id === 'curl-femoral'
                     || exercise.id === 'elevacion-talones-pie'
                     || exercise.id === 'maquina-aductores'
                    || exercise.id === 'curl-biceps'
                     || exercise.id === 'curl-inclinado-mancuernas'
                     || exercise.id === 'curl-predicador'
                     || exercise.id === 'curl-arana'
                     || exercise.id === 'curl-martillo'
                     || exercise.id === 'curl-inverso-barra'
                     || exercise.id === 'curl-muneca-sentado'
                     || exercise.id === 'rodillo-muneca'
                    ? Activity
                    : exercise.id === 'sentadillas'
                       || exercise.id === 'prensa-piernas'
                       || exercise.id === 'extensiones-maquina'
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
                                       <img
                                         className={`exercise-card-image${
                                           exercise.id === 'maquina-aductores'
                                             ? ' exercise-card-image--contain'
                                             : ''
                                         }`}
                                         src={exerciseImages[exercise.id] || getExerciseImageFallback(exercise)}
                                         alt={`Ilustración de ${exercise.name}`}
                                         onError={(event) => handleExerciseImageError(event, exercise)}
                                       />
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
                          )}
                        </>
                      );
                    })()}
                  </div>
                ))}
                </div>
                 <button
                   type="button"
                   className="competition-coming-soon"
                   disabled
                   aria-label="Compite, próximamente"
                 >
                   <span className="competition-coming-soon-label">Compite</span>
                   <span className="competition-coming-soon-status">(próximamente)</span>
                 </button>
                <p className="privacy-note">
                  <ShieldCheck size={14} strokeWidth={1.8} aria-hidden="true" />
                  <span>La imagen se procesa solo en tu dispositivo; no se almacena.</span>
                </p>
              </section>
              <p className="app-description">
                NetPosture es tu compañero de entrenamiento: observa tus movimientos con la cámara
                y te ayuda a cuidar tu postura con indicaciones claras mientras entrenas. No
                necesitas ser experto: elige un ejercicio, colócate frente a la cámara y sigue las
                recomendaciones para moverte con más control y confianza. La idea es que entiendas
                mejor cada movimiento y conviertas cada repetición en un paso hacia una técnica más
                sólida.
              </p>
            </div>
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
                    <span>Ángulos 3D normalizados</span>
                  </div>
                </div>
                <div className="active-header-actions">
                  <input
                    ref={videoUploadInputRef}
                    className="video-upload-input"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    aria-label="Subir un video para analizar"
                  />
                  <button
                    type="button"
                    className="upload-video-button"
                    disabled={phase === 'requesting' || phase === 'loading-model'}
                    onClick={() => videoUploadInputRef.current?.click()}
                  >
                    <Upload size={14} strokeWidth={1.9} aria-hidden="true" />
                    <span>{inputMode === 'video' ? 'Cambiar video' : 'Subir video'}</span>
                  </button>
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
              {inputMode === 'video' && (
                <div className="video-export-tools" role="status" aria-live="polite">
                  <div className="video-export-copy">
                    <strong>Video: {uploadedVideoName}</strong>
                    <span>
                      {showUploadedPushupCalibrationNotice
                        && phase === 'tracking'
                        && inputMode === 'video'
                        && selectedExercise === 'flexiones'
                        && !exerciseStarted
                        ? pushupCalibrationStatus === 'ready'
                          ? 'Video listo. Pulsa reproducir.'
                          : (
                            <>
                              Calibrando el cuerpo… la reproducción se habilitará al terminar.
                              {uploadedPushupCalibrationHintTimedOut && (
                                <>
                                  <br />
                                  Si tarda, usa una vista lateral, buena luz y deja el cuerpo completo visible.
                                </>
                              )}
                            </>
                          )
                        : videoExportStatus || 'El análisis se procesa en este dispositivo.'}
                    </span>
                  </div>
                  {processedVideoUrl && (
                    <a
                      className="video-download-button"
                      href={processedVideoUrl}
                      download={`${uploadedVideoName.replace(/\.[^.]+$/, '').replace(/[^\p{L}\p{N}-]+/gu, '-') || 'video'}-netposture.${processedVideoExtension}`}
                    >
                      <Download size={15} strokeWidth={2} aria-hidden="true" />
                      Descargar video
                    </a>
                  )}
                </div>
              )}
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
                      : isStandardPullupSelected && pullupPreparationStage === 'body-detection'
                        ? inputMode === 'video'
                          ? 'Detectando el cuerpo en el video...'
                          : pullupPreparationCountdown !== null
                            ? `Registrando cuerpo · ${pullupPreparationCountdown}`
                            : 'Buscando tu cuerpo...'
                      : isStandardPullupSelected && pullupPreparationStage === 'bar-preparation'
                        ? inputMode === 'video'
                          ? 'Prepárate en la barra'
                          : pullupPreparationCountdown !== null
                            ? `Cuélgate en la barra · ${pullupPreparationCountdown}`
                            : 'Prepárate en la barra'
                      : isStandardPushupSelected && pushupPreparationStage === 'body-detection'
                        ? inputMode === 'video'
                          ? 'Detectando el cuerpo en el video...'
                          : pushupPreparationCountdown !== null
                            ? `Registrando cuerpo · ${pushupPreparationCountdown}`
                            : 'Buscando tu cuerpo...'
                      : isStandardPushupSelected && pushupPreparationStage === 'pushup-preparation'
                        ? inputMode === 'video'
                          ? 'Video listo para reproducir'
                          : pushupPreparationCountdown !== null
                            ? `Acomódate para empezar · ${pushupPreparationCountdown}`
                            : 'Prepárate para la flexión'
                       : isStandardPullupSelected && pullupCalibrationStatus === 'calibrating'
                          ? `Registrando durante ${PULLUP_BODY_DETECTION_HOLD_MS / 1000} segundos`
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
                          : hasEvaluationCounter
                            ? 'El contador está activo. Detén el curso cuando hayas terminado.'
                            : 'Las lecturas están activas. Mantén la posición y completa el movimiento con control.'
                      : isStandardPullupSelected && pullupPreparationStage === 'body-detection'
                        ? 'Mantén cabeza, hombros, codos, muñecas, caderas, rodillas y tobillos visibles para registrar tu cuerpo.'
                        : isStandardPullupSelected && pullupPreparationStage === 'bar-preparation'
                          ? 'Cuélgate en la barra. Al terminar la cuenta regresiva se activarán automáticamente el monitoreo y el conteo.'
                        : isStandardPushupSelected && pushupPreparationStage === 'body-detection'
                          ? inputMode === 'video'
                            ? 'El video está pausado. Deja visibles hombro, codo, muñeca, cadera y tobillo; puedes avanzar a un fotograma claro.'
                            : 'Mantén hombro, codo, muñeca, cadera y tobillo visibles durante 5 segundos para fijar tu cuerpo.'
                        : isStandardPushupSelected && pushupPreparationStage === 'pushup-preparation'
                          ? inputMode === 'video'
                            ? 'El cuerpo quedó fijado. Pulsa reproducir para analizar el video desde el inicio.'
                            : 'Acomódate en la posición inicial. Al terminar la cuenta regresiva comenzarán automáticamente la evaluación y el conteo.'
                       : personDetected
                        ? cameraReady
                          ? 'Colócate en posición y comienza cuando quieras.'
                          : 'Puedes iniciar; ajusta la cámara para que el contador reconozca el ejercicio.'
                        : 'Aléjate lo suficiente para que se vea tu cuerpo completo y mantén las articulaciones visibles.'}
                  </span>
                </div>
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
                      ? `Cabeza sobre ambas muñecas · codos completamente extendidos entre ${PULLUP_BOTTOM_MIN_ANGLE}–${PULLUP_BOTTOM_MAX_ANGLE}° · agarre supino.`
                      : `Cabeza sobre ambas muñecas · codos completamente extendidos entre ${PULLUP_BOTTOM_MIN_ANGLE}–${PULLUP_BOTTOM_MAX_ANGLE}°.`}
                  </p>
                </div>
              )}
              {selectedExercise === 'dominadas' && (
                <details className="pulldown-instructions">
                  <summary>Qué debe cumplir tu dominada</summary>
                  <ul>
                    <li><b>Extensión:</b> el rango base es {PULLUP_BOTTOM_MIN_ANGLE}°–{PULLUP_BOTTOM_MAX_ANGLE}° y se acepta una tolerancia de ±{PULLUP_TOLERANCE_DEG}°.</li>
                    <li><b>Parte alta:</b> coloca la cabeza sobre ambas muñecas.</li>
                  </ul>
                </details>
              )}
              {selectedExercise === 'dominadas-supinas' && (
                <details className="pulldown-instructions">
                  <summary>Qué debe cumplir tu dominada supina</summary>
                  <ul>
                    <li><b>Agarre:</b> usa el agarre supino que muestra la imagen.</li>
                    <li><b>Recorrido:</b> extiende completamente los codos, coloca la cabeza sobre ambas muñecas y vuelve a extender los brazos con control.</li>
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
                    <span>Total evaluadas</span>
                    <strong>{exerciseRepetitions}</strong>
                  </div>
                   <div className="squat-summary-stat">
                     <span>Incorrectas</span>
                     <strong>{incorrectRepetitions}</strong>
                   </div>
                  <p>
                    {selectedExercise === 'jalon'
                      ? `Se evalúa al completar el recorrido. Es correcta solo si mantienes el torso entre ${PULLDOWN_TORSO_MIN_ANGLE}° y ${PULLDOWN_TORSO_MAX_ANGLE}° y el ángulo cadera–hombro–codo entra entre ${PULLDOWN_ANGLE_MIN}° y ${PULLDOWN_ANGLE_MAX}° antes de volver a subir.`
                      : selectedExercise === 'fondos'
                        ? `Solo cuenta si mantienes el torso entre ${DIP_TORSO_MIN_ANGLE}° y ${DIP_TORSO_MAX_ANGLE}° y llegas con el codo entre ${DIP_VALID_MIN_ANGLE}° y ${DIP_VALID_MAX_ANGLE}°.`
                      : selectedExercise === 'remo-barra'
                        ? `Solo cuenta si mantienes el torso entre ${ROW_TORSO_MIN_ANGLE}° y ${ROW_TORSO_MAX_ANGLE}°, elevas los codos entre ${ROW_ELBOW_TORSO_MIN_ANGLE}° y ${ROW_ELBOW_TORSO_MAX_ANGLE}° y completas el recorrido del codo.`
                      : selectedExercise === 'remos-australianos-elevados'
                        ? `Solo cuenta si mantienes la línea hombro–cadera–rodilla entre ${AUSTRALIAN_ROW_BODY_LINE_MIN_ANGLE}° y ${AUSTRALIAN_ROW_BODY_LINE_MAX_ANGLE}°, los codos respecto al torso entre ${AUSTRALIAN_ROW_ELBOW_TORSO_MIN_ANGLE}° y ${AUSTRALIAN_ROW_ELBOW_TORSO_MAX_ANGLE}° y completas la flexión del codo.`
                      : selectedExercise === 'hip-thrust-barra'
                        ? `Solo cuenta si partes con la cadera entre ${HIP_THRUST_BOTTOM_MIN_ANGLE}° y ${HIP_THRUST_BOTTOM_MAX_ANGLE}° y la elevas hasta ${HIP_THRUST_TOP_MIN_ANGLE}–${HIP_THRUST_TOP_MAX_ANGLE}° sin hiperextender la espalda.`
                      : selectedExercise === 'curl-femoral'
                        ? `Solo cuenta si partes con la rodilla entre ${HAMSTRING_CURL_START_MIN_ANGLE}° y ${HAMSTRING_CURL_START_MAX_ANGLE}° y flexionas hasta ${HAMSTRING_CURL_END_MIN_ANGLE}–${HAMSTRING_CURL_END_MAX_ANGLE}°, manteniendo ambos lados visibles.`
                      : selectedExercise === 'flexiones'
                          ? `Toda repetición que complete el recorrido suma al total. Luego se evalúa la técnica: es correcta si mantienes el codo respecto al torso entre ${PUSHUP_ELBOW_TORSO_MIN_ANGLE}° y ${PUSHUP_ELBOW_TORSO_MAX_ANGLE + PUSHUP_ELBOW_TORSO_TOLERANCE}° y el cuerpo alineado entre ${PUSHUP_BODY_LINE_MIN_ANGLE}° y ${PUSHUP_BODY_LINE_MAX_ANGLE}°; si no, queda como incorrecta.`
                      : selectedExercise === 'press-pallof-polea-banda'
                        ? `Solo cuenta si extiendes ambos codos entre ${PALLOF_END_MIN_ANGLE}° y ${PALLOF_END_MAX_ANGLE}° y mantienes hombros, codos y muñecas alineados; la repetición se cierra al regresar al pecho.`
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
              {selectedExercise === 'remos-australianos-elevados' && (
                <details className="pulldown-instructions">
                  <summary>Condiciones para una repetición correcta</summary>
                  <ul>
                    <li><b>Encuadre:</b> colócate de lado o en 3/4 junto al apoyo y deja visibles ambos hombros, codos, muñecas, caderas y rodillas. No necesitas mostrar la cabeza ni los tobillos.</li>
                    <li><b>Posición:</b> mantén el cuerpo firme, con la línea hombro–cadera–rodilla entre {AUSTRALIAN_ROW_BODY_LINE_MIN_ANGLE}° y {AUSTRALIAN_ROW_BODY_LINE_MAX_ANGLE}°.</li>
                    <li><b>Codos:</b> llévalos cerca del torso, entre {AUSTRALIAN_ROW_ELBOW_TORSO_MIN_ANGLE}° y {AUSTRALIAN_ROW_ELBOW_TORSO_MAX_ANGLE}°, sin abrirlos hacia los lados.</li>
                    <li><b>Recorrido:</b> empieza con los codos entre 145° y 180°, tira del pecho hacia el apoyo hasta llegar a {AUSTRALIAN_ROW_END_MIN_ANGLE}°–{AUSTRALIAN_ROW_END_MAX_ANGLE}° y regresa lentamente.</li>
                    <li><b>Repetición:</b> el contador se reinicia si pierdes la línea corporal, separas demasiado los codos o se pierde una de las articulaciones necesarias.</li>
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
                    <li><b>Recorrido calibrado:</b> parte con el codo entre {MILITARY_PRESS_ACCEPTED_START_MIN_ANGLE}° y {MILITARY_PRESS_ACCEPTED_START_MAX_ANGLE}° y termina arriba entre {MILITARY_PRESS_ACCEPTED_VALID_MIN_ANGLE}° y {MILITARY_PRESS_ACCEPTED_VALID_MAX_ANGLE}° (tolerancia ±{MILITARY_PRESS_TOLERANCE}°).</li>
                    <li><b>Codos:</b> mantenlos aproximadamente a 45° respecto al torso, en el plano de la escápula. No los abras a 90° formando una “T” con los hombros.</li>
                    <li><b>Trayectoria:</b> dirige las mancuernas hacia arriba y ligeramente hacia dentro, formando una “V” invertida vista desde arriba.</li>
                    <li><b>Control:</b> empuja sin encoger los hombros y baja las mancuernas lentamente hasta la altura de los hombros.</li>
                  </ul>
                </details>
              )}
              {selectedExercise === 'press-plano-mancuernas' && (
                <details className="pulldown-instructions">
                  <summary>Condiciones para una repetición correcta</summary>
                  <ul>
                    <li><b>Encuadre:</b> colócate de lado o en 3/4 y deja visibles ambos hombros, codos y muñecas durante todo el recorrido.</li>
                    <li><b>Inicio:</b> comienza arriba con ambos codos entre {DUMBBELL_PRESS_START_MIN_ANGLE}° y {DUMBBELL_PRESS_START_MAX_ANGLE}°.</li>
                    <li><b>Descenso:</b> baja las mancuernas hacia el pecho con control; la activación comienza cuando el promedio de ambos codos baja de {DUMBBELL_PRESS_ACTIVATION_ANGLE}°.</li>
                    <li><b>Fondo:</b> llega con ambos codos entre {DUMBBELL_PRESS_END_MIN_ANGLE}° y {DUMBBELL_PRESS_END_MAX_ANGLE}°, sin que un lado se adelante más de {DUMBBELL_PRESS_MAX_SIDE_DIFFERENCE}°.</li>
                    <li><b>Regreso:</b> sube las dos mancuernas de forma simétrica hasta extender los codos y cerrar la repetición.</li>
                  </ul>
                </details>
              )}
              {selectedExercise === 'press-pallof-polea-banda' && (
                <details className="pulldown-instructions">
                  <summary>Cómo hacerlo</summary>
                  <ul>
                    <li><b>Montaje:</b> usa una polea o una banda anclada a la altura del pecho y colócate de lado al punto de anclaje.</li>
                    <li><b>Inicio:</b> sujeta el asa con ambas manos cerca del pecho, con los codos flexionados entre {PALLOF_START_MIN_ANGLE}° y {PALLOF_START_MAX_ANGLE}°.</li>
                    <li><b>Press:</b> extiende las manos al frente hasta que ambos codos lleguen a {PALLOF_END_MIN_ANGLE}°–{PALLOF_END_MAX_ANGLE}°, sin girar los hombros ni el torso.</li>
                    <li><b>Muñecas:</b> mantenlas neutras y alineadas con los antebrazos durante todo el recorrido.</li>
                    <li><b>Regreso:</b> vuelve lentamente al pecho; el contador cierra la repetición al completar la extensión y el regreso.</li>
                  </ul>
                </details>
              )}
              {selectedExercise === 'giros-rusos' && (
                <details className="pulldown-instructions">
                  <summary>Lecturas y posición</summary>
                  <ul>
                    <li><b>Encuadre:</b> usa una vista frontal o en 3/4 y deja visibles ambos hombros, codos, muñecas, caderas, rodillas y tobillos.</li>
                    <li><b>Posición:</b> siéntate con el torso ligeramente inclinado y mantén las piernas elevadas o extendidas según tu nivel, sin perder el equilibrio.</li>
                    <li><b>Rotación:</b> gira el torso de un lado al otro con control; evita mover solo los brazos o impulsarte con las piernas.</li>
                    <li><b>Lecturas:</b> se muestran los ángulos de hombros, codos, muñecas, caderas, rodillas y tobillos de ambos lados.</li>
                    <li><b>Recorrido:</b> el rango de rotación queda registrado como referencia hasta calibrarlo con una ejecución correcta.</li>
                  </ul>
                </details>
              )}
              {selectedExercise === 'elevaciones-laterales' && (
                <details className="pulldown-instructions">
                  <summary>Cómo hacerlo</summary>
                  <ul>
                    <li><b>Vista:</b> colócate de frente o en 3/4 y deja dentro del encuadre ambos hombros, codos y muñecas.</li>
                    <li><b>Subida:</b> eleva los brazos hacia los lados hasta la línea de los hombros, sin encogerlos.</li>
                    <li><b>Codos:</b> conserva una ligera flexión durante todo el recorrido; no los cierres ni los bloquees.</li>
                    <li><b>Muñecas:</b> mantenlas alineadas con los codos y evita doblarlas hacia arriba o hacia abajo.</li>
                    <li><b>Control:</b> baja las mancuernas lentamente y mantén ambos lados a una altura similar.</li>
                  </ul>
                </details>
              )}
              {selectedExercise === 'elevaciones-laterales-polea-baja' && (
                <details className="pulldown-instructions">
                  <summary>Cómo hacerlo</summary>
                  <ul>
                    <li><b>Vista:</b> colócate de frente o en 3/4 y deja visibles ambos hombros, codos, muñecas y la polea.</li>
                    <li><b>Posición:</b> sujeta el asa de la polea baja con el brazo contrario y mantén el torso estable, sin girarlo.</li>
                    <li><b>Subida:</b> lleva el brazo hacia el lado hasta la línea del hombro, sin encogerlo ni usar impulso.</li>
                    <li><b>Codos:</b> conserva una ligera flexión durante todo el recorrido; no los bloquees.</li>
                    <li><b>Muñecas:</b> mantenlas alineadas con los codos y regresa el cable lentamente a la posición inicial.</li>
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
              {selectedExercise === 'triceps-tras-nuca-polea-alta' && (
                <details className="pulldown-instructions">
                  <summary>Cómo hacerlo</summary>
                  <ul>
                    <li><b>Posición:</b> colócate de lado o en 3/4 frente a la polea alta, con la cuerda detrás de la cabeza y los brazos elevados.</li>
                    <li><b>Hombros:</b> mantén los brazos por encima de la cabeza, con el hombro entre {OVERHEAD_TRICEPS_SHOULDER_MIN_ANGLE}° y {OVERHEAD_TRICEPS_SHOULDER_MAX_ANGLE}°; evita encogerlos o moverlos hacia delante.</li>
                    <li><b>Codos:</b> mantenlos apuntando al frente y relativamente juntos; flexiona y extiende solo el codo, sin abrir los brazos.</li>
                    <li><b>Muñecas:</b> mantenlas neutras y alineadas con los antebrazos durante todo el recorrido.</li>
                    <li><b>Movimiento:</b> lleva la cuerda detrás de la nuca con control y extiende hasta acercarte a 145°–180°, sin bloquear de golpe ni arquear el torso.</li>
                  </ul>
                </details>
              )}
              {selectedExercise === 'copa-mancuernas' && (
                <details className="pulldown-instructions">
                  <summary>Cómo hacerlo</summary>
                  <ul>
                    <li><b>Vista:</b> colócate de lado o en 3/4 y deja visibles ambos hombros, codos y muñecas.</li>
                    <li><b>Posición:</b> sujeta una mancuerna con las dos manos por encima de la cabeza y mantén los brazos elevados.</li>
                    <li><b>Codos:</b> mantenlos apuntando hacia delante y relativamente juntos; flexiona y extiende solo los codos.</li>
                    <li><b>Muñecas:</b> mantenlas neutras y alineadas con los antebrazos durante todo el recorrido.</li>
                    <li><b>Movimiento:</b> baja la mancuerna detrás de la cabeza con control hasta flexionar los codos entre 70° y 120°, y vuelve a extenderlos sin arquear el torso.</li>
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
              {selectedExercise === 'curl-inclinado-mancuernas' && (
                <details className="pulldown-instructions">
                  <summary>Cómo hacerlo</summary>
                  <ul>
                    <li><b>Posición:</b> ajusta el banco con una inclinación moderada y apoya la espalda; deja los hombros detrás del torso y los brazos colgando.</li>
                    <li><b>Vista:</b> colócate de lado o en 3/4 para que se vean ambos hombros, codos y muñecas junto al banco.</li>
                    <li><b>Subida:</b> flexiona ambos codos y lleva las mancuernas hacia los hombros, llegando aproximadamente a 30°–60°.</li>
                    <li><b>Bajada:</b> desciende con control hasta 85°–135° sin despegar los hombros ni adelantar los codos.</li>
                    <li><b>Muñecas:</b> mantenlas alineadas con los antebrazos y evita doblarlas para completar la repetición.</li>
                  </ul>
                </details>
              )}
              {selectedExercise === 'curl-predicador' && (
                <details className="pulldown-instructions">
                  <summary>Cómo hacerlo</summary>
                  <ul>
                    <li><b>Posición:</b> siéntate frente al banco predicador y apoya la parte superior de los brazos sobre el cojín, manteniendo los hombros estables.</li>
                    <li><b>Vista:</b> colócate de frente o en 3/4 para que se vean ambos hombros, codos y muñecas junto al banco.</li>
                    <li><b>Subida:</b> flexiona ambos codos y lleva la barra hacia los hombros sin levantar los brazos del apoyo.</li>
                    <li><b>Bajada:</b> desciende con control hasta 85°–135° sin bloquear ni hiperextender los codos.</li>
                    <li><b>Muñecas:</b> mantenlas alineadas con los antebrazos y evita usarlas para completar el recorrido.</li>
                  </ul>
                </details>
              )}
              {selectedExercise === 'curl-arana' && (
                <details className="pulldown-instructions">
                  <summary>Cómo hacerlo</summary>
                  <ul>
                    <li><b>Posición:</b> coloca el pecho sobre un banco inclinado y deja los brazos colgando hacia el suelo, con los hombros estables.</li>
                    <li><b>Vista:</b> colócate de frente o en 3/4 frente al banco para que se vean ambos hombros, codos y muñecas.</li>
                    <li><b>Subida:</b> flexiona ambos codos y lleva la barra hacia los hombros sin despegar el pecho del banco.</li>
                    <li><b>Bajada:</b> desciende con control hasta 85°–135° sin bloquear ni hiperextender los codos.</li>
                    <li><b>Muñecas:</b> mantenlas alineadas con los antebrazos y evita balancear los brazos para completar la repetición.</li>
                  </ul>
                </details>
              )}
              {selectedExercise === 'curl-martillo' && (
                <details className="pulldown-instructions">
                  <summary>Cómo hacerlo</summary>
                  <ul>
                    <li><b>Posición:</b> ponte de pie con una mancuerna en cada mano y mantén los hombros relajados, sin encogerlos.</li>
                    <li><b>Vista:</b> colócate de frente o en 3/4 para que se vean ambos hombros, codos y muñecas durante todo el recorrido.</li>
                    <li><b>Subida:</b> flexiona ambos codos con las palmas enfrentadas y lleva las mancuernas hacia los hombros.</li>
                    <li><b>Bajada:</b> desciende con control hasta 85°–135° sin balancear el torso ni adelantar los codos.</li>
                    <li><b>Muñecas:</b> conserva el agarre neutro y mantenlas alineadas con los antebrazos.</li>
                  </ul>
                </details>
              )}
              {selectedExercise === 'curl-inverso-barra' && (
                <details className="pulldown-instructions">
                  <summary>Cómo hacerlo</summary>
                  <ul>
                    <li><b>Vista:</b> colócate de frente o en 3/4 para que se vean ambos hombros, codos y muñecas.</li>
                    <li><b>Agarre:</b> sujeta la barra con las palmas hacia abajo y mantén las muñecas alineadas con los antebrazos.</li>
                    <li><b>Subida:</b> flexiona ambos codos y lleva la barra hacia la parte alta del abdomen o el pecho, llegando aproximadamente a 30°–60°.</li>
                    <li><b>Bajada:</b> desciende con control hasta 85°–135° sin despegar los codos del cuerpo.</li>
                    <li><b>Control:</b> mantén los hombros quietos, evita balancearte y no dobles las muñecas para completar la repetición.</li>
                  </ul>
                </details>
              )}
              {selectedExercise === 'curl-muneca-sentado' && (
                <details className="pulldown-instructions">
                  <summary>Cómo hacerlo</summary>
                  <ul>
                    <li><b>Posición:</b> siéntate junto al banco y apoya los antebrazos sobre los muslos, dejando las muñecas libres por delante de las rodillas.</li>
                    <li><b>Agarre:</b> usa una barra o una mancuerna en cada mano; mantén las muñecas alineadas y el peso controlado.</li>
                    <li><b>Movimiento:</b> flexiona y extiende las muñecas lentamente, sin levantar los antebrazos ni separar los codos.</li>
                    <li><b>Recorrido:</b> inicia cerca de {WRIST_CURL_START_MIN_ANGLE}°–{WRIST_CURL_START_MAX_ANGLE}° y busca {WRIST_CURL_END_MIN_ANGLE}°–{WRIST_CURL_END_MAX_ANGLE}° sin forzar la articulación.</li>
                    <li><b>Encuadre:</b> usa una vista lateral y deja visibles el hombro, codo y muñeca del lado que trabaja durante toda la serie.</li>
                  </ul>
                </details>
              )}
              {selectedExercise === 'rodillo-muneca' && (
                <details className="pulldown-instructions">
                  <summary>Cómo hacerlo</summary>
                  <ul>
                    <li><b>Posición:</b> ponte de pie con el rodillo frente al cuerpo y los brazos extendidos aproximadamente a la altura de los hombros.</li>
                    <li><b>Agarre:</b> sujeta el mango con ambas manos y mantén las muñecas alineadas con los antebrazos.</li>
                    <li><b>Movimiento:</b> gira el mango de forma alternada para enrollar y desenrollar la cuerda, elevando y descendiendo la carga con control.</li>
                    <li><b>Estabilidad:</b> mantén hombros y codos quietos; evita encoger los hombros, doblar los codos o balancear el torso.</li>
                    <li><b>Encuadre:</b> usa una vista lateral y deja visibles el hombro, codo y muñeca del lado que trabaja durante toda la serie.</li>
                  </ul>
                </details>
              )}
              {selectedExercise === 'dominadas-supinas' && (
                <details className="pulldown-instructions">
                  <summary>Cómo hacerlo</summary>
                  <ul>
                    <li><b>Codo:</b> termina la subida cerca de 90° y desciende hasta extender los brazos en el rango base {PULLUP_BOTTOM_MIN_ANGLE}°–{PULLUP_BOTTOM_MAX_ANGLE}°, con tolerancia ±{PULLUP_TOLERANCE_DEG}°.</li>
                    <li><b>Control:</b> completa el recorrido de los codos sin balancearte y baja lentamente.</li>
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
              {selectedExercise === 'hip-thrust-barra' && (
                <details className="pulldown-instructions">
                  <summary>Condiciones para una repetición correcta</summary>
                  <ul>
                    <li><b>Encuadre:</b> coloca la cámara de lado o en 3/4 y deja visibles ambos brazos y ambas piernas, además del banco y la barra.</li>
                    <li><b>Posición:</b> apoya la parte alta de la espalda en el banco, con los pies firmes y las rodillas alineadas con los tobillos.</li>
                    <li><b>Subida:</b> eleva la cadera hasta formar una línea entre hombros, cadera y rodillas; no arquees la zona lumbar para ganar altura.</li>
                    <li><b>Recorrido:</b> empieza entre {HIP_THRUST_BOTTOM_MIN_ANGLE}° y {HIP_THRUST_BOTTOM_MAX_ANGLE}° y llega arriba entre {HIP_THRUST_TOP_MIN_ANGLE}° y {HIP_THRUST_TOP_MAX_ANGLE}°.</li>
                    <li><b>Repetición:</b> el contador solo avanza cuando ambos lados y todas las articulaciones necesarias permanecen visibles.</li>
                  </ul>
                </details>
              )}
              {selectedExercise === 'curl-femoral' && (
                <details className="pulldown-instructions">
                  <summary>Condiciones para una repetición correcta</summary>
                  <ul>
                    <li><b>Encuadre:</b> colócate de lado y deja visibles ambas rodillas y ambos tobillos durante toda la serie.</li>
                    <li><b>Posición:</b> puedes hacerlo sentado o tumbado; fija las caderas y evita levantar el cuerpo o despegarlo del respaldo o banco.</li>
                    <li><b>Movimiento:</b> flexiona las rodillas llevando los talones hacia los glúteos de forma controlada, sin rebotes.</li>
                    <li><b>Recorrido:</b> empieza entre {HAMSTRING_CURL_START_MIN_ANGLE}° y {HAMSTRING_CURL_START_MAX_ANGLE}° y llega entre {HAMSTRING_CURL_END_MIN_ANGLE}° y {HAMSTRING_CURL_END_MAX_ANGLE}°.</li>
                    <li><b>Repetición:</b> el contador solo avanza cuando ambas rodillas y ambos tobillos permanecen visibles.</li>
                  </ul>
                </details>
              )}
              {selectedExercise === 'elevacion-talones-pie' && (
                <details className="pulldown-instructions">
                  <summary>Cómo hacerlo</summary>
                  <ul>
                    <li><b>Encuadre:</b> colócate de lado y deja visibles hombro, cadera, rodilla, tobillo y pie.</li>
                    <li><b>Posición:</b> mantén el torso alineado y las rodillas estables, sin bloquearlas ni flexionarlas para ganar impulso.</li>
                    <li><b>Movimiento:</b> eleva los talones de forma controlada y vuelve a apoyar con suavidad, sin rebotes.</li>
                    <li><b>Lecturas:</b> se muestran en vivo la alineación del torso y los ángulos de rodilla y tobillo.</li>
                  </ul>
                </details>
              )}
              {selectedExercise === 'elevaciones-piernas-barra' && (
                <details className="pulldown-instructions">
                  <summary>Condiciones para una repetición correcta</summary>
                  <ul>
                    <li><b>Encuadre:</b> colócate de lado o en 3/4 y aleja el móvil hasta que entren la barra, los brazos y todo el cuerpo, incluidos los pies.</li>
                    <li><b>Inicio:</b> cuelga con los brazos extendidos y las piernas abajo, sin balancearte.</li>
                    <li><b>Movimiento:</b> eleva las piernas extendidas hasta quedar aproximadamente paralelas al suelo y baja con control.</li>
                    <li><b>Recorrido:</b> la cadera inicia entre {HANGING_LEG_RAISE_START_MIN_ANGLE}° y {HANGING_LEG_RAISE_START_MAX_ANGLE}° y llega entre {HANGING_LEG_RAISE_END_MIN_ANGLE}° y {HANGING_LEG_RAISE_END_MAX_ANGLE}°.</li>
                    <li><b>Detección:</b> se validan hombros, codos, muñecas, caderas, rodillas, tobillos y pies de ambos lados. La cara no es necesaria.</li>
                  </ul>
                </details>
              )}
              {selectedExercise === 'barra-reloj' && (
                <details className="pulldown-instructions">
                  <summary>Condiciones para una repetición correcta</summary>
                  <ul>
                    <li><b>Encuadre:</b> colócate de lado o en 3/4 y aleja el móvil hasta que entren la barra, los brazos y todo el cuerpo, incluidos los pies.</li>
                    <li><b>Posición:</b> cuelga con hombros, codos y muñecas visibles; mantén el tronco controlado y evita usar la cabeza como referencia.</li>
                    <li><b>Movimiento:</b> mueve las piernas alrededor del eje de la barra siguiendo el recorrido del reloj, sin balancear el cuerpo.</li>
                    <li><b>Detección:</b> se validan hombros, codos, muñecas, caderas, rodillas, tobillos y pies de ambos lados. La cabeza no es necesaria.</li>
                    <li><b>Calibración:</b> el recorrido angular queda visible para revisar una ejecución correcta antes de fijar el rango del contador.</li>
                  </ul>
                </details>
              )}
              {selectedExercise === 'elevaciones-piernas-suelo' && (
                <details className="pulldown-instructions">
                  <summary>Condiciones para una repetición correcta</summary>
                  <ul>
                    <li><b>Encuadre:</b> colócate de lado y deja visibles ambos tobillos, rodillas y caderas durante todo el recorrido.</li>
                    <li><b>Inicio:</b> túmbate boca arriba con las piernas extendidas y controladas cerca del suelo, sin despegar la zona lumbar de forma brusca.</li>
                    <li><b>Movimiento:</b> eleva las piernas juntas y desciende lentamente, evitando rebotes o balanceos.</li>
                    <li><b>Recorrido:</b> la cadera inicia entre {FLOOR_LEG_RAISE_START_MIN_ANGLE}° y {FLOOR_LEG_RAISE_START_MAX_ANGLE}° y llega entre {FLOOR_LEG_RAISE_END_MIN_ANGLE}° y {FLOOR_LEG_RAISE_END_MAX_ANGLE}°.</li>
                    <li><b>Detección:</b> se validan caderas, rodillas y tobillos de ambos lados. La cara no es necesaria.</li>
                  </ul>
                </details>
              )}
              {selectedExercise === 'maquina-aductores' && (
                <details className="pulldown-instructions">
                  <summary>Cómo hacerlo</summary>
                  <ul>
                    <li><b>Encuadre:</b> colócate de frente a la máquina y deja visibles ambos tobillos.</li>
                    <li><b>Movimiento:</b> realiza el recorrido de forma controlada, sin rebotes ni movimientos bruscos.</li>
                    <li><b>Lecturas:</b> el panel muestra únicamente el seguimiento de los tobillos izquierdo y derecho.</li>
                  </ul>
                </details>
              )}
              <div
                className={`video-stage ${
                  selectedExercise === 'fondos' ? 'video-stage--dip' : ''
                }${
                  selectedExercise === 'dominadas'
                    || selectedExercise === 'dominadas-supinas'
                    || selectedExercise === 'dominadas-comando'
                    ? ' video-stage--pullup'
                    : ''
                }`}
                style={{ aspectRatio: videoRatio }}
              >
                <video
                  ref={videoRef}
                  muted
                  autoPlay={inputMode !== 'video'}
                  controls={
                    inputMode === 'video'
                    && (
                      selectedExercise !== 'flexiones'
                      || pushupCalibrationStatus === 'ready'
                    )
                  }
                  playsInline
                  style={{
                    transform: inputMode === 'camera' && cameraFacingMode === 'user'
                      ? 'scaleX(-1)'
                      : 'none',
                  }}
                  onLoadedMetadata={syncVideoSize}
                  onPlay={handleVideoPlay}
                  onEnded={inputMode === 'video' ? handleUploadedVideoEnded : undefined}
                  data-testid="video-camera-preview"
                  aria-label={`Vista previa de la cámara ${
                    selectedExercise === 'flexiones'
                      || selectedExercise === 'flexiones-declinadas'
                      || selectedExercise === 'flexiones-pica'
                      || selectedExercise === 'press-militar'
                      || selectedExercise === 'elevaciones-laterales'
                      || selectedExercise === 'elevaciones-laterales-polea-baja'
                      || selectedExercise === 'cruces-polea-baja-alta'
                       || selectedExercise === 'press-banca'
                       || selectedExercise === 'press-banca-agarre-cerrado'
                       || selectedExercise === 'press-banca-inclinado'
                       || selectedExercise === 'press-plano-mancuernas'
                       || selectedExercise === 'press-plano-inclinado'
                      || selectedExercise === 'triceps-polea-alta'
                       || selectedExercise === 'triceps-tras-nuca-polea-alta'
                       || selectedExercise === 'copa-mancuernas'
                      || selectedExercise === 'extension-horizontal-barra'
                      || selectedExercise === 'curl-biceps'
                       || selectedExercise === 'curl-inclinado-mancuernas'
                       || selectedExercise === 'curl-predicador'
                       || selectedExercise === 'curl-arana'
                       || selectedExercise === 'curl-martillo'
                       || selectedExercise === 'curl-inverso-barra'
                      || selectedExercise === 'fondos'
                        || selectedExercise === 'dominadas'
                        || selectedExercise === 'dominadas-supinas'
                        || selectedExercise === 'dominadas-comando'
                      || selectedExercise === 'muscle-up'
                       || selectedExercise === 'pull-over-polea-alta'
                        || selectedExercise === 'remos-australianos-elevados'
                       || selectedExercise === 'remo-sentado-polea-agarre-cerrado'
                       || selectedExercise === 'remo-mancuerna-una-mano'
                      || selectedExercise === 'zancadas'
                      || selectedExercise === 'zancada-banco'
                      || selectedExercise === 'jalon'
                      || selectedExercise === 'remo-barra'
                       || selectedExercise === 'hip-thrust-barra'
                       || selectedExercise === 'curl-femoral'
                       || selectedExercise === 'elevacion-talones-pie'
                        || selectedExercise === 'elevaciones-piernas-barra'
                         || selectedExercise === 'barra-reloj'
                        || selectedExercise === 'elevaciones-piernas-suelo'
                      || selectedExercise === 'plancha'
                         ? selectedExercise === 'dominadas'
                          || selectedExercise === 'dominadas-supinas'
                          || selectedExercise === 'dominadas-comando'
                         ? 'trasera'
                          : 'lateral'
                      : 'frontal'
                  }`}
                />
                <canvas ref={canvasRef} aria-hidden="true" />
                <canvas
                  ref={recordedCanvasRef}
                  className="video-recording-canvas"
                  aria-hidden="true"
                />
                {inputMode === 'video'
                  && selectedExercise === 'flexiones'
                  && uploadedAnalysisProgress !== null && (
                    <div
                      role="status"
                      aria-atomic="true"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 3,
                        display: 'grid',
                        placeItems: 'center',
                        padding: '1rem',
                        background: 'rgba(5, 12, 23, 0.58)',
                        pointerEvents: 'none',
                      }}
                    >
                      <div
                        style={{
                          display: 'grid',
                          gap: '0.4rem',
                          width: 'min(100%, 22rem)',
                          padding: '1rem 1.15rem',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '1rem',
                          background: 'rgba(8, 22, 28, 0.92)',
                          boxShadow: '0 1rem 3rem rgba(0, 0, 0, 0.28)',
                          color: '#f4f8fc',
                          textAlign: 'center',
                        }}
                      >
                        <strong style={{ fontSize: 'clamp(0.95rem, 3vw, 1.15rem)' }}>
                          Analizando el video… {uploadedAnalysisProgress}%
                        </strong>
                        <span style={{ color: 'rgba(223, 235, 246, 0.78)', fontSize: '0.85rem' }}>
                          El video se reproducirá solo al terminar.
                        </span>
                      </div>
                    </div>
                  )}
                {(isStandardPullupSelected || isStandardPushupSelected)
                  && !exerciseStarted
                  && inputMode === 'camera'
                  && (
                    isStandardPullupSelected
                      ? pullupPreparationCountdown !== null
                      : pushupPreparationCountdown !== null
                  ) && (
                    <div
                      className="pullup-preparation-overlay"
                      role="status"
                      aria-live="polite"
                      aria-atomic="true"
                    >
                      <span>
                        {isStandardPullupSelected
                          ? pullupPreparationStage === 'body-detection'
                            ? 'Registrando tu cuerpo'
                            : 'Cuélgate en la barra'
                          : pushupPreparationStage === 'body-detection'
                            ? 'Registrando tu cuerpo'
                            : 'Acomódate para empezar'}
                      </span>
                      <strong>
                        {isStandardPullupSelected
                          ? pullupPreparationCountdown
                          : pushupPreparationCountdown}
                      </strong>
                      <small>
                        {isStandardPullupSelected
                          ? pullupPreparationStage === 'body-detection'
                            ? 'Mantente quieto y visible'
                            : 'El ejercicio comenzará automáticamente'
                          : pushupPreparationStage === 'body-detection'
                            ? 'Mantén todas las extremidades visibles'
                            : 'La evaluación comenzará automáticamente'}
                      </small>
                    </div>
                  )}
                {DEBUG_LIMB_TRACKING_ACTIVE && (
                  <div className="limb-debug-panel" aria-hidden="true">
                    <div className="limb-debug-panel__title">DEBUG · EXTREMIDADES</div>
                    <div>Modelo: {debugPanel.model} · {debugPanel.delegate}</div>
                    <div>FPS medio: {debugPanel.fps.toFixed(1)}</div>
                    <div>
                      Retenidos: low-score {debugPanel.held.lowScore} · bone-length {debugPanel.held.boneLength}
                    </div>
                    <div>Swaps confirmados: {debugPanel.confirmedSwaps}</div>
                    <div>
                      Vídeo: {debugPanel.width || '—'} × {debugPanel.height || '—'}
                    </div>
                    <div>
                      Corrección media filtro: {debugPanel.correctionMean === null
                        ? '—'
                        : `${debugPanel.correctionMean.toFixed(1)} px`}
                    </div>
                    <div>
                      Yaw: {debugPanel.yaw === null ? '—' : `${debugPanel.yaw.toFixed(1)}°`}
                      {' · '}vista: {debugPanel.estimatedView}
                    </div>
                    <div>
                      Recomendada: {debugPanel.recommendedView}
                      {' · '}estado: {debugPanel.viewStatus}
                    </div>
                    <div>
                      Pitch torso: {debugPanel.pitch === null ? '—' : `${debugPanel.pitch.toFixed(1)}°`}
                    </div>
                    <div className="limb-debug-panel__bones">
                      <span>Rechazos por hueso:</span>
                      {Object.entries(debugPanel.boneRejections).map(([segment, count]) => (
                        <span key={segment}>{segment}: {count}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="video-vignette" aria-hidden="true" />
                <span className="stage-corner stage-corner--tl" aria-hidden="true" />
                <span className="stage-corner stage-corner--tr" aria-hidden="true" />
                <span className="stage-corner stage-corner--bl" aria-hidden="true" />
                <span className="stage-corner stage-corner--br" aria-hidden="true" />
                {(exerciseStarted || !isStandardPullupSelected) && (
                  <button
                    type="button"
                    className="exercise-start-button camera-start-button"
                    disabled={
                      phase !== 'tracking'
                      || (inputMode !== 'video' && !exerciseStarted && !personDetected)
                      || (
                        inputMode === 'video'
                        && selectedExercise === 'flexiones'
                        && pushupCalibrationStatus !== 'ready'
                      )
                    }
                    aria-pressed={exerciseStarted}
                    onClick={toggleExercise}
                  >
                    {exerciseStarted
                      ? 'Terminar ejercicio'
                      : inputMode === 'video'
                        ? selectedExercise === 'flexiones'
                          && pushupCalibrationStatus !== 'ready'
                          ? pushupPreparationCountdown !== null
                            ? `Calibrando · ${pushupPreparationCountdown}s`
                            : 'Detectando cuerpo…'
                          : 'Reproducir video'
                        : personDetected
                          ? 'Iniciar ejercicio'
                          : 'Buscando cuerpo'}
                  </button>
                )}
                {hasEvaluationCounter && (
                  <div
                    className="rep-counter-hud"
                    aria-label="Contador de repeticiones"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    <div className="rep-counter-stat rep-counter-stat--good">
                      <span>Correctas</span>
                      <strong>{correctRepetitions}</strong>
                    </div>
                    <div className="rep-counter-stat rep-counter-stat--bad">
                      <span>Incorrectas</span>
                      <strong>{Math.max(0, evaluatedRepetitions - correctRepetitions)}</strong>
                    </div>
                  </div>
                )}
                  {selectedExercise !== 'fondos'
                    && selectedExercise !== 'dominadas'
                    && selectedExercise !== 'dominadas-supinas'
                    && selectedExercise !== 'dominadas-comando' && (
                      <div
                        className={`live-angle-hud live-angle-hud--${liveAngleReadings.length > 3 ? 'wide' : 'compact'}`}
                        aria-label={`Ángulos de extremidades medidos en tiempo real de ${activeExercise?.name ?? 'este ejercicio'}`}
                        aria-live="polite"
                      >
                        <div className="live-angle-hud-heading">
                          <span>Extremidades</span>
                          <strong>GRADOS EN VIVO</strong>
                        </div>
                        <div className="live-angle-grid">
                          {liveAngleReadings.map((reading) => (
                            <div
                              key={`${reading.label}-${reading.target}`}
                              className="live-angle-reading"
                            >
                              <span className="live-angle-label">{reading.label}</span>
                              <strong>
                                {reading.value === null
                                  ? '—'
                                  : `${reading.value}${reading.unit ?? '°'}`}
                              </strong>
                              <small>{reading.target}</small>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
                  {(selectedExercise === 'dominadas'
                    || selectedExercise === 'dominadas-supinas'
                    || selectedExercise === 'dominadas-comando') && (
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
                  <p>{displayedAngleFeedback.message}</p>
                ) : null}
              </div>
              <div className="diagnostic-dock">
                {canExportDiagnostics && (
                  <div className="diagnostic-copy-control">
                    {canExportPullupDiagnostics && (
                      <>
                        <button
                          type="button"
                          className="diagnostic-copy-button"
                          data-testid="button-copy-view-diagnostics"
                          onClick={() => void copyViewDiagnostics()}
                        >
                          <Copy size={13} strokeWidth={2} aria-hidden="true" />
                          <span>Copiar vista</span>
                        </button>
                        <button
                          type="button"
                          className="diagnostic-copy-button"
                          data-testid="button-copy-pullup-diagnostics"
                          onClick={() => void copyPullupDiagnostics()}
                        >
                          <Copy size={13} strokeWidth={2} aria-hidden="true" />
                          <span>Copiar diagnóstico</span>
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      className="diagnostic-copy-button"
                      data-testid="button-copy-combined-diagnostics"
                      onClick={() => void copyCombinedDiagnostics()}
                    >
                      <Copy size={13} strokeWidth={2} aria-hidden="true" />
                      <span>Copiar diagnóstico completo</span>
                    </button>
                    {diagnosticCopyMessage && (
                      <span
                        className={`diagnostic-copy-status ${diagnosticCopyMessage === 'Copiado' ? 'is-success' : 'is-error'}`}
                        role="status"
                        aria-live="polite"
                      >
                        {diagnosticCopyMessage}
                      </span>
                    )}
                  </div>
                )}
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
                        <dt>Total evaluadas</dt>
                        <dd className="diagnostic-value diagnostic-value--accent">{exerciseRepetitions}</dd>
                      </div>
                      <div className="diagnostic-row">
                        <dt>Incorrectas</dt>
                        <dd className="diagnostic-value diagnostic-value--warning">{incorrectRepetitions}</dd>
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
                   {selectedExercise === 'flexiones' && (
                     <>
                       <div className="diagnostic-row">
                         <dt>Tiempo del video</dt>
                         <dd className="diagnostic-value diagnostic-value--accent">
                           {pushupVideoTimeLabel}
                         </dd>
                       </div>
                       <div className="diagnostic-row">
                         <dt>Bloqueo del conteo</dt>
                         <dd className={`diagnostic-value ${pushupBlockingReasons.length ? 'diagnostic-value--warning' : 'diagnostic-value--success'}`}>
                           {pushupBlockingReasonLabel}
                         </dd>
                       </div>
                       <div className="diagnostic-row">
                         <dt>Cuadro cuenta</dt>
                         <dd className={`diagnostic-value ${pushupRepetitionFrameReady ? 'diagnostic-value--success' : 'diagnostic-value--warning'}`}>
                           {pushupRepetitionFrameReady ? 'Sí' : 'No'}
                         </dd>
                       </div>
                       <div className="diagnostic-row">
                         <dt>Estabilidad conteo</dt>
                         <dd className="diagnostic-value">
                           {pushupStabilityFrames} / {PUSHUP_COUNT_STABLE_FRAMES}
                         </dd>
                       </div>
                       <div className="diagnostic-row">
                         <dt>Puntos retenidos</dt>
                         <dd className={`diagnostic-value ${pushupHeldMeasurementPoints.length ? 'diagnostic-value--warning' : 'diagnostic-value--success'}`}>
                           {pushupHeldMeasurementPoints.length
                             ? pushupHeldMeasurementPoints.join(' · ')
                             : 'Ninguno'}
                         </dd>
                       </div>
                     </>
                   )}
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
                 src={exerciseImages[previewExercise.id] || getExerciseImageFallback(previewExercise)}
                alt={`Ilustración de ${previewExercise.name}`}
                 onError={(event) => handleExerciseImageError(event, previewExercise)}
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
            <span>NetPosture</span>
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
            <span>NetPosture</span>
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
            <h1 id="plan-title" className="welcome-title">Activa NetPosture.</h1>
            <p className="welcome-subtitle">
              Hola{user?.firstName ? `, ${user.firstName}` : ''}. Tu cuenta ya está lista.
              Activa el plan anual por <strong>US$2</strong> para abrir tus sesiones en NetPosture.
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
            <span>NetPosture</span>
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
                 Tu plan está activo para esta cuenta de Clerk. Ya puedes abrir NetPosture.
              </p>
              <div className="account-actions">
                <button
                  type="button"
                  className="primary-action"
                  onClick={() => setLocation('/')}
                >
                  Entrar a NetPosture
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
            <span>NetPosture</span>
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
                 : 'Lemon Squeezy está confirmando tu pago. NetPosture se abrirá automáticamente en cuanto recibamos la confirmación.'}
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
             subtitle: 'Entra para continuar con NetPosture',
          },
        },
        signUp: {
          start: {
            title: 'Crea tu cuenta',
             subtitle: 'Activa tu espacio en NetPosture',
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

function ScrollPullupBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const images = pullupScrollFrames.slice(0, TOTAL_FRAMES).map((source) => {
      const image = new Image();
      image.decoding = 'async';
      image.src = source;
      return image;
    });

    let animationFrame = 0;
    let currentFrame = 0;
    let targetFrame = 0;
    let devicePixelRatio = 1;
    let canvasWidth = window.innerWidth;
    let canvasHeight = window.innerHeight;
    let frameScale = 1;
    let frameOffsetX = 0;
    let frameOffsetY = 0;
    let imagesReady = false;
    let disposed = false;

    const fillCanvasBlack = () => {
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      context.fillStyle = '#000';
      context.fillRect(0, 0, canvasWidth, canvasHeight);
    };

    const resizeCanvas = () => {
      canvasWidth = window.innerWidth;
      canvasHeight = window.innerHeight;
      devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(canvasWidth * devicePixelRatio));
      canvas.height = Math.max(1, Math.floor(canvasHeight * devicePixelRatio));
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;

      const referenceImage = images[0];
      if (referenceImage?.naturalWidth && referenceImage.naturalHeight) {
        frameScale = canvasHeight / referenceImage.naturalHeight;
        frameOffsetX = (canvasWidth - referenceImage.naturalWidth * frameScale) / 2;
        frameOffsetY = (canvasHeight - referenceImage.naturalHeight * frameScale) / 2;
      }

      fillCanvasBlack();
    };

    const updateTargetFrame = () => {
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const scrollProgress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      const repeatedProgress = (scrollProgress * REPETICIONES) % 2;
      const movementProgress =
        repeatedProgress <= 1 ? repeatedProgress : 2 - repeatedProgress;
      targetFrame = movementProgress * (TOTAL_FRAMES - 1);
    };

    const drawInterpolatedFrame = () => {
      fillCanvasBlack();
      if (!imagesReady) return;

      const lowerFrame = Math.floor(currentFrame);
      const upperFrame = Math.min(TOTAL_FRAMES - 1, lowerFrame + 1);
      const upperAlpha = currentFrame - lowerFrame;
      const lowerImage = images[lowerFrame];
      const upperImage = images[upperFrame];

      if (lowerImage?.naturalWidth && lowerImage.naturalHeight) {
        context.globalAlpha = upperFrame === lowerFrame ? 1 : 1 - upperAlpha;
        context.drawImage(
          lowerImage,
          frameOffsetX,
          frameOffsetY,
          lowerImage.naturalWidth * frameScale,
          lowerImage.naturalHeight * frameScale,
        );
      }

      if (
        upperFrame !== lowerFrame &&
        upperImage?.naturalWidth &&
        upperImage.naturalHeight
      ) {
        context.globalAlpha = upperAlpha;
        context.drawImage(
          upperImage,
          frameOffsetX,
          frameOffsetY,
          upperImage.naturalWidth * frameScale,
          upperImage.naturalHeight * frameScale,
        );
      }

      context.globalAlpha = 1;
    };

    const animate = () => {
      currentFrame += (targetFrame - currentFrame) * SCROLL_LERP;
      if (Math.abs(targetFrame - currentFrame) < 0.001) {
        currentFrame = targetFrame;
      }
      drawInterpolatedFrame();
      animationFrame = window.requestAnimationFrame(animate);
    };

    const waitForImage = (image: HTMLImageElement) =>
      new Promise<void>((resolve) => {
        if (image.complete && image.naturalWidth > 0) {
          resolve();
          return;
        }
        image.addEventListener('load', () => resolve(), { once: true });
        image.addEventListener('error', () => resolve(), { once: true });
      });

    resizeCanvas();
    updateTargetFrame();
    window.addEventListener('scroll', updateTargetFrame, { passive: true });
    window.addEventListener('resize', resizeCanvas);

    void Promise.all(images.map(waitForImage)).then(() => {
      if (disposed) return;
      imagesReady = images.every((image) => image.naturalWidth > 0);
      if (!imagesReady) return;
      resizeCanvas();
      drawInterpolatedFrame();
      animationFrame = window.requestAnimationFrame(animate);
    });

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('scroll', updateTargetFrame);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} className="scroll-pullup-background" aria-hidden="true" />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ScrollPullupBackground />
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;