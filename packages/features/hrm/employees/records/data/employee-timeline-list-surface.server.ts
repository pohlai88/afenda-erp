import "server-only"

import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"

import type { EmployeeIamAuditTimelineRow } from "../../../_core/shared"

import {
  buildEmployeeTimelineMetadataView,
  type EmployeeTimelineFacetLabelKey,
} from "./employee-timeline-metadata.shared"

const EMPLOYEE_READ_PERMISSION = {
  module: "hrm" as const,
  object: "employee" as const,
  function: "read" as const,
}

type EmployeeTimelineListCopy = {
  empty: string
  colAction: string
  colWhen: string
  colActor: string
  colDetails: string
  actionLabelFor: (action: string) => string
  formatWhen: (value: Date) => string
  actorLabelFor: (row: EmployeeIamAuditTimelineRow) => string
  facetLabelFor: (labelKey: EmployeeTimelineFacetLabelKey) => string
  formatFacetValue: (
    labelKey: EmployeeTimelineFacetLabelKey,
    value: string
  ) => string
  actorUnknown: string
}

function shortId(id: string | null): string | null {
  if (!id) return null
  if (id.length <= 12) return id
  return `${id.slice(0, 8)}…`
}

function formatDetails(
  row: EmployeeIamAuditTimelineRow,
  copy: EmployeeTimelineListCopy
): string {
  const metaView = buildEmployeeTimelineMetadataView(row.metadata)
  const resourceBits = [row.resourceType, shortId(row.resourceId)]
    .filter(Boolean)
    .join(" · ")
  const facetSummary =
    metaView.facets.length > 0
      ? metaView.facets
          .map(
            (facet) =>
              `${copy.facetLabelFor(facet.labelKey)}: ${copy.formatFacetValue(facet.labelKey, facet.value)}`
          )
          .join(" · ")
      : null
  return [metaView.narrative, resourceBits, facetSummary]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(" — ")
}

function employeeTimelineRowTone(
  action: string
): "default" | "attention" | "critical" {
  switch (action) {
    case "erp.hrm.employee.archive":
    case "erp.hrm.contract.terminate":
      return "critical"
    case "erp.hrm.employee.update":
    case "erp.hrm.contract.activate":
    case "erp.hrm.payroll_profile.upsert":
    case "erp.hrm.document.attach":
      return "attention"
    default:
      return "default"
  }
}

export function buildEmployeeTimelineListSurfaceConfiguration(
  rows: readonly EmployeeIamAuditTimelineRow[],
  copy: EmployeeTimelineListCopy
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "document-lines",
    presentationProfile: "erp-audit-ledger",
    requiresErpPermission: EMPLOYEE_READ_PERMISSION,
    presentation: {
      primaryColumnId: "action",
      narrowMode: "auto",
      toolbar: {
        search: {
          param: "employeeTimelineSearch",
          label: "Search timeline",
          placeholder: "Search event, actor, resource, or detail",
        },
        filters: [
          {
            id: "employee-timeline-action",
            label: copy.colAction,
            param: "employeeTimelineAction",
            options:
              rows.length > 0
                ? Array.from(new Set(rows.map((row) => row.action)))
                    .sort()
                    .map((value) => ({
                      label: copy.actionLabelFor(value),
                      value,
                    }))
                : [{ label: "All events", value: "all" }],
          },
        ],
        sort: {
          label: "Sort",
          param: "employeeTimelineSort",
          options: [
            {
              label: copy.colWhen,
              value: "created-desc",
              columnId: "when",
              direction: "desc",
            },
          ],
        },
        savedView: {
          label: "Timeline view",
          activeLabel: "Employee audit",
          href: "?employeeTimelineSort=created-desc",
        },
      },
      decisionLedger: { enabled: true, label: "Audit evidence" },
    },
    surface: {
      header: { title: "hrm-employee-timeline" },
      columnsId: "hrm-employee-timeline",
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      {
        id: "action",
        header: copy.colAction,
        priority: "primary",
        pin: "start",
        wrap: true,
        minWidth: 220,
      },
      {
        id: "when",
        header: copy.colWhen,
        cellKind: { kind: "datetime" },
      },
      { id: "actor", header: copy.colActor },
      { id: "details", header: copy.colDetails, wrap: true },
    ],
    rows: rows.map((row) => {
      const actionLabel = copy.actionLabelFor(row.action)
      const details = formatDetails(row, copy) || "—"
      const tone = employeeTimelineRowTone(row.action)
      return {
        id: row.id,
        rowTone: tone,
        cells: {
          action: actionLabel,
          when: row.createdAt.toISOString(),
          actor: copy.actorLabelFor(row),
          details,
        },
        decisionLedger: {
          reason: actionLabel,
          policyLabel: "Employee audit ledger",
          actorLabel: copy.actorLabelFor(row),
          occurredAt: row.createdAt.toISOString(),
          riskTone: tone,
          nextActionLabel: details,
        },
      }
    }),
  })
}
