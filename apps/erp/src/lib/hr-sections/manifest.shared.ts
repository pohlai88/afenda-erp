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
  employees: {
    label: "Employees",
    featureArea: "employee-management/employee-records-management",
  },
  records: {
    label: "Records",
    featureArea: "employee-management/employee-records-management",
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
