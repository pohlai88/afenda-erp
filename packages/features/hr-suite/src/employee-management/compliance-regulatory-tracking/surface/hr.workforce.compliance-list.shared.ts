import type { HrComplianceRegulatoryCalendarEntryKind, HrComplianceAlertKind, HrComplianceAlertSeverity, HrComplianceAlertSourceKind } from "@afenda/db";

import type { HrmComplianceFilingEffectiveStatus } from "../data/hr.workforce.compliance-filing.shared";
import type { HrmComplianceRequirementStatus } from "../data/hr.workforce.compliance-status.shared";
import type { HrmComplianceWorkEligibilityStatus } from "../data/hr.workforce.compliance-work-eligibility.shared";
import type { HrmComplianceWorkAuthDocumentEffectiveStatus } from "../data/hr.workforce.compliance-work-auth-documents.shared";
import { formatComplianceEnumLabel } from "../schemas/hr.workforce.compliance-form.shared";

import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  resolveListSurfaceRowTrailingAction,
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

const COMPLIANCE_OBLIGATION_STATUS_ROW_TONE: Record<string, ComplianceListRowTone> =
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

const COMPLIANCE_EXCEPTION_STATUS_BADGE_TONE: Record<string, BadgeTone> = {
  open: "attention",
  in_progress: "attention",
  resolved: "default",
  closed: "default",
};

const REQUIREMENT_POSTURE_TONE: Record<
  HrmComplianceRequirementStatus,
  ComplianceListRowTone
> = {
  compliant: "default",
  pending: "attention",
  at_risk: "attention",
  overdue: "critical",
  expired: "critical",
  waived: "default",
  non_compliant: "critical",
};

const WORK_ELIGIBILITY_ROW_TONE: Record<
  HrmComplianceWorkEligibilityStatus,
  ComplianceListRowTone
> = {
  not_applicable: "default",
  pending_verification: "attention",
  eligible: "default",
  conditional: "attention",
  ineligible: "critical",
  expired: "critical",
};

const WORK_AUTH_DOCUMENT_ROW_TONE: Record<
  HrmComplianceWorkAuthDocumentEffectiveStatus,
  ComplianceListRowTone
> = {
  missing: "attention",
  pending_verification: "attention",
  verified: "default",
  rejected: "critical",
  waived: "default",
  expired: "critical",
  expiring: "attention",
};

const REGULATORY_CALENDAR_POSTURE_BADGE_TONE: Record<
  "upcoming" | "due_today" | "overdue",
  BadgeTone
> = {
  upcoming: "default",
  due_today: "attention",
  overdue: "critical",
};

const REGULATORY_CALENDAR_POSTURE_ROW_TONE: Record<
  "upcoming" | "due_today" | "overdue",
  ComplianceListRowTone
> = {
  upcoming: "default",
  due_today: "attention",
  overdue: "critical",
};

const FILING_BADGE_TONE: Record<HrmComplianceFilingEffectiveStatus, BadgeTone> = {
  pending: "attention",
  submitted: "default",
  confirmed: "default",
  overdue: "critical",
  waived: "default",
};

const FILING_ROW_TONE: Record<
  HrmComplianceFilingEffectiveStatus,
  ComplianceListRowTone
> = {
  pending: "attention",
  submitted: "default",
  confirmed: "default",
  overdue: "critical",
  waived: "default",
};

const COMPLIANCE_EXCEPTION_GAP_BADGE_TONE: Record<string, BadgeTone> = {
  missing: "attention",
  expired: "critical",
  overdue: "critical",
  failed: "critical",
};

export function resolveComplianceExceptionGapBadgeTone(
  gapKind: string | null | undefined,
): BadgeTone {
  if (!gapKind) {
    return "default";
  }
  return COMPLIANCE_EXCEPTION_GAP_BADGE_TONE[gapKind.toLowerCase()] ?? "default";
}

export function resolveComplianceExceptionRowTone(input: {
  severity: string;
  status: string;
  gapKind?: string | null;
}): ComplianceListRowTone {
  const gapTone = resolveComplianceExceptionGapBadgeTone(input.gapKind);
  const normalizedSeverity = input.severity.toLowerCase();
  const severityTone =
    COMPLIANCE_EXCEPTION_SEVERITY_ROW_TONE[normalizedSeverity] ?? "default";
  const statusTone =
    COMPLIANCE_EXCEPTION_STATUS_ROW_TONE[input.status] ?? "default";

  if (
    gapTone === "critical" ||
    severityTone === "critical" ||
    statusTone === "critical"
  ) {
    return "critical";
  }
  if (
    gapTone === "attention" ||
    severityTone === "attention" ||
    statusTone === "attention"
  ) {
    return "attention";
  }
  return "default";
}

export function resolveComplianceObligationStatusBadgeTone(
  status: string,
): "default" | "attention" {
  return COMPLIANCE_OBLIGATION_STATUS_BADGE_TONE[status] ?? "attention";
}

/** Obligation register row tone — archived obligations stay visually distinct. */
export function resolveComplianceObligationRowTone(
  status: string,
): ComplianceListRowTone {
  return COMPLIANCE_OBLIGATION_STATUS_ROW_TONE[status] ?? "attention";
}

export function resolveComplianceExceptionSeverityBadgeTone(
  severity: string,
): BadgeTone {
  return COMPLIANCE_EXCEPTION_SEVERITY_BADGE_TONE[severity.toLowerCase()] ?? "default";
}

export function resolveComplianceExceptionStatusBadgeTone(status: string): BadgeTone {
  return COMPLIANCE_EXCEPTION_STATUS_BADGE_TONE[status] ?? "default";
}

const REGULATORY_CALENDAR_ENTRY_KIND_BADGE_TONE: Record<
  HrComplianceRegulatoryCalendarEntryKind,
  BadgeTone
> = {
  filing: "attention",
  employee_requirement: "default",
  work_eligibility_renewal: "attention",
  work_auth_renewal: "attention",
  corrective_action: "critical",
};

/** HRM-CMP-010 — deadline type badge tone for calendar grid scanability. */
export function resolveRegulatoryCalendarEntryKindBadgeTone(
  entryKind: HrComplianceRegulatoryCalendarEntryKind,
): BadgeTone {
  return REGULATORY_CALENDAR_ENTRY_KIND_BADGE_TONE[entryKind];
}

export function resolveLaborLawRequirementListBadgeTone(
  status: HrmComplianceRequirementStatus,
): BadgeTone {
  return REQUIREMENT_POSTURE_TONE[status];
}

export function resolveSafetyTrainingRequirementListBadgeTone(
  status: HrmComplianceRequirementStatus,
): BadgeTone {
  return REQUIREMENT_POSTURE_TONE[status];
}

/** HRM-CMP-006 — shares HRM-CMP-015 posture badge mapping with labor law. */
export const resolveWorkplaceSafetyRequirementListBadgeTone =
  resolveLaborLawRequirementListBadgeTone;

/** HRM-CMP-008 — shares HRM-CMP-015 posture badge mapping with labor law. */
export const resolvePolicyAcknowledgementListBadgeTone =
  resolveLaborLawRequirementListBadgeTone;

/** HRM-CMP-015 — employee requirement row tone for operational table scanability. */
export function resolveRequirementListRowTone(
  status: HrmComplianceRequirementStatus,
): ComplianceListRowTone {
  return REQUIREMENT_POSTURE_TONE[status];
}

export function resolveWorkEligibilityListBadgeTone(
  status: HrmComplianceWorkEligibilityStatus,
): BadgeTone {
  return WORK_ELIGIBILITY_ROW_TONE[status];
}

/** HRM-CMP-007 — work eligibility row tone for operational table scanability. */
export function resolveWorkEligibilityListRowTone(
  status: HrmComplianceWorkEligibilityStatus,
): ComplianceListRowTone {
  return WORK_ELIGIBILITY_ROW_TONE[status];
}

export function resolveWorkAuthDocumentListBadgeTone(
  status: HrmComplianceWorkAuthDocumentEffectiveStatus,
): BadgeTone {
  return WORK_AUTH_DOCUMENT_ROW_TONE[status];
}

/** HRM-CMP-011 — work authorization row tone for operational table scanability. */
export function resolveWorkAuthDocumentListRowTone(
  status: HrmComplianceWorkAuthDocumentEffectiveStatus,
): ComplianceListRowTone {
  return WORK_AUTH_DOCUMENT_ROW_TONE[status];
}

/** HRM-CMP-010 — regulatory calendar deadline posture tones. */
export function resolveRegulatoryCalendarPostureBadgeTone(
  posture: "upcoming" | "due_today" | "overdue",
): BadgeTone {
  return REGULATORY_CALENDAR_POSTURE_BADGE_TONE[posture];
}

export function resolveRegulatoryCalendarPostureRowTone(
  posture: "upcoming" | "due_today" | "overdue",
): ComplianceListRowTone {
  return REGULATORY_CALENDAR_POSTURE_ROW_TONE[posture];
}

const COMPLIANCE_ALERT_SEVERITY_BADGE_TONE: Record<HrComplianceAlertSeverity, BadgeTone> =
  {
    critical: "critical",
    attention: "attention",
  };

const COMPLIANCE_ALERT_SEVERITY_ROW_TONE: Record<
  HrComplianceAlertSeverity,
  ComplianceListRowTone
> = {
  critical: "critical",
  attention: "attention",
};

const COMPLIANCE_ALERT_KIND_BADGE_TONE: Record<HrComplianceAlertKind, BadgeTone> = {
  deadline: "attention",
  renewal: "attention",
  expiry: "critical",
  overdue_action: "critical",
};

const COMPLIANCE_ALERT_SOURCE_KIND_BADGE_TONE: Record<
  HrComplianceAlertSourceKind,
  BadgeTone
> = {
  filing: "attention",
  employee_requirement: "default",
  work_eligibility_renewal: "attention",
  work_auth_renewal: "attention",
  work_auth_missing: "critical",
  corrective_action: "critical",
};

/** HRM-CMP-016 — alert severity badge tone for operational table scanability. */
export function resolveComplianceAlertSeverityBadgeTone(
  severity: HrComplianceAlertSeverity,
): BadgeTone {
  return COMPLIANCE_ALERT_SEVERITY_BADGE_TONE[severity];
}

export function resolveComplianceAlertSeverityRowTone(
  severity: HrComplianceAlertSeverity,
): ComplianceListRowTone {
  return COMPLIANCE_ALERT_SEVERITY_ROW_TONE[severity];
}

export function resolveComplianceAlertKindBadgeTone(
  alertKind: HrComplianceAlertKind,
): BadgeTone {
  return COMPLIANCE_ALERT_KIND_BADGE_TONE[alertKind];
}

export function resolveComplianceAlertSourceKindBadgeTone(
  sourceKind: HrComplianceAlertSourceKind,
): BadgeTone {
  return COMPLIANCE_ALERT_SOURCE_KIND_BADGE_TONE[sourceKind];
}

/** HRM-CMP-010 — badge tone for derived calendar source status by entry kind. */
export function resolveRegulatoryCalendarSourceStatusBadgeTone(input: {
  entryKind: HrComplianceRegulatoryCalendarEntryKind;
  effectiveSourceStatus: string;
}): BadgeTone {
  switch (input.entryKind) {
    case "filing":
      return resolveFilingListBadgeTone(
        input.effectiveSourceStatus as HrmComplianceFilingEffectiveStatus,
      );
    case "employee_requirement":
      return resolveLaborLawRequirementListBadgeTone(
        input.effectiveSourceStatus as HrmComplianceRequirementStatus,
      );
    case "work_eligibility_renewal":
      return resolveWorkEligibilityListBadgeTone(
        input.effectiveSourceStatus as HrmComplianceWorkEligibilityStatus,
      );
    case "work_auth_renewal":
      return resolveWorkAuthDocumentListBadgeTone(
        input.effectiveSourceStatus as HrmComplianceWorkAuthDocumentEffectiveStatus,
      );
    case "corrective_action":
      return (
        COMPLIANCE_EXCEPTION_STATUS_BADGE_TONE[input.effectiveSourceStatus] ??
        "default"
      );
    default: {
      const exhaustive: never = input.entryKind;
      return exhaustive;
    }
  }
}

export function resolveFilingListBadgeTone(
  status: HrmComplianceFilingEffectiveStatus,
): BadgeTone {
  return FILING_BADGE_TONE[status];
}

/** HRM-CMP-009 — filing row tone for operational table scanability. */
export function resolveFilingListRowTone(
  status: HrmComplianceFilingEffectiveStatus,
): ComplianceListRowTone {
  return FILING_ROW_TONE[status];
}

/** Work authorization documents hide trailing updates for active verified or waived rows. */
export function resolveWorkAuthDocumentListTrailingAction(
  canWrite: boolean,
  effectiveStatus: HrmComplianceWorkAuthDocumentEffectiveStatus,
) {
  if (!canWrite) {
    return undefined;
  }

  return resolveListSurfaceRowTrailingAction({
    visible: effectiveStatus !== "verified" && effectiveStatus !== "waived",
    allowed: true,
  });
}

/** Work eligibility hides trailing updates for eligible or not-applicable posture. */
export function resolveWorkEligibilityListTrailingAction(
  canWrite: boolean,
  effectiveStatus: HrmComplianceWorkEligibilityStatus,
) {
  if (!canWrite) {
    return undefined;
  }

  return resolveListSurfaceRowTrailingAction({
    visible:
      effectiveStatus !== "eligible" && effectiveStatus !== "not_applicable",
    allowed: true,
  });
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

/** Certification-tracked requirement lists keep trailing actions visible for renewals. */
export function resolveCertificationTrackedListTrailingAction(canWrite: boolean) {
  return canWrite
    ? resolveListSurfaceRowTrailingAction({
        visible: true,
        allowed: true,
      })
    : undefined;
}

/** Labor law lists hide trailing updates once a requirement is compliant. */
export function resolveLaborLawRequirementListTrailingAction(
  canWrite: boolean,
  effectiveStatus: HrmComplianceRequirementStatus,
) {
  if (!canWrite) {
    return undefined;
  }

  return resolveListSurfaceRowTrailingAction({
    visible: effectiveStatus !== "compliant",
    allowed: true,
  });
}

/** HRM-CMP-008 — policy acknowledgments hide trailing updates once acknowledged or waived. */
export function resolvePolicyAcknowledgementListTrailingAction(
  canWrite: boolean,
  effectiveStatus: HrmComplianceRequirementStatus,
) {
  if (!canWrite) {
    return undefined;
  }

  return resolveListSurfaceRowTrailingAction({
    visible:
      effectiveStatus !== "compliant" && effectiveStatus !== "waived",
    allowed: true,
  });
}

/** HRM-CMP-009 — filings hide trailing updates once confirmed or waived. */
export function resolveFilingListTrailingAction(
  canWrite: boolean,
  effectiveStatus: HrmComplianceFilingEffectiveStatus,
) {
  if (!canWrite) {
    return undefined;
  }

  return resolveListSurfaceRowTrailingAction({
    visible: effectiveStatus !== "confirmed" && effectiveStatus !== "waived",
    allowed: true,
  });
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
