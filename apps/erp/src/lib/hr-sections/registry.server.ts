import { hrSectionManifest, type HrSectionSlug } from "./manifest.shared";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
export type { HrSectionSlug } from "./manifest.shared";
export { describeHrSection, hrSectionManifest } from "./manifest.shared";

export type HrSectionPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
  employeeId?: string;
};

type HrSectionModule = {
  default: ComponentType<HrSectionPageProps>;
  metadata?: Metadata;
};

const sectionLoaders = {
  compliance: () => import("./compliance.server"),
  lifecycle: () => import("./lifecycle.server"),
  offboarding: () => import("./offboarding.server"),
  documents: () => import("./documents.server"),
  employees: () => import("./employees.server"),
  records: () => import("./records.server"),
  org: () => import("./org.server"),
} satisfies Record<HrSectionSlug, () => Promise<HrSectionModule>>;

export const hrSectionSlugs = Object.keys(
  hrSectionManifest,
) as HrSectionSlug[];

function isHrSectionSlug(slug: string): slug is HrSectionSlug {
  return slug in sectionLoaders;
}

export function resolveHrEmployeeRecordId(section: string[]): string | null {
  if (section.length !== 2 || section[0] !== "records") {
    return null;
  }

  const employeeId = section[1]?.trim();
  return employeeId || null;
}

export function isHrRecordsDetailRoute(section: string[]): boolean {
  return resolveHrEmployeeRecordId(section) !== null;
}

export function resolveHrSectionSlug(section: string[]): HrSectionSlug {
  if (isHrRecordsDetailRoute(section)) {
    notFound();
  }

  const slug = section[0];

  if (!slug || section.length > 1 || !isHrSectionSlug(slug)) {
    notFound();
  }

  return slug;
}

export async function loadHrSection(slug: HrSectionSlug) {
  return sectionLoaders[slug]();
}

export async function loadHrRecordsDetailSection() {
  return import("./records-detail.server");
}

const manifestSlugs = Object.keys(hrSectionManifest) as HrSectionSlug[];

for (const slug of manifestSlugs) {
  if (!(slug in sectionLoaders)) {
    throw new Error(`hr section manifest missing loader for "${slug}"`);
  }
}
