import type {
  Pose,
  PosePoint,
  PoseModel,
  PoseDelegate,
} from './pose3d';
import type { BoneConstraintDebugInfo, BoneSegmentId } from './bone-constraints';
import type {
  EstimatedView,
  ExerciseView,
  ViewStatus,
} from './view-estimation';

// Interruptor permanente de desarrollo; la URL puede activarlo solo en memoria.
export const DEBUG_LIMB_TRACKING = false;
// Distancia mínima en píxeles para dibujar la corrección entre punto crudo y filtrado.
export const DEBUG_MIN_DIFF_PX = 3;
// Intervalo mínimo entre actualizaciones React del panel de depuración.
export const DEBUG_PANEL_UPDATE_MS = 250;
// Número de frames recientes usados para calcular la corrección media del filtro.
export const DEBUG_CORRECTION_WINDOW_FRAMES = 60;

// Color del punto crudo antes de SideConsistencyFilter y los filtros posteriores.
export const DEBUG_RAW_POINT_COLOR = '#ff6b6b';
// Color de los puntos retenidos por una restricción de longitud de hueso.
export const DEBUG_BONE_HELD_COLOR = '#ff9f43';
// Color del contorno de una extremidad marcada como swapped.
export const DEBUG_SWAPPED_OUTLINE_COLOR = '#4dd0e1';
// Landmarks que se comparan y dibujan en el overlay de extremidades.
export const DEBUG_LIMB_INDICES = [15, 16, 27, 28, 29, 30, 31, 32] as const;
// Landmarks usados para la métrica de corrección media del filtro.
export const DEBUG_CORRECTION_INDICES = [15, 16, 27, 28] as const;

export type DebugHeldCounts = {
  lowScore: number;
  boneLength: number;
};

export type DebugPanelSnapshot = {
  model: PoseModel | '—';
  delegate: PoseDelegate | '—';
  fps: number;
  held: DebugHeldCounts;
  boneRejections: Record<BoneSegmentId, number>;
  confirmedSwaps: number;
  width: number;
  height: number;
  correctionMean: number | null;
  yaw: number | null;
  estimatedView: EstimatedView;
  recommendedView: ExerciseView;
  viewStatus: ViewStatus;
  pitch: number | null;
};

export type DebugFrameInput = {
  rawPose?: Pose;
  filteredPose?: Pose;
  frameTimes: readonly number[];
  activeModel?: PoseModel;
  activeDelegate?: PoseDelegate;
  boneDebugInfo: Record<BoneSegmentId, BoneConstraintDebugInfo>;
  confirmedSwapCount: number;
  width: number;
  height: number;
  now: number;
  yaw: number | null;
  estimatedView: EstimatedView;
  recommendedView: ExerciseView;
  viewStatus: ViewStatus;
  pitch: number | null;
};

export function isLimbDebugTrackingEnabled() {
  if (DEBUG_LIMB_TRACKING) return true;
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('debug') === 'limbs';
}

export function createEmptyDebugPanelSnapshot(): DebugPanelSnapshot {
  return {
    model: '—',
    delegate: '—',
    fps: 0,
    held: { lowScore: 0, boneLength: 0 },
    boneRejections: {
      'left-upper-arm': 0,
      'right-upper-arm': 0,
      'left-forearm': 0,
      'right-forearm': 0,
      'left-thigh': 0,
      'right-thigh': 0,
      'left-calf': 0,
      'right-calf': 0,
    },
    confirmedSwaps: 0,
    width: 0,
    height: 0,
    correctionMean: null,
    yaw: null,
    estimatedView: 'unknown',
    recommendedView: 'any',
    viewStatus: 'unknown',
    pitch: null,
  };
}

function isFinitePoint(point: PosePoint | undefined): point is PosePoint {
  return Boolean(
    point
    && Number.isFinite(point.x)
    && Number.isFinite(point.y),
  );
}

function average(values: number[]) {
  return values.length
    ? values.reduce((total, value) => total + value, 0) / values.length
    : null;
}

function getHeldCounts(pose: Pose | undefined): DebugHeldCounts {
  const counts: DebugHeldCounts = { lowScore: 0, boneLength: 0 };
  pose?.keypoints.forEach((point) => {
    if (!point?.held) return;
    if (point.heldReason === 'bone-length') {
      counts.boneLength += 1;
    } else {
      counts.lowScore += 1;
    }
  });
  return counts;
}

function getCorrectionMean(
  rawPose: Pose | undefined,
  filteredPose: Pose | undefined,
) {
  if (!rawPose || !filteredPose) return null;
  const distances = DEBUG_CORRECTION_INDICES.flatMap((index) => {
    const rawPoint = rawPose.keypoints[index];
    const filteredPoint = filteredPose.keypoints[index];
    if (!isFinitePoint(rawPoint) || !isFinitePoint(filteredPoint)) return [];
    return [Math.hypot(
      rawPoint.x - filteredPoint.x,
      rawPoint.y - filteredPoint.y,
    )];
  });
  return average(distances);
}

function getRollingFps(frameTimes: readonly number[]) {
  if (frameTimes.length < 2) return 0;
  const elapsed = frameTimes[frameTimes.length - 1] - frameTimes[0];
  return elapsed > 0
    ? ((frameTimes.length - 1) * 1000) / elapsed
    : 0;
}

export class LimbDebugSession {
  private readonly correctionSamples: number[] = [];
  private lastPanelUpdate = Number.NEGATIVE_INFINITY;
  private confirmedSwaps = 0;

  recordFrame(input: DebugFrameInput): DebugPanelSnapshot | null {
    const correction = getCorrectionMean(input.rawPose, input.filteredPose);
    if (correction !== null) {
      this.correctionSamples.push(correction);
      if (this.correctionSamples.length > DEBUG_CORRECTION_WINDOW_FRAMES) {
        this.correctionSamples.shift();
      }
    }
    this.confirmedSwaps += input.confirmedSwapCount;

    if (input.now - this.lastPanelUpdate < DEBUG_PANEL_UPDATE_MS) return null;
    this.lastPanelUpdate = input.now;

    const boneRejections = Object.fromEntries(
      Object.entries(input.boneDebugInfo).map(([id, info]) => [
        id,
        info.totalRejectedFrames,
      ]),
    ) as Record<BoneSegmentId, number>;

    return {
      model: input.activeModel ?? '—',
      delegate: input.activeDelegate ?? '—',
      fps: getRollingFps(input.frameTimes),
      held: getHeldCounts(input.filteredPose),
      boneRejections,
      confirmedSwaps: this.confirmedSwaps,
      width: input.width,
      height: input.height,
      correctionMean: average(this.correctionSamples),
      yaw: input.yaw,
      estimatedView: input.estimatedView,
      recommendedView: input.recommendedView,
      viewStatus: input.viewStatus,
      pitch: input.pitch,
    };
  }

  reset() {
    this.correctionSamples.length = 0;
    this.lastPanelUpdate = Number.NEGATIVE_INFINITY;
    this.confirmedSwaps = 0;
  }
}

export function drawLimbDebugOverlay(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  rawPose: Pose | undefined,
  filteredPose: Pose | undefined,
  mirror = true,
) {
  if (!rawPose || !filteredPose || !video.videoWidth || !video.videoHeight) return;
  const context = canvas.getContext('2d');
  if (!context) return;

  const width = video.videoWidth;
  const height = video.videoHeight;
  context.save();
  context.lineCap = 'round';
  context.lineWidth = Math.max(1, width / 500);

  DEBUG_LIMB_INDICES.forEach((index) => {
    const rawPoint = rawPose.keypoints[index];
    const filteredPoint = filteredPose.keypoints[index];
    if (!isFinitePoint(rawPoint) || !isFinitePoint(filteredPoint)) return;

    const rawX = mirror ? width - rawPoint.x : rawPoint.x;
    const filteredX = mirror ? width - filteredPoint.x : filteredPoint.x;
    const difference = Math.hypot(
      rawPoint.x - filteredPoint.x,
      rawPoint.y - filteredPoint.y,
    );

    if (difference > DEBUG_MIN_DIFF_PX) {
      context.beginPath();
      context.moveTo(rawX, rawPoint.y);
      context.lineTo(filteredX, filteredPoint.y);
      context.strokeStyle = DEBUG_RAW_POINT_COLOR;
      context.globalAlpha = 0.8;
      context.stroke();
    }

    context.beginPath();
    context.arc(rawX, rawPoint.y, Math.max(2, width / 250), 0, Math.PI * 2);
    context.fillStyle = DEBUG_RAW_POINT_COLOR;
    context.globalAlpha = 1;
    context.fill();
  });

  context.restore();
}