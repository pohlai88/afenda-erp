import { deriveComplianceDeadlinePosture } from "./hr-compliance-calendar.shared";
import {
  deriveFilingEffectiveStatus,
  deriveRequirementEffectiveStatus,
  deriveWorkAuthEffectiveStatus,
  deriveWorkEligibilityEffectiveStatus,
  isOverdueActionRequirementKind,
  isTrainingOrSafetyRequirementKind,
} from "./hr-compliance-effective-status.shared";
import { HR_COMPLIANCE_AT_RISK_WINDOW_MS } from "./hr-compliance.shared";

/** HRM-CMP-016 alert categories. */
export const HR_COMPLIANCE_ALERT_KINDS = [
  "deadline",
  "renewal",
  "expiry",
  "overdue_action",
] as const;

export type HrComplianceAlertKind = (typeof HR_COMPLIANCE_ALERT_KINDS)[number];

export const HR_COMPLIANCE_ALERT_SEVERITIES = ["critical", "attention"] as const;

export type HrComplianceAlertSeverity =
  (typeof HR_COMPLIANCE_ALERT_SEVERITIES)[number];

export const HR_COMPLIANCE_ALERT_SOURCE_KINDS = [
  "filing",
  "employee_requirement",
  "work_eligibility_renewal",
  "work_auth_renewal",
  "work_auth_missing",
  "corrective_action",
] as const;

export type HrComplianceAlertSourceKind =
  (typeof HR_COMPLIANCE_ALERT_SOURCE_KINDS)[number];

/** In-memory merge cap — org-scoped alert candidates stay bounded in practice. */
export const HR_COMPLIANCE_ALERTS_MERGE_CAP = 1000;

export function classifyComplianceAlert(input: {
  sourceKind: HrComplianceAlertSourceKind;
  sourceStatus: string;
  triggerAt: Date | null;
  requirementKind: string | null;
  documentNumber?: string | null;
  now?: Date;
}): { alertKind: HrComplianceAlertKind; severity: HrComplianceAlertSeverity } | null {
  const now = input.now ?? new Date();

  if (input.sourceKind === "work_auth_missing") {
    return { alertKind: "overdue_action", severity: "critical" };
  }

  const triggerAt = input.triggerAt;
  const posture =
    triggerAt !== null
      ? deriveComplianceDeadlinePosture({ deadlineAt: triggerAt, now })
      : null;

  switch (input.sourceKind) {
    case "filing": {
      const effectiveStatus = deriveFilingEffectiveStatus({
        status: input.sourceStatus,
        filingDeadline: triggerAt,
        now,
      });
      if (effectiveStatus === "overdue") {
        return { alertKind: "deadline", severity: "critical" };
      }
      if (posture === "due_today") {
        return { alertKind: "deadline", severity: "attention" };
      }
      if (effectiveStatus === "pending" && posture === "upcoming" && triggerAt) {
        if (triggerAt.getTime() - now.getTime() <= HR_COMPLIANCE_AT_RISK_WINDOW_MS) {
          return { alertKind: "deadline", severity: "attention" };
        }
      }
      return null;
    }
    case "employee_requirement": {
      if (
        triggerAt === null &&
        input.sourceStatus === "pending" &&
        isOverdueActionRequirementKind(input.requirementKind)
      ) {
        return { alertKind: "overdue_action", severity: "critical" };
      }

      if (triggerAt === null) {
        return null;
      }

      const effectiveStatus = deriveRequirementEffectiveStatus({
        status: input.sourceStatus,
        dueDate: triggerAt,
        requirementKind: input.requirementKind,
        now,
      });

      if (effectiveStatus === "expired") {
        return { alertKind: "expiry", severity: "critical" };
      }
      if (effectiveStatus === "overdue") {
        return {
          alertKind: isOverdueActionRequirementKind(input.requirementKind)
            ? "overdue_action"
            : "deadline",
          severity: "critical",
        };
      }
      if (effectiveStatus === "at_risk") {
        return {
          alertKind: isTrainingOrSafetyRequirementKind(input.requirementKind)
            ? "renewal"
            : "deadline",
          severity: "attention",
        };
      }
      if (posture === "due_today") {
        return { alertKind: "deadline", severity: "attention" };
      }
      return null;
    }
    case "work_eligibility_renewal": {
      const effectiveStatus = deriveWorkEligibilityEffectiveStatus({
        status: input.sourceStatus,
        expiresAt: triggerAt,
        now,
      });
      if (effectiveStatus === "expired") {
        return { alertKind: "expiry", severity: "critical" };
      }
      if (posture === "overdue") {
        return { alertKind: "overdue_action", severity: "critical" };
      }
      if (posture === "due_today") {
        return { alertKind: "renewal", severity: "attention" };
      }
      if (triggerAt && triggerAt.getTime() - now.getTime() <= HR_COMPLIANCE_AT_RISK_WINDOW_MS) {
        return { alertKind: "renewal", severity: "attention" };
      }
      return null;
    }
    case "work_auth_renewal": {
      const effectiveStatus = deriveWorkAuthEffectiveStatus({
        status: input.sourceStatus,
        documentNumber: input.documentNumber,
        expiresAt: triggerAt,
        now,
      });
      if (effectiveStatus === "missing") {
        return { alertKind: "overdue_action", severity: "critical" };
      }
      if (effectiveStatus === "expired") {
        return { alertKind: "expiry", severity: "critical" };
      }
      if (effectiveStatus === "expiring") {
        return { alertKind: "renewal", severity: "attention" };
      }
      if (posture === "overdue") {
        return { alertKind: "overdue_action", severity: "critical" };
      }
      if (posture === "due_today") {
        return { alertKind: "renewal", severity: "attention" };
      }
      return null;
    }
    case "corrective_action": {
      if (posture === "overdue") {
        return { alertKind: "overdue_action", severity: "critical" };
      }
      if (posture === "due_today") {
        return { alertKind: "deadline", severity: "attention" };
      }
      if (triggerAt && triggerAt.getTime() - now.getTime() <= HR_COMPLIANCE_AT_RISK_WINDOW_MS) {
        return { alertKind: "deadline", severity: "attention" };
      }
      return null;
    }
    default: {
      const exhaustive: never = input.sourceKind;
      return exhaustive;
    }
  }
}

export const ALERT_SEVERITY_SORT_PRIORITY: Record<HrComplianceAlertSeverity, number> =
  {
    critical: 0,
    attention: 1,
  };
