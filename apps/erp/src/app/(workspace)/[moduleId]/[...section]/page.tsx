/**
 * Module section catch-all (system-admin, hr). Slug â†’ thin app adapter â†’ feature package.
 */
import {
  HrCompliancePageSkeleton,
  SystemAdminSectionSkeleton,
} from "@/app-route-state/route-states";
import { ModuleSectionRouteSkeleton } from "@/app-route-state/module-section-route-skeleton.client";
import {
  loadHrRecordsDetailSection,
  loadHrSection,
  resolveHrEmployeeRecordId,
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
    const employeeId = resolveHrEmployeeRecordId(section);
    if (employeeId) {
      const sectionModule = await loadHrRecordsDetailSection();
      return sectionModule.metadata ?? {};
    }
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

function sectionSkeleton(moduleId: string, section: string[]) {
  if (moduleId === HR_MODULE_ID) {
    if (section[0] === "compliance") {
      return <HrCompliancePageSkeleton />;
    }
    return <ModuleSectionRouteSkeleton />;
  }
  return <SystemAdminSectionSkeleton />;
}

async function SystemAdminSectionContent({
  section,
  searchParams,
}: {
  section: string[];
  searchParams?: ModuleSectionRouteProps["searchParams"];
}) {
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

async function HrSectionContent({
  section,
  searchParams,
}: {
  section: string[];
  searchParams?: ModuleSectionRouteProps["searchParams"];
}) {
  const employeeId = resolveHrEmployeeRecordId(section);
  if (employeeId) {
    const { default: SectionPage } = await loadHrRecordsDetailSection();
    return (
      <SectionPage
        employeeId={employeeId}
        searchParams={searchParams as HrSectionPageProps["searchParams"]}
      />
    );
  }

  const slug = resolveHrSectionSlug(section);
  const { default: SectionPage } = await loadHrSection(slug);

  return (
    <SectionPage searchParams={searchParams as HrSectionPageProps["searchParams"]} />
  );
}

async function ModuleSectionContent({
  moduleId,
  section,
  searchParams,
}: {
  moduleId: string;
  section: string[];
  searchParams?: ModuleSectionRouteProps["searchParams"];
}) {
  if (moduleId === SYSTEM_ADMIN_MODULE_ID) {
    assertSystemAdminModuleId(moduleId);
    return (
      <SystemAdminSectionContent section={section} searchParams={searchParams} />
    );
  }

  if (moduleId === HR_MODULE_ID) {
    assertHrModuleId(moduleId);
    return <HrSectionContent section={section} searchParams={searchParams} />;
  }

  notFound();
}

export default function ModuleSectionRoute({
  params,
  searchParams,
}: ModuleSectionRouteProps) {
  return (
    <Suspense fallback={<ModuleSectionRouteSkeleton />}>
      {params.then(({ moduleId, section }) => (
        <Suspense fallback={sectionSkeleton(moduleId, section)}>
          <ModuleSectionContent
            moduleId={moduleId}
            section={section}
            searchParams={searchParams}
          />
        </Suspense>
      ))}
    </Suspense>
  );
}
