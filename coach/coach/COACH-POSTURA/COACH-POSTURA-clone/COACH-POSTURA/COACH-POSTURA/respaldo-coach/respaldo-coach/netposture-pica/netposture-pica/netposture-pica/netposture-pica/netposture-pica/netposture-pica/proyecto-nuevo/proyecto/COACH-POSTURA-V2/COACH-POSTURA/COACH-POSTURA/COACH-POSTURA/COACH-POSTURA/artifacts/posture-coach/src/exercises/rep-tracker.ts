import type { ExerciseRepTracker } from '@/types/tracking';

export function createExerciseRepTracker(): ExerciseRepTracker {
  return {
    phase: 'esperando inicio',
    repetitions: 0,
    goodRepetitions: 0,
    endpointAngle: null,
    samples: [],
    postBottomRawSamples: [],
    event: null,
    currentRepCorrect: false,
  };
}
