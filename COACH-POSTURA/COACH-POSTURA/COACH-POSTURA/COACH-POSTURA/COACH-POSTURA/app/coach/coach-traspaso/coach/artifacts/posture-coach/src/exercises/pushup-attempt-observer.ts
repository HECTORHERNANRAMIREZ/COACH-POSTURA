export type PushupAttemptResult = 'correcta' | 'incompleta' | null;

export type PushupAttemptReason =
  | 'sin_extension_completa'
  | 'no_llego_al_fondo';

type PushupAttemptPhase = 'bajada' | 'retorno';

type PushupAttempt = {
  id: number;
  fase: PushupAttemptPhase;
  tInicio: number;
  anguloMinimo: number;
  picoRetorno: number | null;
  tPicoRetorno: number | null;
};

type PushupAttemptObserverState = {
  source: string;
  nextAttemptId: number;
  lastVideoTime: number | null;
  lastAngle: number | null;
  attempt: PushupAttempt | null;
  ended: boolean;
  endedListenerAttached: boolean;
};

type PushupAttemptLog = {
  id: number;
  resultado: PushupAttemptResult;
  motivos: PushupAttemptReason[];
  anguloMinimo: number | null;
  picoRetorno: number | null;
  tInicio: number;
  tFin: number | null;
  duracionCiclo: number | null;
};

const PUSHUP_RETURN_DROP_DEGREES = 15;
const PUSHUP_MIN_END_MARGIN_SECONDS = 0.5;
const observerStates = new WeakMap<HTMLVideoElement, PushupAttemptObserverState>();
let buildTagLogged = false;

function createObserverState(source: string): PushupAttemptObserverState {
  return {
    source,
    nextAttemptId: 1,
    lastVideoTime: null,
    lastAngle: null,
    attempt: null,
    ended: false,
    endedListenerAttached: false,
  };
}

function round(value: number | null, digits = 2): number | null {
  if (value === null || !Number.isFinite(value)) return null;
  return Number(value.toFixed(digits));
}

function classifyAttempt(
  attempt: PushupAttempt,
  videoDuration: number | null,
): { resultado: PushupAttemptResult; motivos: PushupAttemptReason[] } {
  const tFin = attempt.tPicoRetorno;
  if (
    tFin === null
    || attempt.picoRetorno === null
    || videoDuration === null
    || videoDuration - tFin < PUSHUP_MIN_END_MARGIN_SECONDS
  ) {
    return { resultado: null, motivos: [] };
  }

  const motivos: PushupAttemptReason[] = [];
  if (attempt.picoRetorno < 150) motivos.push('sin_extension_completa');
  if (attempt.anguloMinimo > 118) motivos.push('no_llego_al_fondo');
  return {
    resultado: motivos.length > 0 ? 'incompleta' : 'correcta',
    motivos,
  };
}

function logAttempt(
  attempt: PushupAttempt,
  videoDuration: number | null,
  hasReturn: boolean,
): void {
  const tFin = hasReturn ? attempt.tPicoRetorno : null;
  const { resultado, motivos } = hasReturn
    ? classifyAttempt(attempt, videoDuration)
    : { resultado: null, motivos: [] };
  const log: PushupAttemptLog = {
    id: attempt.id,
    resultado,
    motivos,
    anguloMinimo: round(attempt.anguloMinimo),
    picoRetorno: hasReturn ? round(attempt.picoRetorno) : null,
    tInicio: round(attempt.tInicio, 3) ?? attempt.tInicio,
    tFin: round(tFin, 3),
    duracionCiclo: tFin === null
      ? null
      : round(tFin - attempt.tInicio, 3),
  };
  console.log('[intento]', JSON.stringify(log));
}

function finishAtVideoEnd(video: HTMLVideoElement): void {
  const state = observerStates.get(video);
  if (!state || state.ended) return;
  state.ended = true;
  if (!state.attempt) return;

  const videoDuration = Number.isFinite(video.duration) ? video.duration : null;
  const hasReturn = state.attempt.fase === 'retorno';
  logAttempt(state.attempt, videoDuration, hasReturn);
  state.attempt = null;
}

function startAttempt(
  state: PushupAttemptObserverState,
  videoTime: number,
  elbowAngle: number,
): PushupAttempt {
  const attempt: PushupAttempt = {
    id: state.nextAttemptId,
    fase: 'bajada',
    tInicio: videoTime,
    anguloMinimo: elbowAngle,
    picoRetorno: null,
    tPicoRetorno: null,
  };
  state.nextAttemptId += 1;
  return attempt;
}

/**
 * Observes the raw repetition angle for an uploaded push-up video.
 * This function is diagnostic-only and never interacts with the rep tracker.
 */
export function observeUploadedPushupAttemptFrame(
  video: HTMLVideoElement,
  elbowAngle: number | null,
): void {
  const videoTime = Number.isFinite(video.currentTime) ? video.currentTime : null;
  const videoDuration = Number.isFinite(video.duration) ? video.duration : null;
  const source = video.currentSrc || video.src;
  let state = observerStates.get(video);

  if (!state || state.source !== source) {
    state = createObserverState(source);
    observerStates.set(video, state);
  }

  if (!state.endedListenerAttached) {
    video.addEventListener('ended', () => finishAtVideoEnd(video));
    state.endedListenerAttached = true;
  }

  if (!buildTagLogged) {
    console.log('[build] attempt-observer v1');
    buildTagLogged = true;
  }

  if (videoTime === null) return;
  if (state.ended) {
    if (state.lastVideoTime === null || videoTime >= state.lastVideoTime) return;
    state.lastAngle = null;
    state.attempt = null;
    state.ended = false;
  }
  if (state.lastVideoTime !== null && videoTime < state.lastVideoTime) {
    state.lastAngle = null;
    state.attempt = null;
  }
  state.lastVideoTime = videoTime;
  if (elbowAngle === null || !Number.isFinite(elbowAngle)) return;

  const attempt = state.attempt;
  if (!attempt) {
    if (state.lastAngle !== null && elbowAngle < state.lastAngle) {
      state.attempt = startAttempt(state, videoTime, elbowAngle);
    }
    state.lastAngle = elbowAngle;
    return;
  }

  if (attempt.fase === 'bajada') {
    if (elbowAngle < attempt.anguloMinimo) {
      attempt.anguloMinimo = elbowAngle;
    } else if (elbowAngle > attempt.anguloMinimo) {
      attempt.fase = 'retorno';
      attempt.picoRetorno = elbowAngle;
      attempt.tPicoRetorno = videoTime;
    }
    state.lastAngle = elbowAngle;
    return;
  }

  if (attempt.picoRetorno === null || elbowAngle > attempt.picoRetorno) {
    attempt.picoRetorno = elbowAngle;
    attempt.tPicoRetorno = videoTime;
  }

  if (
    attempt.picoRetorno !== null
    && attempt.picoRetorno - elbowAngle >= PUSHUP_RETURN_DROP_DEGREES
  ) {
    logAttempt(attempt, videoDuration, true);
    state.attempt = startAttempt(state, videoTime, elbowAngle);
  }
  state.lastAngle = elbowAngle;
}
