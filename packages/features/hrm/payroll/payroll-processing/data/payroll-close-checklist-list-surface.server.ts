import "server-only"

import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  listSurfaceHeader,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"

import type { PayrollCloseChecklistItem } from "./payroll-close.shared"

const PAYROLL_READ_PERMISSION = {
  module: "hrm" as const,
  object: "payroll" as const,
  function: "read" as const,
}

type PayrollCloseChecklistListCopy = {
  empty: string
  colItem: string
  colStatus: string
  statusLabelFor: (status: PayrollCloseChecklistItem["status"]) => string
}

export function buildPayrollCloseChecklistListSurfaceConfiguration(
  items: readonly PayrollCloseChecklistItem[],
  copy: PayrollCloseChecklistListCopy
): ListSurfaceRendererConfigurationInput {
  const columnsId = "hrm-payroll-close-checklist"
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: PAYROLL_READ_PERMISSION,
    presentation: {
      primaryColumnId: "item",
      narrowMode: "auto",
      toolbar: {
        search: {
          param: "payrollCloseSearch",
          label: "Search close checklist",
          placeholder: "Search item or status",
        },
        filters: [
          {
            id: "payroll-close-status",
            label: copy.colStatus,
            param: "payrollCloseStatus",
            options: [
              { label: copy.statusLabelFor("blocked"), value: "blocked" },
              { label: copy.statusLabelFor("pending"), value: "pending" },
              { label: copy.statusLabelFor("warning"), value: "warning" },
              { label: copy.statusLabelFor("passed"), value: "passed" },
            ],
          },
        ],
        sort: {
          label: "Sort",
          param: "payrollCloseSort",
          options: [
            {
              label: copy.colItem,
              value: "item-asc",
              columnId: "item",
              direction: "asc",
            },
            {
              label: copy.colStatus,
              value: "status-asc",
              columnId: "status",
              direction: "asc",
            },
          ],
        },
        savedView: {
          label: "Close view",
          activeLabel: "Close checklist",
          href: "?payrollCloseStatus=pending",
        },
        export: {
          actionId: "erp.hrm.payroll.close.export-checklist",
          label: "Export checklist",
          formats: ["csv"],
        },
        bulkActions: [
          {
            actionId: "erp.hrm.payroll.close.review-selected",
            label: "Review selected",
            disabledReason: "Select checklist rows to review blockers.",
          },
        ],
      },
      selection: {
        mode: "multiple",
        label: "Select close checklist rows",
        bulkScopeLabel: "selected checklist rows",
      },
      decisionLedger: { enabled: true, label: "Close evidence" },
    },
    surface: {
      header: listSurfaceHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      {
        id: "item",
        header: copy.colItem,
        priority: "primary",
        pin: "start",
        wrap: true,
        minWidth: 260,
        resizable: true,
      },
      {
        id: "status",
        header: copy.colStatus,
        cellKind: { kind: "badge", tone: "attention" },
        priority: "secondary",
      },
    ],
    rows: items.map((item) => ({
      id: item.id,
      rowTone:
        item.status === "blocked"
          ? "critical"
          : item.status === "pending" || item.status === "warning"
            ? "attention"
            : "default",
      cells: {
        item: `${item.label} — ${item.detail}`,
        status: copy.statusLabelFor(item.status),
      },
      decisionLedger: {
        reason: item.detail,
        policyLabel: "Payroll close checklist",
        actorLabel: "Payroll control",
        riskTone:
          item.status === "blocked"
            ? "critical"
            : item.status === "pending" || item.status === "warning"
              ? "attention"
              : "positive",
        nextActionLabel: copy.statusLabelFor(item.status),
      },
    })),
  })
}
