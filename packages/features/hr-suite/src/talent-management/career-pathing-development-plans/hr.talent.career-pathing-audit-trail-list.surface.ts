import {
  formatCareerPathingAuditActionLabel,
  type HrCareerPathingAuditTrailWindow,
} from "./hr.talent.career-pathing-audit.shared";
import { hrCareerPathingAuditSearchParam } from "./hr.talent.career-pathing-search-params.parse.shared";
import {
  buildCareerPathingListSearchToolbar,
  buildCareerPathingOperationalListSurface,
} from "./hr.talent.career-pathing-list.shared";
import { hrCareerPathingUiCopy } from "./hr.talent.career-pathing-ui.copy.shared";

export const hrCareerPathingAuditTrailColumnsId =
  "hr.talent.career-pathing.audit.columns" as const;

export const hrCareerPathingAuditTrailSurfaceKey =
  "hr.talent.career-pathing.audit.list" as const;

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

/** HRM-CAR-031 — audit trail list surface. */
export function buildHrCareerPathingAuditTrailListSurface(input: {
  window: HrCareerPathingAuditTrailWindow;
  searchValue?: string;
}) {
  const copy = hrCareerPathingUiCopy.auditTrail;

  return buildCareerPathingOperationalListSurface({
    primaryColumnId: "occurredAt",
    searchToolbar: buildCareerPathingListSearchToolbar({
      param: hrCareerPathingAuditSearchParam,
      label: copy.searchLabel,
      placeholder: copy.searchPlaceholder,
      value: input.searchValue,
    }),
    window: input.window,
    surface: {
      headerTitle: copy.surfaceHeaderTitle,
      columnsId: hrCareerPathingAuditTrailColumnsId,
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
        id: "action",
        header: copy.colAction,
        priority: "primary",
        wrap: true,
        minWidth: 220,
      },
      {
        id: "employee",
        header: copy.colEmployee,
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
        id: "actor",
        header: copy.colActor,
        cellKind: { kind: "text" },
        minWidth: 140,
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
        action: formatCareerPathingAuditActionLabel(row.action),
        employee: row.employeeId ?? "—",
        summary: row.summary,
        actor: row.actorAuthUserId ?? "—",
        metadata: formatAuditMetadataPreview(row.metadata),
        actionValue: row.action,
      },
    })),
  });
}
