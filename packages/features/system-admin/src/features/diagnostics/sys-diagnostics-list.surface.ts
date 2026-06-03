import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import {
  buildLinkedControlListSurface,
  linkCell,
} from "../../overview/surfaces/system-admin.control-list.shared";
import type { SystemAdminDiagnosticIssue } from "../contracts/system-admin.diagnostic-issue.contract";
import type {
  SystemAdminDiagnosticsModuleCoverageRow,
  SystemAdminDiagnosticsRecentChangeRow,
} from "../contracts/system-admin.diagnostics-coverage.contract";
import {
  formatDiagnosticCategoryLabel,
  formatDiagnosticSeverityLabel,
  formatModuleCoverageStatusLabel,
} from "../data/system-admin.diagnostics.verdict.server";
import { systemAdminDiagnosticsUiCopy } from "./system-admin.diagnostics-ui.copy.shared";

export const systemAdminDiagnosticsSurfaceKey =
  "system-admin.diagnostics.list";

export const systemAdminDiagnosticsModuleCoverageSurfaceKey =
  "system-admin.diagnostics.module-coverage";

export const systemAdminDiagnosticsRecentChangesSurfaceKey =
  "system-admin.diagnostics.recent-changes";

function severityBadge(
  severity: SystemAdminDiagnosticIssue["severity"],
): NonNullable<
  import("@afenda/governed-surface/schemas").ListSurfaceRow["cellKinds"]
>[string] {
  if (severity === "blocked") {
    return { kind: "badge", tone: "critical" };
  }

  if (severity === "warning") {
    return { kind: "badge", tone: "attention" };
  }

  return { kind: "badge", tone: "default" };
}

function formatTarget(issue: SystemAdminDiagnosticIssue) {
  if (!issue.targetId) {
    return issue.targetType;
  }

  return `${issue.targetType}: ${issue.targetId}`;
}

function buildDiagnosticsIssuesListSurface(input: {
  surfaceKey: string;
  title: string;
  emptyTitle: string;
  emptyDescription: string;
  searchPlaceholder: string;
  issues: readonly SystemAdminDiagnosticIssue[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildLinkedControlListSurface({
    key: input.surfaceKey,
    title: input.title,
    object: "diagnostics",
    columns: [
      {
        id: "severity",
        header: "Severity",
        priority: "primary",
        pin: "start",
        cellKind: { kind: "badge" },
      },
      { id: "category", header: "Category" },
      { id: "issue", header: "Issue" },
      { id: "target", header: "Target", cellKind: { kind: "link" } },
      { id: "recommendedAction", header: "Recommended action" },
    ],
    rows: input.issues.map((issue) => ({
      id: issue.id,
      cells: {
        severity: formatDiagnosticSeverityLabel(issue.severity),
        category: formatDiagnosticCategoryLabel(issue.category),
        issue: `${issue.title} — ${issue.description}`,
        target: formatTarget(issue),
        recommendedAction: issue.recommendedAction,
      },
      rowHref: issue.targetHref,
      linkColumnId: issue.targetHref ? "target" : undefined,
      cellKinds: {
        severity: severityBadge(issue.severity),
        ...(issue.targetHref
          ? { target: linkCell(issue.targetHref) }
          : undefined),
      },
    })),
    emptyTitle: input.emptyTitle,
    emptyDescription: input.emptyDescription,
    searchPlaceholder: input.searchPlaceholder,
  });
}

export function buildSystemAdminDiagnosticsIssuesListSurface(input: {
  issues: readonly SystemAdminDiagnosticIssue[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildDiagnosticsIssuesListSurface({
    surfaceKey: systemAdminDiagnosticsSurfaceKey,
    title: systemAdminDiagnosticsUiCopy.issues.allTitle,
    emptyTitle: systemAdminDiagnosticsUiCopy.issues.allEmpty,
    emptyDescription: systemAdminDiagnosticsUiCopy.issues.allEmptyDescription,
    searchPlaceholder: systemAdminDiagnosticsUiCopy.issues.searchPlaceholder,
    issues: input.issues,
  });
}

export function buildSystemAdminDiagnosticsBlockedIssuesListSurface(input: {
  issues: readonly SystemAdminDiagnosticIssue[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildDiagnosticsIssuesListSurface({
    surfaceKey: `${systemAdminDiagnosticsSurfaceKey}:blocked`,
    title: systemAdminDiagnosticsUiCopy.issues.blockedTitle,
    emptyTitle: systemAdminDiagnosticsUiCopy.issues.blockedEmpty,
    emptyDescription:
      systemAdminDiagnosticsUiCopy.issues.blockedEmptyDescription,
    searchPlaceholder: systemAdminDiagnosticsUiCopy.issues.searchPlaceholder,
    issues: input.issues,
  });
}

export function buildSystemAdminDiagnosticsWarningIssuesListSurface(input: {
  issues: readonly SystemAdminDiagnosticIssue[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildDiagnosticsIssuesListSurface({
    surfaceKey: `${systemAdminDiagnosticsSurfaceKey}:warning`,
    title: systemAdminDiagnosticsUiCopy.issues.warningTitle,
    emptyTitle: systemAdminDiagnosticsUiCopy.issues.warningEmpty,
    emptyDescription:
      systemAdminDiagnosticsUiCopy.issues.warningEmptyDescription,
    searchPlaceholder: systemAdminDiagnosticsUiCopy.issues.searchPlaceholder,
    issues: input.issues,
  });
}

export function buildSystemAdminDiagnosticsInfoIssuesListSurface(input: {
  issues: readonly SystemAdminDiagnosticIssue[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildDiagnosticsIssuesListSurface({
    surfaceKey: `${systemAdminDiagnosticsSurfaceKey}:info`,
    title: systemAdminDiagnosticsUiCopy.issues.infoTitle,
    emptyTitle: systemAdminDiagnosticsUiCopy.issues.infoEmpty,
    emptyDescription: systemAdminDiagnosticsUiCopy.issues.infoEmptyDescription,
    searchPlaceholder: systemAdminDiagnosticsUiCopy.issues.searchPlaceholder,
    issues: input.issues,
  });
}

function moduleCoverageStatusBadge(
  status: SystemAdminDiagnosticsModuleCoverageRow["status"],
): NonNullable<
  import("@afenda/governed-surface/schemas").ListSurfaceRow["cellKinds"]
>[string] {
  if (status === "blocked") {
    return { kind: "badge", tone: "critical" };
  }

  if (status === "warning") {
    return { kind: "badge", tone: "attention" };
  }

  if (status === "notice") {
    return { kind: "badge", tone: "default" };
  }

  return { kind: "badge", tone: "positive" };
}

export function buildSystemAdminDiagnosticsModuleCoverageListSurface(input: {
  rows: readonly SystemAdminDiagnosticsModuleCoverageRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildLinkedControlListSurface({
    key: systemAdminDiagnosticsModuleCoverageSurfaceKey,
    title: systemAdminDiagnosticsUiCopy.moduleCoverage.title,
    object: "diagnostics-module-coverage",
    columns: [
      {
        id: "module",
        header: "Module",
        priority: "primary",
        pin: "start",
        cellKind: { kind: "link" },
      },
      { id: "status", header: "Status", cellKind: { kind: "badge" } },
      { id: "blocked", header: "Blocked" },
      { id: "warnings", header: "Warnings" },
      { id: "notices", header: "Notices" },
      { id: "total", header: "Total issues" },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      cells: {
        module: row.moduleLabel,
        status: formatModuleCoverageStatusLabel(row.status),
        blocked: String(row.blockedCount),
        warnings: String(row.warningCount),
        notices: String(row.infoCount),
        total: String(row.totalCount),
      },
      rowHref: row.href,
      linkColumnId: "module",
      cellKinds: {
        module: linkCell(row.href),
        status: moduleCoverageStatusBadge(row.status),
      },
    })),
    emptyTitle: systemAdminDiagnosticsUiCopy.moduleCoverage.emptyTitle,
    emptyDescription: systemAdminDiagnosticsUiCopy.moduleCoverage.emptyDescription,
    searchPlaceholder: systemAdminDiagnosticsUiCopy.moduleCoverage.searchPlaceholder,
  });
}

export function buildSystemAdminDiagnosticsRecentChangesListSurface(input: {
  rows: readonly SystemAdminDiagnosticsRecentChangeRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildLinkedControlListSurface({
    key: systemAdminDiagnosticsRecentChangesSurfaceKey,
    title: systemAdminDiagnosticsUiCopy.recentChanges.title,
    object: "diagnostics-recent-changes",
    columns: [
      {
        id: "occurredAt",
        header: "Time",
        priority: "primary",
        pin: "start",
      },
      { id: "actionLabel", header: "Action" },
      { id: "actorId", header: "Actor" },
      { id: "target", header: "Target" },
      { id: "summary", header: "Summary", cellKind: { kind: "link" } },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      cells: {
        occurredAt: row.occurredAt,
        actionLabel: row.actionLabel,
        actorId: row.actorId,
        target: row.target,
        summary: row.summary,
      },
      rowHref: row.href,
      linkColumnId: "summary",
      cellKinds: {
        summary: linkCell(row.href),
      },
    })),
    emptyTitle: systemAdminDiagnosticsUiCopy.recentChanges.emptyTitle,
    emptyDescription: systemAdminDiagnosticsUiCopy.recentChanges.emptyDescription,
    searchPlaceholder: systemAdminDiagnosticsUiCopy.recentChanges.searchPlaceholder,
  });
}
