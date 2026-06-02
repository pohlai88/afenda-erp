import { hrTalentRssUiCopy } from "@afenda/feature-hr-suite/metadata";
import {
  renderHrTalentRssPage,
} from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrTalentRssUiCopy.page.title} - HR`,
  description: hrTalentRssUiCopy.page.description,
};

export default async function HrTalentRssPage({
  searchParams,
}: HrSectionPageProps) {
  return renderHrTalentRssPage(searchParams);
}
