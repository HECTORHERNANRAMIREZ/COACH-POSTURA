import type { CameraGuidanceTone } from './tracking';

export type VideoResolution = {
  width: number;
  height: number;
};

export type CameraGuidance = {
  tone: CameraGuidanceTone;
  message: string;
  detail: string;
};
