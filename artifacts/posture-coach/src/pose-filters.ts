import {
  POSE_LANDMARK_COUNT,
  type Pose,
  type PosePoint,
  type WorldCoordinate,
} from './pose3d';

// Convierte los timestamps de MediaPipe/performance.now() de milisegundos a segundos.
const MILLISECONDS_PER_SECOND = 1000;
// Score mínimo para aceptar una medición nueva de muñecas, tobillos, talones y pies.
export const MIN_SCORE_LIMB = 0.5;
// Score mínimo para aceptar una medición nueva del resto del cuerpo.
export const MIN_SCORE_BODY = 0.4;
// Número máximo de frames durante los que se reutiliza la última posición válida.
export const MAX_HELD_FRAMES = 8;
// Reinicia todos los filtros después de esta cantidad de frames sin una pose completa.
const POSE_MISSING_RESET_FRAMES = 10;
// Son las muñecas, tobillos, talones y puntas de los pies, que suelen introducir más ruido.
const LIMB_LANDMARKS = new Set([15, 16, 27, 28, 29, 30, 31, 32]);

export type OneEuroParameters = {
  // Frecuencia mínima de corte: más baja significa más suavizado en reposo.
  minCutoff: number;
  // Respuesta al movimiento: valores altos reducen el retraso cuando el punto se mueve rápido.
  beta: number;
  // Frecuencia de corte del filtro de velocidad.
  dCutoff: number;
};

export const LIMB_FILTER: OneEuroParameters = Object.freeze({
  minCutoff: 0.8,
  beta: 0.02,
  dCutoff: 1.0,
});

export const BODY_FILTER: OneEuroParameters = Object.freeze({
  minCutoff: 1.5,
  beta: 0.05,
  dCutoff: 1.0,
});

type AxisFilterSet = {
  x: OneEuroAxisFilter;
  y: OneEuroAxisFilter;
  z: OneEuroAxisFilter;
};

type LandmarkFilterState = {
  screen: AxisFilterSet;
  world: AxisFilterSet;
  lastPoint?: PosePoint;
  lastWorld?: WorldCoordinate;
  heldFrames: number;
};

function smoothingAlpha(cutoff: number, dtSeconds: number) {
  const safeCutoff = Math.max(Number.MIN_VALUE, cutoff);
  const tau = 1 / (2 * Math.PI * safeCutoff);
  return 1 / (1 + tau / dtSeconds);
}

class LowPassFilter {
  private value: number | null = null;

  getValue() {
    return this.value;
  }

  filter(nextValue: number, alpha: number) {
    this.value = this.value === null
      ? nextValue
      : alpha * nextValue + (1 - alpha) * this.value;
    return this.value;
  }

  reset() {
    this.value = null;
  }
}

class OneEuroAxisFilter {
  private readonly derivativeFilter = new LowPassFilter();
  private readonly valueFilter = new LowPassFilter();
  private previousRawValue: number | null = null;
  private previousTimestamp: number | null = null;

  constructor(private readonly parameters: OneEuroParameters) {}

  filter(value: number, timestamp: number) {
    if (!Number.isFinite(value)) {
      return this.valueFilter.getValue() ?? value;
    }

    if (this.previousRawValue === null || this.previousTimestamp === null) {
      this.previousRawValue = value;
      this.previousTimestamp = timestamp;
      return this.valueFilter.filter(value, 1);
    }

    const dtSeconds = (timestamp - this.previousTimestamp) / MILLISECONDS_PER_SECOND;
    const previousRawValue = this.previousRawValue;
    this.previousRawValue = value;
    this.previousTimestamp = timestamp;

    // No se actualiza el filtro con un dt inválido: así se evitan NaN e inestabilidad
    // si dos frames comparten timestamp o el reloj retrocede.
    if (!(dtSeconds > 0) || !Number.isFinite(dtSeconds)) {
      return this.valueFilter.getValue() ?? value;
    }

    const rawDerivative = (value - previousRawValue) / dtSeconds;
    const derivativeAlpha = smoothingAlpha(this.parameters.dCutoff, dtSeconds);
    const smoothedDerivative = this.derivativeFilter.filter(rawDerivative, derivativeAlpha);
    const cutoff = this.parameters.minCutoff
      + this.parameters.beta * Math.abs(smoothedDerivative);

    return this.valueFilter.filter(value, smoothingAlpha(cutoff, dtSeconds));
  }

  reset() {
    this.derivativeFilter.reset();
    this.valueFilter.reset();
    this.previousRawValue = null;
    this.previousTimestamp = null;
  }
}

function createAxisFilterSet(parameters: OneEuroParameters): AxisFilterSet {
  return {
    x: new OneEuroAxisFilter(parameters),
    y: new OneEuroAxisFilter(parameters),
    z: new OneEuroAxisFilter(parameters),
  };
}

function filterCoordinate(
  filter: OneEuroAxisFilter,
  value: number | undefined,
  timestamp: number,
  previousValue: number | undefined,
) {
  if (value === undefined || !Number.isFinite(value)) return previousValue;
  return filter.filter(value, timestamp);
}

function asWorldCoordinate(point: PosePoint | undefined): WorldCoordinate | undefined {
  if (!point || point.z === undefined) return undefined;
  return { x: point.x, y: point.y, z: point.z };
}

function filterScreenPoint(
  filters: AxisFilterSet,
  point: PosePoint,
  timestamp: number,
  previousPoint?: PosePoint,
): PosePoint {
  return {
    ...point,
    x: filters.x.filter(point.x, timestamp),
    y: filters.y.filter(point.y, timestamp),
    z: filterCoordinate(filters.z, point.z, timestamp, previousPoint?.z),
  };
}

function filterWorldPoint(
  filters: AxisFilterSet,
  point: WorldCoordinate,
  timestamp: number,
  previousPoint?: WorldCoordinate,
): WorldCoordinate {
  return {
    x: filters.x.filter(point.x, timestamp),
    y: filters.y.filter(point.y, timestamp),
    z: filters.z.filter(point.z, timestamp),
  };
}

export class PoseOneEuroFilter {
  private readonly states: LandmarkFilterState[] = Array.from(
    { length: POSE_LANDMARK_COUNT },
    (_, index) => {
      const parameters = LIMB_LANDMARKS.has(index) ? LIMB_FILTER : BODY_FILTER;
      return {
        screen: createAxisFilterSet(parameters),
        world: createAxisFilterSet(parameters),
        heldFrames: 0,
      };
    },
  );

  private missingPoseFrames = 0;

  filter(pose: Pose, timestamp: number): Pose {
    this.missingPoseFrames = 0;

    const keypoints: PosePoint[] = [];
    const worldLandmarks: PosePoint[] = [];

    for (let index = 0; index < POSE_LANDMARK_COUNT; index += 1) {
      const state = this.states[index];
      const point = pose.keypoints[index];
      const worldLandmark = pose.worldLandmarks[index];
      const worldPoint = worldLandmark?.world
        ?? asWorldCoordinate(worldLandmark)
        ?? point?.world;

      const minimumScore = LIMB_LANDMARKS.has(index)
        ? MIN_SCORE_LIMB
        : MIN_SCORE_BODY;
      const isReliable = Boolean(
        point
        && !point.held
        && (point.score ?? 0) >= minimumScore,
      );

      if (isReliable && point) {
        const filteredWorld = worldPoint
          ? filterWorldPoint(state.world, worldPoint, timestamp, state.lastWorld)
          : state.lastWorld;
        const filteredPoint = filterScreenPoint(
          state.screen,
          point,
          timestamp,
          state.lastPoint,
        );
        const nextPoint = filteredWorld
          ? { ...filteredPoint, world: filteredWorld }
          : filteredPoint;

        state.lastPoint = {
          ...nextPoint,
          held: false,
          heldFrames: 0,
          heldReason: undefined,
        };
        state.lastWorld = filteredWorld;
        state.heldFrames = 0;
        keypoints[index] = state.lastPoint;
        worldLandmarks[index] = worldPoint
          ? {
              ...pose.worldLandmarks[index],
              ...filteredWorld,
              held: false,
              heldFrames: 0,
              heldReason: undefined,
              world: filteredWorld,
            }
          : state.lastPoint;
        continue;
      }

      if (state.lastPoint && state.heldFrames < MAX_HELD_FRAMES) {
        state.heldFrames += 1;
        const stalePoint = {
          ...state.lastPoint,
          held: true,
          heldFrames: state.heldFrames,
          heldReason: point?.heldReason ?? 'low-score',
        };
        state.lastPoint = stalePoint;
        keypoints[index] = stalePoint;
        if (state.lastWorld) {
          worldLandmarks[index] = {
            ...state.lastWorld,
            score: stalePoint.score,
            held: true,
            heldFrames: state.heldFrames,
            heldReason: point?.heldReason ?? 'low-score',
            world: state.lastWorld,
          };
        }
      }
    }

    return {
      ...pose,
      keypoints,
      worldLandmarks,
    };
  }

  markPoseMissing() {
    this.missingPoseFrames += 1;
    if (this.missingPoseFrames > POSE_MISSING_RESET_FRAMES) {
      this.reset();
    }
  }

  reset() {
    this.states.forEach((state) => {
      state.screen.x.reset();
      state.screen.y.reset();
      state.screen.z.reset();
      state.world.x.reset();
      state.world.y.reset();
      state.world.z.reset();
      state.lastPoint = undefined;
      state.lastWorld = undefined;
      state.heldFrames = 0;
    });
    this.missingPoseFrames = 0;
  }
}

export function createPoseFilter() {
  return new PoseOneEuroFilter();
}