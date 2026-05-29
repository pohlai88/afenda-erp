import {
  LynxConsoleCatalogSection,
  LynxConsoleHeroSection,
  LynxConsoleModulesSection,
  LynxConsoleWorkspaceSection,
} from "@/workspace-routes/lynx-console-sections.server";
import {
  DashboardPriorityColumnSkeleton,
  GovernedListSectionSkeleton,
  LynxConsoleHeroSkeleton,
} from "@/workspace-routes/workspace-section-skeletons";
import { Suspense } from "react";

export function LynxConsoleRoutePage() {
  return (
    <div className="flex flex-col gap-surface-2xl">
      <Suspense fallback={<LynxConsoleHeroSkeleton />}>
        <LynxConsoleHeroSection />
      </Suspense>

      <Suspense
        fallback={
          <>
            <GovernedListSectionSkeleton rows={5} />
            <GovernedListSectionSkeleton rows={4} />
          </>
        }
      >
        <LynxConsoleCatalogSection />
      </Suspense>

      <Suspense fallback={<DashboardPriorityColumnSkeleton />}>
        <LynxConsoleWorkspaceSection />
      </Suspense>

      <Suspense fallback={<GovernedListSectionSkeleton rows={3} />}>
        <LynxConsoleModulesSection />
      </Suspense>
    </div>
  );
}
