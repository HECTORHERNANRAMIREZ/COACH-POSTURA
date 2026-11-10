import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  addMuscleUpIncorrectAttemptCounts,
  advanceMuscleUpIncorrectAttemptTracker,
  createMuscleUpIncorrectAttemptTracker,
} from './muscle-up-incorrect-tracker';

test('counts a completed incorrect attempt that the primary tracker did not count', () => {
  const started = advanceMuscleUpIncorrectAttemptTracker(
    createMuscleUpIncorrectAttemptTracker(),
    {
      attemptStarted: true,
      attemptCompleted: false,
      primaryRepetitions: 0,
      reason: 'no-top',
    },
  );
  const completed = advanceMuscleUpIncorrectAttemptTracker(started.tracker, {
    attemptStarted: false,
    attemptCompleted: true,
    primaryRepetitions: 0,
    reason: 'no-top',
  });

  assert.equal(completed.countedIncorrect, true);
  assert.equal(completed.reason, 'no-top');
  assert.equal(completed.tracker.attemptActive, false);
  assert.equal(completed.tracker.incorrectRepetitions, 1);
});

test('counts four separate no-top attempts in one session', () => {
  let tracker = createMuscleUpIncorrectAttemptTracker();

  for (let attempt = 0; attempt < 4; attempt += 1) {
    tracker = advanceMuscleUpIncorrectAttemptTracker(tracker, {
      attemptStarted: true,
      attemptCompleted: false,
      primaryRepetitions: 0,
      reason: 'no-top',
    }).tracker;
    tracker = advanceMuscleUpIncorrectAttemptTracker(tracker, {
      attemptStarted: false,
      attemptCompleted: true,
      primaryRepetitions: 0,
      reason: 'no-top',
    }).tracker;
  }

  assert.equal(tracker.incorrectRepetitions, 4);
  assert.equal(tracker.attemptActive, false);
});

test('does not double-count an attempt recorded by the primary tracker', () => {
  const started = advanceMuscleUpIncorrectAttemptTracker(
    createMuscleUpIncorrectAttemptTracker(),
    {
      attemptStarted: true,
      attemptCompleted: false,
      primaryRepetitions: 2,
      reason: 'other',
    },
  );
  const completed = advanceMuscleUpIncorrectAttemptTracker(started.tracker, {
    attemptStarted: false,
    attemptCompleted: true,
    primaryRepetitions: 3,
    reason: 'other',
  });

  assert.equal(completed.countedIncorrect, false);
  assert.equal(completed.tracker.incorrectRepetitions, 0);
});

test('leaves an unfinished attempt uncounted', () => {
  const started = advanceMuscleUpIncorrectAttemptTracker(
    createMuscleUpIncorrectAttemptTracker(),
    {
      attemptStarted: true,
      attemptCompleted: false,
      primaryRepetitions: 0,
      reason: 'other',
    },
  );
  const stillActive = advanceMuscleUpIncorrectAttemptTracker(started.tracker, {
    attemptStarted: false,
    attemptCompleted: false,
    primaryRepetitions: 0,
    reason: 'other',
  });

  assert.equal(stillActive.tracker.attemptActive, true);
  assert.equal(stillActive.tracker.incorrectRepetitions, 0);
});

test('adds only sidecar incorrects to displayed total and incorrect counts', () => {
  const combined = addMuscleUpIncorrectAttemptCounts(
    { repetitions: 2, incorrectRepetitions: 0, goodRepetitions: 2 },
    {
      attemptActive: false,
      primaryRepetitionsAtStart: 2,
      incorrectRepetitions: 3,
    },
  );

  assert.deepEqual(combined, {
    repetitions: 5,
    incorrectRepetitions: 3,
    goodRepetitions: 2,
  });
});
