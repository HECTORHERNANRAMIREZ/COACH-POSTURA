import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MUSCLE_UP_PULLUP_TRACKER_CONFIG } from '@/constants/muscle-up-pullup';
import type { MuscleUpPullupTracker } from '@/types/tracking';
import {
  advanceMuscleUpPullupTracker,
  createMuscleUpPullupTracker,
  settlePendingMuscleUpPullupRep,
} from './muscle-up-tracker';

function trackerReturningFromARep() {
  return {
    ...createMuscleUpPullupTracker(),
    phase: 'subiendo' as const,
    isArmed: true,
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
    assert.equal(update.tracker.event, 'valid');
  }
});

test('does not count a rep when the top evidence is missing', () => {
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

  assert.equal(update.tracker.repetitions, 0);
  assert.equal(update.tracker.goodRepetitions, 0);
  assert.equal(update.tracker.event, 'no-top');
});

test('counts a completed rep only after it returns to the bottom', () => {
  let tracker: MuscleUpPullupTracker = {
    ...createMuscleUpPullupTracker(),
    phase: 'subiendo',
    isArmed: true,
    samples: [80, 80, 80, 80, 80],
    lastAngle: 80,
  };

  for (let frame = 0; frame < MUSCLE_UP_PULLUP_TRACKER_CONFIG.topConfirmationFrames; frame += 1) {
    tracker = advanceMuscleUpPullupTracker(
      tracker,
      80,
      true,
      true,
      { atBottom: false, atTop: true },
      true,
      MUSCLE_UP_PULLUP_TRACKER_CONFIG,
      null,
      false,
      80,
    ).tracker;
  }

  assert.equal(tracker.repetitions, 0);
  assert.equal(tracker.goodRepetitions, 0);
  assert.notEqual(tracker.pendingRepHeadOverWrists, null);

  for (let frame = 0; frame < MUSCLE_UP_PULLUP_TRACKER_CONFIG.smoothingSamples + 1; frame += 1) {
    tracker = advanceMuscleUpPullupTracker(
      tracker,
      150,
      false,
      false,
      { atBottom: true, atTop: false },
      true,
      MUSCLE_UP_PULLUP_TRACKER_CONFIG,
      null,
      false,
      150,
    ).tracker;
  }

  assert.equal(tracker.repetitions, 1);
  assert.equal(tracker.goodRepetitions, 1);
});

test('settles a pending repetition only when it returns to the bottom', () => {
  const tracker = {
    ...createMuscleUpPullupTracker(),
    repetitions: 0,
    goodRepetitions: 0,
    pendingRepHeadOverWrists: true,
    pendingRepHeadFramesEvaluated: 5,
    pendingRepHeadFramesYes: 5,
  };

  const settled = settlePendingMuscleUpPullupRep(tracker, { bottomReached: true });

  assert.equal(settled.tracker.repetitions, 1);
  assert.equal(settled.tracker.goodRepetitions, 1);
  assert.ok(settled.verdict);
});

test('does not count a rep that fails the existing top-position check', () => {
  const tracker = {
    ...createMuscleUpPullupTracker(),
    pendingRepHeadOverWrists: false,
    pendingRepHeadFramesEvaluated: 5,
    pendingRepHeadFramesYes: 0,
  };

  const settled = settlePendingMuscleUpPullupRep(tracker, { bottomReached: true });

  assert.equal(settled.tracker.repetitions, 0);
  assert.equal(settled.tracker.goodRepetitions, 0);
  assert.equal(settled.verdict, null);
});
