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

test('counts the five logged reps as correct when the head and elbow confirm the top', () => {
  const loggedRepSignals = [
    { angle: 119, topReached: true },
    { angle: 72, topReached: false },
    { angle: 76, topReached: false },
    { angle: 89, topReached: false },
    { angle: 79, topReached: false },
  ];

  for (const { angle, topReached } of loggedRepSignals) {
    const update = advanceMuscleUpPullupTracker(
      trackerReturningFromARep(),
      angle,
      topReached,
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

    assert.equal(update.tracker.repetitions, 1);
    assert.equal(update.tracker.goodRepetitions, 1);
    assert.equal(update.tracker.incorrectRepetitions, 0);
    assert.equal(update.tracker.event, 'valid');
    assert.equal(update.tracker.currentRepCorrect, true);
  }
});

test('keeps no-top reps incorrect when the top evidence is missing', () => {
  const update = advanceMuscleUpPullupTracker(
    trackerReturningFromARep(),
    72,
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
