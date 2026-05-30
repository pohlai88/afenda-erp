import { HrModuleNav } from "@afenda/feature-hr-suite/client";
import { resolveHrModuleNavItems } from "@afenda/feature-hr-suite/metadata";
import { resolveExecutionContext } from "@afenda/kernel/execution";
import { assertHrModuleId, HR_MODULE_ID } from "@/lib/hr-route.shared";

export async function HrSectionNav({ moduleId }: { moduleId: string }) {
  assertHrModuleId(moduleId);
  if (moduleId !== HR_MODULE_ID) {
    return null;
  }

  const context = await resolveExecutionContext();
  if (!context) {
    return null;
  }

  const navItems = resolveHrModuleNavItems(context.capabilities).map(
    (item) => ({
      href: item.href,
      label: item.label,
      exact: "exact" in item ? item.exact : undefined,
    }),
  );

  if (navItems.length === 0) {
    return null;
  }

  return <HrModuleNav items={navItems} />;
}
