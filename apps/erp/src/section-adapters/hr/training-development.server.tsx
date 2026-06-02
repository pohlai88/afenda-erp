import { hrTalentTrainingUiCopy } from "@afenda/feature-hr-suite/metadata";
import {
  renderHrTrainingPage,
} from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrTalentTrainingUiCopy.page.title} — HR`,
  description: hrTalentTrainingUiCopy.page.description,
};

export default async function HrTrainingDevelopmentPage({
  searchParams,
}: HrSectionPageProps) {
  return renderHrTrainingPage(searchParams);
}
