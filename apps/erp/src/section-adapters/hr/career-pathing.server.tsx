import { hrTalentCareerPathingUiCopy } from "@afenda/feature-hr-suite/metadata";
import {
  renderHrCareerPathingPage,
} from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${hrTalentCareerPathingUiCopy.page.title} — HR`,
  description: hrTalentCareerPathingUiCopy.page.description,
};

export default async function HrCareerPathingPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return renderHrCareerPathingPage(searchParams);
}
