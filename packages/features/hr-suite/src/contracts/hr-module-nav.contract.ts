import type { AppCapability } from "@afenda/auth";

import { hrComplianceRoutePaths } from "../employee-management/compliance-regulatory-tracking/contracts/hr.workforce.compliance-route.contract";

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
] as const satisfies readonly HrModuleNavItem[];

export function resolveHrModuleNavItems(
  capabilities: readonly AppCapability[],
): HrModuleNavItem[] {
  const granted = new Set(capabilities);

  return hrModuleNavItems.filter((item) =>
    item.requiredCapabilities.some((capability) => granted.has(capability)),
  );
}
