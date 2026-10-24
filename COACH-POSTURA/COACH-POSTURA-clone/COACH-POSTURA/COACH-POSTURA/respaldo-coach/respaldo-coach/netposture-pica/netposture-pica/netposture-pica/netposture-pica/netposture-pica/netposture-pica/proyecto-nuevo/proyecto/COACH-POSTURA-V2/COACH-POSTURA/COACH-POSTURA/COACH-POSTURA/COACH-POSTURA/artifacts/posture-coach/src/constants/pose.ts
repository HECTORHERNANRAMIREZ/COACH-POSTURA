import type { ExerciseId, PoseSide } from '@/types/tracking';
import type { MuscleUpAngleKey, MuscleUpExtremityLogPointKey } from '@/types/muscle-up';

export const MUSCLE_UP_ANGLE_KEYS: MuscleUpAngleKey[] = [
  'leftElbow',
  'rightElbow',
  'leftKnee',
  'rightKnee',
  'leftAnkle',
  'rightAnkle',
];
export const MUSCLE_UP_FOOT_INDEX: Record<PoseSide, number> = {
  left: 31,
  right: 32,
};
export const FOOT_HEEL_INDEX: Record<PoseSide, number> = {
  left: 29,
  right: 30,
};
export const FOOT_OVERLAY_EXERCISES: ReadonlySet<ExerciseId> = new Set([
  'sentadillas',
  'prensa-piernas',
  'zancadas',
  'zancada-banco',
  'elevacion-talones-pie',
  'hip-thrust-barra',
]);
export const FOOT_REFINEMENT_EXERCISES: ReadonlySet<ExerciseId> = new Set([
  'sentadillas',
  'prensa-piernas',
  'extensiones-maquina',
  'curl-femoral',
  'elevacion-talones-pie',
  'maquina-aductores',
  'zancadas',
  'zancada-banco',
  'peso-muerto-rumano',
  'peso-muerto-piernas-rigidas',
]);
export const HAND_DETAIL_LANDMARKS = new Set([17, 18, 19, 20, 21, 22]);
export const sideKeypoints: Record<PoseSide, Record<'shoulder' | 'elbow' | 'wrist' | 'hip' | 'knee' | 'ankle', number>> = {
  left: { shoulder: 11, elbow: 13, wrist: 15, hip: 23, knee: 25, ankle: 27 },
  right: { shoulder: 12, elbow: 14, wrist: 16, hip: 24, knee: 26, ankle: 28 },
};
export const MUSCLE_UP_EXTREMITY_LOG_POINT_INDEXES: Record<MuscleUpExtremityLogPointKey, number> = {
  leftHip: sideKeypoints.left.hip,
  rightHip: sideKeypoints.right.hip,
  leftKnee: sideKeypoints.left.knee,
  rightKnee: sideKeypoints.right.knee,
  leftAnkle: sideKeypoints.left.ankle,
  rightAnkle: sideKeypoints.right.ankle,
  leftHeel: FOOT_HEEL_INDEX.left,
  rightHeel: FOOT_HEEL_INDEX.right,
  leftToe: MUSCLE_UP_FOOT_INDEX.left,
  rightToe: MUSCLE_UP_FOOT_INDEX.right,
};
export const MUSCLE_UP_PULLUP_SIDE_KEYPOINTS: typeof sideKeypoints = {
  left: { shoulder: 11, elbow: 13, wrist: 15, hip: 23, knee: 25, ankle: 27 },
  right: { shoulder: 12, elbow: 14, wrist: 16, hip: 24, knee: 26, ankle: 28 },
};
export const HEAD_LANDMARK_INDICES = [0, 7, 8] as const;
export const WRIST_TIP_INDEX: Record<PoseSide, number> = {
  left: 19,
  right: 20,
};
