import "server-only"

import {
  buildGovernedWorkbenchFocusSearchPresentation,
  GOVERNED_METADATA_SCHEMA_VERSION,
  listSurfaceRowTrailingActionHidden,
  resolveListSurfaceRowTrailingAction,
  type ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface"
import { TCI_LIST_SURFACE_IDS } from "../tci-surface-metadata.shared"
import {
  formatTciEmployeeCell,
  buildTciListSurface,
  TCI_READ_PERMISSION,
  tciEmployeeRowLinkFields,
  tciListHeader,
  toTciDateTimeCell,
} from "./_shared.server"
import type { TimeClockSyncMonitoringRow } from "../tci-sync-monitoring.server"
import type {
  TimeClockExceptionRow,
  TimeClockPunchRecordRow,
  TimeClockSyncBatchRow,
} from "../tci.queries.server"

export function buildTimeClockPunchRecordsListSurfaceConfiguration(
  rows: readonly TimeClockPunchRecordRow[],
  copy: {
    empty: string
    colOccurredAt: string
    colEmployee: string
    colDevice: string
    colEventType: string
    colSourceRef: string
    formatEventType: (eventType: string) => string
  },
  options?: { orgSlug?: string }
): ListSurfaceRendererConfigurationInput {
  const columnsId = TCI_LIST_SURFACE_IDS.punchRecords
  return buildTciListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    requiresErpPermission: TCI_READ_PERMISSION,
    presentationProfile: "erp-analytical-table",
    surface: {
      header: tciListHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      {
        id: "occurredAt",
        header: copy.colOccurredAt,
        cellKind: { kind: "datetime" },
      },
      {
        id: "employee",
        header: copy.colEmployee,
        cellKind: options?.orgSlug ? { kind: "link" } : undefined,
      },
      { id: "device", header: copy.colDevice },
      {
        id: "eventType",
        header: copy.colEventType,
        cellKind: { kind: "badge", tone: "default" },
      },
      { id: "sourceRef", header: copy.colSourceRef },
    ],
    rows: rows.map((row) => {
      const device =
        row.deviceName != null && row.externalDeviceId != null
          ? `${row.deviceName} (${row.externalDeviceId})`
          : (row.deviceName ?? "—")
      return {
        id: row.id,
        cells: {
          occurredAt: row.occurredAt.toISOString(),
          employee: formatTciEmployeeCell(row),
          device,
          eventType: copy.formatEventType(row.eventType),
          sourceRef: row.sourceRef ?? "—",
        },
        ...tciEmployeeRowLinkFields(options?.orgSlug, row),
        trailingAction: listSurfaceRowTrailingActionHidden(),
      }
    }),
  })
}

export function buildTimeClockBreakPunchRecordsListSurfaceConfiguration(
  rows: readonly TimeClockPunchRecordRow[],
  copy: {
    empty: string
    colOccurredAt: string
    colEmployee: string
    colDevice: string
    colEventType: string
    colSourceRef: string
    formatEventType: (eventType: string) => string
  },
  options?: { orgSlug?: string }
): ListSurfaceRendererConfigurationInput {
  const columnsId = TCI_LIST_SURFACE_IDS.breakPunchRecords
  return buildTciListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    requiresErpPermission: TCI_READ_PERMISSION,
    surface: {
      header: tciListHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      {
        id: "occurredAt",
        header: copy.colOccurredAt,
        cellKind: { kind: "datetime" },
      },
      {
        id: "employee",
        header: copy.colEmployee,
        cellKind: options?.orgSlug ? { kind: "link" } : undefined,
      },
      { id: "device", header: copy.colDevice },
      {
        id: "eventType",
        header: copy.colEventType,
        cellKind: { kind: "badge", tone: "default" },
      },
      { id: "sourceRef", header: copy.colSourceRef },
    ],
    rows: rows.map((row) => {
      const device =
        row.deviceName != null && row.externalDeviceId != null
          ? `${row.deviceName} (${row.externalDeviceId})`
          : (row.deviceName ?? "—")
      return {
        id: row.id,
        cells: {
          occurredAt: row.occurredAt.toISOString(),
          employee: formatTciEmployeeCell(row),
          device,
          eventType: copy.formatEventType(row.eventType),
          sourceRef: row.sourceRef ?? "—",
        },
        ...tciEmployeeRowLinkFields(options?.orgSlug, row),
        trailingAction: listSurfaceRowTrailingActionHidden(),
      }
    }),
  })
}

export function buildTimeClockSyncBatchesListSurfaceConfiguration(
  rows: readonly TimeClockSyncBatchRow[],
  copy: {
    empty: string
    colStarted: string
    colFinished: string
    colSource: string
    colDevice: string
    colState: string
    colReceived: string
    colAccepted: string
    colDuplicates: string
    colRejected: string
    formatSourceKind: (sourceKind: string) => string
    formatBatchState: (state: string) => string
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = TCI_LIST_SURFACE_IDS.syncBatches
  return buildTciListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    requiresErpPermission: TCI_READ_PERMISSION,
    surface: {
      header: tciListHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      {
        id: "started",
        header: copy.colStarted,
        cellKind: { kind: "datetime" },
      },
      {
        id: "finished",
        header: copy.colFinished,
        cellKind: { kind: "datetime" },
      },
      { id: "source", header: copy.colSource },
      { id: "device", header: copy.colDevice },
      {
        id: "state",
        header: copy.colState,
        cellKind: { kind: "badge", tone: "default" },
      },
      { id: "received", header: copy.colReceived },
      { id: "accepted", header: copy.colAccepted },
      { id: "duplicates", header: copy.colDuplicates },
      { id: "rejected", header: copy.colRejected },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      cells: {
        started: row.startedAt != null ? row.startedAt.toISOString() : "—",
        finished: row.finishedAt != null ? row.finishedAt.toISOString() : "—",
        source: copy.formatSourceKind(row.sourceKind),
        device: row.deviceName ?? "—",
        state: copy.formatBatchState(row.state),
        received: String(row.receivedCount),
        accepted: String(row.acceptedCount),
        duplicates: String(row.duplicateCount),
        rejected: String(row.rejectedCount),
      },
      trailingAction: listSurfaceRowTrailingActionHidden(),
    })),
  })
}

export function buildTimeClockSyncMonitoringFindingsListSurfaceConfiguration(
  rows: readonly TimeClockSyncMonitoringRow[],
  copy: {
    empty: string
    colDevice: string
    colExternalId: string
    colType: string
    colLocation: string
    colSyncStatus: string
    colLastSync: string
    colAttention: string
    formatAttention: (kind: string) => string
    formatDeviceType: (deviceType: string) => string
  },
  options?: {
    workbenchFocusSearch?: {
      label: string
      placeholder?: string
      value?: string | null
    }
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = TCI_LIST_SURFACE_IDS.syncMonitoringFindings
  return buildTciListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-exception-table",
    presentation: options?.workbenchFocusSearch
      ? buildGovernedWorkbenchFocusSearchPresentation(
          options.workbenchFocusSearch
        )
      : undefined,
    requiresErpPermission: TCI_READ_PERMISSION,
    surface: {
      header: tciListHeader(columnsId),
      columnsId,
      rowKey: "id",
      empty: { variant: "muted", title: copy.empty },
    },
    columns: [
      { id: "device", header: copy.colDevice },
      { id: "externalId", header: copy.colExternalId },
      { id: "type", header: copy.colType },
      { id: "location", header: copy.colLocation },
      {
        id: "syncStatus",
        header: copy.colSyncStatus,
        cellKind: { kind: "badge", tone: "critical" },
      },
      {
        id: "lastSync",
        header: copy.colLastSync,
        cellKind: { kind: "datetime" },
      },
      {
        id: "attention",
        header: copy.colAttention,
        cellKind: { kind: "badge", tone: "attention" },
      },
    ],
    rows: rows.map((row) => ({
      id: row.id,
      rowTone:
        row.attentionKind === "failed"
          ? "critical"
          : row.attentionKind === "stale_syncing"
            ? "attention"
            : "default",
      cells: {
        device: row.name,
        externalId: row.externalDeviceId,
        type: copy.formatDeviceType(row.deviceType),
        location: row.locationRef ?? "—",
        syncStatus: row.syncStatus,
        lastSync: toTciDateTimeCell(row.lastSyncAt),
        attention: copy.formatAttention(row.attentionKind),
      },
      trailingAction: listSurfaceRowTrailingActionHidden(),
    })),
  })
}

export function buildTimeClockExceptionsListSurfaceConfiguration(
  rows: readonly TimeClockExceptionRow[],
  copy: {
    empty: string
    colEmployee: string
    colDevice: string
    colEvent: string
    colOutcome: string
    colOccurred: string
    formatDetectionOutcome: (outcome: string) => string
    formatEventType: (eventType: string) => string
    decideLabel: string
    correctLabel: string
  },
  options: {
    canDecide: boolean
    canCorrect?: boolean
    orgSlug?: string
    workbenchFocusSearch?: {
      label: string
      placeholder?: string
      value?: string | null
    }
  }
): ListSurfaceRendererConfigurationInput {
  const columnsId = TCI_LIST_SURFACE_IDS.exceptions
  const outcomeColumnTone = rows.some(
    (row) =>
      row.detectionOutcome === "requires_review" ||
      row.detectionOutcome === "duplicate_punch"
  )
    ? "attention"
    : rows.some((row) => row.detectionOutcome === "rejected")
      ? "critical"
      : "default"
  return buildTciListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-analytical-table",
    presentation: {
      ...(options.workbenchFocusSearch
        ? buildGovernedWorkbenchFocusSearchPresentation(
            options.workbenchFocusSearch
          )
        : {}),
      primaryColumnId: "employee",
      ...(rows.length > 0
        ? {
            grouping: {
              groups: [
                {
                  id: "tci-exceptions-review",
                  label: "Exception review queue",
                  rowIds: rows.map((row) => row.id),
                },
              ],
            },
            summary: {
              rows: [
                {
                  id: "tci-exceptions-summary",
                  label: "Total",
                  cells: {
                    employee: `${rows.length} exceptions`,
                    outcome: `${rows.filter((row) => row.detectionOutcome === "requires_review").length} reviews`,
                    occurred: `${rows.filter((row) => row.detectionOutcome === "rejected").length} rejected`,
                  },
                },
              ],
            },
          }
        : {}),
    },
    requiresErpPermission: TCI_READ_PERMISSION,
    surface: {
      header: tciListHeader(columnsId),
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
        cellKind: options.orgSlug ? { kind: "link" } : undefined,
      },
      { id: "device", header: copy.colDevice, priority: "secondary" },
      { id: "event", header: copy.colEvent, wrap: true },
      {
        id: "outcome",
        header: copy.colOutcome,
        cellKind: { kind: "badge", tone: outcomeColumnTone },
      },
      {
        id: "occurred",
        header: copy.colOccurred,
        cellKind: { kind: "datetime" },
      },
    ],
    rows: rows.map((row) => {
      const showDecide = options.canDecide && row.state === "submitted"
      const showCorrect =
        options.canCorrect === true &&
        row.state === "approved" &&
        row.resolvedEventId != null

      const trailingAction =
        showDecide || showCorrect
          ? resolveListSurfaceRowTrailingAction({
              allowed: true,
              descriptor: {
                id: showDecide
                  ? "erp.hrm.time_clock.exception.decide"
                  : "erp.hrm.attendance.correction",
                label: showDecide ? copy.decideLabel : copy.correctLabel,
                intent: showDecide ? "approval" : "default",
              },
            })
          : listSurfaceRowTrailingActionHidden()

      const rowTone =
        row.detectionOutcome === "rejected"
          ? "critical"
          : row.detectionOutcome === "requires_review" ||
              row.detectionOutcome === "duplicate_punch"
            ? "attention"
            : "default"

      return {
        id: row.id,
        rowTone,
        cells: {
          employee: formatTciEmployeeCell(row),
          device: row.deviceName ?? "—",
          event: copy.formatEventType(row.eventType),
          outcome: copy.formatDetectionOutcome(row.detectionOutcome),
          occurred: row.occurredAt.toISOString(),
        },
        decisionLedger: {
          reason: copy.formatDetectionOutcome(row.detectionOutcome),
          policyLabel: "Time clock exception detection",
          actorLabel: "TCI detection engine",
          occurredAt: row.occurredAt.toISOString(),
          riskTone: rowTone === "critical" ? "critical" : rowTone,
          nextActionLabel: showDecide
            ? copy.decideLabel
            : showCorrect
              ? copy.correctLabel
              : "Monitor exception state",
        },
        ...tciEmployeeRowLinkFields(options.orgSlug, row),
        trailingAction,
      }
    }),
  })
}
