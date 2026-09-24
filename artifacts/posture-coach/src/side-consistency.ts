import {
  type Pose,
  type PosePoint,
  type WorldCoordinate,
} from './pose3d';
import {
  MIN_SCORE_BODY,
  MIN_SCORE_LIMB,
} from './pose-filters';

// Coste relativo máximo para considerar que el cruce es mejor que mantener lados.
export const SWAP_COST_RATIO = 0.6;
// Ganancia absoluta mínima en metros para evitar reaccionar a diferencias pequeñas.
export const SWAP_MIN_GAIN = 0.05;
// Separación mínima entre los puntos previos de un par para poder distinguirlos.
export const SWAP_MIN_SEPARATION = 0.08;
// Frames candidatos consecutivos necesarios en ejercicios con asignación normal.
export const SWAP_CONFIRM_FRAMES = 5;
// Frames candidatos consecutivos necesarios en ejercicios bilaterales o traseros.
export const SWAP_CONFIRM_FRAMES_BACK_VIEW = 4;
// Mantén este flag en false para no emitir trazas de depuración.
export const DEBUG_SIDE_CONSISTENCY = false;
// Ejercicios que suelen usar vista trasera o una lectura bilateral explícita.
export const SIDE_CONSISTENCY_BACK_VIEW_EXERCISES = new Set([
  'dominadas',
  'dominadas-supinas',
  'dominadas-comando',
  'muscle-up',
  'remo-barra',
  'remos-australianos-elevados',
  'remo-sentado-polea-agarre-cerrado',
]);
// Reinicia la asignación después de esta cantidad de frames sin una pose.
const POSE_MISSING_RESET_FRAMES = 10;

const LIMB_LANDMARKS = new Set([15, 16, 27, 28, 29, 30, 31, 32]);

export type SidePairId =
  | 'shoulders'
  | 'elbows'
  | 'wrists'
  | 'hips'
  | 'knees'
  | 'ankles'
  | 'heels'
  | 'toes';

export type SidePairDefinition = {
  id: SidePairId;
  left: number;
  right: number;
};

export const SIDE_PAIRS: readonly SidePairDefinition[] = [
  { id: 'shoulders', left: 11, right: 12 },
  { id: 'elbows', left: 13, right: 14 },
  { id: 'wrists', left: 15, right: 16 },
  { id: 'hips', left: 23, right: 24 },
  { id: 'knees', left: 25, right: 26 },
  { id: 'ankles', left: 27, right: 28 },
  { id: 'heels', left: 29, right: 30 },
  { id: 'toes', left: 31, right: 32 },
];

export function getSideSwapConfirmFrames(
  exerciseId: string,
  trackBothSides = false,
) {
  return trackBothSides || SIDE_CONSISTENCY_BACK_VIEW_EXERCISES.has(exerciseId)
    ? SWAP_CONFIRM_FRAMES_BACK_VIEW
    : SWAP_CONFIRM_FRAMES;
}

export type ConfirmedSideSwap = {
  pairId: SidePairId;
  left: number;
  right: number;
};

type SidePairState = {
  swapped: boolean;
  candidateFrames: number;
};

function getWorldCoordinates(
  point: PosePoint | undefined,
  worldLandmark: PosePoint | undefined,
): WorldCoordinate | null {
  const directWorld = point?.world ?? worldLandmark?.world;
  const world = directWorld ?? (
    worldLandmark?.z === undefined
      ? point?.z === undefined
        ? null
        : { x: point.x, y: point.y, z: point.z }
      : { x: worldLandmark.x, y: worldLandmark.y, z: worldLandmark.z }
  );
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

function isReliablePoint(
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

function createPairState(): SidePairState {
  return {
    swapped: false,
    candidateFrames: 0,
  };
}

export class SideConsistencyFilter {
  private readonly states = new Map<SidePairId, SidePairState>(
    SIDE_PAIRS.map((pair) => [pair.id, createPairState()]),
  );

  private readonly previousAcceptedWorld = new Map<number, WorldCoordinate>();

  private missingPoseFrames = 0;

  private lastConfirmedSwaps: ConfirmedSideSwap[] = [];

  filter(
    pose: Pose,
    confirmFrames = SWAP_CONFIRM_FRAMES,
  ): Pose {
    this.missingPoseFrames = 0;
    this.lastConfirmedSwaps = [];
    const candidatePairs = new Set<SidePairId>();

    SIDE_PAIRS.forEach((pair) => {
      const state = this.states.get(pair.id);
      if (!state) return;

      const leftPoint = pose.keypoints[pair.left];
      const rightPoint = pose.keypoints[pair.right];
      if (
        !isReliablePoint(leftPoint, pair.left)
        || !isReliablePoint(rightPoint, pair.right)
      ) {
        state.candidateFrames = 0;
        return;
      }

      const leftWorld = getWorldCoordinates(
        leftPoint,
        pose.worldLandmarks[pair.left],
      );
      const rightWorld = getWorldCoordinates(
        rightPoint,
        pose.worldLandmarks[pair.right],
      );
      const previousLeftWorld = this.previousAcceptedWorld.get(pair.left);
      const previousRightWorld = this.previousAcceptedWorld.get(pair.right);
      if (!leftWorld || !rightWorld || !previousLeftWorld || !previousRightWorld) {
        state.candidateFrames = 0;
        return;
      }

      if (distanceBetween(previousLeftWorld, previousRightWorld) < SWAP_MIN_SEPARATION) {
        state.candidateFrames = 0;
        this.updatePreviousAcceptedWorld(pair, state, leftWorld, rightWorld);
        return;
      }

      const currentLogicalLeft = state.swapped ? rightWorld : leftWorld;
      const currentLogicalRight = state.swapped ? leftWorld : rightWorld;
      const costWithoutCrossing = distanceBetween(
        currentLogicalLeft,
        previousLeftWorld,
      ) + distanceBetween(currentLogicalRight, previousRightWorld);
      const costWithCrossing = distanceBetween(
        currentLogicalRight,
        previousLeftWorld,
      ) + distanceBetween(currentLogicalLeft, previousRightWorld);
      const isCandidate = costWithCrossing < costWithoutCrossing * SWAP_COST_RATIO
        && costWithoutCrossing - costWithCrossing > SWAP_MIN_GAIN;

      if (isCandidate) {
        state.candidateFrames += 1;
        candidatePairs.add(pair.id);
        if (DEBUG_SIDE_CONSISTENCY) {
          console.debug(
            `[side-consistency] ${pair.id} swap candidate`,
            {
              candidateFrames: state.candidateFrames,
              costWithoutCrossing,
              costWithCrossing,
            },
          );
        }
        return;
      }

      state.candidateFrames = 0;
      this.updatePreviousAcceptedWorld(pair, state, leftWorld, rightWorld);
    });

    const confirmedAnchor = SIDE_PAIRS.some((pair) => {
      const state = this.states.get(pair.id);
      return Boolean(
        state
        && candidatePairs.has(pair.id)
        && state.candidateFrames >= confirmFrames
        && (pair.id === 'shoulders' || pair.id === 'hips'),
      );
    });

    if (confirmedAnchor) {
      SIDE_PAIRS.forEach((pair) => {
        const state = this.states.get(pair.id);
        if (!state) return;
        state.swapped = !state.swapped;
        state.candidateFrames = 0;
        this.lastConfirmedSwaps.push({
          pairId: pair.id,
          left: pair.left,
          right: pair.right,
        });
      });
      if (DEBUG_SIDE_CONSISTENCY) {
        console.debug('[side-consistency] body-wide swap confirmed', {
          pairs: SIDE_PAIRS.map((pair) => pair.id),
        });
      }
    } else {
      SIDE_PAIRS.forEach((pair) => {
        const state = this.states.get(pair.id);
        if (!state || !candidatePairs.has(pair.id)) return;
        if (state.candidateFrames < confirmFrames) return;
        state.swapped = !state.swapped;
        state.candidateFrames = 0;
        this.lastConfirmedSwaps.push({
          pairId: pair.id,
          left: pair.left,
          right: pair.right,
        });
        if (DEBUG_SIDE_CONSISTENCY) {
          console.debug(`[side-consistency] ${pair.id} swap confirmed`);
        }
      });
    }

    const confirmedPairIds = new Set(
      this.lastConfirmedSwaps.map((swap) => swap.pairId),
    );
    const keypoints = [...pose.keypoints];
    const worldLandmarks = [...pose.worldLandmarks];
    SIDE_PAIRS.forEach((pair) => {
      const state = this.states.get(pair.id);
      if (!state) return;

      const leftPoint = pose.keypoints[pair.left];
      const rightPoint = pose.keypoints[pair.right];
      const leftWorldPoint = pose.worldLandmarks[pair.left];
      const rightWorldPoint = pose.worldLandmarks[pair.right];
      if (state.swapped) {
        keypoints[pair.left] = markSwapped(rightPoint);
        keypoints[pair.right] = markSwapped(leftPoint);
        worldLandmarks[pair.left] = markSwapped(rightWorldPoint);
        worldLandmarks[pair.right] = markSwapped(leftWorldPoint);
      } else {
        keypoints[pair.left] = markUnswapped(leftPoint);
        keypoints[pair.right] = markUnswapped(rightPoint);
        worldLandmarks[pair.left] = markUnswapped(leftWorldPoint);
        worldLandmarks[pair.right] = markUnswapped(rightWorldPoint);
      }
    });

    SIDE_PAIRS.forEach((pair) => {
      const state = this.states.get(pair.id);
      const leftWorld = getWorldCoordinates(
        keypoints[pair.left],
        worldLandmarks[pair.left],
      );
      const rightWorld = getWorldCoordinates(
        keypoints[pair.right],
        worldLandmarks[pair.right],
      );
      if (
        state
        && (!candidatePairs.has(pair.id) || confirmedPairIds.has(pair.id))
        && leftWorld
        && rightWorld
      ) {
        this.previousAcceptedWorld.set(pair.left, leftWorld);
        this.previousAcceptedWorld.set(pair.right, rightWorld);
      }
    });

    return {
      ...pose,
      keypoints,
      worldLandmarks,
    };
  }

  getLastConfirmedSwaps() {
    return this.lastConfirmedSwaps;
  }

  markPoseMissing() {
    this.missingPoseFrames += 1;
    if (this.missingPoseFrames > POSE_MISSING_RESET_FRAMES) {
      this.reset();
    }
  }

  reset() {
    this.states.forEach((state) => {
      state.swapped = false;
      state.candidateFrames = 0;
    });
    this.previousAcceptedWorld.clear();
    this.lastConfirmedSwaps = [];
    this.missingPoseFrames = 0;
  }

  private updatePreviousAcceptedWorld(
    pair: SidePairDefinition,
    state: SidePairState,
    leftWorld: WorldCoordinate,
    rightWorld: WorldCoordinate,
  ) {
    const acceptedLeft = state.swapped ? rightWorld : leftWorld;
    const acceptedRight = state.swapped ? leftWorld : rightWorld;
    this.previousAcceptedWorld.set(pair.left, acceptedLeft);
    this.previousAcceptedWorld.set(pair.right, acceptedRight);
  }
}

function markSwapped<T extends PosePoint | undefined>(point: T): T {
  return point
    ? { ...point, swapped: true }
    : point;
}

function markUnswapped<T extends PosePoint | undefined>(point: T): T {
  return point
    ? { ...point, swapped: undefined }
    : point;
}

export function createSideConsistencyFilter() {
  return new SideConsistencyFilter();
}
