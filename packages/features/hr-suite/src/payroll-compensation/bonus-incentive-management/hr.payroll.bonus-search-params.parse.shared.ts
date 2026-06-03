export const hrBonusPlansSearchParam = "bonusPlansSearch";
export const hrBonusEligibilityRulesSearchParam = "bonusEligibilitySearch";
export const hrBonusParticipantsSearchParam = "bonusParticipantsSearch";
export const hrBonusCyclesSearchParam = "bonusCyclesSearch";
export const hrBonusTargetsSearchParam = "bonusTargetsSearch";
export const hrBonusGuaranteedRulesSearchParam = "bonusGuaranteedSearch";
export const hrBonusMultipliersSearchParam = "bonusMultipliersSearch";
export const hrBonusProrationsSearchParam = "bonusProrationsSearch";
export const hrBonusManualAdjustmentsSearchParam = "bonusAdjustmentsSearch";
export const hrBonusDiscretionarySearchParam = "bonusDiscretionarySearch";
export const hrBonusRecoveriesSearchParam = "bonusRecoveriesSearch";

export const hrBonusPlansSurfaceKey = "hr.payroll.bonus.plans.list";
export const hrBonusEligibilityRulesSurfaceKey =
  "hr.payroll.bonus.eligibility-rules.list";
export const hrBonusParticipantsSurfaceKey =
  "hr.payroll.bonus.participants.list";
export const hrBonusCyclesSurfaceKey = "hr.payroll.bonus.cycles.list";
export const hrBonusTargetsSurfaceKey = "hr.payroll.bonus.targets.list";
export const hrBonusGuaranteedRulesSurfaceKey =
  "hr.payroll.bonus.guaranteed-rules.list";
export const hrBonusMultipliersSurfaceKey = "hr.payroll.bonus.multipliers.list";
export const hrBonusProrationsSurfaceKey = "hr.payroll.bonus.prorations.list";
export const hrBonusManualAdjustmentsSurfaceKey =
  "hr.payroll.bonus.manual-adjustments.list";
export const hrBonusDiscretionarySurfaceKey =
  "hr.payroll.bonus.discretionary.list";
export const hrBonusRecoveriesSurfaceKey = "hr.payroll.bonus.recoveries.list";

export const HR_BONUS_LIST_SURFACE_KEYS = [
  hrBonusPlansSurfaceKey,
  hrBonusEligibilityRulesSurfaceKey,
  hrBonusParticipantsSurfaceKey,
  hrBonusCyclesSurfaceKey,
  hrBonusTargetsSurfaceKey,
  hrBonusGuaranteedRulesSurfaceKey,
  hrBonusMultipliersSurfaceKey,
  hrBonusProrationsSurfaceKey,
  hrBonusManualAdjustmentsSurfaceKey,
  hrBonusDiscretionarySurfaceKey,
  hrBonusRecoveriesSurfaceKey,
] as const;

export type HrBonusListSurfaceKey = (typeof HR_BONUS_LIST_SURFACE_KEYS)[number];

export const HR_BONUS_LIST_SEARCH_PARAMS_BY_KEY: Record<
  HrBonusListSurfaceKey,
  string
> = {
  [hrBonusPlansSurfaceKey]: hrBonusPlansSearchParam,
  [hrBonusEligibilityRulesSurfaceKey]: hrBonusEligibilityRulesSearchParam,
  [hrBonusParticipantsSurfaceKey]: hrBonusParticipantsSearchParam,
  [hrBonusCyclesSurfaceKey]: hrBonusCyclesSearchParam,
  [hrBonusTargetsSurfaceKey]: hrBonusTargetsSearchParam,
  [hrBonusGuaranteedRulesSurfaceKey]: hrBonusGuaranteedRulesSearchParam,
  [hrBonusMultipliersSurfaceKey]: hrBonusMultipliersSearchParam,
  [hrBonusProrationsSurfaceKey]: hrBonusProrationsSearchParam,
  [hrBonusManualAdjustmentsSurfaceKey]: hrBonusManualAdjustmentsSearchParam,
  [hrBonusDiscretionarySurfaceKey]: hrBonusDiscretionarySearchParam,
  [hrBonusRecoveriesSurfaceKey]: hrBonusRecoveriesSearchParam,
};

export type HrBonusSearchParams = {
  plansSearch?: string;
  eligibilityRulesSearch?: string;
  participantsSearch?: string;
  cyclesSearch?: string;
  targetsSearch?: string;
  guaranteedRulesSearch?: string;
  multipliersSearch?: string;
  prorationsSearch?: string;
  manualAdjustmentsSearch?: string;
  discretionarySearch?: string;
  recoveriesSearch?: string;
};

export const HR_BONUS_LIST_SEARCH_PARAM_MODEL_FIELDS: Record<
  string,
  keyof HrBonusSearchParams
> = {
  [hrBonusPlansSearchParam]: "plansSearch",
  [hrBonusEligibilityRulesSearchParam]: "eligibilityRulesSearch",
  [hrBonusParticipantsSearchParam]: "participantsSearch",
  [hrBonusCyclesSearchParam]: "cyclesSearch",
  [hrBonusTargetsSearchParam]: "targetsSearch",
  [hrBonusGuaranteedRulesSearchParam]: "guaranteedRulesSearch",
  [hrBonusMultipliersSearchParam]: "multipliersSearch",
  [hrBonusProrationsSearchParam]: "prorationsSearch",
  [hrBonusManualAdjustmentsSearchParam]: "manualAdjustmentsSearch",
  [hrBonusDiscretionarySearchParam]: "discretionarySearch",
  [hrBonusRecoveriesSearchParam]: "recoveriesSearch",
};

export function getHrBonusListSurfaceKeys(): readonly HrBonusListSurfaceKey[] {
  return HR_BONUS_LIST_SURFACE_KEYS;
}

function readSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = searchParams[key];
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  if (Array.isArray(value)) {
    const first = value.find((entry) => entry.trim().length > 0);
    return first?.trim();
  }
  return undefined;
}

export function parseHrBonusSearchParams(
  searchParams: Record<string, string | string[] | undefined> | undefined,
): HrBonusSearchParams {
  if (!searchParams) {
    return {};
  }

  const parsed: HrBonusSearchParams = {};
  for (const [paramKey, modelField] of Object.entries(
    HR_BONUS_LIST_SEARCH_PARAM_MODEL_FIELDS,
  )) {
    parsed[modelField] = readSearchParam(searchParams, paramKey);
  }
  return parsed;
}

export function toHrBonusPageModelInput(input: {
  organizationId: string;
  canWrite: boolean;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const parsed = parseHrBonusSearchParams(input.searchParams);
  return {
    organizationId: input.organizationId,
    canWrite: input.canWrite,
    plansSearch: parsed.plansSearch,
    eligibilityRulesSearch: parsed.eligibilityRulesSearch,
    participantsSearch: parsed.participantsSearch,
    cyclesSearch: parsed.cyclesSearch,
    targetsSearch: parsed.targetsSearch,
    guaranteedRulesSearch: parsed.guaranteedRulesSearch,
    multipliersSearch: parsed.multipliersSearch,
    prorationsSearch: parsed.prorationsSearch,
    manualAdjustmentsSearch: parsed.manualAdjustmentsSearch,
    discretionarySearch: parsed.discretionarySearch,
    recoveriesSearch: parsed.recoveriesSearch,
  };
}
