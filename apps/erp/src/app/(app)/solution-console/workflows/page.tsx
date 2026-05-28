import { requireCapability } from "@afenda/auth/server";
import {
  listLynxWorkflowSessions,
  type LynxWorkflowSessionStatus,
} from "@afenda/db";
import {
  buildLynxWorkflowSessionListSurface,
  getLynxReadinessSurfaceKeys,
} from "@afenda/feature-lynx/metadata";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { Button, SectionPanel } from "@afenda/ui";
import Link from "next/link";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const workflowSessionStatuses: readonly LynxWorkflowSessionStatus[] = [
  "active",
  "paused",
  "completed",
  "failed",
  "cancelled",
];
const workflowSessionOrigins = ["proactive-outcome-sweep"] as const;
const workflowSessionMonitorStatuses = ["healthy", "watch", "blocked"] as const;
const workflowSessionSeverities = ["info", "review", "critical"] as const;

function getQualityGateStatus(summary: Record<string, unknown>) {
  return typeof summary.status === "string" ? summary.status : "-";
}

function getMetadataString(
  metadata: Record<string, unknown>,
  key: "origin" | "monitorStatus" | "severity" | "ownerAuthUserId",
) {
  const value = metadata[key];
  return typeof value === "string" ? value : "-";
}

function parseWorkflowSessionStatus(
  value: string | string[] | undefined,
): LynxWorkflowSessionStatus | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;
  return workflowSessionStatuses.includes(
    candidate as LynxWorkflowSessionStatus,
  )
    ? (candidate as LynxWorkflowSessionStatus)
    : undefined;
}

function parseLiteralParam(
  value: string | string[] | undefined,
  allowedValues: readonly string[],
): string | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate) return undefined;
  return allowedValues.includes(candidate) ? candidate : undefined;
}

export default async function LynxWorkflowSessionsPage({
  searchParams,
}: PageProps) {
  const resolvedSearchParams = await searchParams;
  const status = parseWorkflowSessionStatus(resolvedSearchParams.status);
  const origin = parseLiteralParam(
    resolvedSearchParams.origin,
    workflowSessionOrigins,
  );
  const monitorStatus = parseLiteralParam(
    resolvedSearchParams.monitorStatus,
    workflowSessionMonitorStatuses,
  );
  const severity = parseLiteralParam(
    resolvedSearchParams.severity,
    workflowSessionSeverities,
  );
  const { organization } = await requireCapability("dashboard.view");
  const sessions = await listLynxWorkflowSessions({
    organizationId: organization.id,
    ...(status ? { status } : {}),
    ...(origin ? { origin } : {}),
    ...(monitorStatus ? { monitorStatus } : {}),
    ...(severity ? { severity } : {}),
    limit: 100,
  });
  const surfaceKeys = getLynxReadinessSurfaceKeys();
  const filters =
    status || origin || monitorStatus || severity
      ? {
          ...(status ? { status } : {}),
          ...(origin ? { origin } : {}),
          ...(monitorStatus ? { monitorStatus } : {}),
          ...(severity ? { severity } : {}),
        }
      : undefined;
  const listSurface = buildLynxWorkflowSessionListSurface({
    ...(filters ? { filters } : {}),
    rows: sessions.map((session) => ({
      id: session.id,
      promptSummary: session.promptSummary || session.id,
      workflowId: session.workflowId,
      origin: getMetadataString(session.metadata, "origin"),
      monitorStatus: getMetadataString(session.metadata, "monitorStatus"),
      severity: getMetadataString(session.metadata, "severity"),
      ownerAuthUserId: getMetadataString(session.metadata, "ownerAuthUserId"),
      status: session.status,
      currentStage: session.currentStage,
      latestRunId: session.latestRunId ?? "-",
      qualityGate: getQualityGateStatus(session.qualityGateSummary),
      nextRecommendedStep: session.nextRecommendedStep || "-",
      updatedAt: session.updatedAt.toLocaleString(),
      href: `/solution-console/workflows/${session.id}`,
    })),
  });

  return (
    <div className="flex flex-col gap-6">
      <SectionPanel
        eyebrow="Lynx workflow management"
        headingLevel={1}
        title="Workflow sessions"
        description="Resume active and paused Lynx workflows with tenant-scoped run history."
        aside={
          <div className="flex flex-wrap justify-end gap-2">
            <Button asChild variant="outline">
              <Link href="/solution-console/runs">Open run console</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/solution-console">Back to console</Link>
            </Button>
          </div>
        }
      />

      <GovernedPatternCListSection
        title="Workflow sessions"
        description="Current-state pointers linked to immutable Lynx run replay records."
        surfaceKey={surfaceKeys.workflowSessions}
        listConfiguration={listSurface}
        parentAccessAllowed
        layout="embedded"
      />
    </div>
  );
}
