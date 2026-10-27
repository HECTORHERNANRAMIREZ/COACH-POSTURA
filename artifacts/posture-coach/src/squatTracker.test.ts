import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  advanceSquatTracker,
  createSquatTracker,
} from './squatTracker.js';

type SyntheticSeriesOptions = {
  peak: number;
  amplitude: number;
  repetitions: number;
  analysisFps: number;
  playbackRate?: number;
  velocityDegreesPerSecond: number;
  topPauseSeconds?: number;
  bottomPauseSeconds?: number;
  startPhase?: number;
  noiseAmplitude?: number;
  simulateZeroStablePauses?: boolean;
};

function angleAt(
  timeSeconds: number,
  peak: number,
  amplitude: number,
  velocityDegreesPerSecond: number,
  topPauseSeconds: number,
  bottomPauseSeconds: number,
) {
  const movementDuration = amplitude / velocityDegreesPerSecond;
  const cycleDuration = 2 * movementDuration
    + topPauseSeconds
    + bottomPauseSeconds;
  const localTime = ((timeSeconds % cycleDuration) + cycleDuration) % cycleDuration;

  if (localTime < topPauseSeconds) return peak;
  const descentEnd = topPauseSeconds + movementDuration;
  if (localTime < descentEnd) {
    const progress = (localTime - topPauseSeconds) / movementDuration;
    return peak - amplitude * progress;
  }
  const bottomEnd = descentEnd + bottomPauseSeconds;
  if (localTime < bottomEnd) return peak - amplitude;
  const recoveryProgress = (localTime - bottomEnd) / movementDuration;
  return peak - amplitude + amplitude * recoveryProgress;
}

function runSyntheticSeries(options: SyntheticSeriesOptions) {
  const {
    peak,
    amplitude,
    repetitions,
    analysisFps,
    playbackRate = 1,
    velocityDegreesPerSecond,
    topPauseSeconds = 0,
    bottomPauseSeconds = 0,
    startPhase = 0,
    noiseAmplitude = 0,
    simulateZeroStablePauses = false,
  } = options;
  const movementDuration = amplitude / velocityDegreesPerSecond;
  const cycleDuration = 2 * movementDuration
    + topPauseSeconds
    + bottomPauseSeconds;
  const phaseOffsetSeconds = cycleDuration * startPhase;
  const endAtSeconds = cycleDuration * repetitions + 0.08;
  const sampleStepSeconds = playbackRate / analysisFps;
  let tracker = createSquatTracker();
  const completedCycles = [];
  let zeroStablePauseFrames = 0;
  let frame = 0;

  for (
    let videoTime = 0;
    videoTime <= endAtSeconds;
    videoTime += sampleStepSeconds
  ) {
    const generatedAngle = angleAt(
      videoTime + phaseOffsetSeconds,
      peak,
      amplitude,
      velocityDegreesPerSecond,
      topPauseSeconds,
      bottomPauseSeconds,
    );
    const generatedNoise = noiseAmplitude * Math.sin(frame * 0.73);
    const isPausedAtAnExtremum = generatedAngle === peak
      || generatedAngle === peak - amplitude;
    const simulatedStableFrames = isPausedAtAnExtremum ? 0 : 4;
    if (simulateZeroStablePauses && simulatedStableFrames === 0) {
      zeroStablePauseFrames += 1;
    }
    // Valid generated angles are all fed to the tracker, even when the simulated
    // stability counter is zero at a top or bottom pause.
    const update = advanceSquatTracker(
      tracker,
      generatedAngle + generatedNoise,
      videoTime,
    );
    tracker = update.tracker;
    if (update.completedCycle) completedCycles.push(update.completedCycle);
    frame += 1;
  }

  return { tracker, completedCycles, zeroStablePauseFrames };
}

function runSyntheticCyclesWithPauses(
  options: SyntheticSeriesOptions,
  pauses: Array<{ top: number; bottom: number }>,
) {
  const {
    peak,
    amplitude,
    analysisFps,
    playbackRate = 1,
    velocityDegreesPerSecond,
  } = options;
  const stepSeconds = playbackRate / analysisFps;
  const movementSteps = Math.ceil(
    amplitude / velocityDegreesPerSecond / stepSeconds,
  );
  let tracker = createSquatTracker();
  let timeSeconds = 0;
  const completedCycles = [];
  const feed = (angle: number) => {
    const update = advanceSquatTracker(tracker, angle, timeSeconds);
    tracker = update.tracker;
    if (update.completedCycle) completedCycles.push(update.completedCycle);
    timeSeconds += stepSeconds;
  };

  pauses.forEach(({ top, bottom }) => {
    const topFrames = Math.max(2, Math.ceil(top / stepSeconds));
    const bottomFrames = Math.max(2, Math.ceil(bottom / stepSeconds));
    for (let frame = 0; frame < topFrames; frame += 1) feed(peak);
    for (let step = 1; step <= movementSteps; step += 1) {
      feed(peak - (amplitude * step) / movementSteps);
    }
    for (let frame = 0; frame < bottomFrames; frame += 1) {
      feed(peak - amplitude);
    }
    for (let step = 1; step <= movementSteps; step += 1) {
      feed(peak - amplitude + (amplitude * step) / movementSteps);
    }
  });
  for (let frame = 0; frame < 3; frame += 1) feed(peak);
  return { tracker, completedCycles };
}

function baseSeries(
  overrides: Partial<SyntheticSeriesOptions> = {},
): SyntheticSeriesOptions {
  return {
    peak: 165,
    amplitude: 80,
    repetitions: 3,
    analysisFps: 20,
    playbackRate: 1,
    velocityDegreesPerSecond: 70,
    topPauseSeconds: 0.18,
    bottomPauseSeconds: 0.16,
    ...overrides,
  };
}

test('counts every generated repetition from 1 through 15 with top and bottom pauses', () => {
  for (let repetitions = 1; repetitions <= 15; repetitions += 1) {
    const { tracker, completedCycles } = runSyntheticSeries(
      baseSeries({ repetitions }),
    );
    assert.equal(tracker.repetitions, repetitions, `series of ${repetitions}`);
    assert.equal(completedCycles.length, repetitions, `cycles of ${repetitions}`);
  }
});

test('moves through the full arriba → bajando → abajo → subiendo → arriba cycle', () => {
  const { tracker } = runSyntheticSeries(baseSeries({ repetitions: 1 }));
  const phases: string[] = [];
  let sampledTracker = createSquatTracker();
  const options = baseSeries({ repetitions: 1 });
  const movementDuration = options.amplitude / options.velocityDegreesPerSecond;
  const cycleDuration = 2 * movementDuration
    + (options.topPauseSeconds ?? 0)
    + (options.bottomPauseSeconds ?? 0);
  let previousPhase = sampledTracker.phase;

  for (let videoTime = 0; videoTime <= cycleDuration + 0.1; videoTime += 1 / 20) {
    sampledTracker = advanceSquatTracker(
      sampledTracker,
      angleAt(
        videoTime,
        options.peak,
        options.amplitude,
        options.velocityDegreesPerSecond,
        options.topPauseSeconds ?? 0,
        options.bottomPauseSeconds ?? 0,
      ),
      videoTime,
    ).tracker;
    if (sampledTracker.phase !== previousPhase) {
      phases.push(sampledTracker.phase);
      previousPhase = sampledTracker.phase;
    }
  }

  assert.equal(tracker.repetitions, 1);
  assert.deepEqual(phases, ['arriba', 'bajando', 'abajo', 'subiendo', 'arriba']);
});

test('initializes at the bottom and halfway through a descent, then counts completed returns', () => {
  const options = baseSeries({ repetitions: 4 });
  const movementDuration = options.amplitude / options.velocityDegreesPerSecond;
  const cycleDuration = 2 * movementDuration
    + (options.topPauseSeconds ?? 0)
    + (options.bottomPauseSeconds ?? 0);
  const bottomPhase = (
    (options.topPauseSeconds ?? 0)
    + movementDuration
    + (options.bottomPauseSeconds ?? 0) / 2
  ) / cycleDuration;
  const fromBottom = runSyntheticSeries({
    ...options,
    startPhase: bottomPhase,
  });
  const fromMidDescent = runSyntheticSeries({
    ...options,
    startPhase: 0.38,
  });

  assert.equal(fromBottom.tracker.repetitions, options.repetitions);
  assert.equal(fromMidDescent.tracker.repetitions, options.repetitions);
  assert.equal(fromBottom.completedCycles.length, options.repetitions);
  assert.equal(fromMidDescent.completedCycles.length, options.repetitions);
});

test('accepts a bottom 5 degrees short and counts a 15-degree-short bottom as incorrect', () => {
  const fiveShort = runSyntheticSeries(baseSeries({
    peak: 165,
    amplitude: 70,
    repetitions: 2,
  }));
  const fifteenShort = runSyntheticSeries(baseSeries({
    peak: 165,
    amplitude: 60,
    repetitions: 2,
  }));

  assert.equal(fiveShort.tracker.repetitions, 2);
  assert.equal(fiveShort.tracker.goodRepetitions, 2);
  assert.ok(fiveShort.completedCycles.every((cycle) => cycle.classification === 'valid'));
  assert.equal(fifteenShort.tracker.repetitions, 2);
  assert.equal(fifteenShort.tracker.goodRepetitions, 0);
  assert.ok(fifteenShort.completedCycles.every(
    (cycle) => cycle.classification === 'too-shallow',
  ));
});

test('uses valid top and bottom extrema during pauses with zero stable frames', () => {
  const peak = 150;
  const valley = 65;
  const { tracker, completedCycles, zeroStablePauseFrames } = runSyntheticSeries(
    baseSeries({
      peak,
      amplitude: peak - valley,
      repetitions: 2,
      topPauseSeconds: 0.6,
      bottomPauseSeconds: 0.6,
      simulateZeroStablePauses: true,
    }),
  );

  assert.ok(zeroStablePauseFrames > 0);
  assert.equal(tracker.repetitions, 2);
  assert.ok(completedCycles.every((cycle) => cycle.peakAngle === peak));
  assert.ok(completedCycles.every((cycle) => cycle.valleyAngle === valley));
});

test('classifies six same-depth cycles the same despite changing pause durations', () => {
  const { tracker, completedCycles } = runSyntheticCyclesWithPauses(
    baseSeries({ peak: 165, amplitude: 80, repetitions: 6 }),
    [
      { top: 0.05, bottom: 0.65 },
      { top: 0.55, bottom: 0.05 },
      { top: 0.1, bottom: 0.3 },
      { top: 0.75, bottom: 0.7 },
      { top: 0.2, bottom: 0.15 },
      { top: 0.4, bottom: 0.5 },
    ],
  );

  assert.equal(tracker.repetitions, 6);
  assert.equal(tracker.goodRepetitions, 6);
  assert.equal(completedCycles.length, 6);
  assert.ok(completedCycles.every((cycle) => cycle.classification === 'valid'));
});

test('keeps counts stable across generated speeds, analysis rates, and playback rates', () => {
  const scenarios = [
    { velocityDegreesPerSecond: 45, analysisFps: 8, playbackRate: 0.5 },
    { velocityDegreesPerSecond: 70, analysisFps: 12, playbackRate: 1 },
    { velocityDegreesPerSecond: 105, analysisFps: 24, playbackRate: 1.5 },
    { velocityDegreesPerSecond: 85, analysisFps: 30, playbackRate: 0.8 },
  ];
  const counts = scenarios.map((scenario) => runSyntheticSeries(
    baseSeries({ ...scenario, repetitions: 5 }),
  ).tracker.repetitions);

  assert.deepEqual(counts, [5, 5, 5, 5]);
});

test('counts noisy generated repetitions without interpreting stability as a gate', () => {
  const { tracker, completedCycles } = runSyntheticSeries(baseSeries({
    repetitions: 6,
    noiseAmplitude: 3,
    analysisFps: 24,
  }));

  assert.equal(tracker.repetitions, 6);
  assert.equal(tracker.goodRepetitions, 6);
  assert.equal(completedCycles.length, 6);
});

test('uses one angular tolerance for top and bottom thresholds and logs raw extrema', () => {
  const { completedCycles } = runSyntheticSeries(baseSeries({ repetitions: 1 }));
  const cycle = completedCycles[0];

  assert.ok(cycle);
  assert.equal(cycle.topThreshold, 135);
  assert.equal(cycle.bottomMaxThreshold, 95);
  assert.equal(cycle.toleranceDegrees, 5);
  assert.ok(cycle.peakAngle > cycle.valleyAngle);
  assert.match(cycle.reason, /valle=.*<= 95°/);
});

test('counts shallow cycles as incorrect but never rejects a deeper valid cycle', () => {
  const scenarios = [
    { peak: 178, amplitude: 88, expected: 'valid' },
    { peak: 158, amplitude: 58, expected: 'too-shallow' },
    { peak: 165, amplitude: 95, expected: 'valid' },
  ] as const;

  for (const scenario of scenarios) {
    const { tracker, completedCycles } = runSyntheticSeries(baseSeries({
      peak: scenario.peak,
      amplitude: scenario.amplitude,
      repetitions: 3,
    }));
    assert.equal(tracker.repetitions, 3);
    assert.equal(completedCycles.length, 3);
    assert.ok(completedCycles.every(
      (cycle) => cycle.classification === scenario.expected,
    ));
  }
});

test('a stationary synthetic angle with bounded noise cannot create a repetition', () => {
  let tracker = createSquatTracker();
  for (let frame = 0; frame < 240; frame += 1) {
    const timeSeconds = frame / 30;
    const angle = 160 + 3 * Math.sin(frame * 0.73);
    tracker = advanceSquatTracker(tracker, angle, timeSeconds).tracker;
  }

  assert.equal(tracker.repetitions, 0);
});

test('a single generated frame spike is removed by the rolling median', () => {
  const parameters = {
    heldAngle: 160,
    frameCount: 120,
    analysisFps: 30,
    spikeFrame: 48,
    spikeDegrees: -80,
  };
  let tracker = createSquatTracker();

  for (let frame = 0; frame < parameters.frameCount; frame += 1) {
    const generatedAngle = parameters.heldAngle
      + (frame === parameters.spikeFrame ? parameters.spikeDegrees : 0);
    tracker = advanceSquatTracker(
      tracker,
      generatedAngle,
      frame / parameters.analysisFps,
    ).tracker;
  }

  assert.equal(tracker.repetitions, 0);
  assert.equal(tracker.phase, 'arriba');
});
