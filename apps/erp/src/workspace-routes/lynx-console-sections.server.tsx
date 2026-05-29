import { LynxOperatorPanel } from "@afenda/feature-lynx/client";
import {
  getLynxConsoleSection,
  lynxConsoleStatSurfaceKey,
} from "@afenda/feature-lynx/metadata";
import {
  GovernedPatternBStatSection,
  GovernedPatternCListSection,
} from "@afenda/governed-surface/server";
import { loadLynxConsoleSession } from "@/workspace-routes/workspace-route-cache";
import { Button, ModuleLinkGrid, SectionPanel, StatusBadge } from "@afenda/ui";
import Link from "next/link";

export async function LynxConsoleHeroSection() {
  const { organization, pageModel } = await loadLynxConsoleSession();
  const heroSection = getLynxConsoleSection("hero");

  return (
    <SectionPanel
      eyebrow={heroSection.eyebrow}
      headingLevel={1}
      title={pageModel.heroCopy.title}
      description={pageModel.heroCopy.description}
      aside={
        <div className="flex flex-col gap-3 text-right">
          <StatusBadge
            label={pageModel.heroCopy.statusLabel}
            tone={pageModel.heroCopy.statusTone}
          />
          <div className="type-caption uppercase tracking-wide text-muted">
            {organization.slug}
          </div>
        </div>
      }
    >
      <GovernedPatternBStatSection
        title="Console overview"
        surfaceKey={lynxConsoleStatSurfaceKey}
        layout="embedded"
        statGroups={[
          {
            groupKey: "console-overview",
            configuration: pageModel.statGrid,
          },
        ]}
      />
    </SectionPanel>
  );
}

export async function LynxConsoleCatalogSection() {
  const { pageModel } = await loadLynxConsoleSession();
  const playbookSection = getLynxConsoleSection("playbookCatalog");
  const skillsSection = getLynxConsoleSection("operationalSkills");

  return (
    <>
      <GovernedPatternCListSection
        title={playbookSection.title}
        description={playbookSection.description}
        surfaceKey={pageModel.surfaceKeys.playbooks}
        listConfiguration={pageModel.playbookList}
        parentAccessAllowed
        layout="embedded"
      />
      <GovernedPatternCListSection
        title={skillsSection.title}
        description={skillsSection.description}
        surfaceKey={pageModel.surfaceKeys.skills}
        listConfiguration={pageModel.skillsList}
        parentAccessAllowed
        layout="embedded"
      />
    </>
  );
}

export async function LynxConsoleWorkspaceSection() {
  const { pageModel } = await loadLynxConsoleSession();
  const agentSection = getLynxConsoleSection("agentWorkspace");
  const evidenceSection = getLynxConsoleSection("evidenceCoverage");
  const aiLedgerSection = getLynxConsoleSection("aiUsageLedger");
  const readiness = pageModel.readiness;

  return (
    <div className="@container grid gap-surface-2xl @xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
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
        <div className="flex flex-col gap-surface-lg">
          <GovernedPatternCListSection
            title={evidenceSection.title}
            surfaceKey={pageModel.surfaceKeys.evidence}
            listConfiguration={pageModel.evidenceList}
            parentAccessAllowed
            layout="embedded"
          />
          {readiness ? (
            <div className="flex flex-col gap-surface-lg">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="type-body font-semibold text-foreground">
                    Lynx readiness
                  </div>
                  <p className="mt-2 type-body leading-6 text-muted">
                    {readiness.summary}
                  </p>
                </div>
                <StatusBadge
                  label={readiness.status}
                  tone={
                    readiness.status === "available"
                      ? "positive"
                      : readiness.status === "partial"
                        ? "warning"
                        : "neutral"
                  }
                />
              </div>
              {readiness.statGrid ? (
                <GovernedPatternBStatSection
                  title="Lynx readiness"
                  surfaceKey={pageModel.lynxSurfaceKeys.stats}
                  layout="embedded"
                  statGroups={[
                    {
                      groupKey: "lynx-readiness",
                      configuration: readiness.statGrid,
                    },
                  ]}
                />
              ) : null}
              {readiness.moduleList ? (
                <GovernedPatternCListSection
                  title="Module readiness"
                  surfaceKey={pageModel.lynxSurfaceKeys.modules}
                  listConfiguration={readiness.moduleList}
                  parentAccessAllowed
                  layout="embedded"
                />
              ) : null}
              {readiness.controlsList ? (
                <GovernedPatternCListSection
                  title="Enterprise controls"
                  surfaceKey={pageModel.lynxSurfaceKeys.controls}
                  listConfiguration={readiness.controlsList}
                  parentAccessAllowed
                  layout="embedded"
                />
              ) : null}
              {readiness.toolsList ? (
                <GovernedPatternCListSection
                  title="Lynx tool availability"
                  surfaceKey={pageModel.lynxSurfaceKeys.tools}
                  listConfiguration={readiness.toolsList}
                  parentAccessAllowed
                  layout="embedded"
                />
              ) : null}
            </div>
          ) : null}
          <GovernedPatternCListSection
            title="Lynx run ledger"
            description="Prompts, retrieval, approvals, sandboxes, and execution state for the active organization."
            surfaceKey={pageModel.lynxSurfaceKeys.activity}
            listConfiguration={pageModel.activityLedgerList}
            parentAccessAllowed
            layout="embedded"
          />
          <div className="flex justify-end">
            <div className="flex flex-wrap justify-end gap-2">
              <Button asChild variant="outline">
                <Link href="/lynx/workflows">Open workflow sessions</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/lynx/runs">Open run console</Link>
              </Button>
            </div>
          </div>
          <GovernedPatternCListSection
            title={aiLedgerSection.title}
            surfaceKey={pageModel.surfaceKeys.aiUsage}
            listConfiguration={pageModel.aiUsageList}
            parentAccessAllowed
            layout="embedded"
          />
        </div>
      </SectionPanel>
    </div>
  );
}

export async function LynxConsoleModulesSection() {
  const { pageModel } = await loadLynxConsoleSession();
  const connectedModulesSection = getLynxConsoleSection("connectedModules");

  return (
    <SectionPanel
      title={connectedModulesSection.title}
      description={connectedModulesSection.description}
    >
      <ModuleLinkGrid
        modules={pageModel.moduleLinks}
        renderLink={({ module, className, children }) => (
          <Link className={className} href={module.href}>
            {children}
          </Link>
        )}
      />
    </SectionPanel>
  );
}
