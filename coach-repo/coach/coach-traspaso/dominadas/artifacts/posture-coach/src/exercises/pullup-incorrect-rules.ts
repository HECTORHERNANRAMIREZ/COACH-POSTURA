import { PULLUP_MIN_SHOULDER_RISE_RATIO } from '@/constants/pullup';
import type {
  PullupElevationDecisionLabel,
  PullupHeadWindowVerdict,
  PullupIncorrectRuleRecord,
} from '@/types/pullup';

export const PULLUP_INCORRECT_MIN_RISE_RATIO = 0.05;
// Provisional: 0.15 has not been established from console measurements.
export const PULLUP_INCORRECT_MAX_RISE_RATIO = 0.15;
export const PULLUP_INCORRECT_MAX_RISE_RATIO_IS_PROVISIONAL = true;
export const PULLUP_INCORRECT_MARGIN_AGAINST_CORRECT = 0.03;

export function isPullupIncorrectRulesConfigurationSafe() {
  return PULLUP_INCORRECT_MAX_RISE_RATIO
    < PULLUP_MIN_SHOULDER_RISE_RATIO - PULLUP_INCORRECT_MARGIN_AGAINST_CORRECT;
}

export function getPullupIncorrectRulesConfiguration() {
  return {
    incorrectMinRiseRatio: PULLUP_INCORRECT_MIN_RISE_RATIO,
    incorrectMaxRiseRatio: PULLUP_INCORRECT_MAX_RISE_RATIO,
    incorrectMaxRiseRatioIsProvisional: PULLUP_INCORRECT_MAX_RISE_RATIO_IS_PROVISIONAL,
    correctMinShoulderRiseRatio: PULLUP_MIN_SHOULDER_RISE_RATIO,
    marginAgainstCorrect: PULLUP_INCORRECT_MARGIN_AGAINST_CORRECT,
    active: isPullupIncorrectRulesConfigurationSafe(),
  };
}

export function evaluatePullupIncorrectRule(options: {
  estimatedView: string;
  decision: PullupElevationDecisionLabel;
  shoulderRiseRatio: number | null;
  headVerdict: PullupHeadWindowVerdict | null;
  countDiscardedForDiagnostics: boolean;
}): PullupIncorrectRuleRecord | null {
  if (
    options.estimatedView !== 'back'
    || !isPullupIncorrectRulesConfigurationSafe()
  ) {
    return null;
  }

  if (
    options.decision === 'descartada-sin-transicion-arriba'
    && options.headVerdict?.reason === 'no-top-cabeza'
  ) {
    return {
      rule: 'R1',
      reason: 'no-top-cabeza',
      topeUsado: null,
      topeProvisional: false,
      margenContraCorrectas: PULLUP_INCORRECT_MARGIN_AGAINST_CORRECT,
    };
  }

  const ratio = options.shoulderRiseRatio;
  if (
    options.decision === 'media-repeticion'
    && ratio !== null
    && ratio >= PULLUP_INCORRECT_MIN_RISE_RATIO
    && ratio <= PULLUP_INCORRECT_MAX_RISE_RATIO
  ) {
    return {
      rule: 'R2',
      reason: 'media-repeticion',
      topeUsado: PULLUP_INCORRECT_MAX_RISE_RATIO,
      topeProvisional: PULLUP_INCORRECT_MAX_RISE_RATIO_IS_PROVISIONAL,
      margenContraCorrectas: PULLUP_INCORRECT_MARGIN_AGAINST_CORRECT,
    };
  }

  if (
    options.decision === 'descartada-sin-elevacion'
    && ratio !== null
    && ratio < PULLUP_INCORRECT_MIN_RISE_RATIO
    && options.countDiscardedForDiagnostics
  ) {
    return {
      rule: 'R3',
      reason: 'descartada-diagnostico',
      topeUsado: PULLUP_INCORRECT_MIN_RISE_RATIO,
      topeProvisional: false,
      margenContraCorrectas: PULLUP_INCORRECT_MARGIN_AGAINST_CORRECT,
    };
  }

  return null;
}
