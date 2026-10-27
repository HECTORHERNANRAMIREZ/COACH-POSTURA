import type { PullupTracker } from './tracking';

export type PullupTrackerUpdate = {
  tracker: PullupTracker;
  smoothedAngle: number;
  completedMinimumAngle: number | null;
  isAtBottom: boolean;
  hasReachedTop: boolean;
  verdict: PullupRepVerdict | null;
};

export type PullupRepVerdict = {
  repetition: number;
  headOverWrists: boolean;
  headFramesEvaluated: number;
  headFramesYes: number;
  bottomReached: boolean;
  correct: boolean;
  reason: 'no-top-cabeza' | 'no-fondo' | 'no-lockout' | 'ok';
};

export type PullupExtremityValidation = {
  atBottom: boolean;
  atTop: boolean;
};

export type PullupExtremityReadings = {
  left: {
    shoulder: number | null;
    elbow: number | null;
  };
  right: {
    shoulder: number | null;
    elbow: number | null;
  };
};
