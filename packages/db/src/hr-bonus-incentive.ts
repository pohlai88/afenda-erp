export {
  HrBonusCommandError,
} from "./hr-bonus-incentive.shared";

export {
  appendHrBonusIncentiveAuditEventInTx,
} from "./hr-bonus-incentive-audit";

export {
  listHrBonusPlansWindow,
  upsertHrBonusPlanInTx,
  archiveHrBonusPlanInTx,
} from "./hr-bonus-plans";

export {
  listHrBonusCyclesWindow,
  upsertHrBonusCycleInTx,
} from "./hr-bonus-cycles";

export {
  listHrBonusEligibilityRulesWindow,
  upsertHrBonusEligibilityRuleInTx,
  determineHrBonusEligibility,
  determineHrBonusEligibilityInTx,
  validateHrBonusEligibilityBeforePayoutInTx,
  formatBonusEligibilityScopeLabel,
  type HrBonusEligibilityDetermination,
} from "./hr-bonus-eligibility";

export {
  listHrBonusPlanParticipantsWindow,
  assignHrBonusPlanParticipantInTx,
  removeHrBonusPlanParticipantInTx,
} from "./hr-bonus-participants";

export {
  listHrBonusTargetsWindow,
  upsertHrBonusTargetInTx,
} from "./hr-bonus-targets";

export {
  buildBonusTargetScopeKey,
  isEmployeeEligibleForBonusPlan,
  appliesBonusEligibilityRuleToEmployee,
  computeEmployeeTenureMonths,
  type HrBonusEligibilityRuleScope,
  type HrEmployeeBonusScope,
} from "./hr-bonus-scope.shared";

export {
  calculateBonusPayout,
  computeBonusAchievementPercent,
  computeBonusBasePayout,
  applyBonusCommissionTiers,
  applyBonusAccelerator,
  enforceBonusPayoutBounds,
  recordHrBonusTargetAchievementInTx,
  getHrBonusTargetAchievementInTx,
  loadHrBonusPayoutConfigInTx,
  calculateHrBonusPayoutForPlanInTx,
  type RecordHrBonusTargetAchievementInput,
  type RecordHrBonusTargetAchievementResult,
  type CalculateHrBonusPayoutForPlanInput,
  type BonusPayoutCalculationInput,
  type BonusPayoutCalculationResult,
  type BonusCommissionTier,
  type BonusAcceleratorRule,
  type BonusPayoutBounds,
  type BonusPayoutFormulaKind,
} from "./hr-bonus-incentive-achievements";

export {
  upsertHrBonusPayoutFormulaInTx,
  replaceHrBonusCommissionTiersInTx,
  upsertHrBonusAcceleratorRuleInTx,
  type UpsertHrBonusPayoutFormulaInput,
  type UpsertHrBonusCommissionTierInput,
  type UpsertHrBonusAcceleratorRuleInput,
} from "./hr-bonus-incentive-payout";

export {
  listHrBonusDiscretionaryRecommendationsWindow,
  listHrBonusGuaranteedRulesWindow,
  listHrBonusManualAdjustmentsWindow,
  listHrBonusPerformanceMultipliersWindow,
  listHrBonusProrationsWindow,
  listHrBonusRecoveriesWindow,
} from "./hr-bonus-incentive-lists";
