import type { ListSurfaceRow } from "@afenda/governed-surface/schemas";

import type { HrmComplianceRequirementStatus } from "../data/hr.workforce.compliance-status.shared";
import { formatComplianceEnumLabel } from "../schemas/hr.workforce.compliance-form.shared";

export type ComplianceListRowTone = NonNullable<ListSurfaceRow["rowTone"]>;

type BadgeTone = "default" | "attention" | "critical";

const COMPLIANCE_EXCEPTION_SEVERITY_ROW_TONE: Record<string, ComplianceListRowTone> =
  {
    critical: "critical",
    high: "critical",
    medium: "attention",
    low: "default",
  };

const COMPLIANCE_EXCEPTION_STATUS_ROW_TONE: Record<string, ComplianceListRowTone> =
  {
    escalated: "critical",
    open: "attention",
    in_progress: "attention",
  };

const COMPLIANCE_OBLIGATION_STATUS_BADGE_TONE: Record<string, "default" | "attention"> =
  {
    active: "default",
    archived: "attention",
  };

const COMPLIANCE_EXCEPTION_SEVERITY_BADGE_TONE: Record<string, BadgeTone> = {
  critical: "critical",
  high: "critical",
  medium: "attention",
  low: "default",
};

const LABOR_LAW_REQUIREMENT_BADGE_TONE: Record<
  HrmComplianceRequirementStatus,
  BadgeTone
> = {
  compliant: "default",
  pending: "attention",
  at_risk: "attention",
  overdue: "critical",
  expired: "critical",
  waived: "default",
  non_compliant: "critical",
};

export function resolveComplianceExceptionRowTone(input: {
  severity: string;
  status: string;
}): ComplianceListRowTone {
  const normalizedSeverity = input.severity.toLowerCase();
  const severityTone =
    COMPLIANCE_EXCEPTION_SEVERITY_ROW_TONE[normalizedSeverity] ?? "default";
  const statusTone =
    COMPLIANCE_EXCEPTION_STATUS_ROW_TONE[input.status] ?? "default";

  if (severityTone === "critical" || statusTone === "critical") {
    return "critical";
  }
  if (severityTone === "attention" || statusTone === "attention") {
    return "attention";
  }
  return "default";
}

export function resolveComplianceObligationStatusBadgeTone(
  status: string,
): "default" | "attention" {
  return COMPLIANCE_OBLIGATION_STATUS_BADGE_TONE[status] ?? "attention";
}

export function resolveComplianceExceptionSeverityBadgeTone(
  severity: string,
): BadgeTone {
  return COMPLIANCE_EXCEPTION_SEVERITY_BADGE_TONE[severity.toLowerCase()] ?? "default";
}

export function resolveLaborLawRequirementListBadgeTone(
  status: HrmComplianceRequirementStatus,
): BadgeTone {
  return LABOR_LAW_REQUIREMENT_BADGE_TONE[status];
}

export function formatComplianceListEnumCell(value: string): string {
  return formatComplianceEnumLabel(value);
}

export function buildComplianceListSearchToolbar(input: {
  param: string;
  label: string;
  placeholder: string;
  value?: string;
}) {
  return {
    search: {
      param: input.param,
      label: input.label,
      placeholder: input.placeholder,
      value: input.value,
    },
  };
}
