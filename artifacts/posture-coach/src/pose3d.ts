import {
  FilesetResolver,
  PoseLandmarker,
  type Landmark,
  type NormalizedLandmark,
  type PoseLandmarkerResult,
} from '@mediapipe/tasks-vision';

export const POSE_LANDMARK_COUNT = 33;
export const POSE_MODEL_NAME = 'MediaPipe Pose Landmarker · BlazePose 3D';
const WASM_ROOT =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task';

export type WorldCoordinate = {
  x: number;
  y: number;
  z: number;
};

export type PosePoint = {
  x: number;
  y: number;
  z?: number;
  score?: number;
  world?: WorldCoordinate;
};

export type Pose = {
  keypoints: PosePoint[];
  worldLandmarks: PosePoint[];
  timestamp: number;
};

export type PoseDetector = {
  detectForVideo: (video: HTMLVideoElement, timestamp: number) => Pose | null;
  close: () => void;
};

export const skeletonConnections: Array<[number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8],
  [9, 10], [11, 12], [11, 13], [13, 15], [15, 17], [15, 19], [15, 21],
  [17, 19], [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20],
  [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [27, 29], [27, 31],
  [29, 31], [24, 26], [26, 28], [28, 30], [28, 32], [30, 32],
];

function landmarkScore(landmark: NormalizedLandmark | Landmark) {
  const presence = (landmark as NormalizedLandmark & { presence?: number }).presence ?? 0;
  return Math.max(landmark.visibility ?? 0, presence);
}

function toPoint(
  landmark: NormalizedLandmark | undefined,
  worldLandmark: Landmark | undefined,
  width: number,
  height: number,
): PosePoint {
  const world = worldLandmark
    ? { x: worldLandmark.x, y: worldLandmark.y, z: worldLandmark.z }
    : undefined;

  return {
    x: (landmark?.x ?? 0) * width,
    y: (landmark?.y ?? 0) * height,
    z: landmark?.z,
    score: landmark ? landmarkScore(landmark) : 0,
    world,
  };
}

function resultToPose(
  result: PoseLandmarkerResult,
  width: number,
  height: number,
  timestamp: number,
): Pose | null {
  const normalized = result.landmarks[0];
  if (!normalized?.length) return null;

  const world = result.worldLandmarks[0] ?? [];
  const keypoints = normalized.map((landmark, index) =>
    toPoint(landmark, world[index], width, height),
  );
  const worldLandmarks = world.map((landmark, index) => ({
    x: landmark.x,
    y: landmark.y,
    z: landmark.z,
    score: landmarkScore(normalized[index] ?? landmark),
    world: { x: landmark.x, y: landmark.y, z: landmark.z },
  }));

  return { keypoints, worldLandmarks, timestamp };
}

export async function createPoseDetector(): Promise<PoseDetector> {
  const vision = await FilesetResolver.forVisionTasks(WASM_ROOT);
  let landmarker: PoseLandmarker;

  try {
    landmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: MODEL_URL,
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numPoses: 1,
      minPoseDetectionConfidence: 0.55,
      minPosePresenceConfidence: 0.55,
      minTrackingConfidence: 0.5,
    });
  } catch {
    landmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: MODEL_URL,
        delegate: 'CPU',
      },
      runningMode: 'VIDEO',
      numPoses: 1,
      minPoseDetectionConfidence: 0.55,
      minPosePresenceConfidence: 0.55,
      minTrackingConfidence: 0.5,
    });
  }

  return {
    detectForVideo(video, timestamp) {
      if (!video.videoWidth || !video.videoHeight) return null;
      const result = landmarker.detectForVideo(video, timestamp);
      return resultToPose(result, video.videoWidth, video.videoHeight, timestamp);
    },
    close() {
      landmarker.close();
    },
  };
}