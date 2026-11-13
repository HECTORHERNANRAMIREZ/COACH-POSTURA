export type PushupAttemptResult = 'correcta' | 'incompleta' | null;

export type PushupAttemptReason =
  | 'sin_extension_completa'
  | 'no_llego_al_fondo';

type PushupCountedRep = {
  repNumero: number;
  tConteo: number;
};

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
  completedAttempts: PushupAttemptLog[];
  countedReps: PushupCountedRep[];
  matchedAttemptIds: Set<number>;
  matchedRepNumbers: Set<number>;
  incompleteAssociatedCount: number;
  onIncompleteAssociatedCountChange: ((count: number) => void) | null;
  ended: boolean;
};

export type PushupAttemptLog = {
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
const PUSHUP_ATTEMPT_MATCH_TOLERANCE_SECONDS = 0.1;
const observerStates = new WeakMap<HTMLVideoElement, PushupAttemptObserverState>();
const observedVideos = new WeakSet<HTMLVideoElement>();
let buildTagLogged = false;
let attemptUiBuildTagLogged = false;

function createObserverState(
  source: string,
  onIncompleteAssociatedCountChange: ((count: number) => void) | null = null,
): PushupAttemptObserverState {
  return {
    source,
    nextAttemptId: 1,
    lastVideoTime: null,
    lastAngle: null,
    attempt: null,
    completedAttempts: [],
    countedReps: [],
    matchedAttemptIds: new Set(),
    matchedRepNumbers: new Set(),
    incompleteAssociatedCount: 0,
    onIncompleteAssociatedCountChange,
    ended: false,
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
  const tPicoRetorno = attempt.tPicoRetorno;
  if (
    tPicoRetorno === null
    || attempt.picoRetorno === null
    || videoDuration === null
    || videoDuration - tPicoRetorno < PUSHUP_MIN_END_MARGIN_SECONDS
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
  completionTime: number | null,
): PushupAttemptLog {
  const tFin = hasReturn ? completionTime : null;
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
  return log;
}

function publishIncompleteAssociatedCount(state: PushupAttemptObserverState): void {
  state.onIncompleteAssociatedCountChange?.(state.incompleteAssociatedCount);
}

function matchCompletedAttempts(state: PushupAttemptObserverState): void {
  const attempts = [...state.completedAttempts].sort(
    (left, right) => left.tInicio - right.tInicio || left.id - right.id,
  );
  const reps = [...state.countedReps].sort(
    (left, right) => left.tConteo - right.tConteo || left.repNumero - right.repNumero,
  );

  attempts.forEach((attempt) => {
    if (
      state.matchedAttemptIds.has(attempt.id)
      || attempt.tFin === null
    ) {
      return;
    }
    const matchingRep = reps.find((rep) => (
      !state.matchedRepNumbers.has(rep.repNumero)
      && rep.tConteo >= attempt.tInicio - PUSHUP_ATTEMPT_MATCH_TOLERANCE_SECONDS
      && rep.tConteo <= attempt.tFin! + PUSHUP_ATTEMPT_MATCH_TOLERANCE_SECONDS
    ));
    if (!matchingRep) return;

    state.matchedAttemptIds.add(attempt.id);
    state.matchedRepNumbers.add(matchingRep.repNumero);
    if (attempt.resultado === 'incompleta') {
      state.incompleteAssociatedCount += 1;
    }
    console.log('[match]', JSON.stringify({
      idIntento: attempt.id,
      repNumero: matchingRep.repNumero,
      tConteo: round(matchingRep.tConteo, 3),
      tInicio: round(attempt.tInicio, 3),
      tFin: round(attempt.tFin, 3),
      resultado: attempt.resultado,
    }));
  });
  publishIncompleteAssociatedCount(state);
}

function addCompletedAttempt(
  state: PushupAttemptObserverState,
  attempt: PushupAttempt,
  videoDuration: number | null,
  hasReturn: boolean,
  completionTime: number | null,
): void {
  state.completedAttempts.push(
    logAttempt(attempt, videoDuration, hasReturn, completionTime),
  );
  matchCompletedAttempts(state);
}

function logUnmatchedAttempts(state: PushupAttemptObserverState): void {
  state.completedAttempts.forEach((attempt) => {
    if (state.matchedAttemptIds.has(attempt.id)) return;
    console.log('[intento-sin-match]', JSON.stringify({
      idIntento: attempt.id,
      resultado: attempt.resultado,
      tInicio: round(attempt.tInicio, 3),
      tFin: round(attempt.tFin, 3),
    }));
  });
}

function attachEndedListener(video: HTMLVideoElement): void {
  if (observedVideos.has(video)) return;
  video.addEventListener('ended', () => finishAtVideoEnd(video));
  observedVideos.add(video);
}

function finishAtVideoEnd(video: HTMLVideoElement): void {
  const state = observerStates.get(video);
  if (!state || state.ended) return;
  state.ended = true;
  const videoDuration = Number.isFinite(video.duration) ? video.duration : null;
  if (state.attempt) {
    const hasReturn = state.attempt.fase === 'retorno';
    const completionTime = Number.isFinite(video.currentTime)
      ? video.currentTime
      : null;
    addCompletedAttempt(
      state,
      state.attempt,
      videoDuration,
      hasReturn,
      completionTime,
    );
    state.attempt = null;
  }
  matchCompletedAttempts(state);
  logUnmatchedAttempts(state);
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
  onIncompleteAssociatedCountChange?: (count: number) => void,
): void {
  const videoTime = Number.isFinite(video.currentTime) ? video.currentTime : null;
  const videoDuration = Number.isFinite(video.duration) ? video.duration : null;
  const source = video.currentSrc || video.src;
  let state = observerStates.get(video);

  if (!state || state.source !== source) {
    state = createObserverState(source, onIncompleteAssociatedCountChange ?? null);
    observerStates.set(video, state);
    onIncompleteAssociatedCountChange?.(0);
  } else if (onIncompleteAssociatedCountChange) {
    state.onIncompleteAssociatedCountChange = onIncompleteAssociatedCountChange;
  }

  attachEndedListener(video);

  if (!buildTagLogged) {
    console.log('[build] attempt-observer v1');
    buildTagLogged = true;
  }
  if (!attemptUiBuildTagLogged) {
    console.log('[build] attempt-ui v1');
    attemptUiBuildTagLogged = true;
  }

  if (videoTime === null) return;
  if (state.ended) {
    if (state.lastVideoTime === null || videoTime >= state.lastVideoTime) return;
  }
  if (state.lastVideoTime !== null && videoTime < state.lastVideoTime) {
    const resetState = createObserverState(
      source,
      state.onIncompleteAssociatedCountChange,
    );
    observerStates.set(video, resetState);
    state = resetState;
    publishIncompleteAssociatedCount(state);
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
    addCompletedAttempt(state, attempt, videoDuration, true, videoTime);
    state.attempt = startAttempt(state, videoTime, elbowAngle);
  }
  state.lastAngle = elbowAngle;
}

export function recordUploadedPushupRepCount(
  video: HTMLVideoElement,
  repNumero: number,
  tConteo: number,
): void {
  const state = observerStates.get(video);
  if (
    !state
    || state.ended
    || !Number.isInteger(repNumero)
    || repNumero < 1
    || !Number.isFinite(tConteo)
    || state.countedReps.some((rep) => rep.repNumero === repNumero)
  ) {
    return;
  }
  state.countedReps.push({ repNumero, tConteo });
  matchCompletedAttempts(state);
}

export function resetUploadedPushupAttemptObserver(
  video: HTMLVideoElement | null,
  onIncompleteAssociatedCountChange?: (count: number) => void,
): void {
  onIncompleteAssociatedCountChange?.(0);
  if (!video) return;
  const source = video.currentSrc || video.src;
  const state = createObserverState(source, onIncompleteAssociatedCountChange ?? null);
  observerStates.set(video, state);
  attachEndedListener(video);
}
