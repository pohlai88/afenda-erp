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
