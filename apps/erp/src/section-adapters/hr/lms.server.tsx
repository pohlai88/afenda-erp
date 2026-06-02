import { hrLmsUiCopy } from "@afenda/feature-hr-suite/metadata";
import {
  renderHrLmsAuditPage as renderFeatureHrLmsAuditPage,
  renderHrLmsHubPage,
  renderHrLmsReportsPage as renderFeatureHrLmsReportsPage,
} from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: "Learning Management — HR",
  description: "Online courses, learning paths, certifications, and compliance training.",
};

export default async function HrLmsPage({ searchParams }: HrSectionPageProps) {
  return renderHrLmsHubPage(searchParams);
}

export async function renderHrLmsReportsPage(searchParams?: HrSectionPageProps["searchParams"]) {
  return renderFeatureHrLmsReportsPage(searchParams);
}

export async function renderHrLmsAuditPage() {
  return renderFeatureHrLmsAuditPage();
}

export { hrLmsUiCopy };
