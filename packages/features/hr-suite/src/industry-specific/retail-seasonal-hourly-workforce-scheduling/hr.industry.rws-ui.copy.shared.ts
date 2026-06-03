import {
  hrIndustryRwsAssignmentsSurfaceKey,
  hrIndustryRwsAttendanceComparisonSurfaceKey,
  hrIndustryRwsAuditTrailSurfaceKey,
  hrIndustryRwsAvailabilitySurfaceKey,
  hrIndustryRwsComplianceFindingsSurfaceKey,
  hrIndustryRwsCoverageSurfaceKey,
  hrIndustryRwsDemandReferencesSurfaceKey,
  hrIndustryRwsIntegrationExposuresSurfaceKey,
  hrIndustryRwsLaborBudgetsSurfaceKey,
  hrIndustryRwsNotificationsSurfaceKey,
  hrIndustryRwsOpenShiftsSurfaceKey,
  hrIndustryRwsPayrollReferencesSurfaceKey,
  hrIndustryRwsReportsSurfaceKey,
  hrIndustryRwsSchedulesSurfaceKey,
  hrIndustryRwsShiftSwapsSurfaceKey,
  type HrIndustryRwsListSurfaceKey,
} from "./hr.industry.rws-surface-metadata.shared";

export const hrIndustryRwsUiCopy = {
  title: "Retail Seasonal & Hourly Workforce Scheduling",
  description:
    "Plan retail hourly, part-time, temporary, and seasonal schedules with coverage, availability, open shifts, swaps, demand references, labor budget controls, compliance warnings, payroll references, reports, and audit history.",
  page: {
    title: "Retail Seasonal & Hourly Workforce Scheduling",
    description:
      "Retail schedule planning, coverage controls, availability validation, open shifts, swaps, labor cost controls, attendance comparison, payroll references, and governed audit readiness.",
  },
  overview: {
    sectionTitle: "Retail Scheduling Control",
    schedules: "Schedules",
    assignments: "Assignments",
    coverageGaps: "Coverage gaps",
    overBudget: "Over budget",
    overtimeRisks: "Overtime risks",
    complianceFindings: "Compliance findings",
  },
  listSections: {
    [hrIndustryRwsSchedulesSurfaceKey]: {
      title: "Retail Schedules",
      description:
        "Draft, published, changed, and cancelled schedules by legal entity, store, branch, department, team, role, period, season, campaign, labor hours, budget posture, and publication status.",
      emptyTitle: "No retail schedules",
      emptyDescription:
        "Create a draft retail schedule before publishing assignments to employees.",
    },
    [hrIndustryRwsAssignmentsSurfaceKey]: {
      title: "Shift Assignments",
      description:
        "Hourly, part-time, temporary, seasonal, student, minor, and restricted worker assignments validated against availability, role, skills, compliance rules, and payroll handoff readiness.",
      emptyTitle: "No shift assignments",
      emptyDescription:
        "Assignments appear after a schedule is drafted or published.",
    },
    [hrIndustryRwsAvailabilitySurfaceKey]: {
      title: "Availability and Blocked Dates",
      description:
        "Employee availability preferences, unavailable windows, blocked dates, preferred shifts, maximum weekly hours, and employee-scoped scheduling constraints.",
      emptyTitle: "No availability preferences",
      emptyDescription:
        "Availability and blocked dates support schedule validation before assignment.",
    },
    [hrIndustryRwsCoverageSurfaceKey]: {
      title: "Coverage Requirements and Gaps",
      description:
        "Required coverage by store, department, role, date, hour window, scheduled headcount, understaffed periods, and overstaffed periods.",
      emptyTitle: "No coverage requirements",
      emptyDescription:
        "Coverage requirements define the minimum and maximum retail staffing posture.",
    },
    [hrIndustryRwsOpenShiftsSurfaceKey]: {
      title: "Open Shift Management",
      description:
        "Open shift posting, eligible employee pickup, approval-required claims, manager assignment, cancellation, and status tracking.",
      emptyTitle: "No open shifts",
      emptyDescription:
        "Open shifts are created when coverage gaps or manager staffing choices need employee pickup.",
    },
    [hrIndustryRwsShiftSwapsSurfaceKey]: {
      title: "Shift Swap Requests",
      description:
        "Employee swap requests with role, skill, availability, scheduled hours, rest rule, policy validation, approval workflow, decision reason, rejection, return, and override tracking.",
      emptyTitle: "No shift swaps",
      emptyDescription:
        "Shift swaps appear when employees request replacements or managers override a validated schedule change.",
    },
    [hrIndustryRwsDemandReferencesSurfaceKey]: {
      title: "Labor Demand References",
      description:
        "Sales volume, footfall, promotion, holiday, and store forecast references used for retail schedule demand planning.",
      emptyTitle: "No demand references",
      emptyDescription:
        "Demand references remain linked to retail operations or workforce planning sources.",
    },
    [hrIndustryRwsLaborBudgetsSurfaceKey]: {
      title: "Labor Budget Controls",
      description:
        "Scheduled labor hours, scheduled labor cost, approved budget, budget variance, over-budget warnings, and review status for authorized users.",
      emptyTitle: "No labor budget snapshots",
      emptyDescription:
        "Labor budget rows are visible only to users authorized to view labor cost and budget controls.",
    },
    [hrIndustryRwsComplianceFindingsSurfaceKey]: {
      title: "Scheduling Compliance Findings",
      description:
        "Maximum daily and weekly hours, minimum rest period, meal and rest break, minor, student, restricted worker, holiday, weekend, late-night, and peak-season rule findings.",
      emptyTitle: "No scheduling compliance findings",
      emptyDescription:
        "Compliance warnings appear before publication when schedule rules are breached or need override.",
    },
    [hrIndustryRwsNotificationsSurfaceKey]: {
      title: "Schedule Notifications",
      description:
        "Published schedule, schedule change, open shift, swap request, approval, rejection, cancellation, and recipient status notifications.",
      emptyTitle: "No notifications",
      emptyDescription:
        "Notifications are generated from publication, change, open shift, swap, approval, rejection, and cancellation events.",
    },
    [hrIndustryRwsAttendanceComparisonSurfaceKey]: {
      title: "Scheduled vs Actual Attendance",
      description:
        "Scheduled hours compared with actual attendance outcome references from attendance and time clock sources.",
      emptyTitle: "No attendance comparisons",
      emptyDescription:
        "Attendance comparisons appear after actual attendance is available.",
    },
    [hrIndustryRwsPayrollReferencesSurfaceKey]: {
      title: "Payroll Schedule References",
      description:
        "Scheduled hours, actual attendance references, shift premium references, holiday work references, and payroll-ready attendance outcome handoff.",
      emptyTitle: "No payroll references",
      emptyDescription:
        "Payroll references are exposed through attendance outcomes, not direct payroll calculation.",
    },
    [hrIndustryRwsReportsSurfaceKey]: {
      title: "Retail Workforce Scheduling Reports",
      description:
        "Reports by store, department, employee, manager, role, shift, labor cost, budget variance, coverage gap, and period with cost-sensitive fields gated.",
      emptyTitle: "No report rows",
      emptyDescription:
        "Reports are generated from tenant-scoped schedules, assignments, coverage, costs, budget variance, and compliance findings.",
    },
    [hrIndustryRwsIntegrationExposuresSurfaceKey]: {
      title: "Integration Exposures",
      description:
        "Attendance outcomes, Payroll Processing, Time Clock, Overtime Management, Document Management, Retail Operations, and Workforce Planning references for authorized integrations.",
      emptyTitle: "No integration exposures",
      emptyDescription:
        "Downstream references are exposed only to users with integration exposure access.",
    },
    [hrIndustryRwsAuditTrailSurfaceKey]: {
      title: "Audit Trail",
      description:
        "Trace schedule creation, assignment, publication, changes, open shifts, pickup, swaps, approvals, rejections, overrides, budget warnings, and payroll reference actions.",
      emptyTitle: "No audit events",
      emptyDescription:
        "Every controlled scheduling, swap, budget, payroll handoff, and reporting action writes an audit event.",
    },
  } satisfies Record<
    HrIndustryRwsListSurfaceKey,
    {
      readonly title: string;
      readonly description: string;
      readonly emptyTitle: string;
      readonly emptyDescription: string;
    }
  >,
  workbench: {
    title: "Shift Assignments",
    description:
      "Validated hourly, seasonal, temporary, and part-time assignments with schedule, compliance, and payroll readiness signals.",
  },
  accessDenied: {
    title: "Retail scheduling access required",
    description:
      "You do not have permission to view this retail seasonal and hourly workforce scheduling workspace.",
  },
} as const;
