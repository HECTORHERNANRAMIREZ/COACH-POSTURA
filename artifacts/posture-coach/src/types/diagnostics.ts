import type { CameraFacingMode, ViewAlignmentState } from '@/view-estimation';
import type { PosePoint } from '@/pose3d';
import type { ExerciseId, PoseSide } from './tracking';

export type ViewDiagnosticSnapshot = {
  timestamp: number;
  exercise: ExerciseId;
  shoulderYawDeg: number | null;
  hipYawDeg: number | null;
  yawDeg: number | null;
  leftShoulderX: number | null;
  rightShoulderX: number | null;
  faceScore: number | null;
  earScore: number | null;
  cameraFacingMode: CameraFacingMode;
  estimatedView: ViewAlignmentState['estimatedView'];
  recommendedView: ViewAlignmentState['recommendedView'];
  status: ViewAlignmentState['status'];
  atBottom: boolean;
  atTop: boolean;
};

export type DiagnosticLandmarkSample = {
  x: number;
  y: number;
  score: number | null;
  held: boolean;
  heldFrames: number;
  heldReason: string | null;
} | null;

export type ExtremityDiagnosticSample = {
  rawModel: DiagnosticLandmarkSample;
  afterSideAssignment: DiagnosticLandmarkSample;
  afterBoneConstraints: DiagnosticLandmarkSample;
  filtered: DiagnosticLandmarkSample;
};

export type FrameDiagnosticSnapshot = {
  timestamp: number;
  videoTimeSeconds: number | null;
  exercise: ExerciseId;
  exerciseStarted: boolean;
  cameraReady: boolean;
  poseDetected: boolean;
  frameStable: boolean;
  stabilityFrames: number;
  requiredStabilityFrames: number;
  measurementBlocked: boolean;
  measurementBlockingReasons: string[];
  repetitionFrameReady: boolean;
  repetitionBlockingReasons: string[];
  heldMeasurementPoints: string[];
  visiblePoints: number;
  dominantSide: PoseSide | null;
  sideConfidence: number | null;
  modelInfo: {
    model: string | null;
    delegate: string | null;
  };
  measurements: {
    rawAngle: number | null;
    repetitionAngle: number | null;
    displayAngle: number | null;
    pullupAngle: number | null;
    repetitions: number;
    goodRepetitions: number;
    phase: string;
    minimumAngle: number | null;
    event: string | null;
  };
  pushup: {
    elbowTorsoAngle: number | null;
    bodyLineAngle: number | null;
    techniqueReady: boolean;
  } | null;
  view: {
    shoulderYawDeg: number | null;
    hipYawDeg: number | null;
    yawDeg: number | null;
    cameraFacingMode: CameraFacingMode;
    estimatedView: ViewAlignmentState['estimatedView'];
    recommendedView: ViewAlignmentState['recommendedView'];
    status: ViewAlignmentState['status'];
  };
  extremityPoints: Record<PoseSide, {
    wrist: ExtremityDiagnosticSample;
    ankle: ExtremityDiagnosticSample;
  }> | null;
  pose: {
    keypoints: PosePoint[];
    worldLandmarks: PosePoint[];
  } | null;
};

export type AngleDiagnosticPoint = {
  label: string;
  x: number | null;
  y: number | null;
  z: number | null;
};
