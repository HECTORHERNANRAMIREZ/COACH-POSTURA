import type { ExerciseView } from '@/view-estimation';
import type { Pose } from '@/pose3d';
export type PoseSide = 'left' | 'right';
export type SessionPhase = 'exercise-select' | 'requesting' | 'loading-model' | 'tracking' | 'error';
export type PoseCandidate = {
  pose: Pose;
  centerX: number;
  centerY: number;
  area: number;
  prominence: number;
};
export type PoseTrack = {
  centerX: number;
  centerY: number;
  area: number;
  lostFrames: number;
};
export type DiagnosticPoint = {
  label: string;
  score: number | null;
  side: 'izq.' | 'der.' | '—';
};
export type TechniqueFeedbackTone = 'checking' | 'success' | 'warning' | 'danger';
export type TechniqueFeedback = {
  tone: TechniqueFeedbackTone;
  message: string;
  detail: string;
};
// TEMP-DIAGNOSTICO: datos aislados de observación pasiva para un video subido de sentadillas.
export type UploadedSquatDiagnosticState = {
  lastObservedVideoTime: number | null;
  lastValidVideoTime: number | null;
  continuousValidSeconds: number;
  totalValidSeconds: number;
  lastInvalidLogVideoTime: number | null;
  lastSearchLogVideoTime: number | null;
  searchWindowStartVideoTime: number | null;
  bodyDetected: boolean;
  fixedThighReferenceLength: number | null;
  fixedHipReferenceY: number | null;
  lastTimelineLogVideoTime: number | null;
  counterValidFrames: number;
  counterDiscardedFrames: number;
  counterDiscardReasons: Record<string, number>;
  lastCounterDiscardSummaryVideoTime: number | null;
  finished: boolean;
};
export type PullupPhase = 'esperando abajo' | 'abajo' | 'subiendo' | 'arriba' | 'bajando';
export type PullupRepEvent = 'valid' | 'invalid' | 'no-top' | 'no-lockout' | null;
export type PullupPreparationStage = 'body-detection' | 'bar-preparation' | 'active';
export type MuscleUpPullupPreparationStage = 'body-detection' | 'bar-preparation' | 'active';
export type SquatLivePreparationStage = 'idle' | 'body-detection' | 'accommodate' | 'active';
export type PushupPreparationStage = 'body-detection' | 'pushup-preparation' | 'active';
export type CrossoverPreparationStage = 'idle' | 'body-detection' | 'pushup-preparation' | 'active';
export type PressBenchPreparationStage = 'idle' | 'body-detection' | 'press-banca-preparation' | 'active';
export type DipPreparationStage = 'body-detection' | 'accommodate' | 'active';
export type PullupTracker = {
  phase: PullupPhase;
  repetitions: number;
  goodRepetitions: number;
  minimumAngle: number | null;
  samples: number[];
  event: PullupRepEvent;
  lastAngle: number | null;
  topFrames: number;
  currentRepCorrect: boolean;
  bottomReadyFrames: number;
  isArmed: boolean;
  pendingRepHeadOverWrists: boolean | null;
  topConfirmationHeadFramesEvaluated: number;
  topConfirmationHeadFramesYes: number;
  pendingRepHeadFramesEvaluated: number;
  pendingRepHeadFramesYes: number;
  suppressNextRepCountUntilBottom: boolean;
  cycleMaximumShoulderY: number | null;
};
export type MuscleUpPullupPhase = 'esperando abajo' | 'abajo' | 'subiendo' | 'arriba' | 'bajando';
export type MuscleUpPullupRepEvent = 'valid' | 'invalid' | 'no-top' | 'no-lockout' | null;
export type MuscleUpPullupTracker = {
  phase: MuscleUpPullupPhase;
  repetitions: number;
  goodRepetitions: number;
  incorrectRepetitions: number;
  lastIncorrectReason: 'no-top' | 'no-top-cabeza' | 'no-fondo' | 'no-lockout' | null;
  minimumAngle: number | null;
  samples: number[];
  event: MuscleUpPullupRepEvent;
  lastAngle: number | null;
  topFrames: number;
  currentRepCorrect: boolean;
  bottomReadyFrames: number;
  isArmed: boolean;
  pendingRepHeadOverWrists: boolean | null;
  topConfirmationHeadFramesEvaluated: number;
  topConfirmationHeadFramesYes: number;
  pendingRepHeadFramesEvaluated: number;
  pendingRepHeadFramesYes: number;
  suppressNextRepCountUntilBottom: boolean;
  repetitionCountLockedUntilBottom: boolean;
  confirmedHangingPosition: boolean;
  positionalTopFrames: number;
  lastHangingTorsoLengthPx: number | null;
};
export type MuscleUpPullupTrackerConfig = {
  bottomMinAngle: number;
  bottomMaxAngle: number;
  pullActivationAngle: number;
  noLockoutAngle: number;
  topElbowMinAngle: number;
  topElbowMaxAngle: number;
  smoothingSamples: number;
  bottomStableFrames: number;
  topConfirmationFrames: number;
  risingDeltaDeg: number;
  angleToleranceDeg: number;
};
export type MuscleUpPullupExtremityValidation = {
  atBottom: boolean;
  atTop: boolean;
};
export type MuscleUpPullupRepVerdict = {
  repetition: number;
  headOverWrists: boolean;
  headFramesEvaluated: number;
  headFramesYes: number;
  bottomReached: boolean;
  correct: boolean;
  reason: 'no-top-cabeza' | 'no-fondo' | 'no-lockout' | 'ok';
};
export type MuscleUpPullupTrackerUpdate = {
  tracker: MuscleUpPullupTracker;
  smoothedAngle: number;
  completedMinimumAngle: number | null;
  isAtBottom: boolean;
  hasReachedTop: boolean;
  verdict: MuscleUpPullupRepVerdict | null;
};
export type MuscleUpCycleAngleReading = {
  value: number | null;
  nullReason: string | null;
};
export type MuscleUpCycleFrameAngles = {
  elbows: Record<PoseSide, MuscleUpCycleAngleReading>;
  hips: Record<PoseSide, MuscleUpCycleAngleReading>;
  knees: Record<PoseSide, MuscleUpCycleAngleReading>;
  ankles: Record<PoseSide, MuscleUpCycleAngleReading>;
};
export type MuscleUpCycleFrameMeasurement = {
  videoSeconds: number;
  noseRatio: number | null;
  noseRatioNullReason: string | null;
  shoulderRatio: number | null;
  shoulderRatioNullReason: string | null;
  elbowAngle: number | null;
  elbowAngleNullReason: string | null;
  angles: MuscleUpCycleFrameAngles;
};
export type MuscleUpCycleTelemetry = {
  startSeconds: number | null;
  startNullReason: string | null;
  peakNoseRatio: number | null;
  peakShoulderRatio: number | null;
  minimumElbowAngle: number | null;
  tPeakNoseSeconds: number | null;
  peakAngles: MuscleUpCycleFrameAngles | null;
  nullReasons: {
    peakNoseRatio: string | null;
    peakShoulderRatio: string | null;
    minimumElbowAngle: string | null;
  };
};
export type MuscleUpCycleTelemetryState = {
  previousElbowAngle: number | null;
  cycle: MuscleUpCycleTelemetry | null;
  framesAtOrAbove130AfterBelow?: number;
  loggerClosedCycleAwaitingNoTop?: boolean;
  loggerClosedCycleStartValid?: boolean;
};
export type PullupTrackerConfig = {
  bottomMinAngle: number;
  bottomMaxAngle: number;
  pullActivationAngle: number;
  noLockoutAngle: number;
  topElbowMinAngle: number;
  topElbowMaxAngle: number;
  smoothingSamples: number;
  bottomStableFrames: number;
  topConfirmationFrames: number;
  risingDeltaDeg: number;
  angleToleranceDeg: number;
};
export type ExerciseRepPhase = 'esperando inicio' | 'inicio' | 'en movimiento' | 'final';
export type ExerciseRepDirection = 'decrease' | 'increase';
export type ExerciseRepConfig = {
  direction: ExerciseRepDirection;
  startMinAngle: number;
  startMaxAngle: number;
  activationAngle: number;
  endMinAngle: number;
  endMaxAngle: number;
  endLabel: string;
  noDepthMaxRawAngle?: number;
  noDepthReason?: 'sin profundidad';
  countOnReturn?: boolean;
  countOnlyWhenCorrect?: boolean;
  techniqueStartsOnActivation?: boolean;
  countReturnWithoutEndAsIncorrect?: boolean;
  requireReturnPastActivation?: boolean;
  rawAngleCanReachEnd?: boolean;
  postBottomRawPeakForReturn?: boolean;
  smoothingSamples?: number;
  techniqueMustHoldThroughout?: boolean;
};
export type ExerciseRepTracker = {
  phase: ExerciseRepPhase;
  repetitions: number;
  goodRepetitions: number;
  endpointAngle: number | null;
  samples: number[];
  postBottomRawSamples: number[];
  event: 'valid' | null;
  currentRepCorrect: boolean;
};
export type ExerciseRepTrackerUpdate = {
  tracker: ExerciseRepTracker;
  smoothedAngle: number;
  completedEndpointAngle: number | null;
};
// TEMP-DIAGNOSTICO: observación independiente del contador para flexiones declinadas en video subido.
export type DeclinedPushupRangeObservation = {
  minimum: number | null;
  maximum: number | null;
  firstFailingValue: number | null;
  missingMeasurements: number;
  stayedWithinRange: boolean;
};
export type DeclinedPushupDiagnosticVerdict =
  | 'en curso'
  | 'correcta'
  | 'incorrecta-no-contada'
  | 'descartada'
  | 'incompleta';
export type DeclinedPushupDiagnosticRepetition = {
  repetition: number;
  openingCondition: string;
  startVideoTimeSeconds: number | null;
  startElbowAngle: number | null;
  activationVideoTimeSeconds: number | null;
  bottomVideoTimeSeconds: number | null;
  returnVideoTimeSeconds: number | null;
  minimumElbowAngleRaw: number | null;
  minimumElbowAngleSmoothed: number | null;
  maximumElbowAngleRawOnReturn: number | null;
  maximumElbowAngleSmoothedOnReturn: number | null;
  elbowTorso: DeclinedPushupRangeObservation;
  bodyLine: DeclinedPushupRangeObservation;
  trackerTechniqueValidAtStart: boolean | null;
  trackerTechniqueValidAtActivation: boolean | null;
  counted: boolean;
  correct: boolean | null;
  verdict: DeclinedPushupDiagnosticVerdict;
  reason: string | null;
  blockingReasons: string[];
};
// TEMP-DIAGNOSTICO: puntos de curva registrados aparte del contador para videos declinados.
export type DeclinedPushupCurvePoint = {
  videoTimeSeconds: number;
  rawElbowAngle: number | null;
  smoothedElbowAngle: number | null;
  trackerPhase: ExerciseRepPhase;
  elbowTorsoAngle: number | null;
  elbowTorsoRange: [number, number];
  elbowTorsoAffectsValidity: false;
  bodyLineAngle: number | null;
  bodyLineTargetRange: [number, number];
  bodyLineAcceptedRange: [number, number];
  bodyLineToleranceDegrees: number;
  knee: {
    score: number | null;
    normalizedX: number | null;
    normalizedY: number | null;
    outsideMargin: boolean | null;
  };
  // TEMP-DIAGNOSTICO: valores numéricos de los bloqueos, solo para declinadas.
  cameraGuidance: {
    tone: string;
    message: string;
    detail: string;
    shoulderWidthPx: number | null;
    torsoLengthPx: number | null;
    shoulderWidthToTorsoRatio: number | null;
    frontViewRatioThreshold: number;
    frameMarginRatio: number;
    // TEMP-DIAGNOSTICO: articulaciones que incumplen el margen, sin afectar la guía.
    frameMargin: {
      videoWidthPx: number;
      videoHeightPx: number;
      horizontalMarginPx: number;
      verticalMarginPx: number;
      marginToleranceByJoint: Record<'hombro' | 'codo' | 'muñeca' | 'cadera' | 'rodilla', number>;
      violatingJoints: Array<{
        joint: string;
        normalizedX: number;
        normalizedY: number;
        outsideEdges: string[];
        nearestEdge: string;
        nearestEdgeDistancePx: number;
        toleratedByDeclinedMargin: boolean;
      }>;
    };
  };
  viewAlignment: {
    yawDeg: number | null;
    shoulderYawDeg: number | null;
    hipYawDeg: number | null;
    landmarkScoreThreshold: number;
    landmarkScores: {
      leftShoulder: number | null;
      rightShoulder: number | null;
      leftHip: number | null;
      rightHip: number | null;
    };
    deviationDeg: number | null;
    toleranceDeg: number;
    badViewThresholdDeg: number;
    estimatedView: string;
    status: string;
    blocking: boolean;
  };
  stableFrames: number;
  minimumStableFrames: number;
  visiblePoints: number;
  minimumVisiblePoints: number;
  visiblePointScoreThreshold: number;
  visibilityThreshold: number;
  visibilityScores: {
    shoulder: number | null;
    elbow: number | null;
    wrist: number | null;
    hip: number | null;
    knee: number | null;
  };
  heldLandmarks: {
    shoulder: boolean;
    elbow: boolean;
    wrist: boolean;
    hip: boolean;
    knee: boolean;
  };
  bodyInclinationFromHorizontalDeg: number | null;
  torsoInclinationFromHorizontalDeg: number | null;
  frameCameraReady: boolean;
  frameCanMeasure: boolean;
  frameDetectionStable: boolean;
  hasFreshPose: boolean;
  rawAngleAvailable: boolean;
  countFrameReady: boolean;
  blocked: boolean;
  discarded: boolean;
  reasons: string[];
};
export type DeclinedPushupDiagnosticJoint =
  | 'shoulder'
  | 'elbow'
  | 'wrist'
  | 'hip'
  | 'knee'
  | 'ankle';
export type DeclinedPushupDiagnosticJointLabel =
  | 'hombro'
  | 'codo'
  | 'muñeca'
  | 'cadera'
  | 'rodilla'
  | 'tobillo';
export type DeclinedPushupDiagnosticSideLabel = 'izquierdo' | 'derecho';
export type DeclinedPushupDiagnosticJointCounts = {
  umbralPoseOneEuro: number;
  crudoSobreUmbral: number;
  filtradoPresente: number;
  filtradoRetenido: number;
};
export type DeclinedPushupPointsSummary = {
  framesAnalyzed: number;
  countsBySide: Record<
    DeclinedPushupDiagnosticSideLabel,
    Record<DeclinedPushupDiagnosticJointLabel, DeclinedPushupDiagnosticJointCounts>
  >;
  chosenSideFrames: Record<DeclinedPushupDiagnosticSideLabel | 'ninguno', number>;
  chosenSideChanges: number;
  previousChosenSide: PoseSide | null;
  oneSidedRawPresence: Record<
    'codo' | 'muñeca' | 'rodilla',
    {
      izquierdoPresenteDerechoAusente: number;
      derechoPresenteIzquierdoAusente: number;
    }
  >;
};
export type DeclinedPushupVideoDiagnosticState = {
  repetitions: DeclinedPushupDiagnosticRepetition[];
  current: DeclinedPushupDiagnosticRepetition | null;
  nextRepetition: number;
  armedStartVideoTimeSeconds: number | null;
  armedStartElbowAngle: number | null;
  armedStartTechniqueValid: boolean | null;
  startNotReachedLogged: boolean;
  lastBlockLog: { signature: string; videoTimeSeconds: number } | null;
  // TEMP-DIAGNOSTICO: curva completa y contadores para resumen, sin intervención en el tracker.
  curvePoints: DeclinedPushupCurvePoint[];
  curveFramesAnalyzed: number;
  curveFramesBlocked: number;
  curveMinimumRawElbowAngle: number | null;
  curveMaximumRawElbowAngle: number | null;
  lastCurveLogVideoTimeSeconds: number | null;
  pointsSummary: DeclinedPushupPointsSummary;
  // TEMP-DIAGNOSTICO: emite una sola vez el primer cuadro que sí llegó al tracker.
  countEnabledLogged: boolean;
  finished: boolean;
};
export type UploadedDipDiagnosticAngle = {
  angle: number | null;
  status: string;
};
export type UploadedDipFacing = {
  imageDirection: 'izquierda' | 'derecha' | 'desconocida';
  noseFromShoulderCenterX: number | null;
};
export type UploadedDipDiagnosticMoment = {
  videoTimeSeconds: number;
  countSide: PoseSide | null;
  techniqueSide: PoseSide | null;
  facing: UploadedDipFacing;
  count: {
    elbowRaw: number | null;
    elbowSmoothed: number | null;
    status: string;
  };
  technique: {
    torsoLean: UploadedDipDiagnosticAngle;
    elbowDepth: UploadedDipDiagnosticAngle;
    shoulderRelative: UploadedDipDiagnosticAngle;
    shoulderElbowOffsetByTorso: { dx: number | null; dy: number | null };
  };
};
export type UploadedDipPointKey = 'shoulder' | 'elbow' | 'wrist' | 'hip';
export type UploadedDipJointScores = Record<UploadedDipPointKey, number | null>;
export type UploadedDipScoreFailures = Record<UploadedDipPointKey, boolean>;
export type UploadedDipLiveSide = {
  scores: UploadedDipJointScores;
  scoreFailures: UploadedDipScoreFailures;
};
export type UploadedDipLiveSnapshot = {
  videoTimeSeconds: number;
  screenSide: PoseSide | null;
  countSide: PoseSide | null;
  techniqueSide: PoseSide | null;
  originalSelectorSide: PoseSide | null;
  ruleSelectedSide: PoseSide | null;
  torsoLeanBySide: Record<PoseSide, number | null>;
  sides: Record<PoseSide, UploadedDipLiveSide>;
  angles: {
    screenElbow: number | null;
    countElbow: number | null;
    torsoLean: number | null;
  };
  camera: {
    ready: boolean;
    tone: CameraGuidanceTone;
    message: string;
    detail: string;
  };
  measurementBlocked: boolean;
  techniqueReady: boolean;
  techniqueFailures: string[];
  frameBlockers: string[];
};
export type UploadedDipDiagnosticFrame = {
  ready: boolean;
  blockers: string[];
  moment: UploadedDipDiagnosticMoment;
  live: UploadedDipLiveSnapshot;
};
// TEMP-DIAGNOSTICO: desplazamiento relativo medido solo con puntos 2D crudos de fondos subidos.
export type UploadedDipRawShoulderWristSample = {
  shoulderWristVerticalGap: number;
  normalizedPosition: number;
  referenceLength: number;
  referenceSource: 'torso-2D' | 'brazo-superior-2D';
  // TEMP-DIAGNOSTICO: posiciones crudas usadas solo para describir el descenso vertical.
  hipY: number | null;
  wristY: number;
};
export type UploadedDipVideoSegmentationState = {
  boneLengthBlockedFrames: number;
  boneLengthCandidateReady: boolean;
  boneLengthCandidateMinimumAngle: number | null;
  boneLengthCandidateTimeSeconds: number | null;
  boneLengthCandidateFrameCount: number;
  bottomReached: boolean;
  bottomMinimumAngle: number | null;
  bottomEvidenceTimeSeconds: number | null;
  bottomEvidenceFrameCount: number;
  postBottomMaximumAngle: number | null;
  // TEMP-DIAGNOSTICO: máximo de MediaPipe y máximo filtrado válidos durante la subida.
  postBottomMaximumRawMediaPipeAngle: number | null;
  postBottomMaximumFilteredAngle: number | null;
  relativeRiseLogged: boolean;
  // TEMP-DIAGNOSTICO: evaluación del hombro respecto de la muñeca durante el descenso.
  descentStartShoulderWristGap: number | null;
  descentReferenceLength: number | null;
  descentReferenceSource: UploadedDipRawShoulderWristSample['referenceSource'] | null;
  descentMaximumNormalizedDrop: number | null;
  // TEMP-DIAGNOSTICO: máximos desplazamientos hacia abajo, normalizados por la referencia fija.
  descentStartHipY: number | null;
  descentStartWristY: number | null;
  descentMaximumNormalizedHipDrop: number | null;
  descentMaximumNormalizedWristDrop: number | null;
  descentHasRequiredData: boolean;
  descentDecisionEvaluated: boolean;
  descentIsDip: boolean | null;
  // TEMP-DIAGNOSTICO: posiciones normalizadas del hombro en la fase inicial y su mediana por repetición.
  startShoulderYNormalizedSamples: number[];
  repetitionStartShoulderYNormalized: number | null;
  repetitionMaxShoulderYNormalized: number | null;
};
// TEMP-DIAGNOSTICO: traza del camino que ya incrementó el contador, solo para el log.
export type UploadedDipCountTrace = {
  route: string;
  source: string;
  trackerPhase: ExerciseRepPhase;
  descentDecision: boolean | null;
};
export type UploadedDipRepetitionMeasurement = {
  repetition: number;
  complete: boolean;
  countedAsIncorrect?: boolean;
  reason?:
    | 'sin profundidad'
    | 'rango incompleto: bajó pero no regresó arriba'
    | 'no extendió arriba';
  start: UploadedDipDiagnosticMoment | null;
  bottom: UploadedDipDiagnosticMoment | null;
  return: UploadedDipDiagnosticMoment | null;
  elbowRawMinimum: number | null;
  torsoLeanMinimum: number | null;
  torsoLeanMaximum: number | null;
  // TEMP-DIAGNOSTICO: observaciones para describir cada repetición, sin intervenir en el tracker.
  samplesBelow100DuringDescent: number;
  rawMaximumBeforeDescent: number | null;
  returnTrigger?: 'tracker' | 'retorno forzado';
  // TEMP-DIAGNOSTICO: metadatos informativos del incremento, no consultados por las reglas.
  countTrace?: UploadedDipCountTrace;
};
export type UploadedDipDiagnostics = {
  windowFrames: UploadedDipDiagnosticFrame[];
  angleSamples: {
    elbowCount: number[];
    torsoLean: number[];
    shoulderRelative: number[];
  };
  repetitions: UploadedDipRepetitionMeasurement[];
  noDepthRepetitions: UploadedDipRepetitionMeasurement[];
  currentRepetition: UploadedDipRepetitionMeasurement | null;
  nextRepetitionNumber: number;
  incompleteRepetitions: number;
  lastIncorrectReason: string | null;
  lastSmoothedElbowAngle: number | null;
  lastReportTimestamp: number | null;
  lastFpsVideoTime: number | null;
  latestLiveSnapshot?: UploadedDipLiveSnapshot;
  videoSegmentation: UploadedDipVideoSegmentationState;
  // TEMP-DIAGNOSTICO: máximo previo al descenso observado antes de abrir la medición.
  rawMaximumBeforeDescentCandidate: number | null;
  // TEMP-DIAGNOSTICO: diferencias de ángulo crudo solo en segmentos estables del video.
  stableElbowAngleChanges: number[];
  previousStableElbowAngle: number | null;
  // TEMP-DIAGNOSTICO: dispersión de la posición hombro-muñeca 2D normalizada en tramos estables.
  stableShoulderWristNormalizedPositions: number[];
  // TEMP-DIAGNOSTICO: tiempos de las mismas muestras espaciales para resumir su rango temporal.
  stableShoulderWristVideoTimesSeconds: number[];
  // TEMP-DIAGNOSTICO: último ruido emitido, para informar solo cuando cambia.
  lastLoggedStableShoulderWristNoiseTolerance?: number | null;
  stableShoulderWristReferenceSource: UploadedDipRawShoulderWristSample['referenceSource'] | null;
  stableShoulderWristSide: PoseSide | null;
  // TEMP-DIAGNOSTICO: escala fija y reloj de la serie temporal del video subido.
  timelineTorsoReferenceLength: number | null;
  timelineTorsoReferenceSide: PoseSide | null;
  lastTimelineLogVideoTime: number | null;
  latestStableShoulderWrist: {
    side: PoseSide;
    sample: UploadedDipRawShoulderWristSample;
  } | null;
};

// TEMP-DIAGNOSTICO: estado ilimitado del archivo de líneas y métricas de la pasada activa.
export type UploadedDipDiagnosticPassNumber = 1 | 2;
export type UploadedDipDiagnosticFrameBucket = {
  videoSecond: number;
  callbacks: number;
  skippedBySampling: number;
  skippedWhileBusy: number;
  processed: number;
};
export type UploadedDipDiagnosticPassStats = {
  pass: UploadedDipDiagnosticPassNumber;
  startedAtPerformanceNow: number;
  frameBucket: UploadedDipDiagnosticFrameBucket | null;
  analyzedFrames: number;
  workerFrames: number;
  mainThreadFrames: number;
  inferenceTotalMs: number;
  inferenceMaxMs: number;
  mainThreadBlockingMs: number;
  blocked: {
    poseNotFresh: number;
    view: number;
    cameraNotReady: number;
    lowConfidence: number;
    boneLength: number;
    other: number;
  };
  modelSignatures: string[];
  stagesLogged: Set<string>;
};
export type CameraGuidanceTone = 'checking' | 'ready' | 'warning';

export type ExerciseId = 'fondos' | 'dominadas' | 'dominadas-supinas' | 'dominadas-comando' | 'muscle-up' | 'jalon' | 'pull-over-polea-alta' | 'remo-barra' | 'remos-australianos-elevados' | 'remo-sentado-polea-agarre-cerrado' | 'remo-mancuerna-una-mano' | 'peso-muerto-rumano' | 'peso-muerto-piernas-rigidas' | 'flexiones' | 'flexiones-declinadas' | 'flexiones-pica' | 'press-militar' | 'press-hombros-maquina' | 'elevaciones-laterales' | 'elevaciones-laterales-polea-baja' | 'pajaros-mancuernas' | 'face-pulls-polea-alta' | 'aperturas-inversas-maquina' | 'cruces-polea-baja-alta' | 'press-banca' | 'press-banca-agarre-cerrado' | 'press-banca-inclinado' | 'press-plano-mancuernas' | 'press-plano-inclinado' | 'triceps-polea-alta' | 'triceps-tras-nuca-polea-alta' | 'copa-mancuernas' | 'extension-horizontal-barra' | 'curl-biceps' | 'curl-inclinado-mancuernas' | 'curl-predicador' | 'curl-arana' | 'curl-martillo' | 'curl-inverso-barra' | 'curl-muneca-sentado' | 'rodillo-muneca' | 'sentadillas' | 'prensa-piernas' | 'extensiones-maquina' | 'curl-femoral' | 'elevacion-talones-pie' | 'maquina-aductores' | 'hip-thrust-barra' | 'zancadas' | 'zancada-banco' | 'plancha' | 'crunch-invertido' | 'rueda-abdominal' | 'elevaciones-piernas-barra' | 'barra-reloj' | 'elevaciones-piernas-suelo' | 'press-pallof-polea-banda' | 'giros-rusos';
export type TrackedJoint = 'head' | 'shoulder' | 'elbow' | 'wrist' | 'hip' | 'knee' | 'ankle' | 'foot';
export type TrackedJointDefinition = {
  joint: TrackedJoint;
  label: string;
};
export type MuscleGroup = 'pecho' | 'espalda' | 'hombros' | 'pierna' | 'triceps' | 'abdomen' | 'biceps' | 'antebrazo';
export type ExerciseDefinition = {
  id: ExerciseId;
  name: string;
  muscleGroup?: MuscleGroup;
  description: string;
  angleLabel: string;
  cameraNote?: string;
  recommendedView?: ExerciseView;
  viewToleranceDeg?: number;
  uprightTorso?: boolean;
  trackedJoints: TrackedJointDefinition[];
  trackBothSides?: boolean;
  trackedAngleLabels: string[];
};
