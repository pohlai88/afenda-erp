import {
  deriveRequirementEffectiveStatus,
  HR_COMPLIANCE_LABOR_LAW_REQUIREMENT_KIND,
  HR_COMPLIANCE_POLICY_ACKNOWLEDGEMENT_REQUIREMENT_KIND,
  HR_COMPLIANCE_SAFETY_TRAINING_REQUIREMENT_KIND,
  HR_COMPLIANCE_STATUTORY_REQUIREMENT_KIND,
  HR_COMPLIANCE_WORKPLACE_SAFETY_REQUIREMENT_KIND,
} from "@afenda/db";

import { toEnumMember } from "./hr.workforce.compliance-enum-guard.shared";

export const HRM_COMPLIANCE_AREAS = [
  "document",
  "work_authorization",
  "training",
  "acknowledgement",
  "filing",
  "safety",
  "labor_law",
  "statutory",
  "privacy",
  "integration",
  "other",
] as const;

export type HrmComplianceArea = (typeof HRM_COMPLIANCE_AREAS)[number];

export const HRM_COMPLIANCE_EXCEPTION_SEVERITIES = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

export type HrmComplianceExceptionSeverity =
  (typeof HRM_COMPLIANCE_EXCEPTION_SEVERITIES)[number];

/** HRM-CMP-015 operator-writable requirement statuses (trailing actions). */
export const HRM_COMPLIANCE_REQUIREMENT_STORED_STATUSES = [
  "compliant",
  "pending",
  "expired",
  "waived",
  "non_compliant",
] as const;

export type HrmComplianceRequirementStoredStatus =
  (typeof HRM_COMPLIANCE_REQUIREMENT_STORED_STATUSES)[number];

/** Physical enum values on `hr_compliance_employee_requirements.status`. */
export const HRM_COMPLIANCE_REQUIREMENT_DB_STATUSES = [
  ...HRM_COMPLIANCE_REQUIREMENT_STORED_STATUSES,
  "at_risk",
  "overdue",
] as const;

export type HrmComplianceRequirementDbStatus =
  (typeof HRM_COMPLIANCE_REQUIREMENT_DB_STATUSES)[number];

/** HRM-CMP-015 effective requirement posture including derived overdue/at_risk. */
export const HRM_COMPLIANCE_REQUIREMENT_STATUSES = [
  "compliant",
  "pending",
  "at_risk",
  "overdue",
  "expired",
  "waived",
  "non_compliant",
] as const satisfies readonly HrmComplianceRequirementDbStatus[];

export type HrmComplianceRequirementStatus =
  (typeof HRM_COMPLIANCE_REQUIREMENT_STATUSES)[number];

export function normalizeRequirementStatusForTrailingSelect(
  status: HrmComplianceRequirementStatus,
): HrmComplianceRequirementStoredStatus {
  if (status === "overdue" || status === "at_risk") {
    return "pending";
  }

  return status;
}

const REQUIREMENT_STATUS_PRIORITY: Record<HrmComplianceRequirementStatus, number> =
  {
    non_compliant: 7,
    expired: 6,
    overdue: 5,
    at_risk: 4,
    pending: 3,
    waived: 2,
    compliant: 1,
  };

function toRequirementStatus(value: string): HrmComplianceRequirementStatus {
  return toEnumMember(value, HRM_COMPLIANCE_REQUIREMENT_STATUSES, "requirement status");
}

function deriveEffectiveRequirementStatus(input: {
  status: HrmComplianceRequirementStatus;
  dueDate?: Date | null;
  requirementKind: string | null;
  now?: Date;
}): HrmComplianceRequirementStatus {
  return toRequirementStatus(
    deriveRequirementEffectiveStatus({
      status: input.status,
      dueDate: input.dueDate ?? null,
      requirementKind: input.requirementKind,
      now: input.now ?? new Date(),
    }),
  );
}

export function deriveEffectiveLaborLawRequirementStatus(input: {
  status: HrmComplianceRequirementStatus;
  dueDate?: Date | null;
  now?: Date;
}): HrmComplianceRequirementStatus {
  return deriveEffectiveRequirementStatus({
    status: input.status,
    dueDate: input.dueDate ?? null,
    requirementKind: HR_COMPLIANCE_LABOR_LAW_REQUIREMENT_KIND,
    now: input.now,
  });
}

/** HRM-CMP-003 — statutory employment requirement posture aligned with labor law derivation. */
export function deriveEffectiveStatutoryRequirementStatus(input: {
  status: HrmComplianceRequirementStatus;
  dueDate?: Date | null;
  now?: Date;
}): HrmComplianceRequirementStatus {
  return deriveEffectiveRequirementStatus({
    status: input.status,
    dueDate: input.dueDate ?? null,
    requirementKind: HR_COMPLIANCE_STATUTORY_REQUIREMENT_KIND,
    now: input.now,
  });
}

/** HRM-CMP-007 — derives training/certification posture including expiry on compliant rows. */
export function deriveEffectiveSafetyTrainingRequirementStatus(input: {
  status: HrmComplianceRequirementStatus;
  dueDate?: Date | null;
  now?: Date;
}): HrmComplianceRequirementStatus {
  return deriveEffectiveRequirementStatus({
    status: input.status,
    dueDate: input.dueDate ?? null,
    requirementKind: HR_COMPLIANCE_SAFETY_TRAINING_REQUIREMENT_KIND,
    now: input.now,
  });
}

/** HRM-CMP-006 — certification expiry uses the same derivation as HRM-CMP-007. */
export function deriveEffectiveWorkplaceSafetyRequirementStatus(input: {
  status: HrmComplianceRequirementStatus;
  dueDate?: Date | null;
  now?: Date;
}): HrmComplianceRequirementStatus {
  return deriveEffectiveRequirementStatus({
    status: input.status,
    dueDate: input.dueDate ?? null,
    requirementKind: HR_COMPLIANCE_WORKPLACE_SAFETY_REQUIREMENT_KIND,
    now: input.now,
  });
}

/** HRM-CMP-008 / HRM-CMP-014 — missing acknowledgments surface as pending/overdue/at_risk. */
export function deriveEffectivePolicyAcknowledgementStatus(input: {
  status: HrmComplianceRequirementStatus;
  dueDate?: Date | null;
  now?: Date;
}): HrmComplianceRequirementStatus {
  return deriveEffectiveRequirementStatus({
    status: input.status,
    dueDate: input.dueDate ?? null,
    requirementKind: HR_COMPLIANCE_POLICY_ACKNOWLEDGEMENT_REQUIREMENT_KIND,
    now: input.now,
  });
}

/** HRM-CMP-014 — true when mandatory acknowledgment is not yet recorded. */
export function isPolicyAcknowledgementMissing(input: {
  status: HrmComplianceRequirementStatus;
  dueDate?: Date | null;
  now?: Date;
}): boolean {
  const effectiveStatus = deriveEffectivePolicyAcknowledgementStatus({
    status: input.status,
    dueDate: input.dueDate ?? null,
    now: input.now,
  });
  return effectiveStatus !== "compliant" && effectiveStatus !== "waived";
}

/** HRM-CMP-013 — true when mandatory training is past due and not yet completed. */
export function isSafetyTrainingOverdue(input: {
  status: HrmComplianceRequirementStatus;
  dueDate?: Date | null;
  now?: Date;
}): boolean {
  return (
    deriveEffectiveSafetyTrainingRequirementStatus({
      status: input.status,
      dueDate: input.dueDate ?? null,
      now: input.now,
    }) === "overdue"
  );
}

export function worstComplianceRequirementStatus(
  statuses: readonly HrmComplianceRequirementStatus[],
): HrmComplianceRequirementStatus {
  if (statuses.length === 0) return "compliant";
  return statuses.reduce((worst, next) =>
    REQUIREMENT_STATUS_PRIORITY[next] > REQUIREMENT_STATUS_PRIORITY[worst]
      ? next
      : worst,
  );
}
