export {
  HrBenefitsCommandError,
  formatEmployeeLabel,
  normalizeScopeCode,
  normalizeScopeText,
} from "./hr-benefits.shared";

export {
  appliesBenefitEligibilityRuleToEmployee,
  computeEmployeeTenureMonths,
  isEmployeeEligibleForBenefitPlan,
  type HrBenefitEligibilityRuleScope,
  type HrEmployeeBenefitScope,
} from "./hr-benefit-scope.shared";

export type {
  HrBenefitAuditTrailWindow,
  HrBenefitAuditTrailWindowRow,
  HrBenefitEligibilityDetermination,
  HrBenefitEligibilityRuleWindow,
  HrBenefitEligibilityRuleWindowRow,
  HrBenefitEnrollmentWindow,
  HrBenefitEnrollmentWindowRow,
  HrBenefitOpenEnrollmentWindowList,
  HrBenefitOpenEnrollmentWindowRow,
  HrBenefitPayrollDeductionRefRow,
  HrBenefitPlanWindow,
  HrBenefitPlanWindowRow,
} from "./hr-benefits.types";

export {
  archiveHrBenefitPlanInTx,
  listHrBenefitPlansWindow,
  upsertHrBenefitPlan,
  upsertHrBenefitPlanInTx,
} from "./hr-benefits-plans";

export {
  determineHrBenefitEligibility,
  formatBenefitEligibilityScopeLabel,
  listHrBenefitEligibilityRulesWindow,
  loadActiveBenefitEligibilityRulesInTx,
  upsertHrBenefitEligibilityRule,
  upsertHrBenefitEligibilityRuleInTx,
} from "./hr-benefits-eligibility";

export {
  activateHrBenefitOpenEnrollmentWindowInTx,
  assertOpenEnrollmentAllowsPlanInTx,
  findActiveOpenEnrollmentWindowForPlanInTx,
  isOpenEnrollmentWindowActive,
  listHrBenefitOpenEnrollmentWindowsWindow,
  upsertHrBenefitOpenEnrollmentWindowInTx,
} from "./hr-benefits-open-enrollment";

export {
  HR_BENEFIT_COVERAGE_LEVELS,
  HR_BENEFIT_DEPENDENT_RELATIONSHIPS,
  assertBenefitCoverageDatesValid,
  assertCoverageLevelAllowedForPlan,
  isDependentEligibilityVerified,
  resolveEnrollmentContributionRows,
  validateEnrollmentDependents,
  type HrBenefitCoverageLevel,
  type HrBenefitDependentRelationship,
  type HrBenefitEnrollmentDependentInput,
} from "./hr-benefits-enrollment.shared";

export {
  addHrBenefitEnrollmentDependentInTx,
  createHrBenefitEnrollment,
  createHrBenefitEnrollmentInTx,
  recordHrBenefitLifeEvent,
  recordHrBenefitLifeEventInTx,
  verifyHrBenefitEnrollmentDependentsInTx,
} from "./hr-benefits-enrollment-create";

export {
  HR_BENEFIT_COVERAGE_STATUSES,
  assertHrBenefitCoverageStatusTransition,
  resolveBenefitCoverageStatusForEmploymentChange,
  type HrBenefitCoverageStatus,
} from "./hr-benefits-coverage.shared";

export {
  adjustHrBenefitCoverageForEmploymentStatusInTx,
  updateHrBenefitCoverageStatusInTx,
} from "./hr-benefits-coverage";

export {
  HR_BENEFIT_REPORT_EXPORT_ROW_CAP,
  HR_BENEFIT_REPORT_KINDS,
  type HrBenefitReportCsvResult,
  type HrBenefitReportKind,
} from "./hr-benefits-reports.shared";

export { buildHrBenefitReportCsv } from "./hr-benefits-reports";

export { appendHrBenefitAuditEventInTx, listHrBenefitAuditTrailWindow } from "./hr-benefits-audit";

export {
  approveHrBenefitEnrollmentInTx,
  applyHrBenefitEnrollmentChangeInTx,
  listHrBenefitEnrollmentsWindow,
} from "./hr-benefits-enrollments";

export {
  listHrBenefitProvidersWindow,
  upsertHrBenefitProviderInTx,
} from "./hr-benefits-providers";

export {
  buildBenefitDeductionCode,
  createHrBenefitDeductionReferenceInTx,
  listHrBenefitPayrollDeductionRefs,
  markHrBenefitDeductionRefsSyncedInTx,
  updateHrBenefitDeductionReferenceInTx,
} from "./hr-benefits-deductions";

export {
  linkHrBenefitDocumentInTx,
  unlinkHrBenefitDocumentInTx,
} from "./hr-benefits-documents";
