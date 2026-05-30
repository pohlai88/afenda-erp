import type {
  HrComplianceAlertKind,
  HrComplianceAlertSeverity,
  HrComplianceAlertSourceKind,
} from "@afenda/db";

export {
  classifyComplianceAlert,
  HR_COMPLIANCE_ALERT_KINDS,
  HR_COMPLIANCE_ALERT_SEVERITIES,
  HR_COMPLIANCE_ALERT_SOURCE_KINDS,
} from "@afenda/db";

export type HrmComplianceAlertKind = HrComplianceAlertKind;
export type HrmComplianceAlertSeverity = HrComplianceAlertSeverity;
export type HrmComplianceAlertSourceKind = HrComplianceAlertSourceKind;

export function formatComplianceAlertKindLabel(
  alertKind: HrmComplianceAlertKind,
): string {
  switch (alertKind) {
    case "deadline":
      return "Deadline";
    case "renewal":
      return "Renewal";
    case "expiry":
      return "Expiry";
    case "overdue_action":
      return "Overdue action";
    default: {
      const exhaustive: never = alertKind;
      return exhaustive;
    }
  }
}

export function formatComplianceAlertSeverityLabel(
  severity: HrmComplianceAlertSeverity,
): string {
  switch (severity) {
    case "critical":
      return "Critical";
    case "attention":
      return "Attention";
    default: {
      const exhaustive: never = severity;
      return exhaustive;
    }
  }
}

export function formatComplianceAlertSourceKindLabel(
  sourceKind: HrmComplianceAlertSourceKind,
): string {
  switch (sourceKind) {
    case "filing":
      return "Mandatory filing";
    case "employee_requirement":
      return "Employee requirement";
    case "work_eligibility_renewal":
      return "Work eligibility renewal";
    case "work_auth_renewal":
      return "Work authorization renewal";
    case "work_auth_missing":
      return "Missing work authorization document";
    case "corrective_action":
      return "Corrective action";
    default: {
      const exhaustive: never = sourceKind;
      return exhaustive;
    }
  }
}
