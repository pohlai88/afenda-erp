import { LynxTruthPanel } from "@afenda/feature-lynx/client";
import {
  KnowledgeAdminHeaderSection,
  KnowledgeChunksSection,
  KnowledgeEvalRunsSection,
  KnowledgeOverviewSection,
  KnowledgeSettingsSection,
  KnowledgeSourcesSection,
} from "@/routes/workspace/knowledge/knowledge-route.sections.server";
import {
  GovernedListSectionSkeleton,
  GovernedStatSectionSkeleton,
  ModuleScreenHeaderSkeleton,
} from "@/routes/workspace/shared/workspace-section-skeletons";
import { Suspense } from "react";

export function KnowledgeAdminRoutePage() {
  return (
    <div className="flex flex-col gap-surface-2xl">
      <Suspense fallback={<ModuleScreenHeaderSkeleton />}>
        <KnowledgeAdminHeaderSection />
      </Suspense>

      <Suspense fallback={<GovernedStatSectionSkeleton statCount={3} />}>
        <KnowledgeOverviewSection />
      </Suspense>

      <Suspense fallback={<GovernedListSectionSkeleton rows={3} />}>
        <KnowledgeSettingsSection />
      </Suspense>

      <LynxTruthPanel />

      <Suspense fallback={<GovernedListSectionSkeleton rows={5} />}>
        <KnowledgeSourcesSection />
      </Suspense>

      <Suspense fallback={<GovernedListSectionSkeleton rows={6} />}>
        <KnowledgeChunksSection />
      </Suspense>

      <Suspense fallback={<GovernedListSectionSkeleton rows={5} />}>
        <KnowledgeEvalRunsSection />
      </Suspense>
    </div>
  );
}
