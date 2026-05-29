export const hrAttendanceSurfaceKey = "hr.time-attendance.attendance.list" as const;

export const hrAttendanceUiCopy = {
  page: {
    title: "Attendance",
    description: "Clock-in and clock-out punches for the active tenant.",
  },
  accessDenied: {
    title: "Attendance access required",
    description: "You need hr.attendance.read to open the HR attendance register.",
  },
  section: {
    title: "Attendance punches",
    description: "Recent punches with server-side windows and idempotent ingest keys.",
  },
  listSurface: {
    searchPlaceholder: "Search employee, number, or notes…",
    emptyTitle: "No attendance punches",
    emptyDescription: "Record a clock-in or clock-out punch to begin tracking time.",
  },
  record: {
    title: "Record punch",
    description: "Manual punch for an employee. Optional idempotency key prevents duplicates.",
    employeeLabel: "Employee",
    typeLabel: "Punch type",
    punchedAtLabel: "Punch time",
    idempotencyLabel: "Idempotency key (optional)",
    notesLabel: "Notes",
    submitLabel: "Record punch",
  },
  void: {
    title: "Void punch",
    description: "Void an active punch (does not delete the audit trail).",
    recordLabel: "Active punch",
    submitLabel: "Void punch",
  },
} as const;
