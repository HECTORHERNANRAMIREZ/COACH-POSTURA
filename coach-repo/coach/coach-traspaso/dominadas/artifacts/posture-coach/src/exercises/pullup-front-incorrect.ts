// Umbrales provisionales: calibrar con más grabaciones antes de considerarlos definitivos.
export const PULLUP_FRONT_INCORRECT_START_RH_PROVISIONAL = 0.30;
export const PULLUP_FRONT_INCORRECT_RETURN_RH_PROVISIONAL = 0.15;
export const PULLUP_FRONT_INCORRECT_START_FRAMES_PROVISIONAL = 2;
export const PULLUP_FRONT_INCORRECT_RETURN_FRAMES_PROVISIONAL = 2;
export const PULLUP_FRONT_INCORRECT_REFERENCE_SAMPLES_PROVISIONAL = 6;
export const PULLUP_FRONT_INCORRECT_LOW_POSITION_MARGIN_PROVISIONAL = 0.08;
export const PULLUP_FRONT_INCORRECT_LOW_STABILITY_MARGIN_PROVISIONAL = 0.08;
export const PULLUP_FRONT_INCORRECT_MIN_SHOULDER_WIDTH_PX_PROVISIONAL = 80;
export const PULLUP_FRONT_INCORRECT_MAX_SHOULDER_WIDTH_PX_PROVISIONAL = 400;
export const PULLUP_FRONT_INCORRECT_MAX_WIDTH_DEVIATION_PROVISIONAL = 0.35;

const CALIBRATION_WINDOW_FRAMES = 24;
const REFERENCE_WINDOW_FRAMES = 31;
const WIDTH_HISTORY_FRAMES = 31;

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
  headReached: boolean;
  trackerRepetitionsAtStart: number | null;
  trackerCountIncreased: boolean;
  trackerHadDecision: boolean;
  returnFrames: number;
};

export type PullupFrontIncorrectState = {
  reference: PullupFrontReference | null;
  calibrationWindow: PullupFrontSample[];
  calibrationCandidates: PullupFrontSample[];
  restingReferenceSamples: PullupFrontSample[];
  widthHistory: number[];
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
  cabezaLlego: boolean;
  contada: boolean;
  motivo: PullupFrontIncorrectReason;
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
    calibrationCandidates: [...state.calibrationCandidates],
    restingReferenceSamples: [...state.restingReferenceSamples],
    widthHistory: [...state.widthHistory],
    startCandidate: state.startCandidate ? { ...state.startCandidate } : null,
    activeCycle: state.activeCycle ? { ...state.activeCycle } : null,
  };
}

export function createPullupFrontIncorrectState(): PullupFrontIncorrectState {
  return {
    reference: null,
    calibrationWindow: [],
    calibrationCandidates: [],
    restingReferenceSamples: [],
    widthHistory: [],
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

  const accumulatedMedian = median(state.widthHistory);
  state.widthHistory = [
    ...state.widthHistory,
    width,
  ].slice(-WIDTH_HISTORY_FRAMES);

  return accumulatedMedian === null
    || Math.abs(width - accumulatedMedian)
      <= accumulatedMedian * PULLUP_FRONT_INCORRECT_MAX_WIDTH_DEVIATION_PROVISIONAL;
}

function updateInitialReference(
  state: PullupFrontIncorrectState,
  sample: PullupFrontSample,
) {
  state.calibrationWindow = [
    ...state.calibrationWindow,
    sample,
  ].slice(-CALIBRATION_WINDOW_FRAMES);

  const highestShoulderY = Math.max(
    ...state.calibrationWindow.map((item) => item.shouldersY),
  );
  const nearLowestPosition = sample.shouldersY
    >= highestShoulderY
      - sample.shoulderWidthPx * PULLUP_FRONT_INCORRECT_LOW_POSITION_MARGIN_PROVISIONAL;

  if (!nearLowestPosition) {
    state.calibrationCandidates = [];
    return;
  }

  const previous = state.calibrationCandidates.at(-1);
  const stableWithPrevious = !previous || (
    Math.abs(sample.shouldersY - previous.shouldersY)
      <= sample.shoulderWidthPx
        * PULLUP_FRONT_INCORRECT_LOW_STABILITY_MARGIN_PROVISIONAL
    && Math.abs(sample.noseY - previous.noseY)
      <= sample.shoulderWidthPx
        * PULLUP_FRONT_INCORRECT_LOW_STABILITY_MARGIN_PROVISIONAL
  );
  state.calibrationCandidates = stableWithPrevious
    ? [...state.calibrationCandidates, sample].slice(
      -PULLUP_FRONT_INCORRECT_REFERENCE_SAMPLES_PROVISIONAL,
    )
    : [sample];

  if (
    state.calibrationCandidates.length
      < PULLUP_FRONT_INCORRECT_REFERENCE_SAMPLES_PROVISIONAL
  ) {
    return;
  }

  state.reference = medianSample(state.calibrationCandidates);
  state.restingReferenceSamples = [...state.calibrationCandidates];
  state.calibrationWindow = [];
  state.calibrationCandidates = [];
}

function updateRestingReference(
  state: PullupFrontIncorrectState,
  sample: PullupFrontSample,
) {
  state.restingReferenceSamples = [
    ...state.restingReferenceSamples,
    sample,
  ].slice(-REFERENCE_WINDOW_FRAMES);
  state.reference = medianSample(state.restingReferenceSamples);
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
    cycle.peakRH >= PULLUP_FRONT_INCORRECT_START_RH_PROVISIONAL
    && !cycle.headReached
    && !trackerHandledCycle
  );
  const motivo: PullupFrontIncorrectReason = contada
    ? 'sin-cabeza-arriba'
    : trackerHandledCycle
      ? 'tracker-principal'
      : cycle.headReached
        ? 'cabeza-llego'
        : 'pico-insuficiente';

  return {
    tInicio: cycle.tInicio,
    tFin,
    picoRH: cycle.peakRH,
    cabezaLlego: cycle.headReached,
    contada,
    motivo,
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
): {
  state: PullupFrontIncorrectState;
  log: PullupFrontIncorrectCycleLog | null;
} {
  const timeMovedBackward = (
    isFiniteNumber(frame.videoTime)
    && priorState.lastVideoTime !== null
    && frame.videoTime < priorState.lastVideoTime
  );
  const state = timeMovedBackward
    ? createPullupFrontIncorrectState()
    : copyState(priorState);

  const previousTrackerRepetitions = state.lastTrackerRepetitions;
  if (isFiniteNumber(frame.videoTime)) state.lastVideoTime = frame.videoTime;
  if (isFiniteNumber(frame.trackerRepetitions)) {
    state.lastTrackerRepetitions = frame.trackerRepetitions;
  }

  if (state.activeCycle) noteTrackerActivity(state.activeCycle, frame);
  if (state.startCandidate) noteTrackerActivity(state.startCandidate, frame);

  const sample = getValidSample(frame);
  if (!sample || !isPlausibleWidth(state, sample.shoulderWidthPx)) {
    resetConsecutiveFramesAfterInvalidInput(state, frame);
    return { state, log: null };
  }

  if (!state.reference) {
    updateInitialReference(state, sample);
    return { state, log: null };
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
      return { state, log: null };
    }

    const log = makeCycleLog(cycle, frame.videoTime);
    if (log.contada) state.incorrectCount += 1;
    state.activeCycle = null;
    updateRestingReference(state, sample);
    return { state, log };
  }

  if (state.startCandidate) {
    if (riseRatio < PULLUP_FRONT_INCORRECT_START_RH_PROVISIONAL) {
      state.startCandidate = null;
      if (riseRatio <= PULLUP_FRONT_INCORRECT_RETURN_RH_PROVISIONAL) {
        updateRestingReference(state, sample);
      }
      return { state, log: null };
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
        headReached: candidate.headReached,
        trackerRepetitionsAtStart: candidate.trackerRepetitionsAtStart,
        trackerCountIncreased: candidate.trackerCountIncreased,
        trackerHadDecision: candidate.trackerHadDecision,
        returnFrames: 0,
      };
      state.startCandidate = null;
    }
    return { state, log: null };
  }

  if (riseRatio >= PULLUP_FRONT_INCORRECT_START_RH_PROVISIONAL) {
    const repetitionsAtStart = isFiniteNumber(frame.trackerRepetitions)
      ? frame.trackerRepetitions
      : null;
    const repetitionsBeforeStart = previousTrackerRepetitions
      ?? repetitionsAtStart;
    state.startCandidate = {
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
    return { state, log: null };
  }

  if (riseRatio <= PULLUP_FRONT_INCORRECT_RETURN_RH_PROVISIONAL) {
    updateRestingReference(state, sample);
  }
  return { state, log: null };
}

export function getPullupFrontIncorrectCount(
  state: PullupFrontIncorrectState,
): number {
  return state.incorrectCount;
}
