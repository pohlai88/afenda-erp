/**
 * System-admin section entry (catch-all). Does not encode which screen renders;
 * see `@/lib/system-admin-sections/manifest.shared.ts` (slug → adapter → feature).
 */
import { SystemAdminSectionSkeleton } from "@/app-route-state/route-states";
import {
  loadSystemAdminSection,
  resolveSystemAdminSectionSlug,
  systemAdminSectionSlugs,
  type SystemAdminSectionPageProps,
} from "@/lib/system-admin-sections/registry.server";
import {
  assertSystemAdminModuleId,
  SYSTEM_ADMIN_MODULE_ID,
} from "@/lib/system-admin-route.shared";
import type { WorkspaceRouteInstant } from "@/workspace-routes/workspace-route-instant";
import type { Metadata } from "next";
import { Suspense } from "react";

export const unstable_instant = {
  prefetch: "static",
} as const satisfies WorkspaceRouteInstant;

type SystemAdminSectionRouteProps = {
  params: Promise<{ moduleId: string; section: string[] }>;
} & SystemAdminSectionPageProps;

export function generateStaticParams() {
  return systemAdminSectionSlugs.map((slug) => ({
    moduleId: SYSTEM_ADMIN_MODULE_ID,
    section: [slug],
  }));
}

export async function generateMetadata({
  params,
}: SystemAdminSectionRouteProps): Promise<Metadata> {
  const { moduleId, section } = await params;
  assertSystemAdminModuleId(moduleId);
  const slug = resolveSystemAdminSectionSlug(section);
  const sectionModule = await loadSystemAdminSection(slug);

  return sectionModule.metadata ?? {};
}

export default function SystemAdminSectionRoute({
  params,
  searchParams,
}: SystemAdminSectionRouteProps) {
  return (
    <Suspense fallback={<SystemAdminSectionSkeleton />}>
      {params.then(async ({ moduleId, section }) => {
        assertSystemAdminModuleId(moduleId);
        const slug = resolveSystemAdminSectionSlug(section);
        const { default: SectionPage } = await loadSystemAdminSection(slug);

        return <SectionPage searchParams={searchParams} />;
      })}
    </Suspense>
  );
}
