import type { AppCapability } from "@afenda/auth";

import { hrComplianceRoutePaths } from "../employee-management/compliance-regulatory-tracking/contracts/hr.workforce.compliance-route.contract";
import { hrDocumentsRoutePaths } from "../employee-management/documents-management/contracts/hr.workforce.documents-route.contract";
import { hrLifecycleRoutePaths } from "../employee-management/employee-lifecycle-management/contracts/hr.workforce.lifecycle-route.contract";
import { hrOffboardingRoutePaths } from "../employee-management/offboarding-exit-management/contracts/hr.workforce.offboarding-route.contract";
import { hrOrgRoutePaths } from "../employee-management/organizational-chart-hierarchy/contracts/hr.workforce.org-route.contract";
import { hrBenefitsRoutePaths } from "../payroll-compensation/benefits-administration/contracts/hr.payroll.benefits-route.contract";
import { hrRecordsRoutePaths } from "../employee-management/employee-records-management/contracts/hr.workforce.records-route.contract";

type HrNavCapability = Extract<AppCapability, `hr.${string}`>;

export type HrModuleNavItem = {
  href: string;
  label: string;
  exact?: boolean;
  requiredCapabilities: readonly HrNavCapability[];
};

export const hrModuleNavItems = [
  {
    href: hrComplianceRoutePaths.hub,
    label: "HR hub",
    exact: true,
    requiredCapabilities: ["hr.view"],
  },
  {
    href: hrComplianceRoutePaths.compliance,
    label: "Compliance",
    requiredCapabilities: ["hr.compliance.read", "hr.compliance.write"],
  },
  {
    href: hrLifecycleRoutePaths.lifecycle,
    label: "Lifecycle",
    requiredCapabilities: ["hr.lifecycle.read", "hr.lifecycle.write"],
  },
  {
    href: hrDocumentsRoutePaths.documents,
    label: "Documents",
    requiredCapabilities: ["hr.documents.read", "hr.documents.write"],
  },
  {
    href: hrOffboardingRoutePaths.offboarding,
    label: "Offboarding",
    requiredCapabilities: ["hr.offboarding.read", "hr.offboarding.write"],
  },
  {
    href: hrRecordsRoutePaths.records,
    label: "Records",
    requiredCapabilities: ["hr.employees.read", "hr.employees.write"],
  },
  {
    href: hrOrgRoutePaths.org,
    label: "Organization",
    requiredCapabilities: ["hr.org.read", "hr.org.write"],
  },
  {
    href: hrBenefitsRoutePaths.benefits,
    label: "Benefits",
    requiredCapabilities: ["hr.benefits.read", "hr.benefits.write"],
  },
] as const satisfies readonly HrModuleNavItem[];

export function resolveHrModuleNavItems(
  capabilities: readonly AppCapability[],
): HrModuleNavItem[] {
  const granted = new Set(capabilities);

  return hrModuleNavItems.filter((item) =>
    item.requiredCapabilities.some((capability) => granted.has(capability)),
  );
}
