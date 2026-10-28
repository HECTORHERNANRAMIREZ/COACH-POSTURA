import type {
  PullupExtremityReadings,
  PullupExtremityValidation,
  PullupElevationDecision,
  PullupHeadWindowVerdict,
} from './types/pullup';
import type { PullupPhase, PullupTrackerConfig } from './types/tracking';

export type ExerciseDiagnosticSnapshot = {
  timestamp: number;
  exercise: string;
  exerciseStarted: boolean;
  phase: string;
  cameraReady: boolean;
  poseDetected: boolean;
  frameStable: boolean;
  measurementBlocked: boolean;
  modelInfo: {
    model: string | null;
    delegate: string | null;
  };
  head: {
    noseY: number | null;
    leftWristY: number | null;
    rightWristY: number | null;
    noseConfidence: number | null;
    leftWristConfidence: number | null;
    rightWristConfidence: number | null;
    leftWristRelation: 'above' | 'below' | 'unknown';
    rightWristRelation: 'above' | 'below' | 'unknown';
    overBothWrists: boolean | null;
    underBothWrists: boolean | null;
  };
  shoulders: {
    left: {
      angle: number | null;
      confidence: number | null;
      valid: boolean;
      inBottomRange: boolean;
      inTopRange: boolean;
    };
    right: {
      angle: number | null;
      confidence: number | null;
      valid: boolean;
      inBottomRange: boolean;
      inTopRange: boolean;
    };
  };
  hips: {
    left: {
      score: number | null;
      held: boolean | null;
      heldReason: string | null;
      hasWorldCoords: boolean;
      worldCoords: { x: number; y: number; z: number } | null;
    };
    right: {
      score: number | null;
      held: boolean | null;
      heldReason: string | null;
      hasWorldCoords: boolean;
      worldCoords: { x: number; y: number; z: number } | null;
    };
  };
  elbows: {
    left: {
      angle: number | null;
      confidence: number | null;
      valid: boolean;
      inBottomRange: boolean;
      inTopRange: boolean;
    };
    right: {
      angle: number | null;
      confidence: number | null;
      valid: boolean;
      inBottomRange: boolean;
      inTopRange: boolean;
    };
    averagedRawAngle: number | null;
  };
  ranges: {
    bottomBase: [number, number];
    bottomTolerance: number;
    bottomEffective: [number, number];
    topBase: [number, number];
    topTolerance: number;
    topEffective: [number, number];
  };
  conditions: {
    atBottom: boolean;
    atTop: boolean;
    isAtBottom: boolean;
    hasReachedTop: boolean;
  };
  smoothedAngle: number | null;
  minimumAngle: number | null;
  topFrames: number;
  repetitions: number;
  goodRepetitions: number;
  event: string | null;
  barDetached: boolean;
  detachmentFrames: number;
  blockingReasons: string[];
  view: {
    shoulderYawDeg: number | null;
    hipYawDeg: number | null;
    yawDeg: number | null;
    leftShoulderX: number | null;
    rightShoulderX: number | null;
    faceScore: number | null;
    earScore: number | null;
    cameraFacingMode: string;
    estimatedView: string;
    status: string;
  };
};

export type PullupDiagnosticKeypoint = {
  x: number;
  y: number;
  score: number | null;
} | null;

export type PullupTrackerFrameDiagnostic = {
  frameIndex: number;
  videoCurrentTime: number;
  phaseBefore: PullupPhase;
  phaseAfter: PullupPhase;
  phaseChanged: boolean;
  atBottom: boolean;
  isAtBottom: boolean;
  atTop: boolean;
  topReached: boolean;
  hasReachedTop: boolean;
  rawAngle: number;
  smoothedAngle: number;
  lastAngleBefore: number | null;
  headOverWrists: boolean | null;
  extremityReadings: PullupExtremityReadings;
  extremities: PullupExtremityValidation;
  gripped: boolean;
  armingGripped: boolean;
  config: PullupTrackerConfig;
  shoulderYAvg: number | null;
  shoulderSpanPx: number | null;
  wristYAvg: number | null;
  keypoints: {
    nose: PullupDiagnosticKeypoint;
    leftShoulder: PullupDiagnosticKeypoint;
    rightShoulder: PullupDiagnosticKeypoint;
    leftElbow: PullupDiagnosticKeypoint;
    rightElbow: PullupDiagnosticKeypoint;
    leftWrist: PullupDiagnosticKeypoint;
    rightWrist: PullupDiagnosticKeypoint;
    leftHip: PullupDiagnosticKeypoint;
    rightHip: PullupDiagnosticKeypoint;
  };
  trackerBefore: {
    isArmed: boolean;
    bottomReadyFrames: number;
    topFrames: number;
    repetitions: number;
    hasBottomSinceLastTop: boolean;
    hasConfirmedTop: boolean;
  };
  decision: PullupElevationDecision['decision'] | null;
};

export type PullupDiagnosticMemory = {
  frameCount: number;
  decimating: boolean;
  frames: PullupTrackerFrameDiagnostic[];
  decisions: PullupElevationDecision[];
  discardedAngleJumpFrames: number;
};

export type PullupDiagnosticReport = {
  resumen: {
    total: number;
    candidatas: number;
    descartadasPorMotivo: Record<string, number>;
    cuadrosDescartadosPorSalto: number;
  };
  decisiones: PullupElevationDecision[];
  cuadros: PullupTrackerFrameDiagnostic[];
};

export function createPullupDiagnosticMemory(): PullupDiagnosticMemory {
  return {
    frameCount: 0,
    decimating: false,
    frames: [],
    decisions: [],
    discardedAngleJumpFrames: 0,
  };
}

export function recordPullupHeadWindowVerdict(
  memory: PullupDiagnosticMemory,
  verdict: PullupHeadWindowVerdict,
) {
  if (verdict.videoCurrentTimeStart === null) return;
  const veredictoCabeza = {
    resultado: verdict.correct ? 'correcta' as const : 'incorrecta' as const,
    motivo: verdict.reason,
    cabezaEvaluados: verdict.headFramesEvaluated,
    cabezaSi: verdict.headFramesYes,
    videoCurrentTimeInicio: verdict.videoCurrentTimeStart,
    videoCurrentTimeFin: verdict.videoCurrentTimeEnd,
  };
  memory.decisions.forEach((decision) => {
    if (decision.headWindowStartVideoTime === verdict.videoCurrentTimeStart) {
      decision.veredictoCabeza = veredictoCabeza;
    }
  });
}

export function recordPullupTrackerFrame(
  memory: PullupDiagnosticMemory,
  frame: Omit<PullupTrackerFrameDiagnostic, 'frameIndex' | 'phaseChanged'>,
) {
  const frameIndex = memory.frameCount;
  memory.frameCount += 1;
  const completeFrame: PullupTrackerFrameDiagnostic = {
    ...frame,
    frameIndex,
    phaseChanged: frame.phaseBefore !== frame.phaseAfter,
  };

  if (!memory.decimating && memory.frameCount > 1500) {
    memory.frames = memory.frames.filter((existingFrame) => (
      existingFrame.frameIndex % 2 === 0
      || existingFrame.phaseChanged
      || existingFrame.decision !== null
    ));
    memory.decimating = true;
  }

  if (
    !memory.decimating
    || frameIndex % 2 === 0
    || completeFrame.phaseChanged
    || completeFrame.decision !== null
  ) {
    memory.frames.push(completeFrame);
  }
}