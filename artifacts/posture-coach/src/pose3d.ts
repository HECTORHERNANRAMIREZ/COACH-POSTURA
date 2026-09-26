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
export const MODEL_URL_FULL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task';
export const MODEL_URL_HEAVY =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task';

// Umbral mínimo para aceptar una detección de pose.
const MIN_POSE_DETECTION_CONFIDENCE = 0.45;
// Umbral mínimo de presencia de la pose detectada.
const MIN_POSE_PRESENCE_CONFIDENCE = 0.45;
// Umbral mínimo para conservar el tracking entre frames.
const MIN_TRACKING_CONFIDENCE = 0.4;

export type PoseModel = 'heavy' | 'full';
export type PoseDelegate = 'GPU' | 'CPU';

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
  held?: boolean;
  heldFrames?: number;
  heldReason?: 'low-score' | 'bone-length' | 'persistent';
  swapped?: boolean;
};

export type Pose = {
  keypoints: PosePoint[];
  worldLandmarks: PosePoint[];
  timestamp: number;
};

export type PoseDetector = {
  detectForVideo: (video: HTMLVideoElement, timestamp: number) => Pose | null;
  close: () => void;
  activeModel?: PoseModel;
  activeDelegate?: PoseDelegate;
};

export const skeletonConnections: Array<[number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8],
  [9, 10], [11, 12], [11, 13], [13, 15], [15, 17], [15, 19], [15, 21],
  [17, 19], [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20],
  [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [27, 29], [27, 31],
  [29, 31], [24, 26], [26, 28], [28, 30], [28, 32], [30, 32],
];

// Conexiones de talón y punta; se dibujan aparte para poder atenuarlas como una unidad.
export const footConnections: Array<[number, number]> = [
  [27, 29], [27, 31], [29, 31],
  [28, 30], [28, 32], [30, 32],
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

export type CreatePoseDetectorOptions = {
  model?: PoseModel;
  delegate?: PoseDelegate;
};

type DetectorCandidate = {
  model: PoseModel;
  delegate: PoseDelegate;
};

const POSE_LANDMARKER_OPTIONS = {
  runningMode: 'VIDEO' as const,
  numPoses: 1,
  minPoseDetectionConfidence: MIN_POSE_DETECTION_CONFIDENCE,
  minPosePresenceConfidence: MIN_POSE_PRESENCE_CONFIDENCE,
  minTrackingConfidence: MIN_TRACKING_CONFIDENCE,
};

function getModelUrl(model: PoseModel) {
  return model === 'heavy' ? MODEL_URL_HEAVY : MODEL_URL_FULL;
}

function describeError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function isGpuDelegateFailure(error: unknown) {
  const message = describeError(error).toLowerCase();
  return message.includes('gpu')
    || message.includes('webgl')
    || message.includes('webgpu')
    || message.includes('delegate')
    || message.includes('gl context')
    || message.includes('graphics');
}

function getFallbackCandidates(
  model: PoseModel,
  delegate: PoseDelegate,
): DetectorCandidate[] {
  if (model === 'heavy' && delegate === 'GPU') {
    return [
      { model: 'heavy', delegate: 'GPU' },
      { model: 'heavy', delegate: 'CPU' },
      { model: 'full', delegate: 'GPU' },
      { model: 'full', delegate: 'CPU' },
    ];
  }

  if (model === 'heavy' && delegate === 'CPU') {
    return [
      { model: 'heavy', delegate: 'CPU' },
      { model: 'full', delegate: 'CPU' },
    ];
  }

  if (delegate === 'GPU') {
    return [
      { model: 'full', delegate: 'GPU' },
      { model: 'full', delegate: 'CPU' },
    ];
  }

  return [{ model: 'full', delegate: 'CPU' }];
}

async function createLandmarker(
  vision: Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>>,
  candidate: DetectorCandidate,
) {
  return PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: getModelUrl(candidate.model),
      delegate: candidate.delegate,
    },
    ...POSE_LANDMARKER_OPTIONS,
  });
}

export async function createPoseDetector(
  options: CreatePoseDetectorOptions = {},
): Promise<PoseDetector> {
  const vision = await FilesetResolver.forVisionTasks(WASM_ROOT);
  const requestedModel = options.model ?? 'heavy';
  const requestedDelegate = options.delegate ?? 'GPU';
  const candidates = getFallbackCandidates(requestedModel, requestedDelegate);
  let landmarker: PoseLandmarker | null = null;
  let activeCandidate: DetectorCandidate | null = null;
  let firstGpuFailure: unknown = null;

  for (const candidate of candidates) {
    if (
      requestedModel === 'heavy'
      && requestedDelegate === 'GPU'
      && candidate.model === 'heavy'
      && candidate.delegate === 'CPU'
      && firstGpuFailure
      && !isGpuDelegateFailure(firstGpuFailure)
    ) {
      continue;
    }

    try {
      landmarker = await createLandmarker(vision, candidate);
      activeCandidate = candidate;
      break;
    } catch (error) {
      if (candidate.model === 'heavy' && candidate.delegate === 'GPU') {
        firstGpuFailure = error;
      }
      console.warn(
        `[pose3d] No se pudo cargar ${candidate.model} con ${candidate.delegate}:`,
        describeError(error),
      );
    }
  }

  if (!landmarker || !activeCandidate) {
    throw new Error('No se pudo cargar ningún modelo de pose.');
  }

  let lastTimestamp = Number.NEGATIVE_INFINITY;
  let closed = false;

  return {
    activeModel: activeCandidate.model,
    activeDelegate: activeCandidate.delegate,
    detectForVideo(video, timestamp) {
      if (!video.videoWidth || !video.videoHeight) return null;
      if (closed) return null;
      const safeTimestamp = Math.max(timestamp, lastTimestamp + 0.001);
      lastTimestamp = safeTimestamp;
      const result = landmarker?.detectForVideo(video, safeTimestamp);
      return result
        ? resultToPose(result, video.videoWidth, video.videoHeight, safeTimestamp)
        : null;
    },
    close() {
      if (closed) return;
      closed = true;
      landmarker?.close();
    },
  };
}