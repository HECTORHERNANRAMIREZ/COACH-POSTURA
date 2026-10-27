import type { PosePoint } from '@/pose3d';
import { MAX_HELD_FRAMES } from '@/pose-filters';

export function getMeasurementCoordinates(point: PosePoint): { x: number; y: number; z: number } {
  return point.world ?? { x: point.x, y: point.y, z: point.z ?? 0 };
}

export function hasWorldCoordinates(point: PosePoint | undefined): point is PosePoint & {
  world: { x: number; y: number; z: number };
} {
  return Boolean(
    point?.world
    && Number.isFinite(point.world.x)
    && Number.isFinite(point.world.y)
    && Number.isFinite(point.world.z),
  );
}

export function getAngleMeasurementCoordinates(
  point: PosePoint | undefined,
): { x: number; y: number; z: number } | null {
  return hasWorldCoordinates(point) ? point.world : null;
}

export function distanceBetweenPoints(first: PosePoint | undefined, second: PosePoint | undefined) {
  if (!first || !second) return null;
  const firstCoordinates = getMeasurementCoordinates(first);
  const secondCoordinates = getMeasurementCoordinates(second);
  return Math.hypot(
    firstCoordinates.x - secondCoordinates.x,
    firstCoordinates.y - secondCoordinates.y,
    firstCoordinates.z - secondCoordinates.z,
  );
}

export function calculateAngle(
  first: PosePoint | undefined,
  vertex: PosePoint | undefined,
  last: PosePoint | undefined,
) {
  if (!first || !vertex || !last) return null;
  if ((first.score ?? 0) < 0.2 || (vertex.score ?? 0) < 0.2 || (last.score ?? 0) < 0.2) return null;

  const firstCoordinates = getAngleMeasurementCoordinates(first);
  const vertexCoordinates = getAngleMeasurementCoordinates(vertex);
  const lastCoordinates = getAngleMeasurementCoordinates(last);
  if (!firstCoordinates || !vertexCoordinates || !lastCoordinates) return null;
  const firstVector = {
    x: firstCoordinates.x - vertexCoordinates.x,
    y: firstCoordinates.y - vertexCoordinates.y,
    z: firstCoordinates.z - vertexCoordinates.z,
  };
  const lastVector = {
    x: lastCoordinates.x - vertexCoordinates.x,
    y: lastCoordinates.y - vertexCoordinates.y,
    z: lastCoordinates.z - vertexCoordinates.z,
  };
  const firstLength = Math.hypot(firstVector.x, firstVector.y, firstVector.z);
  const lastLength = Math.hypot(lastVector.x, lastVector.y, lastVector.z);
  if (!firstLength || !lastLength) return null;

  const cosine = Math.max(
    -1,
    Math.min(
      1,
      (
        firstVector.x * lastVector.x
        + firstVector.y * lastVector.y
        + firstVector.z * lastVector.z
      ) / (firstLength * lastLength),
    ),
  );
  return Math.round(Math.acos(cosine) * (180 / Math.PI));
}

export function isHeldPoint(point: PosePoint | undefined) {
  return Boolean(
    point?.held
    && (point.heldFrames ?? MAX_HELD_FRAMES + 1) > 0
    && (point.heldFrames ?? MAX_HELD_FRAMES + 1) <= MAX_HELD_FRAMES,
  );
}
