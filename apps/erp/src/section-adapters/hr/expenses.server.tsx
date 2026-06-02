import { hrExpenseUiCopy } from "@afenda/feature-hr-suite/metadata";
import { renderHrExpensePage } from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: `${hrExpenseUiCopy.page.title} - HR`,
  description: hrExpenseUiCopy.page.description,
};

export default async function HrExpensesPage({
  searchParams,
}: HrSectionPageProps) {
  return renderHrExpensePage(searchParams);
}
