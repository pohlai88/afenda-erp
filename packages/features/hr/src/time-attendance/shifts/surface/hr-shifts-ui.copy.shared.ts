export const hrShiftsSurfaceKey = "hr.time-attendance.shifts.list" as const;

export const hrShiftsUiCopy = {
  page: {
    title: "Shifts",
    description:
      "Define shift templates and schedule employee assignments for the active tenant.",
  },
  accessDenied: {
    title: "Shifts unavailable",
    description: "You need hr.shifts.read to open the HR shift roster.",
  },
  section: {
    title: "Shift assignments",
    description: "Scheduled and published shifts with template and employee context.",
  },
  listSurface: {
    searchPlaceholder: "Search employee, template, or notes",
    emptyTitle: "No shift assignments",
    emptyDescription: "Create a template and schedule shifts to populate the roster.",
  },
  createTemplate: {
    title: "Create shift template",
    description: "Reusable shift window using 24-hour UTC times (HH:mm).",
    codeLabel: "Code",
    nameLabel: "Name",
    startLabel: "Start time",
    endLabel: "End time",
    submitLabel: "Create template",
  },
  archiveTemplate: {
    title: "Archive template",
    description: "Archive an active template (existing assignments are kept).",
    templateLabel: "Active template",
    submitLabel: "Archive template",
  },
  schedule: {
    title: "Schedule shift",
    description: "Assign an employee to a template on a work date.",
    employeeLabel: "Employee",
    templateLabel: "Template",
    dateLabel: "Shift date",
    notesLabel: "Notes (optional)",
    submitLabel: "Schedule shift",
  },
  publish: {
    title: "Publish shift",
    description: "Publish a scheduled assignment to the roster.",
    assignmentLabel: "Scheduled assignment",
    submitLabel: "Publish",
  },
  cancel: {
    title: "Cancel shift",
    description: "Cancel a scheduled or published assignment.",
    assignmentLabel: "Assignment",
    submitLabel: "Cancel shift",
  },
  templatesPanel: {
    title: "Active templates",
    description: "Templates available for scheduling.",
    empty: "No active templates. Create one above.",
  },
} as const;
