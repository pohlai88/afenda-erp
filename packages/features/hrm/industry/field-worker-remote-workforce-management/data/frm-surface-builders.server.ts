import "server-only"

import {
  GOVERNED_METADATA_SCHEMA_VERSION,
  buildGovernedListSurface,
  buildGovernedStatGrid,
  governedWorkbenchFocusPresentationPatch,
  listSurfaceHeader,
  resolveListSurfaceRowTrailingAction,
  type GovernedListSavedViewItem,
  type ListSurfaceRendererConfigurationInput,
  type StatCardConfigurationInput,
} from "@afenda/governed-surface"
import { hrmEmployeeListRowLinkFields } from "../../../_core/shared"

import { FRM_LIST_SURFACE_IDS } from "./frm-surface-metadata.shared"
import type { FrmOrgOverviewSummary } from "./frm-overview.server"
import type {
  FrmAssignmentRow,
  FrmExceptionRow,
  FrmPerDiemReferenceRow,
  FrmTravelStatusRow,
  FrmWorksiteRow,
} from "./frm.types.shared"

const FRM_READ_PERMISSION = {
  module: "hrm" as const,
  object: "field_workforce" as const,
  function: "read" as const,
}

export function buildFrmWorksitesListSurfaceConfiguration(
  rows: readonly FrmWorksiteRow[],
  copy: {
    empty: string
    colCode: string
    colName: string
    colType: string
    colLocation: string
    colRemote: string
    colActive: string
    yesNo: (value: boolean) => string
    formatLocation: (row: FrmWorksiteRow) => string
    formatType: (type: string) => string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = FRM_LIST_SURFACE_IDS.worksites
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    requiresErpPermission: FRM_READ_PERMISSION,
    presentationProfile: "erp-operational-table",
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "code", header: copy.colCode },
      { id: "name", header: copy.colName },
      { id: "type", header: copy.colType },
      { id: "location", header: copy.colLocation },
      {
        id: "remote",
        header: copy.colRemote,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "active",
        header: copy.colActive,
        cellKind: { kind: "badge", tone: "default" },
      },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        code: row.code,
        name: row.name,
        type: copy.formatType(row.worksiteType),
        location: copy.formatLocation(row),
        remote: copy.yesNo(row.approvedRemote),
        active: copy.yesNo(row.active),
      },
    })),
  })
}

export function buildFrmAssignmentsListSurfaceConfiguration(
  rows: readonly FrmAssignmentRow[],
  orgSlug: string,
  copy: {
    empty: string
    colEmployee: string
    colWorksite: string
    colType: string
    colStart: string
    colEnd: string
    colState: string
    formatType: (type: string) => string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = FRM_LIST_SURFACE_IDS.assignments
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    requiresErpPermission: FRM_READ_PERMISSION,
    presentationProfile: "erp-operational-table",
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "employee", header: copy.colEmployee },
      { id: "worksite", header: copy.colWorksite },
      { id: "type", header: copy.colType },
      { id: "start", header: copy.colStart },
      { id: "end", header: copy.colEnd },
      {
        id: "state",
        header: copy.colState,
        cellKind: { kind: "badge", tone: "default" },
      },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      ...hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee"),
      cells: {
        employee: row.employeeLabel,
        worksite: row.worksiteLabel,
        type: copy.formatType(row.assignmentType),
        start: row.startDate,
        end: row.endDate ?? "—",
        state: row.state,
      },
    })),
  })
}

export function buildFrmExceptionsListSurfaceConfiguration(
  rows: readonly FrmExceptionRow[],
  orgSlug: string,
  copy: {
    empty: string
    colEmployee: string
    colCode: string
    colDate: string
    colState: string
    formatCode: (code: string) => string
  },
  context?: {
    canManage?: boolean
    workbenchFocusSearch?: {
      label: string
      placeholder?: string
      value?: string | null
    }
    exceptionState?: string | null
    exceptionCode?: string | null
    exceptionSort?: "date-desc" | "employee-asc" | null
    savedViewItems?: readonly GovernedListSavedViewItem[]
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = FRM_LIST_SURFACE_IDS.exceptions
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    requiresErpPermission: FRM_READ_PERMISSION,
    presentationProfile: "erp-exception-table",
    presentation: governedWorkbenchFocusPresentationPatch(
      context?.workbenchFocusSearch ?? {
        label: "Search field exceptions",
        placeholder: "Search employee, code, date, or state",
      },
      {
        primaryColumnId: "employee",
        narrowMode: "auto",
        toolbar: {
          filters: [
            {
              id: "frm-exception-state",
              label: copy.colState,
              param: "frmExceptionState",
              ...(context?.exceptionState
                ? { value: context.exceptionState }
                : {}),
              options:
                rows.length > 0
                  ? Array.from(new Set(rows.map((row) => row.state)))
                      .sort()
                      .map((value) => ({ label: value, value }))
                  : [{ label: "All states", value: "all" }],
            },
            {
              id: "frm-exception-code",
              label: copy.colCode,
              param: "frmExceptionCode",
              ...(context?.exceptionCode
                ? { value: context.exceptionCode }
                : {}),
              options:
                rows.length > 0
                  ? Array.from(new Set(rows.map((row) => row.exceptionCode)))
                      .sort()
                      .map((value) => ({
                        label: copy.formatCode(value),
                        value,
                      }))
                  : [{ label: "All codes", value: "all" }],
            },
          ],
          sort: {
            label: "Sort",
            param: "frmExceptionSort",
            ...(context?.exceptionSort ? { value: context.exceptionSort } : {}),
            options: [
              {
                label: copy.colDate,
                value: "date-desc",
                columnId: "date",
                direction: "desc",
              },
              {
                label: copy.colEmployee,
                value: "employee-asc",
                columnId: "employee",
                direction: "asc",
              },
            ],
          },
          savedView: {
            label: "Exception view",
            activeLabel: "Open field exceptions",
            href: "?frmExceptionState=open",
            ...(context?.savedViewItems
              ? { items: Array.from(context.savedViewItems) }
              : {}),
          },
          bulkActions: [
            {
              actionId: "erp.hrm.field_workforce.exception.review-selected",
              label: "Review selected",
              disabledReason:
                "Select field exceptions before reviewing policy evidence.",
            },
          ],
        },
        ...(rows.length > 0
          ? {
              grouping: {
                groups: [
                  {
                    id: "frm-open-exceptions",
                    label: "Field exceptions",
                    rowIds: rows.map((row) => row.id),
                  },
                ],
              },
            }
          : {}),
      }
    ),
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      {
        id: "employee",
        header: copy.colEmployee,
        priority: "primary",
        pin: "start",
        wrap: true,
        minWidth: 220,
        cellKind: { kind: "link" },
      },
      { id: "code", header: copy.colCode },
      { id: "date", header: copy.colDate },
      {
        id: "state",
        header: copy.colState,
        cellKind: { kind: "badge", tone: "attention" },
      },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      ...hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee"),
      cells: {
        employee: row.employeeLabel,
        code: copy.formatCode(row.exceptionCode),
        date: row.exceptionDate,
        state: row.state,
      },
      rowTone: row.state === "open" ? "attention" : "default",
      decisionLedger: {
        reason: copy.formatCode(row.exceptionCode),
        policyLabel: "Field workforce policy",
        actorLabel: row.employeeLabel,
        occurredAt: row.exceptionDate,
        riskTone: row.state === "open" ? "attention" : "default",
        nextActionLabel: row.state,
      },
      trailingAction:
        context?.canManage === true && row.state === "open"
          ? resolveListSurfaceRowTrailingAction({
              visible: true,
              allowed: true,
            })
          : undefined,
    })),
  })
}

export function buildFrmTravelListSurfaceConfiguration(
  rows: readonly FrmTravelStatusRow[],
  orgSlug: string,
  copy: {
    empty: string
    colEmployee: string
    colClass: string
    colStart: string
    colDestination: string
    colState: string
    colCompliance: string
    formatClass: (value: string) => string
    formatDestination: (row: FrmTravelStatusRow) => string
    complianceLabel: (nonCompliant: boolean) => string
  },
  context?: {
    travelSearch?: string | null
    travelCompliance?: string | null
    travelSort?: "start-desc" | "employee-asc" | null
    savedViewItems?: readonly GovernedListSavedViewItem[]
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = FRM_LIST_SURFACE_IDS.travel
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    requiresErpPermission: FRM_READ_PERMISSION,
    presentationProfile: "erp-analytical-table",
    presentation: {
      primaryColumnId: "employee",
      toolbar: {
        search: {
          param: "frmTravelSearch",
          label: "Search travel",
          placeholder: "Search employee, destination, state, or compliance",
          ...(context?.travelSearch ? { value: context.travelSearch } : {}),
        },
        filters: [
          {
            id: "frm-travel-compliance",
            label: copy.colCompliance,
            param: "frmTravelCompliance",
            ...(context?.travelCompliance
              ? { value: context.travelCompliance }
              : {}),
            options: [
              { label: copy.complianceLabel(false), value: "compliant" },
              { label: copy.complianceLabel(true), value: "non_compliant" },
            ],
          },
        ],
        sort: {
          label: "Sort",
          param: "frmTravelSort",
          ...(context?.travelSort ? { value: context.travelSort } : {}),
          options: [
            {
              label: copy.colStart,
              value: "start-desc",
              columnId: "start",
              direction: "desc",
            },
            {
              label: copy.colEmployee,
              value: "employee-asc",
              columnId: "employee",
              direction: "asc",
            },
          ],
        },
        savedView: {
          label: "Travel view",
          activeLabel: "Travel compliance",
          href: "?frmTravelCompliance=non_compliant",
          ...(context?.savedViewItems
            ? { items: Array.from(context.savedViewItems) }
            : {}),
        },
        bulkActions: [
          {
            actionId: "erp.hrm.field_workforce.travel.review-selected",
            label: "Review selected",
            disabledReason:
              "Select travel rows before reviewing compliance evidence.",
          },
        ],
      },
    },
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      {
        id: "employee",
        header: copy.colEmployee,
        priority: "primary",
        pin: "start",
        wrap: true,
        minWidth: 220,
        cellKind: { kind: "link" },
      },
      { id: "class", header: copy.colClass },
      { id: "start", header: copy.colStart },
      { id: "destination", header: copy.colDestination },
      { id: "state", header: copy.colState },
      {
        id: "compliance",
        header: copy.colCompliance,
        cellKind: { kind: "badge", tone: "default" },
      },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      ...hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee"),
      cells: {
        employee: row.employeeLabel,
        class: copy.formatClass(row.travelClass),
        start: row.startDate,
        destination: copy.formatDestination(row),
        state: row.state,
        compliance: copy.complianceLabel(row.nonCompliant),
      },
      rowTone: row.nonCompliant ? "critical" : "default",
      decisionLedger: {
        reason: copy.formatDestination(row),
        policyLabel: "Travel and remote work compliance",
        actorLabel: row.employeeLabel,
        occurredAt: row.startDate,
        riskTone: row.nonCompliant ? "critical" : "positive",
        nextActionLabel: copy.complianceLabel(row.nonCompliant),
      },
    })),
  })
}

export function buildFrmPerDiemReferencesListSurfaceConfiguration(
  rows: readonly FrmPerDiemReferenceRow[],
  orgSlug: string,
  copy: {
    empty: string
    colEmployee: string
    colDate: string
    colPortion: string
    colAmount: string
    colState: string
    formatAmount: (row: FrmPerDiemReferenceRow) => string
  },
  context?: {
    perDiemSearch?: string | null
    perDiemState?: string | null
    perDiemSort?: "date-desc" | "amount-desc" | null
    savedViewItems?: readonly GovernedListSavedViewItem[]
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = FRM_LIST_SURFACE_IDS.perDiemReferences
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    requiresErpPermission: FRM_READ_PERMISSION,
    presentationProfile: "erp-operational-table",
    presentation: {
      primaryColumnId: "employee",
      narrowMode: "auto",
      toolbar: {
        search: {
          param: "frmPerDiemSearch",
          label: "Search per diem",
          placeholder: "Search employee, date, portion, or state",
          ...(context?.perDiemSearch ? { value: context.perDiemSearch } : {}),
        },
        filters: [
          {
            id: "frm-per-diem-state",
            label: copy.colState,
            param: "frmPerDiemState",
            ...(context?.perDiemState ? { value: context.perDiemState } : {}),
            options:
              rows.length > 0
                ? Array.from(new Set(rows.map((row) => row.state)))
                    .sort()
                    .map((value) => ({ label: value, value }))
                : [{ label: "All states", value: "all" }],
          },
        ],
        sort: {
          label: "Sort",
          param: "frmPerDiemSort",
          ...(context?.perDiemSort ? { value: context.perDiemSort } : {}),
          options: [
            {
              label: copy.colDate,
              value: "date-desc",
              columnId: "date",
              direction: "desc",
            },
            {
              label: copy.colAmount,
              value: "amount-desc",
              columnId: "amount",
              direction: "desc",
            },
          ],
        },
        savedView: {
          label: "Per diem view",
          activeLabel: "Per diem references",
          href: "?frmPerDiemSort=date-desc",
          ...(context?.savedViewItems
            ? { items: Array.from(context.savedViewItems) }
            : {}),
        },
      },
      decisionLedger: { enabled: true, label: "Per diem evidence" },
    },
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      {
        id: "employee",
        header: copy.colEmployee,
        priority: "primary",
        pin: "start",
        wrap: true,
        minWidth: 220,
        cellKind: { kind: "link" },
      },
      { id: "date", header: copy.colDate },
      { id: "portion", header: copy.colPortion },
      { id: "amount", header: copy.colAmount },
      {
        id: "state",
        header: copy.colState,
        cellKind: { kind: "badge", tone: "default" },
      },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      ...hrmEmployeeListRowLinkFields(orgSlug, row.employeeId, "employee"),
      cells: {
        employee: row.employeeLabel,
        date: row.eligibilityDate,
        portion: row.dayPortion,
        amount: copy.formatAmount(row),
        state: row.state,
      },
      decisionLedger: {
        reason: `${row.dayPortion} per diem`,
        policyLabel: "Per diem eligibility",
        actorLabel: row.employeeLabel,
        occurredAt: row.eligibilityDate,
        riskTone: row.state === "eligible" ? "positive" : "attention",
        nextActionLabel: row.state,
      },
    })),
  })
}

export function buildFrmOverviewKpiStatConfiguration(
  summary: FrmOrgOverviewSummary,
  copy: {
    activeAssignments: string
    openExceptions: string
    activeTravel: string
    nonCompliantTravel: string
  }
): StatCardConfigurationInput {
  return buildGovernedStatGrid({
    presentationProfile: "erp-executive-summary",
    dataNature: "snapshot-summary",
    stats: [
      {
        label: copy.activeAssignments,
        value: String(summary.activeAssignments),
        tone: "default",
        href: "#frm-assignments-section",
        icon: "users",
        progress: {
          value: summary.activeAssignments,
          max: Math.max(summary.activeAssignments + summary.openExceptions, 1),
          label: "Active assignment coverage",
        },
      },
      {
        label: copy.openExceptions,
        value: String(summary.openExceptions),
        tone: summary.openExceptions > 0 ? "attention" : "default",
        href: "#frm-exceptions-section",
        icon: "alert",
        comparison: {
          priorValue: String(summary.openExceptions),
          label: "currently open",
          direction: summary.openExceptions > 0 ? "up" : "flat",
        },
      },
      {
        label: copy.activeTravel,
        value: String(summary.activeTravel),
        tone: "default",
        href: "#frm-travel-section",
        icon: "activity",
      },
      {
        label: copy.nonCompliantTravel,
        value: String(summary.nonCompliantTravel),
        tone: summary.nonCompliantTravel > 0 ? "critical" : "default",
        href: "#frm-travel-section",
        icon: "shield",
        comparison: {
          priorValue: String(summary.nonCompliantTravel),
          label: "requiring compliance review",
          direction: summary.nonCompliantTravel > 0 ? "up" : "flat",
        },
      },
    ],
  })
}
