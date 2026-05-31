import {
  hrBenefitsRoutePaths,
  hrBonusRoutePaths,
  hrExpenseRoutePaths,
  hrComplianceRoutePaths,
  hrAatRoutePaths,
  hrLamRoutePaths,
  hrFwaRoutePaths,
  hrGeoRoutePaths,
  hrSftRoutePaths,
  hrTimeClockRoutePaths,
  hrCsfRoutePaths,
  hrPerformanceRoutePaths,
  hrRonRoutePaths,
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
  compliance: () => import("./compliance.server"),
  benefits: () => import("./benefits.server"),
  bonus: () => import("./bonus.server"),
  "payroll-processing": () => import("./payroll-processing.server"),
  expenses: () => import("./expenses.server"),
  "leave-attendance": () => import("./leave-attendance.server"),
  "absence-analytics-trends": () => import("./absence-analytics-trends.server"),
  leave: () => import("./leave.server"),
  attendance: () => import("./attendance.server"),
  "flexible-work-arrangement": () => import("./flexible-work-arrangement.server"),
  "geolocation-remote-checkin": () => import("./geolocation-remote-checkin.server"),
  "shift-scheduling": () => import("./shift-scheduling.server"),
  "time-clock": () => import("./time-clock.server"),
  "competency-skills": () => import("./competency-skills.server"),
  "performance-appraisals": () => import("./performance-appraisals.server"),
  "recruitment-onboarding": () => import("./recruitment-onboarding.server"),
} satisfies Record<HrSectionSlug, () => Promise<HrSectionModule>>;

const hrRoutePaths = [
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
] as const;

const hrSectionHubPaths = new Set<string>([
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
]);

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
