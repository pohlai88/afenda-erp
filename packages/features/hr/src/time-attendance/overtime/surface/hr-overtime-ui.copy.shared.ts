export const hrOvertimeSurfaceKey = "hr.time-attendance.overtime.list" as const;

export const hrOvertimeUiCopy = {
  page: {
    title: "Overtime",
    description:
      "Submit and approve overtime hours by employee and work date for the active tenant.",
  },
  accessDenied: {
    title: "Overtime unavailable",
    description: "You need hr.overtime.read to open the HR overtime register.",
  },
  section: {
    title: "Overtime requests",
    description: "Pending and decided overtime requests with employee context.",
  },
  listSurface: {
    searchPlaceholder: "Search employee, number, or reason",
    emptyTitle: "No overtime requests",
    emptyDescription: "Submit overtime hours to start the approval queue.",
  },
  submit: {
    title: "Submit overtime",
    description: "Record overtime hours for an employee on a specific work date.",
    employeeLabel: "Employee",
    typeLabel: "Overtime type",
    workDateLabel: "Work date",
    hoursLabel: "Hours",
    reasonLabel: "Reason (optional)",
    submitLabel: "Submit request",
  },
  approve: {
    title: "Approve overtime",
    description: "Approve a pending overtime request.",
    requestLabel: "Pending request",
    noteLabel: "Decision note (optional)",
    submitLabel: "Approve",
  },
  reject: {
    title: "Reject overtime",
    description: "Reject a pending overtime request.",
    requestLabel: "Pending request",
    noteLabel: "Decision note (optional)",
    submitLabel: "Reject",
  },
  cancel: {
    title: "Cancel overtime",
    description: "Cancel a pending overtime request before approval.",
    requestLabel: "Pending request",
    submitLabel: "Cancel request",
  },
} as const;
