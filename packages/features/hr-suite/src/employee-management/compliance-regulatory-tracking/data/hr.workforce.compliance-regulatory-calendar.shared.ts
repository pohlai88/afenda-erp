import {
  deriveComplianceDeadlinePosture,
  HR_COMPLIANCE_POLICY_ACKNOWLEDGEMENT_REQUIREMENT_KIND,
  HR_COMPLIANCE_SAFETY_TRAINING_REQUIREMENT_KIND,
  HR_COMPLIANCE_WORKPLACE_SAFETY_REQUIREMENT_KIND,
  type HrComplianceDeadlinePosture,
  type HrComplianceRegulatoryCalendarEntryKind,
} from "@afenda/db";

import {
  deriveEffectiveLaborLawRequirementStatus,
  deriveEffectivePolicyAcknowledgementStatus,
  deriveEffectiveSafetyTrainingRequirementStatus,
  deriveEffectiveWorkplaceSafetyRequirementStatus,
  type HrmComplianceRequirementStatus,
} from "./hr.workforce.compliance-status.shared";
import {
  deriveEffectiveFilingStatus,
  type HrmComplianceFilingDbStatus,
} from "./hr.workforce.compliance-filing.shared";
import {
  deriveEffectiveWorkEligibilityStatus,
  type HrmComplianceWorkEligibilityStatus,
} from "./hr.workforce.compliance-work-eligibility.shared";
import {
  deriveEffectiveWorkAuthDocumentStatus,
  type HrmComplianceWorkAuthDocumentStatus,
} from "./hr.workforce.compliance-work-auth-documents.shared";

/** HRM-CMP-010 effective deadline posture derived at read time. */
export const HRM_COMPLIANCE_REGULATORY_CALENDAR_POSTURES = [
  "upcoming",
  "due_today",
  "overdue",
] as const;

export type HrmComplianceRegulatoryCalendarPosture = HrComplianceDeadlinePosture;

export function deriveRegulatoryCalendarPosture(input: {
  deadlineAt: Date;
  now?: Date;
}): HrmComplianceRegulatoryCalendarPosture {
  return deriveComplianceDeadlinePosture(input);
}

function deriveEmployeeRequirementEffectiveStatus(input: {
  status: HrmComplianceRequirementStatus;
  dueDate: Date;
  requirementKind: string | null;
  now?: Date;
}): HrmComplianceRequirementStatus {
  const deriveInput = {
    status: input.status,
    dueDate: input.dueDate,
    now: input.now,
  };

  switch (input.requirementKind) {
    case HR_COMPLIANCE_SAFETY_TRAINING_REQUIREMENT_KIND:
      return deriveEffectiveSafetyTrainingRequirementStatus(deriveInput);
    case HR_COMPLIANCE_WORKPLACE_SAFETY_REQUIREMENT_KIND:
      return deriveEffectiveWorkplaceSafetyRequirementStatus(deriveInput);
    case HR_COMPLIANCE_POLICY_ACKNOWLEDGEMENT_REQUIREMENT_KIND:
      return deriveEffectivePolicyAcknowledgementStatus(deriveInput);
    default:
      return deriveEffectiveLaborLawRequirementStatus(deriveInput);
  }
}

/** HRM-CMP-010 — aligns calendar source status with sibling list surfaces. */
export function deriveRegulatoryCalendarEffectiveSourceStatus(input: {
  entryKind: HrComplianceRegulatoryCalendarEntryKind;
  sourceStatus: string;
  deadlineAt: Date;
  requirementKind: string | null;
  documentNumber?: string | null;
  now?: Date;
}): string {
  const now = input.now;
  const deadlineAt = input.deadlineAt;

  switch (input.entryKind) {
    case "filing":
      return deriveEffectiveFilingStatus({
        status: input.sourceStatus as HrmComplianceFilingDbStatus,
        filingDeadline: deadlineAt,
        now,
      });
    case "employee_requirement":
      return deriveEmployeeRequirementEffectiveStatus({
        status: input.sourceStatus as HrmComplianceRequirementStatus,
        dueDate: deadlineAt,
        requirementKind: input.requirementKind,
        now,
      });
    case "work_eligibility_renewal":
      return deriveEffectiveWorkEligibilityStatus({
        status: input.sourceStatus as HrmComplianceWorkEligibilityStatus,
        expiresAt: deadlineAt,
        now,
      });
    case "work_auth_renewal":
      return deriveEffectiveWorkAuthDocumentStatus({
        status: input.sourceStatus as HrmComplianceWorkAuthDocumentStatus,
        documentNumber: input.documentNumber,
        expiresAt: deadlineAt,
        now,
      });
    case "corrective_action":
      return input.sourceStatus;
    default: {
      const exhaustive: never = input.entryKind;
      return exhaustive;
    }
  }
}

export function formatRegulatoryCalendarEntryKindLabel(
  entryKind: HrComplianceRegulatoryCalendarEntryKind,
): string {
  switch (entryKind) {
    case "filing":
      return "Mandatory filing";
    case "employee_requirement":
      return "Employee requirement";
    case "work_eligibility_renewal":
      return "Work eligibility renewal";
    case "work_auth_renewal":
      return "Work authorization renewal";
    case "corrective_action":
      return "Corrective action";
    default: {
      const exhaustive: never = entryKind;
      return exhaustive;
    }
  }
}
