import type { PullupTracker } from './tracking';

export type PullupElevationDecisionLabel =
  | 'contada'
  | 'descartada-sin-fase-abajo'
  | 'descartada-sin-regreso-abajo'
  | 'descartada-sin-datos-hombros'
  | 'descartada-sin-elevacion'
  | 'descartada-sin-transicion-arriba';

export type PullupElevationDecision = {
  decision: PullupElevationDecisionLabel;
  shoulderRise: number | null;
  shoulderRiseRatio: number | null;
  shoulderSpanPx: number | null;
  shoulderYAtLastBottom: number | null;
  shoulderYMinSinceBottom: number | null;
  videoCurrentTimeAtLastBottom: number | null;
  videoCurrentTimeAtDecision: number | null;
  headWindowStartVideoTime: number | null;
  veredictoCabeza: PullupHeadWindowVerdict | null;
};

export type PullupHeadWindowVerdict = {
  correct: boolean;
  reason: 'ok' | 'no-top-cabeza';
  headFramesEvaluated: number;
  headFramesYes: number;
  videoCurrentTimeStart: number | null;
  videoCurrentTimeEnd: number | null;
};

export type PullupDiscardedAngleJumpFrame = {
  videoCurrentTime: number | null;
  rawAngle: number;
  lastAcceptedRawAngle: number;
  reason: string;
};

export type PullupTrackerUpdate = {
  tracker: PullupTracker;
  smoothedAngle: number;
  completedMinimumAngle: number | null;
  isAtBottom: boolean;
  hasReachedTop: boolean;
  verdict: PullupRepVerdict | null;
  elevationDecision?: PullupElevationDecision;
  headWindowVerdict?: PullupHeadWindowVerdict;
  frameAccepted?: boolean;
  discardedAngleJumpFrames?: PullupDiscardedAngleJumpFrame[];
  phaseBefore?: import('./tracking').PullupPhase;
  replayedPriorFrame?: {
    videoCurrentTime: number | null;
    phaseBefore: import('./tracking').PullupPhase;
    trackerBefore: PullupTracker;
    tracker: PullupTracker;
    smoothedAngle: number;
    isAtBottom: boolean;
    hasReachedTop: boolean;
    verdict: PullupRepVerdict | null;
    elevationDecision?: PullupElevationDecision;
    headWindowVerdict?: PullupHeadWindowVerdict;
  };
};

export type PullupRepVerdict = {
  repetition: number;
  headOverWrists: boolean;
  headFramesEvaluated: number;
  headFramesYes: number;
  bottomReached: boolean;
  correct: boolean;
  reason: 'no-top-cabeza' | 'no-fondo' | 'no-lockout' | 'ok';
  headWindowStartVideoTime: number | null;
  headWindowEndVideoTime: number | null;
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
