import { ANGLE_DISPLAY_SAMPLES } from '@/constants/base';
import {
  PULLUP_MIN_SHOULDER_RISE_RATIO,
  STANDARD_PULLUP_TRACKER_CONFIG,
} from '@/constants/pullup';
import { sideKeypoints } from '@/constants/side-keypoints';
import { isCommandPullup, isStandardOrSupinePullup } from '@/exercises/guards';
import { isWithinPullupAngle } from '@/exercises/angle-checks';
import { calculateAngle } from '@/exercises/point-geometry';
import type { PosePoint } from '@/pose3d';
import type {
  ExerciseId,
  MuscleUpPullupRepVerdict,
  MuscleUpPullupTracker,
  PullupPendingAngleJumpFrame,
  PoseSide,
  PullupTracker,
  PullupTrackerConfig,
  TechniqueFeedback,
} from '@/types/tracking';
import type {
  PullupDiscardedAngleJumpFrame,
  PullupExtremityReadings,
  PullupExtremityValidation,
  PullupElevationDecisionLabel,
  PullupRepVerdict,
  PullupTrackerUpdate,
} from '@/types/pullup';

export function createPullupTracker(): PullupTracker {
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
    pendingRepHeadOverWrists: null,
    topConfirmationHeadFramesEvaluated: 0,
    topConfirmationHeadFramesYes: 0,
    pendingRepHeadFramesEvaluated: 0,
    pendingRepHeadFramesYes: 0,
    headWindowActive: false,
    headWindowStartVideoTime: null,
    suppressNextRepCountUntilBottom: false,
    hasBottomSinceLastTop: false,
    hasConfirmedTop: false,
    shoulderYAtLastBottom: null,
    shoulderYMinSinceBottom: null,
    shoulderSpanPxAtLastBottom: null,
    videoCurrentTimeAtLastBottom: null,
    lastAcceptedRawAngle: null,
    pendingAngleJumpFrame: null,
  };
}

export function median(values: number[]) {
  const sorted = [...values].sort((first, second) => first - second);
  return sorted[Math.floor(sorted.length / 2)] ?? null;
}

function getPullupShoulderRiseMeasurement(tracker: PullupTracker) {
  const shoulderRise = tracker.shoulderYAtLastBottom !== null
    && Number.isFinite(tracker.shoulderYAtLastBottom)
    && tracker.shoulderYMinSinceBottom !== null
    && Number.isFinite(tracker.shoulderYMinSinceBottom)
    ? tracker.shoulderYAtLastBottom - tracker.shoulderYMinSinceBottom
    : null;
  const shoulderSpanPx = tracker.shoulderSpanPxAtLastBottom;
  const shoulderRiseRatio = shoulderRise !== null
    && shoulderSpanPx !== null
    && Number.isFinite(shoulderSpanPx)
    && shoulderSpanPx > 0
    ? shoulderRise / shoulderSpanPx
    : null;

  return { shoulderRise, shoulderRiseRatio, shoulderSpanPx };
}

function createPullupElevationDecision(
  tracker: PullupTracker,
  decision: PullupElevationDecisionLabel,
  videoCurrentTime: number | null,
): NonNullable<PullupTrackerUpdate['elevationDecision']> {
  const veredictoCabeza = getPullupHeadWindowVerdict(tracker, videoCurrentTime) ?? {
    correct: false,
    reason: 'no-top-cabeza' as const,
    headFramesEvaluated: tracker.topConfirmationHeadFramesEvaluated,
    headFramesYes: tracker.topConfirmationHeadFramesYes,
    videoCurrentTimeStart: tracker.headWindowStartVideoTime,
    videoCurrentTimeEnd: (
      videoCurrentTime !== null && Number.isFinite(videoCurrentTime)
        ? videoCurrentTime
        : null
    ),
  };
  return {
    decision,
    ...getPullupShoulderRiseMeasurement(tracker),
    shoulderYAtLastBottom: tracker.shoulderYAtLastBottom,
    shoulderYMinSinceBottom: tracker.shoulderYMinSinceBottom,
    videoCurrentTimeAtLastBottom: tracker.videoCurrentTimeAtLastBottom,
    headWindowStartVideoTime: tracker.headWindowStartVideoTime,
    veredictoCabeza,
    videoCurrentTimeAtDecision: (
      videoCurrentTime !== null && Number.isFinite(videoCurrentTime)
        ? videoCurrentTime
        : null
    ),
  };
}

export function smoothAngleReading(
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

export function getPullupExtremityReadings(
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

export function getPullupExtremityValidation(
  keypoints: PosePoint[] | undefined,
  extremityReadings = getPullupExtremityReadings(keypoints),
  side: PoseSide | null = null,
  config: PullupTrackerConfig = STANDARD_PULLUP_TRACKER_CONFIG,
): PullupExtremityValidation {
  const allElbowsInRange = (min: number, max: number) => (
    (side ? [extremityReadings[side]] : [extremityReadings.left, extremityReadings.right]).every((reading) => {
      const value = reading.elbow;
      return value !== null && isWithinPullupAngle(value, min, max);
    })
  );

  return {
    atBottom: allElbowsInRange(config.bottomMinAngle, config.bottomMaxAngle),
    atTop: allElbowsInRange(config.topElbowMinAngle, config.topElbowMaxAngle),
  };
}

function getPullupHeadWindowVerdict(
  tracker: PullupTracker,
  videoCurrentTime: number | null,
) {
  if (!tracker.headWindowActive) return undefined;
  const headFramesYes = tracker.topConfirmationHeadFramesYes;
  return {
    correct: headFramesYes > 0,
    reason: headFramesYes > 0 ? 'ok' as const : 'no-top-cabeza' as const,
    headFramesEvaluated: tracker.topConfirmationHeadFramesEvaluated,
    headFramesYes,
    videoCurrentTimeStart: tracker.headWindowStartVideoTime,
    videoCurrentTimeEnd: (
      videoCurrentTime !== null && Number.isFinite(videoCurrentTime)
        ? videoCurrentTime
        : null
    ),
  };
}

function resetPullupHeadWindow(tracker: PullupTracker): PullupTracker {
  return {
    ...tracker,
    headWindowActive: false,
    headWindowStartVideoTime: null,
    topConfirmationHeadFramesEvaluated: 0,
    topConfirmationHeadFramesYes: 0,
  };
}

export function settlePendingPullupRep(
  tracker: PullupTracker,
  options: {
    bottomReached: boolean;
    sessionEnded?: boolean;
    noLockout?: boolean;
    videoCurrentTime?: number | null;
  },
): {
  tracker: PullupTracker;
  verdict: PullupRepVerdict | null;
  headWindowVerdict?: ReturnType<typeof getPullupHeadWindowVerdict>;
} {
  const headWindowVerdict = getPullupHeadWindowVerdict(
    tracker,
    options.videoCurrentTime ?? null,
  );
  if (tracker.pendingRepHeadOverWrists === null) {
    return {
      tracker: headWindowVerdict ? resetPullupHeadWindow(tracker) : tracker,
      verdict: null,
      headWindowVerdict,
    };
  }

  const headFramesEvaluated = headWindowVerdict?.headFramesEvaluated
    ?? tracker.pendingRepHeadFramesEvaluated;
  const headFramesYes = headWindowVerdict?.headFramesYes
    ?? tracker.pendingRepHeadFramesYes;
  const headOverWrists = headFramesYes > 0;
  const correct = !options.noLockout
    && headOverWrists
    && (options.bottomReached || options.sessionEnded === true);
  const reason = options.noLockout
    ? 'no-lockout'
    : !headOverWrists
      ? 'no-top-cabeza'
      : options.bottomReached || options.sessionEnded === true
        ? 'ok'
        : 'no-fondo';
  const nextTracker: PullupTracker = {
    ...tracker,
    pendingRepHeadOverWrists: null,
    pendingRepHeadFramesEvaluated: 0,
    pendingRepHeadFramesYes: 0,
    currentRepCorrect: correct,
    goodRepetitions: tracker.goodRepetitions + (correct ? 1 : 0),
    event: options.noLockout ? 'no-lockout' : correct ? 'valid' : 'invalid',
  };
  const closedTracker = resetPullupHeadWindow(nextTracker);

  return {
    tracker: closedTracker,
    verdict: {
      repetition: tracker.repetitions,
      headOverWrists,
      headFramesEvaluated,
      headFramesYes,
      bottomReached: options.bottomReached,
      correct,
      reason,
      headWindowStartVideoTime: headWindowVerdict?.videoCurrentTimeStart ?? null,
      headWindowEndVideoTime: headWindowVerdict?.videoCurrentTimeEnd ?? null,
    },
    headWindowVerdict,
  };
}

export function logPullupVerdict(
  exercise: ExerciseId | null | undefined,
  verdict: PullupRepVerdict,
  measuredSide: PoseSide | null = null,
) {
  if (!isStandardOrSupinePullup(exercise) && !isCommandPullup(exercise)) return;

  console.log(
    `[pullup-veredicto] ejercicio=${exercise} `
    + (isCommandPullup(exercise) && measuredSide !== null
      ? `ladoMedido=${measuredSide === 'left' ? 'izquierdo' : measuredSide === 'right' ? 'derecho' : 'no definido'} `
      : '')
    + `repeticion=${verdict.repetition} `
    + `cabezaSobreMuñecas=${verdict.headOverWrists ? 'sí' : 'no'} `
    + `cuadrosCabezaEvaluados=${verdict.headFramesEvaluated} `
    + `cuadrosCabezaSi=${verdict.headFramesYes} `
    + `bajoAlFondo=${verdict.bottomReached ? 'sí' : 'no'} `
    + `veredicto=${verdict.correct ? 'correcta' : 'incorrecta'} `
    + `motivo=${verdict.reason}`,
  );
}

export function logMuscleUpPullupVerdict(verdict: MuscleUpPullupRepVerdict) {
  console.log(
    `[pullup-veredicto] ejercicio=muscle-up `
    + `repeticion=${verdict.repetition} `
    + `cabezaSobreMuñecas=${verdict.headOverWrists ? 'sí' : 'no'} `
    + `cuadrosCabezaEvaluados=${verdict.headFramesEvaluated} `
    + `cuadrosCabezaSi=${verdict.headFramesYes} `
    + `bajoAlFondo=${verdict.bottomReached ? 'sí' : 'no'} `
    + `veredicto=${verdict.correct ? 'correcta' : 'incorrecta'} `
    + `motivo=${verdict.reason}`,
  );
}

export function getMuscleUpPullupVerdictFeedback(
  verdict: MuscleUpPullupRepVerdict,
): TechniqueFeedback {
  return {
    tone: verdict.correct ? 'success' : 'warning',
    message: `Repetición ${verdict.repetition}: ${
      verdict.correct ? 'BIEN ✓' : 'EVALUADA'
    }`,
    detail: verdict.reason === 'no-top-cabeza'
      ? 'La repetición no alcanzó la posición alta con la cabeza sobre las muñecas.'
      : verdict.reason === 'no-fondo'
        ? 'La repetición terminó sin regresar al fondo antes de soltar la barra.'
        : verdict.reason === 'no-lockout'
          ? 'La repetición no alcanzó el rango alto de los codos.'
          : verdict.correct
            ? 'Recorrido completo: posición alta validada y regreso al fondo.'
            : 'El recorrido se evaluó como incorrecto.',
  };
}

export function logMuscleUpPullupFinish(tracker: MuscleUpPullupTracker) {
  console.log(
    `[fin] ejercicio=muscle-up fase=${tracker.phase}`
    + ` | total=${tracker.repetitions}`
    + ` | correctas=${tracker.goodRepetitions}`
    + ` | incorrectas=${tracker.incorrectRepetitions}`
    + ` | motivo=${tracker.lastIncorrectReason ?? '—'}`
    + ` | pendientes=${tracker.pendingRepHeadOverWrists === null ? 0 : 1}`,
  );
}

function advancePullupTrackerFrame(
  tracker: PullupTracker,
  rawAngle: number,
  topReached: boolean,
  headOverWrists: boolean | null,
  extremities: PullupExtremityValidation,
  gripped: boolean,
  config: PullupTrackerConfig,
  shoulderAverageY: number | null = null,
  shoulderSpanPx: number | null = null,
  videoCurrentTime: number | null = null,
): PullupTrackerUpdate {
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

  let nextTracker: PullupTracker = {
    ...tracker,
    samples,
    event: null,
    lastAngle: smoothedAngle,
  };
  const isAtBottom = extremities.atBottom
    && isWithinPullupAngle(smoothedAngle, config.bottomMinAngle, config.bottomMaxAngle);
  const hasAtBottomFrame = extremities.atBottom;
  const isAtBottomByAngle = isWithinPullupAngle(
    smoothedAngle,
    config.bottomMinAngle,
    config.bottomMaxAngle,
  );
  const hasStartedPull = smoothedAngle <= config.pullActivationAngle;
  const hasReachedTop = topReached;
  const isRising = tracker.lastAngle !== null && smoothedAngle < tracker.lastAngle - 3;
  let completedMinimumAngle: number | null = null;
  let verdict: PullupRepVerdict | null = null;
  let elevationDecision: PullupTrackerUpdate['elevationDecision'];
  let headWindowVerdict: PullupTrackerUpdate['headWindowVerdict'];
  const hasShoulderY = shoulderAverageY !== null
    && Number.isFinite(shoulderAverageY);
  const isBottomPhase = tracker.phase === 'esperando abajo' || tracker.phase === 'abajo';
  const isReturningToBottom = tracker.hasConfirmedTop && !tracker.hasBottomSinceLastTop;
  if (hasAtBottomFrame) {
    nextTracker.hasBottomSinceLastTop = true;
  }
  if (hasAtBottomFrame && isBottomPhase) {
    nextTracker.shoulderYAtLastBottom = hasShoulderY ? shoulderAverageY : null;
    nextTracker.shoulderYMinSinceBottom = hasShoulderY ? shoulderAverageY : null;
    nextTracker.shoulderSpanPxAtLastBottom = (
      shoulderSpanPx !== null && Number.isFinite(shoulderSpanPx)
        ? shoulderSpanPx
        : null
    );
    nextTracker.videoCurrentTimeAtLastBottom = (
      videoCurrentTime !== null && Number.isFinite(videoCurrentTime)
        ? videoCurrentTime
        : null
    );
  } else if (hasShoulderY && nextTracker.shoulderYAtLastBottom !== null) {
    nextTracker.shoulderYMinSinceBottom = (
      nextTracker.shoulderYMinSinceBottom === null
        ? shoulderAverageY
        : Math.min(nextTracker.shoulderYMinSinceBottom, shoulderAverageY)
    );
  }
  if (hasAtBottomFrame && isBottomPhase && !isReturningToBottom) {
    nextTracker.headWindowActive = true;
    nextTracker.headWindowStartVideoTime = (
      videoCurrentTime !== null && Number.isFinite(videoCurrentTime)
        ? videoCurrentTime
        : null
    );
    nextTracker.topConfirmationHeadFramesEvaluated = 0;
    nextTracker.topConfirmationHeadFramesYes = 0;
  }
  if (nextTracker.headWindowActive && headOverWrists !== null) {
    nextTracker.topConfirmationHeadFramesEvaluated += 1;
    if (headOverWrists) {
      nextTracker.topConfirmationHeadFramesYes += 1;
    }
    if (nextTracker.pendingRepHeadOverWrists !== null) {
      nextTracker.pendingRepHeadFramesEvaluated =
        nextTracker.topConfirmationHeadFramesEvaluated;
      nextTracker.pendingRepHeadFramesYes =
        nextTracker.topConfirmationHeadFramesYes;
      nextTracker.pendingRepHeadOverWrists =
        nextTracker.pendingRepHeadFramesYes > 0;
    }
  }
  if (hasAtBottomFrame) {
    nextTracker.suppressNextRepCountUntilBottom = false;
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
      const { shoulderRise, shoulderRiseRatio, shoulderSpanPx: bottomShoulderSpanPx }
        = getPullupShoulderRiseMeasurement(nextTracker);
      const hasShoulderRiseMeasurements = shoulderRise !== null
        && shoulderRiseRatio !== null
        && bottomShoulderSpanPx !== null
        && Number.isFinite(bottomShoulderSpanPx)
        && bottomShoulderSpanPx > 0;
      const decision: PullupElevationDecisionLabel = nextTracker.hasConfirmedTop
        && !nextTracker.hasBottomSinceLastTop
        ? 'descartada-sin-regreso-abajo'
        : !nextTracker.hasBottomSinceLastTop
          ? 'descartada-sin-fase-abajo'
          : !hasShoulderRiseMeasurements
            ? 'descartada-sin-datos-hombros'
            : shoulderRiseRatio! < PULLUP_MIN_SHOULDER_RISE_RATIO
              ? 'descartada-sin-elevacion'
              : 'contada';
      elevationDecision = createPullupElevationDecision(
        nextTracker,
        decision,
        videoCurrentTime,
      );
      nextTracker.hasConfirmedTop = true;
      nextTracker.hasBottomSinceLastTop = false;
      const shoulderRiseAllowsCount = decision === 'contada';
      if (!nextTracker.suppressNextRepCountUntilBottom) {
        if (shoulderRiseAllowsCount) {
          nextTracker.repetitions += 1;
          nextTracker.pendingRepHeadFramesEvaluated =
            nextTracker.topConfirmationHeadFramesEvaluated;
          nextTracker.pendingRepHeadFramesYes =
            nextTracker.topConfirmationHeadFramesYes;
          nextTracker.pendingRepHeadOverWrists =
            nextTracker.pendingRepHeadFramesYes > 0;
        } else {
          nextTracker.currentRepCorrect = false;
        }
      } else {
        nextTracker.currentRepCorrect = false;
        nextTracker.pendingRepHeadOverWrists = null;
        nextTracker.pendingRepHeadFramesEvaluated = 0;
        nextTracker.pendingRepHeadFramesYes = 0;
      }
      nextTracker.event = shoulderRiseAllowsCount
        ? nextTracker.currentRepCorrect ? 'valid' : 'invalid'
        : null;
      completedMinimumAngle = nextTracker.minimumAngle;
    } else if (isAtBottomByAngle) {
      nextTracker.phase = 'abajo';
      nextTracker.event = 'no-top';
      nextTracker.currentRepCorrect = isAtBottom;
      completedMinimumAngle = nextTracker.minimumAngle;
      elevationDecision = createPullupElevationDecision(
        nextTracker,
        'descartada-sin-transicion-arriba',
        videoCurrentTime,
      );
      headWindowVerdict = getPullupHeadWindowVerdict(
        nextTracker,
        videoCurrentTime,
      );
      verdict = {
        repetition: nextTracker.repetitions + 1,
        headOverWrists: (headWindowVerdict?.headFramesYes ?? 0) > 0,
        headFramesEvaluated: headWindowVerdict?.headFramesEvaluated ?? 0,
        headFramesYes: headWindowVerdict?.headFramesYes ?? 0,
        bottomReached: isAtBottom,
        correct: false,
        reason: 'no-top-cabeza',
        headWindowStartVideoTime: headWindowVerdict?.videoCurrentTimeStart ?? null,
        headWindowEndVideoTime: headWindowVerdict?.videoCurrentTimeEnd ?? null,
      };
      if (headWindowVerdict) nextTracker = resetPullupHeadWindow(nextTracker);
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
    } else if (isRising && smoothedAngle < config.noLockoutAngle) {
      nextTracker.phase = 'esperando abajo';
      nextTracker.event = 'no-lockout';
      if (nextTracker.pendingRepHeadOverWrists !== null) {
        nextTracker.suppressNextRepCountUntilBottom = true;
      }
      nextTracker.currentRepCorrect = false;
      completedMinimumAngle = nextTracker.minimumAngle;
      elevationDecision = createPullupElevationDecision(
        nextTracker,
        'descartada-sin-transicion-arriba',
        videoCurrentTime,
      );
    }
  }

  if (
    nextTracker.pendingRepHeadOverWrists !== null
    && nextTracker.event === 'no-lockout'
  ) {
    const settled = settlePendingPullupRep(nextTracker, {
      bottomReached: false,
      noLockout: true,
      videoCurrentTime,
    });
    nextTracker = settled.tracker;
    verdict = settled.verdict;
    headWindowVerdict = settled.headWindowVerdict;
    nextTracker.suppressNextRepCountUntilBottom = true;
  } else if (
    nextTracker.pendingRepHeadOverWrists !== null
    && isAtBottom
  ) {
    const settled = settlePendingPullupRep(nextTracker, {
      bottomReached: true,
      videoCurrentTime,
    });
    nextTracker = settled.tracker;
    verdict = settled.verdict;
    headWindowVerdict = settled.headWindowVerdict;
  } else if (
    nextTracker.pendingRepHeadOverWrists !== null
    && nextTracker.phase === 'subiendo'
    && isRising
    && smoothedAngle < config.noLockoutAngle
  ) {
    const settled = settlePendingPullupRep(nextTracker, {
      bottomReached: false,
      noLockout: true,
      videoCurrentTime,
    });
    nextTracker = settled.tracker;
    verdict = settled.verdict;
    headWindowVerdict = settled.headWindowVerdict;
    nextTracker.suppressNextRepCountUntilBottom = true;
  }

  if (
    !headWindowVerdict
    && isReturningToBottom
    && isAtBottomByAngle
    && nextTracker.pendingRepHeadOverWrists === null
  ) {
    headWindowVerdict = getPullupHeadWindowVerdict(
      nextTracker,
      videoCurrentTime,
    );
    if (headWindowVerdict) nextTracker = resetPullupHeadWindow(nextTracker);
  }

  return {
    tracker: nextTracker,
    smoothedAngle,
    completedMinimumAngle,
    isAtBottom,
    hasReachedTop,
    verdict,
    elevationDecision,
    headWindowVerdict,
    phaseBefore: tracker.phase,
  };
}

function advancePullupFrame(
  tracker: PullupTracker,
  frame: PullupPendingAngleJumpFrame,
) {
  return advancePullupTrackerFrame(
    tracker,
    frame.rawAngle,
    frame.topReached,
    frame.headOverWrists,
    frame.extremities,
    frame.gripped,
    frame.config,
    frame.shoulderAverageY,
    frame.shoulderSpanPx,
    frame.videoCurrentTime,
  );
}

function createDiscardedAngleJump(
  frame: PullupPendingAngleJumpFrame,
  lastAcceptedRawAngle: number,
): PullupDiscardedAngleJumpFrame {
  return {
    videoCurrentTime: frame.videoCurrentTime,
    rawAngle: frame.rawAngle,
    lastAcceptedRawAngle,
    reason: 'no confirmó un cambio sostenido: el siguiente rawAngle no mantuvo el salto >50°',
  };
}

export function advancePullupTracker(
  tracker: PullupTracker,
  rawAngle: number,
  topReached: boolean,
  headOverWrists: boolean | null,
  extremities: PullupExtremityValidation,
  gripped: boolean,
  config: PullupTrackerConfig,
  shoulderAverageY: number | null = null,
  shoulderSpanPx: number | null = null,
  videoCurrentTime: number | null = null,
): PullupTrackerUpdate {
  const frame: PullupPendingAngleJumpFrame = {
    rawAngle,
    topReached,
    headOverWrists,
    extremities,
    gripped,
    config,
    shoulderAverageY,
    shoulderSpanPx,
    videoCurrentTime,
  };
  const discardedAngleJumpFrames: PullupDiscardedAngleJumpFrame[] = [];
  let trackerForCurrentFrame = tracker;
  const pendingFrame = tracker.pendingAngleJumpFrame;

  if (pendingFrame) {
    const lastAcceptedRawAngle = tracker.lastAcceptedRawAngle;
    const sustainedChange = lastAcceptedRawAngle !== null
      && Math.abs(rawAngle - lastAcceptedRawAngle) > 50
      && Math.abs(rawAngle - pendingFrame.rawAngle) < 20;
    if (sustainedChange) {
      const trackerWithoutPending = {
        ...tracker,
        pendingAngleJumpFrame: null,
      };
      const priorUpdate = advancePullupFrame(trackerWithoutPending, pendingFrame);
      const priorAcceptedTracker: PullupTracker = {
        ...priorUpdate.tracker,
        lastAcceptedRawAngle: pendingFrame.rawAngle,
        pendingAngleJumpFrame: null,
      };
      const currentUpdate = advancePullupFrame(priorAcceptedTracker, frame);
      return {
        ...currentUpdate,
        tracker: {
          ...currentUpdate.tracker,
          lastAcceptedRawAngle: rawAngle,
          pendingAngleJumpFrame: null,
        },
        frameAccepted: true,
        phaseBefore: priorAcceptedTracker.phase,
        discardedAngleJumpFrames,
        replayedPriorFrame: {
          videoCurrentTime: pendingFrame.videoCurrentTime,
          phaseBefore: tracker.phase,
          trackerBefore: trackerWithoutPending,
          tracker: priorAcceptedTracker,
          smoothedAngle: priorUpdate.smoothedAngle,
          isAtBottom: priorUpdate.isAtBottom,
          hasReachedTop: priorUpdate.hasReachedTop,
          verdict: priorUpdate.verdict,
          elevationDecision: priorUpdate.elevationDecision,
          headWindowVerdict: priorUpdate.headWindowVerdict,
        },
      };
    }

    if (lastAcceptedRawAngle !== null) {
      discardedAngleJumpFrames.push(
        createDiscardedAngleJump(pendingFrame, lastAcceptedRawAngle),
      );
    }
    trackerForCurrentFrame = {
      ...tracker,
      pendingAngleJumpFrame: null,
    };
  }

  const currentIsJump = trackerForCurrentFrame.lastAcceptedRawAngle !== null
    && Math.abs(rawAngle - trackerForCurrentFrame.lastAcceptedRawAngle) > 50;
  if (currentIsJump) {
    return {
      tracker: {
        ...trackerForCurrentFrame,
        pendingAngleJumpFrame: frame,
      },
      smoothedAngle: trackerForCurrentFrame.lastAngle ?? rawAngle,
      completedMinimumAngle: null,
      isAtBottom: false,
      hasReachedTop: false,
      verdict: null,
      frameAccepted: false,
      phaseBefore: trackerForCurrentFrame.phase,
      discardedAngleJumpFrames,
    };
  }

  const update = advancePullupFrame(trackerForCurrentFrame, frame);
  return {
    ...update,
    tracker: {
      ...update.tracker,
      lastAcceptedRawAngle: rawAngle,
      pendingAngleJumpFrame: null,
    },
    frameAccepted: true,
    phaseBefore: trackerForCurrentFrame.phase,
    discardedAngleJumpFrames,
  };
}

export function discardPendingPullupAngleJumpFrame(tracker: PullupTracker) {
  const pendingFrame = tracker.pendingAngleJumpFrame;
  const lastAcceptedRawAngle = tracker.lastAcceptedRawAngle;
  if (!pendingFrame || lastAcceptedRawAngle === null) {
    return { tracker, discardedFrame: null };
  }
  return {
    tracker: {
      ...tracker,
      pendingAngleJumpFrame: null,
    },
    discardedFrame: createDiscardedAngleJump(pendingFrame, lastAcceptedRawAngle),
  };
}
