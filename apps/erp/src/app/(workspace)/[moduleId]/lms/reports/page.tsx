import { renderHrLmsReportsPage } from "@/section-adapters/hr/lms.server";
export { metadata } from "@/section-adapters/hr/lms.server";

export default async function HrLmsReportsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return renderHrLmsReportsPage(searchParams);
}
