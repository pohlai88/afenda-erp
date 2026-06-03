import type { AppCapability } from "@afenda/auth";
import type { NavigationExtension } from "../shared/module-types";

export const navigationExtensions = [
  {
    id: "lynx",
    href: "/lynx",
    label: "Lynx Console",
    description:
      "Diagnose business problems and draft approved recovery actions.",
    requiredCapability: "dashboard.view",
    status: { label: "Lynx native", tone: "positive" },
  },
] as const satisfies readonly NavigationExtension[];

export function getNavigationExtensions(
  capabilities: readonly AppCapability[],
) {
  return navigationExtensions.filter((item) =>
    capabilities.includes(item.requiredCapability),
  );
}

export function getNavigationExtensionById(id: string) {
  return navigationExtensions.find((item) => item.id === id) ?? null;
}
