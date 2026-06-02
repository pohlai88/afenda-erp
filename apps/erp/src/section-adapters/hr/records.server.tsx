import { hrRecordsUiCopy } from "@afenda/feature-hr-suite/metadata";
import { renderHrRecordsPage } from "@afenda/feature-hr-suite/server";

export const metadata = {
  title: hrRecordsUiCopy.page.title,
  description: hrRecordsUiCopy.page.description,
};

export default async function HrRecordsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return renderHrRecordsPage(searchParams);
}
