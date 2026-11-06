export type PullupAttemptShadowReason =
  | 'cedido-a-ruta-principal'
  | 'tracker-no-armado'
  | 'cuadro-bloqueado'
  | 'codo-no-llego-120'
  | 'caida-menor-a-3';

export type PullupAttemptShadowLog = {
  tInicio: number | null;
  tFin: number | null;
  duracion: number | null;
  faseTracker: string;
  anguloCodoMin: number | null;
  ratioHombrosMax: number;
  subidaCabezaMax: number;
  cabezaSobreMuñecas: boolean | null;
  vistaInicio: string;
  vistaFin: string;
  vistaCambio: boolean;
  motivo: PullupAttemptShadowReason;
};

type PullupShadowBaseline = {
  shoulderY: number;
  noseY: number;
  shoulderSpanPx: number;
  samples: number;
};

type PullupShadowAttempt = {
  tInicio: number | null;
  angleMin: number | null;
  shoulderRiseRatioMax: number;
  headRiseRatioMax: number;
  headOverWrists: boolean | null;
  viewStart: string;
  viewEnd: string;
  viewChanged: boolean;
  trackerUnarmed: boolean;
  frameBlocked: boolean;
  ceded: boolean;
};

export type PullupAttemptShadowState = {
  baseline: PullupShadowBaseline | null;
  attempt: PullupShadowAttempt | null;
  lastVideoTime: number | null;
  lastExercise: string | null;
  lastRepetitions: number | null;
};

export type PullupAttemptShadowFrame = {
  exercise: string;
  exerciseStarted: boolean;
  videoTime: number | null;
  phaseAfter: string;
  trackerArmed: boolean;
  atBottom: boolean;
  gripped: boolean;
  frameBlocked: boolean;
  elbowAngle: number | null;
  shoulderY: number | null;
  shoulderSpanPx: number | null;
  noseY: number | null;
  headOverWrists: boolean | null;
  estimatedView: string;
  candidateCreated: boolean;
  repetitions: number;
};

function isFiniteNumber(value: number | null): value is number {
  return value !== null && Number.isFinite(value);
}

function normalizedRise(
  baselineY: number,
  currentY: number | null,
  shoulderSpanPx: number,
) {
  return isFiniteNumber(currentY)
    ? (baselineY - currentY) / shoulderSpanPx
    : null;
}

export function createPullupAttemptShadowState(): PullupAttemptShadowState {
  return {
    baseline: null,
    attempt: null,
    lastVideoTime: null,
    lastExercise: null,
    lastRepetitions: null,
  };
}

function updateBaseline(
  baseline: PullupShadowBaseline | null,
  frame: PullupAttemptShadowFrame,
): PullupShadowBaseline | null {
  if (
    !frame.atBottom
    || !frame.gripped
    || frame.frameBlocked
    || !isFiniteNumber(frame.shoulderY)
    || !isFiniteNumber(frame.noseY)
    || !isFiniteNumber(frame.shoulderSpanPx)
    || frame.shoulderSpanPx <= 0
  ) {
    return baseline;
  }

  if (!baseline) {
    return {
      shoulderY: frame.shoulderY,
      noseY: frame.noseY,
      shoulderSpanPx: frame.shoulderSpanPx,
      samples: 1,
    };
  }

  const samples = baseline.samples + 1;
  return {
    shoulderY: (
      baseline.shoulderY * baseline.samples + frame.shoulderY
    ) / samples,
    noseY: (baseline.noseY * baseline.samples + frame.noseY) / samples,
    shoulderSpanPx: (
      baseline.shoulderSpanPx * baseline.samples + frame.shoulderSpanPx
    ) / samples,
    samples,
  };
}

function getAttemptReason(
  attempt: PullupShadowAttempt,
): PullupAttemptShadowReason {
  if (attempt.ceded) return 'cedido-a-ruta-principal';
  if (attempt.trackerUnarmed) return 'tracker-no-armado';
  if (attempt.frameBlocked || attempt.angleMin === null) {
    return 'cuadro-bloqueado';
  }
  if (attempt.angleMin > 120) return 'codo-no-llego-120';
  return 'caida-menor-a-3';
}

export function updatePullupAttemptShadow(
  priorState: PullupAttemptShadowState,
  frame: PullupAttemptShadowFrame,
): {
  state: PullupAttemptShadowState;
  log: PullupAttemptShadowLog | null;
} {
  if (!frame.exerciseStarted) {
    return { state: createPullupAttemptShadowState(), log: null };
  }

  const timeMovedBackward = (
    frame.videoTime !== null
    && priorState.lastVideoTime !== null
    && frame.videoTime < priorState.lastVideoTime
  );
  const exerciseChanged = (
    priorState.lastExercise !== null
    && priorState.lastExercise !== frame.exercise
  );
  const trackerReset = (
    priorState.lastRepetitions !== null
    && frame.repetitions < priorState.lastRepetitions
  );
  const state = timeMovedBackward || exerciseChanged || trackerReset
    ? createPullupAttemptShadowState()
    : priorState;
  const baseline = state.baseline;
  const frameState = {
    ...state,
    lastVideoTime: frame.videoTime ?? state.lastVideoTime,
    lastExercise: frame.exercise,
    lastRepetitions: frame.repetitions,
  };

  if (!baseline) {
    return {
      state: {
        ...frameState,
        baseline: updateBaseline(null, frame),
      },
      log: null,
    };
  }

  const shoulderRiseRatio = normalizedRise(
    baseline.shoulderY,
    frame.shoulderY,
    baseline.shoulderSpanPx,
  );
  const headRiseRatio = normalizedRise(
    baseline.noseY,
    frame.noseY,
    baseline.shoulderSpanPx,
  );

  if (!state.attempt) {
    // Sin umbral de magnitud: el signo positivo solo detecta dirección de subida.
    const opensAttempt = (
      shoulderRiseRatio !== null
      && shoulderRiseRatio > 0
      && headRiseRatio !== null
      && headRiseRatio > 0
    );
    if (opensAttempt) {
      return {
        state: {
          ...frameState,
          attempt: {
            tInicio: frame.videoTime,
            angleMin: isFiniteNumber(frame.elbowAngle)
              ? frame.elbowAngle
              : null,
            shoulderRiseRatioMax: shoulderRiseRatio,
            headRiseRatioMax: headRiseRatio,
            headOverWrists: frame.headOverWrists,
            viewStart: frame.estimatedView,
            viewEnd: frame.estimatedView,
            viewChanged: false,
            trackerUnarmed: !frame.trackerArmed,
            frameBlocked: frame.frameBlocked,
            ceded: frame.phaseAfter === 'subiendo' || frame.candidateCreated,
          },
        },
        log: null,
      };
    }

    const backAtBaseline = (
      shoulderRiseRatio !== null
      && shoulderRiseRatio <= 0
      && headRiseRatio !== null
      && headRiseRatio <= 0
    );
    return {
      state: {
        ...frameState,
        baseline: backAtBaseline
          ? updateBaseline(baseline, frame)
          : baseline,
      },
      log: null,
    };
  }

  const attempt: PullupShadowAttempt = {
    ...state.attempt,
    angleMin: isFiniteNumber(frame.elbowAngle)
      ? state.attempt.angleMin === null
        ? frame.elbowAngle
        : Math.min(state.attempt.angleMin, frame.elbowAngle)
      : state.attempt.angleMin,
    shoulderRiseRatioMax: shoulderRiseRatio === null
      ? state.attempt.shoulderRiseRatioMax
      : Math.max(state.attempt.shoulderRiseRatioMax, shoulderRiseRatio),
    headRiseRatioMax: headRiseRatio === null
      ? state.attempt.headRiseRatioMax
      : Math.max(state.attempt.headRiseRatioMax, headRiseRatio),
    headOverWrists: frame.headOverWrists === true
      ? true
      : state.attempt.headOverWrists ?? frame.headOverWrists,
    viewEnd: frame.estimatedView,
    viewChanged: (
      state.attempt.viewChanged
      || frame.estimatedView !== state.attempt.viewStart
    ),
    trackerUnarmed: state.attempt.trackerUnarmed || !frame.trackerArmed,
    frameBlocked: state.attempt.frameBlocked || frame.frameBlocked,
    ceded: (
      state.attempt.ceded
      || frame.phaseAfter === 'subiendo'
      || frame.candidateCreated
    ),
  };
  const returnedToBaseline = (
    shoulderRiseRatio !== null
    && shoulderRiseRatio <= 0
    && headRiseRatio !== null
    && headRiseRatio <= 0
  );

  if (!returnedToBaseline) {
    return {
      state: { ...frameState, attempt },
      log: null,
    };
  }

  const duration = (
    attempt.tInicio !== null
    && frame.videoTime !== null
    && Number.isFinite(attempt.tInicio)
    && Number.isFinite(frame.videoTime)
  )
    ? frame.videoTime - attempt.tInicio
    : null;
  const log: PullupAttemptShadowLog = {
    tInicio: attempt.tInicio,
    tFin: frame.videoTime,
    duracion: duration,
    faseTracker: frame.phaseAfter,
    anguloCodoMin: attempt.angleMin,
    ratioHombrosMax: attempt.shoulderRiseRatioMax,
    subidaCabezaMax: attempt.headRiseRatioMax,
    cabezaSobreMuñecas: attempt.headOverWrists,
    vistaInicio: attempt.viewStart,
    vistaFin: attempt.viewEnd,
    vistaCambio: attempt.viewChanged,
    motivo: getAttemptReason(attempt),
  };
  return {
    state: {
      ...frameState,
      baseline: updateBaseline(baseline, frame) ?? baseline,
      attempt: null,
    },
    log,
  };
}
