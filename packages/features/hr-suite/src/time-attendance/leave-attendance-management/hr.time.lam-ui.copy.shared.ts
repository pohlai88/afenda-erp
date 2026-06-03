export const hrLamUiCopy = {
  page: {
    title: "Leave & Attendance",
    description:
      "Track daily attendance, leave balances, and leave applications with policy enforcement.",
  },
  accessDenied: {
    title: "Access restricted",
    description: "You do not have permission to view leave and attendance.",
  },
  attendanceDays: {
    sectionTitle: "Attendance days",
    surfaceHeaderTitle: "Daily attendance",
    searchLabel: "Search attendance",
    searchPlaceholder: "Employee number or name",
    emptyTitle: "No attendance days",
    emptyDescription: "Attendance records by employee and date will appear here.",
  },
  leaveRequests: {
    sectionTitle: "Leave applications",
    surfaceHeaderTitle: "Leave requests",
    searchLabel: "Search leave",
    searchPlaceholder: "Employee or reason",
    emptyTitle: "No leave applications",
    emptyDescription: "Submitted leave applications will appear here.",
  },
  leaveBalances: {
    sectionTitle: "Leave balances",
    surfaceHeaderTitle: "Leave balances",
    searchLabel: "Search balances",
    searchPlaceholder: "Employee number or name",
    emptyTitle: "No leave balances",
    emptyDescription: "Earned, used, pending, and remaining balances appear here.",
  },
  exceptions: {
    sectionTitle: "Attendance exceptions",
    surfaceHeaderTitle: "Attendance exceptions",
    emptyTitle: "No attendance exceptions",
    emptyDescription:
      "Exceptions appear after attendance days are regenerated from punches.",
    colEmployee: "Employee",
    colDate: "Work date",
    colStatus: "Status",
    colExceptions: "Exceptions",
  },
  corrections: {
    sectionTitle: "Attendance corrections",
    surfaceHeaderTitle: "Attendance corrections",
    emptyTitle: "No pending corrections",
    emptyDescription:
      "Correction requests appear when employees submit attendance fixes.",
    colEmployee: "Employee",
    colDate: "Work date",
    colCode: "Exception",
    colStatus: "Status",
    colReason: "Reason",
  },
  payrollRefs: {
    sectionTitle: "Payroll references",
    surfaceHeaderTitle: "Payroll references",
    emptyTitle: "No payroll references",
    emptyDescription:
      "Approved unpaid leave and flagged attendance outcomes export references here.",
    colEmployee: "Employee",
    colSource: "Source",
    colKind: "Kind",
    colReference: "Reference",
    colReady: "Payroll ready",
  },
  reports: {
    sectionTitle: "Attendance summary",
    surfaceHeaderTitle: "Attendance summary",
    emptyTitle: "No summary rows",
    emptyDescription:
      "Summaries aggregate attendance and approved leave for the selected period.",
    colGroup: "Group",
    colWorked: "Days worked",
    colLeave: "Leave days",
    colAbsent: "Absent",
    colLate: "Late",
  },
  audit: {
    sectionTitle: "LAM audit trail",
    surfaceHeaderTitle: "LAM audit trail",
    searchLabel: "Search audit",
    searchPlaceholder: "Action or target",
    emptyTitle: "No audit events",
    emptyDescription:
      "Leave, attendance, correction, and payroll integration actions are recorded here.",
    colAction: "Action",
    colTarget: "Target",
    colWhen: "When",
  },
} as const;
