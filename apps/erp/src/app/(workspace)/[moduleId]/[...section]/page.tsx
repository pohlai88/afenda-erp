/**
 * Module section catch-all (system-admin, hr). Slug → thin app adapter → feature package.
 */
import {
  HrCompliancePageSkeleton,
  SystemAdminSectionSkeleton,
} from "@/app-route-state/route-states";
import { ModuleSectionRouteSkeleton } from "@/app-route-state/module-section-route-skeleton.client";
import {
  loadHrSection,
  resolveHrSectionSlug,
  hrSectionSlugs,
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

async function resolveSectionMetadata(
  moduleId: string,
  section: string[],
): Promise<Metadata> {
  if (moduleId === SYSTEM_ADMIN_MODULE_ID) {
    assertSystemAdminModuleId(moduleId);
    const slug = resolveSystemAdminSectionSlug(section);
    const sectionModule = await loadSystemAdminSection(slug);
    return sectionModule.metadata ?? {};
  }

  if (moduleId === HR_MODULE_ID) {
    assertHrModuleId(moduleId);
    const slug = resolveHrSectionSlug(section);
    const sectionModule = await loadHrSection(slug);
    return sectionModule.metadata ?? {};
  }

  notFound();
}

export async function generateMetadata({
  params,
}: ModuleSectionRouteProps): Promise<Metadata> {
  const { moduleId, section } = await params;
  return resolveSectionMetadata(moduleId, section);
}

function sectionSkeleton(moduleId: string) {
  if (moduleId === HR_MODULE_ID) {
    return <HrCompliancePageSkeleton />;
  }
  return <SystemAdminSectionSkeleton />;
}

export default function ModuleSectionRoute({
  params,
  searchParams,
}: ModuleSectionRouteProps) {
  return (
    <Suspense fallback={<ModuleSectionRouteSkeleton />}>
      {params.then(async ({ moduleId, section }) => {
        if (moduleId === SYSTEM_ADMIN_MODULE_ID) {
          assertSystemAdminModuleId(moduleId);
          const slug = resolveSystemAdminSectionSlug(section);
          const { default: SectionPage } = await loadSystemAdminSection(slug);
          return (
            <Suspense fallback={sectionSkeleton(moduleId)}>
              <SectionPage
                searchParams={
                  searchParams as SystemAdminSectionPageProps["searchParams"]
                }
              />
            </Suspense>
          );
        }

        if (moduleId === HR_MODULE_ID) {
          assertHrModuleId(moduleId);
          const slug = resolveHrSectionSlug(section);
          const { default: SectionPage } = await loadHrSection(slug);
          return (
            <Suspense fallback={sectionSkeleton(moduleId)}>
              <SectionPage
                searchParams={searchParams as HrSectionPageProps["searchParams"]}
              />
            </Suspense>
          );
        }

        notFound();
      })}
    </Suspense>
  );
}
