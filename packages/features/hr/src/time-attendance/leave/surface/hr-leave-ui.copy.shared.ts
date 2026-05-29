export const hrLeaveSurfaceKey = "hr.time-attendance.leave.list" as const;

export const hrLeaveUiCopy = {
  page: {
    title: "Leave",
    description:
      "Submit and review employee leave requests for the active tenant.",
  },
  accessDenied: {
    title: "Leave access required",
    description: "You need hr.leave.read to open the HR leave queue.",
  },
  section: {
    title: "Leave requests",
    description: "Pending and recent leave requests with server-side windows.",
  },
  listSurface: {
    searchPlaceholder: "Search employee, number, or reason…",
    emptyTitle: "No leave requests",
    emptyDescription: "Submit a leave request to begin tracking time off.",
  },
  submit: {
    title: "Submit leave request",
    description: "Create a pending leave request for an employee.",
    employeeLabel: "Employee",
    typeLabel: "Leave type",
    startLabel: "Start date",
    endLabel: "End date",
    reasonLabel: "Reason",
    submitLabel: "Submit request",
  },
  approve: {
    title: "Approve request",
    description: "Approve a pending leave request.",
    requestLabel: "Pending request",
    noteLabel: "Decision note",
    submitLabel: "Approve",
  },
  reject: {
    title: "Reject request",
    description: "Reject a pending leave request.",
    requestLabel: "Pending request",
    noteLabel: "Decision note",
    submitLabel: "Reject",
  },
  cancel: {
    title: "Cancel request",
    description: "Cancel a pending leave request.",
    requestLabel: "Pending request",
    submitLabel: "Cancel request",
  },
} as const;
