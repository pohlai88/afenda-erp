import { getGatewaySpendReport } from "@afenda/ai/server";
import {
  evaluateKnowledgeEvalGate,
  listLynxEvalRuns,
} from "@afenda/feature-knowledge/server";
import {
  buildLynxEvalRunListSurface,
  getKnowledgeAdminSurfaceKeys,
} from "@afenda/feature-knowledge/metadata";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { formatErpDateTime } from "@afenda/kernel";
import { SectionPanel } from "@afenda/ui";

import { updateLynxOutcomeMonitorSettingAction } from "../actions";
import {
  getAiApprovalsSummary,
  getAiFeatureEntitlementsSummary,
  getAiSandboxesSummary,
  getAiUsageRouteSummary,
} from "../data/system-admin.lynx.query.server";
import { getTenantAiSpendEntries } from "../data/system-admin.lynx-spend.query.server";
import {
  buildGatewaySpendListSurface,
  buildSystemAdminAiApprovalsListSurface,
  buildSystemAdminAiEntitlementsListSurface,
  buildSystemAdminAiSandboxesListSurface,
  buildSystemAdminAiUsageListSurface,
  systemAdminAiApprovalsSurfaceKey,
  systemAdminAiEntitlementsSurfaceKey,
  systemAdminAiSandboxesSurfaceKey,
  systemAdminAiUsageSurfaceKey,
  systemAdminGatewaySpendSurfaceKey,
  systemAdminLynxUiCopy,
} from "../metadata";
import { requireSystemAdminLynxRead } from "../policies";
import {
  AiFeatureEntitlementTrailingCell,
  LynxOutcomeMonitorSection,
  SandboxTrailingCell,
  SystemAdminLynxAccessDenied,
} from "./index";

export async function SystemAdminLynxPage() {
  let organization: Awaited<
    ReturnType<typeof requireSystemAdminLynxRead>
  >["organization"];

  try {
    ({ organization } = await requireSystemAdminLynxRead());
  } catch {
    return <SystemAdminLynxAccessDenied />;
  }

  const copy = systemAdminLynxUiCopy;
  const canApprove = organization.capabilities.includes(
    "system-admin.lynx.approve",
  );

  const [
    usageRows,
    approvalRows,
    sandboxRows,
    entitlements,
    spendReport,
    tenantSpendEntries,
    evalRuns,
  ] = await Promise.all([
    getAiUsageRouteSummary({ organizationId: organization.id, limit: 50 }),
    getAiApprovalsSummary({ organizationId: organization.id, limit: 50 }),
    getAiSandboxesSummary({ organizationId: organization.id, limit: 50 }),
    getAiFeatureEntitlementsSummary({ organizationId: organization.id }),
    getGatewaySpendReport({ organizationId: organization.id }),
    getTenantAiSpendEntries({ organizationId: organization.id }),
    listLynxEvalRuns(organization.id, 20),
  ]);

  const knowledgeSurfaceKeys = getKnowledgeAdminSurfaceKeys();
  const gatewayEntries =
    spendReport.available && spendReport.entries.length > 0
      ? spendReport.entries.map((entry) => {
          const featureTag = entry.tag.startsWith("feature:")
            ? entry.tag.slice("feature:".length)
            : entry.tag;
          return {
            model: entry.tag.startsWith("model:") ? entry.tag.slice(6) : "-",
            feature: featureTag,
            totalCost: `$${entry.costUsd.toFixed(4)}`,
            totalTokens: String(entry.requestCount),
          };
        })
      : tenantSpendEntries;

  return (
    <div className="flex flex-col gap-surface-2xl">
      <SectionPanel
        headingLevel={1}
        title={copy.page.title}
        description={copy.page.description}
        aside={
          <a
            href="/knowledge"
            className="type-body font-medium text-foreground underline-offset-4 hover:underline"
          >
            {copy.page.knowledgeAdminLinkLabel}
          </a>
        }
      />

      <GovernedPatternCListSection
        title={copy.usage.title}
        description={copy.usage.description}
        surfaceKey={systemAdminAiUsageSurfaceKey}
        listConfiguration={buildSystemAdminAiUsageListSurface({
          events: usageRows,
        })}
        parentAccessAllowed
        layout="embedded"
      />

      <GovernedPatternCListSection
        title={copy.gatewaySpend.title}
        description={
          spendReport.authenticationFailed
            ? copy.gatewaySpend.descriptionAuthFailed
            : spendReport.available
              ? copy.gatewaySpend.descriptionAvailable
              : copy.gatewaySpend.descriptionFallback
        }
        surfaceKey={systemAdminGatewaySpendSurfaceKey}
        listConfiguration={buildGatewaySpendListSurface({
          available: spendReport.available || tenantSpendEntries.length > 0,
          authenticationFailed: spendReport.authenticationFailed,
          entries: gatewayEntries,
        })}
        parentAccessAllowed
        layout="embedded"
      />

      <GovernedPatternCListSection
        title={copy.entitlements.title}
        description={copy.entitlements.description}
        surfaceKey={systemAdminAiEntitlementsSurfaceKey}
        listConfiguration={buildSystemAdminAiEntitlementsListSurface({
          entitlements,
          canMutate: canApprove,
        })}
        parentAccessAllowed
        layout="embedded"
        trailingColumn={{
          header: "Actions",
          Cell: AiFeatureEntitlementTrailingCell,
        }}
      />

      <GovernedPatternCListSection
        title={copy.approvals.title}
        description={copy.approvals.description}
        surfaceKey={systemAdminAiApprovalsSurfaceKey}
        listConfiguration={buildSystemAdminAiApprovalsListSurface({
          proposals: approvalRows,
        })}
        parentAccessAllowed
        layout="embedded"
      />

      <div id="lynx-sandboxes-list">
        <GovernedPatternCListSection
          title={copy.sandboxes.title}
          description={copy.sandboxes.description}
          surfaceKey={systemAdminAiSandboxesSurfaceKey}
          listConfiguration={buildSystemAdminAiSandboxesListSurface({
            sandboxes: sandboxRows,
            canMutate: canApprove,
          })}
          parentAccessAllowed
          layout="embedded"
          trailingColumn={{
            header: "Actions",
            Cell: SandboxTrailingCell,
          }}
        />
      </div>

      <GovernedPatternCListSection
        title={copy.evalRuns.title}
        description={copy.evalRuns.description}
        surfaceKey={knowledgeSurfaceKeys.evalRuns}
        listConfiguration={buildLynxEvalRunListSurface({
          rows: evalRuns.map((run) => ({
            id: run.id,
            evalSetId: run.evalSetId,
            caseCount: String(run.caseCount),
            recallAtK: run.recallAtK,
            mrr: run.mrr,
            evidenceOverlap: run.evidenceOverlap,
            qualityGate:
              evaluateKnowledgeEvalGate({
                recallAtK: Number(run.recallAtK),
                mrr: Number(run.mrr),
                evidenceOverlap: Number(run.evidenceOverlap),
                faithfulness:
                  typeof run.qualityMetrics.faithfulness === "number"
                    ? run.qualityMetrics.faithfulness
                    : 1,
                citationPrecision:
                  typeof run.qualityMetrics.citationPrecision === "number"
                    ? run.qualityMetrics.citationPrecision
                    : 1,
                unsupportedClaimRate:
                  typeof run.qualityMetrics.unsupportedClaimRate === "number"
                    ? run.qualityMetrics.unsupportedClaimRate
                    : 0,
                noAnswerCorrectness:
                  typeof run.qualityMetrics.noAnswerCorrectness === "number"
                    ? run.qualityMetrics.noAnswerCorrectness
                    : 1,
                promptInjectionResilience:
                  typeof run.qualityMetrics.promptInjectionResilience ===
                  "number"
                    ? run.qualityMetrics.promptInjectionResilience
                    : 1,
              }).length === 0
                ? "Pass"
                : "Review",
            failedCases: String(run.failureSamples.length),
            ranAt: formatErpDateTime(run.ranAt),
          })),
        })}
        parentAccessAllowed
        layout="embedded"
      />

      <LynxOutcomeMonitorSection
        organizationId={organization.id}
        canWrite={canApprove}
        updateLynxOutcomeMonitorSettingAction={
          updateLynxOutcomeMonitorSettingAction
        }
      />

      <SectionPanel
        title={copy.productSurfaces.title}
        description={copy.productSurfaces.description}
      >
        <a
          href="/lynx/runs"
          className="type-body font-medium text-foreground underline-offset-4 hover:underline"
        >
          {copy.productSurfaces.runsLinkLabel}
        </a>
      </SectionPanel>
    </div>
  );
}
