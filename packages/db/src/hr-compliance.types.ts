import type { HrComplianceObligationScope } from "./hr-compliance-scope.shared";
import type { HrComplianceEvidenceRecordKind } from "./hr-compliance-evidence-links.shared";
import type { HrComplianceEvidenceSubmissionState } from "./hr-compliance-evidence-links.shared";
import {
  hrComplianceEmployeeRequirements,
  hrComplianceExceptions,
  hrComplianceFilings,
  hrComplianceObligations,
  hrComplianceWorkAuthorizationDocuments,
  hrComplianceWorkEligibility,
} from "./hr";

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
  correctiveActionOwnerEmployeeId: string | null;
  correctiveActionOwnerEmployeeNumber: string | null;
  correctiveActionOwnerDisplayName: string | null;
  correctiveActionDescription: string | null;
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

export type HrEmployeeStatutoryRequirementRow = HrEmployeeLaborLawRequirementRow;

export type HrEmployeeStatutoryRequirementWindow = {
  rows: readonly HrEmployeeStatutoryRequirementRow[];
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
  /** HRM-CMP-020 — count of linked employee documents for this work-auth row. */
  linkedEvidenceCount: number;
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
  /** Active linked employee documents for work authorization renewals (HRM-CMP-020). */
  linkedEvidenceCount?: number;
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
  /** Active linked employee documents for work authorization alerts (HRM-CMP-020). */
  linkedEvidenceCount?: number;
};

export type HrComplianceAlertWindow = {
  rows: readonly HrComplianceAlertRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  /** True when merged alert candidates exceeded the in-memory merge cap before pagination. */
  mergeTruncated: boolean;
};

export type HrComplianceReviewQueueEntryKind =
  | "filing_confirmation"
  | "work_eligibility_verification"
  | "work_auth_verification"
  | "evidence_acknowledgment";

export type HrComplianceReviewQueueRow = {
  id: string;
  entryKind: HrComplianceReviewQueueEntryKind;
  sourceRecordId: string;
  queuedAt: Date;
  title: string;
  subjectLabel: string | null;
  complianceArea: string | null;
  sourceStatus: string;
  employeeId: string | null;
  documentNumber?: string | null;
  linkedEvidenceCount?: number;
  documentClassification?: string | null;
};

export type HrComplianceReviewQueueWindow = {
  rows: readonly HrComplianceReviewQueueRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  mergeTruncated: boolean;
};

export type HrComplianceEvidenceLinkRow = {
  id: string;
  recordKind: HrComplianceEvidenceRecordKind;
  recordId: string;
  recordLabel: string;
  employeeId: string | null;
  employeeNumber: string | null;
  employeeDisplayName: string | null;
  employeeDocumentId: string;
  documentTitle: string;
  documentType: string;
  documentClassification: "internal" | "confidential" | "restricted";
  submissionState: HrComplianceEvidenceSubmissionState;
  notes: string | null;
  submittedAt: Date | null;
  acknowledgedAt: Date | null;
  createdAt: Date;
};

export type HrComplianceEvidenceLinkWindow = {
  rows: readonly HrComplianceEvidenceLinkRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrComplianceOverviewDimensionBreakdownRow = {
  id: string;
  dimension: "department" | "legal_entity" | "work_location" | "worker_category";
  dimensionValue: string;
  trackedCount: number;
  atRiskCount: number;
  overdueCount: number;
  openExceptionCount: number;
};

export type HrComplianceOverviewSnapshot = {
  openExceptionCount: number;
  criticalAlertCount: number;
  overdueFilingCount: number;
  pendingReviewCount: number;
  atRiskRequirementCount: number;
  overdueRequirementCount: number;
  dimensionBreakdown: readonly HrComplianceOverviewDimensionBreakdownRow[];
};

export class HrComplianceCommandError extends Error {
  readonly code:
    | "obligation_not_found"
    | "exception_not_found"
    | "exception_not_open"
    | "corrective_action_not_assigned"
    | "corrective_action_assignment_incomplete"
    | "corrective_action_owner_not_found"
    | "requirement_not_found"
    | "work_eligibility_not_found"
    | "work_auth_document_not_found"
    | "filing_not_found"
    | "invalid_exception_gap_kind"
    | "evidence_source_not_found"
    | "evidence_document_not_found"
    | "evidence_document_employee_mismatch"
    | "evidence_link_not_found"
    | "evidence_link_already_exists"
    | "invalid_evidence_submission_state"
    | "invalid_evidence_record_kind";

  constructor(code: HrComplianceCommandError["code"], message?: string) {
    super(message ?? code);
    this.code = code;
  }
}
