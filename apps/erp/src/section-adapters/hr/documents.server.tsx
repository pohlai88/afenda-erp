import { hrDocumentsUiCopy } from "@afenda/feature-hr-suite/metadata";
import { renderHrDocumentsPage } from "@afenda/feature-hr-suite/server";

export const metadata = {
  title: hrDocumentsUiCopy.page.title,
  description: hrDocumentsUiCopy.page.description,
};

export default async function HrDocumentsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return renderHrDocumentsPage(searchParams);
}
