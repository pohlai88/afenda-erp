/**
 * Canonical map: URL section slug → route adapter → feature package area.
 *
 * Routing: `apps/erp/.../[moduleId]/[...section]/page.tsx` reads `section[0]`,
 * resolves a slug here, then loads the matching `*.server.tsx` adapter.
 */
export const hrSectionManifest = {
  lifecycle: {
    label: "Lifecycle",
    featureArea: "employee-management/employee-lifecycle-management",
  },
  documents: {
    label: "Documents",
    featureArea: "employee-management/documents-management",
  },
  offboarding: {
    label: "Offboarding",
    featureArea: "employee-management/offboarding-exit-management",
  },
  records: {
    label: "Records",
    featureArea: "employee-management/employee-records-management",
  },
  employees: {
    label: "Employees",
    featureArea: "employee-management/employee-records-management",
  },
  org: {
    label: "Organization",
    featureArea: "employee-management/organizational-chart-hierarchy",
  },
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
  "recruitment-onboarding": {
    label: "Recruitment & Onboarding",
    featureArea: "talent-management/recruitment-onboarding",
  },
  "succession-planning": {
    label: "Succession Planning",
    featureArea: "talent-management/succession-planning",
  },
  "training-development": {
    label: "Training & Development",
    featureArea: "talent-management/training-development",
  },
  "field-worker-remote-workforce-management": {
    label: "Field Workforce",
    featureArea: "industry-specific/field-worker-remote-workforce-management",
  },
  "food-handler-certification-health-compliance": {
    label: "Food Handler Compliance",
    featureArea:
      "industry-specific/food-handler-certification-health-compliance",
  },
  "government-classification-pay-grades": {
    label: "Government Pay Grades",
    featureArea: "industry-specific/government-classification-pay-grades",
  },
  "manufacturing-safety-training-osha-compliance": {
    label: "Manufacturing Safety",
    featureArea:
      "industry-specific/manufacturing-safety-training-osha-compliance",
  },
  "retail-seasonal-hourly-workforce-scheduling": {
    label: "Retail Scheduling",
    featureArea:
      "industry-specific/retail-seasonal-hourly-workforce-scheduling",
  },
  "union-management": {
    label: "Union Management",
    featureArea: "industry-specific/union-management",
  },

  "candidate-selfservice-portal": {
    label: "Candidate Self-Service Portal",
    featureArea: "talent-management/candidate-selfservice-portal",
  },
  "employee-selfservice-portal": {
    label: "Employee Self-Service Portal",
    featureArea: "employee-management/employee-selfservice-portal",
  },
  "employee-engagement-surveys": {
    label: "Employee Engagement Surveys",
    featureArea: "talent-management/employee-engagement-surveys",
  },} as const;

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
