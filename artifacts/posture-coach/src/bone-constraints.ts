import {
  type Pose,
  type PosePoint,
  type WorldCoordinate,
} from './pose3d';
import {
  MIN_SCORE_BODY,
  MIN_SCORE_LIMB,
} from './pose-filters';

// Número de mediciones recientes usadas para estimar la longitud de referencia.
export const BONE_WINDOW_FRAMES = 60;
// Número mínimo de mediciones válidas antes de activar una restricción.
export const BONE_MIN_SAMPLES = 20;
// Desviación relativa máxima permitida respecto a la longitud de referencia.
export const BONE_TOLERANCE = 0.25;
// Frames consecutivos rechazados antes de borrar la referencia y recalibrar.
export const BONE_REJECT_MAX_FRAMES = 15;
// Mantén este flag en false para no emitir trazas de depuración.
export const DEBUG_BONE_CONSTRAINTS = false;
let debugBoneConstraintsEnabled = DEBUG_BONE_CONSTRAINTS;

export function setDebugBoneConstraintsEnabled(enabled: boolean) {
  debugBoneConstraintsEnabled = DEBUG_BONE_CONSTRAINTS || enabled;
}
// Reinicia referencias después de esta cantidad de frames sin una pose.
const POSE_MISSING_RESET_FRAMES = 10;
// Índices de extremidades cuyo score necesita el umbral específico de limb.
const LIMB_LANDMARKS = new Set([15, 16, 27, 28, 29, 30, 31, 32]);

export type BoneSegmentId =
  | 'left-upper-arm'
  | 'right-upper-arm'
  | 'left-forearm'
  | 'right-forearm'
  | 'left-thigh'
  | 'right-thigh'
  | 'left-calf'
  | 'right-calf';

export type BoneSegmentDefinition = {
  id: BoneSegmentId;
  proximal: number;
  distal: number;
};

export const BONE_SEGMENTS: readonly BoneSegmentDefinition[] = [
  { id: 'left-upper-arm', proximal: 11, distal: 13 },
  { id: 'right-upper-arm', proximal: 12, distal: 14 },
  { id: 'left-forearm', proximal: 13, distal: 15 },
  { id: 'right-forearm', proximal: 14, distal: 16 },
  { id: 'left-thigh', proximal: 23, distal: 25 },
  { id: 'right-thigh', proximal: 24, distal: 26 },
  { id: 'left-calf', proximal: 25, distal: 27 },
  { id: 'right-calf', proximal: 26, distal: 28 },
];

export type BoneConstraintDebugInfo = {
  referenceLength: number | null;
  validSamples: number;
  rejectedFrames: number;
  totalRejectedFrames: number;
};

type BoneSegmentState = BoneConstraintDebugInfo & {
  samples: number[];
};

function getWorldCoordinates(
  point: PosePoint | undefined,
  worldLandmark: PosePoint | undefined,
): WorldCoordinate | null {
  const world = point?.world ?? worldLandmark?.world;
  if (
    !world
    || !Number.isFinite(world.x)
    || !Number.isFinite(world.y)
    || !Number.isFinite(world.z)
  ) {
    return null;
  }
  return world;
}

function getMinimumScore(index: number) {
  return LIMB_LANDMARKS.has(index) ? MIN_SCORE_LIMB : MIN_SCORE_BODY;
}

function isReliableLandmark(
  point: PosePoint | undefined,
  index: number,
) {
  return Boolean(
    point
    && !point.held
    && (point.score ?? 0) >= getMinimumScore(index),
  );
}

function distanceBetween(
  first: WorldCoordinate,
  second: WorldCoordinate,
) {
  return Math.hypot(
    first.x - second.x,
    first.y - second.y,
    first.z - second.z,
  );
}

function median(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((first, second) => first - second);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function createSegmentState(): BoneSegmentState {
  return {
    samples: [],
    referenceLength: null,
    validSamples: 0,
    rejectedFrames: 0,
    totalRejectedFrames: 0,
  };
}

function clearCalibration(state: BoneSegmentState) {
  state.samples = [];
  state.referenceLength = null;
  state.validSamples = 0;
  state.rejectedFrames = 0;
}

function addValidSample(state: BoneSegmentState, length: number) {
  state.samples.push(length);
  if (state.samples.length > BONE_WINDOW_FRAMES) {
    state.samples.shift();
  }
  state.validSamples = state.samples.length;
  if (state.validSamples >= BONE_MIN_SAMPLES) {
    state.referenceLength = median(state.samples);
  }
}

export class BoneConstraintFilter {
  private readonly states = new Map<BoneSegmentId, BoneSegmentState>(
    BONE_SEGMENTS.map((segment) => [segment.id, createSegmentState()]),
  );

  private missingPoseFrames = 0;

  filter(pose: Pose): Pose {
    this.missingPoseFrames = 0;
    const rejectedDistalIndexes = new Set<number>();

    BONE_SEGMENTS.forEach((segment) => {
      const state = this.states.get(segment.id);
      if (!state) return;

      // Si otro segmento ya rechazó este landmark como proximal, no se puede
      // medir este segmento con él de forma fiable en el mismo frame.
      if (
        rejectedDistalIndexes.has(segment.proximal)
        || rejectedDistalIndexes.has(segment.distal)
      ) {
        state.rejectedFrames = 0;
        return;
      }

      const proximalPoint = pose.keypoints[segment.proximal];
      const distalPoint = pose.keypoints[segment.distal];
      const proximalWorld = getWorldCoordinates(
        proximalPoint,
        pose.worldLandmarks[segment.proximal],
      );
      const distalWorld = getWorldCoordinates(
        distalPoint,
        pose.worldLandmarks[segment.distal],
      );

      // La Fase 2 ya gestiona estos casos mediante score/held.
      if (
        !isReliableLandmark(proximalPoint, segment.proximal)
        || !isReliableLandmark(distalPoint, segment.distal)
        || !proximalWorld
        || !distalWorld
      ) {
        state.rejectedFrames = 0;
        return;
      }

      const currentLength = distanceBetween(proximalWorld, distalWorld);
      if (!(currentLength > 0) || !Number.isFinite(currentLength)) {
        state.rejectedFrames = 0;
        return;
      }

      const referenceLength = state.referenceLength;
      if (
        referenceLength !== null
        && Math.abs(currentLength - referenceLength) / referenceLength > BONE_TOLERANCE
      ) {
        state.rejectedFrames += 1;
        state.totalRejectedFrames += 1;
        rejectedDistalIndexes.add(segment.distal);
        if (debugBoneConstraintsEnabled) {
          console.debug(
            `[bone-constraints] ${segment.id} rejected`,
            { currentLength, referenceLength, rejectedFrames: state.rejectedFrames },
          );
        }
        if (state.rejectedFrames > BONE_REJECT_MAX_FRAMES) {
          clearCalibration(state);
        }
        return;
      }

      state.rejectedFrames = 0;
      addValidSample(state, currentLength);
    });

    if (!rejectedDistalIndexes.size) return pose;

    const keypoints = [...pose.keypoints];
    const worldLandmarks = [...pose.worldLandmarks];
    rejectedDistalIndexes.forEach((index) => {
      const point = keypoints[index];
      if (point) {
        keypoints[index] = {
          ...point,
          held: true,
          heldReason: 'bone-length',
        };
      }
      const worldPoint = worldLandmarks[index];
      if (worldPoint) {
        worldLandmarks[index] = {
          ...worldPoint,
          held: true,
          heldReason: 'bone-length',
        };
      }
    });

    return {
      ...pose,
      keypoints,
      worldLandmarks,
    };
  }

  markPoseMissing() {
    this.missingPoseFrames += 1;
    if (this.missingPoseFrames > POSE_MISSING_RESET_FRAMES) {
      this.reset();
    }
  }

  reassignForSideSwaps(swaps: readonly { pairId: string }[]) {
    const swappedPairIds = new Set(swaps.map((swap) => swap.pairId));
    const segmentPairs: Array<[BoneSegmentId, BoneSegmentId, string[]]> = [
      ['left-upper-arm', 'right-upper-arm', ['shoulders', 'elbows']],
      ['left-forearm', 'right-forearm', ['elbows', 'wrists']],
      ['left-thigh', 'right-thigh', ['hips', 'knees']],
      ['left-calf', 'right-calf', ['knees', 'ankles']],
    ];

    segmentPairs.forEach(([leftId, rightId, relatedPairs]) => {
      if (!relatedPairs.some((pairId) => swappedPairIds.has(pairId))) return;
      const leftState = this.states.get(leftId);
      const rightState = this.states.get(rightId);
      if (!leftState || !rightState) return;
      this.states.set(leftId, rightState);
      this.states.set(rightId, leftState);
    });
  }

  getDebugInfo(): Record<BoneSegmentId, BoneConstraintDebugInfo> {
    return Object.fromEntries(
      BONE_SEGMENTS.map((segment) => {
        const state = this.states.get(segment.id) ?? createSegmentState();
        return [
          segment.id,
          {
            referenceLength: state.referenceLength,
            validSamples: state.validSamples,
            rejectedFrames: state.rejectedFrames,
            totalRejectedFrames: state.totalRejectedFrames,
          },
        ];
      }),
    ) as Record<BoneSegmentId, BoneConstraintDebugInfo>;
  }

  reset() {
    this.states.forEach((state) => {
      clearCalibration(state);
      state.totalRejectedFrames = 0;
    });
    this.missingPoseFrames = 0;
  }
}

export function createBoneConstraintFilter() {
  return new BoneConstraintFilter();
}