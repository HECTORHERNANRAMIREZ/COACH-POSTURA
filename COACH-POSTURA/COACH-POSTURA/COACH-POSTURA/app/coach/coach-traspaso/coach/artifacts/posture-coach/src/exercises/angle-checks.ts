import { PULLUP_TOLERANCE_DEG } from '@/constants/pullup';

export function isWithinAngle(angle: number, min: number, max: number) {
  return angle >= min && angle <= max;
}

export function isWithinPullupAngle(
  angle: number,
  min: number,
  max: number,
  tolerance = PULLUP_TOLERANCE_DEG,
) {
  return isWithinAngle(
    angle,
    Math.max(0, min - tolerance),
    Math.min(180, max + tolerance),
  );
}
