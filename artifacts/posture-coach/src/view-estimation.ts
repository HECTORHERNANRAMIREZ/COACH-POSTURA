import type { Pose, WorldCoordinate } from './pose3d';

// Número de frames recientes usados para suavizar el giro estimado.
export const VIEW_WINDOW_FRAMES = 30;
// Margen angular para mantener la vista actual cerca de la frontera lateral.
export const VIEW_HYSTERESIS_DEG = 8;
// Ángulo que separa la clasificación frontal/trasera de la lateral.
export const VIEW_SIDE_BOUNDARY_DEG = 45;
// Tolerancia usada cuando un ejercicio no define una tolerancia propia.
export const VIEW_TOLERANCE_DEFAULT_DEG = 30;
// Tolerancia de ejercicios cuya guía acepta expresamente un semiperfil.
export const VIEW_SEMIPROFILE_TOLERANCE_DEG = 50;
// Margen adicional que sigue permitiendo contar, pero muestra una sugerencia.
export const VIEW_ACCEPTABLE_EXTRA_DEG = 20;
// Score mínimo para usar una articulación en la estimación de vista.
export const VIEW_MIN_SCORE = 0.4;
// Diferencia mínima entre señales faciales para preferir frente sobre espalda.
export const VIEW_FACE_MARGIN = 0.05;
// Frames consecutivos necesarios para cambiar entre frente y espalda.
export const VIEW_FACE_SWITCH_FRAMES = 5;
// Frames sin pose antes de limpiar por completo la estimación de vista.
export const VIEW_POSE_MISSING_RESET_FRAMES = 10;
// Tiempo que una vista incorrecta debe mantenerse antes de mostrar el aviso fuerte.
export const VIEW_BAD_SECONDS = 1.5;
// Tiempo que una vista válida debe mantenerse para retirar el aviso.
export const VIEW_RECOVER_SECONDS = 0.7;
// Intervalo mínimo entre actualizaciones de la interfaz de alineación.
export const VIEW_UI_UPDATE_MS = 250;
// Eje angular de una vista lateral en la proyección de hombros/caderas.
export const VIEW_SIDE_AXIS_DEG = 90;
// Distancia angular usada cuando frente y espalda son opuestos.
export const VIEW_OPPOSITE_DISTANCE_DEG = 180;

export type ExerciseView = 'front' | 'side' | 'back' | 'any';
export type EstimatedView = ExerciseView | 'unknown';
export type ViewStatus = 'good' | 'acceptable' | 'bad' | 'unknown';

export type ViewEstimate = {
  shoulderYawDeg: number | null;
  hipYawDeg: number | null;
  yawDeg: number | null;
  pitchDeg: number | null;
  view: EstimatedView;
  source: 'shoulders' | 'hips' | 'unknown';
};

export type ViewAssessment = {
  recommendedView: ExerciseView;
  estimatedView: EstimatedView;
  status: ViewStatus;
  known: boolean;
  deviationDeg: number | null;
  toleranceDeg: number;
  yawDeg: number | null;
  pitchDeg: number | null;
};

export type ViewAlignmentState = ViewAssessment & {
  blocking: boolean;
  alertVisible: boolean;
  suggestionVisible: boolean;
  message: string;
  detail: string;
};

function isFiniteNumber(value: number | undefined): value is number {
  return value !== undefined && Number.isFinite(value);
}

function isFiniteWorld(world: WorldCoordinate | undefined): world is WorldCoordinate {
  return Boolean(
    world
    && isFiniteNumber(world.x)
    && isFiniteNumber(world.y)
    && isFiniteNumber(world.z),
  );
}

function getWorldPoint(pose: Pose, index: number): WorldCoordinate | null {
  const point = pose.keypoints[index];
  const worldPoint = pose.worldLandmarks[index];
  if (
    !point
    || point.held
    || (point.score ?? 0) < VIEW_MIN_SCORE
  ) {
    return null;
  }

  const world = point.world ?? worldPoint?.world ?? (
    isFiniteNumber(worldPoint?.x)
    && isFiniteNumber(worldPoint?.y)
    && isFiniteNumber(worldPoint?.z)
      ? { x: worldPoint.x, y: worldPoint.y, z: worldPoint.z }
      : undefined
  );
  return isFiniteWorld(world) ? world : null;
}

function getReliableImagePoint(pose: Pose, index: number) {
  const point = pose.keypoints[index];
  return point
    && !point.held
    && (point.score ?? 0) >= VIEW_MIN_SCORE
    && Number.isFinite(point.x)
    && Number.isFinite(point.y)
    ? point
    : null;
}

function median(values: readonly number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((first, second) => first - second);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function average(values: number[]) {
  return values.length
    ? values.reduce((total, value) => total + value, 0) / values.length
    : null;
}

function distance3d(first: WorldCoordinate, second: WorldCoordinate) {
  return Math.hypot(
    first.x - second.x,
    first.y - second.y,
    first.z - second.z,
  );
}

function getYawDeg(first: WorldCoordinate, second: WorldCoordinate) {
  const horizontalWidth = Math.hypot(first.x - second.x, first.z - second.z);
  if (!(horizontalWidth > Number.EPSILON)) return null;
  // La línea de hombros es casi paralela a la cámara de frente/espalda y
  // perpendicular a ella de lado. Solo se necesita el ángulo agudo.
  return Math.atan2(
    Math.abs(first.z - second.z),
    Math.abs(first.x - second.x),
  ) * (180 / Math.PI);
}

function getPitchDeg(
  leftShoulder: WorldCoordinate,
  rightShoulder: WorldCoordinate,
  leftHip: WorldCoordinate,
  rightHip: WorldCoordinate,
) {
  const shoulderCenter = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2,
    z: (leftShoulder.z + rightShoulder.z) / 2,
  };
  const hipCenter = {
    x: (leftHip.x + rightHip.x) / 2,
    y: (leftHip.y + rightHip.y) / 2,
    z: (leftHip.z + rightHip.z) / 2,
  };
  const torsoLength = distance3d(shoulderCenter, hipCenter);
  if (!(torsoLength > Number.EPSILON)) return null;
  return Math.acos(
    Math.min(1, Math.abs(shoulderCenter.y - hipCenter.y) / torsoLength),
  ) * (180 / Math.PI);
}

function estimateFrontBack(pose: Pose): EstimatedView {
  const nose = getReliableImagePoint(pose, 0);
  const leftEye = getReliableImagePoint(pose, 2);
  const rightEye = getReliableImagePoint(pose, 5);
  const leftEar = getReliableImagePoint(pose, 7);
  const rightEar = getReliableImagePoint(pose, 8);
  const leftShoulder = getReliableImagePoint(pose, 11);
  const rightShoulder = getReliableImagePoint(pose, 12);

  const facialFeatures = [nose, leftEye, rightEye]
    .map((point) => point?.score ?? 0);
  const earFeatures = [leftEar, rightEar]
    .map((point) => point?.score ?? 0);
  const faceScore = average(facialFeatures) ?? 0;
  const earScore = average(earFeatures) ?? 0;
  if (!leftShoulder || !rightShoulder) return 'unknown';

  // En la pose no espejada que recibe el detector, una persona de frente
  // suele tener su hombro anatómico izquierdo a la derecha de la imagen;
  // de espaldas ocurre lo contrario. La señal de nariz/ojos prevalece y el
  // orden de hombros resuelve los casos en los que la cara está parcialmente
  // oculta.
  const frontShoulderOrder = leftShoulder.x > rightShoulder.x;
  const backShoulderOrder = leftShoulder.x < rightShoulder.x;
  if (
    faceScore >= VIEW_MIN_SCORE
    && (
      faceScore >= earScore + VIEW_FACE_MARGIN
      || frontShoulderOrder
    )
  ) {
    return 'front';
  }
  if (
    faceScore < VIEW_MIN_SCORE
    && (backShoulderOrder || earScore >= faceScore + VIEW_FACE_MARGIN)
  ) {
    return 'back';
  }
  return 'unknown';
}

function classifyByYaw(
  yawDeg: number,
  frontBackView: EstimatedView,
  previousView: EstimatedView,
) {
  const sideBoundary = previousView === 'side'
    ? VIEW_SIDE_BOUNDARY_DEG - VIEW_HYSTERESIS_DEG
    : previousView === 'front' || previousView === 'back'
      ? VIEW_SIDE_BOUNDARY_DEG + VIEW_HYSTERESIS_DEG
      : VIEW_SIDE_BOUNDARY_DEG + VIEW_HYSTERESIS_DEG;

  if (yawDeg >= sideBoundary) return 'side' as const;
  if (frontBackView === 'front' || frontBackView === 'back') return frontBackView;
  if (previousView === 'front' || previousView === 'back') return previousView;
  return 'unknown' as const;
}

function getViewDeviation(
  recommendedView: ExerciseView,
  estimate: ViewEstimate,
) {
  if (recommendedView === 'any') return 0;
  if (estimate.yawDeg === null || estimate.view === 'unknown') return null;
  if (recommendedView === 'side') {
    return Math.abs(VIEW_SIDE_AXIS_DEG - estimate.yawDeg);
  }
  if (recommendedView === 'front') {
    return estimate.view === 'front'
      ? estimate.yawDeg
      : VIEW_OPPOSITE_DISTANCE_DEG;
  }
  return estimate.view === 'back'
    ? estimate.yawDeg
    : VIEW_OPPOSITE_DISTANCE_DEG;
}

export function createUnknownViewEstimate(): ViewEstimate {
  return {
    shoulderYawDeg: null,
    hipYawDeg: null,
    yawDeg: null,
    pitchDeg: null,
    view: 'unknown',
    source: 'unknown',
  };
}

export function createViewAssessment(
  recommendedView: ExerciseView = 'any',
  estimate: ViewEstimate = createUnknownViewEstimate(),
): ViewAssessment {
  const toleranceDeg = VIEW_TOLERANCE_DEFAULT_DEG;
  const deviationDeg = getViewDeviation(recommendedView, estimate);
  const known = recommendedView === 'any' || deviationDeg !== null;
  const status: ViewStatus = recommendedView === 'any'
    ? 'good'
    : deviationDeg === null
      ? 'unknown'
      : deviationDeg <= toleranceDeg
        ? 'good'
        : deviationDeg <= toleranceDeg + VIEW_ACCEPTABLE_EXTRA_DEG
          ? 'acceptable'
          : 'bad';

  return {
    recommendedView,
    estimatedView: estimate.view,
    status,
    known,
    deviationDeg,
    toleranceDeg,
    yawDeg: estimate.yawDeg,
    pitchDeg: estimate.pitchDeg,
  };
}

export function assessExerciseView(
  recommendedView: ExerciseView = 'any',
  estimate: ViewEstimate = createUnknownViewEstimate(),
  viewToleranceDeg = VIEW_TOLERANCE_DEFAULT_DEG,
): ViewAssessment {
  const assessment = createViewAssessment(recommendedView, estimate);
  if (recommendedView === 'any' || assessment.deviationDeg === null) {
    return {
      ...assessment,
      toleranceDeg: viewToleranceDeg,
    };
  }
  const status: ViewStatus = assessment.deviationDeg <= viewToleranceDeg
    ? 'good'
    : assessment.deviationDeg <= viewToleranceDeg + VIEW_ACCEPTABLE_EXTRA_DEG
      ? 'acceptable'
      : 'bad';
  return { ...assessment, status, toleranceDeg: viewToleranceDeg };
}

export function createInitialViewAlignment(): ViewAlignmentState {
  const assessment = assessExerciseView('any', createUnknownViewEstimate());
  return {
    ...assessment,
    blocking: false,
    alertVisible: false,
    suggestionVisible: false,
    message: 'Ajustando la vista',
    detail: 'Mantente dentro del encuadre para validar tu orientación.',
  };
}

export class ViewEstimator {
  private readonly yawSamples: number[] = [];
  private missingPoseFrames = 0;
  private stableView: EstimatedView = 'unknown';
  private faceCandidate: EstimatedView = 'unknown';
  private faceCandidateFrames = 0;

  update(pose: Pose): ViewEstimate {
    this.missingPoseFrames = 0;
    const leftShoulder = getWorldPoint(pose, 11);
    const rightShoulder = getWorldPoint(pose, 12);
    const leftHip = getWorldPoint(pose, 23);
    const rightHip = getWorldPoint(pose, 24);
    const shoulderYaw = leftShoulder && rightShoulder
      ? getYawDeg(leftShoulder, rightShoulder)
      : null;
    const hipYaw = leftHip && rightHip ? getYawDeg(leftHip, rightHip) : null;
    const yawDeg = shoulderYaw ?? hipYaw;
    const source = shoulderYaw !== null
      ? 'shoulders'
      : hipYaw !== null
        ? 'hips'
        : 'unknown';

    if (yawDeg !== null) {
      this.yawSamples.push(yawDeg);
      if (this.yawSamples.length > VIEW_WINDOW_FRAMES) this.yawSamples.shift();
    }
    const smoothedYaw = median(this.yawSamples);
    const pitchDeg = leftShoulder && rightShoulder && leftHip && rightHip
      ? getPitchDeg(leftShoulder, rightShoulder, leftHip, rightHip)
      : null;

    if (smoothedYaw === null) {
      return {
        shoulderYawDeg: shoulderYaw,
        hipYawDeg: hipYaw,
        yawDeg: null,
        pitchDeg,
        view: this.stableView,
        source,
      };
    }

    const frontBackView = smoothedYaw <= VIEW_SIDE_BOUNDARY_DEG + VIEW_HYSTERESIS_DEG
      ? estimateFrontBack(pose)
      : 'side';
    const candidateView = classifyByYaw(
      smoothedYaw,
      frontBackView,
      this.stableView,
    );

    if (candidateView === this.stableView || candidateView === 'unknown') {
      this.faceCandidate = 'unknown';
      this.faceCandidateFrames = 0;
    } else if (
      (candidateView === 'front' || candidateView === 'back')
      && (this.stableView === 'front' || this.stableView === 'back')
    ) {
      if (this.faceCandidate === candidateView) {
        this.faceCandidateFrames += 1;
      } else {
        this.faceCandidate = candidateView;
        this.faceCandidateFrames = 1;
      }
      if (this.faceCandidateFrames >= VIEW_FACE_SWITCH_FRAMES) {
        this.stableView = candidateView;
        this.faceCandidate = 'unknown';
        this.faceCandidateFrames = 0;
      }
    } else {
      this.stableView = candidateView;
      this.faceCandidate = 'unknown';
      this.faceCandidateFrames = 0;
    }

    return {
      shoulderYawDeg: shoulderYaw,
      hipYawDeg: hipYaw,
      yawDeg: smoothedYaw,
      pitchDeg,
      view: this.stableView,
      source,
    };
  }

  markPoseMissing() {
    this.missingPoseFrames += 1;
    if (this.missingPoseFrames > VIEW_POSE_MISSING_RESET_FRAMES) this.reset();
  }

  reset() {
    this.yawSamples.length = 0;
    this.missingPoseFrames = 0;
    this.stableView = 'unknown';
    this.faceCandidate = 'unknown';
    this.faceCandidateFrames = 0;
  }
}

function getViewLabel(view: ExerciseView | EstimatedView) {
  if (view === 'front') return 'de frente';
  if (view === 'back') return 'de espaldas';
  if (view === 'side') return 'de lado';
  if (view === 'any') return 'cualquier vista';
  return 'la vista adecuada';
}

function getViewFeedback(
  assessment: ViewAssessment,
  alertVisible: boolean,
  suggestionVisible: boolean,
) {
  if (assessment.status === 'unknown') {
    return {
      message: 'Ajustando la vista',
      detail: 'Mantente quieto un momento para identificar si estás de frente, de lado o de espaldas.',
    };
  }
  if (assessment.status === 'bad' && alertVisible) {
    return {
      message: `Gira el móvil: usa una vista ${getViewLabel(assessment.recommendedView)}`,
      detail: `Este ejercicio se ve mejor ${getViewLabel(assessment.recommendedView)}. No contaré repeticiones hasta mantener esa vista.`,
    };
  }
  if (assessment.status === 'bad') {
    return {
      message: 'Verificando la vista',
      detail: `Mantén una vista ${getViewLabel(assessment.recommendedView)} para que el análisis sea fiable.`,
    };
  }
  if (assessment.status === 'acceptable' && suggestionVisible) {
    return {
      message: `Acércate a una vista ${getViewLabel(assessment.recommendedView)}`,
      detail: 'Puedes continuar, pero una vista más alineada hará más fiable la lectura.',
    };
  }
  return {
    message: 'Vista adecuada',
    detail: 'La orientación de la cámara es válida para este ejercicio.',
  };
}

export class ViewAlignmentGuard {
  private badSince: number | null = null;
  private recoverSince: number | null = null;
  private missingPoseFrames = 0;
  private wasBlocking = false;

  update(assessment: ViewAssessment, now: number): ViewAlignmentState {
    this.missingPoseFrames = 0;
    if (assessment.status === 'bad') {
      this.badSince ??= now;
      this.recoverSince = null;
      this.wasBlocking = true;
    } else if (assessment.status === 'good' || assessment.status === 'acceptable') {
      this.badSince = null;
      if (this.wasBlocking) {
        this.recoverSince ??= now;
        if (now - this.recoverSince >= VIEW_RECOVER_SECONDS * 1000) {
          this.wasBlocking = false;
          this.recoverSince = null;
        }
      } else {
        this.wasBlocking = false;
      }
    } else {
      this.badSince = null;
      this.recoverSince = null;
      this.wasBlocking = false;
    }

    const alertVisible = assessment.status === 'bad'
      ? this.badSince !== null
        && now - this.badSince >= VIEW_BAD_SECONDS * 1000
      : assessment.status === 'unknown' || this.wasBlocking;
    const suggestionVisible = assessment.status === 'acceptable'
      && !this.wasBlocking;
    const feedback = getViewFeedback(assessment, alertVisible, suggestionVisible);

    return {
      ...assessment,
      blocking: this.wasBlocking,
      alertVisible,
      suggestionVisible,
      message: feedback.message,
      detail: feedback.detail,
    };
  }

  markPoseMissing() {
    this.missingPoseFrames += 1;
    this.wasBlocking = false;
    this.badSince = null;
    this.recoverSince = null;
    if (this.missingPoseFrames > VIEW_POSE_MISSING_RESET_FRAMES) this.reset();
  }

  reset() {
    this.badSince = null;
    this.recoverSince = null;
    this.missingPoseFrames = 0;
    this.wasBlocking = false;
  }
}
