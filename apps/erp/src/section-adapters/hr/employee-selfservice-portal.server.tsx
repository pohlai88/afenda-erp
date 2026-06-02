import { hrWorkforceEssUiCopy } from "@afenda/feature-hr-suite/metadata";
import {
  renderHrWorkforceEssPage,
} from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrWorkforceEssUiCopy.page.title} - HR`,
  description: hrWorkforceEssUiCopy.page.description,
};

export default async function HrWorkforceEssPage({
  searchParams,
}: HrSectionPageProps) {
  return renderHrWorkforceEssPage(searchParams);
}
