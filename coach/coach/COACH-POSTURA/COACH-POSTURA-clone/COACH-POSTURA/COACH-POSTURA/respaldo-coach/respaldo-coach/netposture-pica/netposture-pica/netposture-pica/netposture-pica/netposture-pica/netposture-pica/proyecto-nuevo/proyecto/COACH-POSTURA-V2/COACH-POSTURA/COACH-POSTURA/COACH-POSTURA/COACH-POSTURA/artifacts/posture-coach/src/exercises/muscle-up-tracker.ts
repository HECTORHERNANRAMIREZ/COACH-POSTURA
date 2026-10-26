import { CAMERA_POINT_MIN_SCORE, HEAD_LANDMARK_INDICES } from '@/constants/base';
import {
  MUSCLE_UP_PULLUP_BAR_DETACH_MIN_SHOULDER_MARGIN_PX,
  MUSCLE_UP_PULLUP_BAR_DETACH_SHOULDER_MARGIN_RATIO,
  MUSCLE_UP_PULLUP_TOLERANCE_DEG,
  MUSCLE_UP_PULLUP_TRACKER_CONFIG,
} from '@/constants/muscle-up-pullup';
import { MUSCLE_UP_PULLUP_SIDE_KEYPOINTS } from '@/constants/side-keypoints';
import { isWithinAngle } from '@/exercises/angle-checks';
import {
  calculateAngle,
  hasWorldCoordinates,
  isHeldPoint,
} from '@/exercises/point-geometry';
import { median } from '@/exercises/pullup-tracker';
import type { PosePoint } from '@/pose3d';
import type {
  MuscleUpPullupExtremityValidation,
  MuscleUpPullupRepVerdict,
  MuscleUpPullupTracker,
  MuscleUpPullupTrackerConfig,
  MuscleUpPullupTrackerUpdate,
  PoseSide,
} from '@/types/tracking';

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

export function hasFreshMuscleUpPullupMeasurement(keypoints: PosePoint[] | undefined) {
  if (!keypoints) return false;
  const measurementSides = getMuscleUpPullupMeasurementSides(keypoints);
  const freshHeadPoints = HEAD_LANDMARK_INDICES.filter((index) => (
    isFreshMuscleUpPullupMeasurementPoint(keypoints[index])
  )).length;
  return measurementSides.length > 0
    && measurementSides.every((side) => {
      const indexes = MUSCLE_UP_PULLUP_SIDE_KEYPOINTS[side];
      return [
        keypoints[indexes.shoulder],
        keypoints[indexes.elbow],
        keypoints[indexes.hip],
      ].every((point) => isFreshMuscleUpPullupMeasurementPoint(point))
        && isFreshMuscleUpPullupMeasurementPoint(keypoints[indexes.wrist], true);
    })
    && freshHeadPoints >= 2;
}

export function getFreshMuscleUpPullupTorsoLengthPx(
  keypoints: PosePoint[] | undefined,
  measurementSides: PoseSide[],
) {
  if (!keypoints || measurementSides.length === 0) return null;
  const torsoLengths = measurementSides.flatMap((side) => {
    const indexes = MUSCLE_UP_PULLUP_SIDE_KEYPOINTS[side];
    const shoulder = keypoints[indexes.shoulder];
    const hip = keypoints[indexes.hip];
    if (
      !isFreshMuscleUpPullupMeasurementPoint(shoulder)
      || !isFreshMuscleUpPullupMeasurementPoint(hip)
      || !Number.isFinite(shoulder.x)
      || !Number.isFinite(shoulder.y)
      || !Number.isFinite(hip.x)
      || !Number.isFinite(hip.y)
    ) {
      return [];
    }
    const torsoLengthPx = Math.hypot(shoulder.x - hip.x, shoulder.y - hip.y);
    return Number.isFinite(torsoLengthPx) && torsoLengthPx > 0
      ? [torsoLengthPx]
      : [];
  });
  return torsoLengths.length > 0
    ? torsoLengths.reduce((sum, length) => sum + length, 0) / torsoLengths.length
    : null;
}

export function hasOnlyUnavailableMuscleUpPullupElbow(
  keypoints: PosePoint[] | undefined,
  tracker: MuscleUpPullupTracker,
) {
  if (!keypoints) return false;
  const measurementSides = getMuscleUpPullupMeasurementSides(keypoints);
  const nose = keypoints[0];
  const freshHeadPoints = HEAD_LANDMARK_INDICES.filter((index) => (
    isFreshMuscleUpPullupMeasurementPoint(keypoints[index])
  )).length;
  const hasUsableNose = isFreshMuscleUpPullupMeasurementPoint(nose)
    && Number.isFinite(nose.x)
    && Number.isFinite(nose.y);

  return measurementSides.length > 0
    && hasUsableNose
    && freshHeadPoints >= 2
    && measurementSides.every((side) => {
      const indexes = MUSCLE_UP_PULLUP_SIDE_KEYPOINTS[side];
      const shoulder = keypoints[indexes.shoulder];
      const elbow = keypoints[indexes.elbow];
      const wrist = keypoints[indexes.wrist];
      const hip = keypoints[indexes.hip];
      const hasUsableTorso = isFreshMuscleUpPullupMeasurementPoint(shoulder)
        && isFreshMuscleUpPullupMeasurementPoint(hip)
        && Number.isFinite(shoulder.x)
        && Number.isFinite(shoulder.y)
        && Number.isFinite(hip.x)
        && Number.isFinite(hip.y)
        && Math.hypot(shoulder.x - hip.x, shoulder.y - hip.y) > 0;
      const hasCachedTorso = tracker.lastHangingTorsoLengthPx !== null
        && Number.isFinite(tracker.lastHangingTorsoLengthPx)
        && tracker.lastHangingTorsoLengthPx > 0;
      return isFreshMuscleUpPullupMeasurementPoint(shoulder)
        && Number.isFinite(shoulder.x)
        && Number.isFinite(shoulder.y)
        && isFreshMuscleUpPullupMeasurementPoint(wrist)
        && Number.isFinite(wrist.x)
        && Number.isFinite(wrist.y)
        && !isFreshMuscleUpPullupMeasurementPoint(elbow)
        // La cadera solo aporta la escala del margen; si falta, se usa la
        // última longitud válida tomada al confirmar el colgado.
        && (hasUsableTorso || hasCachedTorso);
    });
}

export function calculateMuscleUpPullupElbowAngles(keypoints: PosePoint[] | undefined) {
  if (!keypoints) return { left: null, right: null, averagedRawAngle: null };
  const getSideAngle = (side: PoseSide) => calculateAngle(
    keypoints[MUSCLE_UP_PULLUP_SIDE_KEYPOINTS[side].shoulder],
    keypoints[MUSCLE_UP_PULLUP_SIDE_KEYPOINTS[side].elbow],
    keypoints[MUSCLE_UP_PULLUP_SIDE_KEYPOINTS[side].wrist],
  );
  const left = getSideAngle('left');
  const right = getSideAngle('right');
  const measurementSides = getMuscleUpPullupMeasurementSides(keypoints);
  const averagedRawAngle = measurementSides.length === 2
    ? left !== null && right !== null
      ? Math.round((left + right) / 2)
      : null
    : measurementSides.length === 1
      ? measurementSides[0] === 'left' ? left : right
      : null;
  return {
    left,
    right,
    averagedRawAngle,
  };
}

export function getMuscleUpPullupHeadOverWrists(
  keypoints: PosePoint[] | undefined,
  measurementSides: PoseSide[],
): boolean | null {
  const headPoints = HEAD_LANDMARK_INDICES
    .map((index) => keypoints?.[index])
    .filter((point): point is PosePoint => (point?.score ?? 0) >= 0.2);
  const wrists = measurementSides
    .map((side) => keypoints?.[MUSCLE_UP_PULLUP_SIDE_KEYPOINTS[side].wrist]);
  if (
    headPoints.length < 2
    || measurementSides.length === 0
    || wrists.some((wrist) => (wrist?.score ?? 0) < 0.2)
  ) return null;
  const headCenterY = headPoints.reduce((sum, point) => sum + point.y, 0) / headPoints.length;
  const averageWristY = wrists.reduce((sum, wrist) => sum + (wrist?.y ?? 0), 0) / wrists.length;
  return headCenterY < averageWristY;
}

export function getMuscleUpPullupExtremityReadings(keypoints: PosePoint[] | undefined) {
  const readSide = (side: PoseSide) => {
    if (!keypoints) return { shoulder: null, elbow: null };
    const indexes = MUSCLE_UP_PULLUP_SIDE_KEYPOINTS[side];
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
  return { left: readSide('left'), right: readSide('right') };
}

export function getMuscleUpPullupExtremityValidation(
  readings: ReturnType<typeof getMuscleUpPullupExtremityReadings>,
  evaluatedSides: PoseSide[] = ['left', 'right'],
): MuscleUpPullupExtremityValidation {
  const allElbowsInRange = (min: number, max: number) => (
    evaluatedSides.length > 0 && evaluatedSides.every((side) => (
      readings[side].elbow !== null
      && isWithinMuscleUpPullupAngle(readings[side].elbow!, min, max)
    ))
  );
  return {
    atBottom: allElbowsInRange(
      MUSCLE_UP_PULLUP_TRACKER_CONFIG.bottomMinAngle,
      MUSCLE_UP_PULLUP_TRACKER_CONFIG.bottomMaxAngle,
    ),
    atTop: allElbowsInRange(
      MUSCLE_UP_PULLUP_TRACKER_CONFIG.topElbowMinAngle,
      MUSCLE_UP_PULLUP_TRACKER_CONFIG.topElbowMaxAngle,
    ),
  };
}

export function isMuscleUpPullupBarDetached(keypoints: PosePoint[] | undefined) {
  if (!keypoints) return false;
  const nose = keypoints[0];
  const leftWrist = keypoints[MUSCLE_UP_PULLUP_SIDE_KEYPOINTS.left.wrist];
  const rightWrist = keypoints[MUSCLE_UP_PULLUP_SIDE_KEYPOINTS.right.wrist];
  const leftShoulder = keypoints[MUSCLE_UP_PULLUP_SIDE_KEYPOINTS.left.shoulder];
  const rightShoulder = keypoints[MUSCLE_UP_PULLUP_SIDE_KEYPOINTS.right.shoulder];
  const requiredPoints = [nose, leftWrist, rightWrist, leftShoulder, rightShoulder];
  if (requiredPoints.some((point) => (point?.score ?? 0) < 0.2)) return false;
  const shoulderSpan = Math.abs(leftShoulder!.x - rightShoulder!.x);
  const shoulderDropMargin = Math.max(
    MUSCLE_UP_PULLUP_BAR_DETACH_MIN_SHOULDER_MARGIN_PX,
    shoulderSpan * MUSCLE_UP_PULLUP_BAR_DETACH_SHOULDER_MARGIN_RATIO,
  );
  return leftWrist!.y > leftShoulder!.y + shoulderDropMargin
    && rightWrist!.y > rightShoulder!.y + shoulderDropMargin
    && leftWrist!.y > nose!.y
    && rightWrist!.y > nose!.y;
}

export function settlePendingMuscleUpPullupRep(
  tracker: MuscleUpPullupTracker,
  options: { bottomReached: boolean; sessionEnded?: boolean; noLockout?: boolean },
): { tracker: MuscleUpPullupTracker; verdict: MuscleUpPullupRepVerdict | null } {
  if (tracker.pendingRepHeadOverWrists === null) return { tracker, verdict: null };
  const headFramesEvaluated = tracker.pendingRepHeadFramesEvaluated;
  const headFramesYes = tracker.pendingRepHeadFramesYes;
  const headOverWrists = headFramesYes > 0;
  const correct = !options.noLockout
    && headOverWrists
    && options.bottomReached;
  const reason = options.noLockout
    ? 'no-lockout'
    : !headOverWrists
      ? 'no-top-cabeza'
      : options.bottomReached
        ? 'ok'
        : 'no-fondo';
  const nextTracker: MuscleUpPullupTracker = {
    ...tracker,
    pendingRepHeadOverWrists: null,
    pendingRepHeadFramesEvaluated: 0,
    pendingRepHeadFramesYes: 0,
    currentRepCorrect: correct,
    goodRepetitions: tracker.goodRepetitions + (correct ? 1 : 0),
    incorrectRepetitions: tracker.incorrectRepetitions + (correct ? 0 : 1),
    event: options.noLockout ? 'no-lockout' : correct ? 'valid' : 'invalid',
  };
  if (!correct && reason !== 'ok') {
    nextTracker.lastIncorrectReason = reason;
  }
  return {
    tracker: nextTracker,
    verdict: {
      repetition: tracker.repetitions,
      headOverWrists,
      headFramesEvaluated,
      headFramesYes,
      bottomReached: options.bottomReached,
      correct,
      reason,
    },
  };
}

export function advanceMuscleUpPullupTracker(
  tracker: MuscleUpPullupTracker,
  rawAngle: number,
  topReached: boolean,
  headOverWrists: boolean | null,
  extremities: MuscleUpPullupExtremityValidation,
  gripped: boolean,
  config: MuscleUpPullupTrackerConfig,
  torsoLengthPx: number | null = null,
  bodyRiseSignalActive = false,
  recentMinimumRawAngle: number | null = null,
  shoulderRisingThisFrame = false,
  rearmBlocked = false,
  noTopCountAllowed = false,
): MuscleUpPullupTrackerUpdate {
  const samples = [...tracker.samples, rawAngle].slice(-config.smoothingSamples);
  const smoothedAngle = median(samples);
  if (smoothedAngle === null) {
    return {
      tracker,
      smoothedAngle: rawAngle,
      completedMinimumAngle: null,
      isAtBottom: false,
      hasReachedTop: false,
      verdict: null,
    };
  }
  let nextTracker: MuscleUpPullupTracker = {
    ...tracker,
    samples,
    event: null,
    lastAngle: smoothedAngle,
  };
  const isAtBottom = extremities.atBottom
    && isWithinMuscleUpPullupAngle(smoothedAngle, config.bottomMinAngle, config.bottomMaxAngle);
  const isAtBottomByAngle = isWithinMuscleUpPullupAngle(
    smoothedAngle,
    config.bottomMinAngle,
    config.bottomMaxAngle,
  );
  const hasStartedPull = recentMinimumRawAngle !== null
    && recentMinimumRawAngle <= config.pullActivationAngle;
  const hasReachedTop = topReached;
  const isRising = tracker.lastAngle !== null
    && smoothedAngle < tracker.lastAngle - config.risingDeltaDeg;
  let completedMinimumAngle: number | null = null;
  let verdict: MuscleUpPullupRepVerdict | null = null;
  if (isAtBottom) {
    if (torsoLengthPx !== null && Number.isFinite(torsoLengthPx) && torsoLengthPx > 0) {
      nextTracker.lastHangingTorsoLengthPx = torsoLengthPx;
    }
  }
  if (isAtBottom) nextTracker.suppressNextRepCountUntilBottom = false;
  if (tracker.phase !== 'subiendo') {
    nextTracker.topConfirmationHeadFramesEvaluated = 0;
    nextTracker.topConfirmationHeadFramesYes = 0;
  }
  if (!nextTracker.isArmed) {
    nextTracker.bottomReadyFrames = isAtBottom && gripped
      ? tracker.bottomReadyFrames + 1
      : 0;
    if (nextTracker.bottomReadyFrames >= config.bottomStableFrames) {
      nextTracker.isArmed = true;
      nextTracker.bottomReadyFrames = 0;
      nextTracker.phase = 'abajo';
      nextTracker.currentRepCorrect = true;
      nextTracker.minimumAngle = null;
      nextTracker.confirmedHangingPosition = headOverWrists === false;
    }
    return {
      tracker: nextTracker,
      smoothedAngle,
      completedMinimumAngle,
      isAtBottom,
      hasReachedTop,
      verdict,
    };
  }
  if (nextTracker.phase === 'esperando abajo') {
    if (isAtBottom) {
      nextTracker.phase = 'abajo';
      nextTracker.currentRepCorrect = true;
    }
  } else if (nextTracker.phase === 'abajo') {
    if (isAtBottom) {
      nextTracker.currentRepCorrect = true;
      if (headOverWrists === false) {
        nextTracker.confirmedHangingPosition = true;
      }
    }
    if (
      hasStartedPull
      && bodyRiseSignalActive
      && shoulderRisingThisFrame
      && !rearmBlocked
    ) {
      nextTracker.phase = 'subiendo';
      nextTracker.minimumAngle = smoothedAngle;
    }
  } else if (nextTracker.phase === 'subiendo') {
    nextTracker.minimumAngle = nextTracker.minimumAngle === null
      ? smoothedAngle
      : Math.min(nextTracker.minimumAngle, smoothedAngle);
    nextTracker.topFrames = hasReachedTop ? nextTracker.topFrames + 1 : 0;
    if (hasReachedTop) {
      nextTracker.topConfirmationHeadFramesEvaluated += 1;
      nextTracker.topConfirmationHeadFramesYes += 1;
    } else {
      nextTracker.topConfirmationHeadFramesEvaluated = 0;
      nextTracker.topConfirmationHeadFramesYes = 0;
    }
    if (nextTracker.topFrames >= config.topConfirmationFrames) {
      nextTracker.phase = 'arriba';
      nextTracker.currentRepCorrect = nextTracker.currentRepCorrect
        && hasReachedTop
        && topReached;
      if (
        !nextTracker.suppressNextRepCountUntilBottom
        && !nextTracker.repetitionCountLockedUntilBottom
      ) {
        nextTracker.repetitions += 1;
        nextTracker.repetitionCountLockedUntilBottom = true;
        nextTracker.confirmedHangingPosition = false;
        nextTracker.pendingRepHeadFramesEvaluated =
          nextTracker.topConfirmationHeadFramesEvaluated;
        nextTracker.pendingRepHeadFramesYes =
          nextTracker.topConfirmationHeadFramesYes;
        nextTracker.pendingRepHeadOverWrists =
          nextTracker.pendingRepHeadFramesYes > 0;
      } else {
        nextTracker.currentRepCorrect = false;
        nextTracker.pendingRepHeadOverWrists = null;
        nextTracker.pendingRepHeadFramesEvaluated = 0;
        nextTracker.pendingRepHeadFramesYes = 0;
      }
      nextTracker.topConfirmationHeadFramesEvaluated = 0;
      nextTracker.topConfirmationHeadFramesYes = 0;
      nextTracker.event = nextTracker.currentRepCorrect ? 'valid' : 'invalid';
      completedMinimumAngle = nextTracker.minimumAngle;
    } else if (isAtBottomByAngle) {
      nextTracker.phase = 'abajo';
      nextTracker.event = 'no-top';
      if (nextTracker.pendingRepHeadOverWrists === null) {
        if (noTopCountAllowed) {
          nextTracker.repetitions += 1;
          nextTracker.incorrectRepetitions += 1;
          nextTracker.lastIncorrectReason = 'no-top';
        }
      }
      nextTracker.currentRepCorrect = isAtBottom;
      nextTracker.topConfirmationHeadFramesEvaluated = 0;
      nextTracker.topConfirmationHeadFramesYes = 0;
      completedMinimumAngle = nextTracker.minimumAngle;
    }
  } else if (nextTracker.phase === 'arriba') {
    nextTracker.topFrames = 0;
    if (nextTracker.pendingRepHeadOverWrists !== null) {
      if (topReached) {
        nextTracker.pendingRepHeadFramesEvaluated += 1;
        nextTracker.pendingRepHeadFramesYes += 1;
      }
      nextTracker.pendingRepHeadOverWrists =
        nextTracker.pendingRepHeadFramesYes > 0;
    }
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
    } else if (isRising && smoothedAngle < config.noLockoutAngle) {
      nextTracker.phase = 'esperando abajo';
      nextTracker.event = 'no-lockout';
      if (nextTracker.pendingRepHeadOverWrists !== null) {
        nextTracker.suppressNextRepCountUntilBottom = true;
      }
      nextTracker.currentRepCorrect = false;
      completedMinimumAngle = nextTracker.minimumAngle;
    }
  }
  if (
    nextTracker.pendingRepHeadOverWrists !== null
    && nextTracker.event === 'no-lockout'
  ) {
    const settled = settlePendingMuscleUpPullupRep(nextTracker, {
      bottomReached: false,
      noLockout: true,
    });
    nextTracker = settled.tracker;
    verdict = settled.verdict;
    nextTracker.suppressNextRepCountUntilBottom = true;
  } else if (
    nextTracker.pendingRepHeadOverWrists !== null
    && isAtBottom
  ) {
    const settled = settlePendingMuscleUpPullupRep(nextTracker, {
      bottomReached: true,
    });
    nextTracker = settled.tracker;
    verdict = settled.verdict;
  } else if (
    nextTracker.pendingRepHeadOverWrists !== null
    && nextTracker.phase === 'subiendo'
    && isRising
    && smoothedAngle < config.noLockoutAngle
  ) {
    const settled = settlePendingMuscleUpPullupRep(nextTracker, {
      bottomReached: false,
      noLockout: true,
    });
    nextTracker = settled.tracker;
    verdict = settled.verdict;
    nextTracker.suppressNextRepCountUntilBottom = true;
  }
  if (tracker.phase !== 'abajo' && nextTracker.phase === 'abajo') {
    nextTracker.repetitionCountLockedUntilBottom = false;
    nextTracker.positionalTopFrames = 0;
    nextTracker.confirmedHangingPosition = headOverWrists === false && isAtBottom;
  }
  if (nextTracker.phase !== 'abajo') {
    nextTracker.positionalTopFrames = 0;
  }
  return {
    tracker: nextTracker,
    smoothedAngle,
    completedMinimumAngle,
    isAtBottom,
    hasReachedTop,
    verdict,
  };
}
