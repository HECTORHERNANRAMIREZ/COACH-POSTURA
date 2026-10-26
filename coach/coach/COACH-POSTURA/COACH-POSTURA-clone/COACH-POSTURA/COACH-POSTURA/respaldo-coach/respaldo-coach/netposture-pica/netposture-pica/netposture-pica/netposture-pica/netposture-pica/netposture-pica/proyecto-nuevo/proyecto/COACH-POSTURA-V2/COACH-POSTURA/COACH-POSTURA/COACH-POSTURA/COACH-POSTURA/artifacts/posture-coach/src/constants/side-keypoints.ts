import type { PoseSide } from '@/types/tracking';

export const sideKeypoints: Record<PoseSide, Record<'shoulder' | 'elbow' | 'wrist' | 'hip' | 'knee' | 'ankle', number>> = {
  left: { shoulder: 11, elbow: 13, wrist: 15, hip: 23, knee: 25, ankle: 27 },
  right: { shoulder: 12, elbow: 14, wrist: 16, hip: 24, knee: 26, ankle: 28 },
};

export const MUSCLE_UP_PULLUP_SIDE_KEYPOINTS: typeof sideKeypoints = {
  left: { shoulder: 11, elbow: 13, wrist: 15, hip: 23, knee: 25, ankle: 27 },
  right: { shoulder: 12, elbow: 14, wrist: 16, hip: 24, knee: 26, ankle: 28 },
};
