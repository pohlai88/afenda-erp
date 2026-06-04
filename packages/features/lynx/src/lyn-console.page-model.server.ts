import { getOperationalSkills } from "./lyn-operational-skill.catalog.server";
import { listLynxRunLedger } from "./lyn-run-ledger.repository.server";
import {
  describeWorkspaceDataSource,
  getAccessibleModules,
  getAiUsageRouteSummary,
  getModuleWorkspace,
  getModuleWorkspaceStats,
  getNavigationExtensionById,
  getRecoveryConsoleModuleIds,
  getRecoveryPlaybookDefinitions,
  resolveWorkspaceDataMode,
} from "@afenda/kernel";
import type {
  ListSurfaceRendererConfigurationResolvedInput,
  StatCardConfigurationResolvedInput,
} from "@afenda/governed-surface";
import type { Tone } from "@afenda/ui";
import {
  LYNX_MODULE_ID,
  LYNX_WORKSPACE_ROUTES,
} from "./lyn-core.contract";
import {
  getLynxNavigationExtensionHeroCopy,
  lynxConsoleMetrics,
} from "./lyn-console-ui.copy.shared";
import {
  buildLynxConsoleAiUsageListSurface,
  buildLynxConsoleEvidenceListSurface,
  buildLynxConsoleStatGrid,
  buildLynxOperationalSkillsListSurface,
  buildLynxRecoveryPlaybookListSurface,
  getLynxConsoleListSurfaceKeys,
  type LynxConsoleResolvedMetric,
} from "./lyn-console.surface";
import {
  buildLynxActivityLedgerListSurface,
  buildLynxEnterpriseControlsListSurface,
  buildLynxModuleReadinessListSurface,
  buildLynxReadinessStatGrid,
  buildLynxToolAvailabilityListSurface,
  getLynxReadinessSurfaceKeys,
} from "./lyn-readiness.surface";
import { getLynxReadinessSnapshot } from "./lyn-readiness.query.server";

type SessionSource = "dev" | "neon";

function formatLynxConsoleMetricValue(metricId: string, value: number) {
  if (metricId === "evidence-records") return `${value} records`;
  if (metricId === "workflow-items") return `${value} items`;
  if (metricId === "high-priority") return `${value} urgent`;
  if (metricId === "documents") return `${value} documents`;
  return `${value} total`;
}

function formatRunLedgerTimestamp(value: Date) {
  return value.toISOString();
}

export type LynxConsolePageModel = {
  heroCopy: ReturnType<typeof getLynxNavigationExtensionHeroCopy>;
  surfaceKeys: ReturnType<typeof getLynxConsoleListSurfaceKeys>;
  lynxSurfaceKeys: ReturnType<typeof getLynxReadinessSurfaceKeys>;
  statGrid: StatCardConfigurationResolvedInput;
  playbookList: ListSurfaceRendererConfigurationResolvedInput;
  skillsList: ListSurfaceRendererConfigurationResolvedInput;
  evidenceList: ListSurfaceRendererConfigurationResolvedInput;
  aiUsageList: ListSurfaceRendererConfigurationResolvedInput;
  activityLedgerList: ListSurfaceRendererConfigurationResolvedInput;
  readiness: {
    summary: string;
    status: string;
    statGrid: StatCardConfigurationResolvedInput | null;
    moduleList: ListSurfaceRendererConfigurationResolvedInput | null;
    controlsList: ListSurfaceRendererConfigurationResolvedInput | null;
    toolsList: ListSurfaceRendererConfigurationResolvedInput | null;
  } | null;
  moduleLinks: Array<{
    id: string;
    href: string;
    label: string;
    summary: string;
    statusLabel: string;
    statusTone: Tone;
  }>;
};

export async function buildLynxConsolePageModel(input: {
  organizationId: string;
  capabilities: readonly string[];
  sessionSource: SessionSource;
}): Promise<LynxConsolePageModel> {
  const extension = getNavigationExtensionById("lynx");
  const heroCopy = getLynxNavigationExtensionHeroCopy(extension);
  const dataMode = resolveWorkspaceDataMode(input.sessionSource);
  const accessibleModules = getAccessibleModules(
    input.capabilities as Parameters<typeof getAccessibleModules>[0],
  );
  const recoveryModuleIds = getRecoveryConsoleModuleIds().filter((moduleId) =>
    accessibleModules.some((module) => module.id === moduleId),
  );

  const workspacesPromise = Promise.all(
    recoveryModuleIds.map(async (moduleId) => {
      const workspace = await getModuleWorkspace({
        organizationId: input.organizationId,
        moduleId,
        dataMode,
      });

      return {
        moduleId,
        workspace,
        stats: getModuleWorkspaceStats(workspace),
      };
    }),
  );

  const aiUsageRowsPromise =
    input.sessionSource === "neon"
      ? getAiUsageRouteSummary({
          organizationId: input.organizationId,
          limit: 8,
        })
      : Promise.resolve([]);

  const lynxActivityPromise =
    input.sessionSource === "neon"
      ? listLynxRunLedger({
          organizationId: input.organizationId,
          limit: 8,
        })
      : Promise.resolve([]);

  const lynxReadinessPromise =
    input.sessionSource === "neon"
      ? getLynxReadinessSnapshot({
          organizationId: input.organizationId,
          capabilities: input.capabilities,
          sessionSource: input.sessionSource,
        })
      : Promise.resolve(null);

  const [workspaces, aiUsageRows, lynxActivity, lynxReadiness] =
    await Promise.all([
      workspacesPromise,
      aiUsageRowsPromise,
      lynxActivityPromise,
      lynxReadinessPromise,
    ]);

  const totals = workspaces.reduce(
    (current, item) => ({
      records: current.records + item.stats.recordCount,
      workflowItems: current.workflowItems + item.stats.workItemCount,
      highPriority:
        current.highPriority + item.stats.highPriorityWorkItemCount,
      documents: current.documents + item.stats.documentCount,
    }),
    {
      records: 0,
      workflowItems: 0,
      highPriority: 0,
      documents: 0,
    },
  );

  const metricValues = [
    totals.records,
    totals.workflowItems,
    totals.highPriority,
    totals.documents,
  ] as const;

  const metricTones = [
    totals.records > 0 ? "positive" : "neutral",
    totals.workflowItems > 0 ? "warning" : "positive",
    totals.highPriority > 0 ? "warning" : "positive",
    totals.documents > 0 ? "positive" : "neutral",
  ] as const;

  const metrics: LynxConsoleResolvedMetric[] = lynxConsoleMetrics.map(
    (metric, index) => ({
      label: metric.label,
      value: formatLynxConsoleMetricValue(
        metric.id,
        metricValues[index] ?? 0,
      ),
      detail: metric.detail,
      tone: metricTones[index] ?? "neutral",
    }),
  );

  const surfaceKeys = getLynxConsoleListSurfaceKeys();
  const lynxSurfaceKeys = getLynxReadinessSurfaceKeys();

  return {
    heroCopy,
    surfaceKeys,
    lynxSurfaceKeys,
    statGrid: buildLynxConsoleStatGrid({ metrics }),
    playbookList: buildLynxRecoveryPlaybookListSurface({
      playbooks: getRecoveryPlaybookDefinitions(),
    }),
    skillsList: buildLynxOperationalSkillsListSurface({
      skills: getOperationalSkills(),
    }),
    evidenceList: buildLynxConsoleEvidenceListSurface({
      rows: workspaces.map((item) => ({
        moduleId: item.moduleId,
        moduleLabel: item.workspace.module.label,
        recordCount: item.stats.recordCount,
        workItemCount: item.stats.workItemCount,
        documentCount: item.stats.documentCount,
        dataSource: describeWorkspaceDataSource(item.workspace),
      })),
    }),
    aiUsageList: buildLynxConsoleAiUsageListSurface({
      events: aiUsageRows,
    }),
    activityLedgerList: buildLynxActivityLedgerListSurface({
      rows: lynxActivity.map((item) => ({
        id: item.id,
        kind: "run",
        label: item.workflowId ?? item.route,
        detail: item.promptSummary,
        status: item.status,
        moduleId:
          typeof item.metadata.moduleId === "string"
            ? item.metadata.moduleId
            : LYNX_MODULE_ID,
        createdAt: formatRunLedgerTimestamp(item.startedAt),
        href: LYNX_WORKSPACE_ROUTES.runDetail(item.id),
      })),
    }),
    readiness: lynxReadiness
      ? {
          summary: lynxReadiness.summary,
          status: lynxReadiness.status,
          statGrid: buildLynxReadinessStatGrid({ snapshot: lynxReadiness }),
          moduleList: buildLynxModuleReadinessListSurface({
            modules: lynxReadiness.modules.slice(0, 8),
          }),
          controlsList: buildLynxEnterpriseControlsListSurface({
            controls: lynxReadiness.enterpriseControls,
          }),
          toolsList: buildLynxToolAvailabilityListSurface({
            tools: lynxReadiness.tools,
          }),
        }
      : null,
    moduleLinks: workspaces.map((item) => ({
      id: item.moduleId,
      href: item.workspace.module.href,
      label: item.workspace.module.label,
      summary: item.workspace.module.summary,
      statusLabel: item.workspace.module.status.label,
      statusTone: item.workspace.module.status.tone,
    })),
  };
}
