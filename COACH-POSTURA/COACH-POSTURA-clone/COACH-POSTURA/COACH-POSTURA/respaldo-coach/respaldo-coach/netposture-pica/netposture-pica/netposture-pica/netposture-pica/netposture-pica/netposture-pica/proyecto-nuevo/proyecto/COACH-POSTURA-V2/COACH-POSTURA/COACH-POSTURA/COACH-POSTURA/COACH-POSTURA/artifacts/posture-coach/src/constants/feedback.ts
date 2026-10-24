import type { TechniqueFeedback } from '@/types/tracking';

export const defaultTechniqueFeedback: TechniqueFeedback = {
  tone: 'checking',
  message: 'Colócate de lado',
  detail: 'Necesitamos ver tu hombro, codo, muñeca, cadera y tobillo.',
};

export const defaultSquatFeedback: TechniqueFeedback = {
  tone: 'checking',
  message: 'Ángulo normalizado',
  detail: 'El ángulo se calcula con coordenadas 3D; la inclinación, escala y altura de la cámara no cambian la medición.',
};

export const lowConfidenceFeedback: TechniqueFeedback = {
  tone: 'checking',
  message: 'Comprobando puntos visibles',
  detail: 'Una articulación se está manteniendo temporalmente con su última posición fiable. No contaré ni evaluaré una fase hasta verla de nuevo.',
};

export const muscleUpReferenceFeedback: TechniqueFeedback = {
  tone: 'checking',
  message: 'Lecturas de referencia activas',
  detail: 'Observa codos, rodillas y tobillos. Definiremos los rangos después de revisar tu ejecución correcta.',
};

export const commandoPullupReferenceFeedback: TechniqueFeedback = {
  tone: 'checking',
  message: 'Evaluación por un solo lado',
  detail: 'Se mide un lado estable: extensión del codo abajo, cabeza sobre la muñeca o flexión del codo arriba, y regreso al fondo.',
};
