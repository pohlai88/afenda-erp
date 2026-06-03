export const hrPerformanceAppraisalsUiCopy = {
  page: {
    title: "Performance Appraisals",
    description:
      "Manage review cycles, goals, evaluations, calibration, outcomes, reports, and audit history.",
  },
  accessDenied: {
    title: "Performance appraisals restricted",
    description:
      "You do not have permission to view performance appraisal data for this organization.",
  },
  cycles: {
    surfaceHeaderTitle: "Review cycles",
    emptyTitle: "No review cycles",
    emptyDescription: "Create a performance review cycle to begin appraisals.",
  },
  reviews: {
    surfaceHeaderTitle: "Employee reviews",
    emptyTitle: "No assigned reviews",
    emptyDescription: "Eligible employees appear here after cycle assignment.",
  },
  goals: {
    surfaceHeaderTitle: "Performance goals",
    emptyTitle: "No goals",
    emptyDescription: "Employee and manager goals appear here during goal setting.",
  },
  approvals: {
    surfaceHeaderTitle: "Approval workflow",
    emptyTitle: "No approval steps",
    emptyDescription: "Submitted reviews route through configured approval steps.",
  },
  outcomes: {
    surfaceHeaderTitle: "Final outcomes",
    emptyTitle: "No finalized outcomes",
    emptyDescription: "Final ratings and outcomes appear after approval.",
  },
  reports: {
    surfaceHeaderTitle: "Performance reports",
    emptyTitle: "No report rows",
    emptyDescription:
      "Reports can be grouped by employee, manager, department, entity, cycle, rating, status, or period.",
  },
  audit: {
    surfaceHeaderTitle: "Audit trail",
    emptyTitle: "No audit events",
    emptyDescription:
      "Goal, assessment, approval, calibration, acknowledgment, and finalization events appear here.",
  },
} as const;
