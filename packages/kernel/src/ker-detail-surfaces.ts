import type { ModuleId } from "@afenda/config/module-ids";
import {
  GOVERNED_METADATA_SCHEMA_VERSION,
  type AuditPanelModel,
  type GovernedDetailTabsInput,
} from "./ker-governed-surface-contract";

import type {
  ModuleWorkspaceRecordDetail,
  ModuleWorkspaceWorkItemDetail,
} from "./index";

const metadataNumberFormatter = new Intl.NumberFormat("en-MY", {
  maximumFractionDigits: 2,
});

const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const RAW_NUMBER = /^-?\d+(?:\.\d+)?$/;

function formatMetadataStatValue(value: unknown) {
  if (value == null) {
    return "Not set";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return `${metadataNumberFormatter.format(value)} units`;
  }

  const text = String(value).trim();
  if (text.length === 0) {
    return "Not set";
  }

  if (ISO_DATE_ONLY.test(text)) {
    const parsedDate = new Date(`${text}T00:00:00.000Z`);

    if (!Number.isNaN(parsedDate.getTime())) {
      return new Intl.DateTimeFormat("en-MY", {
        dateStyle: "medium",
        timeZone: "UTC",
      }).format(parsedDate);
    }
  }

  if (RAW_NUMBER.test(text)) {
    const parsedNumber = Number(text);

    if (Number.isFinite(parsedNumber)) {
      return `${metadataNumberFormatter.format(parsedNumber)} units`;
    }
  }

  return text;
}

/**
 * Builds a governed detail-tabs model for a module record.
 *
 * The overview tab presents core record fields via a stat-card section.
 * The audit tab is wired from the pre-built `auditPanel` on the record.
 * Extension metadata is surfaced as additional stat-card slots.
 */
export function buildRecordDetailTabs(input: {
  moduleId: ModuleId;
  record: ModuleWorkspaceRecordDetail;
}): GovernedDetailTabsInput {
  const { record } = input;

  const metadataEntries = Object.entries(record.metadata);
  const hasMetadata = metadataEntries.length > 0;

  return {
    dataNature: "tabbed-detail",
    entityLabel: record.reference,
    entityKind: "record",
    entityId: record.id,
    defaultTab: "overview",
    overview: {
      id: "overview",
      label: "Overview",
      hidden: false,
      orderIndex: 0,
      rendererKey: "governed:stat-card",
      rendererProps: {
        dataNature: "kpi",
        __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
        stats: [
          { label: "Record type", value: record.recordType, tone: "default" },
          { label: "Owner", value: record.owner, tone: "default" },
          { label: "Amount", value: record.amount, tone: "default" },
          {
            label: "Extension",
            value: record.extensionValid ? "Valid" : "Needs review",
            tone: record.extensionValid ? "positive" : "attention",
          },
        ],
      },
    },
    relations: hasMetadata
      ? [
          {
            id: "extension-metadata",
            label: "Extension metadata",
            description:
              "Validated extension values and operational descriptors for this record.",
            hidden: false,
            orderIndex: 0,
            rendererKey: "governed:stat-card",
            rendererProps: {
              dataNature: "snapshot-summary",
              __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
              stats: metadataEntries.slice(0, 6).map(([key, value]) => ({
                label: key,
                value: formatMetadataStatValue(value),
                tone: "default" as const,
              })),
            },
          },
        ]
      : undefined,
    audit: record.auditPanel.rows,
  };
}

/**
 * Builds a governed detail-tabs model for a module work item.
 */
export function buildWorkItemDetailTabs(input: {
  moduleId: ModuleId;
  workItem: ModuleWorkspaceWorkItemDetail;
}): GovernedDetailTabsInput {
  const { workItem } = input;

  const metadataEntries = Object.entries(workItem.metadata);
  const hasMetadata = metadataEntries.length > 0;

  const overviewStats = [
    { label: "Owner", value: workItem.owner, tone: "default" as const },
    {
      label: "Status",
      value: workItem.status,
      tone:
        workItem.status === "escalated"
          ? ("attention" as const)
          : ("default" as const),
    },
    {
      label: "Priority",
      value: workItem.priority,
      tone:
        workItem.priority === "high"
          ? ("critical" as const)
          : ("default" as const),
    },
    { label: "Due", value: workItem.due, tone: "default" as const },
  ];

  return {
    dataNature: "tabbed-detail",
    entityLabel: workItem.subject,
    entityKind: "work-item",
    entityId: workItem.id,
    defaultTab: "overview",
    overview: {
      id: "overview",
      label: "Overview",
      hidden: false,
      orderIndex: 0,
      rendererKey: "governed:stat-card",
      rendererProps: {
        dataNature: "kpi",
        __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
        stats: overviewStats,
      },
    },
    relations: hasMetadata
      ? [
          {
            id: "extension-metadata",
            label: "Extension metadata",
            description: "Validated metadata attached to this work item.",
            hidden: false,
            orderIndex: 0,
            rendererKey: "governed:stat-card",
            rendererProps: {
              dataNature: "snapshot-summary",
              __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
              stats: metadataEntries.slice(0, 6).map(([key, value]) => ({
                label: key,
                value: formatMetadataStatValue(value),
                tone: "default" as const,
              })),
            },
          },
        ]
      : undefined,
    referrers: workItem.sourceRecordId
      ? [
          {
            id: "source-record",
            label: "Source record",
            description: "The originating record that raised this work item.",
            hidden: false,
            orderIndex: 0,
            rendererKey: "governed:action-bar",
            rendererProps: {
              dataNature: "actions",
              actions: [
                {
                  id: "view-source-record",
                  label: "View source record",
                  intent: "default",
                },
              ],
            },
          },
        ]
      : undefined,
    audit: workItem.auditPanel.rows,
  };
}

/** Converts a pre-built `AuditPanelModel` into the flat audit row array expected
 * by `GovernedDetailTabsInput.audit`. */
export function auditRowsFromPanel(
  auditPanel: AuditPanelModel,
): AuditPanelModel["rows"] {
  return auditPanel.rows;
}
