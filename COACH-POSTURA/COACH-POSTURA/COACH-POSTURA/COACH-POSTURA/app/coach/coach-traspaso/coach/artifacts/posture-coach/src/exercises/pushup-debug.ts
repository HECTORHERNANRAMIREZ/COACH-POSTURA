import type { ExerciseRepPhase } from '@/types/tracking';

export type PushupDebugMode = 'camera' | 'video';

export type PushupDebugAttempt = {
  id: number;
  resultado: 'correcta' | 'incorrecta' | 'incompleta';
  motivo: string | null;
  faseFinal: string;
  anguloMinimo: number | null;
  picoRetorno: number | null;
  tInicio: number | null;
  tFin: number;
};

export type PushupDebugSession = {
  mode: PushupDebugMode;
  startedAtMs: number;
  videoDurationSeconds: number | null;
  framesAnalyzed: number;
  preflightFrames: number;
  bodyDetectedFrames: number;
  measurementEnabledFrames: number;
  firstMeasurementEnabledAtSeconds: number | null;
  firstMeasurementEnableReason: string | null;
  attempts: PushupDebugAttempt[];
  openAttempt: {
    phase: string;
    startTimeSeconds: number | null;
    minimumAngle: number | null;
    returnPeakAngle: number | null;
    lastAngle: number | null;
    returnStarted: boolean;
  } | null;
  finished: boolean;
};

export type PushupDebugFrame = {
  nowMs: number;
  videoTimeSeconds: number | null;
  rawAngle: number | null;
  diagnosticRawAngle: number | null;
  smoothedAngle: number | null;
  trackerPhase: ExerciseRepPhase;
  previousTrackerPhase: ExerciseRepPhase;
  repetitions: number;
  previousRepetitions: number;
  goodRepetitions: number;
  previousGoodRepetitions: number;
  elbowTorsoAngle: number | null;
  bodyLineAngle: number | null;
  measurementEnabled: boolean;
  measurementEnableReason: string | null;
  bodyDetected: boolean;
  videoStage: 'preflight_busca_cuerpo' | 'analizando_conteo' | null;
  bottomMaxAngle: number;
  partialIncorrectAttempts?: number;
};

type PushupDebugFinish = {
  nowMs: number;
  videoTimeSeconds: number | null;
  reason: string;
  repetitions: number;
  goodRepetitions: number;
  trackerPhase: ExerciseRepPhase;
  bottomMaxAngle: number;
};

type PushupDebugLogger = (line: string) => void;

function getSessionTimeSeconds(
  session: PushupDebugSession,
  nowMs: number,
  videoTimeSeconds: number | null,
) {
  return session.mode === 'video' && videoTimeSeconds !== null
    ? videoTimeSeconds
    : Math.max(0, (nowMs - session.startedAtMs) / 1000);
}

function getAttemptPhase(
  phase: ExerciseRepPhase,
  rawAngle: number | null,
  bottomMaxAngle: number,
  returnStarted = false,
) {
  if (phase === 'en movimiento') return 'bajada';
  if (phase === 'final') {
    return returnStarted || (rawAngle !== null && rawAngle > bottomMaxAngle)
      ? 'retorno'
      : 'fondo';
  }
  return phase;
}

function closeAttempt(
  session: PushupDebugSession,
  attempt: PushupDebugAttempt,
  log: PushupDebugLogger,
) {
  session.attempts.push(attempt);
  log(`[intento] ${JSON.stringify(attempt)}`);
  session.openAttempt = null;
}

export function startPushupDebugSession(
  input: {
    mode: PushupDebugMode;
    startedAtMs: number;
    videoDurationSeconds: number | null;
  },
  log: PushupDebugLogger = console.log,
): PushupDebugSession {
  const session: PushupDebugSession = {
    ...input,
    framesAnalyzed: 0,
    preflightFrames: 0,
    bodyDetectedFrames: 0,
    measurementEnabledFrames: 0,
    firstMeasurementEnabledAtSeconds: null,
    firstMeasurementEnableReason: null,
    attempts: [],
    openAttempt: null,
    finished: false,
  };
  log(`[resumen-inicio] ${JSON.stringify({
    modo: session.mode,
    duracionVideoSegundos: session.videoDurationSeconds,
    conteoHabilitadoEnSegundo: 'pendiente',
    preflightVideo: session.mode === 'video'
      ? 'busca el cuerpo; al detectarlo, reinicia el conteo y reproduce desde t=0'
      : null,
  })}`);
  return session;
}

export function recordPushupDebugFrame(
  session: PushupDebugSession,
  frame: PushupDebugFrame,
  log: PushupDebugLogger = console.log,
) {
  if (session.finished) return;

  const t = getSessionTimeSeconds(session, frame.nowMs, frame.videoTimeSeconds);
  session.framesAnalyzed += 1;
  if (frame.videoStage === 'preflight_busca_cuerpo') session.preflightFrames += 1;
  if (frame.bodyDetected) session.bodyDetectedFrames += 1;
  if (frame.measurementEnabled) {
    session.measurementEnabledFrames += 1;
    if (session.firstMeasurementEnabledAtSeconds === null) {
      session.firstMeasurementEnabledAtSeconds = t;
      session.firstMeasurementEnableReason = frame.measurementEnableReason;
      log(`[conteo-habilitado] ${JSON.stringify({
        t,
        motivo: frame.measurementEnableReason,
      })}`);
    }
  }

  log(`[frame] ${JSON.stringify({
    t,
    anguloCrudo: frame.diagnosticRawAngle,
    anguloEntradaTracker: frame.rawAngle,
    anguloSuavizado: frame.smoothedAngle,
    faseTracker: frame.trackerPhase,
    elbowTorsoAngle: frame.elbowTorsoAngle,
    bodyLineAngle: frame.bodyLineAngle,
    medicionHabilitada: frame.measurementEnabled,
    cuerpoDetectado: frame.bodyDetected,
    etapaVideo: frame.videoStage,
  })}`);

  const fullRepCounted = frame.repetitions
    > frame.previousRepetitions + (frame.partialIncorrectAttempts ?? 0);
  const goodRepCounted = frame.goodRepetitions > frame.previousGoodRepetitions;

  if (
    session.openAttempt === null
    && frame.previousTrackerPhase === 'inicio'
    && (frame.trackerPhase === 'en movimiento' || frame.trackerPhase === 'final')
  ) {
    session.openAttempt = {
      phase: getAttemptPhase(frame.trackerPhase, frame.rawAngle, frame.bottomMaxAngle),
      startTimeSeconds: t,
      minimumAngle: frame.rawAngle,
      returnPeakAngle: null,
      lastAngle: frame.rawAngle,
      returnStarted: false,
    };
  }

  if (session.openAttempt) {
    const previousAngle = session.openAttempt.lastAngle;
    if (
      frame.trackerPhase === 'final'
      && frame.rawAngle !== null
      && previousAngle !== null
      && frame.rawAngle > previousAngle
    ) {
      session.openAttempt.returnStarted = true;
    }
    if (frame.rawAngle !== null) {
      session.openAttempt.minimumAngle = session.openAttempt.minimumAngle === null
        ? frame.rawAngle
        : Math.min(session.openAttempt.minimumAngle, frame.rawAngle);
      if (frame.trackerPhase === 'final' && frame.rawAngle > frame.bottomMaxAngle) {
        session.openAttempt.returnPeakAngle = Math.max(
          session.openAttempt.returnPeakAngle ?? frame.rawAngle,
          frame.rawAngle,
        );
      }
    }
    session.openAttempt.phase = getAttemptPhase(
      frame.trackerPhase,
      frame.rawAngle,
      frame.bottomMaxAngle,
      session.openAttempt.returnStarted,
    );
    session.openAttempt.lastAngle = frame.rawAngle;

    if (fullRepCounted) {
      closeAttempt(session, {
        id: session.attempts.length + 1,
        resultado: goodRepCounted ? 'correcta' : 'incorrecta',
        motivo: goodRepCounted ? null : 'tecnica_no_valida_en_cuadros_evaluados',
        faseFinal: 'completada',
        anguloMinimo: session.openAttempt.minimumAngle,
        picoRetorno: session.openAttempt.returnPeakAngle,
        tInicio: session.openAttempt.startTimeSeconds,
        tFin: t,
      }, log);
    } else if (
      frame.previousTrackerPhase === 'en movimiento'
      && frame.trackerPhase === 'inicio'
    ) {
      closeAttempt(session, {
        id: session.attempts.length + 1,
        resultado: 'incompleta',
        motivo: 'regreso_a_inicio_sin_fondo_detectado',
        faseFinal: 'sin_fondo',
        anguloMinimo: session.openAttempt.minimumAngle,
        picoRetorno: session.openAttempt.returnPeakAngle,
        tInicio: session.openAttempt.startTimeSeconds,
        tFin: t,
      }, log);
    }
  }

  const partialAttempts = frame.partialIncorrectAttempts ?? 0;
  for (let index = 0; index < partialAttempts; index += 1) {
    const partialAttempt = {
      id: session.attempts.length + 1,
      resultado: 'incompleta' as const,
      motivo: 'regreso_incompleto_antes_de_extender_arriba',
      faseFinal: 'retorno_parcial',
      anguloMinimo: session.openAttempt?.minimumAngle ?? frame.rawAngle,
      picoRetorno: session.openAttempt?.returnPeakAngle ?? null,
      tInicio: session.openAttempt?.startTimeSeconds ?? null,
      tFin: t,
    };
    closeAttempt(session, partialAttempt, log);
  }
}

export function finishPushupDebugSession(
  session: PushupDebugSession | null,
  finish: PushupDebugFinish,
  log: PushupDebugLogger = console.log,
) {
  if (!session || session.finished) return null;

  const t = getSessionTimeSeconds(session, finish.nowMs, finish.videoTimeSeconds);
  if (session.openAttempt) {
    const phase = session.openAttempt.phase;
    const reason = phase === 'bajada'
      ? `${finish.reason}_sin_fondo`
      : phase === 'fondo'
        ? `${finish.reason}_sin_iniciar_retorno`
        : phase === 'retorno'
          ? `${finish.reason}_sin_extension_completa`
          : `${finish.reason}_con_intento_abierto`;
    closeAttempt(session, {
      id: session.attempts.length + 1,
      resultado: 'incompleta',
      motivo: reason,
      faseFinal: phase,
      anguloMinimo: session.openAttempt.minimumAngle,
      picoRetorno: session.openAttempt.returnPeakAngle,
      tInicio: session.openAttempt.startTimeSeconds,
      tFin: t,
    }, log);
  }

  session.finished = true;
  const summary = {
    modo: session.mode,
    motivoFin: finish.reason,
    duracionVideoSegundos: session.videoDurationSeconds,
    cuadrosAnalizados: session.framesAnalyzed,
    cuadrosPreflight: session.preflightFrames,
    cuadrosConCuerpoDetectado: session.bodyDetectedFrames,
    cuadrosConMedicionHabilitada: session.measurementEnabledFrames,
    segundoConteoHabilitado: session.firstMeasurementEnabledAtSeconds,
    motivoPrimerConteoHabilitado: session.firstMeasurementEnableReason,
    repetitions: finish.repetitions,
    goodRepetitions: finish.goodRepetitions,
    incorrectasDerivadas: Math.max(0, finish.repetitions - finish.goodRepetitions),
    intentosDetectados: session.attempts.length,
    intentos: session.attempts,
    faseAlFinalizar: finish.trackerPhase,
    anguloFondoMaximoUsado: finish.bottomMaxAngle,
  };
  log(`[resumen-final] ${JSON.stringify(summary)}`);
  return summary;
}
