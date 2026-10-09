import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  advanceSquatTracker,
  createSquatTracker,
} from './squatTracker.js';

type SyntheticSeriesOptions = {
  peak: number;
  valley: number;
  cycles: number;
  analysisFps: number;
  playbackRate: number;
  startAtSeconds?: number;
  noiseAmplitude?: number;
};

function angleAt(
  timeSeconds: number,
  peak: number,
  valley: number,
  cycleDurationSeconds = 2,
) {
  const cycleTime = ((timeSeconds % cycleDurationSeconds) + cycleDurationSeconds)
    % cycleDurationSeconds;
  const topHold = cycleDurationSeconds * 0.15;
  const descentDuration = cycleDurationSeconds * 0.35;
  const bottomHold = cycleDurationSeconds * 0.1;
  const recoveryDuration = cycleDurationSeconds * 0.4;

  if (cycleTime < topHold) return peak;
  if (cycleTime < topHold + descentDuration) {
    const progress = (cycleTime - topHold) / descentDuration;
    return peak + (valley - peak) * progress;
  }
  if (cycleTime < topHold + descentDuration + bottomHold) return valley;
  const progress = (
    cycleTime - topHold - descentDuration - bottomHold
  ) / recoveryDuration;
  return valley + (peak - valley) * progress;
}

function runSyntheticSeries(options: SyntheticSeriesOptions) {
  const {
    peak,
    valley,
    cycles,
    analysisFps,
    playbackRate,
    startAtSeconds = 0,
    noiseAmplitude = 0,
  } = options;
  const cycleDurationSeconds = 2;
  const endAtSeconds = cycleDurationSeconds * cycles + 0.7;
  const videoTimeStep = playbackRate / analysisFps;
  let tracker = createSquatTracker();
  const completedCycles = [];

  for (
    let videoTime = startAtSeconds;
    videoTime <= endAtSeconds;
    videoTime += videoTimeStep
  ) {
    const deterministicNoise = noiseAmplitude * Math.sin(videoTime * 29.7);
    const update = advanceSquatTracker(
      tracker,
      angleAt(videoTime, peak, valley, cycleDurationSeconds) + deterministicNoise,
      true,
      videoTime,
    );
    tracker = update.tracker;
    if (update.completedCycle) completedCycles.push(update.completedCycle);
  }

  return { tracker, completedCycles };
}

test('smooths each valid angle even when confidence has not stabilized', () => {
  let tracker = createSquatTracker();
  const first = advanceSquatTracker(tracker, 150, true, 0);
  tracker = first.tracker;

  const unstable = advanceSquatTracker(tracker, 130, false, 0.08);
  assert.ok(unstable.smoothedAngle < first.smoothedAngle);
  assert.equal(unstable.tracker.repetitions, 0);
  assert.equal(unstable.tracker.phase, 'desconocida');
  assert.equal(unstable.tracker.lastSampleTimeSeconds, 0.08);
});

test('ignores a one-frame bounce instead of entering the descent phase', () => {
  let tracker = createSquatTracker();
  const phases = new Set<string>();
  for (let index = 0; index < 45; index += 1) {
    const timeSeconds = index / 30;
    const rawAngle = index === 15 ? 80 : 160;
    const update = advanceSquatTracker(tracker, rawAngle, true, timeSeconds);
    tracker = update.tracker;
    phases.add(tracker.phase);
  }

  assert.equal(tracker.repetitions, 0);
  assert.equal(phases.has('bajando'), false);
  assert.equal(phases.has('abajo'), false);
});

test('counts cycles across different angle ranges, sampling rates and playback rates', () => {
  const cases = [
    { peak: 154, valley: 104, analysisFps: 8, playbackRate: 0.5 },
    { peak: 174, valley: 72, analysisFps: 12, playbackRate: 1 },
    { peak: 162, valley: 88, analysisFps: 27, playbackRate: 1.75 },
  ];
  const counts = cases.map((scenario) => (
    runSyntheticSeries({
      ...scenario,
      cycles: 3,
      noiseAmplitude: 0.35,
    }).tracker.repetitions
  ));

  assert.deepEqual(counts, [3, 3, 3]);
});

test('starts in an unknown phase and counts the first completed cycle from mid-descent', () => {
  const { tracker, completedCycles } = runSyntheticSeries({
    peak: 168,
    valley: 82,
    cycles: 3,
    analysisFps: 15,
    playbackRate: 0.65,
    startAtSeconds: 0.62,
  });

  assert.equal(tracker.repetitions, 3);
  assert.equal(completedCycles.length, tracker.repetitions);
  assert.ok(completedCycles[0].peakAngle > completedCycles[0].valleyAngle);
  assert.ok(completedCycles[0].observedRange > 0);
  assert.ok(completedCycles[0].recoveryRatio >= 0.58);
  assert.match(completedCycles[0].reason, /rango observado/);
});

test('does not count a cycle with a range below the recent relative range', () => {
  let tracker = createSquatTracker();
  const analysisFps = 20;
  const cycleDurationSeconds = 2;
  for (let time = 0; time <= cycleDurationSeconds * 3.4; time += 1 / analysisFps) {
    const cycleNumber = Math.floor(time / cycleDurationSeconds);
    const localTime = time % cycleDurationSeconds;
    const amplitude = cycleNumber < 2 ? 90 : 25;
    const peak = 165;
    const valley = peak - amplitude;
    const update = advanceSquatTracker(
      tracker,
      angleAt(localTime, peak, valley, cycleDurationSeconds),
      true,
      time,
    );
    tracker = update.tracker;
  }

  assert.equal(tracker.repetitions, 2);
});
