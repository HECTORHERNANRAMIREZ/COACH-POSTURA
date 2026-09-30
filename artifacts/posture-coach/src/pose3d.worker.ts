import {
  createPoseDetector,
  type PoseDetectorWorkerRequest,
  type PoseDetectorWorkerResponse,
  type PoseDetector,
} from '@/pose3d';

type WorkerScope = {
  onmessage: ((event: MessageEvent<PoseDetectorWorkerRequest>) => void) | null;
  postMessage: (message: PoseDetectorWorkerResponse) => void;
};

const workerScope = self as unknown as WorkerScope;
let detector: PoseDetector | null = null;

workerScope.onmessage = async (event) => {
  const message = event.data;
  if (message.type === 'close') {
    detector?.close();
    detector = null;
    return;
  }

  try {
    if (message.type === 'initialize') {
      detector?.close();
      detector = await createPoseDetector(message.options);
      workerScope.postMessage({
        type: 'ready',
        id: message.id,
        activeModel: detector.activeModel,
        activeDelegate: detector.activeDelegate,
      });
      return;
    }

    if (!detector?.detectForVideo) {
      throw new Error('El detector de pose todavía no está inicializado.');
    }

    let pose = null;
    try {
      pose = detector.detectForVideo(
        message.bitmap,
        message.timestamp,
        message.outputSize,
      );
    } finally {
      message.bitmap.close();
    }
    workerScope.postMessage({ type: 'pose', id: message.id, pose });
  } catch (error) {
    if (message.type === 'detect') message.bitmap.close();
    workerScope.postMessage({
      type: 'error',
      id: message.id,
      message: error instanceof Error ? error.message : String(error),
    });
  }
};