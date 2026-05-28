import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import { systemAdminDiagnosticsSurfaceKey } from "../../surfaces/system-admin.control.surface";
import {
  buildLinkedControlListSurface,
  linkCell,
} from "../../surfaces/system-admin.control.surface";
import type { SystemAdminDiagnosticIssue } from "../contracts/system-admin.diagnostic-issue.contract";
import type {
  SystemAdminDiagnosticsModuleCoverageRow,
  SystemAdminDiagnosticsRecentChangeRow,
} from "../contracts/system-admin.diagnostics-coverage.contract";
import {
  formatDiagnosticCategoryLabel,
  formatDiagnosticSeverityLabel,
} from "./system-admin.diagnostics.verdict.server";

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
  });
}

export function buildSystemAdminDiagnosticsIssuesListSurface(input: {
  issues: readonly SystemAdminDiagnosticIssue[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildDiagnosticsIssuesListSurface({
    surfaceKey: systemAdminDiagnosticsSurfaceKey,
    title: "Configuration diagnostics",
    emptyTitle: "No configuration issues detected for this organization.",
    issues: input.issues,
  });
}

export function buildSystemAdminDiagnosticsBlockedIssuesListSurface(input: {
  issues: readonly SystemAdminDiagnosticIssue[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildDiagnosticsIssuesListSurface({
    surfaceKey: `${systemAdminDiagnosticsSurfaceKey}:blocked`,
    title: "Blocked issues",
    emptyTitle: "No blocked configuration issues.",
    issues: input.issues,
  });
}

export function buildSystemAdminDiagnosticsWarningIssuesListSurface(input: {
  issues: readonly SystemAdminDiagnosticIssue[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildDiagnosticsIssuesListSurface({
    surfaceKey: `${systemAdminDiagnosticsSurfaceKey}:warning`,
    title: "Warnings",
    emptyTitle: "No configuration warnings.",
    issues: input.issues,
  });
}

export function buildSystemAdminDiagnosticsInfoIssuesListSurface(input: {
  issues: readonly SystemAdminDiagnosticIssue[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildDiagnosticsIssuesListSurface({
    surfaceKey: `${systemAdminDiagnosticsSurfaceKey}:info`,
    title: "Informational notices",
    emptyTitle: "No informational notices.",
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
    title: "Coverage by module",
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
        status: row.status,
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
    emptyTitle: "No module settings are configured for this organization.",
  });
}

export function buildSystemAdminDiagnosticsRecentChangesListSurface(input: {
  rows: readonly SystemAdminDiagnosticsRecentChangeRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildLinkedControlListSurface({
    key: systemAdminDiagnosticsRecentChangesSurfaceKey,
    title: "Recent configuration changes",
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
    emptyTitle:
      "No recent configuration changes were recorded in the administrative audit log.",
  });
}
