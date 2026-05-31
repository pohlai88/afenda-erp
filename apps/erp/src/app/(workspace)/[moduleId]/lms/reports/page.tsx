import { renderHrLmsReportsPage } from "@/lib/hr-sections/lms.server";
export { metadata } from "@/lib/hr-sections/lms.server";

export default async function HrLmsReportsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return renderHrLmsReportsPage(searchParams);
}
