import "server-only"

import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"

import { LMS_AUDIT_TRAIL_LIST_COLUMNS_ID } from "../lms-audit-trail.shared"
import { lmsListHeader } from "../lms-list-surface.shared"
import type { LmsAuditTrailRow } from "./lms-audit-trail.server"

const LMS_AUDIT_PERMISSION = {
  module: "hrm" as const,
  object: "lms" as const,
  function: "audit" as const,
}

export type LmsAuditTrailListCopy = {
  empty: string
  colWhen: string
  colAction: string
  colActor: string
  colResource: string
  colMetadata: string
  formatAction: (action: string) => string
  formatActor: (row: LmsAuditTrailRow) => string
  formatResource: (row: LmsAuditTrailRow) => string
}

export function buildLmsAuditTrailListSurfaceConfiguration(
  rows: readonly LmsAuditTrailRow[],
  copy: LmsAuditTrailListCopy
): ListSurfaceRendererConfigurationInput {
  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "document-lines",
    presentationProfile: "erp-audit-ledger",
    requiresErpPermission: LMS_AUDIT_PERMISSION,
    presentation: {
      primaryColumnId: "action",
      narrowMode: "auto",
      toolbar: {
        search: {
          param: "lmsAuditSearch",
          label: "Search audit trail",
          placeholder: "Search action, actor, resource, or metadata",
        },
        filters: [
          {
            id: "lms-audit-action",
            label: copy.colAction,
            param: "lmsAuditAction",
            options:
              rows.length > 0
                ? Array.from(new Set(rows.map((row) => row.action)))
                    .sort()
                    .map((value) => ({
                      label: copy.formatAction(value),
                      value,
                    }))
                : [{ label: "All actions", value: "all" }],
          },
        ],
        sort: {
          label: "Sort",
          param: "lmsAuditSort",
          options: [
            {
              label: copy.colWhen,
              value: "created-desc",
              columnId: "createdAt",
              direction: "desc",
            },
          ],
        },
        savedView: {
          label: "Audit view",
          activeLabel: "LMS audit",
          href: "?lmsAuditSort=created-desc",
        },
      },
      decisionLedger: { enabled: true, label: "Audit evidence" },
    },
    surface: {
      header: lmsListHeader(LMS_AUDIT_TRAIL_LIST_COLUMNS_ID),
      columnsId: LMS_AUDIT_TRAIL_LIST_COLUMNS_ID,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "createdAt", header: copy.colWhen, cellKind: { kind: "datetime" } },
      {
        id: "action",
        header: copy.colAction,
        priority: "primary",
        pin: "start",
        wrap: true,
        minWidth: 220,
      },
      { id: "actor", header: copy.colActor },
      { id: "resource", header: copy.colResource },
      { id: "metadata", header: copy.colMetadata },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        createdAt: row.createdAt.toISOString(),
        action: copy.formatAction(row.action),
        actor: copy.formatActor(row),
        resource: copy.formatResource(row),
        metadata: row.metadataSummary ?? "—",
      },
      decisionLedger: {
        reason: copy.formatAction(row.action),
        policyLabel: "LMS audit ledger",
        actorLabel: copy.formatActor(row),
        occurredAt: row.createdAt.toISOString(),
        riskTone: "default",
        nextActionLabel: copy.formatResource(row),
      },
      trailingAction: { state: "hidden" as const },
    })),
  })
}
