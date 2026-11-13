import type { PosePoint } from '@/pose3d';

export type PushupLandmarkSide = 'left' | 'right';

export type PushupLandmarkJoint =
  | 'shoulder'
  | 'elbow'
  | 'wrist'
  | 'hip'
  | 'knee'
  | 'ankle';

export type PushupLandmarkObservation = {
  side: PushupLandmarkSide;
  joint: PushupLandmarkJoint;
  rawModel: PosePoint | undefined;
  afterSideAssignment: PosePoint | undefined;
  afterBoneConstraints: PosePoint | undefined;
  filtered: PosePoint | undefined;
  accepted: boolean;
  reason: string;
  measurementSide: boolean;
};

export type PushupLandmarkFrame = {
  videoTimeSeconds: number;
  videoDurationSeconds: number | null;
  guideTone: string;
  guideMessage: string;
  calibrationFrameReady: boolean;
  measurementSide: PushupLandmarkSide | null;
  modelReturnedPose: boolean;
  points: PushupLandmarkObservation[];
  elbowAngles: Record<PushupLandmarkSide, {
    rawModel: number | null;
    filtered: number | null;
  }>;
};

export type PushupLandmarkDebugSession = {
  videoDurationSeconds: number | null;
  lastSampledVideoTimeSeconds: number | null;
  framesSampled: number;
  points: Record<string, {
    modelDetectedFrames: number;
    finalPresentFrames: number;
    finalFreshFrames: number;
    acceptedFrames: number;
    modelScoreSum: number;
    modelScoreCount: number;
    modelVisibilitySum: number;
    modelVisibilityCount: number;
    modelPresenceSum: number;
    modelPresenceCount: number;
    finalScoreSum: number;
    finalScoreCount: number;
    finalVisibilitySum: number;
    finalVisibilityCount: number;
    finalPresenceSum: number;
    finalPresenceCount: number;
  }>;
  finished: boolean;
};

type Logger = (line: string) => void;

const SAMPLE_INTERVAL_SECONDS = 0.2;
const SIDES: PushupLandmarkSide[] = ['left', 'right'];
const JOINTS: PushupLandmarkJoint[] = [
  'shoulder',
  'elbow',
  'wrist',
  'hip',
  'knee',
  'ankle',
];

function createPointStats(): PushupLandmarkDebugSession['points'][string] {
  return {
    modelDetectedFrames: 0,
    finalPresentFrames: 0,
    finalFreshFrames: 0,
    acceptedFrames: 0,
    modelScoreSum: 0,
    modelScoreCount: 0,
    modelVisibilitySum: 0,
    modelVisibilityCount: 0,
    modelPresenceSum: 0,
    modelPresenceCount: 0,
    finalScoreSum: 0,
    finalScoreCount: 0,
    finalVisibilitySum: 0,
    finalVisibilityCount: 0,
    finalPresenceSum: 0,
    finalPresenceCount: 0,
  };
}

function finiteOrNull(value: number | undefined) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function pointSnapshot(point: PosePoint | undefined) {
  return {
    presente: Boolean(point),
    x: finiteOrNull(point?.x),
    y: finiteOrNull(point?.y),
    visibility: finiteOrNull(point?.visibility),
    presence: finiteOrNull(point?.presence),
    score: finiteOrNull(point?.score),
    retenido: Boolean(point && (point.held || (point.heldFrames ?? 0) > 0)),
    heldFrames: point?.heldFrames ?? null,
    heldReason: point?.heldReason ?? null,
    swapped: point?.swapped ?? false,
  };
}

function addConfidence(
  stats: PushupLandmarkDebugSession['points'][string],
  point: PosePoint | undefined,
  stage: 'model' | 'final',
) {
  if (!point) return;
  const score = finiteOrNull(point.score);
  const visibility = finiteOrNull(point.visibility);
  const presence = finiteOrNull(point.presence);

  if (stage === 'model') {
    if (score !== null) {
      stats.modelScoreSum += score;
      stats.modelScoreCount += 1;
    }
    if (visibility !== null) {
      stats.modelVisibilitySum += visibility;
      stats.modelVisibilityCount += 1;
    }
    if (presence !== null) {
      stats.modelPresenceSum += presence;
      stats.modelPresenceCount += 1;
    }
    return;
  }

  if (score !== null) {
    stats.finalScoreSum += score;
    stats.finalScoreCount += 1;
  }
  if (visibility !== null) {
    stats.finalVisibilitySum += visibility;
    stats.finalVisibilityCount += 1;
  }
  if (presence !== null) {
    stats.finalPresenceSum += presence;
    stats.finalPresenceCount += 1;
  }
}

function percentage(count: number, total: number) {
  return total > 0 ? Number(((count / total) * 100).toFixed(1)) : null;
}

function average(sum: number, count: number) {
  return count > 0 ? Number((sum / count).toFixed(3)) : null;
}

function buildSummary(session: PushupLandmarkDebugSession) {
  const points: Record<string, unknown> = {};
  SIDES.forEach((side) => {
    JOINTS.forEach((joint) => {
      const key = `${side}.${joint}`;
      const stats = session.points[key];
      points[key] = {
        cuadrosMuestreados: session.framesSampled,
        porcentajeModeloDetectado: percentage(
          stats.modelDetectedFrames,
          session.framesSampled,
        ),
        confianzaPromedioModelo: average(
          stats.modelScoreSum,
          stats.modelScoreCount,
        ),
        visibilityPromedioModelo: average(
          stats.modelVisibilitySum,
          stats.modelVisibilityCount,
        ),
        presencePromedioModelo: average(
          stats.modelPresenceSum,
          stats.modelPresenceCount,
        ),
        porcentajePresenteTrasFiltros: percentage(
          stats.finalPresentFrames,
          session.framesSampled,
        ),
        porcentajeFrescoTrasFiltros: percentage(
          stats.finalFreshFrames,
          session.framesSampled,
        ),
        porcentajeAceptadoPorCalibracion: percentage(
          stats.acceptedFrames,
          session.framesSampled,
        ),
        confianzaPromedioFinalFresca: average(
          stats.finalScoreSum,
          stats.finalScoreCount,
        ),
        visibilityPromedioFinalFresca: average(
          stats.finalVisibilitySum,
          stats.finalVisibilityCount,
        ),
        presencePromedioFinalFresca: average(
          stats.finalPresenceSum,
          stats.finalPresenceCount,
        ),
      };
    });
  });
  return {
    duracionVideoSegundos: session.videoDurationSeconds,
    cuadrosMuestreados: session.framesSampled,
    intervaloMuestreoSegundos: SAMPLE_INTERVAL_SECONDS,
    confianzaPromedio: 'score de PosePoint (max visibility/presence)',
    puntos,
  };
}

export function startPushupLandmarkDebugSession(
  videoDurationSeconds: number | null,
  log: Logger = console.log,
): PushupLandmarkDebugSession {
  const points: PushupLandmarkDebugSession['points'] = {};
  SIDES.forEach((side) => {
    JOINTS.forEach((joint) => {
      points[`${side}.${joint}`] = createPointStats();
    });
  });
  const session: PushupLandmarkDebugSession = {
    videoDurationSeconds,
    lastSampledVideoTimeSeconds: null,
    framesSampled: 0,
    points,
    finished: false,
  };
  log(`[landmarks-inicio] ${JSON.stringify({
    duracionVideoSegundos: videoDurationSeconds,
    intervaloMuestreoSegundos: SAMPLE_INTERVAL_SECONDS,
  })}`);
  return session;
}

export function recordPushupLandmarkFrame(
  session: PushupLandmarkDebugSession,
  frame: PushupLandmarkFrame,
  log: Logger = console.log,
) {
  if (session.finished || !Number.isFinite(frame.videoTimeSeconds)) return false;
  const previousTime = session.lastSampledVideoTimeSeconds;
  if (
    previousTime !== null
    && frame.videoTimeSeconds >= previousTime
    && frame.videoTimeSeconds - previousTime < SAMPLE_INTERVAL_SECONDS
  ) {
    return false;
  }

  session.lastSampledVideoTimeSeconds = frame.videoTimeSeconds;
  session.framesSampled += 1;
  frame.points.forEach((observation) => {
    const stats = session.points[`${observation.side}.${observation.joint}`];
    if (!stats) return;
    if (observation.rawModel) stats.modelDetectedFrames += 1;
    if (observation.filtered) stats.finalPresentFrames += 1;
    if (
      observation.filtered
      && !observation.filtered.held
      && (observation.filtered.heldFrames ?? 0) === 0
    ) {
      stats.finalFreshFrames += 1;
      addConfidence(stats, observation.filtered, 'final');
    }
    if (observation.accepted) stats.acceptedFrames += 1;
    addConfidence(stats, observation.rawModel, 'model');
  });

  log(`[landmarks] ${JSON.stringify({
    t: frame.videoTimeSeconds,
    duracionVideoSegundos: frame.videoDurationSeconds,
    guia: {
      estado: frame.guideTone,
      mensaje: frame.guideMessage,
    },
    cuadroCalibracionValido: frame.calibrationFrameReady,
    ladoMedido: frame.measurementSide,
    poseDevueltaPorModelo: frame.modelReturnedPose,
    codoAngle: frame.elbowAngles,
    puntos: frame.points.map((observation) => ({
      lado: observation.side,
      articulacion: observation.joint,
      modelo: pointSnapshot(observation.rawModel),
      trasAsignacionLados: pointSnapshot(observation.afterSideAssignment),
      trasRestriccionHuesos: pointSnapshot(observation.afterBoneConstraints),
      filtrado: pointSnapshot(observation.filtered),
      ladoUsadoEnCalibracion: observation.measurementSide,
      aceptado: observation.accepted,
      motivo: observation.reason,
    })),
  })}`);
  return true;
}

export function finishPushupLandmarkDebugSession(
  session: PushupLandmarkDebugSession | null,
  reason: string,
  log: Logger = console.log,
) {
  if (!session || session.finished) return null;
  session.finished = true;
  const summary = {
    motivoFin: reason,
    ...buildSummary(session),
  };
  log(`[landmarks-resumen] ${JSON.stringify(summary)}`);
  return summary;
}
