import { requireCapability } from "@afenda/auth/server";
import { getOperationalSkills } from "@afenda/ai";
import { listLynxRunLedger, type LynxRunLedgerSummary } from "@afenda/db";
import { getLynxReadinessSnapshot } from "@afenda/feature-lynx/server";
import {
  buildLynxActivityLedgerListSurface,
  buildLynxEnterpriseControlsListSurface,
  buildLynxModuleReadinessListSurface,
  buildLynxReadinessStatGrid,
  buildLynxToolAvailabilityListSurface,
  getLynxReadinessSurfaceKeys,
} from "@afenda/feature-lynx/metadata";
import {
  buildOperationalSkillsListSurface,
  buildRecoveryPlaybookListSurface,
  buildSolutionConsoleAiUsageListSurface,
  buildSolutionConsoleEvidenceListSurface,
  buildSolutionConsoleStatGrid,
  getSolutionConsoleListSurfaceKeys,
  solutionConsoleStatSurfaceKey,
} from "@afenda/feature-solution-console/metadata";
import {
  describeWorkspaceDataSource,
  getAccessibleModules,
  getAiUsageRouteSummary,
  getModuleWorkspace,
  getModuleWorkspaceStats,
  getNavigationExtensionById,
  getNavigationExtensionHeroCopy,
  getRecoveryConsoleModuleIds,
  getRecoveryPlaybookDefinitions,
  getSolutionConsoleSection,
  resolveWorkspaceDataMode,
  solutionConsoleMetrics,
} from "@afenda/domain";
import {
  GovernedPatternBStatSection,
  GovernedPatternCListSection,
} from "@afenda/governed-surface/server";
import { Button, ModuleLinkGrid, SectionPanel, StatusBadge } from "@afenda/ui";
import Link from "next/link";
import { LynxOperatorPanel } from "./lynx-operator-panel";

const recoveryModuleIds = getRecoveryConsoleModuleIds();

function formatSolutionConsoleMetricValue(metricId: string, value: number) {
  if (metricId === "evidence-records") return `${value} records`;
  if (metricId === "workflow-items") return `${value} items`;
  if (metricId === "high-priority") return `${value} urgent`;
  if (metricId === "documents") return `${value} documents`;
  return `${value} total`;
}

export async function SolutionConsoleRoutePage() {
  const { session, organization } = await requireCapability("dashboard.view");
  const extension = getNavigationExtensionById("solution-console");
  const heroCopy = getNavigationExtensionHeroCopy(extension);
  const accessibleModules = getAccessibleModules(organization.capabilities);
  const dataMode = resolveWorkspaceDataMode(session.source);
  const availableRecoveryModules = recoveryModuleIds.filter((moduleId) =>
    accessibleModules.some((module) => module.id === moduleId),
  );
  const workspacesPromise = Promise.all(
    availableRecoveryModules.map(async (moduleId) => {
      const workspace = await getModuleWorkspace({
        organizationId: organization.id,
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
    session.source === "neon"
      ? getAiUsageRouteSummary({
          organizationId: organization.id,
          limit: 8,
        })
      : Promise.resolve([]);
  const lynxActivityPromise =
    session.source === "neon"
      ? listLynxRunLedger({
          organizationId: organization.id,
          limit: 8,
        })
      : Promise.resolve([]);
  const lynxReadinessPromise =
    session.source === "neon"
      ? getLynxReadinessSnapshot({
          organizationId: organization.id,
          capabilities: organization.capabilities,
          sessionSource: session.source,
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
      highPriority: current.highPriority + item.stats.highPriorityWorkItemCount,
      documents: current.documents + item.stats.documentCount,
    }),
    {
      records: 0,
      workflowItems: 0,
      highPriority: 0,
      documents: 0,
    },
  );
  const recoveryPlaybooks = getRecoveryPlaybookDefinitions();
  const operationalSkills = getOperationalSkills();
  const playbookListSurface = buildRecoveryPlaybookListSurface({
    playbooks: recoveryPlaybooks,
  });
  const skillsListSurface = buildOperationalSkillsListSurface({
    skills: operationalSkills,
  });
  const heroSection = getSolutionConsoleSection("hero");
  const playbookSection = getSolutionConsoleSection("playbookCatalog");
  const skillsSection = getSolutionConsoleSection("operationalSkills");
  const agentSection = getSolutionConsoleSection("agentWorkspace");
  const evidenceSection = getSolutionConsoleSection("evidenceCoverage");
  const aiLedgerSection = getSolutionConsoleSection("aiUsageLedger");
  const connectedModulesSection = getSolutionConsoleSection("connectedModules");
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
  const surfaceKeys = getSolutionConsoleListSurfaceKeys();
  const lynxSurfaceKeys = getLynxReadinessSurfaceKeys();
  const evidenceListSurface = buildSolutionConsoleEvidenceListSurface({
    rows: workspaces.map((item) => ({
      moduleId: item.moduleId,
      moduleLabel: item.workspace.module.label,
      recordCount: item.stats.recordCount,
      workItemCount: item.stats.workItemCount,
      documentCount: item.stats.documentCount,
      dataSource: describeWorkspaceDataSource(item.workspace),
    })),
  });
  const aiUsageListSurface = buildSolutionConsoleAiUsageListSurface({
    events: aiUsageRows,
  });
  const lynxActivityLedgerListSurface = buildLynxActivityLedgerListSurface({
    rows: (lynxActivity as readonly LynxRunLedgerSummary[]).map((item) => ({
      id: item.id,
      kind: "run",
      label: item.workflowId ?? item.route,
      detail: item.promptSummary,
      status: item.status,
      moduleId:
        typeof item.metadata.moduleId === "string"
          ? item.metadata.moduleId
          : "solution-console",
      createdAt: item.startedAt.toLocaleString(),
      href: `/solution-console/runs/${item.id}`,
    })),
  });
  const lynxReadinessStatGrid = lynxReadiness
    ? buildLynxReadinessStatGrid({ snapshot: lynxReadiness })
    : null;
  const lynxModuleReadinessListSurface = lynxReadiness
    ? buildLynxModuleReadinessListSurface({
        modules: lynxReadiness.modules.slice(0, 8),
      })
    : null;
  const lynxEnterpriseControlsListSurface = lynxReadiness
    ? buildLynxEnterpriseControlsListSurface({
        controls: lynxReadiness.enterpriseControls,
      })
    : null;
  const lynxToolAvailabilityListSurface = lynxReadiness
    ? buildLynxToolAvailabilityListSurface({
        tools: lynxReadiness.tools,
      })
    : null;

  return (
    <div className="flex flex-col gap-6">
      <SectionPanel
        eyebrow={heroSection.eyebrow}
        headingLevel={1}
        title={heroCopy.title}
        description={heroCopy.description}
        aside={
          <div className="flex flex-col gap-3 text-right">
            <StatusBadge
              label={heroCopy.statusLabel}
              tone={heroCopy.statusTone}
            />
            <div className="text-xs uppercase tracking-wide text-muted">
              {organization.slug}
            </div>
          </div>
        }
      >
        <GovernedPatternBStatSection
          title="Console overview"
          surfaceKey={solutionConsoleStatSurfaceKey}
          layout="embedded"
          statGroups={[
            {
              groupKey: "console-overview",
              configuration: buildSolutionConsoleStatGrid({
                metrics: solutionConsoleMetrics.map((metric, index) => ({
                  label: metric.label,
                  value: formatSolutionConsoleMetricValue(
                    metric.id,
                    metricValues[index] ?? 0,
                  ),
                  detail: metric.detail,
                  tone: metricTones[index] ?? "neutral",
                })),
              }),
            },
          ]}
        />
      </SectionPanel>

      <GovernedPatternCListSection
        title={playbookSection.title}
        description={playbookSection.description}
        surfaceKey={surfaceKeys.playbooks}
        listConfiguration={playbookListSurface}
        parentAccessAllowed
        layout="embedded"
        headerSlot={
          <div className="mb-3">
            <h2 className="text-base font-semibold tracking-tight">
              {playbookSection.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {playbookSection.description}
            </p>
          </div>
        }
      />

      <GovernedPatternCListSection
        title={skillsSection.title}
        description={skillsSection.description}
        surfaceKey={surfaceKeys.skills}
        listConfiguration={skillsListSurface}
        parentAccessAllowed
        layout="embedded"
        headerSlot={
          <div className="mb-3">
            <h2 className="text-base font-semibold tracking-tight">
              {skillsSection.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {skillsSection.description}
            </p>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
        <SectionPanel
          title={agentSection.title}
          description={agentSection.description}
        >
          <LynxOperatorPanel />
        </SectionPanel>

        <SectionPanel
          title={evidenceSection.title}
          description={evidenceSection.description}
        >
          <div className="flex flex-col gap-4">
            <GovernedPatternCListSection
              title={evidenceSection.title}
              surfaceKey={surfaceKeys.evidence}
              listConfiguration={evidenceListSurface}
              parentAccessAllowed
              layout="embedded"
            />
            {lynxReadiness ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      Lynx readiness
                    </div>
                    <div className="mt-2 text-sm leading-6 text-muted">
                      {lynxReadiness.summary}
                    </div>
                  </div>
                  <StatusBadge
                    label={lynxReadiness.status}
                    tone={
                      lynxReadiness.status === "available"
                        ? "positive"
                        : lynxReadiness.status === "partial"
                          ? "warning"
                          : "neutral"
                    }
                  />
                </div>
                {lynxReadinessStatGrid ? (
                  <GovernedPatternBStatSection
                    title="Lynx readiness"
                    surfaceKey={lynxSurfaceKeys.stats}
                    layout="embedded"
                    statGroups={[
                      {
                        groupKey: "lynx-readiness",
                        configuration: lynxReadinessStatGrid,
                      },
                    ]}
                  />
                ) : null}
                {lynxModuleReadinessListSurface ? (
                  <GovernedPatternCListSection
                    title="Module readiness"
                    surfaceKey={lynxSurfaceKeys.modules}
                    listConfiguration={lynxModuleReadinessListSurface}
                    parentAccessAllowed
                    layout="embedded"
                  />
                ) : null}
                {lynxEnterpriseControlsListSurface ? (
                  <GovernedPatternCListSection
                    title="Enterprise controls"
                    surfaceKey={lynxSurfaceKeys.controls}
                    listConfiguration={lynxEnterpriseControlsListSurface}
                    parentAccessAllowed
                    layout="embedded"
                  />
                ) : null}
                {lynxToolAvailabilityListSurface ? (
                  <GovernedPatternCListSection
                    title="Lynx tool availability"
                    surfaceKey={lynxSurfaceKeys.tools}
                    listConfiguration={lynxToolAvailabilityListSurface}
                    parentAccessAllowed
                    layout="embedded"
                  />
                ) : null}
              </div>
            ) : null}
            <GovernedPatternCListSection
              title="Lynx run ledger"
              description="Prompts, retrieval, approvals, sandboxes, and execution state for the active organization."
              surfaceKey={lynxSurfaceKeys.activity}
              listConfiguration={lynxActivityLedgerListSurface}
              parentAccessAllowed
              layout="embedded"
            />
            <div className="flex justify-end">
              <div className="flex flex-wrap justify-end gap-2">
                <Button asChild variant="outline">
                  <Link href="/solution-console/workflows">
                    Open workflow sessions
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/solution-console/runs">Open run console</Link>
                </Button>
              </div>
            </div>
            <GovernedPatternCListSection
              title={aiLedgerSection.title}
              surfaceKey={surfaceKeys.aiUsage}
              listConfiguration={aiUsageListSurface}
              parentAccessAllowed
              layout="embedded"
            />
          </div>
        </SectionPanel>
      </div>

      <SectionPanel
        title={connectedModulesSection.title}
        description={connectedModulesSection.description}
      >
        <ModuleLinkGrid
          modules={workspaces.map((item) => ({
            id: item.moduleId,
            href: item.workspace.module.href,
            label: item.workspace.module.label,
            summary: item.workspace.module.summary,
            statusLabel: item.workspace.module.status.label,
            statusTone: item.workspace.module.status.tone,
          }))}
          renderLink={({ module, className, children }) => (
            <Link className={className} href={module.href}>
              {children}
            </Link>
          )}
        />
      </SectionPanel>
    </div>
  );
}
