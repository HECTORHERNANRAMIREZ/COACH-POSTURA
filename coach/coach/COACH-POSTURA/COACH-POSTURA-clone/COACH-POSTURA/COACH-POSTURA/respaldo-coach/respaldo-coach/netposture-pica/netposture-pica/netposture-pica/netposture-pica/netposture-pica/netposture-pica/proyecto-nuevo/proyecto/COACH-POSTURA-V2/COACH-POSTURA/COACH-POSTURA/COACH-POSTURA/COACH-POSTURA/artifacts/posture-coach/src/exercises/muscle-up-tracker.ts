import { CAMERA_POINT_MIN_SCORE, HEAD_LANDMARK_INDICES } from '@/constants/base';
import { MUSCLE_UP_PULLUP_TOLERANCE_DEG } from '@/constants/muscle-up-pullup';
import { MUSCLE_UP_PULLUP_SIDE_KEYPOINTS } from '@/constants/side-keypoints';
import { isWithinAngle } from '@/exercises/angle-checks';
import { hasWorldCoordinates, isHeldPoint } from '@/exercises/point-geometry';
import type { PosePoint } from '@/pose3d';
import type { MuscleUpPullupTracker, PoseSide } from '@/types/tracking';

export function createMuscleUpPullupTracker(): MuscleUpPullupTracker {
  return {
    phase: 'esperando abajo',
    repetitions: 0,
    goodRepetitions: 0,
    incorrectRepetitions: 0,
    lastIncorrectReason: null,
    minimumAngle: null,
    samples: [],
    event: null,
    lastAngle: null,
    topFrames: 0,
    currentRepCorrect: false,
    bottomReadyFrames: 0,
    isArmed: false,
    pendingRepHeadOverWrists: null,
    topConfirmationHeadFramesEvaluated: 0,
    topConfirmationHeadFramesYes: 0,
    pendingRepHeadFramesEvaluated: 0,
    pendingRepHeadFramesYes: 0,
    suppressNextRepCountUntilBottom: false,
    repetitionCountLockedUntilBottom: false,
    confirmedHangingPosition: false,
    positionalTopFrames: 0,
    lastHangingTorsoLengthPx: null,
  };
}

export function isWithinMuscleUpPullupAngle(
  angle: number,
  min: number,
  max: number,
  tolerance = MUSCLE_UP_PULLUP_TOLERANCE_DEG,
) {
  return isWithinAngle(
    angle,
    Math.max(0, min - tolerance),
    Math.min(180, max + tolerance),
  );
}

export function isRetainedLowScoreMuscleUpWristPoint(point: PosePoint | undefined) {
  return Boolean(
    point
    && point.held
    && point.heldReason === 'low-score'
    && Number.isFinite(point.x)
    && Number.isFinite(point.y),
  );
}

export function isFreshMuscleUpPullupCalibrationPoint(
  point: PosePoint | undefined,
  allowRetainedLowScoreWrist = false,
) {
  return Boolean(
    isFreshMuscleUpPullupMeasurementPoint(point, allowRetainedLowScoreWrist)
    && hasWorldCoordinates(point),
  );
}

export function isFreshMuscleUpPullupMeasurementPoint(
  point: PosePoint | undefined,
  allowRetainedLowScoreWrist = false,
) {
  return Boolean(
    point
    && (
      (allowRetainedLowScoreWrist && isRetainedLowScoreMuscleUpWristPoint(point))
      || (
        !isHeldPoint(point)
        && (point.score ?? 0) >= CAMERA_POINT_MIN_SCORE
      )
    ),
  );
}

export function getMuscleUpPullupMeasurementSides(
  keypoints: PosePoint[] | undefined,
): PoseSide[] {
  if (!keypoints) return [];

  const candidates = (['left', 'right'] as PoseSide[]).map((side) => {
    const indexes = MUSCLE_UP_PULLUP_SIDE_KEYPOINTS[side];
    const points = [
      keypoints[indexes.shoulder],
      keypoints[indexes.elbow],
      keypoints[indexes.wrist],
      keypoints[indexes.hip],
    ];
    const nonWristPoints = [
      keypoints[indexes.shoulder],
      keypoints[indexes.elbow],
      keypoints[indexes.hip],
    ];
    return {
      side,
      averageConfidence: points.reduce(
        (sum, point) => sum + (point?.score ?? 0),
        0,
      ) / points.length,
      reliable: nonWristPoints.every((point) => (
        isFreshMuscleUpPullupMeasurementPoint(point)
      ))
        && isFreshMuscleUpPullupMeasurementPoint(keypoints[indexes.wrist], true),
    };
  });
  const reliableSides = candidates.filter(({ reliable }) => reliable);
  if (reliableSides.length === 2) {
    return reliableSides.map(({ side }) => side);
  }

  const mostConfidentSide = candidates.reduce((best, candidate) => (
    candidate.averageConfidence > best.averageConfidence ? candidate : best
  ));
  return [mostConfidentSide.side];
}

export function getMuscleUpPullupHeadPointIndexes(keypoints: PosePoint[] | undefined) {
  return [...HEAD_LANDMARK_INDICES]
    .sort((firstIndex, secondIndex) => {
      const firstPoint = keypoints?.[firstIndex];
      const secondPoint = keypoints?.[secondIndex];
      const firstIsFresh = isFreshMuscleUpPullupMeasurementPoint(firstPoint);
      const secondIsFresh = isFreshMuscleUpPullupMeasurementPoint(secondPoint);
      if (firstIsFresh !== secondIsFresh) return firstIsFresh ? -1 : 1;
      return (secondPoint?.score ?? 0) - (firstPoint?.score ?? 0);
    })
    .slice(0, 2);
}

export function getMuscleUpPullupCalibrationPoints(keypoints: PosePoint[] | undefined) {
  if (!keypoints) return [];
  const headPoints = getMuscleUpPullupHeadPointIndexes(keypoints).map((index, pointIndex) => ({
    label: `cabeza ${pointIndex + 1}`,
    name: index === 0 ? 'nariz' : 'oreja',
    side: index === 7 ? 'izquierda' : index === 8 ? 'derecha' : 'centro',
    point: keypoints[index],
  }));
  const bodyPoints = getMuscleUpPullupMeasurementSides(keypoints).flatMap((side) => {
    const indexes = MUSCLE_UP_PULLUP_SIDE_KEYPOINTS[side];
    const sideLabel = side === 'left' ? 'izquierda' : 'derecha';
    return [
      {
        label: `hombro ${sideLabel}`,
        name: 'hombro',
        side: sideLabel,
        point: keypoints[indexes.shoulder],
      },
      {
        label: `codo ${sideLabel}`,
        name: 'codo',
        side: sideLabel,
        point: keypoints[indexes.elbow],
      },
      {
        label: `muñeca ${sideLabel}`,
        name: 'muñeca',
        side: sideLabel,
        point: keypoints[indexes.wrist],
      },
      {
        label: `cadera ${sideLabel}`,
        name: 'cadera',
        side: sideLabel,
        point: keypoints[indexes.hip],
      },
    ];
  });
  return [...headPoints, ...bodyPoints];
}

export function getMuscleUpCalibrationPointInvalidReason(point: PosePoint | undefined) {
  if (!point) return 'ausente';
  if (point.heldReason === 'low-score') return 'retenido por low-score';
  if (point.heldReason === 'bone-length') return 'bone-length';
  if (isHeldPoint(point)) return `retenido por ${point.heldReason ?? 'filtro'}`;
  if ((point.score ?? 0) < CAMERA_POINT_MIN_SCORE) return 'low-score';
  if (!hasWorldCoordinates(point)) return 'sin coordenadas 3D';
  return 'no fresco';
}
