import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Camera,
  ShieldCheck,
  Square,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();
const GREEN = '#39ff6a';
const SCRIPT_URLS = {
  tensorflow: 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js',
  poseDetection:
    'https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.1.3/dist/pose-detection.min.js',
};

const skeletonConnections: Array<[number, number]> = [
  [0, 1], [0, 2], [1, 3], [2, 4],
  [5, 6], [5, 7], [7, 9], [6, 8], [8, 10],
  [5, 11], [6, 12], [11, 12],
  [11, 13], [13, 15], [12, 14], [14, 16],
];

type ExerciseId = 'fondos' | 'sentadillas' | 'plancha';
type ExerciseDefinition = {
  id: ExerciseId;
  name: string;
  description: string;
  angleLabel: string;
};
type PoseSide = 'left' | 'right';
type SessionPhase = 'exercise-select' | 'requesting' | 'loading-model' | 'tracking' | 'error';
type PosePoint = { x: number; y: number; score?: number };
type Pose = { keypoints?: PosePoint[] };
type PoseDetector = {
  estimatePoses: (video: HTMLVideoElement, options?: { flipHorizontal?: boolean }) => Promise<Pose[]>;
  dispose?: () => void;
};
type DiagnosticPoint = {
  label: string;
  score: number | null;
  side: 'izq.' | 'der.' | '—';
};
type AngleDiagnosticPoint = {
  label: string;
  x: number | null;
  y: number | null;
};
type DominantSideResult = {
  side: PoseSide;
  average: number;
};
type VideoResolution = {
  width: number;
  height: number;
};

const exercises: ExerciseDefinition[] = [
  {
    id: 'fondos',
    name: 'Fondos en barra',
    description: 'Observa el ángulo de tus brazos al descender.',
    angleLabel: 'Hombro · codo · muñeca',
  },
  {
    id: 'sentadillas',
    name: 'Sentadillas',
    description: 'Mide la profundidad y el control de tus piernas.',
    angleLabel: 'Cadera · rodilla · tobillo',
  },
  {
    id: 'plancha',
    name: 'Plancha',
    description: 'Comprueba la línea de tu cuerpo en el apoyo.',
    angleLabel: 'Hombro · cadera · tobillo',
  },
];

type BrowserGlobals = Window & {
  poseDetection?: {
    SupportedModels: { MoveNet: unknown };
    movenet: { modelType: { SINGLEPOSE_LIGHTNING: unknown } };
    createDetector: (
      model: unknown,
      config: { modelType: unknown },
    ) => Promise<PoseDetector>;
  };
};

function loadScript(url: string, id: string) {
  const existing = document.getElementById(id) as HTMLScriptElement | null;
  if (existing?.dataset.loaded === 'true') return Promise.resolve();
  if (existing) existing.remove();

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.id = id;
    script.src = url;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = () => reject(new Error('No se pudo cargar el análisis de postura.'));
    document.head.appendChild(script);
  });
}

function drawSkeleton(canvas: HTMLCanvasElement, video: HTMLVideoElement, pose?: Pose) {
  const width = video.videoWidth;
  const height = video.videoHeight;
  if (!width || !height) return;
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;

  const context = canvas.getContext('2d');
  const keypoints = pose?.keypoints ?? [];
  if (!context) return;
  context.clearRect(0, 0, width, height);
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.strokeStyle = GREEN;
  context.lineWidth = Math.max(3, width / 240);
  context.shadowColor = 'rgba(57, 255, 106, 0.7)';
  context.shadowBlur = Math.max(5, width / 130);

  skeletonConnections.forEach(([start, end]) => {
    const first = keypoints[start];
    const second = keypoints[end];
    if (!first || !second || (first.score ?? 0) < 0.3 || (second.score ?? 0) < 0.3) return;
    context.beginPath();
    context.moveTo(width - first.x, first.y);
    context.lineTo(width - second.x, second.y);
    context.stroke();
  });

  context.shadowBlur = Math.max(3, width / 200);
  keypoints.forEach((point) => {
    if ((point.score ?? 0) < 0.3) return;
    context.beginPath();
    context.arc(width - point.x, point.y, Math.max(4, width / 115), 0, Math.PI * 2);
    context.fillStyle = GREEN;
    context.fill();
  });
  context.shadowBlur = 0;
}

function selectMostConfident(
  keypoints: PosePoint[] | undefined,
  label: string,
  leftIndex: number,
  rightIndex: number,
): DiagnosticPoint {
  const left = keypoints?.[leftIndex];
  const right = keypoints?.[rightIndex];
  const leftScore = left?.score ?? 0;
  const rightScore = right?.score ?? 0;

  if (!left && !right) return { label, score: null, side: '—' };
  if (rightScore > leftScore) return { label, score: right?.score ?? null, side: 'der.' };
  return { label, score: left?.score ?? null, side: 'izq.' };
}

const sideKeypoints: Record<PoseSide, Record<'shoulder' | 'elbow' | 'wrist' | 'hip' | 'knee' | 'ankle', number>> = {
  left: { shoulder: 5, elbow: 7, wrist: 9, hip: 11, knee: 13, ankle: 15 },
  right: { shoulder: 6, elbow: 8, wrist: 10, hip: 12, knee: 14, ankle: 16 },
};

function getDominantSide(keypoints: PosePoint[] | undefined): DominantSideResult | null {
  if (!keypoints) return null;
  const sides: PoseSide[] = ['left', 'right'];
  const scores = sides.map((side) => {
    const indexes = Object.values(sideKeypoints[side]);
    const visible = indexes
      .map((index) => keypoints[index]?.score)
      .filter((score): score is number => typeof score === 'number');
    return {
      side,
      average: visible.length ? visible.reduce((sum, score) => sum + score, 0) / visible.length : 0,
      count: visible.length,
    };
  });
  const best = scores.sort((first, second) => second.average - first.average)[0];
  return best.count ? { side: best.side, average: best.average } : null;
}

function calculateAngle(
  first: PosePoint | undefined,
  vertex: PosePoint | undefined,
  last: PosePoint | undefined,
) {
  if (!first || !vertex || !last) return null;
  if ((first.score ?? 0) < 0.2 || (vertex.score ?? 0) < 0.2 || (last.score ?? 0) < 0.2) return null;

  const firstRadians = Math.atan2(first.y - vertex.y, first.x - vertex.x);
  const lastRadians = Math.atan2(last.y - vertex.y, last.x - vertex.x);
  const rawDegrees = Math.abs((lastRadians - firstRadians) * (180 / Math.PI));
  const degrees = rawDegrees > 180 ? 360 - rawDegrees : rawDegrees;
  return Math.round(degrees);
}

function calculateExerciseAngle(
  exercise: ExerciseId,
  keypoints: PosePoint[] | undefined,
  side: PoseSide | null,
) {
  if (!keypoints || !side) return null;
  const indexes = sideKeypoints[side];
  if (exercise === 'fondos') {
    return calculateAngle(keypoints[indexes.shoulder], keypoints[indexes.elbow], keypoints[indexes.wrist]);
  }
  if (exercise === 'sentadillas') {
    return calculateAngle(keypoints[indexes.hip], keypoints[indexes.knee], keypoints[indexes.ankle]);
  }
  return calculateAngle(keypoints[indexes.shoulder], keypoints[indexes.hip], keypoints[indexes.ankle]);
}

function getAngleDiagnosticPoints(
  exercise: ExerciseId,
  keypoints: PosePoint[] | undefined,
  side: PoseSide | null,
): AngleDiagnosticPoint[] {
  const labels: Record<ExerciseId, Array<{ label: string; joint: keyof typeof sideKeypoints.left }>> = {
    fondos: [
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Codo', joint: 'elbow' },
      { label: 'Muñeca', joint: 'wrist' },
    ],
    sentadillas: [
      { label: 'Cadera', joint: 'hip' },
      { label: 'Rodilla', joint: 'knee' },
      { label: 'Tobillo', joint: 'ankle' },
    ],
    plancha: [
      { label: 'Hombro', joint: 'shoulder' },
      { label: 'Cadera', joint: 'hip' },
      { label: 'Tobillo', joint: 'ankle' },
    ],
  };
  const indexes = side ? sideKeypoints[side] : null;

  return labels[exercise].map(({ label, joint }) => {
    const point = indexes && keypoints?.[indexes[joint]];
    return {
      label,
      x: point?.x ?? null,
      y: point?.y ?? null,
    };
  });
}

function getExercise(exerciseId: ExerciseId | null) {
  return exercises.find((exercise) => exercise.id === exerciseId) ?? null;
}

function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<PoseDetector | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const activeRef = useRef(false);
  const busyRef = useRef(false);
  const [phase, setPhase] = useState<SessionPhase>('exercise-select');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseId | null>(null);
  const selectedExerciseRef = useRef<ExerciseId | null>(null);
  const [poseDetected, setPoseDetected] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [videoRatio, setVideoRatio] = useState('3 / 4');
  const [modelStatus, setModelStatus] = useState('Modelo sin iniciar');
  const [videoResolution, setVideoResolution] = useState<VideoResolution>({ width: 0, height: 0 });
  const [fps, setFps] = useState(0);
  const [confidencePoints, setConfidencePoints] = useState<DiagnosticPoint[]>([
    { label: 'Hombro', score: null, side: '—' },
    { label: 'Cadera', score: null, side: '—' },
    { label: 'Rodilla', score: null, side: '—' },
  ]);
  const [errorCount, setErrorCount] = useState(0);
  const [angle, setAngle] = useState<number | null>(null);
  const [dominantSide, setDominantSide] = useState<PoseSide | null>(null);
  const [sideConfidence, setSideConfidence] = useState<number | null>(null);
  const [sideSwitches, setSideSwitches] = useState(0);
  const [sideChangeNotice, setSideChangeNotice] = useState('Sin cambios');
  const [anglePoints, setAnglePoints] = useState<AngleDiagnosticPoint[]>([]);
  const [angleHistory, setAngleHistory] = useState<number[]>([]);
  const errorCountRef = useRef(0);
  const fpsFramesRef = useRef(0);
  const previousSideRef = useRef<PoseSide | null>(null);
  const sideSwitchesRef = useRef(0);

  const incrementErrorCount = useCallback(() => {
    errorCountRef.current += 1;
    setErrorCount(errorCountRef.current);
  }, []);

  useEffect(() => {
    const handleWindowError = () => incrementErrorCount();
    const handleUnhandledRejection = () => incrementErrorCount();
    const originalConsoleError = console.error.bind(console);

    console.error = (...args: unknown[]) => {
      incrementErrorCount();
      originalConsoleError(...args);
    };
    window.addEventListener('error', handleWindowError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      console.error = originalConsoleError;
      window.removeEventListener('error', handleWindowError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [incrementErrorCount]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setFps(fpsFramesRef.current);
      fpsFramesRef.current = 0;
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const stopResources = useCallback(() => {
    activeRef.current = false;
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (detectorRef.current?.dispose) detectorRef.current.dispose();
    detectorRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    if (canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      context?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, []);

  const syncVideoSize = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth || !video.videoHeight) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    setVideoRatio(`${video.videoWidth} / ${video.videoHeight}`);
    setVideoResolution({ width: video.videoWidth, height: video.videoHeight });
  }, []);

  const processFrame = useCallback(async () => {
    const video = videoRef.current;
    const detector = detectorRef.current;
    if (!activeRef.current || !video || !detector) return;
    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      animationFrameRef.current = requestAnimationFrame(() => void processFrame());
      return;
    }

    try {
      const poses = await detector.estimatePoses(video, { flipHorizontal: false });
      const pose = poses[0];
      const visiblePoints = pose?.keypoints?.filter((point) => (point.score ?? 0) >= 0.3).length ?? 0;
      const nextDominantSideResult = getDominantSide(pose?.keypoints);
      const nextDominantSide = nextDominantSideResult?.side ?? null;
      const nextAngle = calculateExerciseAngle(
        selectedExerciseRef.current ?? 'fondos',
        pose?.keypoints,
        nextDominantSide,
      );
      fpsFramesRef.current += 1;
      setPoseDetected(visiblePoints >= 5);
      setDominantSide(nextDominantSide);
      setSideConfidence(nextDominantSideResult?.average ?? null);
      setAngle(nextAngle);
      setAnglePoints(getAngleDiagnosticPoints(
        selectedExerciseRef.current ?? 'fondos',
        pose?.keypoints,
        nextDominantSide,
      ));
      if (nextAngle !== null) {
        setAngleHistory((history) => [...history, nextAngle].slice(-5));
      }
      if (nextDominantSide && previousSideRef.current && nextDominantSide !== previousSideRef.current) {
        sideSwitchesRef.current += 1;
        setSideSwitches(sideSwitchesRef.current);
        setSideChangeNotice(
          `${previousSideRef.current === 'left' ? 'Izquierdo' : 'Derecho'} → ${nextDominantSide === 'left' ? 'izquierdo' : 'derecho'}`,
        );
      }
      previousSideRef.current = nextDominantSide;
      setConfidencePoints([
        selectMostConfident(pose?.keypoints, 'Hombro', 5, 6),
        selectMostConfident(pose?.keypoints, 'Cadera', 11, 12),
        selectMostConfident(pose?.keypoints, 'Rodilla', 13, 14),
      ]);
      if (canvasRef.current) drawSkeleton(canvasRef.current, video, pose);
    } catch {
      if (activeRef.current) {
        incrementErrorCount();
        setPoseDetected(false);
      }
    }

    if (activeRef.current) {
      animationFrameRef.current = requestAnimationFrame(() => void processFrame());
    }
  }, [incrementErrorCount]);

  const loadDetector = useCallback(async () => {
    await loadScript(SCRIPT_URLS.tensorflow, 'posture-tfjs');
    await loadScript(SCRIPT_URLS.poseDetection, 'posture-pose-detection');
    const browser = window as BrowserGlobals;
    if (!browser.poseDetection) throw new Error('El análisis no está disponible.');
    return browser.poseDetection.createDetector(
      browser.poseDetection.SupportedModels.MoveNet,
      { modelType: browser.poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING },
    );
  }, []);

  const startCamera = useCallback(async (exerciseId?: ExerciseId) => {
    if (busyRef.current) return;
    busyRef.current = true;
    const activeExercise = exerciseId ?? selectedExerciseRef.current;
    if (!activeExercise) {
      busyRef.current = false;
      return;
    }
    selectedExerciseRef.current = activeExercise;
    setSelectedExercise(activeExercise);
    stopResources();
    setPoseDetected(false);
    setErrorMessage('');
    setModelStatus('Cargando modelo...');
    setVideoResolution({ width: 0, height: 0 });
    setFps(0);
    fpsFramesRef.current = 0;
    setConfidencePoints([
      { label: 'Hombro', score: null, side: '—' },
      { label: 'Cadera', score: null, side: '—' },
      { label: 'Rodilla', score: null, side: '—' },
    ]);
    errorCountRef.current = 0;
    setErrorCount(0);
    setAngle(null);
    setDominantSide(null);
    setSideConfidence(null);
    setSideSwitches(0);
    setSideChangeNotice('Sin cambios');
    setAnglePoints([]);
    setAngleHistory([]);
    previousSideRef.current = null;
    sideSwitchesRef.current = 0;
    setPhase('requesting');

    try {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('La cámara necesita una conexión segura y compatible con el navegador.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
      });
      streamRef.current = stream;
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const video = videoRef.current;
      if (!video) throw new Error('No se pudo preparar la vista de cámara.');
      video.srcObject = stream;
      await video.play();
      syncVideoSize();
      setPhase('loading-model');
      const detector = await loadDetector();
      detectorRef.current = detector;
      setModelStatus('Modelo cargado ✓');
      activeRef.current = true;
      setPhase('tracking');
      animationFrameRef.current = requestAnimationFrame(() => void processFrame());
    } catch (error) {
      stopResources();
      const name = error instanceof DOMException ? error.name : '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setErrorMessage('El acceso fue bloqueado. Permite la cámara en los ajustes del navegador para continuar.');
      } else if (name === 'NotFoundError') {
        setErrorMessage('No encontramos una cámara disponible en este dispositivo.');
      } else if (error instanceof Error && error.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('No pudimos activar la cámara. Comprueba los permisos e inténtalo de nuevo.');
      }
      if (error instanceof Error && error.message) setModelStatus(error.message);
      setPhase('error');
    } finally {
      busyRef.current = false;
    }
  }, [loadDetector, processFrame, stopResources, syncVideoSize]);

  const returnToWelcome = useCallback(() => {
    stopResources();
    selectedExerciseRef.current = null;
    setSelectedExercise(null);
    setPoseDetected(false);
    setErrorMessage('');
    setAngle(null);
    setDominantSide(null);
    setSideConfidence(null);
    setSideSwitches(0);
    setSideChangeNotice('Sin cambios');
    setAnglePoints([]);
    setAngleHistory([]);
    previousSideRef.current = null;
    sideSwitchesRef.current = 0;
    setPhase('exercise-select');
  }, [stopResources]);

  useEffect(() => () => stopResources(), [stopResources]);

  const isActive = phase === 'requesting' || phase === 'loading-model' || phase === 'tracking';
  const activeExercise = getExercise(selectedExercise);
  const statusMessage = poseDetected ? 'Cuerpo detectado ✓' : 'Buscando tu cuerpo...';
  const modelStatusClass = modelStatus.includes('✓')
    ? 'diagnostic-value diagnostic-value--success'
    : modelStatus === 'Cargando modelo...'
      ? 'diagnostic-value diagnostic-value--loading'
      : 'diagnostic-value diagnostic-value--error';
  const resolutionLabel = videoResolution.width && videoResolution.height
    ? `${videoResolution.width} × ${videoResolution.height}`
    : '— × —';
  const formatScore = (score: number | null) => score === null ? '—' : score.toFixed(2);
  const sideLabel = dominantSide === 'left' ? 'Izquierdo' : dominantSide === 'right' ? 'Derecho' : '—';
  const sideLabelWithScore = dominantSide && sideConfidence !== null
    ? `${sideLabel} · ${sideConfidence.toFixed(2)}`
    : `${sideLabel} · —`;
  const angleLabel = angle === null ? '—' : `${angle}°`;
  const angleHistoryLabel = angleHistory.length
    ? angleHistory.map((value) => `${value}°`).join(' · ')
    : '—';
  const formatCoordinate = (value: number | null) => value === null ? '—' : value.toFixed(1);

  return (
    <div className="posture-app">
      <div className="ambient-orb ambient-orb--top" aria-hidden="true" />
      <div className="ambient-orb ambient-orb--bottom" aria-hidden="true" />
      <main className="coach-layout">
        <header className="topbar">
          <div className="wordmark">
            <span className="wordmark-mark" aria-hidden="true" />
            <span>COACH / POSTURA</span>
          </div>
          <div className="privacy-chip">
            <ShieldCheck size={13} strokeWidth={1.8} aria-hidden="true" />
            <span>Privado</span>
          </div>
        </header>

        <div className="coach-stage">
          {phase === 'exercise-select' && (
            <section className="glass-panel exercise-panel" aria-labelledby="exercise-title">
              <div className="panel-kicker">
                <span className="kicker-line" aria-hidden="true" />
                <span>Tu espacio de alineación</span>
                <span className="kicker-line" aria-hidden="true" />
              </div>
              <h1 id="exercise-title" className="welcome-title">Elige tu ejercicio</h1>
              <p className="welcome-subtitle">
                Selecciona un movimiento para empezar a observar tu técnica en tiempo real.
              </p>
              <div className="exercise-list">
                {exercises.map((exercise) => {
                  const ExerciseIcon = exercise.id === 'fondos'
                    ? Activity
                    : exercise.id === 'sentadillas'
                      ? ArrowDown
                      : Square;
                  return (
                    <button
                      key={exercise.id}
                      type="button"
                      className="exercise-card"
                      data-testid={`exercise-${exercise.id}`}
                      onClick={() => void startCamera(exercise.id)}
                    >
                      <span className="exercise-card-icon" aria-hidden="true">
                        <ExerciseIcon size={20} strokeWidth={1.8} />
                      </span>
                      <span className="exercise-card-copy">
                        <strong>{exercise.name}</strong>
                        <small>{exercise.description}</small>
                      </span>
                      <ArrowRight className="exercise-card-arrow" size={17} strokeWidth={1.8} aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
              <p className="privacy-note">
                <ShieldCheck size={14} strokeWidth={1.8} aria-hidden="true" />
                <span>La imagen se procesa solo en tu dispositivo.</span>
              </p>
            </section>
          )}

          {isActive && (
            <section className="glass-panel active-panel" aria-labelledby="active-title">
              <div className="active-header">
                <div>
                  <h1 id="active-title" className="active-title">{activeExercise?.name ?? 'Alineación en directo'}</h1>
                  <div className="active-meta">
                    <span className="active-meta-dot" aria-hidden="true" />
                    <span>Vista frontal · {dominantSide === 'left' ? 'lado izquierdo' : dominantSide === 'right' ? 'lado derecho' : 'buscando lado'}</span>
                  </div>
                </div>
                <ShieldCheck size={18} color={GREEN} strokeWidth={1.8} aria-label="Procesamiento privado" />
              </div>
              <div className="video-stage" style={{ aspectRatio: videoRatio }}>
                <video
                  ref={videoRef}
                  muted
                  autoPlay
                  playsInline
                  onLoadedMetadata={syncVideoSize}
                  data-testid="video-camera-preview"
                  aria-label="Vista previa de la cámara frontal"
                />
                <canvas ref={canvasRef} aria-hidden="true" />
                <div className="video-vignette" aria-hidden="true" />
                <span className="stage-corner stage-corner--tl" aria-hidden="true" />
                <span className="stage-corner stage-corner--tr" aria-hidden="true" />
                <span className="stage-corner stage-corner--bl" aria-hidden="true" />
                <span className="stage-corner stage-corner--br" aria-hidden="true" />
                  <div className="angle-hud" aria-live="polite">
                    <span className="angle-hud-label">Ángulo</span>
                    <strong>{angle === null ? '—' : `${angle}°`}</strong>
                    <small>{activeExercise?.angleLabel ?? 'Esperando puntos'}</small>
                  </div>
                {phase !== 'tracking' && (
                  <div className="camera-loading" role="status" aria-live="polite">
                    <div className="loading-copy">
                      <span className="loading-mark" aria-hidden="true" />
                      <span>{phase === 'requesting' ? 'Solicitando acceso...' : 'Preparando tu vista...'}</span>
                    </div>
                  </div>
                )}
              </div>
              <div
                className={`status-surface ${poseDetected ? 'is-detected' : 'is-searching'}`}
                role="status"
                aria-live="polite"
                aria-atomic="true"
                data-testid="status-posture"
              >
                <div className="status-reading">
                  <span className="status-dot" aria-hidden="true" />
                  <span>{statusMessage}</span>
                </div>
                <button
                  type="button"
                  className="stop-action"
                  data-testid="button-stop-camera"
                  onClick={returnToWelcome}
                >
                  <ArrowLeft size={14} strokeWidth={2} aria-hidden="true" />
                  <span>Volver</span>
                </button>
              </div>
              <aside className="diagnostic-panel" aria-label="Panel de diagnóstico temporal">
                <div className="diagnostic-heading">
                  <span>Diagnóstico</span>
                  <span className="diagnostic-temporary">Temporal</span>
                </div>
                <dl className="diagnostic-list">
                  <div className="diagnostic-row">
                    <dt>Modelo</dt>
                    <dd className={modelStatusClass}>{modelStatus}</dd>
                  </div>
                  <div className="diagnostic-row">
                    <dt>Ejercicio</dt>
                    <dd className="diagnostic-value">{activeExercise?.name ?? '—'}</dd>
                  </div>
                  <div className="diagnostic-row">
                    <dt>Lado / score</dt>
                    <dd className={`diagnostic-value ${sideSwitches > 0 ? 'diagnostic-value--warning' : ''}`}>
                      {sideLabelWithScore}
                    </dd>
                  </div>
                  <div className="diagnostic-row">
                    <dt>Cambio de lado</dt>
                    <dd className={`diagnostic-value ${sideSwitches > 0 ? 'diagnostic-value--warning' : ''}`}>
                      {sideChangeNotice}{sideSwitches > 0 ? ` (${sideSwitches})` : ''}
                    </dd>
                  </div>
                  <div className="diagnostic-row diagnostic-row--points">
                    <dt>Puntos ángulo</dt>
                    <dd className="diagnostic-angle-points">
                      {anglePoints.length
                        ? anglePoints.map((point) => (
                          <span key={point.label}>
                            {point.label} ({formatCoordinate(point.x)}, {formatCoordinate(point.y)})
                          </span>
                        ))
                        : '—'}
                    </dd>
                  </div>
                  <div className="diagnostic-row">
                    <dt>Ángulo actual</dt>
                    <dd className="diagnostic-value diagnostic-value--accent">{angleLabel}</dd>
                  </div>
                  <div className="diagnostic-row diagnostic-row--history">
                    <dt>Historial (5)</dt>
                    <dd className="diagnostic-angle-history">{angleHistoryLabel}</dd>
                  </div>
                  <div className="diagnostic-row">
                    <dt>Video</dt>
                    <dd className="diagnostic-value">{resolutionLabel}</dd>
                  </div>
                  <div className="diagnostic-row">
                    <dt>FPS detección</dt>
                    <dd className="diagnostic-value">{fps}</dd>
                  </div>
                  <div className="diagnostic-row">
                    <dt>Persona</dt>
                    <dd className={`diagnostic-value ${poseDetected ? 'diagnostic-value--success' : ''}`}>
                      {poseDetected ? 'Cuerpo detectado ✓' : 'Sin detección'}
                    </dd>
                  </div>
                  <div className="diagnostic-row diagnostic-row--confidence">
                    <dt>Confianza</dt>
                    <dd className="diagnostic-confidence">
                      {confidencePoints.map((point) => (
                        <span key={point.label}>
                          {point.label} {formatScore(point.score)} <small>{point.side}</small>
                        </span>
                      ))}
                    </dd>
                  </div>
                  <div className="diagnostic-row">
                    <dt>Errores JS</dt>
                    <dd className={`diagnostic-value ${errorCount > 0 ? 'diagnostic-value--error' : ''}`}>
                      {errorCount}
                    </dd>
                  </div>
                </dl>
              </aside>
            </section>
          )}

          {phase === 'error' && (
            <section className="glass-panel error-panel" aria-labelledby="error-title" role="alert">
              <div className="error-mark" aria-hidden="true">
                <AlertTriangle size={22} strokeWidth={1.7} />
              </div>
              <h1 id="error-title" className="error-title">No pudimos activar la cámara</h1>
              <p className="error-copy">{errorMessage}</p>
              <div className="error-actions">
                <button
                  type="button"
                  className="secondary-action"
                  data-testid="button-retry-camera"
                  onClick={() => void startCamera(selectedExerciseRef.current ?? undefined)}
                >
                  <Camera size={16} strokeWidth={2} aria-hidden="true" />
                  <span>Intentar de nuevo</span>
                </button>
                <button
                  type="button"
                  className="stop-action"
                  data-testid="button-return-welcome"
                  onClick={returnToWelcome}
                >
                  <ArrowLeft size={14} strokeWidth={2} aria-hidden="true" />
                  <span>Volver al inicio</span>
                </button>
              </div>
            </section>
          )}
        </div>

        <p className="app-footer">Sin grabaciones · Sin cuentas · Solo tú y tu movimiento</p>
      </main>
    </div>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;