/**
 * Canonical map: URL section slug → route adapter → feature package area.
 *
 * Routing: `apps/erp/.../[moduleId]/[...section]/page.tsx` reads `section[0]`,
 * resolves a slug here, then loads the matching `*.server.tsx` adapter.
 */
export const hrSectionManifest = {
  compliance: {
    label: "Compliance",
    featureArea: "employee-management/compliance-regulatory-tracking",
  },
  benefits: {
    label: "Benefits",
    featureArea: "payroll-compensation/benefits-administration",
  },
  bonus: {
    label: "Bonus & Incentive",
    featureArea: "payroll-compensation/bonus-incentive-management",
  },
  "payroll-processing": {
    label: "Payroll Processing",
    featureArea: "payroll-compensation/payroll-processing",
  },
  expenses: {
    label: "Expense Reimbursement",
    featureArea: "payroll-compensation/expenses-reimbursement",
  },
  "leave-attendance": {
    label: "Leave & Attendance",
    featureArea: "time-attendance/leave-attendance-management",
  },
  "absence-analytics-trends": {
    label: "Absence Analytics & Trends",
    featureArea: "time-attendance/absence-analytics-trends",
  },
  leave: {
    label: "Leave",
    featureArea: "time-attendance/leave-attendance-management",
  },
  attendance: {
    label: "Attendance",
    featureArea: "time-attendance/leave-attendance-management",
  },
  "flexible-work-arrangement": {
    label: "Flexible Work",
    featureArea: "time-attendance/flexible-work-arrangement-tracking",
  },
  "geolocation-remote-checkin": {
    label: "Geolocation",
    featureArea: "time-attendance/geolocation-remote-checkin",
  },
  "shift-scheduling": {
    label: "Shift Scheduling",
    featureArea: "time-attendance/shift-scheduling",
  },
  "time-clock": {
    label: "Time Clock",
    featureArea: "time-attendance/time-clock-integration",
  },
  "competency-skills": {
    label: "Competency & Skills",
    featureArea: "talent-management/competency-skills-framework",
  },
  "performance-appraisals": {
    label: "Performance Appraisals",
    featureArea: "talent-management/performance-appraisals",
  },
} as const;

export type HrSectionSlug = keyof typeof hrSectionManifest;

export function describeHrSection(slug: HrSectionSlug) {
  const entry = hrSectionManifest[slug];
  return {
    slug,
    url: `/hr/${slug}`,
    label: entry.label,
    adapterFile: `apps/erp/src/lib/hr-sections/${slug}.server.tsx`,
    featureRoot: `packages/features/hr-suite/src/${entry.featureArea}`,
    featurePackage: "@afenda/feature-hr-suite",
  };
}
