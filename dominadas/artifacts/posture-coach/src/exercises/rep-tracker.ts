import {
  PUSHUP_SMOOTHING_SAMPLES,
  SQUAT_SMOOTHING_SAMPLES,
} from '@/constants/base';
import { isWithinAngle } from '@/exercises/angle-checks';
import { median } from '@/exercises/pullup-tracker';
import type {
  ExerciseRepConfig,
  ExerciseRepTracker,
  ExerciseRepTrackerUpdate,
} from '@/types/tracking';

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

export function advanceExerciseRepTracker(
  tracker: ExerciseRepTracker,
  rawAngle: number,
  config: ExerciseRepConfig,
  techniqueValid = true,
  // TEMP-DIAGNOSTICO: permite decidir solo la fase con un ángulo externo, sin guardarlo como medición.
  phaseOnly = false,
): ExerciseRepTrackerUpdate {
  // TEMP-DIAGNOSTICO: phaseOnly solo llega desde uploadedDipRawPhaseRescue; incluirlo refresca la ventana sin guardarlo como medición.
  const samples = [...tracker.samples, rawAngle].slice(
    -(config.smoothingSamples ?? SQUAT_SMOOTHING_SAMPLES),
  );
  const smoothedAngle = median(samples) ?? rawAngle;
  const postBottomRawSamples = config.postBottomRawPeakForReturn
    && tracker.phase === 'final'
    && !phaseOnly
    ? [...tracker.postBottomRawSamples, rawAngle].slice(-PUSHUP_SMOOTHING_SAMPLES)
    : tracker.postBottomRawSamples;
  const postBottomRawPeak = postBottomRawSamples.length
    ? Math.max(...postBottomRawSamples)
    : null;
  const nextTracker: ExerciseRepTracker = {
    ...tracker,
    samples,
    postBottomRawSamples,
    event: null,
  };
  const isAtStart = isWithinAngle(
    phaseOnly ? rawAngle : smoothedAngle,
    config.startMinAngle,
    config.startMaxAngle,
  );
  const smoothedHasActivated = phaseOnly
    ? config.direction === 'decrease'
      ? rawAngle < config.activationAngle
      : rawAngle > config.activationAngle
    : config.direction === 'decrease'
      ? smoothedAngle < config.activationAngle
      : smoothedAngle > config.activationAngle;
  const rawHasActivated = (phaseOnly || config.rawAngleCanReachEnd) && (
    config.direction === 'decrease'
      ? rawAngle < config.activationAngle
      : rawAngle > config.activationAngle
  );
  const rawIsAtEnd = (phaseOnly || config.rawAngleCanReachEnd) && isWithinAngle(
    rawAngle,
    config.endMinAngle,
    config.endMaxAngle,
  );
  const hasActivated = smoothedHasActivated || rawHasActivated;
  const isAtEnd = phaseOnly
    ? rawIsAtEnd
    : config.rawAngleCanReachEnd
    ? rawIsAtEnd
    : isWithinAngle(
        smoothedAngle,
        config.endMinAngle,
        config.endMaxAngle,
      );
  let completedEndpointAngle: number | null = null;

  if (nextTracker.phase === 'esperando inicio') {
    if (isAtStart) {
      nextTracker.phase = 'inicio';
      if (!phaseOnly) {
        nextTracker.endpointAngle = null;
        nextTracker.currentRepCorrect = config.techniqueStartsOnActivation
          ? true
          : techniqueValid;
      }
    }
  } else if (nextTracker.phase === 'inicio') {
    if (hasActivated) {
      nextTracker.phase = rawIsAtEnd ? 'final' : 'en movimiento';
      if (!phaseOnly && config.postBottomRawPeakForReturn && rawIsAtEnd) {
        nextTracker.postBottomRawSamples = [];
      }
      if (!phaseOnly) {
        nextTracker.endpointAngle = rawIsAtEnd ? rawAngle : smoothedAngle;
        nextTracker.currentRepCorrect = config.techniqueStartsOnActivation
          ? techniqueValid
          : nextTracker.currentRepCorrect && techniqueValid;
      }
      if (rawIsAtEnd && !phaseOnly) {
        completedEndpointAngle = rawAngle;
      }
    } else if (!isAtStart) {
      nextTracker.phase = 'esperando inicio';
      nextTracker.currentRepCorrect = false;
    }
  } else if (nextTracker.phase === 'en movimiento') {
    if (!phaseOnly && config.techniqueMustHoldThroughout !== false) {
      nextTracker.currentRepCorrect = nextTracker.currentRepCorrect && techniqueValid;
    }
    const endpointReading = config.rawAngleCanReachEnd ? rawAngle : smoothedAngle;
    if (!phaseOnly) {
      nextTracker.endpointAngle = config.direction === 'decrease'
        ? Math.min(nextTracker.endpointAngle ?? endpointReading, endpointReading)
        : Math.max(nextTracker.endpointAngle ?? endpointReading, endpointReading);
    }

    if (isAtEnd) {
      nextTracker.phase = 'final';
      if (!phaseOnly && config.postBottomRawPeakForReturn) {
        nextTracker.postBottomRawSamples = [];
      }
      // Una lectura intermedia aislada puede perder un punto mientras el
      // cuerpo sigue visible. Para flexiones de video se evalúa la técnica en
      // el fondo y al regresar, no se invalida toda la repetición por ese
      // único frame.
      if (!phaseOnly) {
        nextTracker.currentRepCorrect = nextTracker.currentRepCorrect
          && (config.techniqueMustHoldThroughout === false || techniqueValid);
        completedEndpointAngle = nextTracker.endpointAngle;
      }
      if (!phaseOnly && !config.countOnReturn) {
        if (config.countOnlyWhenCorrect !== true || nextTracker.currentRepCorrect) {
          nextTracker.event = 'valid';
          nextTracker.repetitions += 1;
          if (nextTracker.currentRepCorrect) {
            nextTracker.goodRepetitions += 1;
          }
        }
      }
    } else if (isAtStart) {
      const lastObservedEndpointAngle = nextTracker.endpointAngle;
      nextTracker.phase = 'inicio';
      if (!phaseOnly) {
        nextTracker.endpointAngle = null;
        nextTracker.currentRepCorrect = config.techniqueStartsOnActivation
          ? true
          : techniqueValid;
      }
      if (!phaseOnly && config.countReturnWithoutEndAsIncorrect) {
        nextTracker.event = 'valid';
        nextTracker.repetitions += 1;
        completedEndpointAngle = lastObservedEndpointAngle;
      }
    }
  } else if (nextTracker.phase === 'final') {
    if (config.countOnReturn) {
      if (
        !phaseOnly
        &&
        config.techniqueStartsOnActivation
        && config.techniqueMustHoldThroughout !== false
      ) {
        nextTracker.currentRepCorrect = nextTracker.currentRepCorrect && techniqueValid;
      }
      const hasReturnedFromEnd = config.direction === 'decrease'
        ? (phaseOnly ? rawAngle : smoothedAngle) > config.endMaxAngle
        : (phaseOnly ? rawAngle : smoothedAngle) < config.endMinAngle;
      const returnAngleForActivation = phaseOnly
        ? rawAngle
        : config.postBottomRawPeakForReturn
          ? postBottomRawPeak
          : smoothedAngle;
      const hasReturnedPastActivation = config.direction === 'decrease'
        ? returnAngleForActivation !== null
          && returnAngleForActivation >= config.activationAngle
        : returnAngleForActivation !== null
          && returnAngleForActivation <= config.activationAngle;
      const requiresReturnPastActivation = config.requireReturnPastActivation === true
        || config.countReturnWithoutEndAsIncorrect === true;

      if (
        hasReturnedFromEnd
        && isAtStart
        && (
          !requiresReturnPastActivation
          || hasReturnedPastActivation
        )
      ) {
        const repetitionWasCorrect = nextTracker.currentRepCorrect
          && (phaseOnly || techniqueValid);
        nextTracker.phase = 'inicio';
        if (!phaseOnly && config.countOnlyWhenCorrect === true && !repetitionWasCorrect) {
          nextTracker.currentRepCorrect = techniqueValid;
          nextTracker.endpointAngle = null;
          completedEndpointAngle = null;
        } else {
          nextTracker.event = 'valid';
          nextTracker.repetitions += 1;
          if (repetitionWasCorrect) {
            nextTracker.goodRepetitions += 1;
          }
          if (!phaseOnly) {
            nextTracker.currentRepCorrect = config.techniqueStartsOnActivation
              ? true
              : techniqueValid;
            completedEndpointAngle = nextTracker.endpointAngle;
          }
        }
      }
    } else if (isAtStart) {
      nextTracker.phase = 'inicio';
      if (!phaseOnly && config.techniqueStartsOnActivation) {
        nextTracker.currentRepCorrect = true;
      }
    }
  }

  return { tracker: nextTracker, smoothedAngle, completedEndpointAngle };
}
