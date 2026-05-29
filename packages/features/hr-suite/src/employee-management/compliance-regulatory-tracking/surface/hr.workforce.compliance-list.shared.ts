import type { HrmComplianceRequirementStatus } from "../data/hr.workforce.compliance-status.shared";
import type { HrmComplianceWorkEligibilityStatus } from "../data/hr.workforce.compliance-work-eligibility.shared";
import { formatComplianceEnumLabel } from "../schemas/hr.workforce.compliance-form.shared";

import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface";
import type { ListSurfaceRendererConfigurationInput } from "@afenda/governed-surface/schemas";

import { hrWorkforceComplianceReadPermission } from "../contracts/hr.workforce.compliance.contract";

export type ComplianceListWindow = {
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

type ComplianceListColumn = ListSurfaceRendererConfigurationInput["columns"][number];
type ComplianceListRow = ListSurfaceRendererConfigurationInput["rows"][number];

export function buildComplianceOperationalListSurface(input: {
  primaryColumnId: string;
  searchToolbar: ReturnType<typeof buildComplianceListSearchToolbar>;
  window: ComplianceListWindow;
  surface: {
    headerTitle: string;
    columnsId: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  columns: ComplianceListColumn[];
  rows: ComplianceListRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: hrWorkforceComplianceReadPermission,
    presentation: {
      primaryColumnId: input.primaryColumnId,
      toolbar: input.searchToolbar,
    },
    pagination: {
      pageSize: input.window.pageSize,
      totalCount: input.window.totalCount,
      hasNextPage: input.window.hasNextPage,
    },
    surface: {
      header: { title: input.surface.headerTitle },
      columnsId: input.surface.columnsId,
      rowKey: "id",
      empty: {
        variant: "muted",
        title: input.surface.emptyTitle,
        description: input.surface.emptyDescription,
      },
    },
    columns: input.columns,
    rows: input.rows,
  });
}

export type ComplianceListRowTone = NonNullable<ComplianceListRow["rowTone"]>;

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

const WORK_ELIGIBILITY_BADGE_TONE: Record<
  HrmComplianceWorkEligibilityStatus,
  BadgeTone
> = {
  not_applicable: "default",
  pending_verification: "attention",
  eligible: "default",
  conditional: "attention",
  ineligible: "critical",
  expired: "critical",
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

export function resolveWorkEligibilityListBadgeTone(
  status: HrmComplianceWorkEligibilityStatus,
): BadgeTone {
  return WORK_ELIGIBILITY_BADGE_TONE[status];
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

export function formatComplianceEmployeeListCell(input: {
  employeeNumber: string | null | undefined;
  employeeDisplayName: string | null | undefined;
  style?: "number-first" | "name-first";
}): string {
  if (!input.employeeDisplayName) {
    return "—";
  }

  if (!input.employeeNumber) {
    return input.employeeDisplayName;
  }

  return input.style === "name-first"
    ? `${input.employeeDisplayName} · ${input.employeeNumber}`
    : `${input.employeeNumber} · ${input.employeeDisplayName}`;
}
