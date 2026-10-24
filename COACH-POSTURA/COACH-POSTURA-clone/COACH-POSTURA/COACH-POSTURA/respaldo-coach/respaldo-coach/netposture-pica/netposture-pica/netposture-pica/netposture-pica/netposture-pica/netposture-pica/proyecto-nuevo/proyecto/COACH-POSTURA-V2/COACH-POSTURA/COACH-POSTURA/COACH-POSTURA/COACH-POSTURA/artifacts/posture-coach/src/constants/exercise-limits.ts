import type {
  ExerciseId,
  MuscleUpPullupTrackerConfig,
  PullupTrackerConfig,
} from '@/types/tracking';

export const PICA_TOLERANCIA_GRADOS = 5;
export const CRUCES_TOLERANCIA_GRADOS = 15;
export const PRESS_BANCA_TOLERANCIA_GRADOS = 15;
export const PRESS_BANCA_TOLERANCIA_ABAJO_GRADOS = 30;
export const PRESS_BANCA_INCLINADO_TOLERANCIA_GRADOS = 15;
export const PRESS_BANCA_INCLINADO_TOLERANCIA_ABAJO_GRADOS = 30;
export const PICA_TOLERANCIA_ELEVACION_PROPORCION =
  PICA_TOLERANCIA_GRADOS * (0.03 / 5);
export const PIKE_ELBOW_BODY_MIN_ANGLE = 70 - PICA_TOLERANCIA_GRADOS;
export const PIKE_ELBOW_BODY_MAX_ANGLE = 139 + PICA_TOLERANCIA_GRADOS;
export const PIKE_WRIST_SHOULDER_MIN_ANGLE = 46 - PICA_TOLERANCIA_GRADOS;
export const PIKE_WRIST_SHOULDER_MAX_ANGLE = 93 + PICA_TOLERANCIA_GRADOS;
export const PIKE_MIN_HIP_LIFT_RATIO = 0.616 - PICA_TOLERANCIA_ELEVACION_PROPORCION;
export const PIKE_MAX_HIP_LIFT_RATIO = 0.794 + PICA_TOLERANCIA_ELEVACION_PROPORCION;
export const PIKE_MIN_BODY_FOLD_ANGLE = 72 - PICA_TOLERANCIA_GRADOS;
export const PIKE_MAX_BODY_FOLD_ANGLE = 97 + PICA_TOLERANCIA_GRADOS;
export const PIKE_REP_START_MIN_ANGLE = 142 - PICA_TOLERANCIA_GRADOS;
export const PIKE_REP_ACTIVATION_ANGLE = 130 + PICA_TOLERANCIA_GRADOS;
// El fondo conserva el piso solicitado de 70° y amplía el límite superior con tolerancia.
export const PIKE_REP_END_MIN_ANGLE = Math.min(70, 94 - PICA_TOLERANCIA_GRADOS);
export const PIKE_REP_END_MAX_ANGLE = 109 + PICA_TOLERANCIA_GRADOS;
export const UPLOADED_PIKE_PUSHUP_START_MIN_ANGLE = PIKE_REP_START_MIN_ANGLE;
export const UPLOADED_PIKE_PUSHUP_END_MIN_ANGLE = PIKE_REP_END_MIN_ANGLE;
export const UPLOADED_PIKE_PUSHUP_END_MAX_ANGLE = PIKE_REP_END_MAX_ANGLE;

export const SQUAT_RISE_THRESHOLD = 115;
export const SQUAT_SMOOTHING_SAMPLES = 5;
export const ANGLE_DISPLAY_SAMPLES = 7;
export const ANGLE_DISPLAY_INTERVAL_MS = 220;
export const POSE_MODEL_LOAD_TIMEOUT_MS = 60000;
// Calibración de dominadas basada en las lecturas de la ejecución de referencia:
// abajo: codo extendido; arriba: codo flexionado.
// En la vista trasera del video, la extensión real se midió entre 130–180°.
// Se amplía el inicio válido para no convertir una lectura 3D comprimida en
// un falso "sin bloqueo".
export const PULLUP_BOTTOM_MIN_ANGLE = 125;
export const PULLUP_BOTTOM_MAX_ANGLE = 180;
export const PULLUP_PULL_ACTIVATION_ANGLE = 120;
export const PULLUP_NO_LOCKOUT_ANGLE = 155;
// La cabeza sobre las muñecas es la señal principal; el rango bilateral de
// codos aporta una confirmación secundaria cuando la cabeza pierde confianza.
export const PULLUP_BOTTOM_SHOULDER_MIN_ANGLE = 125;
export const PULLUP_TOP_SHOULDER_MIN_ANGLE = 70;
export const PULLUP_TOP_SHOULDER_MAX_ANGLE = 125;
// En la ejecución de referencia, la parte alta llegó aproximadamente a
// 57–135° por lado. El rango acepta esa variación 3D sin exigir una postura
// idéntica en ambos brazos.
export const PULLUP_TOP_ELBOW_MIN_ANGLE = 45;
export const PULLUP_TOP_ELBOW_MAX_ANGLE = 145;
export const PULLUP_TOLERANCE_DEG = 5;
export const PULLUP_SMOOTHING_SAMPLES = 5;
export const PULLUP_BOTTOM_STABLE_FRAMES = 3;
export const PULLUP_TOP_CONFIRMATION_FRAMES = 2;
export const PULLUP_RISING_DELTA_DEG = 3;
export const PULLUP_BAR_DETACH_STABLE_FRAMES = 3;
export const PULLUP_BAR_DETACH_SHOULDER_MARGIN_RATIO = 0.18;
export const PULLUP_BAR_DETACH_MIN_SHOULDER_MARGIN_PX = 24;
export const STANDARD_PULLUP_TRACKER_CONFIG: PullupTrackerConfig = {
  bottomMinAngle: PULLUP_BOTTOM_MIN_ANGLE,
  bottomMaxAngle: PULLUP_BOTTOM_MAX_ANGLE,
  pullActivationAngle: PULLUP_PULL_ACTIVATION_ANGLE,
  noLockoutAngle: PULLUP_NO_LOCKOUT_ANGLE,
  topElbowMinAngle: PULLUP_TOP_ELBOW_MIN_ANGLE,
  topElbowMaxAngle: PULLUP_TOP_ELBOW_MAX_ANGLE,
  smoothingSamples: PULLUP_SMOOTHING_SAMPLES,
  bottomStableFrames: PULLUP_BOTTOM_STABLE_FRAMES,
  topConfirmationFrames: PULLUP_TOP_CONFIRMATION_FRAMES,
  risingDeltaDeg: PULLUP_RISING_DELTA_DEG,
  angleToleranceDeg: PULLUP_TOLERANCE_DEG,
};
export const MUSCLE_UP_PULLUP_BOTTOM_MIN_ANGLE = 125;
export const MUSCLE_UP_PULLUP_BOTTOM_MAX_ANGLE = 180;
export const MUSCLE_UP_PULLUP_PULL_ACTIVATION_ANGLE = 120;
export const MUSCLE_UP_PULLUP_NO_LOCKOUT_ANGLE = 155;
export const MUSCLE_UP_PULLUP_BOTTOM_SHOULDER_MIN_ANGLE = 125;
export const MUSCLE_UP_PULLUP_TOP_SHOULDER_MIN_ANGLE = 70;
export const MUSCLE_UP_PULLUP_TOP_SHOULDER_MAX_ANGLE = 125;
export const MUSCLE_UP_PULLUP_TOP_ELBOW_MIN_ANGLE = 45;
export const MUSCLE_UP_PULLUP_TOP_ELBOW_MAX_ANGLE = 145;
export const MUSCLE_UP_PULLUP_TOLERANCE_DEG = 5;
export const MUSCLE_UP_PULLUP_SMOOTHING_SAMPLES = 5;
export const MUSCLE_UP_PULLUP_BOTTOM_STABLE_FRAMES = 3;
export const MUSCLE_UP_PULLUP_MIN_TOP_FRAMES = 5;
export const MUSCLE_UP_PULLUP_RISING_DELTA_DEG = 3;
export const MUSCLE_UP_PULLUP_POSITIONAL_MARGIN_RATIO = 0.12;
export const MUSCLE_UP_PULLUP_POSITIONAL_MARGIN_MIN_PX = 12;
export const MUSCLE_UP_PULLUP_BODY_MOTION_WINDOW_FRAMES = 5;
export const MUSCLE_UP_PULLUP_BODY_MOTION_MIN_RISE_RATIO = 0.025;
export const MUSCLE_UP_PULLUP_BODY_MOTION_MIN_RISE_PX = 2;
export const MUSCLE_UP_PULLUP_ASCENT_SIGNAL_TTL_MS = 1000;
export const MUSCLE_UP_PULLUP_RAW_ELBOW_WINDOW_MS = 1000;
export const MUSCLE_UP_PULLUP_BAR_DETACH_STABLE_FRAMES = 3;
export const MUSCLE_UP_PULLUP_BAR_DETACH_SHOULDER_MARGIN_RATIO = 0.18;
export const MUSCLE_UP_PULLUP_BAR_DETACH_MIN_SHOULDER_MARGIN_PX = 24;
export const MUSCLE_UP_PULLUP_BODY_DETECTION_HOLD_MS = 5000;
export const MUSCLE_UP_UPLOADED_SEARCH_DURATION_FRACTION = 0.2;
export const MUSCLE_UP_PULLUP_BAR_PREPARATION_COUNTDOWN_MS = 5000;
export const MUSCLEUP_INCORRECT_ELBOW_MAX_DEG = 100;
export const MUSCLEUP_INCORRECT_NOSE_OVER_WRIST_MIN = -0.10;
export const MUSCLE_UP_PULLUP_TRACKER_CONFIG: MuscleUpPullupTrackerConfig = {
  bottomMinAngle: MUSCLE_UP_PULLUP_BOTTOM_MIN_ANGLE,
  bottomMaxAngle: MUSCLE_UP_PULLUP_BOTTOM_MAX_ANGLE,
  pullActivationAngle: MUSCLE_UP_PULLUP_PULL_ACTIVATION_ANGLE,
  noLockoutAngle: MUSCLE_UP_PULLUP_NO_LOCKOUT_ANGLE,
  topElbowMinAngle: MUSCLE_UP_PULLUP_TOP_ELBOW_MIN_ANGLE,
  topElbowMaxAngle: MUSCLE_UP_PULLUP_TOP_ELBOW_MAX_ANGLE,
  smoothingSamples: MUSCLE_UP_PULLUP_SMOOTHING_SAMPLES,
  bottomStableFrames: MUSCLE_UP_PULLUP_BOTTOM_STABLE_FRAMES,
  topConfirmationFrames: MUSCLE_UP_PULLUP_MIN_TOP_FRAMES,
  risingDeltaDeg: MUSCLE_UP_PULLUP_RISING_DELTA_DEG,
  angleToleranceDeg: MUSCLE_UP_PULLUP_TOLERANCE_DEG,
};
export const COMMAND_PULLUP_TRACKER_CONFIG: PullupTrackerConfig = {
  ...STANDARD_PULLUP_TRACKER_CONFIG,
};
export const COMMAND_PULLUP_TRACE_ENABLED = true;
export const PULLUP_BODY_DETECTION_HOLD_MS = 5000;
export const PULLUP_BAR_PREPARATION_COUNTDOWN_MS = 5000;
export const PUSHUP_BODY_DETECTION_HOLD_MS = 5000;
export const PUSHUP_PREPARATION_COUNTDOWN_MS = 5000;
export const CRUCES_BODY_DETECTION_HOLD_MS = 5000;
export const CRUCES_PREPARATION_COUNTDOWN_MS = 5000;
export const PRESS_BANCA_BODY_DETECTION_HOLD_MS = 5000;
export const PRESS_BANCA_PREPARATION_COUNTDOWN_MS = 5000;
export const PRESS_BANCA_SEARCH_GAP_TOLERANCE_SECONDS = 0.6;
export const PRESS_BANCA_MIN_POINT_SCORE = 0.38;
export const PRESS_BANCA_VIDEO_TRANSITION_DELAY_MS = 1200;
export const DIP_VALID_MIN_ANGLE = 85;
export const DIP_VALID_MAX_ANGLE = 95;
// Calibración derivada del video de referencia del usuario:
// inicio con el codo flexionado y final con el brazo extendido arriba.
export const MILITARY_PRESS_START_MIN_ANGLE = 130;
export const MILITARY_PRESS_START_MAX_ANGLE = 145;
export const MILITARY_PRESS_ACTIVATION_ANGLE = 145;
export const MILITARY_PRESS_VALID_MIN_ANGLE = 150;
export const MILITARY_PRESS_VALID_MAX_ANGLE = 170;
export const MILITARY_PRESS_TOLERANCE = 3;
export const MILITARY_PRESS_ACCEPTED_START_MIN_ANGLE =
  MILITARY_PRESS_START_MIN_ANGLE - MILITARY_PRESS_TOLERANCE;
export const MILITARY_PRESS_ACCEPTED_START_MAX_ANGLE =
  MILITARY_PRESS_START_MAX_ANGLE + MILITARY_PRESS_TOLERANCE;
export const MILITARY_PRESS_ACCEPTED_VALID_MIN_ANGLE =
  MILITARY_PRESS_VALID_MIN_ANGLE - MILITARY_PRESS_TOLERANCE;
export const MILITARY_PRESS_ACCEPTED_VALID_MAX_ANGLE =
  MILITARY_PRESS_VALID_MAX_ANGLE + MILITARY_PRESS_TOLERANCE;
// Calibración del press de hombros en máquina a partir del video de referencia:
// hombro abajo: 70–112°; activación sobre 115°; hombro arriba: 125–160°.
export const SHOULDER_MACHINE_PRESS_START_MIN_ANGLE = 70;
export const SHOULDER_MACHINE_PRESS_START_MAX_ANGLE = 112;
export const SHOULDER_MACHINE_PRESS_ACTIVATION_ANGLE = 115;
export const SHOULDER_MACHINE_PRESS_END_MIN_ANGLE = 125;
export const SHOULDER_MACHINE_PRESS_END_MAX_ANGLE = 160;
export const SHOULDER_MACHINE_PRESS_MAX_SIDE_DIFFERENCE = 24;
export const SHOULDER_MACHINE_PRESS_WRIST_MIN_ANGLE = 120;
export const SHOULDER_MACHINE_PRESS_WRIST_MAX_ANGLE = 180;
export const SHOULDER_MACHINE_PRESS_TOLERANCE = 3;
export const SHOULDER_MACHINE_PRESS_ACCEPTED_START_MIN_ANGLE =
  SHOULDER_MACHINE_PRESS_START_MIN_ANGLE - SHOULDER_MACHINE_PRESS_TOLERANCE;
export const SHOULDER_MACHINE_PRESS_ACCEPTED_START_MAX_ANGLE =
  SHOULDER_MACHINE_PRESS_START_MAX_ANGLE + SHOULDER_MACHINE_PRESS_TOLERANCE;
export const SHOULDER_MACHINE_PRESS_ACCEPTED_END_MIN_ANGLE =
  SHOULDER_MACHINE_PRESS_END_MIN_ANGLE - SHOULDER_MACHINE_PRESS_TOLERANCE;
export const SHOULDER_MACHINE_PRESS_ACCEPTED_END_MAX_ANGLE =
  SHOULDER_MACHINE_PRESS_END_MAX_ANGLE + SHOULDER_MACHINE_PRESS_TOLERANCE;
export const SHOULDER_MACHINE_PRESS_ACCEPTED_MAX_SIDE_DIFFERENCE =
  SHOULDER_MACHINE_PRESS_MAX_SIDE_DIFFERENCE + SHOULDER_MACHINE_PRESS_TOLERANCE;
export const SHOULDER_MACHINE_PRESS_ACCEPTED_WRIST_MIN_ANGLE =
  SHOULDER_MACHINE_PRESS_WRIST_MIN_ANGLE - SHOULDER_MACHINE_PRESS_TOLERANCE;
export const SHOULDER_MACHINE_PRESS_ACCEPTED_WRIST_MAX_ANGLE =
  SHOULDER_MACHINE_PRESS_WRIST_MAX_ANGLE;
// Calibración base del press plano con mancuernas:
// arriba con ambos codos extendidos, descenso controlado y fondo entre 72–105°.
export const DUMBBELL_PRESS_START_MIN_ANGLE = 150;
export const DUMBBELL_PRESS_START_MAX_ANGLE = 180;
export const DUMBBELL_PRESS_ACTIVATION_ANGLE = 135;
export const DUMBBELL_PRESS_END_MIN_ANGLE = 72;
export const DUMBBELL_PRESS_END_MAX_ANGLE = 105;
export const DUMBBELL_PRESS_MAX_SIDE_DIFFERENCE = 20;
export const LATERAL_RAISE_START_MIN_ANGLE = 0;
export const LATERAL_RAISE_START_MAX_ANGLE = 40;
export const LATERAL_RAISE_ACTIVATION_ANGLE = 55;
export const LATERAL_RAISE_END_MIN_ANGLE = 75;
export const LATERAL_RAISE_END_MAX_ANGLE = 110;
export const DIP_TORSO_MIN_ANGLE = 30;
export const DIP_TORSO_MAX_ANGLE = 40;
export const PLANK_MAX_HIP_SAG_RATIO = 0.08;
export const PLANK_MAX_HIP_RAISE_RATIO = 0.08;
export const PLANK_MIN_BODY_LINE_ANGLE = 162;
export const PLANK_ARM_FLOOR_MIN_ANGLE = 80;
export const PLANK_ARM_FLOOR_MAX_ANGLE = 100;
export const PLANK_ELBOW_MIN_ANGLE = 80;
export const PLANK_ELBOW_MAX_ANGLE = 100;
// Calibración basada en la secuencia de referencia del usuario:
// inicio 134–148°, activación alrededor de 115° y punto bajo 62–94°.
export const PULLDOWN_ANGLE_MIN = 60;
export const PULLDOWN_ANGLE_MAX = 90;
export const PULLDOWN_TORSO_MIN_ANGLE = 10;
export const PULLDOWN_TORSO_MAX_ANGLE = 25;
export const PULLDOWN_ELBOW_MIN_ANGLE = 85;
export const PULLDOWN_ELBOW_MAX_ANGLE = 110;
// Este ángulo se calcula en el hombro (cadera–hombro–codo). En las sesiones
// laterales correctas observadas, la lectura puede quedar entre 68–77° aunque
// la línea corporal sea válida; mantenemos margen hasta 80° para no marcar
// como incorrecta una flexión bien ejecutada por la perspectiva 3D.
export const PUSHUP_ELBOW_TORSO_MIN_ANGLE = 0;
export const PUSHUP_ELBOW_TORSO_MAX_ANGLE = 70;
export const PUSHUP_ELBOW_TORSO_TOLERANCE = 10;
export const PUSHUP_BODY_LINE_MIN_ANGLE = 162;
export const PUSHUP_BODY_LINE_MAX_ANGLE = 180;
// Solo declinadas: tolerancia provisional ajustable de 10° sobre el mínimo
// nominal de 162°, por lo que se acepta una línea hombro–cadera–rodilla desde 152°.
export const DECLINED_PUSHUP_BODY_LINE_TOLERANCE_DEGREES = 10;
export const DECLINED_PUSHUP_BODY_LINE_MIN_ACCEPTED_ANGLE =
  PUSHUP_BODY_LINE_MIN_ANGLE - DECLINED_PUSHUP_BODY_LINE_TOLERANCE_DEGREES;
export const PUSHUP_PERSISTENT_HOLD_MAX_FRAMES = 2;
export const PUSHUP_COUNT_STABLE_FRAMES = 2;
// Calibración del recorrido de flexiones a partir de la ejecución de referencia:
// se acepta el inicio observado con el codo parcialmente extendido, se activa
// al pasar de 120° y se considera fondo dentro de 70–105°.
export const PUSHUP_REP_START_MIN_ANGLE = 110;
export const PUSHUP_REP_START_MAX_ANGLE = 180;
export const PUSHUP_REP_ACTIVATION_ANGLE = 120;
export const PUSHUP_REP_END_MIN_ANGLE = 70;
export const PUSHUP_REP_END_MAX_ANGLE = 105;
// Extremo ampliado solo para flexiones estándar analizadas desde video subido.
export const UPLOADED_PUSHUP_VIDEO_REP_END_MAX_ANGLE = 118;
export const PUSHUP_SMOOTHING_SAMPLES = 3;
export const ROW_TORSO_MIN_ANGLE = 30;
export const ROW_TORSO_MAX_ANGLE = 45;
export const ROW_KNEE_MIN_ANGLE = 150;
export const ROW_KNEE_MAX_ANGLE = 180;
export const ROW_ELBOW_TORSO_MIN_ANGLE = 15;
export const ROW_ELBOW_TORSO_MAX_ANGLE = 30;
export const AUSTRALIAN_ROW_BODY_LINE_MIN_ANGLE = 160;
export const AUSTRALIAN_ROW_BODY_LINE_MAX_ANGLE = 180;
export const AUSTRALIAN_ROW_ELBOW_TORSO_MIN_ANGLE = 25;
export const AUSTRALIAN_ROW_ELBOW_TORSO_MAX_ANGLE = 115;
export const AUSTRALIAN_ROW_TORSO_MIN_LEAN = 65;
export const AUSTRALIAN_ROW_TORSO_MAX_LEAN = 110;
export const AUSTRALIAN_ROW_END_MIN_ANGLE = 70;
export const AUSTRALIAN_ROW_END_MAX_ANGLE = 115;
export const LUNGE_KNEE_MIN_ANGLE = 80;
export const LUNGE_KNEE_MAX_ANGLE = 100;
export const LUNGE_HIP_MIN_ANGLE = 80;
export const LUNGE_HIP_MAX_ANGLE = 100;
export const LUNGE_TORSO_MIN_ANGLE = 75;
export const LUNGE_TORSO_MAX_ANGLE = 80;
export const LUNGE_KNEE_ANKLE_MAX_OFFSET = 0.35;
export const BENCH_LUNGE_KNEE_MIN_ANGLE = 80;
export const BENCH_LUNGE_KNEE_MAX_ANGLE = 100;
export const BENCH_LUNGE_TORSO_MIN_LEAN = 15;
export const BENCH_LUNGE_TORSO_MAX_LEAN = 20;
export const HIP_THRUST_BOTTOM_MIN_ANGLE = 70;
export const HIP_THRUST_BOTTOM_MAX_ANGLE = 115;
export const HIP_THRUST_ACTIVATION_ANGLE = 125;
export const HIP_THRUST_TOP_MIN_ANGLE = 150;
export const HIP_THRUST_TOP_MAX_ANGLE = 180;
export const STIFF_LEG_DEADLIFT_START_MIN_ANGLE = 150;
export const STIFF_LEG_DEADLIFT_START_MAX_ANGLE = 180;
export const STIFF_LEG_DEADLIFT_ACTIVATION_ANGLE = 145;
export const STIFF_LEG_DEADLIFT_END_MIN_ANGLE = 64;
export const STIFF_LEG_DEADLIFT_END_MAX_ANGLE = 113;
export const HAMSTRING_CURL_START_MIN_ANGLE = 120;
export const HAMSTRING_CURL_START_MAX_ANGLE = 180;
export const HAMSTRING_CURL_ACTIVATION_ANGLE = 110;
export const HAMSTRING_CURL_END_MIN_ANGLE = 30;
export const HAMSTRING_CURL_END_MAX_ANGLE = 90;
export const WRIST_CURL_START_MIN_ANGLE = 135;
export const WRIST_CURL_START_MAX_ANGLE = 180;
export const WRIST_CURL_ACTIVATION_ANGLE = 125;
export const WRIST_CURL_END_MIN_ANGLE = 70;
export const WRIST_CURL_END_MAX_ANGLE = 115;
export const PALLOF_START_MIN_ANGLE = 75;
export const PALLOF_START_MAX_ANGLE = 125;
export const PALLOF_ACTIVATION_ANGLE = 135;
export const PALLOF_END_MIN_ANGLE = 150;
export const PALLOF_END_MAX_ANGLE = 180;
export const PALLOF_WRIST_MIN_ANGLE = 135;
export const OVERHEAD_TRICEPS_SHOULDER_MIN_ANGLE = 145;
export const OVERHEAD_TRICEPS_SHOULDER_MAX_ANGLE = 180;
export const OVERHEAD_TRICEPS_WRIST_MIN_ANGLE = 135;
export const HANGING_LEG_RAISE_START_MIN_ANGLE = 145;
export const HANGING_LEG_RAISE_START_MAX_ANGLE = 180;
export const HANGING_LEG_RAISE_ACTIVATION_ANGLE = 125;
export const HANGING_LEG_RAISE_END_MIN_ANGLE = 70;
export const HANGING_LEG_RAISE_END_MAX_ANGLE = 110;
export const FLOOR_LEG_RAISE_START_MIN_ANGLE = 145;
export const FLOOR_LEG_RAISE_START_MAX_ANGLE = 180;
export const FLOOR_LEG_RAISE_ACTIVATION_ANGLE = 125;
export const FLOOR_LEG_RAISE_END_MIN_ANGLE = 70;
export const FLOOR_LEG_RAISE_END_MAX_ANGLE = 110;
export const FACE_POINT_MIN_SCORE = 0.22;
export const CAMERA_POINT_MIN_SCORE = 0.38;
// Umbral de confianza para usar talón y punta en lecturas derivadas.
export const FOOT_POINT_MIN_SCORE = CAMERA_POINT_MIN_SCORE;
// Elevación normalizada talón-punta usada como histéresis de la elevación de talones.
export const HEEL_RAISE_UP_RATIO = 0.25;
export const HEEL_RAISE_DOWN_RATIO = 0.10;
// Solo se advierte por talón levantado durante un descenso si supera este ratio.
export const HEEL_LIFT_WARN_RATIO = 0.20;
export const SIDE_VIEW_MIN_CONFIDENCE_GAP = 0.16;
export const SIDE_VIEW_MIN_VISIBLE_POINTS = 4;
export const SIDE_VIEW_STABLE_FRAMES = 6;
export const ROW_ARM_POINT_MIN_SCORE = 0.24;
export const POSE_LOCK_MAX_CENTER_DISTANCE = 0.36;
export const POSE_LOCK_MIN_AREA_RATIO = 0.1;
export const MAX_FRONT_VIEW_RATIO = 0.95;
// Color de los landmarks retenidos para diferenciarlos de las mediciones frescas.
export const HELD_POINT_COLOR = '#ffd166';
// Opacidad de los landmarks retenidos y de las líneas que dependen de ellos.
export const HELD_POINT_ALPHA = 0.5;
// Solo advertimos si una articulación está prácticamente cortada por el borde.
// La cámara puede estar baja, inclinada o rotada; no exigimos una posición nivelada.
export const CAMERA_FRAME_MARGIN = 0.02;
// En declinadas se tolera el margen completo vigente por articulación,
// pero nunca una coordenada fuera de la imagen.
export const DECLINED_PUSHUP_FRAME_MARGIN_TOLERANCE: Record<
  'hombro' | 'codo' | 'muñeca' | 'cadera' | 'rodilla',
  number
> = {
  hombro: CAMERA_FRAME_MARGIN,
  codo: CAMERA_FRAME_MARGIN,
  muñeca: CAMERA_FRAME_MARGIN,
  cadera: CAMERA_FRAME_MARGIN,
  rodilla: CAMERA_FRAME_MARGIN,
};
