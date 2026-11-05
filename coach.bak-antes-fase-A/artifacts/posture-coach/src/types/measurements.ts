import type { Pose } from '@/pose3d';
import type { PoseSide } from './tracking';

export type DominantSideResult = {
  side: PoseSide;
  average: number;
};

export type LiveAngleReading = {
  label: string;
  value: number | null;
  target: string;
  min?: number;
  max?: number;
  unit?: '°' | '';
};

export type DipJointReading = {
  label: string;
  value: number | null;
  status?: string;
};

export type FootMeasurement = {
  ankleAngle: number | null;
  heelLiftRatio: number;
};

export type DeclinedPushupPointsFrameInput = {
  videoTimeSeconds: number;
  chosenSide: PoseSide | null;
  rawPose: Pose | undefined;
  filteredPose: Pose | undefined;
  sidesSwappedByConsistency: boolean;
};

export type PikePushupTechniqueRule = {
  name: string;
  value: number | null;
  min: number;
  max: number;
  unit: '°' | '';
};
