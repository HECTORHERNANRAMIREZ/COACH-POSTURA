import {
  POSE_LANDMARK_COUNT,
  type Pose,
  type PosePoint,
  type WorldCoordinate,
} from './pose3d';

// Convierte los timestamps de MediaPipe/performance.now() de milisegundos a segundos.
const MILLISECONDS_PER_SECOND = 1000;
// Score mínimo para aceptar una medición nueva de muñecas, tobillos, talones y pies.
export const MIN_SCORE_LIMB = 0.5;
// Score mínimo para aceptar una medición nueva del resto del cuerpo.
export const MIN_SCORE_BODY = 0.4;
// Número máximo de frames durante los que se reutiliza la última posición válida.
export const MAX_HELD_FRAMES = 8;
// Reinicia todos los filtros después de esta cantidad de frames sin una pose completa.
const POSE_MISSING_RESET_FRAMES = 10;
// Son las muñecas, tobillos, talones y puntas de los pies, que suelen introducir más ruido.
const LIMB_LANDMARKS = new Set([15, 16, 27, 28, 29, 30, 31, 32]);
const PERSISTENT_POSE_ANCHOR_INDICES = [11, 12, 23, 24];
const LIMB_PARENT_INDEX: Record<number, number> = {
  11: 23,
  12: 24,
  13: 11,
  14: 12,
  15: 13,
  16: 14,
  17: 15,
  18: 16,
  19: 15,
  20: 16,
  21: 15,
  22: 16,
  25: 23,
  26: 24,
  27: 25,
  28: 26,
  29: 27,
  30: 28,
  31: 27,
  32: 28,
};
const TEMPORAL_JUMP_MIN_DISTANCE_PX = 48;
const TEMPORAL_JUMP_BONE_RATIO = 1.8;
const TEMPORAL_JUMP_CONFIRM_FRAMES = 3;
const TEMPORAL_CROSS_MIN_SEPARATION_PX = 36;
const TEMPORAL_CROSS_MIN_GAIN_PX = 40;
const TEMPORAL_CROSS_COST_RATIO = 0.65;
const TEMPORAL_CROSS_CONFIRM_FRAMES = 3;
const TEMPORAL_CROSS_CANDIDATE_DISTANCE_PX = 48;
const TEMPORAL_CROSS_PAIRS: readonly [number, number][] = [
  [11, 12],
  [13, 14],
  [15, 16],
  [23, 24],
  [25, 26],
  [27, 28],
];

export type OneEuroParameters = {
  // Frecuencia mínima de corte: más baja significa más suavizado en reposo.
  minCutoff: number;
  // Respuesta al movimiento: valores altos reducen el retraso cuando el punto se mueve rápido.
  beta: number;
  // Frecuencia de corte del filtro de velocidad.
  dCutoff: number;
};

export const LIMB_FILTER: OneEuroParameters = Object.freeze({
  minCutoff: 0.8,
  beta: 0.02,
  dCutoff: 1.0,
});

export const BODY_FILTER: OneEuroParameters = Object.freeze({
  minCutoff: 1.5,
  beta: 0.05,
  dCutoff: 1.0,
});

type AxisFilterSet = {
  x: OneEuroAxisFilter;
  y: OneEuroAxisFilter;
  z: OneEuroAxisFilter;
};

type LandmarkFilterState = {
  screen: AxisFilterSet;
  world: AxisFilterSet;
  lastPoint?: PosePoint;
  lastWorld?: WorldCoordinate;
  heldFrames: number;
  jumpCandidate?: { x: number; y: number };
  jumpCandidateFrames: number;
};

type TemporalCrossCandidate = {
  left: { x: number; y: number };
  right: { x: number; y: number };
  frames: number;
};

function smoothingAlpha(cutoff: number, dtSeconds: number) {
  const safeCutoff = Math.max(Number.MIN_VALUE, cutoff);
  const tau = 1 / (2 * Math.PI * safeCutoff);
  return 1 / (1 + tau / dtSeconds);
}

class LowPassFilter {
  private value: number | null = null;

  getValue() {
    return this.value;
  }

  filter(nextValue: number, alpha: number) {
    this.value = this.value === null
      ? nextValue
      : alpha * nextValue + (1 - alpha) * this.value;
    return this.value;
  }

  reset() {
    this.value = null;
  }
}

class OneEuroAxisFilter {
  private readonly derivativeFilter = new LowPassFilter();
  private readonly valueFilter = new LowPassFilter();
  private previousRawValue: number | null = null;
  private previousTimestamp: number | null = null;

  constructor(private readonly parameters: OneEuroParameters) {}

  filter(value: number, timestamp: number) {
    if (!Number.isFinite(value)) {
      return this.valueFilter.getValue() ?? value;
    }

    if (this.previousRawValue === null || this.previousTimestamp === null) {
      this.previousRawValue = value;
      this.previousTimestamp = timestamp;
      return this.valueFilter.filter(value, 1);
    }

    const dtSeconds = (timestamp - this.previousTimestamp) / MILLISECONDS_PER_SECOND;
    const previousRawValue = this.previousRawValue;
    this.previousRawValue = value;
    this.previousTimestamp = timestamp;

    // No se actualiza el filtro con un dt inválido: así se evitan NaN e inestabilidad
    // si dos frames comparten timestamp o el reloj retrocede.
    if (!(dtSeconds > 0) || !Number.isFinite(dtSeconds)) {
      return this.valueFilter.getValue() ?? value;
    }

    const rawDerivative = (value - previousRawValue) / dtSeconds;
    const derivativeAlpha = smoothingAlpha(this.parameters.dCutoff, dtSeconds);
    const smoothedDerivative = this.derivativeFilter.filter(rawDerivative, derivativeAlpha);
    const cutoff = this.parameters.minCutoff
      + this.parameters.beta * Math.abs(smoothedDerivative);

    return this.valueFilter.filter(value, smoothingAlpha(cutoff, dtSeconds));
  }

  reset() {
    this.derivativeFilter.reset();
    this.valueFilter.reset();
    this.previousRawValue = null;
    this.previousTimestamp = null;
  }
}

function createAxisFilterSet(parameters: OneEuroParameters): AxisFilterSet {
  return {
    x: new OneEuroAxisFilter(parameters),
    y: new OneEuroAxisFilter(parameters),
    z: new OneEuroAxisFilter(parameters),
  };
}

function filterCoordinate(
  filter: OneEuroAxisFilter,
  value: number | undefined,
  timestamp: number,
  previousValue: number | undefined,
) {
  if (value === undefined || !Number.isFinite(value)) return previousValue;
  return filter.filter(value, timestamp);
}

function asWorldCoordinate(point: PosePoint | undefined): WorldCoordinate | undefined {
  if (!point || point.z === undefined) return undefined;
  return { x: point.x, y: point.y, z: point.z };
}

function filterScreenPoint(
  filters: AxisFilterSet,
  point: PosePoint,
  timestamp: number,
  previousPoint?: PosePoint,
): PosePoint {
  return {
    ...point,
    x: filters.x.filter(point.x, timestamp),
    y: filters.y.filter(point.y, timestamp),
    z: filterCoordinate(filters.z, point.z, timestamp, previousPoint?.z),
  };
}

function filterWorldPoint(
  filters: AxisFilterSet,
  point: WorldCoordinate,
  timestamp: number,
  previousPoint?: WorldCoordinate,
): WorldCoordinate {
  return {
    x: filters.x.filter(point.x, timestamp),
    y: filters.y.filter(point.y, timestamp),
    z: filters.z.filter(point.z, timestamp),
  };
}

export class PoseOneEuroFilter {
  private readonly states: LandmarkFilterState[] = Array.from(
    { length: POSE_LANDMARK_COUNT },
    (_, index) => {
      const parameters = LIMB_LANDMARKS.has(index) ? LIMB_FILTER : BODY_FILTER;
      return {
        screen: createAxisFilterSet(parameters),
        world: createAxisFilterSet(parameters),
        heldFrames: 0,
        jumpCandidateFrames: 0,
      };
    },
  );

  private missingPoseFrames = 0;

  private persistentHold = false;

  private persistentHoldMaxFrames = MAX_HELD_FRAMES;

  private temporalJumpGuard = false;

  private lastPose?: Pose;

  private readonly temporalCrossCandidates = new Map<number, TemporalCrossCandidate>();

  setPersistentHold(enabled: boolean, maxHeldFrames = MAX_HELD_FRAMES) {
    this.persistentHold = enabled;
    this.persistentHoldMaxFrames = Math.max(
      1,
      Math.min(MAX_HELD_FRAMES, maxHeldFrames),
    );
  }

  setTemporalJumpGuard(enabled: boolean) {
    this.temporalJumpGuard = enabled;
    if (!enabled) {
      this.states.forEach((state) => {
        state.jumpCandidate = undefined;
        state.jumpCandidateFrames = 0;
      });
      this.temporalCrossCandidates.clear();
    }
  }

  filter(pose: Pose, timestamp: number): Pose {
    this.missingPoseFrames = 0;

    const keypoints: PosePoint[] = [];
    const worldLandmarks: PosePoint[] = [];
    const previousKeypoints = this.lastPose?.keypoints ?? [];
    const previousWorldLandmarks = this.lastPose?.worldLandmarks ?? [];
    const temporalCrossingIndexes = this.getTemporalCrossingIndexes(
      pose.keypoints,
      previousKeypoints,
    );

    for (let index = 0; index < POSE_LANDMARK_COUNT; index += 1) {
      const state = this.states[index];
      let point = pose.keypoints[index];
      const worldLandmark = pose.worldLandmarks[index];
      const worldPoint = worldLandmark?.world
        ?? asWorldCoordinate(worldLandmark)
        ?? point?.world;

      if (temporalCrossingIndexes.has(index) && point && !point.held) {
        point = {
          ...point,
          held: true,
          heldFrames: state.heldFrames + 1,
          heldReason: 'temporal-jump',
        };
      }

      const parentIndex = this.temporalJumpGuard
        ? LIMB_PARENT_INDEX[index]
        : undefined;
      const currentParent = parentIndex === undefined
        ? undefined
        : keypoints[parentIndex] ?? pose.keypoints[parentIndex];
      const previousParent = parentIndex === undefined
        ? undefined
        : previousKeypoints[parentIndex];
      if (
        point
        && !point.held
        && state.lastPoint
        && currentParent
        && previousParent
        && Number.isFinite(currentParent.x)
        && Number.isFinite(currentParent.y)
        && Number.isFinite(previousParent.x)
        && Number.isFinite(previousParent.y)
      ) {
        const previousVector = {
          x: state.lastPoint.x - previousParent.x,
          y: state.lastPoint.y - previousParent.y,
        };
        const currentVector = {
          x: point.x - currentParent.x,
          y: point.y - currentParent.y,
        };
        const previousBoneLength = Math.hypot(previousVector.x, previousVector.y);
        const relativeJump = Math.hypot(
          currentVector.x - previousVector.x,
          currentVector.y - previousVector.y,
        );
        const jumpThreshold = Math.max(
          TEMPORAL_JUMP_MIN_DISTANCE_PX,
          previousBoneLength * TEMPORAL_JUMP_BONE_RATIO,
        );

        if (previousBoneLength > 0 && relativeJump > jumpThreshold) {
          const priorCandidate = state.jumpCandidate;
          const candidateDistance = priorCandidate
            ? Math.hypot(point.x - priorCandidate.x, point.y - priorCandidate.y)
            : Number.POSITIVE_INFINITY;
          const candidateIsConsistent = candidateDistance <= jumpThreshold;
          state.jumpCandidateFrames = candidateIsConsistent
            ? state.jumpCandidateFrames + 1
            : 1;
          state.jumpCandidate = { x: point.x, y: point.y };

          if (state.jumpCandidateFrames < TEMPORAL_JUMP_CONFIRM_FRAMES) {
            point = {
              ...point,
              held: true,
              heldFrames: state.heldFrames + 1,
              heldReason: 'temporal-jump',
            };
          } else {
            state.jumpCandidate = undefined;
            state.jumpCandidateFrames = 0;
          }
        } else {
          state.jumpCandidate = undefined;
          state.jumpCandidateFrames = 0;
        }
      } else {
        state.jumpCandidate = undefined;
        state.jumpCandidateFrames = 0;
      }

      const minimumScore = LIMB_LANDMARKS.has(index)
        ? MIN_SCORE_LIMB
        : MIN_SCORE_BODY;
      const isReliable = Boolean(
        point
        && !point.held
        && (point.score ?? 0) >= minimumScore,
      );

      if (isReliable && point) {
        state.jumpCandidate = undefined;
        state.jumpCandidateFrames = 0;
        const filteredWorld = worldPoint
          ? filterWorldPoint(state.world, worldPoint, timestamp, state.lastWorld)
          : state.lastWorld;
        const filteredPoint = filterScreenPoint(
          state.screen,
          point,
          timestamp,
          state.lastPoint,
        );
        const nextPoint = filteredWorld
          ? { ...filteredPoint, world: filteredWorld }
          : filteredPoint;

        state.lastPoint = {
          ...nextPoint,
          held: false,
          heldFrames: 0,
          heldReason: undefined,
        };
        state.lastWorld = filteredWorld;
        state.heldFrames = 0;
        keypoints[index] = state.lastPoint;
        worldLandmarks[index] = worldPoint
          ? {
              ...pose.worldLandmarks[index],
              ...filteredWorld,
              held: false,
              heldFrames: 0,
              heldReason: undefined,
              world: filteredWorld,
            }
          : state.lastPoint;
        continue;
      }

      const maxHeldFrames = this.persistentHold
        ? this.persistentHoldMaxFrames
        : MAX_HELD_FRAMES;
      if (state.lastPoint && state.heldFrames < maxHeldFrames) {
        const parentIndex = this.persistentHold ? LIMB_PARENT_INDEX[index] : undefined;
        const currentParent = parentIndex === undefined
          ? undefined
          : pose.keypoints[parentIndex];
        const previousParent = parentIndex === undefined
          ? undefined
          : previousKeypoints[parentIndex];
        const canTranslateWithParent = Boolean(
          currentParent
          && previousParent
          && !currentParent.held
          && (currentParent.score ?? 0) >= MIN_SCORE_BODY
          && Number.isFinite(currentParent.x)
          && Number.isFinite(currentParent.y)
          && Number.isFinite(previousParent.x)
          && Number.isFinite(previousParent.y),
        );
        const screenDelta = canTranslateWithParent
          ? {
              x: currentParent!.x - previousParent!.x,
              y: currentParent!.y - previousParent!.y,
            }
          : { x: 0, y: 0 };
        const previousWorldParent = parentIndex === undefined
          ? undefined
          : previousWorldLandmarks[parentIndex]?.world;
        const currentWorldParent = parentIndex === undefined
          ? undefined
          : pose.worldLandmarks[parentIndex]?.world;
        const canTranslateWorld = Boolean(
          canTranslateWithParent
          && currentWorldParent
          && previousWorldParent
          && Number.isFinite(currentWorldParent.x)
          && Number.isFinite(currentWorldParent.y)
          && Number.isFinite(currentWorldParent.z)
          && Number.isFinite(previousWorldParent.x)
          && Number.isFinite(previousWorldParent.y)
          && Number.isFinite(previousWorldParent.z),
        );
        const nextHeldFrames = Math.min(maxHeldFrames, state.heldFrames + 1);
        state.heldFrames = nextHeldFrames;
        const stalePoint = {
          ...state.lastPoint,
          x: state.lastPoint.x + screenDelta.x,
          y: state.lastPoint.y + screenDelta.y,
          ...(canTranslateWorld
            ? {
                world: {
                  x: state.lastPoint.world!.x
                    + currentWorldParent!.x - previousWorldParent!.x,
                  y: state.lastPoint.world!.y
                    + currentWorldParent!.y - previousWorldParent!.y,
                  z: state.lastPoint.world!.z
                    + currentWorldParent!.z - previousWorldParent!.z,
                },
              }
            : {}),
          held: true,
          heldFrames: nextHeldFrames,
          heldReason: this.persistentHold
            ? 'persistent' as const
            : point?.heldReason ?? 'low-score',
        };
        state.lastPoint = stalePoint;
        keypoints[index] = stalePoint;
        if (state.lastWorld) {
          worldLandmarks[index] = {
            ...state.lastWorld,
            score: stalePoint.score,
            held: true,
            heldFrames: state.heldFrames,
            heldReason: this.persistentHold
              ? 'persistent'
              : point?.heldReason ?? 'low-score',
            world: state.lastWorld,
          };
        }
      }
    }

    const filteredPose = {
      ...pose,
      keypoints,
      worldLandmarks,
    };
    this.lastPose = filteredPose;
    return filteredPose;
  }

  getPersistentPose(videoWidth: number, videoHeight: number): Pose | undefined {
    if (!this.persistentHold || !this.lastPose || videoWidth <= 0 || videoHeight <= 0) {
      return undefined;
    }

    const bodyIsAnchored = PERSISTENT_POSE_ANCHOR_INDICES.every((index) => {
      const point = this.lastPose?.keypoints[index];
      return Boolean(
        point
        && point.x >= 0
        && point.x <= videoWidth
        && point.y >= 0
        && point.y <= videoHeight,
      );
    });
    if (!bodyIsAnchored) return undefined;

    const keypoints = this.lastPose.keypoints.map((point) => {
      if (!point) {
        return { x: 0, y: 0, score: 0 };
      }
      if (point.x < 0 || point.x > videoWidth || point.y < 0 || point.y > videoHeight) {
        return {
          ...point,
          score: 0,
          held: false,
          heldFrames: 0,
          heldReason: undefined,
        };
      }
      return {
        ...point,
        held: true,
        heldFrames: 1,
        heldReason: 'persistent' as const,
      };
    });
    const worldLandmarks = this.lastPose.worldLandmarks.map((point) => (
      !point
        ? { x: 0, y: 0, score: 0 }
        : point.x < 0 || point.x > videoWidth || point.y < 0 || point.y > videoHeight
          ? {
              ...point,
              score: 0,
              held: false,
              heldFrames: 0,
              heldReason: undefined,
            }
          : {
              ...point,
              held: true,
              heldFrames: 1,
              heldReason: 'persistent' as const,
            }
    ));

    return {
      ...this.lastPose,
      keypoints,
      worldLandmarks,
    };
  }

  markPoseMissing() {
    this.missingPoseFrames += 1;
    this.temporalCrossCandidates.clear();
    if (this.missingPoseFrames > POSE_MISSING_RESET_FRAMES && !this.persistentHold) {
      this.reset();
    }
  }

  swapLandmarkStates(leftIndex: number, rightIndex: number) {
    const leftState = this.states[leftIndex];
    const rightState = this.states[rightIndex];
    if (!leftState || !rightState) return;
    this.states[leftIndex] = rightState;
    this.states[rightIndex] = leftState;
  }

  reset() {
    this.states.forEach((state) => {
      state.screen.x.reset();
      state.screen.y.reset();
      state.screen.z.reset();
      state.world.x.reset();
      state.world.y.reset();
      state.world.z.reset();
      state.lastPoint = undefined;
      state.lastWorld = undefined;
      state.heldFrames = 0;
      state.jumpCandidate = undefined;
      state.jumpCandidateFrames = 0;
    });
    this.temporalCrossCandidates.clear();
    this.lastPose = undefined;
    this.missingPoseFrames = 0;
  }

  private getTemporalCrossingIndexes(
    currentKeypoints: PosePoint[],
    previousKeypoints: PosePoint[],
  ) {
    const crossingIndexes = new Set<number>();
    if (!this.temporalJumpGuard) {
      this.temporalCrossCandidates.clear();
      return crossingIndexes;
    }

    TEMPORAL_CROSS_PAIRS.forEach(([leftIndex, rightIndex]) => {
      const previousLeft = previousKeypoints[leftIndex];
      const previousRight = previousKeypoints[rightIndex];
      const currentLeft = currentKeypoints[leftIndex];
      const currentRight = currentKeypoints[rightIndex];
      const previousSeparation = previousLeft && previousRight
        ? screenDistance(previousLeft, previousRight)
        : 0;
      const currentSeparation = currentLeft && currentRight
        ? screenDistance(currentLeft, currentRight)
        : 0;
      const reliablePoints = (
        isReliableForTemporalGuard(currentLeft, leftIndex)
        && isReliableForTemporalGuard(currentRight, rightIndex)
        && previousLeft
        && previousRight
        && previousSeparation >= TEMPORAL_CROSS_MIN_SEPARATION_PX
        && currentSeparation >= TEMPORAL_CROSS_MIN_SEPARATION_PX
      );
      const pairKey = leftIndex;
      const candidate = this.temporalCrossCandidates.get(pairKey);

      if (
        !reliablePoints
        || !currentLeft
        || !currentRight
        || !previousLeft
        || !previousRight
      ) {
        this.temporalCrossCandidates.delete(pairKey);
        return;
      }

      const sameCost = screenDistance(currentLeft, previousLeft)
        + screenDistance(currentRight, previousRight);
      const crossedCost = screenDistance(currentRight, previousLeft)
        + screenDistance(currentLeft, previousRight);
      const isCrossingCandidate = crossedCost < sameCost * TEMPORAL_CROSS_COST_RATIO
        && sameCost - crossedCost > TEMPORAL_CROSS_MIN_GAIN_PX;

      if (!isCrossingCandidate) {
        this.temporalCrossCandidates.delete(pairKey);
        return;
      }

      const candidateIsConsistent = candidate
        ? screenDistance(currentLeft, candidate.left)
          <= TEMPORAL_CROSS_CANDIDATE_DISTANCE_PX
          && screenDistance(currentRight, candidate.right)
            <= TEMPORAL_CROSS_CANDIDATE_DISTANCE_PX
        : false;
      const nextFrames = candidateIsConsistent && candidate
        ? candidate.frames + 1
        : 1;
      this.temporalCrossCandidates.set(pairKey, {
        left: { x: currentLeft.x, y: currentLeft.y },
        right: { x: currentRight.x, y: currentRight.y },
        frames: nextFrames,
      });

      if (nextFrames < TEMPORAL_CROSS_CONFIRM_FRAMES) {
        crossingIndexes.add(leftIndex);
        crossingIndexes.add(rightIndex);
      } else {
        this.temporalCrossCandidates.delete(pairKey);
      }
    });

    return crossingIndexes;
  }
}

function isReliableForTemporalGuard(
  point: PosePoint | undefined,
  index: number,
) {
  const minimumScore = LIMB_LANDMARKS.has(index)
    ? MIN_SCORE_LIMB
    : MIN_SCORE_BODY;
  return Boolean(
    point
    && !point.held
    && Number.isFinite(point.x)
    && Number.isFinite(point.y)
    && (point.score ?? 0) >= minimumScore,
  );
}

function screenDistance(
  first: PosePoint,
  second: PosePoint,
) {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

export function createPoseFilter() {
  return new PoseOneEuroFilter();
}