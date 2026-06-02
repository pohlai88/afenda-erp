import { hrTalentEngUiCopy } from "@afenda/feature-hr-suite/metadata";
import {
  renderHrTalentEngPage,
} from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrTalentEngUiCopy.page.title} - HR`,
  description: hrTalentEngUiCopy.page.description,
};

export default async function HrTalentEngPage({
  searchParams,
}: HrSectionPageProps) {
  return renderHrTalentEngPage(searchParams);
}
