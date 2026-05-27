import { requireCapability } from "@afenda/auth/server";
import { getOperationalSkills } from "@afenda/ai";
import {
  buildOperationalSkillsListSurface,
  buildRecoveryPlaybookListSurface,
  buildSolutionConsoleAiUsageListSurface,
  buildSolutionConsoleEvidenceListSurface,
  buildSolutionConsoleStatGrid,
  describeWorkspaceDataSource,
  getAccessibleModules,
  getAiUsageRouteSummary,
  getModuleWorkspace,
  getModuleWorkspaceStats,
  getNavigationExtensionById,
  getNavigationExtensionHeroCopy,
  getRecoveryConsoleModuleIds,
  getRecoveryPlaybookDefinitions,
  getSolutionConsoleListSurfaceKeys,
  getSolutionConsoleSection,
  resolveWorkspaceDataMode,
  solutionConsoleMetrics,
  solutionConsoleStatSurfaceKey,
} from "@afenda/domain";
import {
  GovernedPatternBStatSection,
  GovernedPatternCListSection,
} from "@afenda/governed-surface/server";
import {
  ModuleLinkGrid,
  SectionPanel,
  StatusBadge,
} from "@afenda/ui";
import Link from "next/link";
import { SolutionProviderPanel } from "./solution-provider-panel";

const recoveryModuleIds = getRecoveryConsoleModuleIds();

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
  const [workspaces, aiUsageRows] = await Promise.all([
    workspacesPromise,
    aiUsageRowsPromise,
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

  return (
    <div className="space-y-6">
      <SectionPanel
        eyebrow={heroSection.eyebrow}
        headingLevel={1}
        title={heroCopy.title}
        description={heroCopy.description}
        aside={
          <div className="space-y-3 text-right">
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
                  value: String(metricValues[index] ?? 0),
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
      />

      <GovernedPatternCListSection
        title={skillsSection.title}
        description={skillsSection.description}
        surfaceKey={surfaceKeys.skills}
        listConfiguration={skillsListSurface}
        parentAccessAllowed
        layout="embedded"
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
        <SectionPanel
          title={agentSection.title}
          description={agentSection.description}
        >
          <SolutionProviderPanel />
        </SectionPanel>

        <SectionPanel
          title={evidenceSection.title}
          description={evidenceSection.description}
        >
          <div className="space-y-4">
            <GovernedPatternCListSection
              title={evidenceSection.title}
              description={evidenceSection.description}
              surfaceKey={surfaceKeys.evidence}
              listConfiguration={evidenceListSurface}
              parentAccessAllowed
              layout="embedded"
            />
            <div className="rounded-lg border border-line bg-surface-strong p-4">
              <div className="text-sm font-semibold text-foreground">
                {aiLedgerSection.title}
              </div>
              <div className="mt-2 text-sm leading-6 text-muted">
                {aiLedgerSection.description}
              </div>
              <div className="mt-4">
                <GovernedPatternCListSection
                  title={aiLedgerSection.title}
                  surfaceKey={surfaceKeys.aiUsage}
                  listConfiguration={aiUsageListSurface}
                  parentAccessAllowed
                  layout="embedded"
                />
              </div>
            </div>
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
