import type { HrComplianceObligationScope } from "./hr-compliance-scope.shared";
import {
  hrComplianceEmployeeRequirements,
  hrComplianceExceptions,
  hrComplianceFilings,
  hrComplianceObligations,
  hrComplianceWorkAuthorizationDocuments,
  hrComplianceWorkEligibility,
} from "./schema/hr";

export type HrComplianceObligationScopeFields = Omit<
  HrComplianceObligationScope,
  "departmentId"
>;

export type HrComplianceObligationRow = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  complianceArea: string;
  requirementKind: string;
  status: (typeof hrComplianceObligations.$inferSelect)["status"];
  departmentName: string | null;
  dueDate: Date | null;
} & HrComplianceObligationScopeFields;

export type HrComplianceObligationWindow = {
  rows: readonly HrComplianceObligationRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrComplianceExceptionRow = {
  id: string;
  employeeId: string | null;
  employeeNumber: string | null;
  employeeDisplayName: string | null;
  complianceArea: string;
  itemType: string;
  gapKind: string | null;
  title: string;
  severity: (typeof hrComplianceExceptions.$inferSelect)["severity"];
  status: (typeof hrComplianceExceptions.$inferSelect)["status"];
  correctiveActionDueDate: Date | null;
  createdAt: Date;
};

export type HrComplianceExceptionWindow = {
  rows: readonly HrComplianceExceptionRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrEmployeeLaborLawRequirementRow = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  obligationId: string;
  obligationCode: string;
  obligationTitle: string;
  complianceArea: string;
  status: (typeof hrComplianceEmployeeRequirements.$inferSelect)["status"];
  dueDate: Date | null;
  completedAt: Date | null;
  reviewNotes: string | null;
};

export type HrEmployeeLaborLawRequirementWindow = {
  rows: readonly HrEmployeeLaborLawRequirementRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrEmployeeSafetyTrainingRequirementRow = HrEmployeeLaborLawRequirementRow & {
  requirementKind: string;
};

export type HrEmployeeSafetyTrainingRequirementWindow = {
  rows: readonly HrEmployeeSafetyTrainingRequirementRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrEmployeeWorkplaceSafetyRequirementRow = HrEmployeeLaborLawRequirementRow;

export type HrEmployeeWorkplaceSafetyRequirementWindow = {
  rows: readonly HrEmployeeWorkplaceSafetyRequirementRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrEmployeePolicyAcknowledgementRow = HrEmployeeLaborLawRequirementRow;

export type HrEmployeePolicyAcknowledgementWindow = {
  rows: readonly HrEmployeePolicyAcknowledgementRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrWorkEligibilityRow = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  status: (typeof hrComplianceWorkEligibility.$inferSelect)["status"];
  verifiedAt: Date | null;
  expiresAt: Date | null;
  reviewNotes: string | null;
};

export type HrWorkEligibilityWindow = {
  rows: readonly HrWorkEligibilityRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrWorkAuthorizationDocumentRow = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  documentType: (typeof hrComplianceWorkAuthorizationDocuments.$inferSelect)["documentType"];
  status: (typeof hrComplianceWorkAuthorizationDocuments.$inferSelect)["status"];
  documentNumber: string | null;
  issuedAt: Date | null;
  expiresAt: Date | null;
  verifiedAt: Date | null;
  reviewNotes: string | null;
};

export type HrWorkAuthorizationDocumentWindow = {
  rows: readonly HrWorkAuthorizationDocumentRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrComplianceFilingRow = {
  id: string;
  obligationId: string;
  obligationCode: string;
  obligationTitle: string;
  complianceArea: string;
  countryCode: string | null;
  legalEntityCode: string | null;
  workLocationCode: string | null;
  employmentType: string | null;
  workerCategory: string | null;
  departmentName: string | null;
  status: (typeof hrComplianceFilings.$inferSelect)["status"];
  filingDeadline: Date | null;
  submittedAt: Date | null;
  confirmedAt: Date | null;
  reviewNotes: string | null;
};

export type HrComplianceFilingWindow = {
  rows: readonly HrComplianceFilingRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrComplianceRegulatoryCalendarEntryKind =
  | "filing"
  | "employee_requirement"
  | "work_eligibility_renewal"
  | "work_auth_renewal"
  | "corrective_action";

export type HrComplianceRegulatoryCalendarRow = {
  id: string;
  entryKind: HrComplianceRegulatoryCalendarEntryKind;
  deadlineAt: Date;
  title: string;
  subjectLabel: string | null;
  complianceArea: string | null;
  sourceStatus: string;
  requirementKind: string | null;
  employeeId: string | null;
  /** Present for work authorization renewal entries — feeds HRM-CMP-011 evidence derivation. */
  documentNumber?: string | null;
};

export type HrComplianceRegulatoryCalendarWindow = {
  rows: readonly HrComplianceRegulatoryCalendarRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  /** True when merged source entries exceeded the in-memory merge cap before pagination. */
  mergeTruncated: boolean;
};

export type HrComplianceAlertKind =
  | "deadline"
  | "renewal"
  | "expiry"
  | "overdue_action";

export type HrComplianceAlertSeverity = "critical" | "attention";

export type HrComplianceAlertSourceKind =
  | HrComplianceRegulatoryCalendarEntryKind
  | "work_auth_missing";

export type HrComplianceAlertRow = {
  id: string;
  alertKind: HrComplianceAlertKind;
  severity: HrComplianceAlertSeverity;
  sourceKind: HrComplianceAlertSourceKind;
  triggerAt: Date | null;
  title: string;
  subjectLabel: string | null;
  complianceArea: string | null;
  sourceStatus: string;
  requirementKind: string | null;
  employeeId: string | null;
  /** Present for work authorization alert sources — feeds HRM-CMP-011 evidence derivation. */
  documentNumber?: string | null;
};

export type HrComplianceAlertWindow = {
  rows: readonly HrComplianceAlertRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  /** True when merged alert candidates exceeded the in-memory merge cap before pagination. */
  mergeTruncated: boolean;
};

export class HrComplianceCommandError extends Error {
  readonly code:
    | "obligation_not_found"
    | "exception_not_found"
    | "exception_not_open"
    | "requirement_not_found"
    | "work_eligibility_not_found"
    | "work_auth_document_not_found"
    | "filing_not_found"
    | "invalid_exception_gap_kind";

  constructor(code: HrComplianceCommandError["code"], message?: string) {
    super(message ?? code);
    this.code = code;
  }
}
