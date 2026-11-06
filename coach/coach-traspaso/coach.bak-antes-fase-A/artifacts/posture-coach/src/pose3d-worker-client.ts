import type {
  CreatePoseDetectorOptions,
  Pose,
  PoseDetector,
  PoseDetectorWorkerRequest,
  PoseDetectorWorkerResponse,
  PoseVideoSource,
} from '@/pose3d';

type PendingResponse = {
  resolve: (response: PoseDetectorWorkerResponse) => void;
  reject: (error: Error) => void;
};

export async function createPoseWorkerDetector(
  options: CreatePoseDetectorOptions = {},
): Promise<PoseDetector> {
  const worker = new Worker(new URL('./pose3d.worker.ts', import.meta.url), {
    type: 'module',
  });
  const pending = new Map<number, PendingResponse>();
  let nextRequestId = 0;
  let closed = false;

  const rejectPending = (error: Error) => {
    pending.forEach(({ reject }) => reject(error));
    pending.clear();
  };

  worker.addEventListener('message', (event: MessageEvent<PoseDetectorWorkerResponse>) => {
    const response = event.data;
    const request = pending.get(response.id);
    if (!request) return;
    pending.delete(response.id);
    if (response.type === 'error') {
      request.reject(new Error(response.message));
    } else {
      request.resolve(response);
    }
  });

  worker.addEventListener('error', (event) => {
    rejectPending(new Error(event.message || 'Falló el trabajador de análisis de pose.'));
  });

  const sendRequest = (
    request: Exclude<PoseDetectorWorkerRequest, { type: 'close' }>,
    transfer: Transferable[] = [],
  ) => new Promise<PoseDetectorWorkerResponse>((resolve, reject) => {
    if (closed) {
      reject(new Error('El detector de video ya está cerrado.'));
      return;
    }
    pending.set(request.id, { resolve, reject });
    try {
      worker.postMessage(request, transfer);
    } catch (error) {
      pending.delete(request.id);
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });

  try {
    const initialization = await sendRequest({
      type: 'initialize',
      id: nextRequestId++,
      options,
    });
    if (initialization.type !== 'ready') {
      throw new Error('El trabajador no confirmó la carga del detector de pose.');
    }

    const detector: PoseDetector = {
      activeModel: initialization.activeModel,
      activeDelegate: initialization.activeDelegate,
      async detectForVideoAsync(
        source: PoseVideoSource,
        timestamp: number,
        outputSize?: { width: number; height: number },
      ): Promise<Pose | null> {
        if (closed) throw new Error('El detector de video ya está cerrado.');
        const bitmap = await createImageBitmap(source);
        const id = nextRequestId++;
        try {
          const response = await sendRequest({
            type: 'detect',
            id,
            bitmap,
            timestamp,
            outputSize,
          }, [bitmap]);
          if (response.type !== 'pose') {
            throw new Error('El trabajador devolvió una respuesta inesperada.');
          }
          return response.pose;
        } catch (error) {
          bitmap.close();
          throw error;
        }
      },
      close() {
        if (closed) return;
        closed = true;
        worker.postMessage({ type: 'close' });
        worker.terminate();
        rejectPending(new Error('El detector de video se cerró antes de completar el análisis.'));
      },
    };
    return detector;
  } catch (error) {
    closed = true;
    worker.terminate();
    rejectPending(error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}