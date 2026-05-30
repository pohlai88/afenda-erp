export type HrBenefitPlanWindowRow = {
  id: string;
  code: string;
  name: string;
  category: string;
  providerName: string | null;
  planStatus: string;
  effectiveFrom: Date;
};

export type HrBenefitPlanWindow = {
  rows: readonly HrBenefitPlanWindowRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrBenefitEligibilityRuleWindowRow = {
  id: string;
  planCode: string;
  planName: string;
  scopeLabel: string;
  active: boolean;
  effectiveFrom: Date;
};

export type HrBenefitEligibilityRuleWindow = {
  rows: readonly HrBenefitEligibilityRuleWindowRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrBenefitOpenEnrollmentWindowRow = {
  id: string;
  code: string;
  name: string;
  status: string;
  enrollmentStartAt: Date;
  enrollmentEndAt: Date;
  coverageEffectiveFrom: Date;
  planCount: number;
};

export type HrBenefitOpenEnrollmentWindowList = {
  rows: readonly HrBenefitOpenEnrollmentWindowRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrBenefitEnrollmentWindowRow = {
  id: string;
  employeeId: string;
  planId: string;
  employeeLabel: string;
  planName: string;
  coverageLevel: string;
  coverageStatus: string;
  enrollmentChannel: string;
  coverageStartDate: Date;
  coverageEndDate: Date | null;
  allowsDependents: boolean;
  unverifiedDependentCount: number;
  employeeContributionAmount: string | null;
  employerContributionAmount: string | null;
};

export type HrBenefitEnrollmentWindow = {
  rows: readonly HrBenefitEnrollmentWindowRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrBenefitAuditTrailWindowRow = {
  id: string;
  action: string;
  summary: string;
  occurredAt: Date;
};

export type HrBenefitAuditTrailWindow = {
  rows: readonly HrBenefitAuditTrailWindowRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrBenefitProviderWindowRow = {
  id: string;
  code: string;
  name: string;
  active: boolean;
};

export type HrBenefitProviderWindow = {
  rows: readonly HrBenefitProviderWindowRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrBenefitPayrollDeductionRefRow = {
  deductionReferenceId: string;
  payrollDeductionReference: string;
  enrollmentId: string;
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  planCode: string;
  planName: string;
  deductionCode: string;
  amount: string;
  frequency: string;
  effectiveFrom: Date;
  approvedAt: Date | null;
};

export type HrBenefitDocumentLinkRow = {
  id: string;
  recordKind: string;
  recordId: string;
  employeeDocumentId: string | null;
  externalReference: string | null;
  documentKind: string;
};

export type HrBenefitEnrollmentChangeRow = {
  id: string;
  enrollmentId: string;
  changeKind: string;
  previousSnapshot: string | null;
  newSnapshot: string;
  effectiveFrom: Date;
};

export type HrBenefitEligibilityDetermination = {
  employeeId: string;
  planId: string;
  eligible: boolean;
  matchedRuleIds: readonly string[];
};
