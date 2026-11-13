export type IncompletePushupAttemptTracker = {
  phase: 'waiting-top' | 'descending' | 'returning';
  startAngle: number | null;
  minimumAngle: number | null;
  returnPeakAngle: number | null;
  descentStarted: boolean;
  minimumDescentDegrees: number;
  lastVideoTimeSeconds: number | null;
};

export type IncompletePushupAttemptUpdate = {
  tracker: IncompletePushupAttemptTracker;
  completedIncorrectAttempts: number;
};

const PARTIAL_PUSHUP_START_ANGLE = 130;
const PARTIAL_PUSHUP_ACTIVATION_ANGLE = 120;
const PARTIAL_PUSHUP_MIN_INITIAL_DESCENT_DEGREES = 18;
const PARTIAL_PUSHUP_MIN_RETURN_DEGREES = 15;
const PARTIAL_PUSHUP_MIN_REPEATED_DESCENT_DEGREES = 12;
const PARTIAL_PUSHUP_SEEK_TOLERANCE_SECONDS = 0.25;

export function createIncompletePushupAttemptTracker(): IncompletePushupAttemptTracker {
  return {
    phase: 'waiting-top',
    startAngle: null,
    minimumAngle: null,
    returnPeakAngle: null,
    descentStarted: false,
    minimumDescentDegrees: PARTIAL_PUSHUP_MIN_INITIAL_DESCENT_DEGREES,
    lastVideoTimeSeconds: null,
  };
}

export function advanceIncompletePushupAttemptTracker(
  tracker: IncompletePushupAttemptTracker,
  angle: number,
  videoTimeSeconds: number,
): IncompletePushupAttemptUpdate {
  if (!Number.isFinite(angle) || !Number.isFinite(videoTimeSeconds)) {
    return { tracker, completedIncorrectAttempts: 0 };
  }

  const videoWasRewound = tracker.lastVideoTimeSeconds !== null
    && videoTimeSeconds
      < tracker.lastVideoTimeSeconds - PARTIAL_PUSHUP_SEEK_TOLERANCE_SECONDS;
  const nextTracker = videoWasRewound
    ? createIncompletePushupAttemptTracker()
    : { ...tracker };
  nextTracker.lastVideoTimeSeconds = videoTimeSeconds;

  if (nextTracker.phase === 'waiting-top') {
    if (angle >= PARTIAL_PUSHUP_START_ANGLE) {
      nextTracker.phase = 'descending';
      nextTracker.startAngle = angle;
      nextTracker.minimumAngle = angle;
      nextTracker.descentStarted = false;
    }
    return { tracker: nextTracker, completedIncorrectAttempts: 0 };
  }

  if (nextTracker.phase === 'descending') {
    if (!nextTracker.descentStarted && angle > PARTIAL_PUSHUP_ACTIVATION_ANGLE) {
      nextTracker.startAngle = Math.max(nextTracker.startAngle ?? angle, angle);
    }
    nextTracker.minimumAngle = Math.min(nextTracker.minimumAngle ?? angle, angle);

    if (
      angle <= PARTIAL_PUSHUP_ACTIVATION_ANGLE
      && (nextTracker.startAngle ?? angle) - angle
        >= nextTracker.minimumDescentDegrees
    ) {
      nextTracker.descentStarted = true;
    }

    if (
      nextTracker.descentStarted
      && angle - (nextTracker.minimumAngle ?? angle) >= PARTIAL_PUSHUP_MIN_RETURN_DEGREES
    ) {
      nextTracker.phase = 'returning';
      nextTracker.returnPeakAngle = angle;
    }
    return { tracker: nextTracker, completedIncorrectAttempts: 0 };
  }

  if (angle >= PARTIAL_PUSHUP_ACTIVATION_ANGLE) {
    const resetTracker = createIncompletePushupAttemptTracker();
    if (angle >= PARTIAL_PUSHUP_START_ANGLE) {
      resetTracker.phase = 'descending';
      resetTracker.startAngle = angle;
      resetTracker.minimumAngle = angle;
    }
    resetTracker.lastVideoTimeSeconds = videoTimeSeconds;
    return { tracker: resetTracker, completedIncorrectAttempts: 0 };
  }

  nextTracker.returnPeakAngle = Math.max(
    nextTracker.returnPeakAngle ?? angle,
    angle,
  );
  if (
    (nextTracker.returnPeakAngle ?? angle) - angle
    < PARTIAL_PUSHUP_MIN_RETURN_DEGREES
  ) {
    return { tracker: nextTracker, completedIncorrectAttempts: 0 };
  }

  const newStartAngle = nextTracker.returnPeakAngle ?? angle;
  nextTracker.phase = 'descending';
  nextTracker.startAngle = newStartAngle;
  nextTracker.minimumAngle = angle;
  nextTracker.returnPeakAngle = null;
  nextTracker.minimumDescentDegrees = PARTIAL_PUSHUP_MIN_REPEATED_DESCENT_DEGREES;
  nextTracker.descentStarted = newStartAngle - angle
    >= PARTIAL_PUSHUP_MIN_REPEATED_DESCENT_DEGREES;

  return { tracker: nextTracker, completedIncorrectAttempts: 1 };
}

export function finishIncompletePushupAttempt(
  tracker: IncompletePushupAttemptTracker,
): IncompletePushupAttemptUpdate {
  const returnStayedIncomplete = tracker.phase === 'returning'
    && tracker.returnPeakAngle !== null
    && tracker.returnPeakAngle < PARTIAL_PUSHUP_ACTIVATION_ANGLE;
  return {
    tracker: createIncompletePushupAttemptTracker(),
    completedIncorrectAttempts: returnStayedIncomplete ? 1 : 0,
  };
}

export function getUploadedPushupPreflightHoldMs(
  durationSeconds: number,
  standardHoldMs = 5000,
): number {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    return standardHoldMs;
  }
  const shortClipHoldMs = Math.max(1000, (durationSeconds - 2) * 1000);
  return Math.min(standardHoldMs, shortClipHoldMs);
}
