import { ANGLE_DISPLAY_SAMPLES } from '@/constants/base';
import { STANDARD_PULLUP_TRACKER_CONFIG } from '@/constants/pullup';
import { sideKeypoints } from '@/constants/side-keypoints';
import { isCommandPullup, isStandardOrSupinePullup } from '@/exercises/guards';
import { isWithinPullupAngle } from '@/exercises/angle-checks';
import { calculateAngle } from '@/exercises/point-geometry';
import type { PosePoint } from '@/pose3d';
import type {
  ExerciseId,
  MuscleUpPullupRepVerdict,
  MuscleUpPullupTracker,
  PoseSide,
  PullupTracker,
  PullupTrackerConfig,
  TechniqueFeedback,
} from '@/types/tracking';
import type {
  PullupExtremityReadings,
  PullupExtremityValidation,
  PullupRepVerdict,
} from '@/types/pullup';

export function createPullupTracker(): PullupTracker {
  return {
    phase: 'esperando abajo',
    repetitions: 0,
    goodRepetitions: 0,
    minimumAngle: null,
    samples: [],
    event: null,
    lastAngle: null,
    topFrames: 0,
    currentRepCorrect: false,
    bottomReadyFrames: 0,
    isArmed: false,
    pendingRepHeadOverWrists: null,
    topConfirmationHeadFramesEvaluated: 0,
    topConfirmationHeadFramesYes: 0,
    pendingRepHeadFramesEvaluated: 0,
    pendingRepHeadFramesYes: 0,
    suppressNextRepCountUntilBottom: false,
  };
}

export function median(values: number[]) {
  const sorted = [...values].sort((first, second) => first - second);
  return sorted[Math.floor(sorted.length / 2)] ?? null;
}

export function smoothAngleReading(
  value: number | null,
  samplesRef: { current: number[] },
) {
  if (value === null) {
    samplesRef.current = [];
    return null;
  }

  samplesRef.current = [
    ...samplesRef.current,
    value,
  ].slice(-ANGLE_DISPLAY_SAMPLES);
  return median(samplesRef.current) ?? value;
}

export function getPullupExtremityReadings(
  keypoints: PosePoint[] | undefined,
): PullupExtremityReadings {
  if (!keypoints) {
    return {
      left: { shoulder: null, elbow: null },
      right: { shoulder: null, elbow: null },
    };
  }

  const sideReadings = (side: PoseSide) => {
    const indexes = sideKeypoints[side];
    return {
      shoulder: calculateAngle(
        keypoints[indexes.hip],
        keypoints[indexes.shoulder],
        keypoints[indexes.elbow],
      ),
      elbow: calculateAngle(
        keypoints[indexes.shoulder],
        keypoints[indexes.elbow],
        keypoints[indexes.wrist],
      ),
    };
  };

  const [left, right] = (['left', 'right'] as PoseSide[]).map(sideReadings);
  return { left, right };
}

export function getPullupExtremityValidation(
  keypoints: PosePoint[] | undefined,
  extremityReadings = getPullupExtremityReadings(keypoints),
  side: PoseSide | null = null,
  config: PullupTrackerConfig = STANDARD_PULLUP_TRACKER_CONFIG,
): PullupExtremityValidation {
  const allElbowsInRange = (min: number, max: number) => (
    (side ? [extremityReadings[side]] : [extremityReadings.left, extremityReadings.right]).every((reading) => {
      const value = reading.elbow;
      return value !== null && isWithinPullupAngle(value, min, max);
    })
  );

  return {
    atBottom: allElbowsInRange(config.bottomMinAngle, config.bottomMaxAngle),
    atTop: allElbowsInRange(config.topElbowMinAngle, config.topElbowMaxAngle),
  };
}

export function settlePendingPullupRep(
  tracker: PullupTracker,
  options: {
    bottomReached: boolean;
    sessionEnded?: boolean;
    noLockout?: boolean;
  },
): { tracker: PullupTracker; verdict: PullupRepVerdict | null } {
  if (tracker.pendingRepHeadOverWrists === null) {
    return { tracker, verdict: null };
  }

  const headFramesEvaluated = tracker.pendingRepHeadFramesEvaluated;
  const headFramesYes = tracker.pendingRepHeadFramesYes;
  const headOverWrists = headFramesYes > 0;
  const correct = !options.noLockout
    && headOverWrists
    && (options.bottomReached || options.sessionEnded === true);
  const reason = options.noLockout
    ? 'no-lockout'
    : !headOverWrists
      ? 'no-top-cabeza'
      : options.bottomReached || options.sessionEnded === true
        ? 'ok'
        : 'no-fondo';
  const nextTracker: PullupTracker = {
    ...tracker,
    pendingRepHeadOverWrists: null,
    pendingRepHeadFramesEvaluated: 0,
    pendingRepHeadFramesYes: 0,
    currentRepCorrect: correct,
    goodRepetitions: tracker.goodRepetitions + (correct ? 1 : 0),
    event: options.noLockout ? 'no-lockout' : correct ? 'valid' : 'invalid',
  };

  return {
    tracker: nextTracker,
    verdict: {
      repetition: tracker.repetitions,
      headOverWrists,
      headFramesEvaluated,
      headFramesYes,
      bottomReached: options.bottomReached,
      correct,
      reason,
    },
  };
}

export function logPullupVerdict(
  exercise: ExerciseId | null | undefined,
  verdict: PullupRepVerdict,
  measuredSide: PoseSide | null = null,
) {
  if (!isStandardOrSupinePullup(exercise) && !isCommandPullup(exercise)) return;

  console.log(
    `[pullup-veredicto] ejercicio=${exercise} `
    + (isCommandPullup(exercise) && measuredSide !== null
      ? `ladoMedido=${measuredSide === 'left' ? 'izquierdo' : measuredSide === 'right' ? 'derecho' : 'no definido'} `
      : '')
    + `repeticion=${verdict.repetition} `
    + `cabezaSobreMuñecas=${verdict.headOverWrists ? 'sí' : 'no'} `
    + `cuadrosCabezaEvaluados=${verdict.headFramesEvaluated} `
    + `cuadrosCabezaSi=${verdict.headFramesYes} `
    + `bajoAlFondo=${verdict.bottomReached ? 'sí' : 'no'} `
    + `veredicto=${verdict.correct ? 'correcta' : 'incorrecta'} `
    + `motivo=${verdict.reason}`,
  );
}

export function logMuscleUpPullupVerdict(verdict: MuscleUpPullupRepVerdict) {
  console.log(
    `[pullup-veredicto] ejercicio=muscle-up `
    + `repeticion=${verdict.repetition} `
    + `cabezaSobreMuñecas=${verdict.headOverWrists ? 'sí' : 'no'} `
    + `cuadrosCabezaEvaluados=${verdict.headFramesEvaluated} `
    + `cuadrosCabezaSi=${verdict.headFramesYes} `
    + `bajoAlFondo=${verdict.bottomReached ? 'sí' : 'no'} `
    + `veredicto=${verdict.correct ? 'correcta' : 'incorrecta'} `
    + `motivo=${verdict.reason}`,
  );
}

export function getMuscleUpPullupVerdictFeedback(
  verdict: MuscleUpPullupRepVerdict,
): TechniqueFeedback {
  return {
    tone: verdict.correct ? 'success' : 'warning',
    message: `Repetición ${verdict.repetition}: ${
      verdict.correct ? 'BIEN ✓' : 'EVALUADA'
    }`,
    detail: verdict.reason === 'no-top-cabeza'
      ? 'La repetición no alcanzó la posición alta con la cabeza sobre las muñecas.'
      : verdict.reason === 'no-fondo'
        ? 'La repetición terminó sin regresar al fondo antes de soltar la barra.'
        : verdict.reason === 'no-lockout'
          ? 'La repetición no alcanzó el rango alto de los codos.'
          : verdict.correct
            ? 'Recorrido completo: posición alta validada y regreso al fondo.'
            : 'El recorrido se evaluó como incorrecto.',
  };
}

export function logMuscleUpPullupFinish(tracker: MuscleUpPullupTracker) {
  console.log(
    `[fin] ejercicio=muscle-up fase=${tracker.phase}`
    + ` | total=${tracker.repetitions}`
    + ` | correctas=${tracker.goodRepetitions}`
    + ` | incorrectas=${tracker.incorrectRepetitions}`
    + ` | motivo=${tracker.lastIncorrectReason ?? '—'}`
    + ` | pendientes=${tracker.pendingRepHeadOverWrists === null ? 0 : 1}`,
  );
}
