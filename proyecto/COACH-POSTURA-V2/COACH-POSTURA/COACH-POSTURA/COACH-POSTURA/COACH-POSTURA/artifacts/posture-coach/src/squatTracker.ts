export type SquatPhase =
  | 'desconocida'
  | 'esperando arriba'
  | 'arriba'
  | 'bajando'
  | 'abajo';

export type SquatRepEvent = 'valid' | 'too-shallow' | 'too-deep' | null;
export type SquatDirection = 'down' | 'up';

export type SquatTracker = {
  phase: SquatPhase;
  repetitions: number;
  goodRepetitions: number;
  minimumAngle: number | null;
  descentStartAngle: number | null;
  hasMeaningfulDescent: boolean;
  event: SquatRepEvent;
  currentRepCounted: boolean;
  smoothedAngle: number | null;
  lastSampleTimeSeconds: number | null;
  lastConfidentAngle: number | null;
  lastConfidentTimeSeconds: number | null;
  candidateDirection: SquatDirection | null;
  candidateDirectionStartedAtSeconds: number | null;
  candidateDirectionStartAngle: number | null;
  candidateDirectionFrames: number;
  phaseStartedAtSeconds: number | null;
  observedPeakAngle: number | null;
  observedValleyAngle: number | null;
  cyclePeakAngle: number | null;
  cycleValleyAngle: number | null;
  cycleHasDescent: boolean;
  recentCycleRanges: number[];
};

export type SquatCompletedCycle = {
  peakAngle: number;
  valleyAngle: number;
  observedRange: number;
  referenceRange: number;
  depthRatio: number;
  recoveryRatio: number;
  reason: string;
};

export type SquatTrackerUpdate = {
  tracker: SquatTracker;
  smoothedAngle: number;
  completedMinimumAngle: number | null;
  completedCycle: SquatCompletedCycle | null;
};

const EMA_TIME_CONSTANT_SECONDS = 0.16;
const MAX_TRACKING_GAP_SECONDS = 0.75;
const DIRECTION_CONFIRMATION_SECONDS = 0.12;
const MIN_PHASE_DURATION_SECONDS = 0.12;
const DIRECTION_SLOPE_RATIO_PER_SECOND = 0.012;
const DIRECTION_HYSTERESIS_RATIO = 0.035;
const MIN_RELATIVE_DEPTH_RATIO = 0.5;
const COMPLETION_RECOVERY_RATIO = 0.58;
const TOP_RECOVERY_RATIO = 0.84;
const RECENT_CYCLE_RANGE_COUNT = 5;

function median(values: number[]) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((first, second) => first - second);
  return sorted[Math.floor(sorted.length / 2)] ?? null;
}

function positiveRange(peak: number | null, valley: number | null) {
  if (peak === null || valley === null) return 0;
  return Math.max(0, peak - valley);
}

function getObservedRange(tracker: SquatTracker) {
  const referenceRange = median(tracker.recentCycleRanges);
  if (referenceRange !== null && referenceRange > 0) return referenceRange;
  return Math.max(
    positiveRange(tracker.cyclePeakAngle, tracker.cycleValleyAngle),
    positiveRange(tracker.observedPeakAngle, tracker.observedValleyAngle),
  );
}

function resetDirectionCandidate(tracker: SquatTracker): SquatTracker {
  return {
    ...tracker,
    candidateDirection: null,
    candidateDirectionStartedAtSeconds: null,
    candidateDirectionStartAngle: null,
    candidateDirectionFrames: 0,
  };
}

function updateDirectionCandidate(
  tracker: SquatTracker,
  smoothedAngle: number,
  timeSeconds: number,
  previousConfidentAngle: number | null,
  previousConfidentTimeSeconds: number | null,
): { tracker: SquatTracker; confirmedDirection: SquatDirection | null } {
  if (
    previousConfidentAngle === null
    || previousConfidentTimeSeconds === null
    || timeSeconds <= previousConfidentTimeSeconds
  ) {
    return {
      tracker: resetDirectionCandidate(tracker),
      confirmedDirection: null,
    };
  }

  const deltaSeconds = timeSeconds - previousConfidentTimeSeconds;
  const deltaAngle = smoothedAngle - previousConfidentAngle;
  const observedRange = Math.max(
    getObservedRange(tracker),
    Math.abs(deltaAngle),
  );
  const directionalDeltaThreshold = observedRange
    * DIRECTION_SLOPE_RATIO_PER_SECOND
    * deltaSeconds;
  const direction: SquatDirection | null = deltaAngle < -directionalDeltaThreshold
    ? 'down'
    : deltaAngle > directionalDeltaThreshold
      ? 'up'
      : null;

  let candidateTracker = tracker;
  if (direction && direction !== tracker.candidateDirection) {
    candidateTracker = {
      ...tracker,
      candidateDirection: direction,
      candidateDirectionStartedAtSeconds: previousConfidentTimeSeconds,
      candidateDirectionStartAngle: previousConfidentAngle,
      candidateDirectionFrames: 1,
    };
  } else if (direction && direction === tracker.candidateDirection) {
    candidateTracker = {
      ...tracker,
      candidateDirectionFrames: tracker.candidateDirectionFrames + 1,
    };
  } else if (tracker.candidateDirection) {
    // Neutral samples stay inside the hysteresis band and do not cancel a trend.
    candidateTracker = {
      ...tracker,
      candidateDirectionFrames: tracker.candidateDirectionFrames + 1,
    };
  }

  const candidateDirection = candidateTracker.candidateDirection;
  const candidateStartedAt = candidateTracker.candidateDirectionStartedAtSeconds;
  const candidateStartAngle = candidateTracker.candidateDirectionStartAngle;
  if (
    !candidateDirection
    || candidateStartedAt === null
    || candidateStartAngle === null
  ) {
    return { tracker: candidateTracker, confirmedDirection: null };
  }
  const candidateDuration = timeSeconds - candidateStartedAt;
  const candidateTravel = candidateDirection === 'down'
    ? candidateStartAngle - smoothedAngle
    : smoothedAngle - candidateStartAngle;
  const minimumTravel = Math.max(
    0,
    getObservedRange(candidateTracker) * DIRECTION_HYSTERESIS_RATIO,
  );
  const confirmedDirection = candidateDuration >= DIRECTION_CONFIRMATION_SECONDS
    && candidateTracker.candidateDirectionFrames >= 2
    && candidateTravel >= minimumTravel
    ? candidateDirection
    : null;

  return { tracker: candidateTracker, confirmedDirection };
}

export function createSquatTracker(): SquatTracker {
  return {
    phase: 'desconocida',
    repetitions: 0,
    goodRepetitions: 0,
    minimumAngle: null,
    descentStartAngle: null,
    hasMeaningfulDescent: false,
    event: null,
    currentRepCounted: false,
    smoothedAngle: null,
    lastSampleTimeSeconds: null,
    lastConfidentAngle: null,
    lastConfidentTimeSeconds: null,
    candidateDirection: null,
    candidateDirectionStartedAtSeconds: null,
    candidateDirectionStartAngle: null,
    candidateDirectionFrames: 0,
    phaseStartedAtSeconds: null,
    observedPeakAngle: null,
    observedValleyAngle: null,
    cyclePeakAngle: null,
    cycleValleyAngle: null,
    cycleHasDescent: false,
    recentCycleRanges: [],
  };
}

export function advanceSquatTracker(
  tracker: SquatTracker,
  rawAngle: number,
  confidenceReady = true,
  timeSeconds?: number,
): SquatTrackerUpdate {
  if (!Number.isFinite(rawAngle)) {
    return {
      tracker,
      smoothedAngle: tracker.smoothedAngle ?? rawAngle,
      completedMinimumAngle: null,
      completedCycle: null,
    };
  }

  const sampleTime = Number.isFinite(timeSeconds)
    ? timeSeconds as number
    : (tracker.lastSampleTimeSeconds ?? 0) + 1 / 30;
  const previousSampleTime = tracker.lastSampleTimeSeconds;
  const deltaSeconds = previousSampleTime === null
    ? null
    : sampleTime - previousSampleTime;
  const smoothingAlpha = tracker.smoothedAngle === null
    || deltaSeconds === null
    || deltaSeconds <= 0
    || deltaSeconds >= MAX_TRACKING_GAP_SECONDS
    ? 1
    : 1 - Math.exp(-deltaSeconds / EMA_TIME_CONSTANT_SECONDS);
  const smoothedAngle = tracker.smoothedAngle === null
    ? rawAngle
    : tracker.smoothedAngle + smoothingAlpha * (rawAngle - tracker.smoothedAngle);
  const previousConfidentAngle = tracker.lastConfidentAngle;
  const previousConfidentTimeSeconds = tracker.lastConfidentTimeSeconds;
  let nextTracker: SquatTracker = {
    ...tracker,
    smoothedAngle,
    lastSampleTimeSeconds: sampleTime,
    lastConfidentAngle: smoothedAngle,
    lastConfidentTimeSeconds: sampleTime,
    event: null,
  };

  if (!confidenceReady) {
    nextTracker = resetDirectionCandidate(nextTracker);
    return {
      tracker: nextTracker,
      smoothedAngle,
      completedMinimumAngle: null,
      completedCycle: null,
    };
  }

  if (
    previousSampleTime !== null
    && (
      deltaSeconds === null
      || deltaSeconds <= 0
      || deltaSeconds > MAX_TRACKING_GAP_SECONDS
    )
  ) {
    nextTracker = resetDirectionCandidate(nextTracker);
    nextTracker = {
      ...nextTracker,
      observedPeakAngle: Math.max(
        nextTracker.observedPeakAngle ?? smoothedAngle,
        smoothedAngle,
      ),
      observedValleyAngle: Math.min(
        nextTracker.observedValleyAngle ?? smoothedAngle,
        smoothedAngle,
      ),
    };
    return {
      tracker: nextTracker,
      smoothedAngle,
      completedMinimumAngle: null,
      completedCycle: null,
    };
  }

  nextTracker = {
    ...nextTracker,
    observedPeakAngle: Math.max(
      nextTracker.observedPeakAngle ?? smoothedAngle,
      smoothedAngle,
    ),
    observedValleyAngle: Math.min(
      nextTracker.observedValleyAngle ?? smoothedAngle,
      smoothedAngle,
    ),
  };
  const directionUpdate = updateDirectionCandidate(
    nextTracker,
    smoothedAngle,
    sampleTime,
    previousConfidentAngle,
    previousConfidentTimeSeconds,
  );
  nextTracker = directionUpdate.tracker;
  const confirmedDirection = directionUpdate.confirmedDirection;
  let completedMinimumAngle: number | null = null;
  let completedCycle: SquatCompletedCycle | null = null;

  const startDescent = () => {
    const peakAngle = nextTracker.candidateDirectionStartAngle
      ?? nextTracker.observedPeakAngle
      ?? smoothedAngle;
    nextTracker = {
      ...nextTracker,
      phase: 'bajando',
      phaseStartedAtSeconds: nextTracker.candidateDirectionStartedAtSeconds
        ?? sampleTime,
      descentStartAngle: peakAngle,
      minimumAngle: smoothedAngle,
      hasMeaningfulDescent: false,
      currentRepCounted: false,
      cyclePeakAngle: peakAngle,
      cycleValleyAngle: smoothedAngle,
      cycleHasDescent: true,
    };
  };

  if (nextTracker.phase === 'desconocida') {
    if (confirmedDirection === 'down') {
      startDescent();
    } else if (confirmedDirection === 'up') {
      nextTracker = {
        ...nextTracker,
        phase: 'arriba',
        phaseStartedAtSeconds: nextTracker.candidateDirectionStartedAtSeconds
          ?? sampleTime,
        cyclePeakAngle: nextTracker.observedPeakAngle,
        cycleValleyAngle: nextTracker.observedValleyAngle,
        cycleHasDescent: false,
      };
    }
  } else if (nextTracker.phase === 'arriba') {
    if (
      confirmedDirection === 'down'
      && nextTracker.phaseStartedAtSeconds !== null
      && sampleTime - nextTracker.phaseStartedAtSeconds
        >= MIN_PHASE_DURATION_SECONDS
    ) {
      startDescent();
    }
  } else if (nextTracker.phase === 'bajando') {
    const cyclePeak = nextTracker.cyclePeakAngle ?? smoothedAngle;
    const cycleValley = Math.min(nextTracker.cycleValleyAngle ?? smoothedAngle, smoothedAngle);
    const cycleRange = positiveRange(cyclePeak, cycleValley);
    const referenceRange = median(nextTracker.recentCycleRanges) ?? cycleRange;
    nextTracker = {
      ...nextTracker,
      cyclePeakAngle: cyclePeak,
      cycleValleyAngle: cycleValley,
      minimumAngle: cycleValley,
      hasMeaningfulDescent: referenceRange > 0
        && cyclePeak - smoothedAngle >= referenceRange * MIN_RELATIVE_DEPTH_RATIO,
    };
    if (
      confirmedDirection === 'up'
      && nextTracker.phaseStartedAtSeconds !== null
      && sampleTime - nextTracker.phaseStartedAtSeconds
        >= MIN_PHASE_DURATION_SECONDS
    ) {
      nextTracker = {
        ...nextTracker,
        phase: 'abajo',
        phaseStartedAtSeconds: sampleTime,
      };
    }
  } else if (nextTracker.phase === 'abajo') {
    const cyclePeak = nextTracker.cyclePeakAngle ?? smoothedAngle;
    const cycleValley = Math.min(nextTracker.cycleValleyAngle ?? smoothedAngle, smoothedAngle);
    const cycleRange = positiveRange(cyclePeak, cycleValley);
    const referenceRange = median(nextTracker.recentCycleRanges) ?? cycleRange;
    const recoveryRatio = cycleRange > 0
      ? Math.max(0, (smoothedAngle - cycleValley) / cycleRange)
      : 0;
    const relativeDepthRatio = referenceRange > 0
      ? cycleRange / referenceRange
      : 0;
    nextTracker = {
      ...nextTracker,
      cycleValleyAngle: cycleValley,
      minimumAngle: cycleValley,
      hasMeaningfulDescent: nextTracker.cycleHasDescent
        && relativeDepthRatio >= MIN_RELATIVE_DEPTH_RATIO,
    };

    const phaseDuration = nextTracker.phaseStartedAtSeconds === null
      ? 0
      : sampleTime - nextTracker.phaseStartedAtSeconds;
    if (
      confirmedDirection === 'down'
      && phaseDuration >= MIN_PHASE_DURATION_SECONDS
    ) {
      nextTracker = {
        ...nextTracker,
        phase: 'bajando',
        phaseStartedAtSeconds: sampleTime,
      };
    } else if (
      confirmedDirection === 'up'
      && phaseDuration >= MIN_PHASE_DURATION_SECONDS
      && nextTracker.cycleHasDescent
      && !nextTracker.currentRepCounted
      && relativeDepthRatio >= MIN_RELATIVE_DEPTH_RATIO
      && recoveryRatio >= COMPLETION_RECOVERY_RATIO
    ) {
      const depthReference = median(nextTracker.recentCycleRanges) ?? cycleRange;
      const recentCycleRanges = [
        ...nextTracker.recentCycleRanges,
        cycleRange,
      ].slice(-RECENT_CYCLE_RANGE_COUNT);
      nextTracker = {
        ...nextTracker,
        repetitions: nextTracker.repetitions + 1,
        goodRepetitions: nextTracker.goodRepetitions + 1,
        event: 'valid',
        currentRepCounted: true,
        recentCycleRanges,
      };
      completedMinimumAngle = cycleValley;
      completedCycle = {
        peakAngle: cyclePeak,
        valleyAngle: cycleValley,
        observedRange: cycleRange,
        referenceRange: depthReference,
        depthRatio: depthReference > 0 ? cycleRange / depthReference : 0,
        recoveryRatio,
        reason:
          `valle=${(depthReference > 0 ? cycleRange / depthReference : 0).toFixed(2)} `
          + `× rango observado (mínimo ${MIN_RELATIVE_DEPTH_RATIO.toFixed(2)}); `
          + `recuperación=${recoveryRatio.toFixed(2)}× ciclo `
          + `(mínimo ${COMPLETION_RECOVERY_RATIO.toFixed(2)})`,
      };
    } else if (
      confirmedDirection === 'up'
      && phaseDuration >= MIN_PHASE_DURATION_SECONDS
      && nextTracker.cycleHasDescent
      && recoveryRatio >= TOP_RECOVERY_RATIO
    ) {
      nextTracker = {
        ...nextTracker,
        phase: 'arriba',
        phaseStartedAtSeconds: sampleTime,
        descentStartAngle: null,
      };
    }
  }

  const currentCycleRange = positiveRange(
    nextTracker.cyclePeakAngle,
    nextTracker.cycleValleyAngle,
  );
  const referenceRange = median(nextTracker.recentCycleRanges) ?? currentCycleRange;
  nextTracker = {
    ...nextTracker,
    hasMeaningfulDescent: nextTracker.cycleHasDescent
      && referenceRange > 0
      && currentCycleRange / referenceRange >= MIN_RELATIVE_DEPTH_RATIO,
  };

  return {
    tracker: nextTracker,
    smoothedAngle,
    completedMinimumAngle,
    completedCycle,
  };
}
