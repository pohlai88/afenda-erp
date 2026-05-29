import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import {
  type HrSectionRoute,
  type HrSectionSlug,
} from "@/lib/hr-route.shared";

export type HrSectionPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type HrSectionModule = {
  default: ComponentType<HrSectionPageProps>;
  metadata?: Metadata;
};

const sectionLoaders = {
  employees: () => import("./employees.server"),
  departments: () => import("./departments.server"),
  positions: () => import("./positions.server"),
  "org-chart": () => import("./org-chart.server"),
  documents: () => import("./documents.server"),
  lifecycle: () => import("./lifecycle.server"),
  offboarding: () => import("./offboarding.server"),
  compliance: () => import("./compliance.server"),
  leave: () => import("./leave.server"),
  onboarding: () => import("./onboarding.server"),
  attendance: () => import("./attendance.server"),
  overtime: () => import("./overtime.server"),
  shifts: () => import("./shifts.server"),
} satisfies Record<HrSectionSlug, () => Promise<HrSectionModule>>;

const employeeDetailLoader = () => import("./employee-detail.server");
const employeeCreateLoader = () => import("./employee-create.server");

export const hrSectionSlugs = Object.keys(
  sectionLoaders,
) as HrSectionSlug[];

function isHrSectionSlug(slug: string): slug is HrSectionSlug {
  return slug in sectionLoaders;
}

export function resolveHrSectionRoute(section: string[]): HrSectionRoute {
  const head = section[0];

  if (head === "employees") {
    if (section.length === 1) {
      return { kind: "section", slug: "employees" };
    }
    if (section.length === 2 && section[1] === "new") {
      return { kind: "employee-create" };
    }
    if (section.length === 2 && section[1]) {
      return { kind: "employee-detail", employeeId: section[1] };
    }
  }

  if (head && section.length === 1 && isHrSectionSlug(head)) {
    return { kind: "section", slug: head };
  }

  notFound();
}

export async function loadHrSection(slug: HrSectionSlug) {
  return sectionLoaders[slug]();
}

export async function loadHrEmployeeDetail() {
  return employeeDetailLoader();
}

export async function loadHrEmployeeCreate() {
  return employeeCreateLoader();
}
