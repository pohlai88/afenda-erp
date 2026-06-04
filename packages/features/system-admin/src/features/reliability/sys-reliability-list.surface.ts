import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import {
  buildLinkedControlListSurface,
  linkCell,
} from "../overview/sys-control-list.shared";
import type {
  SystemAdminReliabilityIssue,
  SystemAdminReliabilityOperationalLinkRow,
} from "./sys-reliability-issue.contract";
import {
  formatReliabilityCategoryLabel,
  formatReliabilitySeverityLabel,
} from "./sys-reliability.verdict.server";
import { systemAdminReliabilityUiCopy } from "./sys-reliability-ui.copy.shared";

export const systemAdminReliabilitySurfaceKey = "system-admin.reliability.list";

export const systemAdminReliabilityOperationalLinksSurfaceKey =
  "system-admin.reliability.operational-links";

function severityBadge(
  severity: SystemAdminReliabilityIssue["severity"],
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

function formatTarget(issue: SystemAdminReliabilityIssue) {
  if (!issue.targetId) {
    return issue.targetType;
  }

  return `${issue.targetType}: ${issue.targetId}`;
}

function buildReliabilityIssuesListSurface(input: {
  surfaceKey: string;
  title: string;
  emptyTitle: string;
  emptyDescription: string;
  searchPlaceholder: string;
  issues: readonly SystemAdminReliabilityIssue[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildLinkedControlListSurface({
    key: input.surfaceKey,
    title: input.title,
    object: "reliability",
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
        severity: formatReliabilitySeverityLabel(issue.severity),
        category: formatReliabilityCategoryLabel(issue.category),
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

export function buildSystemAdminReliabilityBlockedIssuesListSurface(input: {
  issues: readonly SystemAdminReliabilityIssue[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildReliabilityIssuesListSurface({
    surfaceKey: `${systemAdminReliabilitySurfaceKey}:blocked`,
    title: systemAdminReliabilityUiCopy.issues.blockedTitle,
    emptyTitle: systemAdminReliabilityUiCopy.issues.blockedEmpty,
    emptyDescription: systemAdminReliabilityUiCopy.issues.blockedEmptyDescription,
    searchPlaceholder: systemAdminReliabilityUiCopy.issues.searchPlaceholder,
    issues: input.issues,
  });
}

export function buildSystemAdminReliabilityWarningIssuesListSurface(input: {
  issues: readonly SystemAdminReliabilityIssue[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildReliabilityIssuesListSurface({
    surfaceKey: `${systemAdminReliabilitySurfaceKey}:warning`,
    title: systemAdminReliabilityUiCopy.issues.warningTitle,
    emptyTitle: systemAdminReliabilityUiCopy.issues.warningEmpty,
    emptyDescription: systemAdminReliabilityUiCopy.issues.warningEmptyDescription,
    searchPlaceholder: systemAdminReliabilityUiCopy.issues.searchPlaceholder,
    issues: input.issues,
  });
}

export function buildSystemAdminReliabilityInfoIssuesListSurface(input: {
  issues: readonly SystemAdminReliabilityIssue[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildReliabilityIssuesListSurface({
    surfaceKey: `${systemAdminReliabilitySurfaceKey}:info`,
    title: systemAdminReliabilityUiCopy.issues.infoTitle,
    emptyTitle: systemAdminReliabilityUiCopy.issues.infoEmpty,
    emptyDescription: systemAdminReliabilityUiCopy.issues.infoEmptyDescription,
    searchPlaceholder: systemAdminReliabilityUiCopy.issues.searchPlaceholder,
    issues: input.issues,
  });
}

export function buildSystemAdminReliabilityOperationalLinksListSurface(input: {
  rows: readonly SystemAdminReliabilityOperationalLinkRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildLinkedControlListSurface({
    key: systemAdminReliabilityOperationalLinksSurfaceKey,
    title: systemAdminReliabilityUiCopy.operationalLinks.title,
    object: "reliability-links",
    columns: [
      {
        id: "area",
        header: "Area",
        priority: "primary",
        pin: "start",
      },
      { id: "status", header: "Status", cellKind: { kind: "badge" } },
      { id: "detail", header: "Detail", cellKind: { kind: "link" } },
    ],
    rows: input.rows.map((row) => ({
      id: row.id,
      cells: {
        area: row.area,
        status: row.status,
        detail: row.detail,
      },
      rowHref: row.href,
      linkColumnId: row.href ? "detail" : undefined,
      cellKinds: row.href ? { detail: linkCell(row.href) } : undefined,
    })),
    emptyTitle: systemAdminReliabilityUiCopy.operationalLinks.emptyTitle,
    emptyDescription: systemAdminReliabilityUiCopy.operationalLinks.emptyDescription,
    searchPlaceholder: systemAdminReliabilityUiCopy.operationalLinks.searchPlaceholder,
  });
}
