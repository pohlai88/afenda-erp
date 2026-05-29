/**
 * Module section catch-all (system-admin + HR). Slug → thin app adapter → feature package.
 */
import { SystemAdminSectionSkeleton } from "@/app-route-state/route-states";
import {
  loadHrEmployeeCreate,
  loadHrEmployeeDetail,
  loadHrSection,
  hrSectionSlugs,
  resolveHrSectionRoute,
  type HrSectionPageProps,
} from "@/lib/hr-sections/registry.server";
import { assertHrModuleId, HR_MODULE_ID } from "@/lib/hr-route.shared";
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
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const unstable_instant = {
  prefetch: "static",
  unstable_disableValidation: true,
};

type ModuleSectionRouteProps = {
  params: Promise<{ moduleId: string; section: string[] }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export function generateStaticParams() {
  return [
    ...systemAdminSectionSlugs.map((slug) => ({
      moduleId: SYSTEM_ADMIN_MODULE_ID,
      section: [slug],
    })),
    ...hrSectionSlugs.map((slug) => ({
      moduleId: HR_MODULE_ID,
      section: [slug],
    })),
  ];
}

export async function generateMetadata({
  params,
}: ModuleSectionRouteProps): Promise<Metadata> {
  const { moduleId, section } = await params;

  if (moduleId === SYSTEM_ADMIN_MODULE_ID) {
    assertSystemAdminModuleId(moduleId);
    const slug = resolveSystemAdminSectionSlug(section);
    const sectionModule = await loadSystemAdminSection(slug);
    return sectionModule.metadata ?? {};
  }

  if (moduleId === HR_MODULE_ID) {
    assertHrModuleId(moduleId);
    const route = resolveHrSectionRoute(section);
    if (route.kind === "employee-detail") {
      const sectionModule = await loadHrEmployeeDetail();
      return sectionModule.metadata ?? {};
    }
    if (route.kind === "employee-create") {
      const sectionModule = await loadHrEmployeeCreate();
      return sectionModule.metadata ?? {};
    }
    const sectionModule = await loadHrSection(route.slug);
    return sectionModule.metadata ?? {};
  }

  notFound();
}

export default function ModuleSectionRoute({
  params,
  searchParams,
}: ModuleSectionRouteProps) {
  return (
    <Suspense fallback={<SystemAdminSectionSkeleton />}>
      {params.then(async ({ moduleId, section }) => {
        if (moduleId === SYSTEM_ADMIN_MODULE_ID) {
          assertSystemAdminModuleId(moduleId);
          const slug = resolveSystemAdminSectionSlug(section);
          const { default: SectionPage } = await loadSystemAdminSection(slug);
          return (
            <SectionPage
              searchParams={
                searchParams as SystemAdminSectionPageProps["searchParams"]
              }
            />
          );
        }

        if (moduleId === HR_MODULE_ID) {
          assertHrModuleId(moduleId);
          const route = resolveHrSectionRoute(section);

          if (route.kind === "employee-detail") {
            const { default: DetailPage } = await loadHrEmployeeDetail();
            return <DetailPage employeeId={route.employeeId} />;
          }

          if (route.kind === "employee-create") {
            const { default: CreatePage } = await loadHrEmployeeCreate();
            return <CreatePage />;
          }

          const { default: SectionPage } = await loadHrSection(route.slug);
          return (
            <SectionPage
              searchParams={searchParams as HrSectionPageProps["searchParams"]}
            />
          );
        }

        notFound();
      })}
    </Suspense>
  );
}
