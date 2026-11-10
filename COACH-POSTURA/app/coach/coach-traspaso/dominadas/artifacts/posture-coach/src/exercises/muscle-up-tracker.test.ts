import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MUSCLE_UP_PULLUP_TRACKER_CONFIG } from '@/constants/muscle-up-pullup';
import {
  advanceMuscleUpPullupTracker,
  createMuscleUpPullupTracker,
} from './muscle-up-tracker';

function trackerReturningFromARep() {
  return {
    ...createMuscleUpPullupTracker(),
    phase: 'subiendo' as const,
    isArmed: true,
    currentRepCorrect: true,
    samples: [150, 147, 145, 144],
    lastAngle: 144,
  };
}

test('counts a correct rep after five consecutive geometric top frames', () => {
  let tracker = {
    ...createMuscleUpPullupTracker(),
    phase: 'subiendo' as const,
    isArmed: true,
    currentRepCorrect: true,
    samples: [151, 147, 128, 109],
    lastAngle: 147,
    minimumAngle: 147,
  };
  const topAngles = [119, 72, 76, 89, 79];

  for (const angle of topAngles) {
    const update = advanceMuscleUpPullupTracker(
      tracker,
      angle,
      true,
      true,
      { atBottom: false, atTop: true },
      true,
      MUSCLE_UP_PULLUP_TRACKER_CONFIG,
      null,
      false,
      angle,
      false,
      false,
      true,
    );
    tracker = update.tracker;

    if (angle === topAngles[0]) {
      assert.equal(update.smoothedAngle, 128);
      assert.equal(tracker.phase, 'subiendo');
      assert.equal(tracker.repetitions, 0);
      assert.equal(tracker.event, null);
    }
  }

  assert.equal(tracker.phase, 'arriba');
  assert.equal(tracker.repetitions, 1);
  assert.equal(tracker.goodRepetitions, 0);
  assert.equal(tracker.incorrectRepetitions, 0);
  assert.equal(tracker.event, 'valid');
  assert.equal(tracker.currentRepCorrect, true);
  assert.equal(tracker.pendingRepHeadOverWrists, true);
});

test('keeps no-top reps incorrect when the top evidence is missing', () => {
  const update = advanceMuscleUpPullupTracker(
    trackerReturningFromARep(),
    150,
    false,
    false,
    { atBottom: false, atTop: false },
    true,
    MUSCLE_UP_PULLUP_TRACKER_CONFIG,
    null,
    false,
    72,
    false,
    false,
    true,
  );

  assert.equal(update.tracker.repetitions, 1);
  assert.equal(update.tracker.goodRepetitions, 0);
  assert.equal(update.tracker.incorrectRepetitions, 1);
  assert.equal(update.tracker.event, 'no-top');
});

test('does not close a pull when the smoothed angle lags in the bottom range', () => {
  let tracker = {
    ...createMuscleUpPullupTracker(),
    phase: 'subiendo' as const,
    isArmed: true,
    currentRepCorrect: true,
    samples: [151, 147, 128, 109],
    lastAngle: 147,
    minimumAngle: 147,
  };

  const laggingBottomFrame = advanceMuscleUpPullupTracker(
    tracker,
    90,
    false,
    true,
    { atBottom: false, atTop: true },
    true,
    MUSCLE_UP_PULLUP_TRACKER_CONFIG,
    null,
    true,
    90,
    true,
    false,
    true,
  );
  tracker = laggingBottomFrame.tracker;

  assert.equal(laggingBottomFrame.smoothedAngle, 128);
  assert.equal(tracker.phase, 'subiendo');
  assert.equal(tracker.repetitions, 0);
  assert.equal(tracker.goodRepetitions, 0);
  assert.equal(tracker.event, null);

  for (const angle of [69, 74, 83, 99, 118]) {
    tracker = advanceMuscleUpPullupTracker(
      tracker,
      angle,
      true,
      true,
      { atBottom: false, atTop: true },
      true,
      MUSCLE_UP_PULLUP_TRACKER_CONFIG,
      null,
      false,
      angle,
      false,
      false,
      true,
    ).tracker;
  }

  assert.equal(tracker.phase, 'arriba');
  assert.equal(tracker.repetitions, 1);
  assert.equal(tracker.goodRepetitions, 0);
  assert.equal(tracker.event, 'valid');
  assert.equal(tracker.pendingRepHeadOverWrists, true);

  for (const angle of [150, 160, 165]) {
    tracker = advanceMuscleUpPullupTracker(
      tracker,
      angle,
      false,
      false,
      { atBottom: true, atTop: false },
      true,
      MUSCLE_UP_PULLUP_TRACKER_CONFIG,
      null,
      false,
      angle,
      false,
      false,
      true,
    ).tracker;
  }

  assert.equal(tracker.phase, 'abajo');
  assert.equal(tracker.repetitions, 1);
  assert.equal(tracker.goodRepetitions, 1);
  assert.equal(tracker.incorrectRepetitions, 0);
  assert.equal(tracker.event, 'valid');
});
