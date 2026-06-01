import {
  hrBenefitsRoutePaths,
  hrBonusRoutePaths,
  hrExpenseRoutePaths,
  hrComplianceRoutePaths,
  hrDocumentsRoutePaths,
  hrLifecycleRoutePaths,
  hrOffboardingRoutePaths,
  hrOrgRoutePaths,
  hrRecordsRoutePaths,
  hrAatRoutePaths,
  hrLamRoutePaths,
  hrFwaRoutePaths,
  hrGeoRoutePaths,
  hrSftRoutePaths,
  hrTimeClockRoutePaths,
  hrCsfRoutePaths,
  hrPerformanceRoutePaths,
  hrRonRoutePaths,
  hrSuccessionRoutePaths,
  hrTrainingRoutePaths,
  hrIndustryFhcRoutePaths,
  hrIndustryFrmRoutePaths,
  hrIndustryGpgRoutePaths,
  hrIndustryMscRoutePaths,
  hrIndustryRwsRoutePaths,
  hrIndustryUcbRoutePaths,
  hrTalentRssRoutePaths,
} from "@afenda/feature-hr-suite/metadata";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { hrSectionManifest, type HrSectionSlug } from "./manifest.shared";

export type { HrSectionSlug } from "./manifest.shared";
export { describeHrSection, hrSectionManifest } from "./manifest.shared";

export type HrSectionPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type HrSectionModule = {
  default: ComponentType<HrSectionPageProps>;
  metadata?: Metadata;
};

const sectionLoaders = {
  lifecycle: () => import("./lifecycle.server"),
  documents: () => import("./documents.server"),
  offboarding: () => import("./offboarding.server"),
  records: () => import("./records.server"),
  employees: () => import("./employees.server"),
  org: () => import("./org.server"),
  compliance: () => import("./compliance.server"),
  benefits: () => import("./benefits.server"),
  bonus: () => import("./bonus.server"),
  "payroll-processing": () => import("./payroll-processing.server"),
  expenses: () => import("./expenses.server"),
  "leave-attendance": () => import("./leave-attendance.server"),
  "absence-analytics-trends": () => import("./absence-analytics-trends.server"),
  leave: () => import("./leave.server"),
  attendance: () => import("./attendance.server"),
  "flexible-work-arrangement": () =>
    import("./flexible-work-arrangement.server"),
  "geolocation-remote-checkin": () =>
    import("./geolocation-remote-checkin.server"),
  "shift-scheduling": () => import("./shift-scheduling.server"),
  "time-clock": () => import("./time-clock.server"),
  "competency-skills": () => import("./competency-skills.server"),
  "performance-appraisals": () => import("./performance-appraisals.server"),
  "recruitment-onboarding": () => import("./recruitment-onboarding.server"),
  "succession-planning": () => import("./succession-planning.server"),
  "training-development": () => import("./training-development.server"),
  "field-worker-remote-workforce-management": () =>
    import("./field-worker-remote-workforce-management.server"),
  "food-handler-certification-health-compliance": () =>
    import("./food-handler-certification-health-compliance.server"),
  "government-classification-pay-grades": () =>
    import("./government-classification-pay-grades.server"),
  "manufacturing-safety-training-osha-compliance": () =>
    import("./manufacturing-safety-training-osha-compliance.server"),
  "retail-seasonal-hourly-workforce-scheduling": () =>
    import("./retail-seasonal-hourly-workforce-scheduling.server"),
  "union-management": () => import("./union-management.server"),

  "candidate-selfservice-portal": () =>
    import("./candidate-selfservice-portal.server"),
} satisfies Record<HrSectionSlug, () => Promise<HrSectionModule>>;

const hrRoutePaths = [
  ...Object.values(hrDocumentsRoutePaths),
  ...Object.values(hrLifecycleRoutePaths),
  ...Object.values(hrOffboardingRoutePaths),
  ...Object.values(hrOrgRoutePaths),
  ...Object.values(hrRecordsRoutePaths),
  ...Object.values(hrComplianceRoutePaths),
  ...Object.values(hrBenefitsRoutePaths),
  ...Object.values(hrBonusRoutePaths),
  ...Object.values(hrExpenseRoutePaths),
  ...Object.values(hrLamRoutePaths),
  ...Object.values(hrAatRoutePaths),
  ...Object.values(hrFwaRoutePaths),
  ...Object.values(hrGeoRoutePaths),
  ...Object.values(hrSftRoutePaths),
  ...Object.values(hrTimeClockRoutePaths),
  ...Object.values(hrCsfRoutePaths),
  ...Object.values(hrPerformanceRoutePaths),
  ...Object.values(hrRonRoutePaths),
  ...Object.values(hrSuccessionRoutePaths),
  ...Object.values(hrTrainingRoutePaths),
  ...Object.values(hrIndustryFhcRoutePaths),
  ...Object.values(hrIndustryFrmRoutePaths),
  ...Object.values(hrIndustryGpgRoutePaths),
  ...Object.values(hrIndustryMscRoutePaths),
  ...Object.values(hrIndustryRwsRoutePaths),
  ...Object.values(hrIndustryUcbRoutePaths),

  ...Object.values(hrTalentRssRoutePaths),
] as const;

const hrSectionHubPaths = new Set<string>([
  hrDocumentsRoutePaths.hub,
  hrLifecycleRoutePaths.hub,
  hrOrgRoutePaths.hub,
  hrRecordsRoutePaths.hub,
  hrComplianceRoutePaths.hub,
  hrBenefitsRoutePaths.hub,
  hrAatRoutePaths.hub,
  hrFwaRoutePaths.hub,
  hrGeoRoutePaths.hub,
  hrSftRoutePaths.hub,
  hrTimeClockRoutePaths.hub,
  hrCsfRoutePaths.hub,
  hrPerformanceRoutePaths.hub,
  hrRonRoutePaths.hub,
  hrSuccessionRoutePaths.hub,
  hrTrainingRoutePaths.hub,
  hrIndustryFhcRoutePaths.hub,
  hrIndustryFrmRoutePaths.hub,
  hrIndustryGpgRoutePaths.hub,
  hrIndustryMscRoutePaths.hub,
  hrIndustryRwsRoutePaths.hub,
  hrIndustryUcbRoutePaths.hub,

  hrTalentRssRoutePaths.hub,]);

export const hrSectionSlugs = hrRoutePaths
  .filter((path) => !hrSectionHubPaths.has(path))
  .map((path) => path.replace("/hr/", "")) as HrSectionSlug[];

function isHrSectionSlug(slug: string): slug is HrSectionSlug {
  return slug in sectionLoaders;
}

export function resolveHrSectionSlug(section: string[]): HrSectionSlug {
  const slug = section[0];

  if (!slug || section.length > 1 || !isHrSectionSlug(slug)) {
    notFound();
  }

  return slug;
}

export async function loadHrSection(slug: HrSectionSlug) {
  return sectionLoaders[slug]();
}

const manifestSlugs = Object.keys(hrSectionManifest) as HrSectionSlug[];

for (const slug of manifestSlugs) {
  if (!(slug in sectionLoaders)) {
    throw new Error(`hr section manifest missing loader for "${slug}"`);
  }
}
