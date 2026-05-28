import "server-only"

import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"

import type {
  ComplianceTimelineEntry,
  ComplianceTimelineKind,
} from "./compliance-timeline.shared"
import {
  complianceTimelineRowTone,
  formatComplianceTimelineEntryDetails,
  type ComplianceTimelineFacetLabels,
} from "./compliance-timeline-entry-details.shared"

const COMPLIANCE_READ_PERMISSION = {
  module: "hrm" as const,
  object: "compliance" as const,
  function: "read" as const,
}

type ComplianceEvidenceTimelineListCopy = {
  empty: string
  colKind: string
  colWhen: string
  colActor: string
  colDetails: string
  kindLabelFor: (kind: ComplianceTimelineKind) => string
  actorLabelFor: (entry: ComplianceTimelineEntry) => string
  facetLabels: ComplianceTimelineFacetLabels
}

export function buildComplianceEvidenceTimelineListSurfaceConfiguration(
  entries: readonly ComplianceTimelineEntry[],
  packType: string | null,
  copy: ComplianceEvidenceTimelineListCopy
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "document-lines",
    presentationProfile: "erp-audit-ledger",
    requiresErpPermission: COMPLIANCE_READ_PERMISSION,
    presentation: {
      primaryColumnId: "kind",
      narrowMode: "auto",
      decisionLedger: { enabled: true, label: "Compliance chronology" },
    },
    surface: {
      header: { title: "hrm-compliance-evidence-timeline" },
      columnsId: "hrm-compliance-evidence-timeline",
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      {
        id: "kind",
        header: copy.colKind,
        priority: "primary",
        pin: "start",
        wrap: true,
        minWidth: 200,
      },
      {
        id: "when",
        header: copy.colWhen,
        cellKind: { kind: "datetime" },
      },
      { id: "actor", header: copy.colActor },
      { id: "details", header: copy.colDetails, wrap: true },
    ],
    rows: entries.map((entry) => {
      const kindLabel = copy.kindLabelFor(entry.kind)
      const details = formatComplianceTimelineEntryDetails(
        entry,
        packType,
        copy.facetLabels
      )
      const tone = complianceTimelineRowTone(entry.kind)
      return {
        id: entry.id,
        rowTone: tone,
        cells: {
          kind: kindLabel,
          when: entry.occurredAt.toISOString(),
          actor: copy.actorLabelFor(entry),
          details,
        },
        decisionLedger: {
          reason: kindLabel,
          policyLabel: "Statutory evidence timeline",
          actorLabel: copy.actorLabelFor(entry),
          occurredAt: entry.occurredAt.toISOString(),
          riskTone: tone,
          nextActionLabel: details,
        },
      }
    }),
  })
}
