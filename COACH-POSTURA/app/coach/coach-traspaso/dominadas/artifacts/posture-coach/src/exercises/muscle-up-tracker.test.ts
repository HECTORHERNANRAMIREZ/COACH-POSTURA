import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MUSCLE_UP_PULLUP_TRACKER_CONFIG } from '@/constants/muscle-up-pullup';
import {
  advanceMuscleUpPullupTracker,
  createMuscleUpPullupTracker,
} from './muscle-up-tracker';

type FrameOptions = {
  topReached?: boolean;
  headOverWrists?: boolean | null;
  atBottom?: boolean;
  atTop?: boolean;
  bodyRiseSignalActive?: boolean;
  recentMinimumRawAngle?: number | null;
  shoulderRisingThisFrame?: boolean;
  noTopCountAllowed?: boolean;
};

function armedTracker() {
  return {
    ...createMuscleUpPullupTracker(),
    phase: 'abajo' as const,
    isArmed: true,
    currentRepCorrect: true,
    samples: [150, 150, 150, 150],
    lastAngle: 150,
    confirmedHangingPosition: true,
  };
}

function advanceFrame(
  tracker: ReturnType<typeof createMuscleUpPullupTracker>,
  angle: number,
  options: FrameOptions = {},
) {
  return advanceMuscleUpPullupTracker(
    tracker,
    angle,
    options.topReached ?? false,
    options.headOverWrists ?? false,
    {
      atBottom: options.atBottom ?? false,
      atTop: options.atTop ?? false,
    },
    true,
    MUSCLE_UP_PULLUP_TRACKER_CONFIG,
    null,
    options.bodyRiseSignalActive ?? false,
    options.recentMinimumRawAngle ?? null,
    options.shoulderRisingThisFrame ?? false,
    false,
    options.noTopCountAllowed ?? false,
  ).tracker;
}

function startPull(tracker: ReturnType<typeof createMuscleUpPullupTracker>) {
  return advanceFrame(tracker, 118, {
    bodyRiseSignalActive: true,
    recentMinimumRawAngle: 118,
    shoulderRisingThisFrame: true,
    noTopCountAllowed: true,
  });
}

function returnToBottom(tracker: ReturnType<typeof createMuscleUpPullupTracker>) {
  for (const angle of [130, 140, 150, 150, 150]) {
    tracker = advanceFrame(tracker, angle, {
      headOverWrists: false,
      atBottom: true,
      atTop: angle <= 150,
      noTopCountAllowed: true,
    });
  }
  return tracker;
}

test('does not accept partial head and elbow signals while smoothing lags', () => {
  let tracker = startPull(armedTracker());

  tracker = advanceFrame(tracker, 75, {
    headOverWrists: true,
    atTop: true,
    noTopCountAllowed: true,
  });

  assert.equal(tracker.phase, 'subiendo');
  assert.equal(tracker.repetitions, 0);
  assert.equal(tracker.goodRepetitions, 0);
  assert.equal(tracker.incorrectRepetitions, 0);
});

test('counts all five validated cycles after top confirmation and return to bottom', () => {
  let tracker = armedTracker();
  const loggedMinimumAngles = [46, 68, 78, 92, 79];

  for (const [index, minimumAngle] of loggedMinimumAngles.entries()) {
    tracker = startPull(tracker);
    for (const angle of [minimumAngle, minimumAngle + 8]) {
      tracker = advanceFrame(tracker, angle, {
        headOverWrists: true,
        atTop: true,
        noTopCountAllowed: true,
      });
    }

    const topAngles = index === 0
      ? [126, 130, 135, 140, 145]
      : [89, 94, 99, 106, 103];
    for (const angle of topAngles) {
      tracker = advanceFrame(tracker, angle, {
        topReached: true,
        headOverWrists: true,
        atBottom: angle >= 125,
        atTop: true,
        noTopCountAllowed: true,
      });
    }
    assert.equal(tracker.repetitions, index + 1);

    tracker = returnToBottom(tracker);
    assert.equal(tracker.goodRepetitions, index + 1);
    assert.equal(tracker.incorrectRepetitions, 0);
  }
});

test('keeps the five logged partial-top cycles out of the good counter', () => {
  let tracker = armedTracker();
  const loggedMinimumAngles = [75, 72, 74, 81, 77];

  for (const [index, minimumAngle] of loggedMinimumAngles.entries()) {
    tracker = startPull(tracker);
    for (const angle of [minimumAngle, minimumAngle + 5, minimumAngle + 30]) {
      tracker = advanceFrame(tracker, angle, {
        headOverWrists: true,
        atTop: true,
        noTopCountAllowed: true,
      });
    }
    assert.equal(tracker.phase, 'subiendo');
    assert.equal(tracker.goodRepetitions, 0);

    tracker = returnToBottom(tracker);
    assert.equal(tracker.repetitions, index + 1);
    assert.equal(tracker.goodRepetitions, 0);
    assert.equal(tracker.incorrectRepetitions, index + 1);
  }
});
