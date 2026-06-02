import { SystemAdminNav } from "@afenda/feature-system-admin/client";
import {
  requireSystemAdminRead,
  resolveSystemAdminNavItems,
} from "@afenda/feature-system-admin/server";
import {
  assertSystemAdminModuleId,
  SYSTEM_ADMIN_MODULE_ID,
} from "@/lib/system-admin-route.shared";

export async function SystemAdminSectionNav({
  moduleId,
}: {
  moduleId: string;
}) {
  assertSystemAdminModuleId(moduleId);
  if (moduleId !== SYSTEM_ADMIN_MODULE_ID) {
    return null;
  }

  const { organization } = await requireSystemAdminRead();
  const navItems = resolveSystemAdminNavItems(organization.capabilities).map(
    (item) => ({
      href: item.href,
      label: item.label,
      exact: "exact" in item ? item.exact : undefined,
    }),
  );

  return <SystemAdminNav items={navItems} />;
}
