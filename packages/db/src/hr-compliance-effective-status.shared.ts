import { HR_COMPLIANCE_POLICY_ACKNOWLEDGEMENT_REQUIREMENT_KIND } from "./hr-compliance-policy-acknowledgement.shared";
import { HR_COMPLIANCE_SAFETY_TRAINING_REQUIREMENT_KIND } from "./hr-compliance-safety-training.shared";
import { HR_COMPLIANCE_WORKPLACE_SAFETY_REQUIREMENT_KIND } from "./hr-compliance-workplace-safety.shared";
import {
  HR_COMPLIANCE_AT_RISK_WINDOW_MS,
  normalizeWorkAuthDocumentStatus,
} from "./hr-compliance.shared";

const TERMINAL_REQUIREMENT_STATUSES = new Set([
  "compliant",
  "waived",
  "non_compliant",
  "expired",
]);

export function deriveRequirementEffectiveStatus(input: {
  status: string;
  dueDate: Date | null;
  requirementKind: string | null;
  now: Date;
}): string {
  const dueDate = input.dueDate;

  if (TERMINAL_REQUIREMENT_STATUSES.has(input.status)) {
    if (
      input.status === "compliant" &&
      dueDate &&
      (input.requirementKind === HR_COMPLIANCE_SAFETY_TRAINING_REQUIREMENT_KIND ||
        input.requirementKind === HR_COMPLIANCE_WORKPLACE_SAFETY_REQUIREMENT_KIND)
    ) {
      if (dueDate.getTime() < input.now.getTime()) {
        return "expired";
      }
      if (dueDate.getTime() - input.now.getTime() <= HR_COMPLIANCE_AT_RISK_WINDOW_MS) {
        return "at_risk";
      }
      return "compliant";
    }
    return input.status;
  }

  if (dueDate) {
    if (dueDate.getTime() < input.now.getTime()) {
      return "overdue";
    }
    if (dueDate.getTime() - input.now.getTime() <= HR_COMPLIANCE_AT_RISK_WINDOW_MS) {
      return "at_risk";
    }
  }

  return input.status;
}

export function deriveFilingEffectiveStatus(input: {
  status: string;
  filingDeadline: Date | null;
  now: Date;
}): string {
  if (input.status === "overdue") {
    return "overdue";
  }

  if (
    input.status === "submitted" ||
    input.status === "confirmed" ||
    input.status === "waived"
  ) {
    return input.status;
  }

  const filingDeadline = input.filingDeadline;
  if (filingDeadline && filingDeadline.getTime() < input.now.getTime()) {
    return "overdue";
  }

  return "pending";
}

export function deriveWorkEligibilityEffectiveStatus(input: {
  status: string;
  expiresAt: Date | null;
  now: Date;
}): string {
  if (
    input.status === "not_applicable" ||
    input.status === "ineligible" ||
    input.status === "expired"
  ) {
    return input.status;
  }

  if (
    input.expiresAt &&
    input.expiresAt.getTime() < input.now.getTime() &&
    (input.status === "eligible" ||
      input.status === "conditional" ||
      input.status === "pending_verification")
  ) {
    return "expired";
  }

  return input.status;
}

export function deriveWorkAuthEffectiveStatus(input: {
  status: string;
  documentNumber?: string | null;
  expiresAt: Date | null;
  now: Date;
}): string {
  const status = normalizeWorkAuthDocumentStatus({
    status: input.status as
      | "missing"
      | "pending_verification"
      | "verified"
      | "rejected"
      | "waived",
    documentNumber: input.documentNumber,
  });

  if (status === "missing" || status === "rejected" || status === "waived") {
    return status;
  }

  const expiresAt = input.expiresAt;
  if (expiresAt) {
    if (expiresAt.getTime() < input.now.getTime()) {
      return "expired";
    }
    if (expiresAt.getTime() - input.now.getTime() <= HR_COMPLIANCE_AT_RISK_WINDOW_MS) {
      return "expiring";
    }
  }

  return status;
}

export function isTrainingOrSafetyRequirementKind(requirementKind: string | null): boolean {
  return (
    requirementKind === HR_COMPLIANCE_SAFETY_TRAINING_REQUIREMENT_KIND ||
    requirementKind === HR_COMPLIANCE_WORKPLACE_SAFETY_REQUIREMENT_KIND
  );
}

export function isOverdueActionRequirementKind(requirementKind: string | null): boolean {
  return (
    isTrainingOrSafetyRequirementKind(requirementKind) ||
    requirementKind === HR_COMPLIANCE_POLICY_ACKNOWLEDGEMENT_REQUIREMENT_KIND
  );
}
