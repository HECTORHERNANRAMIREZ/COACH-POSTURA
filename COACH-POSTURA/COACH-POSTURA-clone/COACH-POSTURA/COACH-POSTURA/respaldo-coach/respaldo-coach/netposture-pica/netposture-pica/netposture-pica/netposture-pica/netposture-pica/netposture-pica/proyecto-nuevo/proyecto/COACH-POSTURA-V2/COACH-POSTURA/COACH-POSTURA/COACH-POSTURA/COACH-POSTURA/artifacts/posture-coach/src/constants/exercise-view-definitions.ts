import type { ExerciseView } from '@/view-estimation';
import { VIEW_SEMIPROFILE_TOLERANCE_DEG } from '@/view-estimation';
import type { ExerciseId } from '@/types/tracking';

export const exerciseViewDefinitions: Record<ExerciseId, {
  recommendedView: ExerciseView;
  viewToleranceDeg?: number;
  uprightTorso?: boolean;
}> = {
  fondos: { recommendedView: 'side' },
  dominadas: { recommendedView: 'back' },
  'dominadas-supinas': { recommendedView: 'back' },
  'dominadas-comando': { recommendedView: 'any' },
  'muscle-up': {
    recommendedView: 'side',
    viewToleranceDeg: VIEW_SEMIPROFILE_TOLERANCE_DEG,
  },
  jalon: { recommendedView: 'side', uprightTorso: true },
  'pull-over-polea-alta': { recommendedView: 'side' },
  'remo-barra': { recommendedView: 'side' },
  'remos-australianos-elevados': { recommendedView: 'side' },
  'remo-sentado-polea-agarre-cerrado': { recommendedView: 'side' },
  'remo-mancuerna-una-mano': { recommendedView: 'side' },
  'peso-muerto-rumano': { recommendedView: 'side' },
  'peso-muerto-piernas-rigidas': { recommendedView: 'side' },
  flexiones: { recommendedView: 'side' },
  'flexiones-declinadas': { recommendedView: 'side' },
  'flexiones-pica': { recommendedView: 'side' },
  'press-militar': { recommendedView: 'front', uprightTorso: true },
  'press-hombros-maquina': { recommendedView: 'front', uprightTorso: true },
  'elevaciones-laterales': { recommendedView: 'front', uprightTorso: true },
  'elevaciones-laterales-polea-baja': { recommendedView: 'front', uprightTorso: true },
  'pajaros-mancuernas': { recommendedView: 'front' },
  'face-pulls-polea-alta': { recommendedView: 'front', uprightTorso: true },
  'aperturas-inversas-maquina': { recommendedView: 'front' },
  'cruces-polea-baja-alta': { recommendedView: 'front', uprightTorso: true },
  'press-banca': { recommendedView: 'side' },
  'press-banca-agarre-cerrado': { recommendedView: 'side' },
  'press-banca-inclinado': { recommendedView: 'side' },
  'press-plano-mancuernas': { recommendedView: 'side' },
  'press-plano-inclinado': { recommendedView: 'side' },
  'triceps-polea-alta': { recommendedView: 'side', uprightTorso: true },
  'triceps-tras-nuca-polea-alta': { recommendedView: 'side' },
  'copa-mancuernas': { recommendedView: 'side' },
  'extension-horizontal-barra': { recommendedView: 'side' },
  'curl-biceps': { recommendedView: 'side', uprightTorso: true },
  'curl-inclinado-mancuernas': { recommendedView: 'side' },
  'curl-predicador': { recommendedView: 'front' },
  'curl-arana': { recommendedView: 'front' },
  'curl-martillo': { recommendedView: 'front', uprightTorso: true },
  'curl-inverso-barra': { recommendedView: 'front', uprightTorso: true },
  'curl-muneca-sentado': { recommendedView: 'side' },
  'rodillo-muneca': { recommendedView: 'side', uprightTorso: true },
  sentadillas: { recommendedView: 'side' },
  'prensa-piernas': { recommendedView: 'side' },
  'extensiones-maquina': { recommendedView: 'side' },
  'curl-femoral': { recommendedView: 'side' },
  'elevacion-talones-pie': { recommendedView: 'side', uprightTorso: true },
  'maquina-aductores': { recommendedView: 'front', uprightTorso: true },
  'hip-thrust-barra': { recommendedView: 'side' },
  zancadas: { recommendedView: 'side' },
  'zancada-banco': { recommendedView: 'side' },
  plancha: { recommendedView: 'side' },
  'crunch-invertido': { recommendedView: 'side' },
  'rueda-abdominal': { recommendedView: 'side' },
  'elevaciones-piernas-barra': {
    recommendedView: 'side',
    viewToleranceDeg: VIEW_SEMIPROFILE_TOLERANCE_DEG,
  },
  'barra-reloj': {
    recommendedView: 'side',
    viewToleranceDeg: VIEW_SEMIPROFILE_TOLERANCE_DEG,
  },
  'elevaciones-piernas-suelo': { recommendedView: 'side' },
  'press-pallof-polea-banda': { recommendedView: 'front', uprightTorso: true },
  // La nota de cámara dice lateral, pero las instrucciones de detección
  // permiten frontal/3/4; se deja sin restricción hasta validar la vista real.
  'giros-rusos': { recommendedView: 'any' },
};
