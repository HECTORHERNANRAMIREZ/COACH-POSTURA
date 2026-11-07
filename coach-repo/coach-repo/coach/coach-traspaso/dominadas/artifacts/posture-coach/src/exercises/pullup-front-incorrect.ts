// Umbrales provisionales: calibrar con más grabaciones antes de considerarlos definitivos.
export const PULLUP_FRONT_INCORRECT_START_RH_PROVISIONAL = 0.25;
export const PULLUP_FRONT_INCORRECT_MIN_PEAK_RH_PROVISIONAL = 0.50;
export const PULLUP_FRONT_INCORRECT_RETURN_RH_PROVISIONAL = 0.20;
export const PULLUP_FRONT_INCORRECT_START_FRAMES_PROVISIONAL = 1;
export const PULLUP_FRONT_INCORRECT_RETURN_FRAMES_PROVISIONAL = 2;
// N=6 permite fijar la referencia con movimiento continuo sin esperar una pausa larga.
export const PULLUP_FRONT_INCORRECT_REFERENCE_SAMPLES_PROVISIONAL = 6;
export const PULLUP_FRONT_INCORRECT_REFERENCE_PERCENTILE_PROVISIONAL = 0.85;
export const PULLUP_FRONT_INCORRECT_REFERENCE_LOW_ZONE_PERCENTILE_PROVISIONAL = 0.75;
export const PULLUP_FRONT_INCORRECT_MIN_SHOULDER_WIDTH_PX_PROVISIONAL = 80;
export const PULLUP_FRONT_INCORRECT_MAX_SHOULDER_WIDTH_PX_PROVISIONAL = 400;
export const PULLUP_FRONT_INCORRECT_MAX_WIDTH_DEVIATION_PROVISIONAL = 0.35;

const CALIBRATION_WINDOW_FRAMES = 24;
const REFERENCE_WINDOW_FRAMES = 31;
const WIDTH_HISTORY_FRAMES = 31;
const MAX_CONSECUTIVE_WIDTH_REJECTIONS = 8;

type PullupFrontReference = {
  shouldersY: number;
  noseY: number;
  shoulderWidthPx: number;
};

type PullupFrontSample = PullupFrontReference;

type PullupFrontStartCandidate = {
  tInicio: number;
  frames: number;
  peakRH: number;
  headReached: boolean;
  trackerRepetitionsAtStart: number | null;
  trackerCountIncreased: boolean;
  trackerHadDecision: boolean;
};

export type PullupFrontActiveCycle = {
  tInicio: number;
  peakRH: number;
  huecoMaxS: number;
  headReached: boolean;
  trackerRepetitionsAtStart: number | null;
  trackerCountIncreased: boolean;
  trackerHadDecision: boolean;
  returnFrames: number;
};

export type PullupFrontIncorrectState = {
  reference: PullupFrontReference | null;
  calibrationWindow: PullupFrontSample[];
  calibrationFrames: PullupFrontIncorrectFrame[];
  calibrationCandidates: PullupFrontSample[];
  restingReferenceSamples: PullupFrontSample[];
  widthHistory: number[];
  consecutiveWidthRejections: number;
  startCandidate: PullupFrontStartCandidate | null;
  activeCycle: PullupFrontActiveCycle | null;
  incorrectCount: number;
  lastVideoTime: number | null;
  lastTrackerRepetitions: number | null;
};

export type PullupFrontIncorrectFrame = {
  videoTime: number;
  shouldersY: number;
  shoulderWidthPx: number;
  noseY: number;
  wristsY: number | null;
  headOverWrists: boolean | null;
  elbowAngle: number | null;
  trackerRepetitions: number;
  trackerHadDecision?: boolean;
};

export type PullupFrontIncorrectReason =
  | 'sin-cabeza-arriba'
  | 'cabeza-llego'
  | 'tracker-principal'
  | 'pico-insuficiente';

export type PullupFrontIncorrectCycleLog = {
  tInicio: number;
  tFin: number;
  picoRH: number;
  huecoMaxS: number;
  cabezaLlego: boolean;
  contada: boolean;
  motivo: PullupFrontIncorrectReason;
};

export type PullupFrontIncorrectFrameResult = {
  state: PullupFrontIncorrectState;
  log: PullupFrontIncorrectCycleLog | null;
  logs: PullupFrontIncorrectCycleLog[];
};

function isFiniteNumber(value: number | null | undefined): value is number {
  return value !== null && value !== undefined && Number.isFinite(value);
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function percentile(values: number[], fraction: number): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const position = (sorted.length - 1) * fraction;
  const lowerIndex = Math.floor(position);
  const upperIndex = Math.ceil(position);
  const remainder = position - lowerIndex;
  return sorted[lowerIndex]
    + (sorted[upperIndex] - sorted[lowerIndex]) * remainder;
}

function medianSample(samples: PullupFrontSample[]): PullupFrontReference | null {
  const shouldersY = median(samples.map((sample) => sample.shouldersY));
  const noseY = median(samples.map((sample) => sample.noseY));
  const shoulderWidthPx = median(samples.map((sample) => sample.shoulderWidthPx));
  if (shouldersY === null || noseY === null || shoulderWidthPx === null) {
    return null;
  }
  return { shouldersY, noseY, shoulderWidthPx };
}

function copyState(state: PullupFrontIncorrectState): PullupFrontIncorrectState {
  return {
    ...state,
    calibrationWindow: [...state.calibrationWindow],
    calibrationFrames: state.calibrationFrames.map((frame) => ({ ...frame })),
    calibrationCandidates: [...state.calibrationCandidates],
    restingReferenceSamples: [...state.restingReferenceSamples],
    widthHistory: [...state.widthHistory],
    consecutiveWidthRejections: state.consecutiveWidthRejections,
    startCandidate: state.startCandidate ? { ...state.startCandidate } : null,
    activeCycle: state.activeCycle ? { ...state.activeCycle } : null,
  };
}

export function createPullupFrontIncorrectState(): PullupFrontIncorrectState {
  return {
    reference: null,
    calibrationWindow: [],
    calibrationFrames: [],
    calibrationCandidates: [],
    restingReferenceSamples: [],
    widthHistory: [],
    consecutiveWidthRejections: 0,
    startCandidate: null,
    activeCycle: null,
    incorrectCount: 0,
    lastVideoTime: null,
    lastTrackerRepetitions: null,
  };
}

export function resetPullupFrontIncorrectState(): PullupFrontIncorrectState {
  return createPullupFrontIncorrectState();
}

function getValidSample(
  frame: PullupFrontIncorrectFrame,
): PullupFrontSample | null {
  if (
    !isFiniteNumber(frame.videoTime)
    || !isFiniteNumber(frame.shouldersY)
    || !isFiniteNumber(frame.noseY)
    || !isFiniteNumber(frame.shoulderWidthPx)
  ) {
    return null;
  }
  return {
    shouldersY: frame.shouldersY,
    noseY: frame.noseY,
    shoulderWidthPx: frame.shoulderWidthPx,
  };
}

function isPlausibleWidth(
  state: PullupFrontIncorrectState,
  width: number,
): boolean {
  if (
    width < PULLUP_FRONT_INCORRECT_MIN_SHOULDER_WIDTH_PX_PROVISIONAL
    || width > PULLUP_FRONT_INCORRECT_MAX_SHOULDER_WIDTH_PX_PROVISIONAL
  ) {
    return false;
  }

  const referenceWidth = state.reference?.shoulderWidthPx;
  if (
    referenceWidth !== undefined
    && Math.abs(width - referenceWidth)
      > referenceWidth * PULLUP_FRONT_INCORRECT_MAX_WIDTH_DEVIATION_PROVISIONAL
  ) {
    return false;
  }

  return true;
}

function recordPlausibleWidth(
  state: PullupFrontIncorrectState,
  width: number,
) {
  state.widthHistory = [
    ...state.widthHistory,
    width,
  ].slice(-WIDTH_HISTORY_FRAMES);
}

function restartWidthCalibration(state: PullupFrontIncorrectState) {
  state.reference = null;
  state.calibrationWindow = [];
  state.calibrationFrames = [];
  state.calibrationCandidates = [];
  state.restingReferenceSamples = [];
  state.widthHistory = [];
  state.consecutiveWidthRejections = 0;
  state.startCandidate = null;
  state.activeCycle = null;
}

function updateInitialReference(
  state: PullupFrontIncorrectState,
  sample: PullupFrontSample,
  frame: PullupFrontIncorrectFrame,
) {
  state.calibrationWindow = [
    ...state.calibrationWindow,
    sample,
  ].slice(-CALIBRATION_WINDOW_FRAMES);
  state.calibrationFrames = [
    ...state.calibrationFrames,
    { ...frame },
  ].slice(-CALIBRATION_WINDOW_FRAMES);

  if (
    state.calibrationWindow.length
      < PULLUP_FRONT_INCORRECT_REFERENCE_SAMPLES_PROVISIONAL
  ) {
    return;
  }

  const shouldersY = percentile(
    state.calibrationWindow.map((item) => item.shouldersY),
    PULLUP_FRONT_INCORRECT_REFERENCE_PERCENTILE_PROVISIONAL,
  );
  const lowZoneThreshold = percentile(
    state.calibrationWindow.map((item) => item.shouldersY),
    PULLUP_FRONT_INCORRECT_REFERENCE_LOW_ZONE_PERCENTILE_PROVISIONAL,
  );
  const lowPositionSamples = lowZoneThreshold === null
    ? []
    : state.calibrationWindow.filter((item) => item.shouldersY >= lowZoneThreshold);
  const noseY = median(lowPositionSamples.map((item) => item.noseY));
  const shoulderWidthPx = median(
    state.calibrationWindow.map((item) => item.shoulderWidthPx),
  );
  if (
    shouldersY === null
    || noseY === null
    || shoulderWidthPx === null
  ) {
    return;
  }

  state.reference = { shouldersY, noseY, shoulderWidthPx };
  state.restingReferenceSamples = [...lowPositionSamples];
  state.calibrationWindow = [];
  state.calibrationCandidates = [];
}

function updateRestingReference(
  state: PullupFrontIncorrectState,
  sample: PullupFrontSample,
) {
  const calibratedWidth = state.reference?.shoulderWidthPx;
  state.restingReferenceSamples = [
    ...state.restingReferenceSamples,
    sample,
  ].slice(-REFERENCE_WINDOW_FRAMES);
  const restingReference = medianSample(state.restingReferenceSamples);
  state.reference = restingReference && calibratedWidth !== undefined
    ? { ...restingReference, shoulderWidthPx: calibratedWidth }
    : restingReference;
}

function hasReachedHead(
  frame: PullupFrontIncorrectFrame,
): boolean {
  return frame.headOverWrists === true
    || (
      isFiniteNumber(frame.noseY)
      && isFiniteNumber(frame.wristsY)
      && frame.noseY <= frame.wristsY
    );
}

function noteTrackerActivity(
  cycle: Pick<
    PullupFrontActiveCycle,
    | 'trackerRepetitionsAtStart'
    | 'trackerCountIncreased'
    | 'trackerHadDecision'
  >,
  frame: PullupFrontIncorrectFrame,
) {
  if (
    cycle.trackerRepetitionsAtStart !== null
    && isFiniteNumber(frame.trackerRepetitions)
    && frame.trackerRepetitions > cycle.trackerRepetitionsAtStart
  ) {
    cycle.trackerCountIncreased = true;
  }
  if (frame.trackerHadDecision === true) cycle.trackerHadDecision = true;
}

function makeCycleLog(
  cycle: PullupFrontActiveCycle,
  tFin: number,
): PullupFrontIncorrectCycleLog {
  const trackerHandledCycle = cycle.trackerCountIncreased || cycle.trackerHadDecision;
  const contada = (
    cycle.peakRH >= PULLUP_FRONT_INCORRECT_MIN_PEAK_RH_PROVISIONAL
    && !cycle.headReached
    && !trackerHandledCycle
  );
  let motivo: PullupFrontIncorrectReason;
  if (cycle.peakRH < PULLUP_FRONT_INCORRECT_MIN_PEAK_RH_PROVISIONAL) {
    motivo = 'pico-insuficiente';
  } else if (trackerHandledCycle) {
    motivo = 'tracker-principal';
  } else if (cycle.headReached) {
    motivo = 'cabeza-llego';
  } else {
    motivo = 'sin-cabeza-arriba';
  }

  return {
    tInicio: cycle.tInicio,
    tFin,
    picoRH: cycle.peakRH,
    huecoMaxS: cycle.huecoMaxS,
    cabezaLlego: cycle.headReached,
    contada,
    motivo,
  };
}

function makeFrameResult(
  state: PullupFrontIncorrectState,
  logs: PullupFrontIncorrectCycleLog[] = [],
): PullupFrontIncorrectFrameResult {
  return {
    state,
    log: logs.at(-1) ?? null,
    logs,
  };
}

function resetConsecutiveFramesAfterInvalidInput(
  state: PullupFrontIncorrectState,
  frame: PullupFrontIncorrectFrame,
) {
  state.startCandidate = null;
  if (state.activeCycle) {
    noteTrackerActivity(state.activeCycle, frame);
    state.activeCycle.returnFrames = 0;
  }
}

export function processPullupFrontIncorrectFrame(
  priorState: PullupFrontIncorrectState,
  frame: PullupFrontIncorrectFrame,
): PullupFrontIncorrectFrameResult {
  const timeMovedBackward = (
    isFiniteNumber(frame.videoTime)
    && priorState.lastVideoTime !== null
    && frame.videoTime < priorState.lastVideoTime
  );
  let state = timeMovedBackward
    ? createPullupFrontIncorrectState()
    : copyState(priorState);

  const previousVideoTime = state.lastVideoTime;
  const previousTrackerRepetitions = state.lastTrackerRepetitions;
  if (isFiniteNumber(frame.videoTime)) state.lastVideoTime = frame.videoTime;
  if (isFiniteNumber(frame.trackerRepetitions)) {
    state.lastTrackerRepetitions = frame.trackerRepetitions;
  }

  if (state.activeCycle) {
    noteTrackerActivity(state.activeCycle, frame);
    if (previousVideoTime !== null && isFiniteNumber(frame.videoTime)) {
      const frameGapS = frame.videoTime - previousVideoTime;
      if (frameGapS > 0) {
        state.activeCycle.huecoMaxS = Math.max(
          state.activeCycle.huecoMaxS,
          frameGapS,
        );
      }
    }
  }
  if (state.startCandidate) noteTrackerActivity(state.startCandidate, frame);

  const sample = getValidSample(frame);
  if (!sample) {
    state.consecutiveWidthRejections = 0;
    resetConsecutiveFramesAfterInvalidInput(state, frame);
    return makeFrameResult(state);
  }

  if (!isPlausibleWidth(state, sample.shoulderWidthPx)) {
    state.consecutiveWidthRejections += 1;
    if (state.consecutiveWidthRejections >= MAX_CONSECUTIVE_WIDTH_REJECTIONS) {
      restartWidthCalibration(state);
    } else {
      resetConsecutiveFramesAfterInvalidInput(state, frame);
    }
    return makeFrameResult(state);
  }

  state.consecutiveWidthRejections = 0;
  recordPlausibleWidth(state, sample.shoulderWidthPx);

  if (!state.reference) {
    updateInitialReference(state, sample, frame);
    if (!state.reference) return makeFrameResult(state);

    const calibrationFrames = [...state.calibrationFrames];
    state.calibrationWindow = [];
    state.calibrationFrames = [];
    state.calibrationCandidates = [];
    state.widthHistory = [];
    state.consecutiveWidthRejections = 0;
    state.startCandidate = null;
    state.activeCycle = null;
    state.lastVideoTime = null;
    state.lastTrackerRepetitions = null;

    const replayLogs: PullupFrontIncorrectCycleLog[] = [];
    for (const calibrationFrame of calibrationFrames) {
      const replayResult = processPullupFrontIncorrectFrame(state, calibrationFrame);
      state = replayResult.state;
      replayLogs.push(...replayResult.logs);
    }
    return makeFrameResult(state, replayLogs);
  }

  const riseRatio = (
    state.reference.shouldersY - sample.shouldersY
  ) / state.reference.shoulderWidthPx;
  const headReached = hasReachedHead(frame);

  if (state.activeCycle) {
    const cycle = state.activeCycle;
    cycle.peakRH = Math.max(cycle.peakRH, riseRatio);
    cycle.headReached ||= headReached;
    cycle.returnFrames = riseRatio <= PULLUP_FRONT_INCORRECT_RETURN_RH_PROVISIONAL
      ? cycle.returnFrames + 1
      : 0;

    if (
      cycle.returnFrames < PULLUP_FRONT_INCORRECT_RETURN_FRAMES_PROVISIONAL
    ) {
      return makeFrameResult(state);
    }

    const log = makeCycleLog(cycle, frame.videoTime);
    if (log.contada) state.incorrectCount += 1;
    state.activeCycle = null;
    updateRestingReference(state, sample);
    return makeFrameResult(state, [log]);
  }

  if (state.startCandidate) {
    if (riseRatio < PULLUP_FRONT_INCORRECT_START_RH_PROVISIONAL) {
      state.startCandidate = null;
      if (riseRatio <= PULLUP_FRONT_INCORRECT_RETURN_RH_PROVISIONAL) {
        updateRestingReference(state, sample);
      }
      return makeFrameResult(state);
    }

    const candidate = state.startCandidate;
    candidate.frames += 1;
    candidate.peakRH = Math.max(candidate.peakRH, riseRatio);
    candidate.headReached ||= headReached;
    noteTrackerActivity(candidate, frame);

    if (candidate.frames >= PULLUP_FRONT_INCORRECT_START_FRAMES_PROVISIONAL) {
      state.activeCycle = {
        tInicio: candidate.tInicio,
        peakRH: candidate.peakRH,
        huecoMaxS: 0,
        headReached: candidate.headReached,
        trackerRepetitionsAtStart: candidate.trackerRepetitionsAtStart,
        trackerCountIncreased: candidate.trackerCountIncreased,
        trackerHadDecision: candidate.trackerHadDecision,
        returnFrames: 0,
      };
      state.startCandidate = null;
    }
    return makeFrameResult(state);
  }

  if (riseRatio >= PULLUP_FRONT_INCORRECT_START_RH_PROVISIONAL) {
    const repetitionsAtStart = isFiniteNumber(frame.trackerRepetitions)
      ? frame.trackerRepetitions
      : null;
    const repetitionsBeforeStart = previousTrackerRepetitions
      ?? repetitionsAtStart;
    const candidate: PullupFrontStartCandidate = {
      tInicio: frame.videoTime,
      frames: 1,
      peakRH: riseRatio,
      headReached,
      trackerRepetitionsAtStart: repetitionsBeforeStart,
      trackerCountIncreased: (
        repetitionsBeforeStart !== null
        && repetitionsAtStart !== null
        && repetitionsAtStart > repetitionsBeforeStart
      ),
      trackerHadDecision: frame.trackerHadDecision === true,
    };
    if (
      candidate.frames >= PULLUP_FRONT_INCORRECT_START_FRAMES_PROVISIONAL
    ) {
      state.activeCycle = {
        tInicio: candidate.tInicio,
        peakRH: candidate.peakRH,
        huecoMaxS: 0,
        headReached: candidate.headReached,
        trackerRepetitionsAtStart: candidate.trackerRepetitionsAtStart,
        trackerCountIncreased: candidate.trackerCountIncreased,
        trackerHadDecision: candidate.trackerHadDecision,
        returnFrames: 0,
      };
    } else {
      state.startCandidate = candidate;
    }
    return makeFrameResult(state);
  }

  if (riseRatio <= PULLUP_FRONT_INCORRECT_RETURN_RH_PROVISIONAL) {
    updateRestingReference(state, sample);
  }
  return makeFrameResult(state);
}

export function getPullupFrontIncorrectCount(
  state: PullupFrontIncorrectState,
): number {
  return state.incorrectCount;
}
