import type { ExerciseId } from '@/types/tracking';

export const isStandardOrSupinePullup = (
  exercise: ExerciseId | null | undefined,
): exercise is 'dominadas' | 'dominadas-supinas' => (
  exercise === 'dominadas' || exercise === 'dominadas-supinas'
);

export const isCommandPullup = (
  exercise: ExerciseId | null | undefined,
): exercise is 'dominadas-comando' => exercise === 'dominadas-comando';
