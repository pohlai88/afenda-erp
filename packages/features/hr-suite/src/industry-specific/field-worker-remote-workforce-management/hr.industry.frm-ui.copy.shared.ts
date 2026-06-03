import {
  HR_INDUSTRY_FRM_LIST_SURFACE_KEYS,
  hrIndustryFrmAssignmentsSurfaceKey,
  hrIndustryFrmAttendanceExceptionsSurfaceKey,
  hrIndustryFrmAttendanceExportsSurfaceKey,
  hrIndustryFrmAuditTrailSurfaceKey,
  hrIndustryFrmMobileAttendanceSurfaceKey,
  hrIndustryFrmNotificationsSurfaceKey,
  hrIndustryFrmOfflineSyncSurfaceKey,
  hrIndustryFrmOvertimeExportsSurfaceKey,
  hrIndustryFrmPayrollExportsSurfaceKey,
  hrIndustryFrmPerDiemRatesSurfaceKey,
  hrIndustryFrmPerDiemReferencesSurfaceKey,
  hrIndustryFrmReportsSurfaceKey,
  hrIndustryFrmSafetyConfirmationsSurfaceKey,
  hrIndustryFrmSchedulesSurfaceKey,
  hrIndustryFrmTeamAvailabilitySurfaceKey,
  hrIndustryFrmTravelComplianceSurfaceKey,
  hrIndustryFrmTravelStatusesSurfaceKey,
  hrIndustryFrmWorksitesSurfaceKey,
  type HrIndustryFrmListSurfaceKey,
} from "./hr.industry.frm-surface-metadata.shared";

type ListCopy = {
  readonly title: string;
  readonly description: string;
  readonly emptyTitle: string;
  readonly emptyDescription: string;
};

export const hrIndustryFrmUiCopy = {
  title: "Field Worker & Remote Workforce",
  description:
    "Governed field assignment, mobile attendance, GPS validation reference, travel, per diem, compliance, safety, payroll reference, and audit workspace.",
  page: {
    title: "Field Worker & Remote Workforce",
    description:
      "Manage distributed field and remote employees without continuous tracking; location data is limited to explicit check-in, check-out, travel, or safety confirmation events.",
  },
  overview: {
    sectionTitle: "Field Workforce Overview",
    activeAssignments: "Active assignments",
    mobileEvents: "Mobile events",
    openExceptions: "Open exceptions",
    travelComplianceRisk: "Travel compliance risks",
    approvedPerDiem: "Approved per diem",
    offlineReconciled: "Offline reconciled",
  },
  accessDenied: {
    title: "Field Workforce access required",
    description: "You do not have permission to view this HR workspace.",
  },
  listSections: {
    [hrIndustryFrmWorksitesSurfaceKey]: {
      title: "Worksites & Remote Locations",
      description:
        "Project sites, client sites, branches, field zones, service areas, and approved remote locations.",
      emptyTitle: "No worksites",
      emptyDescription: "No worksite or remote location records match the filters.",
    },
    [hrIndustryFrmAssignmentsSurfaceKey]: {
      title: "Field Assignments",
      description:
        "Temporary, recurring, project-based, client-based, and travel-based field assignments.",
      emptyTitle: "No assignments",
      emptyDescription: "No field worker assignments match the filters.",
    },
    [hrIndustryFrmMobileAttendanceSurfaceKey]: {
      title: "Mobile Attendance",
      description:
        "Mobile clock-in, clock-out, break start, break end, GPS validation references, and offline capture markers.",
      emptyTitle: "No mobile attendance",
      emptyDescription: "No mobile attendance events match the filters.",
    },
    [hrIndustryFrmAttendanceExceptionsSurfaceKey]: {
      title: "Attendance Exceptions",
      description:
        "Outside-site check-ins, missing check-ins, missing checkouts, late check-ins, and incomplete attendance.",
      emptyTitle: "No exceptions",
      emptyDescription: "No field attendance exceptions match the filters.",
    },
    [hrIndustryFrmOfflineSyncSurfaceKey]: {
      title: "Offline Sync Reconciliation",
      description:
        "Offline mobile records captured, synced, reconciled, or rejected after mobile sync.",
      emptyTitle: "No offline sync records",
      emptyDescription: "No offline sync records match the filters.",
    },
    [hrIndustryFrmSchedulesSurfaceKey]: {
      title: "Field Schedule References",
      description:
        "Schedule references by employee, site, date, project, route, and client.",
      emptyTitle: "No schedules",
      emptyDescription: "No field schedule references match the filters.",
    },
    [hrIndustryFrmTravelStatusesSurfaceKey]: {
      title: "Business Travel Status",
      description:
        "Local field visit, outstation, overnight, cross-border, and temporary relocation travel status.",
      emptyTitle: "No travel status",
      emptyDescription: "No business travel records match the filters.",
    },
    [hrIndustryFrmPerDiemRatesSurfaceKey]: {
      title: "Per Diem Rates",
      description:
        "Rate references by country, city, region, project, grade, and travel category.",
      emptyTitle: "No per diem rates",
      emptyDescription: "No per diem rate references match the filters.",
    },
    [hrIndustryFrmPerDiemReferencesSurfaceKey]: {
      title: "Per Diem & Allowance References",
      description:
        "Partial-day, full-day, overnight, meal, lodging, and travel allowance references.",
      emptyTitle: "No allowance refs",
      emptyDescription: "No per diem or allowance references match the filters.",
    },
    [hrIndustryFrmTravelComplianceSurfaceKey]: {
      title: "Travel Compliance",
      description:
        "Travel approval, destination restriction, required documents, insurance, and duty-of-care status.",
      emptyTitle: "No travel compliance",
      emptyDescription: "No travel compliance rows match the filters.",
    },
    [hrIndustryFrmSafetyConfirmationsSurfaceKey]: {
      title: "Field Safety Check-Ins",
      description:
        "Arrival confirmations and site departure confirmations with safety references.",
      emptyTitle: "No safety confirmations",
      emptyDescription: "No safety confirmations match the filters.",
    },
    [hrIndustryFrmTeamAvailabilitySurfaceKey]: {
      title: "Team Availability",
      description:
        "Manager visibility across availability, site assignment, travel status, and attendance exceptions.",
      emptyTitle: "No team availability",
      emptyDescription: "No team availability rows match the filters.",
    },
    [hrIndustryFrmNotificationsSurfaceKey]: {
      title: "Field Workforce Notifications",
      description:
        "Notifications for assignment changes, attendance exceptions, travel non-compliance, and overdue check-ins.",
      emptyTitle: "No notifications",
      emptyDescription: "No field workforce notifications match the filters.",
    },
    [hrIndustryFrmAttendanceExportsSurfaceKey]: {
      title: "Leave & Attendance Export",
      description:
        "Validated field attendance outcomes exposed to Leave & Attendance Management.",
      emptyTitle: "No attendance exports",
      emptyDescription: "No Leave & Attendance references are available.",
    },
    [hrIndustryFrmOvertimeExportsSurfaceKey]: {
      title: "Overtime Work-Hour Export",
      description:
        "Actual field work-hour references exposed to Overtime Management where required.",
      emptyTitle: "No overtime exports",
      emptyDescription: "No overtime work-hour references are available.",
    },
    [hrIndustryFrmPayrollExportsSurfaceKey]: {
      title: "Payroll & Expense Export",
      description:
        "Payroll-relevant travel allowance, per diem, and field attendance references.",
      emptyTitle: "No payroll exports",
      emptyDescription: "No payroll or expense references are available.",
    },
    [hrIndustryFrmReportsSurfaceKey]: {
      title: "Field Workforce Reports",
      description:
        "Reports by employee, manager, department, legal entity, site, project, client, travel type, exception, and period.",
      emptyTitle: "No report rows",
      emptyDescription: "No report rows match the filters.",
    },
    [hrIndustryFrmAuditTrailSurfaceKey]: {
      title: "Audit Trail",
      description:
        "Assignment, mobile check-in, GPS validation, offline sync, travel, per diem, exception, approval, correction, and payroll reference actions.",
      emptyTitle: "No audit events",
      emptyDescription: "No audit events match the filters.",
    },
  } satisfies Record<HrIndustryFrmListSurfaceKey, ListCopy>,
} as const;

for (const key of HR_INDUSTRY_FRM_LIST_SURFACE_KEYS) {
  if (!(key in hrIndustryFrmUiCopy.listSections)) {
    throw new Error(`Missing FRM list copy for ${key}`);
  }
}
