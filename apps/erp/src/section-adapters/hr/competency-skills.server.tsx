import { hrCsfUiCopy } from "@afenda/feature-hr-suite/metadata";
import {
  renderHrCsfAuditPage as renderFeatureHrCsfAuditPage,
  renderHrCsfHubPage,
  renderHrCsfMatchingPage as renderFeatureHrCsfMatchingPage,
  renderHrCsfReportsPage as renderFeatureHrCsfReportsPage,
} from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrCsfUiCopy.page.title} — HR`,
  description: hrCsfUiCopy.page.description,
};

export default async function HrCompetencySkillsPage({
  searchParams,
}: HrSectionPageProps) {
  return renderHrCsfHubPage(searchParams);
}

export async function renderHrCsfReportsPage(searchParams?: HrSectionPageProps["searchParams"]) {
  return renderFeatureHrCsfReportsPage(searchParams);
}

export async function renderHrCsfAuditPage(searchParams?: HrSectionPageProps["searchParams"]) {
  return renderFeatureHrCsfAuditPage(searchParams);
}

export async function renderHrCsfMatchingPage(searchParams?: HrSectionPageProps["searchParams"]) {
  return renderFeatureHrCsfMatchingPage(searchParams);
}
