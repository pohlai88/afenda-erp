import {
  countKnowledgeChunks,
  countKnowledgeDocuments,
  getKnowledgeOrgSetting,
  evaluateKnowledgeEvalGate,
  listKnowledgeSources,
  listLynxEvalRuns,
  listRecentKnowledgeChunks,
} from "@afenda/feature-knowledge/server";
import {
  buildKnowledgeChunksListSurface,
  buildKnowledgeSettingsListSurface,
  buildKnowledgeSourcesListSurface,
  buildLynxEvalRunListSurface,
  getKnowledgeAdminSurfaceKeys,
} from "@afenda/feature-knowledge/metadata";
import { requireCapability } from "@afenda/auth/server";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel, StatusBadge } from "@afenda/ui";
import type { Metadata } from "next";
import { LynxTruthPanel } from "@afenda/feature-lynx/client";

export const metadata: Metadata = {
  title: "Knowledge — Admin",
  description: "Manage knowledge sources, chunks, and retrieval settings.",
};

function formatEnabled(enabled: boolean) {
  return enabled ? "Enabled" : "Disabled";
}

export default async function KnowledgeAdminPage() {
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

  const surfaceKeys = getKnowledgeAdminSurfaceKeys();

  const sourcesListSurface = buildKnowledgeSourcesListSurface({
    rows: sources.map((source) => ({
      id: source.id,
      name: source.name,
      kind: source.kind,
      enabled: formatEnabled(source.enabled),
      lastSynced: source.lastSyncedAt
        ? source.lastSyncedAt.toLocaleDateString()
        : "Never synced",
    })),
  });

  const chunksListSurface = buildKnowledgeChunksListSurface({
    rows: recentChunks.map((chunk) => ({
      id: chunk.id,
      title: chunk.title,
      excerpt: chunk.body,
      createdAt: chunk.createdAt.toLocaleDateString(),
    })),
  });

  const settingsListSurface = buildKnowledgeSettingsListSurface({
    rows: [
      {
        id: "hybrid",
        setting: "Hybrid retrieval",
        value: orgSetting?.retrievalHybridEnabled ? "Enabled" : "Disabled",
      },
      {
        id: "rerank",
        setting: "Reranking",
        value: orgSetting?.retrievalRerankEnabled ? "Enabled" : "Disabled",
      },
      {
        id: "zdr",
        setting: "Zero data retention",
        value: orgSetting?.enforceZdr ? "Enabled" : "Disabled",
      },
    ],
  });

  return (
    <div className="flex flex-col gap-6">
      <SectionPanel
        eyebrow="Machine layer substrate"
        headingLevel={1}
        title="Knowledge"
        description="Sources, indexed chunks, retrieval settings, and Lynx eval runs for the active organization."
        aside={
          <div className="flex flex-col gap-3 text-right">
            <StatusBadge label="Admin" tone="neutral" />
            <div className="text-xs uppercase tracking-wide text-muted">
              {organization.slug}
            </div>
          </div>
        }
      >
        <dl className="grid gap-4 sm:grid-cols-3">
          <OverviewStat label="Sources" value={sources.length} />
          <OverviewStat label="Documents" value={documentCount} />
          <OverviewStat label="Chunks" value={chunkCount} />
        </dl>
      </SectionPanel>

      <GovernedPatternCListSection
        title="Retrieval settings"
        description="Hybrid retrieval, reranking, and ZDR policy for this tenant."
        surfaceKey={surfaceKeys.settings}
        listConfiguration={settingsListSurface}
        parentAccessAllowed
        layout="embedded"
      />

      <LynxTruthPanel />

      <GovernedPatternCListSection
        title="Knowledge sources"
        description="Configured ingestion adapters. Sync via /api/cron/knowledge-sync."
        surfaceKey={surfaceKeys.sources}
        listConfiguration={sourcesListSurface}
        parentAccessAllowed
        layout="embedded"
      />

      <GovernedPatternCListSection
        title={`Recent chunks (${chunkCount} total)`}
        description="Latest indexed passages available to Lynx truth retrieval and operator tools."
        surfaceKey={surfaceKeys.chunks}
        listConfiguration={chunksListSurface}
        parentAccessAllowed
        layout="embedded"
      />

      <GovernedPatternCListSection
        title="Lynx eval runs"
        description="Recall@K, MRR, and evidence overlap per retrieval eval set."
        surfaceKey={surfaceKeys.evalRuns}
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
    </div>
  );
}

function OverviewStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-line bg-surface-strong px-4 py-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
        {value}
      </dd>
    </div>
  );
}
