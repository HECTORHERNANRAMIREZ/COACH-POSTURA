export type SquatPhase =
  | 'desconocida'
  | 'esperando arriba'
  | 'arriba'
  | 'bajando'
  | 'abajo'
  | 'subiendo';

export type SquatRepEvent = 'valid' | 'too-shallow' | null;
export type SquatDirection = 'down' | 'up';

export const SQUAT_VALID_MIN_ANGLE = 83;
export const SQUAT_VALID_MAX_ANGLE = 90;
export const SQUAT_TOP_THRESHOLD = 140;
export const TOLERANCIA_GRADOS = 5;

const DIRECTION_SENSITIVITY_DEGREES = 0.25;
const RAW_MEDIAN_WINDOW_SIZE = 3;
const DISPLAY_EMA_TIME_CONSTANT_SECONDS = 0.16;
const MAX_TRACKING_GAP_SECONDS = 0.75;

type DirectionCandidate = {
  direction: SquatDirection | null;
  startAngle: number | null;
  extremeAngle: number | null;
  movingFrames: number;
};

export type SquatTracker = {
  phase: SquatPhase;
  repetitions: number;
  goodRepetitions: number;
  minimumAngle: number | null;
  event: SquatRepEvent;
  smoothedAngle: number | null;
  lastSampleTimeSeconds: number | null;
  rawAngleWindow: number[];
  lastFilteredAngle: number | null;
  candidateDirection: SquatDirection | null;
  candidateDirectionStartAngle: number | null;
  candidateDirectionExtremeAngle: number | null;
  candidateDirectionFrames: number;
  cyclePeakAngle: number | null;
  cycleValleyAngle: number | null;
  cycleHasDescent: boolean;
};

export type SquatCompletedCycle = {
  peakAngle: number;
  valleyAngle: number;
  observedRange: number;
  topThreshold: number;
  bottomMaxThreshold: number;
  toleranceDegrees: number;
  classification: Exclude<SquatRepEvent, null>;
  reason: string;
};

export type SquatTrackerUpdate = {
  tracker: SquatTracker;
  smoothedAngle: number;
  completedMinimumAngle: number | null;
  completedCycle: SquatCompletedCycle | null;
};

const TOP_ACCEPTANCE_THRESHOLD = SQUAT_TOP_THRESHOLD - TOLERANCIA_GRADOS;
const BOTTOM_ACCEPTANCE_MAX = SQUAT_VALID_MAX_ANGLE + TOLERANCIA_GRADOS;

function median(values: number[]) {
  const sorted = [...values].sort((first, second) => first - second);
  return sorted[Math.floor(sorted.length / 2)] ?? null;
}

function resetDirectionCandidate(): DirectionCandidate {
  return {
    direction: null,
    startAngle: null,
    extremeAngle: null,
    movingFrames: 0,
  };
}

function readDirectionCandidate(
  candidate: DirectionCandidate,
  previousAngle: number,
  currentAngle: number,
): { candidate: DirectionCandidate; confirmedDirection: SquatDirection | null } {
  const delta = currentAngle - previousAngle;
  const direction = delta < -DIRECTION_SENSITIVITY_DEGREES
    ? 'down'
    : delta > DIRECTION_SENSITIVITY_DEGREES
      ? 'up'
      : null;

  let nextCandidate = candidate;
  if (direction && direction !== candidate.direction) {
    nextCandidate = {
      direction,
      startAngle: previousAngle,
      extremeAngle: currentAngle,
      movingFrames: 1,
    };
  } else if (direction && direction === candidate.direction) {
    nextCandidate = {
      ...candidate,
      extremeAngle: direction === 'down'
        ? Math.min(candidate.extremeAngle ?? currentAngle, currentAngle)
        : Math.max(candidate.extremeAngle ?? currentAngle, currentAngle),
      movingFrames: candidate.movingFrames + 1,
    };
  }

  if (
    !nextCandidate.direction
    || nextCandidate.startAngle === null
    || nextCandidate.extremeAngle === null
  ) {
    return { candidate: nextCandidate, confirmedDirection: null };
  }

  const travel = nextCandidate.direction === 'down'
    ? nextCandidate.startAngle - nextCandidate.extremeAngle
    : nextCandidate.extremeAngle - nextCandidate.startAngle;
  return {
    candidate: nextCandidate,
    confirmedDirection: nextCandidate.movingFrames >= 2
      && travel > TOLERANCIA_GRADOS
      ? nextCandidate.direction
      : null,
  };
}

function emptyUpdate(tracker: SquatTracker): SquatTrackerUpdate {
  return {
    tracker,
    smoothedAngle: tracker.smoothedAngle ?? Number.NaN,
    completedMinimumAngle: null,
    completedCycle: null,
  };
}

export function createSquatTracker(): SquatTracker {
  return {
    phase: 'desconocida',
    repetitions: 0,
    goodRepetitions: 0,
    minimumAngle: null,
    event: null,
    smoothedAngle: null,
    lastSampleTimeSeconds: null,
    rawAngleWindow: [],
    lastFilteredAngle: null,
    candidateDirection: null,
    candidateDirectionStartAngle: null,
    candidateDirectionExtremeAngle: null,
    candidateDirectionFrames: 0,
    cyclePeakAngle: null,
    cycleValleyAngle: null,
    cycleHasDescent: false,
  };
}

export function advanceSquatTracker(
  tracker: SquatTracker,
  rawAngle: number,
  timeSeconds?: number,
): SquatTrackerUpdate {
  if (!Number.isFinite(rawAngle)) return emptyUpdate(tracker);

  const sampleTime = Number.isFinite(timeSeconds)
    ? timeSeconds as number
    : (tracker.lastSampleTimeSeconds ?? 0) + 1 / 30;
  const deltaSeconds = tracker.lastSampleTimeSeconds === null
    ? null
    : sampleTime - tracker.lastSampleTimeSeconds;
  const smoothingAlpha = tracker.smoothedAngle === null
    || deltaSeconds === null
    || deltaSeconds <= 0
    || deltaSeconds >= MAX_TRACKING_GAP_SECONDS
    ? 1
    : 1 - Math.exp(-deltaSeconds / DISPLAY_EMA_TIME_CONSTANT_SECONDS);
  const smoothedAngle = tracker.smoothedAngle === null
    ? rawAngle
    : tracker.smoothedAngle + smoothingAlpha * (rawAngle - tracker.smoothedAngle);
  const rawAngleWindow = [...tracker.rawAngleWindow, rawAngle]
    .slice(-RAW_MEDIAN_WINDOW_SIZE);
  const filteredAngle = median(rawAngleWindow);
  if (filteredAngle === null) return emptyUpdate(tracker);

  const nextTracker: SquatTracker = {
    ...tracker,
    event: null,
    smoothedAngle,
    lastSampleTimeSeconds: sampleTime,
    rawAngleWindow,
    lastFilteredAngle: filteredAngle,
  };

  if (tracker.phase === 'desconocida') {
    const startsAtTop = filteredAngle >= TOP_ACCEPTANCE_THRESHOLD;
    return {
      tracker: {
        ...nextTracker,
        phase: startsAtTop ? 'arriba' : 'abajo',
        minimumAngle: startsAtTop ? null : filteredAngle,
        cyclePeakAngle: filteredAngle,
        cycleValleyAngle: filteredAngle,
        cycleHasDescent: !startsAtTop,
        candidateDirection: null,
        candidateDirectionStartAngle: null,
        candidateDirectionExtremeAngle: null,
        candidateDirectionFrames: 0,
      },
      smoothedAngle,
      completedMinimumAngle: null,
      completedCycle: null,
    };
  }

  const previousFilteredAngle = tracker.lastFilteredAngle;
  const directionResult = previousFilteredAngle === null
    ? { candidate: resetDirectionCandidate(), confirmedDirection: null }
    : readDirectionCandidate(
      {
        direction: tracker.candidateDirection,
        startAngle: tracker.candidateDirectionStartAngle,
        extremeAngle: tracker.candidateDirectionExtremeAngle,
        movingFrames: tracker.candidateDirectionFrames,
      },
      previousFilteredAngle,
      filteredAngle,
    );

  let phase = tracker.phase;
  let cyclePeakAngle = tracker.cyclePeakAngle ?? filteredAngle;
  let cycleValleyAngle = tracker.cycleValleyAngle ?? filteredAngle;
  let cycleHasDescent = tracker.cycleHasDescent;
  let repetitions = tracker.repetitions;
  let goodRepetitions = tracker.goodRepetitions;
  let event: SquatRepEvent = null;
  let completedMinimumAngle: number | null = null;
  let completedCycle: SquatCompletedCycle | null = null;

  // Los extremos del ciclo se miden solo en la mediana de las últimas 3 rodillas
  // brutas válidas; el EMA se conserva únicamente para la visualización.
  cyclePeakAngle = Math.max(cyclePeakAngle, filteredAngle);
  cycleValleyAngle = Math.min(cycleValleyAngle, filteredAngle);
  cycleHasDescent = cycleHasDescent
    || cyclePeakAngle - cycleValleyAngle > 2 * TOLERANCIA_GRADOS;
  const confirmedDirection = directionResult.confirmedDirection;

  if (phase === 'arriba') {
    if (confirmedDirection === 'down') {
      phase = 'bajando';
      cyclePeakAngle = Math.max(cyclePeakAngle, filteredAngle);
      cycleValleyAngle = filteredAngle;
      cycleHasDescent = cyclePeakAngle - cycleValleyAngle
        > 2 * TOLERANCIA_GRADOS;
    }
  } else if (phase === 'bajando') {
    if (confirmedDirection === 'up') phase = 'abajo';
  } else if (phase === 'abajo') {
    if (confirmedDirection === 'up') phase = 'subiendo';
  } else if (phase === 'subiendo') {
    if (confirmedDirection === 'down') {
      phase = 'bajando';
    } else if (filteredAngle >= TOP_ACCEPTANCE_THRESHOLD) {
      if (!cycleHasDescent) {
        phase = 'arriba';
        cyclePeakAngle = filteredAngle;
        cycleValleyAngle = filteredAngle;
      } else {
        const classification: Exclude<SquatRepEvent, null> = cycleValleyAngle
          <= BOTTOM_ACCEPTANCE_MAX
          ? 'valid'
          : 'too-shallow';
        const observedRange = Math.max(0, cyclePeakAngle - cycleValleyAngle);
        repetitions += 1;
        if (classification === 'valid') goodRepetitions += 1;
        event = classification;
        completedMinimumAngle = cycleValleyAngle;
        completedCycle = {
          peakAngle: cyclePeakAngle,
          valleyAngle: cycleValleyAngle,
          observedRange,
          topThreshold: TOP_ACCEPTANCE_THRESHOLD,
          bottomMaxThreshold: BOTTOM_ACCEPTANCE_MAX,
          toleranceDegrees: TOLERANCIA_GRADOS,
          classification,
          reason: classification === 'valid'
            ? `valle=${cycleValleyAngle.toFixed(2)}° <= `
              + `${BOTTOM_ACCEPTANCE_MAX}° (profundidad suficiente, incluso más profunda); `
              + `retorno>=${TOP_ACCEPTANCE_THRESHOLD}°`
            : `valle=${cycleValleyAngle.toFixed(2)}° supera `
              + `${BOTTOM_ACCEPTANCE_MAX}° (profundidad insuficiente); `
              + `retorno>=${TOP_ACCEPTANCE_THRESHOLD}°`,
        };
        phase = 'arriba';
        cyclePeakAngle = filteredAngle;
        cycleValleyAngle = filteredAngle;
        cycleHasDescent = false;
      }
    }
  }

  const candidate = directionResult.confirmedDirection
    ? resetDirectionCandidate()
    : directionResult.candidate;
  const updatedTracker: SquatTracker = {
    ...nextTracker,
    phase,
    repetitions,
    goodRepetitions,
    event,
    minimumAngle: phase === 'arriba' && event === null
      ? null
      : cycleValleyAngle,
    candidateDirection: candidate.direction,
    candidateDirectionStartAngle: candidate.startAngle,
    candidateDirectionExtremeAngle: candidate.extremeAngle,
    candidateDirectionFrames: candidate.movingFrames,
    cyclePeakAngle,
    cycleValleyAngle,
    cycleHasDescent,
  };

  return {
    tracker: updatedTracker,
    smoothedAngle,
    completedMinimumAngle,
    completedCycle,
  };
}
