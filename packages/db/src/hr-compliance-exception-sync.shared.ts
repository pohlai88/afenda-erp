import { HR_COMPLIANCE_POLICY_ACKNOWLEDGEMENT_REQUIREMENT_KIND } from "./hr-compliance-policy-acknowledgement.shared";
import { HR_COMPLIANCE_SAFETY_TRAINING_REQUIREMENT_KIND } from "./hr-compliance-safety-training.shared";
import { HR_COMPLIANCE_WORKPLACE_SAFETY_REQUIREMENT_KIND } from "./hr-compliance-workplace-safety.shared";
import {
  deriveFilingEffectiveStatus,
  deriveRequirementEffectiveStatus,
  deriveWorkAuthEffectiveStatus,
  deriveWorkEligibilityEffectiveStatus,
} from "./hr-compliance-effective-status.shared";

/** HRM-CMP-017 gap kinds that materialize compliance exceptions. */
export const HR_COMPLIANCE_EXCEPTION_GAP_KINDS = [
  "missing",
  "expired",
  "overdue",
  "failed",
] as const;

export type HrComplianceExceptionGapKind =
  (typeof HR_COMPLIANCE_EXCEPTION_GAP_KINDS)[number];

export const HR_COMPLIANCE_EXCEPTION_SOURCE_KINDS = [
  "employee_requirement",
  "filing",
  "work_authorization",
  "work_eligibility",
] as const;

export type HrComplianceExceptionSourceKind =
  (typeof HR_COMPLIANCE_EXCEPTION_SOURCE_KINDS)[number];

export function buildComplianceExceptionSourceReferenceId(input: {
  sourceKind: HrComplianceExceptionSourceKind;
  sourceId: string;
  gapKind: HrComplianceExceptionGapKind;
}): string {
  return `exception:${input.sourceKind}:${input.sourceId}:${input.gapKind}`;
}

export const HR_COMPLIANCE_EXCEPTION_AUTO_RESOLVED_NOTE =
  "Auto-resolved: source compliance item no longer requires an open exception.";

export function isAutoResolvedComplianceException(input: {
  resolutionNote: string | null;
}): boolean {
  return input.resolutionNote === HR_COMPLIANCE_EXCEPTION_AUTO_RESOLVED_NOTE;
}

export type ComplianceExceptionGapCandidateFields = {
  employeeId: string | null;
  title: string;
  complianceArea: string;
  itemType: string;
  severity: "low" | "medium" | "high" | "critical";
  gapKind: HrComplianceExceptionGapKind;
};

/** Fresh open row when an auto-resolved gap recurs — clears corrective workflow residue. */
export function buildAutoReopenedComplianceExceptionValues(
  candidate: ComplianceExceptionGapCandidateFields,
) {
  return {
    status: "open" as const,
    employeeId: candidate.employeeId,
    title: candidate.title,
    severity: candidate.severity,
    gapKind: candidate.gapKind,
    itemType: candidate.itemType,
    complianceArea: candidate.complianceArea,
    resolutionNote: null,
    resolvedAt: null,
    correctiveActionDescription: null,
    correctiveActionDueDate: null,
  };
}

export function resolveComplianceExceptionSeverity(input: {
  gapKind: HrComplianceExceptionGapKind;
  complianceArea: string;
}): "low" | "medium" | "high" | "critical" {
  if (input.gapKind === "failed" || input.gapKind === "expired") {
    return "critical";
  }

  if (input.gapKind === "overdue") {
    return "high";
  }

  if (
    input.gapKind === "missing" &&
    (input.complianceArea === "work_authorization" ||
      input.complianceArea === "work_eligibility")
  ) {
    return "high";
  }

  return "medium";
}

function isTrainingOrSafetyRequirementKind(requirementKind: string | null): boolean {
  return (
    requirementKind === HR_COMPLIANCE_SAFETY_TRAINING_REQUIREMENT_KIND ||
    requirementKind === HR_COMPLIANCE_WORKPLACE_SAFETY_REQUIREMENT_KIND
  );
}

export function classifyEmployeeRequirementExceptionGap(input: {
  status: string;
  dueDate: Date | null;
  requirementKind: string | null;
  now?: Date;
}): HrComplianceExceptionGapKind | null {
  const now = input.now ?? new Date();
  const effectiveStatus = deriveRequirementEffectiveStatus({
    status: input.status,
    dueDate: input.dueDate ?? null,
    requirementKind: input.requirementKind,
    now,
  });

  if (effectiveStatus === "non_compliant") {
    return "failed";
  }

  if (effectiveStatus === "expired") {
    return "expired";
  }

  if (effectiveStatus === "overdue") {
    return "overdue";
  }

  if (
    input.requirementKind === HR_COMPLIANCE_POLICY_ACKNOWLEDGEMENT_REQUIREMENT_KIND &&
    (effectiveStatus === "pending" || effectiveStatus === "at_risk")
  ) {
    return "missing";
  }

  if (
    isTrainingOrSafetyRequirementKind(input.requirementKind) &&
    effectiveStatus === "pending" &&
    !input.dueDate
  ) {
    return "missing";
  }

  return null;
}

export function classifyFilingExceptionGap(input: {
  status: string;
  filingDeadline: Date | null;
  now?: Date;
}): HrComplianceExceptionGapKind | null {
  const now = input.now ?? new Date();
  const effectiveStatus = deriveFilingEffectiveStatus({
    status: input.status,
    filingDeadline: input.filingDeadline ?? null,
    now,
  });

  return effectiveStatus === "overdue" ? "overdue" : null;
}

export function classifyWorkAuthDocumentExceptionGap(input: {
  status: string;
  documentNumber?: string | null;
  expiresAt: Date | null;
  now?: Date;
}): HrComplianceExceptionGapKind | null {
  const now = input.now ?? new Date();
  const effectiveStatus = deriveWorkAuthEffectiveStatus({
    status: input.status,
    documentNumber: input.documentNumber,
    expiresAt: input.expiresAt ?? null,
    now,
  });

  if (effectiveStatus === "missing") {
    return "missing";
  }

  if (effectiveStatus === "expired") {
    return "expired";
  }

  if (effectiveStatus === "rejected") {
    return "failed";
  }

  return null;
}

export function classifyWorkEligibilityExceptionGap(input: {
  status: string;
  expiresAt: Date | null;
  now?: Date;
}): HrComplianceExceptionGapKind | null {
  const now = input.now ?? new Date();
  const effectiveStatus = deriveWorkEligibilityEffectiveStatus({
    status: input.status,
    expiresAt: input.expiresAt ?? null,
    now,
  });

  if (effectiveStatus === "expired") {
    return "expired";
  }

  if (effectiveStatus === "ineligible") {
    return "failed";
  }

  return null;
}
