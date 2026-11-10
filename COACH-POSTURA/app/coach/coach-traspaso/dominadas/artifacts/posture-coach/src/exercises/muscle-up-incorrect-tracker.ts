export type MuscleUpIncorrectAttemptReason = 'no-top' | 'no-lockout' | 'other';

export type MuscleUpIncorrectAttemptTracker = {
  attemptActive: boolean;
  primaryRepetitionsAtStart: number;
  incorrectRepetitions: number;
};

export type MuscleUpIncorrectAttemptUpdate = {
  tracker: MuscleUpIncorrectAttemptTracker;
  countedIncorrect: boolean;
  reason: MuscleUpIncorrectAttemptReason | null;
};

type MuscleUpIncorrectAttemptFrame = {
  attemptStarted: boolean;
  attemptCompleted: boolean;
  primaryRepetitions: number;
  reason: MuscleUpIncorrectAttemptReason;
};

export function createMuscleUpIncorrectAttemptTracker(): MuscleUpIncorrectAttemptTracker {
  return {
    attemptActive: false,
    primaryRepetitionsAtStart: 0,
    incorrectRepetitions: 0,
  };
}

export function advanceMuscleUpIncorrectAttemptTracker(
  tracker: MuscleUpIncorrectAttemptTracker,
  frame: MuscleUpIncorrectAttemptFrame,
): MuscleUpIncorrectAttemptUpdate {
  if (frame.attemptStarted) {
    if (tracker.attemptActive) {
      return { tracker, countedIncorrect: false, reason: null };
    }
    return {
      tracker: {
        ...tracker,
        attemptActive: true,
        primaryRepetitionsAtStart: frame.primaryRepetitions,
      },
      countedIncorrect: false,
      reason: null,
    };
  }

  if (!tracker.attemptActive || !frame.attemptCompleted) {
    return { tracker, countedIncorrect: false, reason: null };
  }

  const primaryCounterWasReset = frame.primaryRepetitions
    < tracker.primaryRepetitionsAtStart;
  const primaryTrackerCountedAttempt = frame.primaryRepetitions
    > tracker.primaryRepetitionsAtStart;
  const countedIncorrect = !primaryCounterWasReset
    && !primaryTrackerCountedAttempt;

  return {
    tracker: {
      ...tracker,
      attemptActive: false,
      primaryRepetitionsAtStart: frame.primaryRepetitions,
      incorrectRepetitions: tracker.incorrectRepetitions
        + (countedIncorrect ? 1 : 0),
    },
    countedIncorrect,
    reason: countedIncorrect ? frame.reason : null,
  };
}

type MuscleUpPrimaryCounts = {
  repetitions: number;
  incorrectRepetitions: number;
};

export function addMuscleUpIncorrectAttemptCounts<T extends MuscleUpPrimaryCounts>(
  primaryTracker: T,
  incorrectTracker: MuscleUpIncorrectAttemptTracker,
): T {
  return {
    ...primaryTracker,
    repetitions: primaryTracker.repetitions + incorrectTracker.incorrectRepetitions,
    incorrectRepetitions:
      primaryTracker.incorrectRepetitions + incorrectTracker.incorrectRepetitions,
  };
}
