import { evaluateKnowledgeEvalGate } from "@afenda/feature-knowledge/server";
import {
  buildKnowledgeChunksListSurface,
  buildKnowledgeSettingsListSurface,
  buildKnowledgeSourcesListSurface,
  buildLynxEvalRunListSurface,
  getKnowledgeAdminSurfaceKeys,
} from "@afenda/feature-knowledge/metadata";
import {
  buildGovernedStatGrid,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import {
  GovernedPatternBStatSection,
  GovernedPatternCListSection,
} from "@afenda/governed-surface/server";
import { loadKnowledgeAdminBundle } from "@/workspace-routes/workspace-route-cache";
import { SectionPanel, StatusBadge } from "@afenda/ui";

const knowledgeOverviewStatSurfaceKey = "knowledge.admin.overview";

function formatEnabled(enabled: boolean) {
  return enabled ? "Enabled" : "Disabled";
}

export async function KnowledgeAdminHeaderSection() {
  const { organization } = await loadKnowledgeAdminBundle();

  return (
    <SectionPanel
      eyebrow="Machine layer substrate"
      headingLevel={1}
      title="Knowledge"
      description="Sources, indexed chunks, retrieval settings, and Lynx eval runs for the active organization."
      aside={
        <div className="flex flex-col gap-3 text-right">
          <StatusBadge label="Admin" tone="neutral" />
          <div className="type-caption uppercase tracking-wide">
            {organization.slug}
          </div>
        </div>
      }
    />
  );
}

export async function KnowledgeOverviewSection() {
  const { sources, chunkCount, documentCount } = await loadKnowledgeAdminBundle();
  const overviewStatGrid = buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "kpi",
    presentationProfile: "erp-kpi-grid",
    stats: [
      {
        label: "Sources",
        value: String(sources.length),
        tone: "positive",
      },
      {
        label: "Documents",
        value: String(documentCount),
        tone: "positive",
      },
      {
        label: "Chunks",
        value: String(chunkCount),
        tone: "positive",
      },
    ],
  });

  return (
    <GovernedPatternBStatSection
      title="Substrate inventory"
      surfaceKey={knowledgeOverviewStatSurfaceKey}
      layout="embedded"
      statGroups={[
        {
          groupKey: "knowledge-overview",
          configuration: overviewStatGrid,
        },
      ]}
    />
  );
}

export async function KnowledgeSettingsSection() {
  const { orgSetting } = await loadKnowledgeAdminBundle();
  const surfaceKeys = getKnowledgeAdminSurfaceKeys();
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
    <GovernedPatternCListSection
      title="Retrieval settings"
      description="Hybrid retrieval, reranking, and ZDR policy for this tenant."
      surfaceKey={surfaceKeys.settings}
      listConfiguration={settingsListSurface}
      parentAccessAllowed
      layout="embedded"
    />
  );
}

export async function KnowledgeSourcesSection() {
  const { sources } = await loadKnowledgeAdminBundle();
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

  return (
    <GovernedPatternCListSection
      title="Knowledge sources"
      description="Configured ingestion adapters. Sync via /api/cron/knowledge-sync."
      surfaceKey={surfaceKeys.sources}
      listConfiguration={sourcesListSurface}
      parentAccessAllowed
      layout="embedded"
    />
  );
}

export async function KnowledgeChunksSection() {
  const { recentChunks, chunkCount } = await loadKnowledgeAdminBundle();
  const surfaceKeys = getKnowledgeAdminSurfaceKeys();
  const chunksListSurface = buildKnowledgeChunksListSurface({
    rows: recentChunks.map((chunk) => ({
      id: chunk.id,
      title: chunk.title,
      excerpt: chunk.body,
      createdAt: chunk.createdAt.toLocaleDateString(),
    })),
  });

  return (
    <GovernedPatternCListSection
      title={`Recent chunks (${chunkCount} total)`}
      description="Latest indexed passages available to Lynx truth retrieval and operator tools."
      surfaceKey={surfaceKeys.chunks}
      listConfiguration={chunksListSurface}
      parentAccessAllowed
      layout="embedded"
    />
  );
}

export async function KnowledgeEvalRunsSection() {
  const { evalRuns } = await loadKnowledgeAdminBundle();
  const surfaceKeys = getKnowledgeAdminSurfaceKeys();

  return (
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
  );
}
