export type MuscleUpAngleKey = 'leftElbow' | 'rightElbow' | 'leftKnee' | 'rightKnee' | 'leftAnkle' | 'rightAnkle';
export type MuscleUpAngles = Record<MuscleUpAngleKey, number | null>;
export type MuscleUpExtremityLogPointKey =
  | 'leftHip'
  | 'rightHip'
  | 'leftKnee'
  | 'rightKnee'
  | 'leftAnkle'
  | 'rightAnkle'
  | 'leftHeel'
  | 'rightHeel'
  | 'leftToe'
  | 'rightToe';
export type MuscleUpExtremityVisibilityStats = Record<
  MuscleUpExtremityLogPointKey,
  { totalFrames: number; freshVisibleFrames: number }
>;
