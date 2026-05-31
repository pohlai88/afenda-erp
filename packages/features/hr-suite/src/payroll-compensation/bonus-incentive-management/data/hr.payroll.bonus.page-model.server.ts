import {
  listHrBonusCyclesWindow,
  listHrBonusDiscretionaryRecommendationsWindow,
  listHrBonusEligibilityRulesWindow,
  listHrBonusGuaranteedRulesWindow,
  listHrBonusManualAdjustmentsWindow,
  listHrBonusPerformanceMultipliersWindow,
  listHrBonusPlanParticipantsWindow,
  listHrBonusPlansWindow,
  listHrBonusProrationsWindow,
  listHrBonusRecoveriesWindow,
  listHrBonusTargetsWindow,
} from "@afenda/db";

import {
  buildHrBonusCyclesListSurface,
  buildHrBonusEligibilityRulesListSurface,
  buildHrBonusParticipantsListSurface,
  buildHrBonusPlansListSurface,
  buildHrBonusTargetsListSurface,
} from "../surface/hr.payroll.bonus-foundation-lists.surface";
import {
  buildHrBonusDiscretionaryListSurface,
  buildHrBonusGuaranteedRulesListSurface,
  buildHrBonusManualAdjustmentsListSurface,
  buildHrBonusMultipliersListSurface,
  buildHrBonusProrationsListSurface,
  buildHrBonusRecoveriesListSurface,
} from "../surface/hr.payroll.bonus-governed-lists.surface";
import {
  hrBonusCyclesSurfaceKey,
  hrBonusDiscretionarySurfaceKey,
  hrBonusEligibilityRulesSurfaceKey,
  hrBonusGuaranteedRulesSurfaceKey,
  hrBonusManualAdjustmentsSurfaceKey,
  hrBonusMultipliersSurfaceKey,
  hrBonusParticipantsSurfaceKey,
  hrBonusPlansSurfaceKey,
  hrBonusProrationsSurfaceKey,
  hrBonusRecoveriesSurfaceKey,
  hrBonusTargetsSurfaceKey,
} from "./hr.payroll.bonus-search-params.parse.shared";

const BONUS_DEFAULT_PAGE_SIZE = 25;

export type HrBonusPageModelInput = {
  organizationId: string;
  canWrite: boolean;
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

export type HrBonusPageModel = {
  plansList: ReturnType<typeof buildHrBonusPlansListSurface>;
  eligibilityRulesList: ReturnType<typeof buildHrBonusEligibilityRulesListSurface>;
  participantsList: ReturnType<typeof buildHrBonusParticipantsListSurface>;
  cyclesList: ReturnType<typeof buildHrBonusCyclesListSurface>;
  targetsList: ReturnType<typeof buildHrBonusTargetsListSurface>;
  guaranteedRulesList: ReturnType<typeof buildHrBonusGuaranteedRulesListSurface>;
  multipliersList: ReturnType<typeof buildHrBonusMultipliersListSurface>;
  prorationsList: ReturnType<typeof buildHrBonusProrationsListSurface>;
  manualAdjustmentsList: ReturnType<typeof buildHrBonusManualAdjustmentsListSurface>;
  discretionaryList: ReturnType<typeof buildHrBonusDiscretionaryListSurface>;
  recoveriesList: ReturnType<typeof buildHrBonusRecoveriesListSurface>;
  surfaceKeys: {
    plans: typeof hrBonusPlansSurfaceKey;
    eligibilityRules: typeof hrBonusEligibilityRulesSurfaceKey;
    participants: typeof hrBonusParticipantsSurfaceKey;
    cycles: typeof hrBonusCyclesSurfaceKey;
    targets: typeof hrBonusTargetsSurfaceKey;
    guaranteedRules: typeof hrBonusGuaranteedRulesSurfaceKey;
    multipliers: typeof hrBonusMultipliersSurfaceKey;
    prorations: typeof hrBonusProrationsSurfaceKey;
    manualAdjustments: typeof hrBonusManualAdjustmentsSurfaceKey;
    discretionary: typeof hrBonusDiscretionarySurfaceKey;
    recoveries: typeof hrBonusRecoveriesSurfaceKey;
  };
};

export async function buildHrBonusPageModel(
  input: HrBonusPageModelInput,
): Promise<HrBonusPageModel> {
  const [
    plansWindow,
    eligibilityWindow,
    participantsWindow,
    cyclesWindow,
    targetsWindow,
    guaranteedWindow,
    multipliersWindow,
    prorationsWindow,
    adjustmentsWindow,
    discretionaryWindow,
    recoveriesWindow,
  ] = await Promise.all([
    listHrBonusPlansWindow({
      organizationId: input.organizationId,
      limit: BONUS_DEFAULT_PAGE_SIZE,
      search: input.plansSearch,
    }),
    listHrBonusEligibilityRulesWindow({
      organizationId: input.organizationId,
      limit: BONUS_DEFAULT_PAGE_SIZE,
      search: input.eligibilityRulesSearch,
    }),
    listHrBonusPlanParticipantsWindow({
      organizationId: input.organizationId,
      limit: BONUS_DEFAULT_PAGE_SIZE,
      search: input.participantsSearch,
    }),
    listHrBonusCyclesWindow({
      organizationId: input.organizationId,
      limit: BONUS_DEFAULT_PAGE_SIZE,
      search: input.cyclesSearch,
    }),
    listHrBonusTargetsWindow({
      organizationId: input.organizationId,
      limit: BONUS_DEFAULT_PAGE_SIZE,
      search: input.targetsSearch,
    }),
    listHrBonusGuaranteedRulesWindow({
      organizationId: input.organizationId,
      limit: BONUS_DEFAULT_PAGE_SIZE,
      search: input.guaranteedRulesSearch,
    }),
    listHrBonusPerformanceMultipliersWindow({
      organizationId: input.organizationId,
      limit: BONUS_DEFAULT_PAGE_SIZE,
      search: input.multipliersSearch,
    }),
    listHrBonusProrationsWindow({
      organizationId: input.organizationId,
      limit: BONUS_DEFAULT_PAGE_SIZE,
      search: input.prorationsSearch,
    }),
    listHrBonusManualAdjustmentsWindow({
      organizationId: input.organizationId,
      limit: BONUS_DEFAULT_PAGE_SIZE,
      search: input.manualAdjustmentsSearch,
    }),
    listHrBonusDiscretionaryRecommendationsWindow({
      organizationId: input.organizationId,
      limit: BONUS_DEFAULT_PAGE_SIZE,
      search: input.discretionarySearch,
    }),
    listHrBonusRecoveriesWindow({
      organizationId: input.organizationId,
      limit: BONUS_DEFAULT_PAGE_SIZE,
      search: input.recoveriesSearch,
    }),
  ]);

  return {
    plansList: buildHrBonusPlansListSurface({
      window: { ...plansWindow, rows: [...plansWindow.rows] },
      searchValue: input.plansSearch,
    }),
    eligibilityRulesList: buildHrBonusEligibilityRulesListSurface({
      window: { ...eligibilityWindow, rows: [...eligibilityWindow.rows] },
      searchValue: input.eligibilityRulesSearch,
    }),
    participantsList: buildHrBonusParticipantsListSurface({
      window: { ...participantsWindow, rows: [...participantsWindow.rows] },
      searchValue: input.participantsSearch,
    }),
    cyclesList: buildHrBonusCyclesListSurface({
      window: { ...cyclesWindow, rows: [...cyclesWindow.rows] },
      searchValue: input.cyclesSearch,
    }),
    targetsList: buildHrBonusTargetsListSurface({
      window: { ...targetsWindow, rows: [...targetsWindow.rows] },
      searchValue: input.targetsSearch,
    }),
    guaranteedRulesList: buildHrBonusGuaranteedRulesListSurface({
      window: { ...guaranteedWindow, rows: [...guaranteedWindow.rows] },
      searchValue: input.guaranteedRulesSearch,
    }),
    multipliersList: buildHrBonusMultipliersListSurface({
      window: { ...multipliersWindow, rows: [...multipliersWindow.rows] },
      searchValue: input.multipliersSearch,
    }),
    prorationsList: buildHrBonusProrationsListSurface({
      window: { ...prorationsWindow, rows: [...prorationsWindow.rows] },
      searchValue: input.prorationsSearch,
    }),
    manualAdjustmentsList: buildHrBonusManualAdjustmentsListSurface({
      window: { ...adjustmentsWindow, rows: [...adjustmentsWindow.rows] },
      searchValue: input.manualAdjustmentsSearch,
    }),
    discretionaryList: buildHrBonusDiscretionaryListSurface({
      window: { ...discretionaryWindow, rows: [...discretionaryWindow.rows] },
      searchValue: input.discretionarySearch,
    }),
    recoveriesList: buildHrBonusRecoveriesListSurface({
      window: { ...recoveriesWindow, rows: [...recoveriesWindow.rows] },
      searchValue: input.recoveriesSearch,
    }),
    surfaceKeys: {
      plans: hrBonusPlansSurfaceKey,
      eligibilityRules: hrBonusEligibilityRulesSurfaceKey,
      participants: hrBonusParticipantsSurfaceKey,
      cycles: hrBonusCyclesSurfaceKey,
      targets: hrBonusTargetsSurfaceKey,
      guaranteedRules: hrBonusGuaranteedRulesSurfaceKey,
      multipliers: hrBonusMultipliersSurfaceKey,
      prorations: hrBonusProrationsSurfaceKey,
      manualAdjustments: hrBonusManualAdjustmentsSurfaceKey,
      discretionary: hrBonusDiscretionarySurfaceKey,
      recoveries: hrBonusRecoveriesSurfaceKey,
    },
  };
}
