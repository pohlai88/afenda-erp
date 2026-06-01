import { getOrganizationContext } from "@afenda/auth/server";
import {
  listTenantCapabilitySettings,
  listTenantModuleSettings,
} from "@afenda/feature-system-admin/server";
import {
  applyTenantNavigationAvailability,
  getAccessibleModules,
  getNavigationExtensions,
  roleOperatingPosture,
} from "@afenda/kernel";
import { requireCapability } from "@afenda/auth/server";
import {
  countKnowledgeChunks,
  countKnowledgeDocuments,
  getKnowledgeOrgSetting,
  listKnowledgeSources,
  listLynxEvalRuns,
  listRecentKnowledgeChunks,
} from "@afenda/feature-knowledge/server";
import type { LynxRunLedgerFilters, LynxWorkflowSessionStatus } from "@afenda/db";
import {
  getLynxLatencyAnalytics,
  getLynxObservabilityOverview,
  getLynxOutcomeMonitorSettings,
  getLynxProactiveOutcomeAnalytics,
  getLynxQualityAnalytics,
  getLynxRunAnalytics,
  getLynxRunDetail,
  getLynxSpendAnalytics,
  getLynxWorkflowSession,
  listLynxRunLedger,
  listLynxWorkflowSessions,
  listRepresentativeLynxEvalFailures,
} from "@afenda/db";
import { LYNX_OUTCOME_MONITOR_IDS } from "@afenda/feature-lynx";
import { buildLynxConsolePageModel } from "@afenda/feature-lynx/server";
import { toLynxObservabilityFilters } from "@/workspace-routes/lynx-runs-route.shared";
import {
  getAiUsageRouteSummary,
  getDashboardWorkspace,
  getErpModuleById,
  getModuleWorkspaceWorkItem,
  getResolvedWorkflowAutomationRuns,
  isCoreModuleId,
  isModuleId,
  resolveWorkspaceDataMode,
  type CoreModuleId,
  type ModuleWorkspaceListQuery,
  type ModuleWorkspaceSearchParams,
} from "@afenda/kernel";
import { getModuleFeatureMetadata } from "@/lib/module-feature-metadata";
import {
  resolveModuleRecordDetail,
  resolveModuleWorkspace,
} from "@/lib/module-workspace-resolver";
import { cache } from "react";
import { notFound } from "next/navigation";

/** Request-scoped org/session context for workspace routes. */
export const loadWorkspaceOrganizationContext = cache(getOrganizationContext);

/** Shared shell navigation — one fetch for header + sidebar Suspense siblings. */
export const loadWorkspaceShellNavigation = cache(async () => {
  const { session, organization } = await loadWorkspaceOrganizationContext();
  const [moduleSettings, capabilitySettings] = await Promise.all([
    listTenantModuleSettings({
      organizationId: organization.id,
      limit: 100,
    }),
    listTenantCapabilitySettings({
      organizationId: organization.id,
      limit: 500,
    }),
  ]);
  const accessibleModules = applyTenantNavigationAvailability(
    getAccessibleModules(organization.capabilities),
    { moduleSettings, capabilitySettings },
  );
  const navigationExtensions = getNavigationExtensions(
    organization.capabilities,
  );

  return {
    session,
    organization,
    accessibleModules,
    navigationExtensions,
    activeRouteCount:
      accessibleModules.length + navigationExtensions.length,
    posture: roleOperatingPosture[organization.role],
  };
});

export const loadDashboardSession = cache(async () => {
  const context = await requireCapability("dashboard.view");
  const moduleDefinition = getErpModuleById("dashboard");

  if (!moduleDefinition) {
    throw new Error("Dashboard module metadata is missing.");
  }

  return { ...context, moduleDefinition };
});

export const loadModuleWorkspaceSession = cache(
  async ({
    moduleId,
    searchParams,
  }: {
    moduleId: CoreModuleId;
    searchParams?: ModuleWorkspaceSearchParams;
  }) => {
    const moduleDefinition = getErpModuleById(moduleId);

    if (!moduleDefinition) {
      notFound();
    }

    const { session, organization } = await requireCapability(
      moduleDefinition.requiredCapability,
    );
    const dataMode = resolveWorkspaceDataMode(session.source);
    const resolvedWorkspace = await resolveModuleWorkspace({
      organizationId: organization.id,
      moduleId,
      dataMode,
      searchParams,
    });

    return {
      moduleDefinition,
      session,
      organization,
      resolvedWorkspace,
      metadata: getModuleFeatureMetadata(moduleId),
      workspace: resolvedWorkspace.workspace,
      moduleQuery: resolvedWorkspace.moduleQuery,
    };
  },
);

export const loadLynxConsoleSession = cache(async () => {
  const { session, organization } = await requireCapability("dashboard.view");
  const pageModel = await buildLynxConsolePageModel({
    organizationId: organization.id,
    capabilities: organization.capabilities,
    sessionSource: session.source,
  });

  return { session, organization, pageModel };
});

export const loadLynxRunsSession = cache(async () => {
  const { organization } = await requireCapability("dashboard.view");
  return {
    organization,
    canManageMonitors: organization.capabilities.includes(
      "system-admin.lynx.approve",
    ),
  };
});

export type DashboardWorkspaceQuery = {
  query?: ModuleWorkspaceListQuery;
};

export const loadDashboardWorkspaceBundle = cache(
  async ({ query }: DashboardWorkspaceQuery) => {
    const { session, organization } = await loadDashboardSession();
    const dataMode = resolveWorkspaceDataMode(session.source);

    const [automationRuns, dashboardWorkspace, aiUsageRows] = await Promise.all([
      getResolvedWorkflowAutomationRuns({
        organizationId: organization.id,
        dataMode,
      }),
      getDashboardWorkspace({
        organizationId: organization.id,
        dataMode,
        query,
      }),
      session.source === "neon"
        ? getAiUsageRouteSummary({
            organizationId: organization.id,
            limit: 6,
          })
        : Promise.resolve(
            [] as Awaited<ReturnType<typeof getAiUsageRouteSummary>>,
          ),
    ]);

    return {
      session,
      organization,
      automationRuns,
      dashboardWorkspace,
      aiUsageRows,
    };
  },
);

export const loadLynxRunsStatsBundle = cache(
  async (filters: LynxRunLedgerFilters) => {
    const { organization } = await loadLynxRunsSession();
    const observabilityFilters = toLynxObservabilityFilters(filters);

    const [analytics, observabilityOverview] = await Promise.all([
      getLynxRunAnalytics({
        organizationId: organization.id,
        filters,
        limit: 500,
      }),
      getLynxObservabilityOverview({
        organizationId: organization.id,
        filters: observabilityFilters,
      }),
    ]);

    return { analytics, observabilityOverview };
  },
);

export const loadLynxRunsLedgerBundle = cache(
  async (filters: LynxRunLedgerFilters) => {
    const { organization } = await loadLynxRunsSession();
    const runs = await listLynxRunLedger({
      organizationId: organization.id,
      filters,
      limit: 100,
    });
    const runDetails = await Promise.all(
      runs.map((run) =>
        getLynxRunDetail({
          organizationId: organization.id,
          runId: run.id,
        }),
      ),
    );

    return { runs, runDetails };
  },
);

export const loadLynxRunsObservabilityListsBundle = cache(
  async (filters: LynxRunLedgerFilters) => {
    const { organization } = await loadLynxRunsSession();
    const observabilityFilters = toLynxObservabilityFilters(filters);

    const [
      latencyAnalytics,
      qualityAnalytics,
      proactiveOutcomeAnalytics,
      spendAnalytics,
    ] = await Promise.all([
      getLynxLatencyAnalytics({
        organizationId: organization.id,
        filters: observabilityFilters,
      }),
      getLynxQualityAnalytics({
        organizationId: organization.id,
        filters: observabilityFilters,
      }),
      getLynxProactiveOutcomeAnalytics({
        organizationId: organization.id,
        filters: observabilityFilters,
      }),
      getLynxSpendAnalytics({
        organizationId: organization.id,
        filters: observabilityFilters,
      }),
    ]);

    return {
      latencyAnalytics,
      qualityAnalytics,
      proactiveOutcomeAnalytics,
      spendAnalytics,
    };
  },
);

export const loadLynxRunsMonitorBundle = cache(async () => {
  const { organization } = await loadLynxRunsSession();
  const monitorSettings = await getLynxOutcomeMonitorSettings({
    organizationId: organization.id,
    monitorIds: LYNX_OUTCOME_MONITOR_IDS,
  });

  return { monitorSettings };
});

export const loadLynxRunsRepresentativeFailuresBundle = cache(async () => {
  const { organization } = await loadLynxRunsSession();
  const representativeEvalFailures = await listRepresentativeLynxEvalFailures({
    organizationId: organization.id,
    limit: 20,
  });

  return { representativeEvalFailures };
});

export const loadKnowledgeAdminBundle = cache(async () => {
  const { organization } = await requireCapability("system-admin.view");

  const [
    sources,
    recentChunks,
    chunkCount,
    documentCount,
    orgSetting,
    evalRuns,
  ] = await Promise.all([
    listKnowledgeSources(organization.id),
    listRecentKnowledgeChunks(organization.id, 10),
    countKnowledgeChunks(organization.id),
    countKnowledgeDocuments(organization.id),
    getKnowledgeOrgSetting(organization.id),
    listLynxEvalRuns(organization.id, 20),
  ]);

  return {
    organization,
    sources,
    recentChunks,
    chunkCount,
    documentCount,
    orgSetting,
    evalRuns,
  };
});

export const loadLynxRunDetailContext = cache(async (runId: string) => {
  const { organization } = await requireCapability("dashboard.view");
  const run = await getLynxRunDetail({
    organizationId: organization.id,
    runId,
  });

  if (!run) {
    notFound();
  }

  return { organization, run };
});

export type LynxWorkflowSessionListFilters = {
  status?: LynxWorkflowSessionStatus;
  origin?: string;
  monitorStatus?: string;
  severity?: string;
};

export const loadLynxWorkflowSessionsBundle = cache(
  async (filters: LynxWorkflowSessionListFilters = {}) => {
    const { organization } = await requireCapability("dashboard.view");
    const sessions = await listLynxWorkflowSessions({
      organizationId: organization.id,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.origin ? { origin: filters.origin } : {}),
      ...(filters.monitorStatus ? { monitorStatus: filters.monitorStatus } : {}),
      ...(filters.severity ? { severity: filters.severity } : {}),
      limit: 100,
    });

    return { organization, sessions, filters };
  },
);

export const loadLynxWorkflowSessionDetailBundle = cache(
  async (workflowSessionId: string) => {
    const { organization } = await requireCapability("dashboard.view");
    const session = await getLynxWorkflowSession({
      organizationId: organization.id,
      id: workflowSessionId,
    });

    if (!session) {
      notFound();
    }

    const [sessionRuns, latestSessionRuns] = await Promise.all([
      listLynxRunLedger({
        organizationId: organization.id,
        filters: { workflowSessionId: session.id },
        limit: 100,
      }),
      session.latestRunId
        ? listLynxRunLedger({
            organizationId: organization.id,
            runIds: [session.latestRunId],
            limit: 1,
          })
        : Promise.resolve([]),
    ]);

    const runs = Array.from(
      new Map(
        [...latestSessionRuns, ...sessionRuns].map((run) => [run.id, run]),
      ).values(),
    );

    const runDetails = await Promise.all(
      runs.map((run) =>
        getLynxRunDetail({
          organizationId: organization.id,
          runId: run.id,
        }),
      ),
    );

    const availableRunDetails = runDetails.filter(
      (detail): detail is NonNullable<typeof detail> => Boolean(detail),
    );

    return { organization, session, runs, availableRunDetails };
  },
);

export const loadModuleRecordDetailContext = cache(
  async (moduleId: string, recordId: string) => {
    if (!isModuleId(moduleId) || !isCoreModuleId(moduleId)) {
      notFound();
    }

    const moduleDefinition = getErpModuleById(moduleId);

    if (!moduleDefinition) {
      notFound();
    }

    const { session, organization } = await requireCapability(
      moduleDefinition.requiredCapability,
    );
    const dataMode = resolveWorkspaceDataMode(session.source);
    const record = await resolveModuleRecordDetail({
      organizationId: organization.id,
      moduleId,
      recordId,
      dataMode,
    });

    if (!record) {
      notFound();
    }

    return {
      moduleDefinition,
      organization,
      record,
      dataMode,
      moduleId,
    };
  },
);

export const loadModuleWorkItemDetailContext = cache(
  async (moduleId: string, workItemId: string) => {
    if (!isModuleId(moduleId) || !isCoreModuleId(moduleId)) {
      notFound();
    }

    const moduleDefinition = getErpModuleById(moduleId);

    if (!moduleDefinition) {
      notFound();
    }

    const { session, organization } = await requireCapability(
      moduleDefinition.requiredCapability,
    );
    const dataMode = resolveWorkspaceDataMode(session.source);
    const workItem = await getModuleWorkspaceWorkItem({
      organizationId: organization.id,
      moduleId,
      workItemId,
      dataMode,
    });

    if (!workItem) {
      notFound();
    }

    return {
      moduleDefinition,
      organization,
      workItem,
      dataMode,
      moduleId,
    };
  },
);
