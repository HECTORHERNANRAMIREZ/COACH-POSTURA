import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  advanceIncompletePushupAttemptTracker,
  createIncompletePushupAttemptTracker,
  finishIncompletePushupAttempt,
  getUploadedPushupPreflightHoldMs,
} from './incomplete-pushup-tracker.js';

function feedAngles(angles: number[]) {
  let tracker = createIncompletePushupAttemptTracker();
  let completedIncorrectAttempts = 0;
  angles.forEach((angle, index) => {
    const update = advanceIncompletePushupAttemptTracker(
      tracker,
      angle,
      index / 10,
    );
    tracker = update.tracker;
    completedIncorrectAttempts += update.completedIncorrectAttempts;
  });
  return { tracker, completedIncorrectAttempts };
}

test('counts an incomplete push-up return without changing correct-rep tracking', () => {
  const { tracker, completedIncorrectAttempts } = feedAngles([
    143, 120, 101, 94, 100, 111, 107, 100, 96,
  ]);

  assert.equal(completedIncorrectAttempts, 1);
  assert.equal(finishIncompletePushupAttempt(tracker).completedIncorrectAttempts, 0);
});

test('counts a partial return that is still open when the clip ends', () => {
  const { tracker, completedIncorrectAttempts } = feedAngles([
    145, 118, 94, 101, 110,
  ]);

  assert.equal(completedIncorrectAttempts, 0);
  assert.equal(finishIncompletePushupAttempt(tracker).completedIncorrectAttempts, 1);
});

test('does not count a full return or small angle noise as a partial attempt', () => {
  const completeReturn = feedAngles([145, 118, 94, 101, 120, 145]);
  const smallMovement = feedAngles([145, 132, 125, 117, 116, 119]);

  assert.equal(completeReturn.completedIncorrectAttempts, 0);
  assert.equal(finishIncompletePushupAttempt(completeReturn.tracker).completedIncorrectAttempts, 0);
  assert.equal(smallMovement.completedIncorrectAttempts, 0);
  assert.equal(finishIncompletePushupAttempt(smallMovement.tracker).completedIncorrectAttempts, 0);
});

test('uses a shorter valid-points preflight for short clips only', () => {
  assert.equal(getUploadedPushupPreflightHoldMs(4.34), 2340);
  assert.equal(getUploadedPushupPreflightHoldMs(9.17), 5000);
  assert.equal(getUploadedPushupPreflightHoldMs(2), 1000);
  assert.equal(getUploadedPushupPreflightHoldMs(Number.NaN), 5000);
});
