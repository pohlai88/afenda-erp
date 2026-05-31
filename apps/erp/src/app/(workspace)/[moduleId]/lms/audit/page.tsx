import { renderHrLmsAuditPage } from "@/lib/hr-sections/lms.server";
export { metadata } from "@/lib/hr-sections/lms.server";

export default async function HrLmsAuditPage() {
  return renderHrLmsAuditPage();
}
