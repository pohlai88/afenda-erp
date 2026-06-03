export {
  HrCompensationCalculationError,
  computeProposedSalary,
  computeTotalCompImpact,
  validateBandPosition,
  computeBudgetUtilization,
  computeCompensationScenario,
  buildCompensationExceptionFlags,
  requiresJustification,
  evaluateCompensationEligibility,
  evaluateAllCompensationEligibilityRules,
  computeBudgetImpact,
} from "@afenda/db";

export type {
  CompensationIncreaseInput,
  CompensationScenarioInput,
  CompensationScenarioResult,
  TotalCompImpactInput,
  TotalCompImpactResult,
  BandValidationResult,
  BudgetUtilizationResult,
  SalaryBandReference,
} from "@afenda/db";
