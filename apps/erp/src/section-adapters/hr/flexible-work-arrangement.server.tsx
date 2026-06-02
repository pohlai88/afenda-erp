import {
  hrFwaUiCopy,
} from "@afenda/feature-hr-suite/metadata";
import { renderHrFwaPage } from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${hrFwaUiCopy.page.title} — HR`,
  description: hrFwaUiCopy.page.description,
};

export default async function HrFlexibleWorkArrangementPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return renderHrFwaPage(searchParams);
}
