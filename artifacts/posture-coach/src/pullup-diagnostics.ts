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