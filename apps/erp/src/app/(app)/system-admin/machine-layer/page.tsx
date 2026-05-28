import { requireCapability } from "@afenda/auth/server";
import { getGatewaySpendReport } from "@afenda/ai";
import { evaluateKnowledgeEvalGate, listLynxEvalRuns } from "@afenda/feature-knowledge/server";
import {
  buildLynxEvalRunListSurface,
  getKnowledgeAdminSurfaceKeys,
} from "@afenda/feature-knowledge/metadata";
import {
  buildGatewaySpendListSurface,
  buildSystemAdminAiApprovalsListSurface,
  buildSystemAdminAiEntitlementsListSurface,
  buildSystemAdminAiSandboxesListSurface,
  buildSystemAdminAiUsageListSurface,
  getAiApprovalsSummary,
  getAiFeatureEntitlementsSummary,
  getAiSandboxesSummary,
  getAiUsageRouteSummary,
  getTenantAiSpendEntries,
  systemAdminAiApprovalsSurfaceKey,
  systemAdminAiEntitlementsSurfaceKey,
  systemAdminAiSandboxesSurfaceKey,
  systemAdminAiUsageSurfaceKey,
  systemAdminGatewaySpendSurfaceKey,
} from "@afenda/feature-system-admin/server";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { LynxOutcomeMonitorSection } from "@/components/system-admin/lynx-outcome-monitor-section";
import { AiFeatureEntitlementTrailingCell } from "@/components/ai-elements/ai-feature-entitlement-trailing-cell.client";
import { SandboxTrailingCell } from "@/components/ai-elements/sandbox-trailing-cell.client";

export const metadata: Metadata = {
  title: "Machine layer — System admin",
  description:
    "Lynx usage, approvals, sandboxes, and gateway spend for this tenant.",
};

export default async function SystemAdminMachineLayerPage() {
  const { organization } = await requireCapability(
    "system-admin.machine-layer.read",
  );
  const canApprove = organization.capabilities.includes(
    "system-admin.machine-layer.approve",
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
    <div className="flex flex-col gap-6">
      <SectionPanel
        headingLevel={1}
        title="Machine layer operations"
        description="Org-scoped Lynx and machine governance for the active tenant."
        aside={
          <Link
            href="/knowledge"
            className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
          >
            Knowledge admin
          </Link>
        }
      />

      <GovernedPatternCListSection
        title="Machine usage ledger"
        description="Recent model calls, token totals, and latency for this tenant."
        surfaceKey={systemAdminAiUsageSurfaceKey}
        listConfiguration={buildSystemAdminAiUsageListSurface({ events: usageRows })}
        parentAccessAllowed
        layout="embedded"
      />

      <GovernedPatternCListSection
        title="Gateway spend"
        description={
          spendReport.authenticationFailed
            ? "Gateway API key was rejected. Refresh AI_GATEWAY_API_KEY from the Vercel AI Gateway console."
            : spendReport.available
              ? "Month-to-date AI Gateway spend when billing credentials are configured."
              : "Tenant-scoped usage totals derived from the machine usage ledger."
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
        title="Machine feature entitlements"
        description="Per-tenant enable/disable controls for machine-layer features."
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
        title="Approval proposals"
        description="Human-approved machine proposals recorded for audit and replay."
        surfaceKey={systemAdminAiApprovalsSurfaceKey}
        listConfiguration={buildSystemAdminAiApprovalsListSurface({
          proposals: approvalRows,
        })}
        parentAccessAllowed
        layout="embedded"
      />

      <div id="machine-sandboxes-list">
        <GovernedPatternCListSection
          title="Lynx action sandboxes"
          description="Approve, reject, or discard pending machine proposals."
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
        title="Lynx eval runs"
        description="Recall@K, MRR, and evidence overlap from the knowledge substrate."
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
            ranAt: run.ranAt.toLocaleString(),
          })),
        })}
        parentAccessAllowed
        layout="embedded"
      />

      <LynxOutcomeMonitorSection
        organizationId={organization.id}
        canWrite={canApprove}
      />

      <SectionPanel
        title="Lynx product surfaces"
        description="Outcome monitors and workflow sessions remain on the solution console."
      >
        <Link
          href="/solution-console/runs"
          className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          Open solution console runs
        </Link>
      </SectionPanel>
    </div>
  );
}
