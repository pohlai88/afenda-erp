import type { HrComplianceAuditTrailWindow } from "../data/hr.workforce.compliance.audit-trail.shared";
import {
  formatComplianceAuditActionLabel,
  formatComplianceAuditCategoryLabel,
} from "../data/hr.workforce.compliance.audit-trail.shared";
import { hrComplianceUiCopy } from "./hr.workforce.compliance-ui.copy.shared";
import {
  buildComplianceListSearchToolbar,
  buildComplianceOperationalListSurface,
} from "./hr.workforce.compliance-list.shared";
import { hrComplianceAuditTrailColumnsId } from "./hr.workforce.compliance-surface-columns.shared";
import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";

export const hrComplianceAuditTrailSurfaceKey =
  "hr.workforce.compliance.audit-trail.list" as const;

export const hrComplianceAuditTrailSearchParam =
  "complianceAuditTrailSearch" as const;

function formatAuditMetadataPreview(
  metadata: Record<string, unknown> | null,
): string {
  if (!metadata) {
    return "—";
  }

  const entries = Object.entries(metadata).filter(
    ([, value]) => value !== null && value !== undefined && value !== "",
  );

  if (entries.length === 0) {
    return "—";
  }

  return entries
    .slice(0, 4)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(" · ");
}

export function buildHrComplianceAuditTrailListSurface(input: {
  window: HrComplianceAuditTrailWindow;
  searchValue?: string;
}): ListSurfaceRendererConfigurationResolvedInput {
  const copy = hrComplianceUiCopy.auditTrail;

  return buildComplianceOperationalListSurface({
    primaryColumnId: "occurredAt",
    searchToolbar: buildComplianceListSearchToolbar({
      param: hrComplianceAuditTrailSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrComplianceAuditTrailColumnsId,
      emptyTitle: copy.emptyTitle,
      emptyDescription: copy.emptyDescription,
    },
    columns: [
      {
        id: "occurredAt",
        header: copy.colOccurredAt,
        pin: "start",
        cellKind: { kind: "date" },
        minWidth: 160,
      },
      {
        id: "category",
        header: copy.colCategory,
        cellKind: { kind: "badge", tone: "default" },
      },
      {
        id: "action",
        header: copy.colAction,
        priority: "primary",
        wrap: true,
        minWidth: 220,
      },
      {
        id: "actor",
        header: copy.colActor,
        cellKind: { kind: "text" },
        minWidth: 140,
      },
      {
        id: "target",
        header: copy.colTarget,
        cellKind: { kind: "text" },
        minWidth: 140,
      },
      {
        id: "summary",
        header: copy.colSummary,
        wrap: true,
        minWidth: 240,
      },
      {
        id: "metadata",
        header: copy.colMetadata,
        wrap: true,
        minWidth: 200,
      },
    ],
    rows: input.window.rows.map((row) => ({
      id: row.id,
      cells: {
        occurredAt: row.occurredAt.toISOString(),
        category: formatComplianceAuditCategoryLabel(row.category),
        action: formatComplianceAuditActionLabel(row.action),
        actor: row.actorAuthUserId,
        target: row.targetId,
        summary: row.summary,
        metadata: formatAuditMetadataPreview(row.metadata),
        actionValue: row.action,
        categoryValue: row.category,
      },
    })),
  });
}
