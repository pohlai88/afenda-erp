import { hrTalentLmsReadPermission } from "../contracts/hr.talent.lms.contract";

export const hrLmsCoursesSearchParam = "lmsCoursesQ";
export const hrLmsCoursesSurfaceKey = "hr.talent.lms.courses.list";
export const hrLmsEmployeeOverviewSurfaceKey = "hr.talent.lms.employee.overview";
export const hrLmsManagerOverviewSurfaceKey = "hr.talent.lms.manager.overview";
export const hrLmsAdminOverviewSurfaceKey = "hr.talent.lms.admin.overview";
export const hrLmsReportsSurfaceKey = "hr.talent.lms.reports.list";
export const hrLmsAuditSurfaceKey = "hr.talent.lms.audit.list";

export const hrLmsReportsSearchParam = "lmsReportGroupBy";

export type HrLmsHubPageModelInput = {
  organizationId: string;
  searchParams?: Record<string, string | string[] | undefined>;
  visibleEmployeeIds?: readonly string[] | null;
  canViewTeam: boolean;
  canViewAdmin: boolean;
};

export {
  hrTalentLmsReadPermission,
};

export { hrLmsUiCopy } from "../surface/hr.talent.lms-ui.copy.shared";
